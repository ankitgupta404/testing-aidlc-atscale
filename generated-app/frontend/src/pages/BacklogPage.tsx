import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Plus, Search } from '@/components/icons';
import { useIssues } from '../api/issues';
import { useSprints } from '../api/sprints';
import { STATUS_CONFIG, PRIORITY_CONFIG, TYPE_CONFIG } from '../utils/constants';
import { getInitials } from '../utils/formatters';
import type { Issue } from '@canopy/shared';

function IssueRow({ issue, onClick }: { issue: Issue; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-forest-50 cursor-pointer border-b border-border last:border-0 transition-colors"
    >
      <span className="text-sm">{TYPE_CONFIG[issue.type].icon}</span>
      <span className="font-mono text-xs text-text-muted w-16">{issue.key}</span>
      <span className="flex-1 text-sm text-text-primary truncate">{issue.title}</span>
      <span className={`w-2 h-2 rounded-full ${PRIORITY_CONFIG[issue.priority].color}`} />
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        issue.status === 'done' ? 'bg-green-100 text-green-700' :
        issue.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
        issue.status === 'in_review' ? 'bg-purple-100 text-purple-700' :
        'bg-gray-100 text-gray-700'
      }`}>
        {STATUS_CONFIG[issue.status].label}
      </span>
      {issue.storyPoints && (
        <span className="text-[11px] font-mono bg-forest-100 text-forest-700 px-1.5 py-0.5 rounded w-8 text-center">
          {issue.storyPoints}
        </span>
      )}
      {issue.assignee ? (
        <div className="w-6 h-6 rounded-full bg-forest-600 flex items-center justify-center text-white text-[10px] font-semibold" title={issue.assignee}>
          {getInitials(issue.assignee)}
        </div>
      ) : (
        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-[10px]">?</div>
      )}
    </div>
  );
}

export default function BacklogPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: issueData } = useIssues(projectId);
  const { data: sprints } = useSprints(projectId);
  const [expandedSprints, setExpandedSprints] = useState<Set<string>>(new Set(['active', 'planning']));
  const [search, setSearch] = useState('');

  const issues = issueData?.issues || [];
  const sortedSprints = (sprints || []).sort((a, b) => {
    const order = { active: 0, planning: 1, completed: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  const toggleSprint = (id: string) => {
    setExpandedSprints(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredIssues = search
    ? issues.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.key.toLowerCase().includes(search.toLowerCase()))
    : issues;

  const backlogIssues = filteredIssues.filter(i => !i.sprintId);

  return (
    <div className="max-w-[1280px]">
      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search issues..."
            data-testid="backlog-search"
            className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
          />
        </div>
        <button
          data-testid="create-issue-btn"
          className="flex items-center gap-2 bg-forest-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-forest-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Issue
        </button>
      </div>

      {/* Sprint Sections */}
      <div className="space-y-3">
        {sortedSprints.map(sprint => {
          const sprintIssues = filteredIssues.filter(i => i.sprintId === sprint.id);
          const totalPoints = sprintIssues.reduce((s, i) => s + (i.storyPoints || 0), 0);
          const isExpanded = expandedSprints.has(sprint.status);

          return (
            <div key={sprint.id} className="bg-surface border border-border rounded-xl overflow-hidden animate-fade-in">
              <div
                onClick={() => toggleSprint(sprint.status)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-forest-50 transition-colors"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
                <div className={`w-2 h-2 rounded-full ${
                  sprint.status === 'active' ? 'bg-amber-accent' :
                  sprint.status === 'completed' ? 'bg-status-done' : 'bg-gray-400'
                }`} />
                <span className="font-display font-semibold text-sm text-text-primary">{sprint.name}</span>
                <span className="text-xs text-text-muted">{sprint.goal}</span>
                <div className="ml-auto flex items-center gap-3">
                  <span className="text-xs font-mono text-text-muted">{sprintIssues.length} issues</span>
                  <span className="text-xs font-mono text-forest-600">{totalPoints} pts</span>
                </div>
              </div>
              {isExpanded && (
                <div className="border-t border-border">
                  {sprintIssues.map(issue => (
                    <IssueRow key={issue.id} issue={issue} onClick={() => navigate(`/projects/${projectId}/issues/${issue.id}`)} />
                  ))}
                  {sprintIssues.length === 0 && (
                    <div className="text-center py-6 text-text-muted text-sm">No issues in this sprint</div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Backlog Section */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden animate-fade-in">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <div className="w-2 h-2 rounded-full bg-gray-300" />
            <span className="font-display font-semibold text-sm text-text-primary">Backlog</span>
            <span className="text-xs text-text-muted ml-auto">{backlogIssues.length} issues</span>
          </div>
          <div>
            {backlogIssues.map(issue => (
              <IssueRow key={issue.id} issue={issue} onClick={() => navigate(`/projects/${projectId}/issues/${issue.id}`)} />
            ))}
            {backlogIssues.length === 0 && (
              <div className="text-center py-6 text-text-muted text-sm">No items in backlog</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
