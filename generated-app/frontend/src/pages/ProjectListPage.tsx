import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderKanban, Search } from 'lucide-react';
import { useProjects, useCreateProject } from '../api/projects';
import { useProjectContext } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { getRelativeTime } from '../utils/helpers';
import type { Project } from '@canopy/shared';

export function ProjectListPage() {
  const navigate = useNavigate();
  const { setCurrentProject } = useProjectContext();
  const { data, isLoading } = useProjects();
  const createProject = useCreateProject();
  const { addToast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ name: '', key: '', description: '' });

  const projects = data || [];
  const filtered = projects.filter((p: any) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.key?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject.mutateAsync({
        name: formData.name,
        key: formData.key.toUpperCase(),
        description: formData.description || undefined,
        status: 'active',
      });
      setShowCreate(false);
      setFormData({ name: '', key: '', description: '' });
      addToast('Project created!', 'success');
    } catch {
      addToast('Failed to create project', 'error');
    }
  };

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    navigate(`/projects/${project.id}/board`);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-bark-900">Projects</h1>
          <p className="text-sm text-bark-500 mt-1">{projects.length} projects</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-canopy-600 text-white rounded-lg
            text-sm font-medium hover:bg-canopy-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bark-400" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-bark-200 rounded-lg text-sm
            placeholder:text-bark-400 focus:border-canopy-300 focus:ring-1 focus:ring-canopy-300 outline-none"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 rounded-xl shimmer" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filtered.map(project => (
            <button
              key={project.id}
              onClick={() => handleSelectProject(project)}
              className="text-left bg-white rounded-xl border border-bark-200 p-5 shadow-sm
                hover:shadow-md hover:border-canopy-200 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-canopy-50 group-hover:bg-canopy-100 transition-colors">
                  <FolderKanban className="w-5 h-5 text-canopy-600" />
                </div>
                <span className="px-2 py-0.5 text-xs font-mono font-medium bg-bark-100 text-bark-600 rounded">
                  {project.key}
                </span>
              </div>
              <h3 className="font-display font-semibold text-bark-900 mb-1">{project.name}</h3>
              {project.description && (
                <p className="text-sm text-bark-500 line-clamp-2 mb-3">{project.description}</p>
              )}
              <div className="text-xs text-bark-400">Updated {getRelativeTime(project.updatedAt)}</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FolderKanban className="w-12 h-12 text-bark-300 mx-auto mb-3" />
          <p className="text-bark-600 font-medium">No projects found</p>
          <p className="text-sm text-bark-500 mt-1">Create your first project to get started</p>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreate(false)} />
          <form
            onSubmit={handleCreate}
            className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-scale-in"
          >
            <h2 className="text-lg font-display font-semibold mb-4">Create Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-bark-700 mb-1">Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-bark-200 rounded-lg text-sm outline-none
                    focus:border-canopy-300 focus:ring-1 focus:ring-canopy-300"
                  placeholder="My Project"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-bark-700 mb-1">Key (2-10 uppercase letters)</label>
                <input
                  required
                  pattern="[A-Z]{2,10}"
                  value={formData.key}
                  onChange={e => setFormData(prev => ({ ...prev, key: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 border border-bark-200 rounded-lg text-sm font-mono outline-none
                    focus:border-canopy-300 focus:ring-1 focus:ring-canopy-300"
                  placeholder="PROJ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-bark-700 mb-1">Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-bark-200 rounded-lg text-sm outline-none resize-none
                    focus:border-canopy-300 focus:ring-1 focus:ring-canopy-300"
                  rows={3}
                  placeholder="What is this project about?"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm text-bark-600 hover:bg-bark-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createProject.isPending}
                className="px-4 py-2 bg-canopy-600 text-white text-sm font-medium rounded-lg
                  hover:bg-canopy-700 transition-colors disabled:opacity-50"
              >
                {createProject.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
