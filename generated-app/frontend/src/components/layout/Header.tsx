import { useState, useEffect, useRef } from 'react';
import { Search, Menu, Database, ChevronDown } from '../icons';
import { SEED_USERS } from '../../utils/constants';
import { getUserInitials, getAvatarColor, cn } from '../../utils/helpers';
import { useSeedData } from '../../api/seed';
import { useToast } from '../../context/ToastContext';
import { CommandPalette } from '../CommandPalette';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('canopy-current-user') || SEED_USERS[0].id;
  });
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const seedMutation = useSeedData();
  const { addToast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentUser = SEED_USERS.find(u => u.id === currentUserId) || SEED_USERS[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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

  const handleUserChange = (userId: string) => {
    setCurrentUserId(userId);
    localStorage.setItem('canopy-current-user', userId);
    setUserDropdownOpen(false);
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

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-bark-100 transition-colors"
          >
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white',
              getAvatarColor(currentUser.name)
            )}>
              {getUserInitials(currentUser.name)}
            </div>
            <ChevronDown className="w-3 h-3 text-bark-400 hidden sm:block" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl border border-bark-200 shadow-lg overflow-hidden z-50 animate-scale-in origin-top-right">
              <div className="px-3 py-2 border-b border-bark-100">
                <p className="text-[10px] uppercase tracking-wider text-bark-500 font-semibold">Switch User</p>
              </div>
              <div className="p-1">
                {SEED_USERS.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleUserChange(user.id)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors',
                      user.id === currentUserId
                        ? 'bg-canopy-50 text-canopy-800'
                        : 'text-bark-700 hover:bg-bark-50'
                    )}
                  >
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0',
                      getAvatarColor(user.name)
                    )}>
                      {getUserInitials(user.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-[10px] text-bark-500 truncate">{user.email}</p>
                    </div>
                    {user.id === currentUserId && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-canopy-500 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
