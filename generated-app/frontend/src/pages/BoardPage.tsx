import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useIssues, useMoveIssue } from '../api/issues';
import { useSprints } from '../api/sprints';
import { BOARD_COLUMNS, STATUS_CONFIG, PRIORITY_CONFIG, TYPE_CONFIG } from '../utils/constants';
import type { Issue, IssueStatus } from '@canopy/shared';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from '@/components/icons';
import { getInitials } from '../utils/formatters';

function KanbanCard({ issue, onClick }: { issue: Issue; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: issue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className="bg-surface border border-border rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-forest-300 transition-all group"
    >
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 cursor-grab">
          <GripVertical className="w-3.5 h-3.5 text-text-muted" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs">{TYPE_CONFIG[issue.type].icon}</span>
            <span className="font-mono text-[11px] text-text-muted">{issue.key}</span>
          </div>
          <p className="text-sm font-medium text-text-primary line-clamp-2">{issue.title}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-block w-2 h-2 rounded-full ${PRIORITY_CONFIG[issue.priority].color}`} />
            {issue.storyPoints && (
              <span className="text-[11px] font-mono bg-forest-100 text-forest-700 px-1.5 py-0.5 rounded">
                {issue.storyPoints}sp
              </span>
            )}
            {issue.assignee && (
              <div className="ml-auto w-6 h-6 rounded-full bg-forest-600 flex items-center justify-center text-white text-[10px] font-semibold" title={issue.assignee}>
                {getInitials(issue.assignee)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: issueData } = useIssues(projectId);
  const { data: sprints } = useSprints(projectId);
  const moveIssue = useMoveIssue();
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeSprint = sprints?.find(s => s.status === 'active');
  const issues = issueData?.issues || [];

  // Filter to active sprint issues only (or all if no sprint filter)
  const sprintIssues = activeSprint
    ? issues.filter(i => i.sprintId === activeSprint.id)
    : issues;

  const columns = BOARD_COLUMNS.map(status => ({
    id: status,
    ...STATUS_CONFIG[status],
    issues: sprintIssues.filter(i => i.status === status),
  }));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeIssue = activeId ? sprintIssues.find(i => i.id === activeId) : null;

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !projectId) return;

    const issueId = active.id as string;
    const targetColumn = over.id as string;

    // Check if dropped on a column
    if (BOARD_COLUMNS.includes(targetColumn as any)) {
      const issue = sprintIssues.find(i => i.id === issueId);
      if (issue && issue.status !== targetColumn) {
        moveIssue.mutate({
          projectId,
          issueId,
          status: targetColumn as IssueStatus,
        });
      }
    }
  };

  return (
    <div className="h-full">
      {/* Sprint selector */}
      <div className="flex items-center gap-3 mb-4">
        {activeSprint && (
          <div className="flex items-center gap-2 bg-forest-100 px-3 py-1.5 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-amber-accent" />
            <span className="text-sm font-medium text-forest-900">{activeSprint.name}</span>
            <span className="text-xs text-forest-600">({activeSprint.goal})</span>
          </div>
        )}
        <span className="text-sm text-text-muted">{sprintIssues.length} issues</span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={e => setActiveId(e.active.id as string)} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-4 h-[calc(100%-48px)]">
          {columns.map(column => (
            <div key={column.id} className="flex flex-col bg-forest-50 rounded-xl border border-border">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                  <span className="text-sm font-semibold text-text-primary">{column.label}</span>
                </div>
                <span className="text-xs font-mono text-text-muted bg-white px-2 py-0.5 rounded-full border border-border">
                  {column.issues.length}
                </span>
              </div>
              <SortableContext items={column.issues.map(i => i.id)} strategy={verticalListSortingStrategy} id={column.id}>
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5" id={column.id} data-column={column.id}>
                  {column.issues.map(issue => (
                    <KanbanCard
                      key={issue.id}
                      issue={issue}
                      onClick={() => navigate(`/projects/${projectId}/issues/${issue.id}`)}
                    />
                  ))}
                  {column.issues.length === 0 && (
                    <div className="text-center py-8 text-text-muted text-xs">No issues</div>
                  )}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeIssue && (
            <div className="bg-surface border-2 border-forest-400 rounded-lg p-3 shadow-lg rotate-2">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs">{TYPE_CONFIG[activeIssue.type].icon}</span>
                <span className="font-mono text-[11px] text-text-muted">{activeIssue.key}</span>
              </div>
              <p className="text-sm font-medium text-text-primary">{activeIssue.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
