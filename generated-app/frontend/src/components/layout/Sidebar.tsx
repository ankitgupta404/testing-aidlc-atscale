import { NavLink, useParams } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, List, Columns3, Target, Calendar, Megaphone, Settings, TreePine } from '@/components/icons';
import { useProjectContext } from '../../context/ProjectContext';
import { useProjects } from '../../api/projects';

export default function Sidebar() {
  const { projectId } = useParams();
  const { currentProjectId, setCurrentProjectId } = useProjectContext();
  const { data: projects } = useProjects();
  const activeProject = projectId || currentProjectId;

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
  ];

  const projectNavItems = activeProject ? [
    { to: `/projects/${activeProject}/board`, icon: Columns3, label: 'Board' },
    { to: `/projects/${activeProject}/backlog`, icon: List, label: 'Backlog' },
    { to: `/projects/${activeProject}/sprints`, icon: Calendar, label: 'Sprints' },
    { to: `/projects/${activeProject}/epics`, icon: Target, label: 'Epics' },
    { to: `/projects/${activeProject}/settings`, icon: Settings, label: 'Settings' },
  ] : [];

  return (
    <aside data-testid="sidebar" className="w-[260px] bg-forest-900 text-white flex flex-col animate-slide-left">
      {/* Logo */}
      <div className="flex items-center gap-3 p-5 border-b border-forest-800">
        <div className="w-8 h-8 bg-forest-200 rounded-lg flex items-center justify-center">
          <TreePine className="w-5 h-5 text-forest-900" />
        </div>
        <span className="font-display font-semibold text-lg tracking-tight">Canopy</span>
      </div>

      {/* Project Selector */}
      {projects && projects.length > 0 && (
        <div className="px-4 py-3 border-b border-forest-800">
          <select
            value={activeProject || ''}
            onChange={(e) => setCurrentProjectId(e.target.value)}
            className="w-full bg-forest-800 text-white text-sm rounded-md px-3 py-2 border border-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-400"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-forest-700 text-white'
                    : 'text-forest-300 hover:text-white hover:bg-forest-800'
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </NavLink>
          ))}
        </div>

        {projectNavItems.length > 0 && (
          <>
            <div className="px-6 pt-6 pb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-forest-500">
                Project
              </span>
            </div>
            <div className="px-3 space-y-1">
              {projectNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-forest-700 text-white'
                        : 'text-forest-300 hover:text-white hover:bg-forest-800'
                    }`
                  }
                >
                  <item.icon className="w-4.5 h-4.5" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </>
        )}

        <div className="px-6 pt-6 pb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-forest-500">
            General
          </span>
        </div>
        <div className="px-3 space-y-1">
          <NavLink
            to="/announcements"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-forest-700 text-white'
                  : 'text-forest-300 hover:text-white hover:bg-forest-800'
              }`
            }
          >
            <Megaphone className="w-4.5 h-4.5" />
            Announcements
          </NavLink>
        </div>
      </nav>
    </aside>
  );
}
