import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { useIssues } from '../api/issues';
import { useProjectContext } from '../context/ProjectContext';
import {
  STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS, SEED_USERS, DEFAULT_PROJECT_ID,
} from '../utils/constants';
import { getUserName, getUserInitials, getAvatarColor, cn } from '../utils/helpers';
import type { Issue, IssueStatus, IssuePriority } from '@canopy/shared';

const BOARD_COLUMNS: { status: IssueStatus; label: string; headerColor: string }[] = [
  { status: 'backlog', label: 'Backlog', headerColor: 'border-t-bark-400' },
  { status: 'todo', label: 'To Do', headerColor: 'border-t-sky' },
  { status: 'in_progress', label: 'In Progress', headerColor: 'border-t-amber' },
  { status: 'in_review', label: 'In Review', headerColor: 'border-t-plum' },
  { status: 'done', label: 'Done', headerColor: 'border-t-canopy-600' },
];

const PRIORITY_BORDER_COLORS: Record<string, string> = {
  critical: 'border-l-rust',
  high: 'border-l-amber',
  medium: 'border-l-bark-400',
  low: 'border-l-sky',
  trivial: 'border-l-bark-200',
};

export function BoardPage() {
  const { projectId: paramProjectId } = useParams();
  const { currentProject } = useProjectContext();
  const projectId = paramProjectId || currentProject?.id || DEFAULT_PROJECT_ID;

  const { data: issuesData, isLoading } = useIssues(projectId);
  const issues = issuesData || [];

  // Filters
  const [assigneeFilter, setAssigneeFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue: Issue) => {
      if (assigneeFilter && issue.assigneeId !== assigneeFilter) return false;
      if (priorityFilter && issue.priority !== priorityFilter) return false;
      return true;
    });
  }, [issues, assigneeFilter, priorityFilter]);

  const columnIssues = useMemo(() => {
    const map: Record<string, Issue[]> = {};
    for (const col of BOARD_COLUMNS) {
      map[col.status] = filteredIssues.filter((i: Issue) => i.status === col.status);
    }
    return map;
  }, [filteredIssues]);

  if (isLoading) {
    return (
      <div className="max-w-full mx-auto animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-bark-500 text-sm">Loading board...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-bark-900">Board</h1>
          <p className="text-sm text-bark-500 mt-1">
            {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''} visible
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
        </button>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-white rounded-xl border border-bark-200 shadow-sm">
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
              className="text-xs text-canopy-600 hover:text-canopy-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Board columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto">
        {BOARD_COLUMNS.map(col => (
          <div
            key={col.status}
            className={cn(
              'bg-bark-50 rounded-xl border border-bark-200 border-t-4 flex flex-col min-h-[400px]',
              col.headerColor
            )}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-bark-200">
              <h3 className="font-display font-semibold text-bark-800 text-sm">{col.label}</h3>
              <span className="text-xs text-bark-500 bg-bark-200 px-2 py-0.5 rounded-full">
                {columnIssues[col.status]?.length || 0}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 p-3 space-y-2 overflow-y-auto">
              {columnIssues[col.status]?.length === 0 ? (
                <div className="text-center py-8 text-xs text-bark-400">
                  No issues
                </div>
              ) : (
                columnIssues[col.status]?.map((issue: Issue) => (
                  <div
                    key={issue.id}
                    className={cn(
                      'bg-white rounded-lg border border-bark-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4',
                      PRIORITY_BORDER_COLORS[issue.priority]
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-mono text-[10px] text-bark-500">{issue.key}</span>
                      {issue.storyPoints !== undefined && issue.storyPoints > 0 && (
                        <span className="text-[10px] bg-canopy-50 text-canopy-700 px-1.5 py-0.5 rounded font-medium">
                          {issue.storyPoints}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-bark-800 font-medium leading-snug mb-3">{issue.title}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          issue.priority === 'critical' ? 'bg-rust' :
                          issue.priority === 'high' ? 'bg-amber' :
                          issue.priority === 'medium' ? 'bg-bark-400' :
                          issue.priority === 'low' ? 'bg-sky' : 'bg-bark-200'
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
                ))
              )}
            </div>
          </div>
        ))}
      </div>

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
