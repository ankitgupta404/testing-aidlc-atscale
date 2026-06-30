import { NavLink, useParams } from 'react-router-dom';
import {
  X, LayoutDashboard, FolderKanban, Megaphone, Trees,
  List, Columns3, Milestone, Layers, Settings
} from '../icons';
import { useProjectContext } from '../../context/ProjectContext';
import { DEFAULT_PROJECT_ID } from '../../utils/constants';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { currentProject } = useProjectContext();
  const { projectId } = useParams();
  const activeProjectId = projectId || currentProject?.id || DEFAULT_PROJECT_ID;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50 animate-backdrop" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-72 bg-bark-800 text-bark-100 animate-slide-in-left overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-5 py-5 border-b border-bark-700/50">
          <div className="flex items-center gap-2.5">
            <Trees className="w-6 h-6 text-canopy-400" />
            <span className="font-display text-lg font-semibold text-white">Canopy</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-bark-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="px-3 py-4 space-y-1">
          <NavLink
            to="/" end onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive ? 'bg-canopy-600 text-white' : 'text-bark-300 hover:text-white hover:bg-bark-700/50'}`
            }
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </NavLink>
          <NavLink
            to="/projects" onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive ? 'bg-canopy-600 text-white' : 'text-bark-300 hover:text-white hover:bg-bark-700/50'}`
            }
          >
            <FolderKanban className="w-4 h-4" /> Projects
          </NavLink>
          <NavLink
            to="/announcements" onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive ? 'bg-canopy-600 text-white' : 'text-bark-300 hover:text-white hover:bg-bark-700/50'}`
            }
          >
            <Megaphone className="w-4 h-4" /> Announcements
          </NavLink>

          {/* Project nav */}
          {activeProjectId && (
            <>
              <div className="pt-4 pb-2 px-3">
                <p className="text-xs font-semibold text-bark-500 uppercase tracking-wider">
                  {currentProject?.name || 'Project'}
                </p>
              </div>
              <NavLink
                to={`/projects/${activeProjectId}/backlog`} onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? 'bg-canopy-600 text-white' : 'text-bark-300 hover:text-white hover:bg-bark-700/50'}`
                }
              >
                <List className="w-4 h-4" /> Backlog
              </NavLink>
              <NavLink
                to={`/projects/${activeProjectId}/board`} onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? 'bg-canopy-600 text-white' : 'text-bark-300 hover:text-white hover:bg-bark-700/50'}`
                }
              >
                <Columns3 className="w-4 h-4" /> Board
              </NavLink>
              <NavLink
                to={`/projects/${activeProjectId}/sprints`} onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? 'bg-canopy-600 text-white' : 'text-bark-300 hover:text-white hover:bg-bark-700/50'}`
                }
              >
                <Milestone className="w-4 h-4" /> Sprints
              </NavLink>
              <NavLink
                to={`/projects/${activeProjectId}/epics`} onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? 'bg-canopy-600 text-white' : 'text-bark-300 hover:text-white hover:bg-bark-700/50'}`
                }
              >
                <Layers className="w-4 h-4" /> Epics
              </NavLink>
              <NavLink
                to={`/projects/${activeProjectId}/settings`} onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? 'bg-canopy-600 text-white' : 'text-bark-300 hover:text-white hover:bg-bark-700/50'}`
                }
              >
                <Settings className="w-4 h-4" /> Settings
              </NavLink>
            </>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-bark-700/50 text-xs text-bark-500">
          Canopy v1.0
        </div>
      </div>
    </div>
  );
}
