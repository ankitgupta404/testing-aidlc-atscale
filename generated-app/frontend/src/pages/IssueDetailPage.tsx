import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  X, Calendar, Target, Zap, Bug, BookOpen, CheckSquare, Layers,
  ArrowLeft, MessageSquare, Send, Edit2, Trash2, User,
} from '../components/icons';
import { useIssues, useUpdateIssue } from '../api/issues';
import { useComments, useCreateComment, useDeleteComment } from '../api/comments';
import { useSprints } from '../api/sprints';
import { useEpics } from '../api/epics';
import {
  STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS,
  TYPE_LABELS, SEED_USERS, DEFAULT_PROJECT_ID
} from '../utils/constants';
import { getUserName, getUserInitials, getAvatarColor, getRelativeTime, cn } from '../utils/helpers';
import type { Issue, Comment } from '@canopy/shared';

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
  const { data: commentsData } = useComments(issueId);
  const updateIssue = useUpdateIssue();
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();

  const issue = issues?.find((i: Issue) => i.id === issueId);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [newComment, setNewComment] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  // Parse comments - handle various response formats
  const comments: Comment[] = (() => {
    if (!commentsData) return [];
    if (Array.isArray(commentsData)) return commentsData;
    if ('comments' in (commentsData as any)) return (commentsData as any).comments;
    if ('data' in (commentsData as any) && (commentsData as any).data?.items) return (commentsData as any).data.items;
    return [];
  })();

  if (!issue) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-canopy-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
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

  const handleAssigneeChange = (userId: string) => {
    updateIssue.mutate({ id: issue.id, data: { assigneeId: userId || undefined } });
    setEditingField(null);
  };

  const handleSprintChange = (sprintId: string) => {
    updateIssue.mutate({ id: issue.id, data: { sprintId: sprintId || undefined } });
    setEditingField(null);
  };

  const handleTitleSave = () => {
    if (titleDraft.trim() && titleDraft !== issue.title) {
      updateIssue.mutate({ id: issue.id, data: { title: titleDraft.trim() } });
    }
    setEditingTitle(false);
  };

  const handleDescriptionSave = () => {
    updateIssue.mutate({ id: issue.id, data: { description: descriptionDraft } });
    setEditingDescription(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !issueId) return;
    createComment.mutate({
      issueId,
      data: {
        authorId: SEED_USERS[0].id,
        body: newComment.trim(),
      },
    });
    setNewComment('');
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-bark-500 hover:text-bark-700 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-bark-100 transition-colors"
        >
          <X className="w-5 h-5 text-bark-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content (left 2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Issue header card */}
          <div className="bg-white rounded-xl border border-bark-200 shadow-sm p-6">
            {/* Issue key and type */}
            <div className="flex items-center gap-2 mb-3">
              <TypeIcon className="w-4 h-4 text-bark-500" />
              <span className="text-xs font-mono font-medium text-bark-500">{issue.key}</span>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider',
                STATUS_COLORS[issue.status] || 'bg-bark-100 text-bark-600'
              )}>
                {STATUS_LABELS[issue.status]}
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-bark-100 text-bark-500 rounded-full capitalize">
                {TYPE_LABELS[issue.type]}
              </span>
            </div>

            {/* Title */}
            {editingTitle ? (
              <div className="mb-4">
                <input
                  type="text"
                  value={titleDraft}
                  onChange={e => setTitleDraft(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={e => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') setEditingTitle(false); }}
                  autoFocus
                  className="w-full text-xl font-display font-bold text-bark-900 border-b-2 border-canopy-500 outline-none pb-1 bg-transparent"
                />
              </div>
            ) : (
              <h1
                className="text-xl font-display font-bold text-bark-900 mb-4 cursor-pointer hover:text-canopy-700 transition-colors"
                onClick={() => { setTitleDraft(issue.title); setEditingTitle(true); }}
                title="Click to edit title"
              >
                {issue.title}
              </h1>
            )}

            {/* Description */}
            <div className="border-t border-bark-100 pt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-bark-700">Description</h3>
                {!editingDescription && (
                  <button
                    onClick={() => { setDescriptionDraft(issue.description || ''); setEditingDescription(true); }}
                    className="text-xs text-bark-400 hover:text-canopy-600 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {editingDescription ? (
                <div>
                  <textarea
                    value={descriptionDraft}
                    onChange={e => setDescriptionDraft(e.target.value)}
                    className="w-full min-h-[120px] p-3 border border-bark-200 rounded-lg text-sm text-bark-700 resize-y focus:outline-none focus:ring-2 focus:ring-canopy-500 focus:border-canopy-500"
                    placeholder="Add a description..."
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleDescriptionSave}
                      className="px-3 py-1.5 bg-canopy-600 text-white rounded-lg text-xs font-medium hover:bg-canopy-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingDescription(false)}
                      className="px-3 py-1.5 bg-bark-100 text-bark-600 rounded-lg text-xs font-medium hover:bg-bark-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="text-sm text-bark-600 leading-relaxed cursor-pointer hover:bg-bark-50 rounded-lg p-2 -m-2 transition-colors"
                  onClick={() => { setDescriptionDraft(issue.description || ''); setEditingDescription(true); }}
                >
                  {issue.description || <span className="italic text-bark-400">Click to add a description...</span>}
                </div>
              )}
            </div>
          </div>

          {/* Comments section */}
          <div className="bg-white rounded-xl border border-bark-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-bark-500" />
              <h3 className="text-sm font-semibold text-bark-700">
                Comments {comments.length > 0 && <span className="text-bark-400">({comments.length})</span>}
              </h3>
            </div>

            {/* Comments list */}
            <div className="space-y-4 mb-4">
              {comments.map((comment: Comment) => {
                const author = SEED_USERS.find(u => u.id === comment.authorId);
                return (
                  <div key={comment.id} className="flex gap-3 group">
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-medium shrink-0',
                      getAvatarColor(author?.name || 'Unknown')
                    )}>
                      {getUserInitials(author?.name || 'U')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-bark-800">{author?.name || 'Unknown'}</span>
                        <span className="text-[10px] text-bark-400">{getRelativeTime(comment.createdAt)}</span>
                        <button
                          onClick={() => deleteComment.mutate(comment.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto p-1 rounded hover:bg-bark-100"
                        >
                          <Trash2 className="w-3 h-3 text-bark-400" />
                        </button>
                      </div>
                      <p className="text-sm text-bark-600 leading-relaxed">{comment.body}</p>
                    </div>
                  </div>
                );
              })}
              {comments.length === 0 && (
                <p className="text-sm text-bark-400 italic text-center py-4">No comments yet. Be the first to comment.</p>
              )}
            </div>

            {/* Add comment */}
            <div className="flex gap-3 pt-4 border-t border-bark-100">
              <div className="w-7 h-7 rounded-full bg-canopy-500 text-white flex items-center justify-center text-[10px] font-medium shrink-0">
                AC
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-3 py-2 border border-bark-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-canopy-500 focus:border-canopy-500"
                  rows={2}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddComment(); }}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] text-bark-400">Ctrl+Enter to submit</span>
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-canopy-600 text-white rounded-lg text-xs font-medium hover:bg-canopy-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar (right col) */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-white rounded-xl border border-bark-200 shadow-sm p-4">
            <label className="text-[10px] uppercase tracking-wider text-bark-500 font-semibold block mb-2">Status</label>
            {editingField === 'status' ? (
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => handleStatusChange(key)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                      key === issue.status
                        ? 'bg-canopy-100 text-canopy-700 ring-1 ring-canopy-300 shadow-sm'
                        : 'bg-bark-50 text-bark-600 hover:bg-bark-100'
                    )}
                  >
                    {label}
                  </button>
                ))}
                <button
                  onClick={() => setEditingField(null)}
                  className="w-full text-[10px] text-bark-400 mt-1 hover:text-bark-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingField('status')}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium hover:ring-2 hover:ring-canopy-200 transition-all',
                  STATUS_COLORS[issue.status] || 'bg-bark-100 text-bark-600'
                )}
              >
                {STATUS_LABELS[issue.status]}
              </button>
            )}
          </div>

          {/* Priority */}
          <div className="bg-white rounded-xl border border-bark-200 shadow-sm p-4">
            <label className="text-[10px] uppercase tracking-wider text-bark-500 font-semibold block mb-2">Priority</label>
            {editingField === 'priority' ? (
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => handlePriorityChange(key)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                      key === issue.priority
                        ? 'bg-canopy-100 text-canopy-700 ring-1 ring-canopy-300 shadow-sm'
                        : 'bg-bark-50 text-bark-600 hover:bg-bark-100'
                    )}
                  >
                    {label}
                  </button>
                ))}
                <button
                  onClick={() => setEditingField(null)}
                  className="w-full text-[10px] text-bark-400 mt-1 hover:text-bark-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingField('priority')}
                className="flex items-center gap-2 hover:ring-2 hover:ring-canopy-200 px-2.5 py-1 rounded-lg transition-all"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${
                  issue.priority === 'critical' ? 'bg-[#dc2626]' :
                  issue.priority === 'high' ? 'bg-[#d97706]' :
                  issue.priority === 'medium' ? 'bg-[#a8a29e]' :
                  issue.priority === 'low' ? 'bg-[#0284c7]' : 'bg-bark-200'
                }`} />
                <span className="text-sm font-medium text-bark-700">{PRIORITY_LABELS[issue.priority]}</span>
              </button>
            )}
          </div>

          {/* Assignee */}
          <div className="bg-white rounded-xl border border-bark-200 shadow-sm p-4">
            <label className="text-[10px] uppercase tracking-wider text-bark-500 font-semibold block mb-2">Assignee</label>
            {editingField === 'assignee' ? (
              <div className="space-y-1">
                <button
                  onClick={() => handleAssigneeChange('')}
                  className={cn(
                    'w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    !issue.assigneeId ? 'bg-canopy-50 text-canopy-700' : 'hover:bg-bark-50 text-bark-600'
                  )}
                >
                  Unassigned
                </button>
                {SEED_USERS.map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleAssigneeChange(u.id)}
                    className={cn(
                      'w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2',
                      issue.assigneeId === u.id ? 'bg-canopy-50 text-canopy-700' : 'hover:bg-bark-50 text-bark-600'
                    )}
                  >
                    <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px]', getAvatarColor(u.name))}>
                      {getUserInitials(u.name)}
                    </div>
                    {u.name}
                  </button>
                ))}
                <button
                  onClick={() => setEditingField(null)}
                  className="w-full text-[10px] text-bark-400 mt-1 hover:text-bark-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingField('assignee')}
                className="flex items-center gap-2 hover:ring-2 hover:ring-canopy-200 px-2.5 py-1 rounded-lg transition-all"
              >
                {assignee ? (
                  <>
                    <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-medium', getAvatarColor(assignee.name))}>
                      {getUserInitials(assignee.name)}
                    </div>
                    <span className="text-sm font-medium text-bark-700">{assignee.name}</span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 text-bark-400" />
                    <span className="text-sm text-bark-400">Unassigned</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Sprint */}
          <div className="bg-white rounded-xl border border-bark-200 shadow-sm p-4">
            <label className="text-[10px] uppercase tracking-wider text-bark-500 font-semibold block mb-2">Sprint</label>
            {editingField === 'sprint' ? (
              <div className="space-y-1">
                <button
                  onClick={() => handleSprintChange('')}
                  className={cn(
                    'w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    !issue.sprintId ? 'bg-canopy-50 text-canopy-700' : 'hover:bg-bark-50 text-bark-600'
                  )}
                >
                  No Sprint
                </button>
                {(sprints || []).map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleSprintChange(s.id)}
                    className={cn(
                      'w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                      issue.sprintId === s.id ? 'bg-canopy-50 text-canopy-700' : 'hover:bg-bark-50 text-bark-600'
                    )}
                  >
                    {s.name} {s.status === 'active' && '●'}
                  </button>
                ))}
                <button
                  onClick={() => setEditingField(null)}
                  className="w-full text-[10px] text-bark-400 mt-1 hover:text-bark-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingField('sprint')}
                className="flex items-center gap-2 hover:ring-2 hover:ring-canopy-200 px-2.5 py-1 rounded-lg transition-all"
              >
                <Zap className="w-4 h-4 text-bark-400" />
                <span className="text-sm text-bark-700">{sprint?.name || 'None'}</span>
              </button>
            )}
          </div>

          {/* Epic */}
          <div className="bg-white rounded-xl border border-bark-200 shadow-sm p-4">
            <label className="text-[10px] uppercase tracking-wider text-bark-500 font-semibold block mb-2">Epic</label>
            <div className="flex items-center gap-2 px-2.5 py-1">
              {epic ? (
                <>
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: epic.color }} />
                  <span className="text-sm text-bark-700">{epic.name}</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4 text-bark-400" />
                  <span className="text-sm text-bark-400">None</span>
                </>
              )}
            </div>
          </div>

          {/* Story Points & Type */}
          <div className="bg-white rounded-xl border border-bark-200 shadow-sm p-4 grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-bark-500 font-semibold block mb-2">Points</label>
              <div className="flex items-center gap-2 px-2.5 py-1">
                <Target className="w-4 h-4 text-bark-400" />
                <span className="text-sm font-medium text-bark-700">{issue.storyPoints || '—'}</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-bark-500 font-semibold block mb-2">Type</label>
              <div className="flex items-center gap-2 px-2.5 py-1">
                <TypeIcon className="w-4 h-4 text-bark-400" />
                <span className="text-sm text-bark-700">{TYPE_LABELS[issue.type]}</span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-xl border border-bark-200 shadow-sm p-4">
            <label className="text-[10px] uppercase tracking-wider text-bark-500 font-semibold block mb-2">Created</label>
            <div className="flex items-center gap-2 px-2.5 py-1">
              <Calendar className="w-4 h-4 text-bark-400" />
              <span className="text-sm text-bark-600">{getRelativeTime(issue.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
