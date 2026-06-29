import { useParams } from 'react-router-dom';
import { Target } from '@/components/icons';
import { useEpics } from '../api/epics';
import { useIssues } from '../api/issues';
import { formatDateRange } from '../utils/formatters';

export default function EpicsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: epics, isLoading } = useEpics(projectId);
  const { data: issueData } = useIssues(projectId);

  const issues = issueData?.issues || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-surface rounded-xl p-6 border border-border">
            <div className="skeleton h-5 w-32 mb-2" />
            <div className="skeleton h-4 w-full mb-2" />
            <div className="skeleton h-3 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-[1280px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-text-primary">Epics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {epics?.map((epic, idx) => {
          const epicIssues = issues.filter(i => i.epicId === epic.id);
          const doneIssues = epicIssues.filter(i => i.status === 'done').length;
          const progress = epicIssues.length > 0 ? (doneIssues / epicIssues.length) * 100 : 0;

          return (
            <div key={epic.id} className={`bg-surface rounded-xl border border-border overflow-hidden animate-fade-in stagger-${idx + 1}`}>
              <div className="h-1.5" style={{ backgroundColor: epic.color }} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-display font-semibold text-text-primary">{epic.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    epic.status === 'done' ? 'bg-green-100 text-green-700' :
                    epic.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {epic.status.replace('_', ' ')}
                  </span>
                </div>
                {epic.description && (
                  <p className="text-sm text-text-secondary line-clamp-2 mb-3">{epic.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
                  <Target className="w-3.5 h-3.5" />
                  <span>{epicIssues.length} issues</span>
                  <span>•</span>
                  <span>{doneIssues} done</span>
                </div>
                {/* Progress */}
                <div className="h-2 bg-forest-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, backgroundColor: epic.color }}
                  />
                </div>
                <p className="text-xs text-text-muted mt-1.5">{Math.round(progress)}% complete</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
