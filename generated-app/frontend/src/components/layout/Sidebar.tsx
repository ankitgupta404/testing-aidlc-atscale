import { NavLink, useParams } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, List, Columns3,
  Milestone, Layers, Megaphone, Settings, Trees
} from '../icons';
import { useProjectContext } from '../../context/ProjectContext';
import { DEFAULT_PROJECT_ID } from '../../utils/constants';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: FolderKanban, label: 'Projects', path: '/projects' },
];

const PROJECT_NAV = [
  { icon: List, label: 'Backlog', path: 'backlog' },
  { icon: Columns3, label: 'Board', path: 'board' },
  { icon: Milestone, label: 'Sprints', path: 'sprints' },
  { icon: Layers, label: 'Epics', path: 'epics' },
  { icon: Settings, label: 'Settings', path: 'settings' },
];

export function Sidebar() {
  const { currentProject } = useProjectContext();
  const { projectId } = useParams();
  const activeProjectId = projectId || currentProject?.id || DEFAULT_PROJECT_ID;
  const projectLabel = currentProject?.name || 'Canopy Platform';

  return (
    <aside className="hidden md:flex flex-col w-60 bg-bark-800 text-bark-100 h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-bark-700/50">
        <Trees className="w-6 h-6 text-canopy-400" />
        <span className="font-display text-lg font-semibold tracking-tight text-white">Canopy</span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${isActive
                ? 'bg-canopy-600 text-white shadow-sm'
                : 'text-bark-300 hover:text-white hover:bg-bark-700/50'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}

        <NavLink
          to="/announcements"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${isActive
              ? 'bg-canopy-600 text-white shadow-sm'
              : 'text-bark-300 hover:text-white hover:bg-bark-700/50'
            }`
          }
        >
          <Megaphone className="w-4 h-4" />
          Announcements
        </NavLink>

        {/* Project-scoped nav */}
        {activeProjectId && (
          <>
            <div className="pt-4 pb-2 px-3">
              <p className="text-xs font-semibold text-bark-500 uppercase tracking-wider">
                {projectLabel}
              </p>
            </div>
            {PROJECT_NAV.map(item => (
              <NavLink
                key={item.path}
                to={`/projects/${activeProjectId}/${item.path}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-canopy-600 text-white shadow-sm'
                    : 'text-bark-300 hover:text-white hover:bg-bark-700/50'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-bark-700/50 text-xs text-bark-500">
        Canopy v1.0
      </div>
    </aside>
  );
}
