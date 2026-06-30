import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowLeft } from './icons';
import { useIssues } from '../api/issues';
import { useProjects } from '../api/projects';
import { DEFAULT_PROJECT_ID, STATUS_COLORS, PRIORITY_COLORS, TYPE_LABELS } from '../utils/constants';
import { cn } from '../utils/helpers';
import type { Issue, Project } from '@canopy/shared';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: issues } = useIssues(DEFAULT_PROJECT_ID);
  const { data: projects } = useProjects();

  // Filter results based on query
  const results = useMemo(() => {
    if (!query.trim()) {
      // Show recent / navigation shortcuts when empty
      return [
        { type: 'nav' as const, label: 'Dashboard', path: '/', icon: 'dashboard' },
        { type: 'nav' as const, label: 'Board', path: `/projects/${DEFAULT_PROJECT_ID}/board`, icon: 'board' },
        { type: 'nav' as const, label: 'Backlog', path: `/projects/${DEFAULT_PROJECT_ID}/backlog`, icon: 'backlog' },
        { type: 'nav' as const, label: 'Sprints', path: `/projects/${DEFAULT_PROJECT_ID}/sprints`, icon: 'sprints' },
        { type: 'nav' as const, label: 'Epics', path: `/projects/${DEFAULT_PROJECT_ID}/epics`, icon: 'epics' },
      ];
    }

    const q = query.toLowerCase();
    const matchedIssues = (issues || [])
      .filter((i: Issue) =>
        i.title.toLowerCase().includes(q) ||
        (i.key && i.key.toLowerCase().includes(q))
      )
      .slice(0, 8)
      .map((i: Issue) => ({ type: 'issue' as const, issue: i }));

    const matchedProjects = (projects || [])
      .filter((p: Project) =>
        p.name.toLowerCase().includes(q) ||
        p.key.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map((p: Project) => ({ type: 'project' as const, project: p }));

    return [...matchedProjects, ...matchedIssues];
  }, [query, issues, projects]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleSelect = useCallback((index: number) => {
    const item = results[index];
    if (!item) return;

    if (item.type === 'nav') {
      navigate(item.path);
    } else if (item.type === 'issue') {
      navigate(`/projects/${DEFAULT_PROJECT_ID}/issues/${item.issue.id}`);
    } else if (item.type === 'project') {
      navigate(`/projects/${item.project.id}/backlog`);
    }
    onClose();
  }, [results, navigate, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(selectedIndex);
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 animate-backdrop" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative flex items-start justify-center pt-[15vh] px-4">
        <div
          className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-bark-200 overflow-hidden animate-scale-in"
          onClick={e => e.stopPropagation()}
        >
          {/* Input */}
          <div className="flex items-center gap-3 px-4 border-b border-bark-200">
            <Search className="w-4 h-4 text-bark-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search issues, projects, or navigate..."
              className="flex-1 py-3.5 text-sm bg-transparent border-0 outline-none placeholder:text-bark-400"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 rounded text-bark-400 hover:text-bark-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-bark-100 text-bark-500 text-[10px] font-mono">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
            {results.length === 0 && query && (
              <div className="px-4 py-8 text-center text-sm text-bark-500">
                No results for "{query}"
              </div>
            )}

            {!query && (
              <div className="px-3 pb-1">
                <p className="text-[10px] uppercase tracking-wider text-bark-400 font-semibold px-2 py-1">Navigate</p>
              </div>
            )}

            {query && results.some(r => r.type === 'project') && (
              <div className="px-3 pb-1">
                <p className="text-[10px] uppercase tracking-wider text-bark-400 font-semibold px-2 py-1">Projects</p>
              </div>
            )}

            {results.map((item, idx) => {
              const isSelected = idx === selectedIndex;

              if (item.type === 'nav') {
                return (
                  <button
                    key={item.path}
                    onClick={() => handleSelect(idx)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      'w-full flex items-center gap-3 px-5 py-2 text-sm text-left transition-colors',
                      isSelected ? 'bg-canopy-50 text-canopy-800' : 'text-bark-700 hover:bg-bark-50'
                    )}
                  >
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-bark-400" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              }

              if (item.type === 'project') {
                return (
                  <button
                    key={item.project.id}
                    onClick={() => handleSelect(idx)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      'w-full flex items-center gap-3 px-5 py-2 text-sm text-left transition-colors',
                      isSelected ? 'bg-canopy-50 text-canopy-800' : 'text-bark-700 hover:bg-bark-50'
                    )}
                  >
                    <div className="w-5 h-5 rounded bg-canopy-100 flex items-center justify-center text-[10px] font-bold text-canopy-700">
                      {item.project.key[0]}
                    </div>
                    <span className="font-medium">{item.project.name}</span>
                    <span className="text-xs text-bark-400 ml-auto font-mono">{item.project.key}</span>
                  </button>
                );
              }

              if (item.type === 'issue') {
                const issue = item.issue;
                const priorityDot = PRIORITY_COLORS[issue.priority] || 'bg-bark-400';
                const statusDot = STATUS_COLORS[issue.status] || 'bg-bark-400';
                return (
                  <button
                    key={issue.id}
                    onClick={() => handleSelect(idx)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      'w-full flex items-center gap-3 px-5 py-2 text-sm text-left transition-colors',
                      isSelected ? 'bg-canopy-50 text-canopy-800' : 'text-bark-700 hover:bg-bark-50'
                    )}
                  >
                    <span className={cn('w-2 h-2 rounded-full shrink-0', statusDot)} />
                    <span className="font-mono text-xs text-bark-400 shrink-0">{issue.key}</span>
                    <span className="truncate flex-1">{issue.title}</span>
                    <span className={cn('w-2 h-2 rounded-full shrink-0', priorityDot)} />
                  </button>
                );
              }

              return null;
            })}

            {query && results.some(r => r.type === 'issue') && (
              <div className="px-3 pt-2 pb-1 border-t border-bark-100 mt-1">
                <p className="text-[10px] uppercase tracking-wider text-bark-400 font-semibold px-2 py-1">Issues</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-bark-100 flex items-center gap-4 text-[10px] text-bark-400">
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-bark-100 font-mono">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-bark-100 font-mono">↵</kbd> Select</span>
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-bark-100 font-mono">Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
