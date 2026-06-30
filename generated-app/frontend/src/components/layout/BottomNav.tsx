import { NavLink, useParams } from 'react-router-dom';
import { LayoutDashboard, List, Columns3, Milestone, Megaphone } from '../icons';
import { useProjectContext } from '../../context/ProjectContext';
import { DEFAULT_PROJECT_ID } from '../../utils/constants';

export function BottomNav() {
  const { currentProject } = useProjectContext();
  const { projectId } = useParams();
  const activeProjectId = projectId || currentProject?.id || DEFAULT_PROJECT_ID;

  const items = [
    { icon: LayoutDashboard, label: 'Home', path: '/' },
    { icon: List, label: 'Backlog', path: `/projects/${activeProjectId}/backlog` },
    { icon: Columns3, label: 'Board', path: `/projects/${activeProjectId}/board` },
    { icon: Milestone, label: 'Sprints', path: `/projects/${activeProjectId}/sprints` },
    { icon: Megaphone, label: 'News', path: '/announcements' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-bark-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-14">
        {items.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[56px]
              ${isActive
                ? 'text-canopy-600'
                : 'text-bark-400 active:text-bark-600'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
