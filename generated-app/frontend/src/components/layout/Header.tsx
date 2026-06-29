import { useLocation } from 'react-router-dom';
import { Search, Bell } from '@/components/icons';
import { getInitials } from '../../utils/formatters';

export default function Header() {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/projects') return 'Projects';
    if (path.includes('/board')) return 'Board';
    if (path.includes('/backlog')) return 'Backlog';
    if (path.includes('/sprints')) return 'Sprints';
    if (path.includes('/epics')) return 'Epics';
    if (path.includes('/settings')) return 'Settings';
    if (path.includes('/issues/')) return 'Issue Detail';
    if (path === '/announcements') return 'Announcements';
    return 'Canopy';
  };

  return (
    <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-6">
      <h1 className="font-display font-semibold text-lg text-text-primary">{getPageTitle()}</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search issues..."
            data-search-input
            className="pl-9 pr-4 py-1.5 bg-forest-50 border border-border rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition-all"
          />
        </div>
        <button className="relative p-2 rounded-lg hover:bg-forest-100 transition-colors">
          <Bell className="w-4.5 h-4.5 text-text-secondary" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-terra rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-forest-900 flex items-center justify-center text-white text-xs font-semibold">
          {getInitials('Sarah Chen')}
        </div>
      </div>
    </header>
  );
}
