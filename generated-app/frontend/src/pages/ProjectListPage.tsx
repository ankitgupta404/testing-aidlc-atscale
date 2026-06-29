import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderKanban } from '@/components/icons';
import { useProjects, useCreateProject } from '../api/projects';
import { useProjectContext } from '../context/ProjectContext';
import { timeAgo } from '../utils/formatters';

export default function ProjectListPage() {
  const { data: projects, isLoading } = useProjects();
  const { setCurrentProjectId } = useProjectContext();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const createProject = useCreateProject();
  const [form, setForm] = useState({ name: '', key: '', description: '', lead: 'Sarah Chen' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject.mutateAsync(form);
      setShowCreate(false);
      setForm({ name: '', key: '', description: '', lead: 'Sarah Chen' });
    } catch (err) {
      // handled by query
    }
  };

  const handleKeyFromName = (name: string) => {
    const key = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4);
    setForm(f => ({ ...f, name, key }));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-surface rounded-xl p-6 border border-border">
            <div className="skeleton h-5 w-32 mb-3" />
            <div className="skeleton h-4 w-full mb-2" />
            <div className="skeleton h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-[1280px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold text-text-primary">Projects</h2>
          <p className="text-sm text-text-secondary mt-1">Manage and navigate your team projects</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-forest-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-forest-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {projects && projects.length === 0 && !showCreate && (
        <div className="text-center py-16 animate-fade-in">
          <FolderKanban className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="font-display font-semibold text-text-primary mb-2">No projects yet</h3>
          <p className="text-text-secondary text-sm mb-4">Create your first project to get started</p>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-forest-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-forest-800 transition-colors"
          >
            Create Project
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects?.map((project, idx) => (
          <div
            key={project.id}
            onClick={() => {
              setCurrentProjectId(project.id);
              navigate(`/projects/${project.id}/board`);
            }}
            className={`bg-surface rounded-xl p-6 border border-border hover:shadow-lg hover:border-forest-300 cursor-pointer transition-all duration-200 animate-fade-in stagger-${idx + 1}`}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm"
                style={{ backgroundColor: project.avatarColor }}
              >
                {project.key}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-text-primary truncate">{project.name}</h3>
                <p className="text-xs text-text-secondary mt-0.5">Lead: {project.lead}</p>
              </div>
            </div>
            {project.description && (
              <p className="text-sm text-text-secondary mt-3 line-clamp-2">{project.description}</p>
            )}
            <div className="flex items-center gap-3 mt-4 text-xs text-text-muted">
              <span>{project.issueCounter} issues</span>
              <span>•</span>
              <span>Updated {timeAgo(project.updatedAt)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowCreate(false)}>
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-semibold text-lg mb-4">Create Project</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Project Name</label>
                <input
                  value={form.name}
                  onChange={e => handleKeyFromName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                  placeholder="My Project"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Key</label>
                <input
                  value={form.key}
                  onChange={e => setForm(f => ({ ...f, key: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-forest-400"
                  placeholder="PROJ"
                  maxLength={10}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 resize-none"
                  rows={3}
                  placeholder="Brief description..."
                />
              </div>
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
