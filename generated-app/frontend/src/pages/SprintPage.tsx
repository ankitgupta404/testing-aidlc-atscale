import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, X, Calendar, Target, Zap, ChevronDown, ChevronRight } from '../components/icons';
import { useSprints, useCreateSprint } from '../api/sprints';
import { useIssues } from '../api/issues';
import { useProjectContext } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { DEFAULT_PROJECT_ID, STATUS_LABELS, PRIORITY_COLORS } from '../utils/constants';
import { formatDate, cn } from '../utils/helpers';
import type { Sprint, Issue } from '@canopy/shared';

const STATUS_BADGE_CLASSES: Record<string, string> = {
  planning: 'bg-bark-100 text-bark-700',
  active: 'bg-canopy-100 text-canopy-700',
  completed: 'bg-bark-200 text-bark-600',
};

const STATUS_BADGE_LABELS: Record<string, string> = {
  planning: 'Planning',
  active: 'Active',
  completed: 'Completed',
};

export function SprintPage() {
  const { projectId: paramProjectId } = useParams();
  const navigate = useNavigate();
  const { currentProject } = useProjectContext();
  const { addToast } = useToast();
  const projectId = paramProjectId || currentProject?.id || DEFAULT_PROJECT_ID;

  const { data: sprintsData, isLoading } = useSprints(projectId);
  const { data: issuesData } = useIssues(projectId);
  const createSprintMutation = useCreateSprint();

  const sprints = sprintsData || [];
  const issues = issuesData || [];

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formGoal, setFormGoal] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [expandedSprints, setExpandedSprints] = useState<Record<string, boolean>>({});

  const getIssueCount = (sprintId: string) => {
    return issues.filter(i => i.sprintId === sprintId).length;
  };

  const getSprintIssues = (sprintId: string): Issue[] => {
    return issues.filter(i => i.sprintId === sprintId);
  };

  const toggleExpand = (sprintId: string) => {
    setExpandedSprints(prev => ({ ...prev, [sprintId]: !prev[sprintId] }));
  };

  const handleCreateSprint = async () => {
    if (!formName.trim()) return;
    try {
      await createSprintMutation.mutateAsync({
        projectId,
        data: {
          name: formName.trim(),
          goal: formGoal.trim() || undefined,
          status: 'planning',
          startDate: formStartDate ? new Date(formStartDate).toISOString() : undefined,
          endDate: formEndDate ? new Date(formEndDate).toISOString() : undefined,
        },
      });
      addToast('Sprint created successfully', 'success');
      setFormName('');
      setFormGoal('');
      setFormStartDate('');
      setFormEndDate('');
      setShowCreateModal(false);
    } catch {
      addToast('Failed to create sprint', 'error');
    }
  };

  // Sort sprints: active first, then planning, then completed
  const sortedSprints = [...sprints].sort((a: Sprint, b: Sprint) => {
    const order = { active: 0, planning: 1, completed: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-bark-500 text-sm">Loading sprints...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-bark-900">Sprints</h1>
          <p className="text-sm text-bark-500 mt-1">{sprints.length} sprint{sprints.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-canopy-600 text-white rounded-lg hover:bg-canopy-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Sprint
        </button>
      </div>

      {/* Sprint cards */}
      <div className="space-y-4">
        {sortedSprints.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-bark-200">
            <Zap className="w-12 h-12 text-bark-300 mx-auto mb-3" />
            <h3 className="font-display font-semibold text-bark-700 mb-1">No sprints yet</h3>
            <p className="text-sm text-bark-500">Create your first sprint to organize your work.</p>
          </div>
        ) : (
          sortedSprints.map((sprint: Sprint) => {
            const sprintIssues = getSprintIssues(sprint.id);
            const doneCount = sprintIssues.filter(i => i.status === 'done').length;
            const progress = sprintIssues.length > 0 ? Math.round((doneCount / sprintIssues.length) * 100) : 0;
            const isExpanded = expandedSprints[sprint.id];

            return (
              <div
                key={sprint.id}
                className={cn(
                  'bg-white rounded-xl border shadow-sm transition-shadow hover:shadow-md',
                  sprint.status === 'active' ? 'border-canopy-400 ring-1 ring-canopy-100' : 'border-bark-200'
                )}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display font-semibold text-bark-900 text-lg truncate">{sprint.name}</h3>
                        <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0', STATUS_BADGE_CLASSES[sprint.status])}>
                          {STATUS_BADGE_LABELS[sprint.status]}
                        </span>
                      </div>
                      {sprint.goal && (
                        <div className="flex items-start gap-2 mb-3">
                          <Target className="w-4 h-4 text-bark-400 mt-0.5 shrink-0" />
                          <p className="text-sm text-bark-600">{sprint.goal}</p>
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-bark-500">
                        {(sprint.startDate || sprint.endDate) && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {sprint.startDate ? formatDate(sprint.startDate) : '?'}
                              {' - '}
                              {sprint.endDate ? formatDate(sprint.endDate) : '?'}
                            </span>
                          </div>
                        )}
                        <span className="text-bark-400">|</span>
                        <span>{sprintIssues.length} issue{sprintIssues.length !== 1 ? 's' : ''}</span>
                        {sprintIssues.length > 0 && (
                          <>
                            <span className="text-bark-400">|</span>
                            <span className="text-canopy-600 font-medium">{progress}% complete</span>
                          </>
                        )}
                      </div>
                      {/* Progress bar */}
                      {sprintIssues.length > 0 && (
                        <div className="mt-3 h-1.5 bg-bark-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-canopy-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable issue list */}
                {sprintIssues.length > 0 && (
                  <>
                    <button
                      onClick={() => toggleExpand(sprint.id)}
                      className="w-full flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-bark-500 hover:text-bark-700 hover:bg-bark-50 border-t border-bark-100 transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      {isExpanded ? 'Hide issues' : 'Show issues'}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-bark-100 divide-y divide-bark-50">
                        {sprintIssues.map((issue: Issue) => (
                          <button
                            key={issue.id}
                            onClick={() => navigate(`/projects/${projectId}/issues/${issue.id}`)}
                            className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-left hover:bg-bark-50 transition-colors"
                          >
                            <span className={cn('w-2 h-2 rounded-full shrink-0', PRIORITY_COLORS[issue.priority] || 'bg-bark-400')} />
                            <span className="font-mono text-xs text-bark-400 shrink-0">{issue.key}</span>
                            <span className="truncate flex-1 text-bark-800">{issue.title}</span>
                            <span className="text-xs text-bark-400 shrink-0">{STATUS_LABELS[issue.status]}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Sprint Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-bark-900/40" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-bark-900 text-lg">Create Sprint</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-bark-400 hover:text-bark-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-bark-700 mb-1">Sprint Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Sprint 1"
                  className="w-full px-3 py-2 border border-bark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-canopy-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-bark-700 mb-1">Goal (optional)</label>
                <input
                  type="text"
                  value={formGoal}
                  onChange={e => setFormGoal(e.target.value)}
                  placeholder="Sprint goal..."
                  className="w-full px-3 py-2 border border-bark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-canopy-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-bark-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-bark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-canopy-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bark-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={e => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-bark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-canopy-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm text-bark-600 hover:text-bark-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSprint}
                disabled={!formName.trim() || createSprintMutation.isPending}
                className="px-4 py-2 bg-canopy-600 text-white rounded-lg hover:bg-canopy-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                {createSprintMutation.isPending ? 'Creating...' : 'Create Sprint'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
