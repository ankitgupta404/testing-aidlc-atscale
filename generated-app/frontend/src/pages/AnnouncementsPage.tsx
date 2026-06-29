import { useState } from 'react';
import { Plus, Pin, AlertTriangle, Info, CheckCircle2, AlertCircle, Trash2 } from '@/components/icons';
import { useAnnouncements, useCreateAnnouncement, useDeleteAnnouncement, useUpdateAnnouncement } from '../api/announcements';
import { timeAgo } from '../utils/formatters';
import type { AnnouncementType } from '@canopy/shared';

const TYPE_ICONS = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  critical: AlertCircle,
};

const TYPE_STYLES = {
  info: 'border-l-blue-500 bg-blue-50',
  warning: 'border-l-amber-500 bg-amber-50',
  success: 'border-l-green-500 bg-green-50',
  critical: 'border-l-red-500 bg-red-50',
};

export default function AnnouncementsPage() {
  const { data: announcements, isLoading } = useAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [form, setForm] = useState({ title: '', body: '', type: 'info' as AnnouncementType, pinned: false });

  const filtered = (announcements || [])
    .filter(a => filter === 'all' || (filter === 'pinned' ? a.pinned : a.type === filter))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAnnouncement.mutateAsync({ ...form, author: 'Sarah Chen' });
    setShowCreate(false);
    setForm({ title: '', body: '', type: 'info', pinned: false });
  };

  const handleTogglePin = (id: string, currentPinned: boolean) => {
    updateAnnouncement.mutate({ id, pinned: !currentPinned });
  };

  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>;
  }

  return (
    <div className="max-w-[800px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-text-primary">Announcements</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-forest-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-forest-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['all', 'info', 'warning', 'success', 'critical', 'pinned'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              filter === tab ? 'bg-forest-900 text-white' : 'bg-surface border border-border text-text-secondary hover:bg-forest-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Announcement Cards */}
      <div className="space-y-3">
        {filtered.map((ann, idx) => {
          const Icon = TYPE_ICONS[ann.type];
          return (
            <div key={ann.id} className={`bg-surface rounded-xl border-l-4 border border-border p-5 ${TYPE_STYLES[ann.type]} animate-fade-in stagger-${Math.min(idx + 1, 6)}`}>
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 mt-0.5 text-text-secondary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold text-text-primary">{ann.title}</h3>
                    {ann.pinned && <Pin className="w-3.5 h-3.5 text-amber-accent" />}
                  </div>
                  <p className="text-sm text-text-secondary mt-1 leading-relaxed">{ann.body}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-text-muted">
                    <span>{ann.author}</span>
                    <span>•</span>
                    <span>{timeAgo(ann.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleTogglePin(ann.id, ann.pinned)}
                    className={`p-1.5 rounded-md hover:bg-white/50 transition-colors ${ann.pinned ? 'text-amber-accent' : 'text-text-muted'}`}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteAnnouncement.mutate(ann.id)}
                    className="p-1.5 rounded-md hover:bg-white/50 text-text-muted hover:text-terra transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowCreate(false)}>
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-semibold text-lg mb-4">New Announcement</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Title</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Body</label>
                <textarea
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 resize-none"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as AnnouncementType }))}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.pinned}
                  onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))}
                  className="rounded border-border"
                />
                Pin this announcement
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-forest-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-forest-900 text-white rounded-lg text-sm font-medium hover:bg-forest-800 transition-colors">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
