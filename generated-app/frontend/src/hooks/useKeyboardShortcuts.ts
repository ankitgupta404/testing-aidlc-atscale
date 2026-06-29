import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectContext } from '../context/ProjectContext';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const { currentProjectId } = useProjectContext();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      // Navigation shortcuts (g + key)
      if (e.key === 'g') {
        const handleSecondKey = (e2: KeyboardEvent) => {
          switch (e2.key) {
            case 'd':
              navigate('/');
              break;
            case 'b':
              if (currentProjectId) navigate(`/projects/${currentProjectId}/board`);
              break;
            case 'l':
              if (currentProjectId) navigate(`/projects/${currentProjectId}/backlog`);
              break;
            case 's':
              if (currentProjectId) navigate(`/projects/${currentProjectId}/sprints`);
              break;
            case 'e':
              if (currentProjectId) navigate(`/projects/${currentProjectId}/epics`);
              break;
            case 'p':
              navigate('/projects');
              break;
            case 'a':
              navigate('/announcements');
              break;
          }
          document.removeEventListener('keydown', handleSecondKey);
        };
        document.addEventListener('keydown', handleSecondKey, { once: true });
        setTimeout(() => document.removeEventListener('keydown', handleSecondKey), 1000);
      }

      // Quick search with /
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
        searchInput?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, currentProjectId]);
}
