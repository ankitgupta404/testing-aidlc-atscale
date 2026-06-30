import { useState } from 'react';
import { Search, Menu, Database } from 'lucide-react';
import { SEED_USERS } from '../../utils/constants';
import { getUserInitials, getAvatarColor } from '../../utils/helpers';
import { useSeedData } from '../../api/seed';
import { useToast } from '../../context/ToastContext';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const [currentUser] = useState(SEED_USERS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const seedMutation = useSeedData();
  const { addToast } = useToast();

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

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bark-400" />
        <input
          type="text"
          placeholder="Search issues, projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-bark-100 border border-transparent rounded-lg text-sm
            placeholder:text-bark-400 focus:bg-white focus:border-canopy-300 focus:ring-1 focus:ring-canopy-300
            transition-all outline-none"
        />
        <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-0.5 px-1.5 py-0.5 rounded bg-bark-200 text-bark-500 text-[10px] font-mono">
          ⌘K
        </kbd>
      </div>

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
