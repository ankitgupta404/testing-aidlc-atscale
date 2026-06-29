import { useParams } from 'react-router-dom';
import { useProject } from '../api/projects';
import { Settings, Database } from '@/components/icons';
import api from '../api/client';
import { useState } from 'react';

export default function SettingsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useProject(projectId);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await api.post<{ success: boolean; message: string }>('/api/seed');
      setSeedResult(res.message || 'Database seeded successfully!');
    } catch (err: any) {
      setSeedResult('Failed to seed: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  if (!project) return null;

  return (
    <div className="max-w-[600px]">
      <h2 className="font-display text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Project Settings
      </h2>

      <div className="bg-surface rounded-xl p-6 border border-border space-y-5 animate-fade-in">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Project Name</label>
          <input
            defaultValue={project.name}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Project Key</label>
          <input
            defaultValue={project.key}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-forest-400"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
          <textarea
            defaultValue={project.description}
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Project Lead</label>
          <input
            defaultValue={project.lead}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
          />
        </div>
        <button className="w-full px-4 py-2.5 bg-forest-900 text-white rounded-lg text-sm font-medium hover:bg-forest-800 transition-colors">
          Save Changes
        </button>
      </div>

      {/* Seed Data Section */}
      <div className="bg-surface rounded-xl p-6 border border-border mt-6 animate-fade-in stagger-2">
        <h3 className="font-display font-semibold text-text-primary mb-2 flex items-center gap-2">
          <Database className="w-4 h-4" />
          Seed Database
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          Populate the database with sample data for demonstration purposes.
        </p>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="px-4 py-2 bg-amber-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50"
        >
          {seeding ? 'Seeding...' : 'Seed Sample Data'}
        </button>
        {seedResult && (
          <p className="text-sm mt-3 text-text-secondary">{seedResult}</p>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-surface rounded-xl p-6 border border-red-200 mt-6 animate-fade-in stagger-3">
        <h3 className="font-display font-semibold text-terra mb-2">Danger Zone</h3>
        <p className="text-sm text-text-secondary mb-4">
          Permanently delete this project and all its data. This action cannot be undone.
        </p>
        <button className="px-4 py-2 border border-terra text-terra rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
          Delete Project
        </button>
      </div>
    </div>
  );
}
