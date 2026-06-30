import { useState } from 'react';
import { X } from './icons';
import { useCreateIssue } from '../api/issues';
import { useProjectContext } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { SEED_USERS, DEFAULT_PROJECT_ID, PRIORITY_LABELS } from '../utils/constants';
import type { IssueType, IssuePriority } from '@canopy/shared';

interface CreateIssueModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateIssueModal({ open, onClose }: CreateIssueModalProps) {
  const { currentProject } = useProjectContext();
  const { addToast } = useToast();
  const createMutation = useCreateIssue();
  const projectId = currentProject?.id || DEFAULT_PROJECT_ID;

  const [title, setTitle] = useState('');
  const [type, setType] = useState<IssueType>('task');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [points, setPoints] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createMutation.mutateAsync({
        projectId,
        data: {
          title: title.trim(),
          type,
          priority,
          status: 'backlog',
          assigneeId: assigneeId || undefined,
          reporterId: localStorage.getItem('canopy-current-user') || SEED_USERS[0].id,
          storyPoints: points ? parseInt(points) : undefined,
          order: 0,
          labels: [],
        },
      });
      addToast('Issue created successfully', 'success');
      setTitle('');
      setType('task');
      setPriority('medium');
      setAssigneeId('');
      setPoints('');
      onClose();
    } catch {
      addToast('Failed to create issue', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      <div className="absolute inset-0 bg-bark-900/40 animate-backdrop" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 animate-scale-in">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-bark-100">
            <h2 className="font-display font-bold text-bark-900 text-lg">Create Issue</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-bark-400 hover:text-bark-600 hover:bg-bark-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-5 py-4 space-y-4">
            <div>
              <input
                type="text"
                autoFocus
                placeholder="Issue title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 border border-bark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-canopy-500 focus:border-transparent font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-bark-500 mb-1.5 uppercase tracking-wider">Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as IssueType)}
                  className="w-full px-3 py-2 border border-bark-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-canopy-500"
                >
                  <option value="task">Task</option>
                  <option value="story">Story</option>
                  <option value="bug">Bug</option>
                  <option value="subtask">Subtask</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-bark-500 mb-1.5 uppercase tracking-wider">Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as IssuePriority)}
                  className="w-full px-3 py-2 border border-bark-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-canopy-500"
                >
                  {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-bark-500 mb-1.5 uppercase tracking-wider">Assignee</label>
                <select
                  value={assigneeId}
                  onChange={e => setAssigneeId(e.target.value)}
                  className="w-full px-3 py-2 border border-bark-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-canopy-500"
                >
                  <option value="">Unassigned</option>
                  {SEED_USERS.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-bark-500 mb-1.5 uppercase tracking-wider">Points</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="–"
                  value={points}
                  onChange={e => setPoints(e.target.value)}
                  className="w-full px-3 py-2 border border-bark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-canopy-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-5 py-4 border-t border-bark-100">
            <span className="text-xs text-bark-400">Press <kbd className="px-1 py-0.5 rounded bg-bark-100 border border-bark-200 text-bark-600 font-mono text-[10px]">Esc</kbd> to cancel</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-bark-600 hover:text-bark-800 font-medium rounded-lg hover:bg-bark-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || createMutation.isPending}
                className="px-4 py-2 bg-canopy-600 text-white rounded-lg hover:bg-canopy-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Issue'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
