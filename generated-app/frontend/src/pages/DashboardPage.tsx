import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, TrendingUp, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { useProjects } from '../api/projects';
import { useIssues } from '../api/issues';
import { useSprints } from '../api/sprints';
import { useAnnouncements } from '../api/announcements';
import { useProjectContext } from '../context/ProjectContext';
import { DEFAULT_PROJECT_ID, STATUS_LABELS } from '../utils/constants';
import { getRelativeTime } from '../utils/helpers';
import type { Issue } from '@canopy/shared';

export function DashboardPage() {
  const navigate = useNavigate();
  const { currentProject, setCurrentProject } = useProjectContext();
  const { data: projects } = useProjects();
  const projectId = currentProject?.id || (projects && projects.length > 0 ? projects[0].id : DEFAULT_PROJECT_ID);
  const { data: issues } = useIssues(projectId);
  const { data: sprints } = useSprints(projectId);
  const { data: announcements } = useAnnouncements();

  // Auto-set current project
  useEffect(() => {
    if (!currentProject && projects && projects.length > 0) {
      setCurrentProject(projects[0]);
    }
  }, [projects, currentProject, setCurrentProject]);

  const allIssues = issues || [];
  const allSprints = sprints || [];
  const allAnnouncements = announcements || [];
  const activeSprint = allSprints.find(s => s.status === 'active');

  // Calculate stats
  const statusCounts: Record<string, number> = {};
  let totalPoints = 0;
  let completedPoints = 0;
  allIssues.forEach((issue: Issue) => {
    statusCounts[issue.status] = (statusCounts[issue.status] || 0) + 1;
    if (activeSprint && issue.sprintId === activeSprint.id) {
      totalPoints += issue.storyPoints || 0;
      if (issue.status === 'done') completedPoints += issue.storyPoints || 0;
    }
  });

  const sprintProgress = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-bark-900">Dashboard</h1>
        <p className="text-sm text-bark-500 mt-1">
          {currentProject ? `Overview for ${currentProject.name}` : 'Project overview'}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        <StatCard
          icon={<Activity className="w-5 h-5 text-canopy-600" />}
          label="Total Issues"
          value={allIssues.length}
          sublabel="across all sprints"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-canopy-600" />}
          label="Completed"
          value={statusCounts['done'] || 0}
          sublabel={`${allIssues.length > 0 ? Math.round(((statusCounts['done'] || 0) / allIssues.length) * 100) : 0}% done`}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-sky" />}
          label="In Progress"
          value={(statusCounts['in_progress'] || 0) + (statusCounts['in_review'] || 0)}
          sublabel="active work items"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-amber" />}
          label="Sprint Progress"
          value={`${sprintProgress}%`}
          sublabel={activeSprint?.name || 'No active sprint'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sprint summary */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-bark-200 p-6 shadow-sm">
          <h2 className="font-display font-semibold text-bark-900 mb-4">Active Sprint</h2>
          {activeSprint ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-bark-800">{activeSprint.name}</span>
                <span className="text-sm text-bark-500">{sprintProgress}% complete</span>
              </div>
              <div className="w-full h-2 bg-bark-100 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-canopy-500 rounded-full transition-all duration-500"
                  style={{ width: `${sprintProgress}%` }}
                />
              </div>
              {activeSprint.goal && (
                <p className="text-sm text-bark-600 mb-4">Goal: {activeSprint.goal}</p>
              )}
              {/* Status breakdown */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
                {Object.entries(STATUS_LABELS).map(([status, label]) => (
                  <div key={status} className="text-center p-2 rounded-lg bg-bark-50">
                    <div className="text-lg font-display font-bold text-bark-800">{statusCounts[status] || 0}</div>
                    <div className="text-[10px] text-bark-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate(`/projects/${projectId}/board`)}
                className="mt-4 text-sm text-canopy-600 hover:text-canopy-700 font-medium"
              >
                View Board →
              </button>
            </div>
          ) : (
            <p className="text-bark-500 text-sm">No active sprint. Start a sprint to see progress here.</p>
          )}
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-xl border border-bark-200 p-6 shadow-sm">
          <h2 className="font-display font-semibold text-bark-900 mb-4">Announcements</h2>
          <div className="space-y-3">
            {allAnnouncements.slice(0, 3).map(ann => (
              <div key={ann.id} className="p-3 rounded-lg bg-bark-50 border border-bark-100">
                <div className="flex items-start gap-2">
                  {(ann.priority === 'warning' || (ann as any).type === 'warning') && <AlertTriangle className="w-4 h-4 text-amber mt-0.5 shrink-0" />}
                  {(ann.priority === 'critical' || (ann as any).type === 'critical') && <AlertTriangle className="w-4 h-4 text-rust mt-0.5 shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-bark-800 truncate">{ann.title}</p>
                    <p className="text-xs text-bark-500 mt-0.5">{getRelativeTime(ann.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
            {allAnnouncements.length === 0 && (
              <p className="text-sm text-bark-500">No announcements yet.</p>
            )}
          </div>
          <button
            onClick={() => navigate('/announcements')}
            className="mt-3 text-sm text-canopy-600 hover:text-canopy-700 font-medium"
          >
            View all →
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sublabel }: { icon: React.ReactNode; label: string; value: string | number; sublabel: string }) {
  return (
    <div className="bg-white rounded-xl border border-bark-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-bark-50">{icon}</div>
        <span className="text-sm font-medium text-bark-600">{label}</span>
      </div>
      <div className="text-2xl font-display font-bold text-bark-900">{value}</div>
      <div className="text-xs text-bark-500 mt-1">{sublabel}</div>
    </div>
  );
}
