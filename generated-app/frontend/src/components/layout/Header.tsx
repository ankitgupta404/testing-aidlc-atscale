import { useState, useEffect } from 'react';
import { Search, Menu, Database } from '../icons';
import { SEED_USERS } from '../../utils/constants';
import { getUserInitials, getAvatarColor } from '../../utils/helpers';
import { useSeedData } from '../../api/seed';
import { useToast } from '../../context/ToastContext';
import { CommandPalette } from '../CommandPalette';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const [currentUser] = useState(SEED_USERS[0]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const seedMutation = useSeedData();
  const { addToast } = useToast();

  // Keyboard shortcut: ⌘K or Ctrl+K to open command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSeed = async () => {
    try {
      await seedMutation.mutateAsync();
      addToast('Database seeded successfully!', 'success');
    } catch {
      addToast('Failed to seed database', 'error');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-bark-200 px-4 md:px-6 h-14 flex items-center gap-4">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="md:hidden p-2 rounded-lg text-bark-600 hover:bg-bark-100 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search trigger */}
      <button
        onClick={() => setPaletteOpen(true)}
        className="flex-1 max-w-md flex items-center gap-3 px-3 py-2 bg-bark-100 border border-transparent rounded-lg text-sm
          text-bark-400 hover:bg-bark-50 hover:border-bark-200 transition-all cursor-pointer"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search issues, projects...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-bark-200 text-bark-500 text-[10px] font-mono">
          ⌘K
        </kbd>
      </button>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSeed}
          disabled={seedMutation.isPending}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-bark-600
            bg-bark-100 hover:bg-bark-200 rounded-lg transition-colors disabled:opacity-50"
          title="Seed database with sample data"
        >
          <Database className="w-3.5 h-3.5" />
          {seedMutation.isPending ? 'Seeding...' : 'Seed Data'}
        </button>

        {/* User avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white ${getAvatarColor(currentUser.name)}`}>
          {getUserInitials(currentUser.name)}
        </div>
      </div>
    </header>
  );
}
