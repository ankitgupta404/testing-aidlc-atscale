import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, X, Hexagon } from '../components/icons';
import { useEpics, useCreateEpic } from '../api/epics';
import { useProjectContext } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { DEFAULT_PROJECT_ID } from '../utils/constants';
import { cn } from '../utils/helpers';
import type { Epic, EpicStatus } from '@canopy/shared';

const EPIC_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  done: 'Done',
};

const EPIC_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-bark-100 text-bark-600',
  in_progress: 'bg-canopy-100 text-canopy-700',
  done: 'bg-canopy-200 text-canopy-800',
};

const DEFAULT_COLORS = [
  '#4a9a6e', '#6b8f71', '#d4a843', '#b5623a', '#5b8fa8',
  '#8b6da8', '#7a9e7e', '#c4784a', '#4d7a9e', '#a3714e',
];

export function EpicsPage() {
  const { projectId: paramProjectId } = useParams();
  const { currentProject } = useProjectContext();
  const { addToast } = useToast();
  const projectId = paramProjectId || currentProject?.id || DEFAULT_PROJECT_ID;

  const { data: epicsData, isLoading } = useEpics(projectId);
  const createEpicMutation = useCreateEpic();

  const epics = epicsData || [];

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState(DEFAULT_COLORS[0]);
  const [formStatus, setFormStatus] = useState<EpicStatus>('draft');

  const handleCreateEpic = async () => {
    if (!formName.trim()) return;
    try {
      await createEpicMutation.mutateAsync({
        projectId,
        data: {
          name: formName.trim(),
          description: formDescription.trim() || undefined,
          color: formColor,
          status: formStatus,
        },
      });
      addToast('Epic created successfully', 'success');
      setFormName('');
      setFormDescription('');
      setFormColor(DEFAULT_COLORS[0]);
      setFormStatus('draft');
      setShowCreateModal(false);
    } catch {
      addToast('Failed to create epic', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-bark-500 text-sm">Loading epics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-bark-900">Epics</h1>
          <p className="text-sm text-bark-500 mt-1">{epics.length} epic{epics.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-canopy-600 text-white rounded-lg hover:bg-canopy-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Epic
        </button>
      </div>

      {/* Epics grid */}
      {epics.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-bark-200">
          <Hexagon className="w-12 h-12 text-bark-300 mx-auto mb-3" />
          <h3 className="font-display font-semibold text-bark-700 mb-1">No epics yet</h3>
          <p className="text-sm text-bark-500">Create an epic to group related issues together.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {epics.map((epic: Epic) => {
            // Mock progress - 60% for demo
            const progress = 60;
            return (
              <div
                key={epic.id}
                className="bg-white rounded-xl border border-bark-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Color left border */}
                <div className="flex">
                  <div className="w-1.5 shrink-0" style={{ backgroundColor: epic.color }} />
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-display font-semibold text-bark-900 leading-tight">{epic.name}</h3>
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0', EPIC_STATUS_COLORS[epic.status])}>
                        {EPIC_STATUS_LABELS[epic.status]}
                      </span>
                    </div>
                    {epic.description && (
                      <p className="text-sm text-bark-600 mb-4 line-clamp-2">{epic.description}</p>
                    )}
                    {/* Progress bar */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs text-bark-500 mb-1">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-bark-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${progress}%`, backgroundColor: epic.color }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Epic Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-bark-900/40" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-bark-900 text-lg">Create Epic</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-bark-400 hover:text-bark-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-bark-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Epic name"
                  className="w-full px-3 py-2 border border-bark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-canopy-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-bark-700 mb-1">Description (optional)</label>
                <textarea
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Describe the epic..."
                  rows={3}
                  className="w-full px-3 py-2 border border-bark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-canopy-500 focus:border-transparent resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-bark-700 mb-1">Color</label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormColor(color)}
                      className={cn(
                        'w-8 h-8 rounded-full transition-transform',
                        formColor === color ? 'ring-2 ring-offset-2 ring-canopy-500 scale-110' : 'hover:scale-105'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-bark-700 mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as EpicStatus)}
                  className="w-full px-3 py-2 border border-bark-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-canopy-500"
                >
                  {Object.entries(EPIC_STATUS_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
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
                onClick={handleCreateEpic}
                disabled={!formName.trim() || createEpicMutation.isPending}
                className="px-4 py-2 bg-canopy-600 text-white rounded-lg hover:bg-canopy-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                {createEpicMutation.isPending ? 'Creating...' : 'Create Epic'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
