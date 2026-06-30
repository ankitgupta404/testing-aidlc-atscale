import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, TrendingUp, CheckCircle2, Clock, AlertTriangle, Target,
} from '../components/icons';
import { useProjects } from '../api/projects';
import { useIssues } from '../api/issues';
import { useSprints } from '../api/sprints';
import { useAnnouncements } from '../api/announcements';
import { useProjectContext } from '../context/ProjectContext';
import { DEFAULT_PROJECT_ID, STATUS_LABELS, SEED_USERS } from '../utils/constants';
import { getRelativeTime, getUserInitials, getAvatarColor, cn } from '../utils/helpers';
import type { Issue, Sprint } from '@canopy/shared';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, LineChart, Line, Legend,
} from 'recharts';

const STATUS_CHART_COLORS: Record<string, string> = {
  backlog: '#a8a29e',
  todo: '#0284c7',
  in_progress: '#d97706',
  in_review: '#7c3aed',
  done: '#16a34a',
  cancelled: '#dc2626',
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { currentProject, setCurrentProject } = useProjectContext();
  const { data: projects } = useProjects();
  const projectId = currentProject?.id || DEFAULT_PROJECT_ID;
  const { data: issues, isLoading: issuesLoading } = useIssues(projectId);
  const { data: sprints, isLoading: sprintsLoading } = useSprints(projectId);
  const { data: announcements } = useAnnouncements();
  const isLoading = issuesLoading || sprintsLoading;

  // Auto-set current project
  useEffect(() => {
    if (!currentProject && projects && projects.length > 0) {
      const defaultProj = projects.find(p => p.id === DEFAULT_PROJECT_ID);
      setCurrentProject(defaultProj || projects[0]);
    }
  }, [projects, currentProject, setCurrentProject]);

  const allIssues = issues || [];
  const allSprints = sprints || [];
  const allAnnouncements = announcements || [];
  const activeSprint = allSprints.find(s => s.status === 'active');

  // Status distribution
  const statusCounts: Record<string, number> = {};
  let totalPoints = 0;
  let completedPoints = 0;
  let activeSprintIssues: Issue[] = [];

  allIssues.forEach((issue: Issue) => {
    statusCounts[issue.status] = (statusCounts[issue.status] || 0) + 1;
    if (activeSprint && issue.sprintId === activeSprint.id) {
      activeSprintIssues.push(issue);
      totalPoints += issue.storyPoints || 0;
      if (issue.status === 'done') completedPoints += issue.storyPoints || 0;
    }
  });

  const sprintProgress = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  // Pie chart data
  const pieData = Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      color: STATUS_CHART_COLORS[status] || '#a8a29e',
    }));

  // Velocity chart data (simulated from sprint data)
  const velocityData = allSprints
    .filter(s => s.status === 'completed' || s.status === 'active')
    .slice(0, 5)
    .map((s: Sprint) => {
      const sprintIssues = allIssues.filter((i: Issue) => i.sprintId === s.id);
      const committed = sprintIssues.reduce((sum: number, i: Issue) => sum + (i.storyPoints || 0), 0);
      const completed = sprintIssues
        .filter((i: Issue) => i.status === 'done')
        .reduce((sum: number, i: Issue) => sum + (i.storyPoints || 0), 0);
      return { name: s.name.replace('Sprint ', 'S'), committed, completed };
    });

  // Burndown data (simulated - 14 day sprint)
  const burndownData = (() => {
    if (!activeSprint || totalPoints === 0) return [];
    const days = 14;
    const dailyIdeal = totalPoints / days;
    return Array.from({ length: days }, (_, i) => ({
      day: `Day ${i + 1}`,
      ideal: Math.max(0, Math.round((totalPoints - dailyIdeal * (i + 1)) * 10) / 10),
      actual: Math.max(0, Math.round((totalPoints - (completedPoints * (i + 1) / days * 0.8 + Math.random() * 3)) * 10) / 10),
    }));
  })();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="mb-6">
          <div className="h-7 w-40 bg-bark-200 rounded animate-pulse" />
          <div className="h-4 w-56 bg-bark-100 rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-bark-200 p-5 shadow-sm animate-pulse" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-bark-100 rounded-lg" />
                <div className="h-3 w-20 bg-bark-100 rounded" />
              </div>
              <div className="h-7 w-16 bg-bark-200 rounded" />
              <div className="h-3 w-24 bg-bark-100 rounded mt-2" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-bark-200 p-5 shadow-sm h-52 animate-pulse" />
          <div className="bg-white rounded-xl border border-bark-200 p-5 shadow-sm h-52 animate-pulse" style={{ animationDelay: '100ms' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-bark-900">Dashboard</h1>
        <p className="text-sm text-bark-500 mt-0.5">
          {currentProject ? `Overview for ${currentProject.name}` : 'Project overview'}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
        <StatCard
          icon={<Activity className="w-5 h-5 text-canopy-600" />}
          label="Total Issues"
          value={allIssues.length}
          sublabel="across all sprints"
          accent="bg-canopy-50"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-canopy-600" />}
          label="Completed"
          value={statusCounts['done'] || 0}
          sublabel={`${allIssues.length > 0 ? Math.round(((statusCounts['done'] || 0) / allIssues.length) * 100) : 0}% done`}
          accent="bg-canopy-50"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-[#0284c7]" />}
          label="In Progress"
          value={(statusCounts['in_progress'] || 0) + (statusCounts['in_review'] || 0)}
          sublabel="active work items"
          accent="bg-sky-50"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-[#d97706]" />}
          label="Sprint Progress"
          value={`${sprintProgress}%`}
          sublabel={activeSprint?.name || 'No active sprint'}
          accent="bg-amber-50"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Pie Chart */}
        <div className="bg-white rounded-xl border border-bark-200 p-5 shadow-sm">
          <h2 className="font-display font-semibold text-bark-900 text-sm mb-4">Status Distribution</h2>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="w-[160px] h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} issues`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {pieData.map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-bark-600">{item.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-bark-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-bark-400 text-center py-8">No issues yet</p>
          )}
        </div>

        {/* Velocity Chart */}
        <div className="bg-white rounded-xl border border-bark-200 p-5 shadow-sm">
          <h2 className="font-display font-semibold text-bark-900 text-sm mb-4">Sprint Velocity</h2>
          {velocityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={velocityData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#78716c' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#78716c' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e7e5e4' }}
                  formatter={(value, name) => [value + ' pts', name === 'committed' ? 'Committed' : 'Completed']}
                />
                <Bar dataKey="committed" fill="#bbf7d0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-bark-400 text-center py-8">No sprint data yet</p>
          )}
        </div>
      </div>

      {/* Burndown + Sprint Summary + Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Burndown Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-bark-200 p-5 shadow-sm">
          <h2 className="font-display font-semibold text-bark-900 text-sm mb-4">
            {activeSprint ? `${activeSprint.name} — Burndown` : 'Sprint Burndown'}
          </h2>
          {burndownData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={burndownData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#78716c' }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fontSize: 11, fill: '#78716c' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e7e5e4' }}
                  formatter={(value) => [value + ' pts']}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="ideal" stroke="#a8a29e" strokeDasharray="5 5" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="actual" stroke="#16a34a" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <Target className="w-8 h-8 text-bark-300 mx-auto mb-2" />
              <p className="text-sm text-bark-500">No active sprint. Start a sprint to see burndown data.</p>
            </div>
          )}

          {/* Active Sprint summary below chart */}
          {activeSprint && (
            <div className="mt-4 pt-4 border-t border-bark-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-bark-700">{activeSprint.name}</span>
                <span className="text-xs text-bark-500">{sprintProgress}% complete</span>
              </div>
              <div className="w-full h-2 bg-bark-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-canopy-500 rounded-full transition-all duration-700"
                  style={{ width: `${sprintProgress}%` }}
                />
              </div>
              {activeSprint.goal && (
                <p className="text-xs text-bark-500 mt-2 italic">Goal: {activeSprint.goal}</p>
              )}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
                {Object.entries(STATUS_LABELS).map(([status, label]) => (
                  <div key={status} className="text-center p-1.5 rounded-lg bg-bark-50">
                    <div className="text-base font-display font-bold text-bark-800">{statusCounts[status] || 0}</div>
                    <div className="text-[9px] text-bark-500 mt-0.5 truncate">{label}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate(`/projects/${projectId}/board`)}
                className="mt-3 text-xs text-canopy-600 hover:text-canopy-700 font-medium"
              >
                View Board →
              </button>
            </div>
          )}
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-xl border border-bark-200 p-5 shadow-sm">
          <h2 className="font-display font-semibold text-bark-900 text-sm mb-4">Announcements</h2>
          <div className="space-y-3">
            {allAnnouncements.slice(0, 4).map(ann => (
              <div key={ann.id} className="p-3 rounded-lg bg-bark-50 border border-bark-100 hover:border-bark-200 transition-colors">
                <div className="flex items-start gap-2">
                  {(ann.priority === 'warning' || (ann as any).type === 'warning') && (
                    <AlertTriangle className="w-3.5 h-3.5 text-[#d97706] mt-0.5 shrink-0" />
                  )}
                  {(ann.priority === 'critical' || (ann as any).type === 'critical') && (
                    <AlertTriangle className="w-3.5 h-3.5 text-[#dc2626] mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-bark-800 truncate">{ann.title}</p>
                    <p className="text-[10px] text-bark-500 mt-0.5">{getRelativeTime(ann.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
            {allAnnouncements.length === 0 && (
              <p className="text-sm text-bark-400 italic text-center py-4">No announcements yet.</p>
            )}
          </div>
          <button
            onClick={() => navigate('/announcements')}
            className="mt-3 text-xs text-canopy-600 hover:text-canopy-700 font-medium"
          >
            View all →
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sublabel, accent }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-bark-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('p-2 rounded-lg', accent)}>{icon}</div>
        <span className="text-xs font-medium text-bark-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-display font-bold text-bark-900">{value}</div>
      <div className="text-xs text-bark-500 mt-0.5">{sublabel}</div>
    </div>
  );
}
