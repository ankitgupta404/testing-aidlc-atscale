import { useState } from 'react';
import {
  Plus, X, Pin, Edit2, Trash2, AlertTriangle, Info, AlertOctagon,
} from '../components/icons';
import { useAnnouncements, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement } from '../api/announcements';
import { useToast } from '../context/ToastContext';
import { SEED_USERS } from '../utils/constants';
import { getRelativeTime, getUserName, getUserInitials, getAvatarColor, cn } from '../utils/helpers';
import type { Announcement } from '@canopy/shared';

const PRIORITY_DOT_COLORS: Record<string, string> = {
  info: 'bg-sky',
  warning: 'bg-amber',
  critical: 'bg-rust',
};

const PRIORITY_ICONS: Record<string, React.ReactNode> = {
  info: <Info className="w-4 h-4 text-sky" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber" />,
  critical: <AlertOctagon className="w-4 h-4 text-rust" />,
};

export function AnnouncementsPage() {
  const { addToast } = useToast();

  const { data: announcementsData, isLoading } = useAnnouncements();
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const announcements = announcementsData || [];

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formPriority, setFormPriority] = useState<'info' | 'warning' | 'critical'>('info');
  const [formPinned, setFormPinned] = useState(false);

  // Sort: pinned first, then by date
  const sortedAnnouncements = [...announcements].sort((a: any, b: any) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const resetForm = () => {
    setFormTitle('');
    setFormBody('');
    setFormPriority('info');
    setFormPinned(false);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (announcement: Announcement) => {
    setFormTitle(announcement.title);
    setFormBody(announcement.body);
    setFormPriority(announcement.priority);
    setFormPinned(announcement.pinned);
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      addToast('Announcement deleted', 'success');
    } catch {
      addToast('Failed to delete announcement', 'error');
    }
  };

  const handleSubmit = async () => {
    if (!formTitle.trim() || !formBody.trim()) return;
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          data: {
            title: formTitle.trim(),
            body: formBody.trim(),
            priority: formPriority,
            pinned: formPinned,
          },
        });
        addToast('Announcement updated', 'success');
      } else {
        await createMutation.mutateAsync({
          title: formTitle.trim(),
          body: formBody.trim(),
          priority: formPriority,
          pinned: formPinned,
          authorId: SEED_USERS[0].id,
        });
        addToast('Announcement created', 'success');
      }
      resetForm();
    } catch {
      addToast('Failed to save announcement', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-bark-500 text-sm">Loading announcements...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-bark-900">Announcements</h1>
          <p className="text-sm text-bark-500 mt-1">{announcements.length} announcement{announcements.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-canopy-600 text-white rounded-lg hover:bg-canopy-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="mb-6 bg-white rounded-xl border border-bark-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-bark-800">
              {editingId ? 'Edit Announcement' : 'New Announcement'}
            </h3>
            <button onClick={resetForm} className="text-bark-400 hover:text-bark-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Title"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              className="w-full px-3 py-2 border border-bark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-canopy-500 focus:border-transparent"
            />
            <textarea
              placeholder="Body..."
              value={formBody}
              onChange={e => setFormBody(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-bark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-canopy-500 focus:border-transparent resize-none"
            />
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-bark-600">Priority:</label>
                <select
                  value={formPriority}
                  onChange={e => setFormPriority(e.target.value as 'info' | 'warning' | 'critical')}
                  className="px-3 py-1.5 border border-bark-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-canopy-500"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formPinned}
                  onChange={e => setFormPinned(e.target.checked)}
                  className="rounded border-bark-300 text-canopy-600 focus:ring-canopy-500"
                />
                <span className="text-sm text-bark-600">Pin to top</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={resetForm} className="px-4 py-2 text-sm text-bark-600 hover:text-bark-800 font-medium">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formTitle.trim() || !formBody.trim() || createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-canopy-600 text-white rounded-lg hover:bg-canopy-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingId ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>
      )}

      {/* Announcements feed */}
      <div className="space-y-4">
        {sortedAnnouncements.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-bark-200">
            <Info className="w-12 h-12 text-bark-300 mx-auto mb-3" />
            <h3 className="font-display font-semibold text-bark-700 mb-1">No announcements</h3>
            <p className="text-sm text-bark-500">Create an announcement to share with your team.</p>
          </div>
        ) : (
          sortedAnnouncements.map((announcement: Announcement) => (
            <div
              key={announcement.id}
              className={cn(
                'bg-white rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md',
                announcement.pinned ? 'border-canopy-200 bg-canopy-50/30' : 'border-bark-200'
              )}
            >
              <div className="flex items-start gap-3">
                {/* Priority dot */}
                <div className={cn('w-2.5 h-2.5 rounded-full mt-2 shrink-0', PRIORITY_DOT_COLORS[announcement.priority])} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {announcement.pinned && <Pin className="w-3.5 h-3.5 text-canopy-600 shrink-0" />}
                      <h3 className="font-display font-semibold text-bark-900 truncate">{announcement.title}</h3>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="p-1.5 text-bark-400 hover:text-bark-600 hover:bg-bark-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="p-1.5 text-bark-400 hover:text-rust hover:bg-rust/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-bark-600 mt-1.5 line-clamp-3 whitespace-pre-wrap">{announcement.body}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const name = (announcement as any).author || getUserName(announcement.authorId);
                        return (
                          <>
                            <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-medium', getAvatarColor(name))}>
                              {getUserInitials(name)}
                            </div>
                            <span className="text-xs text-bark-500">{name}</span>
                          </>
                        );
                      })()}
                    </div>
                    <span className="text-xs text-bark-400">{getRelativeTime(announcement.createdAt)}</span>
                    <span className="flex items-center gap-1 text-xs text-bark-500">
                      {PRIORITY_ICONS[announcement.priority]}
                      <span className="capitalize">{announcement.priority}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
