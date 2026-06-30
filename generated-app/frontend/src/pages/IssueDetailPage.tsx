import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Calendar, Target, Zap, Bug, BookOpen, CheckSquare, Layers } from '../components/icons';
import { useIssues, useUpdateIssue } from '../api/issues';
import { useSprints } from '../api/sprints';
import { useEpics } from '../api/epics';
import {
  STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS,
  TYPE_LABELS, SEED_USERS, DEFAULT_PROJECT_ID
} from '../utils/constants';
import { getUserName, getRelativeTime, cn } from '../utils/helpers';
import type { Issue } from '@canopy/shared';

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  bug: Bug,
  story: BookOpen,
  task: CheckSquare,
  subtask: Layers,
};

export function IssueDetailPage() {
  const { projectId, issueId } = useParams();
  const navigate = useNavigate();
  const pid = projectId || DEFAULT_PROJECT_ID;
  const { data: issues } = useIssues(pid);
  const { data: sprints } = useSprints(pid);
  const { data: epics } = useEpics(pid);
  const updateIssue = useUpdateIssue();

  const issue = issues?.find((i: Issue) => i.id === issueId);

  const [editingField, setEditingField] = useState<string | null>(null);

  if (!issue) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-pulse w-8 h-8 rounded-full bg-bark-200 mx-auto mb-3" />
          <p className="text-bark-500 text-sm">Loading issue...</p>
        </div>
      </div>
    );
  }

  const TypeIcon = TYPE_ICONS[issue.type] || CheckSquare;
  const sprint = sprints?.find(s => s.id === issue.sprintId);
  const epic = epics?.find(e => e.id === issue.epicId);
  const assignee = SEED_USERS.find(u => u.id === issue.assigneeId);

  const handleStatusChange = (newStatus: string) => {
    updateIssue.mutate({ id: issue.id, data: { status: newStatus as Issue['status'] } });
    setEditingField(null);
  };

  const handlePriorityChange = (newPriority: string) => {
    updateIssue.mutate({ id: issue.id, data: { priority: newPriority as Issue['priority'] } });
    setEditingField(null);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-bark-500 hover:text-bark-700 transition-colors text-sm"
        >
          ← Back
        </button>
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-bark-100 transition-colors"
        >
          <X className="w-5 h-5 text-bark-500" />
        </button>
      </div>

      {/* Issue header */}
      <div className="bg-white rounded-xl border border-bark-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-bark-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 text-bark-500">
              <TypeIcon className="w-4 h-4" />
              <span className="text-xs font-mono font-medium">{issue.key}</span>
            </div>
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              STATUS_COLORS[issue.status] || 'bg-bark-100 text-bark-600'
            )}>
              {STATUS_LABELS[issue.status] || issue.status}
            </span>
          </div>
          <h1 className="text-xl font-display font-bold text-bark-900">{issue.title}</h1>
          {issue.description && (
            <p className="text-bark-600 mt-3 text-sm leading-relaxed">{issue.description}</p>
          )}
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-bark-100">
          {/* Status */}
          <div className="bg-white p-4">
            <label className="text-xs text-bark-500 font-medium block mb-2">Status</label>
            {editingField === 'status' ? (
              <div className="flex flex-wrap gap-1">
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => handleStatusChange(key)}
                    className={cn(
                      'px-2 py-1 rounded text-xs font-medium transition-colors',
                      key === issue.status ? 'bg-canopy-100 text-canopy-700 ring-1 ring-canopy-300' : 'bg-bark-50 text-bark-600 hover:bg-bark-100'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => setEditingField('status')}
                className={cn(
                  'px-2 py-1 rounded text-xs font-medium',
                  STATUS_COLORS[issue.status] || 'bg-bark-100 text-bark-600'
                )}
              >
                {STATUS_LABELS[issue.status] || issue.status}
              </button>
            )}
          </div>

          {/* Priority */}
          <div className="bg-white p-4">
            <label className="text-xs text-bark-500 font-medium block mb-2">Priority</label>
            {editingField === 'priority' ? (
              <div className="flex flex-wrap gap-1">
                {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => handlePriorityChange(key)}
                    className={cn(
                      'px-2 py-1 rounded text-xs font-medium transition-colors',
                      key === issue.priority ? 'bg-canopy-100 text-canopy-700 ring-1 ring-canopy-300' : 'bg-bark-50 text-bark-600 hover:bg-bark-100'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => setEditingField('priority')}
                className={cn('text-sm font-medium', PRIORITY_COLORS[issue.priority] || 'text-bark-600')}
              >
                ● {PRIORITY_LABELS[issue.priority] || issue.priority}
              </button>
            )}
          </div>

          {/* Assignee */}
          <div className="bg-white p-4">
            <label className="text-xs text-bark-500 font-medium block mb-2">Assignee</label>
            <div className="flex items-center gap-2">
              {assignee ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-canopy-500 text-white flex items-center justify-center text-xs font-medium">
                    {assignee.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-sm text-bark-700">{assignee.name}</span>
                </>
              ) : (
                <span className="text-sm text-bark-400">Unassigned</span>
              )}
            </div>
          </div>

          {/* Type */}
          <div className="bg-white p-4">
            <label className="text-xs text-bark-500 font-medium block mb-2">Type</label>
            <div className="flex items-center gap-2">
              <TypeIcon className="w-4 h-4 text-bark-500" />
              <span className="text-sm text-bark-700">{TYPE_LABELS[issue.type] || issue.type}</span>
            </div>
          </div>

          {/* Story Points */}
          <div className="bg-white p-4">
            <label className="text-xs text-bark-500 font-medium block mb-2">Story Points</label>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-bark-400" />
              <span className="text-sm text-bark-700">{issue.storyPoints || '—'}</span>
            </div>
          </div>

          {/* Sprint */}
          <div className="bg-white p-4">
            <label className="text-xs text-bark-500 font-medium block mb-2">Sprint</label>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-bark-400" />
              <span className="text-sm text-bark-700">{sprint?.name || 'None'}</span>
            </div>
          </div>

          {/* Epic */}
          <div className="bg-white p-4">
            <label className="text-xs text-bark-500 font-medium block mb-2">Epic</label>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-bark-400" />
              <span className="text-sm text-bark-700">{epic?.name || 'None'}</span>
            </div>
          </div>

          {/* Created */}
          <div className="bg-white p-4">
            <label className="text-xs text-bark-500 font-medium block mb-2">Created</label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-bark-400" />
              <span className="text-sm text-bark-700">{getRelativeTime(issue.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
