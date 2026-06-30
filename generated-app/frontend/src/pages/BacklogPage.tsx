import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Search, Plus, ChevronDown, ChevronRight, X,
  Bug, BookOpen, CheckSquare, Layers, Hexagon,
} from '../components/icons';
import { useIssues, useCreateIssue } from '../api/issues';
import { useSprints } from '../api/sprints';
import { useProjectContext } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import {
  STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS,
  TYPE_LABELS, SEED_USERS, DEFAULT_PROJECT_ID,
} from '../utils/constants';
import { getUserName, getUserInitials, getAvatarColor, cn } from '../utils/helpers';
import type { Issue, IssueStatus, IssuePriority, IssueType } from '@canopy/shared';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  story: <BookOpen className="w-4 h-4 text-canopy-600" />,
  bug: <Bug className="w-4 h-4 text-rust" />,
  task: <CheckSquare className="w-4 h-4 text-sky" />,
  subtask: <Layers className="w-4 h-4 text-bark-500" />,
  epic: <Hexagon className="w-4 h-4 text-plum" />,
};

export function BacklogPage() {
  const { projectId: paramProjectId } = useParams();
  const { currentProject } = useProjectContext();
  const { addToast } = useToast();
  const projectId = paramProjectId || currentProject?.id || DEFAULT_PROJECT_ID;

  const { data: issuesData, isLoading: issuesLoading } = useIssues(projectId);
  const { data: sprintsData } = useSprints(projectId);
  const createIssueMutation = useCreateIssue();

  const issues = issuesData || [];
  const sprints = sprintsData || [];

  const activeSprint = sprints.find(s => s.status === 'active');
  const planningSprint = sprints.find(s => s.status === 'planning');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority | null>(null);
  const [typeFilter, setTypeFilter] = useState<IssueType | null>(null);
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<IssueType>('task');
  const [newPriority, setNewPriority] = useState<IssuePriority>('medium');
  const [newAssigneeId, setNewAssigneeId] = useState('');
  const [newPoints, setNewPoints] = useState('');

  // Sections collapsed state
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const filteredIssues = useMemo(() => {
    return issues.filter((issue: Issue) => {
      if (searchQuery && !issue.title.toLowerCase().includes(searchQuery.toLowerCase()) && !issue.key.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (statusFilter && issue.status !== statusFilter) return false;
      if (priorityFilter && issue.priority !== priorityFilter) return false;
      if (typeFilter && issue.type !== typeFilter) return false;
      return true;
    });
  }, [issues, searchQuery, statusFilter, priorityFilter, typeFilter]);

  const groupedIssues = useMemo(() => {
    const groups: { label: string; key: string; issues: Issue[] }[] = [];
    if (activeSprint) {
      groups.push({
        label: `Active Sprint: ${activeSprint.name}`,
        key: 'active',
        issues: filteredIssues.filter((i: Issue) => i.sprintId === activeSprint.id),
      });
    }
    if (planningSprint) {
      groups.push({
        label: `Planning Sprint: ${planningSprint.name}`,
        key: 'planning',
        issues: filteredIssues.filter((i: Issue) => i.sprintId === planningSprint.id),
      });
    }
    groups.push({
      label: 'Backlog (unassigned)',
      key: 'backlog',
      issues: filteredIssues.filter((i: Issue) => !i.sprintId),
    });
    return groups;
  }, [filteredIssues, activeSprint, planningSprint]);

  const toggleSection = (key: string) => {
    setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCreateIssue = async () => {
    if (!newTitle.trim()) return;
    try {
      await createIssueMutation.mutateAsync({
        projectId,
        data: {
          title: newTitle.trim(),
          type: newType,
          priority: newPriority,
          status: 'backlog',
          assigneeId: newAssigneeId || undefined,
          reporterId: SEED_USERS[0].id,
          storyPoints: newPoints ? parseInt(newPoints) : undefined,
          order: 0,
          labels: [],
        },
      });
      addToast('Issue created successfully', 'success');
      setNewTitle('');
      setNewType('task');
      setNewPriority('medium');
      setNewAssigneeId('');
      setNewPoints('');
      setShowCreateForm(false);
    } catch {
      addToast('Failed to create issue', 'error');
    }
  };

  if (issuesLoading) {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-bark-500 text-sm">Loading backlog...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-bark-900">Backlog</h1>
          <p className="text-sm text-bark-500 mt-1">{issues.length} issues total</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-canopy-600 text-white rounded-lg hover:bg-canopy-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Issue
        </button>
      </div>

      {/* Create Issue Form */}
      {showCreateForm && (
        <div className="mb-6 bg-white rounded-xl border border-bark-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-bark-800">New Issue</h3>
            <button onClick={() => setShowCreateForm(false)} className="text-bark-400 hover:text-bark-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <input
              type="text"
              placeholder="Issue title"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="sm:col-span-2 lg:col-span-4 px-3 py-2 border border-bark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-canopy-500 focus:border-transparent"
            />
            <select
              value={newType}
              onChange={e => setNewType(e.target.value as IssueType)}
              className="px-3 py-2 border border-bark-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-canopy-500"
            >
              {Object.entries(TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <select
              value={newPriority}
              onChange={e => setNewPriority(e.target.value as IssuePriority)}
              className="px-3 py-2 border border-bark-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-canopy-500"
            >
              {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <select
              value={newAssigneeId}
              onChange={e => setNewAssigneeId(e.target.value)}
              className="px-3 py-2 border border-bark-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-canopy-500"
            >
              <option value="">Unassigned</option>
              {SEED_USERS.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Story points"
              value={newPoints}
              onChange={e => setNewPoints(e.target.value)}
              min="0"
              max="100"
              className="px-3 py-2 border border-bark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-canopy-500"
            />
          </div>
          <button
            onClick={handleCreateIssue}
            disabled={!newTitle.trim() || createIssueMutation.isPending}
            className="px-4 py-2 bg-canopy-600 text-white rounded-lg hover:bg-canopy-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            {createIssueMutation.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bark-400" />
          <input
            type="text"
            placeholder="Search by title or key..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-bark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-canopy-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? null : status as IssueStatus)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                statusFilter === status ? STATUS_COLORS[status] : 'bg-bark-100 text-bark-600 hover:bg-bark-200'
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PRIORITY_LABELS).map(([priority, label]) => (
            <button
              key={priority}
              onClick={() => setPriorityFilter(priorityFilter === priority ? null : priority as IssuePriority)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                priorityFilter === priority ? 'bg-bark-800 text-white' : 'bg-bark-100 text-bark-600 hover:bg-bark-200'
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(TYPE_LABELS).map(([type, label]) => (
            <button
              key={type}
              onClick={() => setTypeFilter(typeFilter === type ? null : type as IssueType)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                typeFilter === type ? 'bg-bark-800 text-white' : 'bg-bark-100 text-bark-600 hover:bg-bark-200'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Issue groups */}
      <div className="space-y-4">
        {groupedIssues.map(group => (
          <div key={group.key} className="bg-white rounded-xl border border-bark-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection(group.key)}
              className="w-full flex items-center gap-3 px-5 py-3 bg-bark-50 border-b border-bark-100 hover:bg-bark-100 transition-colors"
            >
              {collapsedSections[group.key] ? (
                <ChevronRight className="w-4 h-4 text-bark-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-bark-500" />
              )}
              <h2 className="font-display font-semibold text-bark-800 text-sm">{group.label}</h2>
              <span className="text-xs text-bark-500 bg-bark-200 px-2 py-0.5 rounded-full">
                {group.issues.length}
              </span>
            </button>
            {!collapsedSections[group.key] && (
              <div className="divide-y divide-bark-100">
                {group.issues.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-bark-400">
                    No issues in this section
                  </div>
                ) : (
                  group.issues.map((issue: Issue) => (
                    <div key={issue.id}>
                      <button
                        onClick={() => setExpandedIssueId(expandedIssueId === issue.id ? null : issue.id)}
                        className="w-full flex items-center gap-4 px-5 py-3 hover:bg-bark-50 transition-colors text-left"
                      >
                        <span className="font-mono text-xs text-bark-500 w-20 shrink-0">{issue.key}</span>
                        <span className="mr-1 shrink-0">{TYPE_ICONS[issue.type]}</span>
                        <span className="text-sm text-bark-800 truncate flex-1">{issue.title}</span>
                        <span className={cn('text-xs font-medium', PRIORITY_COLORS[issue.priority])}>
                          {PRIORITY_LABELS[issue.priority]}
                        </span>
                        {issue.assigneeId && (
                          <div
                            className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-medium shrink-0',
                              getAvatarColor(getUserName(issue.assigneeId))
                            )}
                            title={getUserName(issue.assigneeId)}
                          >
                            {getUserInitials(getUserName(issue.assigneeId))}
                          </div>
                        )}
                        {issue.storyPoints !== undefined && issue.storyPoints > 0 && (
                          <span className="text-xs bg-bark-100 text-bark-600 px-2 py-0.5 rounded-full shrink-0">
                            {issue.storyPoints} SP
                          </span>
                        )}
                      </button>
                      {expandedIssueId === issue.id && (
                        <div className="px-5 py-4 bg-bark-50 border-t border-bark-100">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-bark-500 text-xs">Status</span>
                              <div className="mt-1">
                                <span className={cn('px-2 py-0.5 rounded text-xs font-medium', STATUS_COLORS[issue.status])}>
                                  {STATUS_LABELS[issue.status]}
                                </span>
                              </div>
                            </div>
                            <div>
                              <span className="text-bark-500 text-xs">Assignee</span>
                              <p className="mt-1 text-bark-800">{getUserName(issue.assigneeId)}</p>
                            </div>
                            <div>
                              <span className="text-bark-500 text-xs">Type</span>
                              <p className="mt-1 text-bark-800">{TYPE_LABELS[issue.type]}</p>
                            </div>
                            <div>
                              <span className="text-bark-500 text-xs">Points</span>
                              <p className="mt-1 text-bark-800">{issue.storyPoints || '-'}</p>
                            </div>
                          </div>
                          {issue.description && (
                            <div className="mt-3">
                              <span className="text-bark-500 text-xs">Description</span>
                              <p className="mt-1 text-sm text-bark-700 whitespace-pre-wrap">{issue.description}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {issues.length === 0 && !issuesLoading && (
        <div className="text-center py-16">
          <Layers className="w-12 h-12 text-bark-300 mx-auto mb-3" />
          <h3 className="font-display font-semibold text-bark-700 mb-1">No issues yet</h3>
          <p className="text-sm text-bark-500">Create your first issue to get started.</p>
        </div>
      )}
    </div>
  );
}
