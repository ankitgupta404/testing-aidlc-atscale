import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Filter, Plus, GripVertical } from '../components/icons';
import { useIssues, useMoveIssue } from '../api/issues';
import { useProjectContext } from '../context/ProjectContext';
import {
  STATUS_LABELS, PRIORITY_LABELS, SEED_USERS, DEFAULT_PROJECT_ID,
} from '../utils/constants';
import { getUserName, getUserInitials, getAvatarColor, cn } from '../utils/helpers';
import type { Issue, IssueStatus, IssuePriority } from '@canopy/shared';
import { useQueryClient } from '@tanstack/react-query';

const BOARD_COLUMNS: { status: IssueStatus; label: string; color: string }[] = [
  { status: 'backlog', label: 'Backlog', color: '#a8a29e' },
  { status: 'todo', label: 'To Do', color: '#0284c7' },
  { status: 'in_progress', label: 'In Progress', color: '#d97706' },
  { status: 'in_review', label: 'In Review', color: '#7c3aed' },
  { status: 'done', label: 'Done', color: '#16a34a' },
];

const PRIORITY_BORDER: Record<string, string> = {
  critical: 'border-l-[#dc2626]',
  high: 'border-l-[#d97706]',
  medium: 'border-l-[#a8a29e]',
  low: 'border-l-[#0284c7]',
  trivial: 'border-l-[#e7e5e4]',
};

interface SortableCardProps {
  issue: Issue;
  onClick: () => void;
}

function SortableCard({ issue, onClick }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white rounded-lg border border-bark-200 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 group',
        PRIORITY_BORDER[issue.priority],
        isDragging && 'ring-2 ring-canopy-500 ring-opacity-50'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-1">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3.5 h-3.5 text-bark-400" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <span className="font-mono text-[10px] text-bark-400">{issue.key}</span>
            {issue.storyPoints !== undefined && issue.storyPoints > 0 && (
              <span className="text-[10px] bg-canopy-50 text-canopy-700 px-1.5 py-0.5 rounded font-semibold shrink-0">
                {issue.storyPoints}
              </span>
            )}
          </div>
          <p className="text-sm text-bark-800 font-medium leading-snug mb-2.5">{issue.title}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                issue.priority === 'critical' ? 'bg-[#dc2626]' :
                issue.priority === 'high' ? 'bg-[#d97706]' :
                issue.priority === 'medium' ? 'bg-[#a8a29e]' :
                issue.priority === 'low' ? 'bg-[#0284c7]' : 'bg-bark-200'
              }`} />
              <span className="text-[10px] text-bark-500">{PRIORITY_LABELS[issue.priority]}</span>
            </div>
            {issue.assigneeId && (
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-medium',
                  getAvatarColor(getUserName(issue.assigneeId))
                )}
                title={getUserName(issue.assigneeId)}
              >
                {getUserInitials(getUserName(issue.assigneeId))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DragOverlayCard({ issue }: { issue: Issue }) {
  return (
    <div className={cn(
      'bg-white rounded-lg border border-bark-200 p-3 shadow-xl border-l-4 rotate-2 scale-105',
      PRIORITY_BORDER[issue.priority]
    )}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="font-mono text-[10px] text-bark-400">{issue.key}</span>
        {issue.storyPoints !== undefined && issue.storyPoints > 0 && (
          <span className="text-[10px] bg-canopy-50 text-canopy-700 px-1.5 py-0.5 rounded font-semibold">
            {issue.storyPoints}
          </span>
        )}
      </div>
      <p className="text-sm text-bark-800 font-medium leading-snug">{issue.title}</p>
    </div>
  );
}

export function BoardPage() {
  const { projectId: paramProjectId } = useParams();
  const navigate = useNavigate();
  const { currentProject } = useProjectContext();
  const projectId = paramProjectId || currentProject?.id || DEFAULT_PROJECT_ID;
  const queryClient = useQueryClient();

  const { data: issuesData, isLoading } = useIssues(projectId);
  const moveIssueMutation = useMoveIssue();
  const issues = issuesData || [];

  // Local state for optimistic updates
  const [localIssues, setLocalIssues] = useState<Issue[] | null>(null);
  const displayIssues = localIssues || issues;

  // Filters
  const [assigneeFilter, setAssigneeFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const filteredIssues = useMemo(() => {
    return displayIssues.filter((issue: Issue) => {
      if (assigneeFilter && issue.assigneeId !== assigneeFilter) return false;
      if (priorityFilter && issue.priority !== priorityFilter) return false;
      return true;
    });
  }, [displayIssues, assigneeFilter, priorityFilter]);

  const columnIssues = useMemo(() => {
    const map: Record<string, Issue[]> = {};
    for (const col of BOARD_COLUMNS) {
      map[col.status] = filteredIssues
        .filter((i: Issue) => i.status === col.status)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return map;
  }, [filteredIssues]);

  const activeIssue = useMemo(() => {
    if (!activeId) return null;
    return displayIssues.find((i: Issue) => i.id === activeId) || null;
  }, [activeId, displayIssues]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    if (!localIssues) setLocalIssues([...issues]);
  }, [issues, localIssues]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !localIssues) return;

    const activeIssueData = localIssues.find(i => i.id === active.id);
    if (!activeIssueData) return;

    // Determine target column
    let targetStatus: IssueStatus | null = null;

    // Check if dropping over a column (the droppable container)
    const overCol = BOARD_COLUMNS.find(c => c.status === over.id);
    if (overCol) {
      targetStatus = overCol.status;
    } else {
      // Dropping over another card - find what column it's in
      const overIssue = localIssues.find(i => i.id === over.id);
      if (overIssue) {
        targetStatus = overIssue.status as IssueStatus;
      }
    }

    if (targetStatus && activeIssueData.status !== targetStatus) {
      setLocalIssues(prev => {
        if (!prev) return prev;
        return prev.map(i =>
          i.id === active.id ? { ...i, status: targetStatus } : i
        );
      });
    }
  }, [localIssues]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !localIssues) {
      setLocalIssues(null);
      return;
    }

    const activeIssueData = localIssues.find(i => i.id === active.id);
    if (!activeIssueData) {
      setLocalIssues(null);
      return;
    }

    // Determine final status and order
    let targetStatus = activeIssueData.status as IssueStatus;
    let newOrder = activeIssueData.order || 0;

    // Check if dropped on a column
    const overCol = BOARD_COLUMNS.find(c => c.status === over.id);
    if (overCol) {
      targetStatus = overCol.status;
    } else {
      const overIssue = localIssues.find(i => i.id === over.id);
      if (overIssue) {
        targetStatus = overIssue.status as IssueStatus;
        newOrder = overIssue.order || 0;
      }
    }

    // Fire the mutation to persist the move
    moveIssueMutation.mutate(
      { id: active.id as string, data: { status: targetStatus, order: newOrder } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['issues'] });
        },
        onError: () => {
          // Rollback on error
          setLocalIssues(null);
        },
      }
    );

    // Keep the optimistic state until the query refetches
    setTimeout(() => setLocalIssues(null), 1000);
  }, [localIssues, moveIssueMutation, queryClient]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setLocalIssues(null);
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-full mx-auto animate-fade-in">
        <div className="mb-5">
          <div className="h-7 w-24 bg-bark-200 rounded animate-pulse" />
          <div className="h-4 w-44 bg-bark-100 rounded animate-pulse mt-2" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="flex-shrink-0 w-[240px] xl:w-[260px] bg-bark-50/80 rounded-xl border border-bark-200 animate-pulse" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="px-4 py-3 border-b border-bark-200">
                <div className="h-4 w-20 bg-bark-200 rounded" />
              </div>
              <div className="p-2.5 space-y-2">
                {Array.from({ length: 2 + (i % 3) }, (_, j) => (
                  <div key={j} className="bg-white rounded-lg border border-bark-200 p-3 h-20">
                    <div className="h-3 w-12 bg-bark-100 rounded mb-2" />
                    <div className="h-4 w-full bg-bark-100 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-display font-bold text-bark-900">Board</h1>
          <p className="text-sm text-bark-500 mt-0.5">
            {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''} • Drag cards to change status
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            showFilters ? 'bg-canopy-100 text-canopy-700' : 'bg-bark-100 text-bark-600 hover:bg-bark-200'
          )}
        >
          <Filter className="w-4 h-4" />
          Filters
          {(assigneeFilter || priorityFilter) && (
            <span className="w-2 h-2 bg-canopy-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 mb-5 p-4 bg-white rounded-xl border border-bark-200 shadow-sm animate-slide-down">
          <select
            value={assigneeFilter}
            onChange={e => setAssigneeFilter(e.target.value)}
            className="px-3 py-2 border border-bark-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-canopy-500"
          >
            <option value="">All Assignees</option>
            {SEED_USERS.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as IssuePriority | '')}
            className="px-3 py-2 border border-bark-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-canopy-500"
          >
            <option value="">All Priorities</option>
            {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          {(assigneeFilter || priorityFilter) && (
            <button
              onClick={() => { setAssigneeFilter(''); setPriorityFilter(''); }}
              className="text-xs text-canopy-600 hover:text-canopy-700 font-medium px-2 py-1 rounded bg-canopy-50"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Board columns with DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '500px' }}>
          {BOARD_COLUMNS.map((col, idx) => (
            <BoardColumn
              key={col.status}
              column={col}
              issues={columnIssues[col.status] || []}
              onCardClick={(issue) => navigate(`/issues/${issue.key}`)}
              animationDelay={idx * 60}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
          {activeIssue ? <DragOverlayCard issue={activeIssue} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Empty state */}
      {issues.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <h3 className="font-display font-semibold text-bark-700 mb-1">No issues on the board</h3>
          <p className="text-sm text-bark-500">Create some issues in the backlog to see them here.</p>
        </div>
      )}
    </div>
  );
}

interface BoardColumnProps {
  column: { status: IssueStatus; label: string; color: string };
  issues: Issue[];
  onCardClick: (issue: Issue) => void;
  animationDelay?: number;
}

function BoardColumn({ column, issues, onCardClick, animationDelay = 0 }: BoardColumnProps) {
  const { setNodeRef } = useSortable({
    id: column.status,
    data: { type: 'column', status: column.status },
  });

  return (
    <div
      ref={setNodeRef}
      className="flex-shrink-0 w-[240px] xl:w-[260px] bg-bark-50/80 rounded-xl border border-bark-200 flex flex-col animate-column-in"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Column header */}
      <div className="px-4 py-3 border-b border-bark-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: column.color }} />
            <h3 className="font-display font-semibold text-bark-800 text-sm">{column.label}</h3>
          </div>
          <span className="text-xs text-bark-500 bg-bark-200/80 px-2 py-0.5 rounded-full font-medium">
            {issues.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 p-2.5 space-y-2 overflow-y-auto max-h-[calc(100vh-240px)]">
        <SortableContext items={issues.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {issues.length === 0 ? (
            <div className="text-center py-8 text-xs text-bark-400 border-2 border-dashed border-bark-200 rounded-lg">
              Drop issues here
            </div>
          ) : (
            issues.map(issue => (
              <SortableCard
                key={issue.id}
                issue={issue}
                onClick={() => onCardClick(issue)}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
