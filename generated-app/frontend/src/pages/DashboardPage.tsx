import { useProjectContext } from '../context/ProjectContext';
import { useDashboard, useBurndown, useVelocity } from '../api/dashboard';
import { useSprints } from '../api/sprints';
import { useAnnouncements } from '../api/announcements';
import { BarChart3, CheckCircle2, Circle, TrendingUp, Megaphone } from '@/components/icons';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { timeAgo } from '../utils/formatters';
import { STATUS_CONFIG } from '../utils/constants';

export default function DashboardPage() {
  const { currentProjectId } = useProjectContext();
  const { data: stats, isLoading } = useDashboard(currentProjectId);
  const { data: sprints } = useSprints(currentProjectId);
  const activeSprint = sprints?.find(s => s.status === 'active');
  const { data: burndownData } = useBurndown(currentProjectId, activeSprint?.id);
  const { data: velocityData } = useVelocity(currentProjectId);
  const { data: announcements } = useAnnouncements();

  const pinnedAnnouncements = announcements?.filter(a => a.pinned) || [];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-surface rounded-xl p-5 border border-border">
              <div className="skeleton h-4 w-20 mb-3" />
              <div className="skeleton h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: 'Total Issues', value: stats.totalIssues, icon: BarChart3, color: 'text-forest-900' },
    { label: 'In Progress', value: stats.inProgressIssues, icon: Circle, color: 'text-status-progress' },
    { label: 'Completed', value: stats.completedIssues, icon: CheckCircle2, color: 'text-status-done' },
    { label: 'Story Points', value: `${stats.completedStoryPoints}/${stats.totalStoryPoints}`, icon: TrendingUp, color: 'text-amber-accent' },
  ];

  const pieData = Object.entries(stats.issuesByType).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ['#2563EB', '#DC2626', '#16A34A', '#7C3AED'];

  return (
    <div className="space-y-6 max-w-[1280px]">
      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <div className="bg-forest-100 border border-forest-300 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
          <Megaphone className="w-5 h-5 text-forest-700 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-forest-900 text-sm">{pinnedAnnouncements[0].title}</p>
            <p className="text-forest-700 text-sm mt-0.5">{pinnedAnnouncements[0].body}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={card.label}
            className={`bg-surface rounded-xl p-5 border border-border hover:shadow-md transition-shadow animate-fade-in stagger-${idx + 1}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm font-medium">{card.label}</span>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="mt-2 text-2xl font-display font-bold text-text-primary">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Burndown Chart */}
        <div className="bg-surface rounded-xl p-5 border border-border animate-fade-in stagger-3">
          <h3 className="font-display font-semibold text-text-primary mb-4">Sprint Burndown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={burndownData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8F0E8" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="ideal" stroke="#9DB4AB" strokeDasharray="5 5" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="actual" stroke="#1B4332" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Velocity Chart */}
        <div className="bg-surface rounded-xl p-5 border border-border animate-fade-in stagger-4">
          <h3 className="font-display font-semibold text-text-primary mb-4">Velocity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={velocityData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8F0E8" />
              <XAxis dataKey="sprintName" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="committed" fill="#95D5B2" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill="#1B4332" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issues by Type */}
        <div className="bg-surface rounded-xl p-5 border border-border animate-fade-in stagger-5">
          <h3 className="font-display font-semibold text-text-primary mb-4">Issues by Type</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" paddingAngle={2}>
                {pieData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                <span className="capitalize text-text-secondary">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-surface rounded-xl p-5 border border-border col-span-1 lg:col-span-2 animate-fade-in stagger-6">
          <h3 className="font-display font-semibold text-text-primary mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-[280px] overflow-y-auto">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'completed' ? 'bg-status-done' : 'bg-status-progress'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">
                    <span className="font-mono text-xs text-forest-600 mr-1.5">{activity.issueKey}</span>
                    {activity.issueTitle}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {activity.actor} • {timeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
