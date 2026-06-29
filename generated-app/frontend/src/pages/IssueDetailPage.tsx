import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from '@/components/icons';
import { useIssue, useUpdateIssue, useAddComment } from '../api/issues';
import { useSprints } from '../api/sprints';
import { useEpics } from '../api/epics';
import { STATUS_CONFIG, PRIORITY_CONFIG, TYPE_CONFIG } from '../utils/constants';
import { timeAgo, getInitials } from '../utils/formatters';
import type { IssueStatus, IssuePriority } from '@canopy/shared';

export default function IssueDetailPage() {
  const { projectId, issueId } = useParams<{ projectId: string; issueId: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useIssue(projectId, issueId);
  const { data: sprints } = useSprints(projectId);
  const { data: epics } = useEpics(projectId);
  const updateIssue = useUpdateIssue();
  const addComment = useAddComment();
  const [comment, setComment] = useState('');

  if (isLoading) {
    return (
      <div className="max-w-[1080px] animate-fade-in">
        <div className="skeleton h-8 w-64 mb-4" />
        <div className="skeleton h-4 w-full mb-2" />
        <div className="skeleton h-4 w-2/3" />
      </div>
    );
  }

  if (!data) return <div className="text-text-muted">Issue not found</div>;

  const { issue, comments } = data;

  const handleStatusChange = (status: IssueStatus) => {
    if (projectId && issueId) {
      updateIssue.mutate({ projectId, issueId, status });
    }
  };

  const handlePriorityChange = (priority: IssuePriority) => {
    if (projectId && issueId) {
      updateIssue.mutate({ projectId, issueId, priority });
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim() && projectId && issueId) {
      addComment.mutate({ projectId, issueId, author: 'Sarah Chen', body: comment });
      setComment('');
    }
  };

  const epic = epics?.find(e => e.id === issue.epicId);
  const sprint = sprints?.find(s => s.id === issue.sprintId);

  return (
    <div className="max-w-[1080px] animate-fade-in">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{TYPE_CONFIG[issue.type].icon}</span>
              <span className="font-mono text-sm text-text-muted">{issue.key}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full text-white ${STATUS_CONFIG[issue.status].color}`}>
                {STATUS_CONFIG[issue.status].label}
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-text-primary">{issue.title}</h1>
          </div>

          {/* Description */}
          <div className="bg-surface rounded-xl p-5 border border-border">
            <h3 className="font-display font-semibold text-sm text-text-secondary mb-3">Description</h3>
            <p className="text-sm text-text-primary leading-relaxed">
              {issue.description || 'No description provided.'}
            </p>
          </div>

          {/* Comments */}
          <div className="bg-surface rounded-xl p-5 border border-border">
            <h3 className="font-display font-semibold text-sm text-text-secondary mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comments ({comments.length})
            </h3>

            <div className="space-y-4 mb-4">
              {comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-forest-600 flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                    {getInitials(c.author)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-text-primary">{c.author}</span>
                      <span className="text-xs text-text-muted">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">{c.body}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-text-muted text-center py-4">No comments yet</p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-3">
              <input
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
              />
              <button type="submit" className="px-4 py-2 bg-forest-900 text-white rounded-lg text-sm font-medium hover:bg-forest-800 transition-colors">
                Comment
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-surface rounded-xl p-5 border border-border space-y-4">
            {/* Status */}
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Status</label>
              <select
                value={issue.status}
                onChange={e => handleStatusChange(e.target.value as IssueStatus)}
                className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
              >
                {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Priority</label>
              <select
                value={issue.priority}
                onChange={e => handlePriorityChange(e.target.value as IssuePriority)}
                className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
              >
                {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Assignee</label>
              <p className="mt-1 text-sm text-text-primary">{issue.assignee || 'Unassigned'}</p>
            </div>

            {/* Reporter */}
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Reporter</label>
              <p className="mt-1 text-sm text-text-primary">{issue.reporter}</p>
            </div>

            {/* Sprint */}
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Sprint</label>
              <p className="mt-1 text-sm text-text-primary">{sprint?.name || 'Backlog'}</p>
            </div>

            {/* Epic */}
            {epic && (
              <div>
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Epic</label>
                <div className="mt-1 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: epic.color }} />
                  <span className="text-sm text-text-primary">{epic.name}</span>
                </div>
              </div>
            )}

            {/* Story Points */}
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Story Points</label>
              <p className="mt-1 text-sm font-mono text-text-primary">{issue.storyPoints || '—'}</p>
            </div>

            {/* Labels */}
            {issue.labels && issue.labels.length > 0 && (
              <div>
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Labels</label>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {issue.labels.map(label => (
                    <span key={label} className="text-xs bg-forest-100 text-forest-700 px-2 py-0.5 rounded-full">{label}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-text-muted">Created {timeAgo(issue.createdAt)}</p>
              <p className="text-xs text-text-muted">Updated {timeAgo(issue.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
