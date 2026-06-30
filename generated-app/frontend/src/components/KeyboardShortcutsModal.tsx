import { useEffect } from 'react';
import { X } from './icons';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['G', 'D'], description: 'Go to Dashboard' },
      { keys: ['G', 'B'], description: 'Go to Board' },
      { keys: ['G', 'L'], description: 'Go to Backlog' },
      { keys: ['G', 'S'], description: 'Go to Sprints' },
      { keys: ['G', 'E'], description: 'Go to Epics' },
      { keys: ['G', 'A'], description: 'Go to Announcements' },
      { keys: ['G', 'P'], description: 'Go to Projects' },
    ],
  },
  {
    title: 'Actions',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Open command palette' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Esc'], description: 'Close modal / cancel' },
    ],
  },
  {
    title: 'Issue Detail',
    shortcuts: [
      { keys: ['E'], description: 'Edit title (on issue page)' },
      { keys: ['M'], description: 'Assign to me (on issue page)' },
    ],
  },
];

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 animate-backdrop" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative flex items-center justify-center min-h-full p-4">
        <div
          className="w-full max-w-lg bg-white dark:bg-bark-800 rounded-xl shadow-2xl border border-bark-200 dark:border-bark-700 overflow-hidden animate-scale-in"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-bark-200 dark:border-bark-700">
            <h2 className="font-display font-semibold text-bark-900 dark:text-bark-100">
              Keyboard Shortcuts
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-bark-400 hover:text-bark-600 hover:bg-bark-100 dark:hover:bg-bark-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
            {SHORTCUT_GROUPS.map(group => (
              <div key={group.title}>
                <h3 className="text-[10px] uppercase tracking-wider text-bark-500 dark:text-bark-400 font-semibold mb-2">
                  {group.title}
                </h3>
                <div className="space-y-1.5">
                  {group.shortcuts.map(shortcut => (
                    <div
                      key={shortcut.description}
                      className="flex items-center justify-between py-1.5"
                    >
                      <span className="text-sm text-bark-700 dark:text-bark-300">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, i) => (
                          <span key={i}>
                            <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded bg-bark-100 dark:bg-bark-700 border border-bark-200 dark:border-bark-600 text-bark-600 dark:text-bark-300 text-xs font-mono font-medium">
                              {key}
                            </kbd>
                            {i < shortcut.keys.length - 1 && (
                              <span className="mx-0.5 text-bark-300 dark:text-bark-600 text-xs">then</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-bark-200 dark:border-bark-700 bg-bark-50 dark:bg-bark-900/50">
            <p className="text-[11px] text-bark-500 dark:text-bark-400">
              Press <kbd className="px-1 py-0.5 rounded bg-bark-200 dark:bg-bark-700 text-bark-600 dark:text-bark-300 font-mono text-[10px]">?</kbd> anytime to show this help
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
