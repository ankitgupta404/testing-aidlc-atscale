import { useParams } from 'react-router-dom';
import { Calendar, Target, Play, CheckCircle2, Trash2 } from '@/components/icons';
import { useSprints, useStartSprint, useCompleteSprint } from '../api/sprints';
import { useIssues } from '../api/issues';
import { formatDateRange } from '../utils/formatters';

export default function SprintPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: sprints, isLoading } = useSprints(projectId);
  const { data: issueData } = useIssues(projectId);
  const startSprint = useStartSprint();
  const completeSprint = useCompleteSprint();

  const issues = issueData?.issues || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-surface rounded-xl p-6 border border-border">
            <div className="skeleton h-5 w-32 mb-2" />
            <div className="skeleton h-4 w-48" />
          </div>
        ))}
      </div>
    );
  }

  const sortedSprints = (sprints || []).sort((a, b) => {
    const order = { active: 0, planning: 1, completed: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  return (
    <div className="max-w-[900px] space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display text-xl font-bold text-text-primary">Sprints</h2>
      </div>

      {sortedSprints.map((sprint, idx) => {
        const sprintIssues = issues.filter(i => i.sprintId === sprint.id);
        const totalPoints = sprintIssues.reduce((s, i) => s + (i.storyPoints || 0), 0);
        const completedPoints = sprintIssues.filter(i => i.status === 'done').reduce((s, i) => s + (i.storyPoints || 0), 0);
        const progress = totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0;

        return (
          <div key={sprint.id} className={`bg-surface rounded-xl p-6 border border-border animate-fade-in stagger-${idx + 1}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-semibold text-text-primary">{sprint.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    sprint.status === 'active' ? 'bg-amber-100 text-amber-700' :
                    sprint.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {sprint.status}
                  </span>
                </div>
                {sprint.goal && <p className="text-sm text-text-secondary">{sprint.goal}</p>}
                <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateRange(sprint.startDate, sprint.endDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" />
                    {sprintIssues.length} issues • {totalPoints} pts
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {sprint.status === 'planning' && (
                  <button
                    onClick={() => projectId && startSprint.mutate({ projectId, sprintId: sprint.id })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-forest-900 text-white rounded-lg text-xs font-medium hover:bg-forest-800 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Start Sprint
                  </button>
                )}
                {sprint.status === 'active' && (
                  <button
                    onClick={() => projectId && completeSprint.mutate({ projectId, sprintId: sprint.id })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-status-done text-white rounded-lg text-xs font-medium hover:opacity-90 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Complete
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {sprint.status !== 'planning' && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-text-muted mb-1">
                  <span>{completedPoints} of {totalPoints} pts completed</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-forest-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-forest-900 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
