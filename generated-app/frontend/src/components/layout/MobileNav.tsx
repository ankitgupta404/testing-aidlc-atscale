import { NavLink } from 'react-router-dom';
import { X, LayoutDashboard, FolderKanban, Megaphone, Trees } from '../icons';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-64 bg-bark-800 text-bark-100 animate-slide-in-left overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-5 border-b border-bark-700/50">
          <div className="flex items-center gap-2.5">
            <Trees className="w-6 h-6 text-canopy-400" />
            <span className="font-display text-lg font-semibold text-white">Canopy</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-bark-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="px-3 py-4 space-y-1">
          <NavLink to="/" end onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </NavLink>
          <NavLink to="/projects" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm">
            <FolderKanban className="w-4 h-4" /> Projects
          </NavLink>
          <NavLink to="/announcements" onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm">
            <Megaphone className="w-4 h-4" /> Announcements
          </NavLink>
        </nav>
      </div>
    </div>
  );
}
