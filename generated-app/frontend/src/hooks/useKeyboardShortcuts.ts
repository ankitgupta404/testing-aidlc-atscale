import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DEFAULT_PROJECT_ID } from '../utils/constants';

/**
 * Global keyboard shortcuts:
 * - G then D: Go to Dashboard
 * - G then B: Go to Board
 * - G then L: Go to Backlog
 * - G then S: Go to Sprints
 * - G then E: Go to Epics
 * - G then A: Go to Announcements
 * - G then P: Go to Projects
 * - ? : Show keyboard shortcuts help
 */
export function useKeyboardShortcuts(options?: {
  onShowHelp?: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract projectId from current URL or use default
  const getProjectId = useCallback(() => {
    const match = location.pathname.match(/\/projects\/([^/]+)/);
    return match ? match[1] : DEFAULT_PROJECT_ID;
  }, [location.pathname]);

  useEffect(() => {
    let gPrefix = false;
    let gTimer: ReturnType<typeof setTimeout> | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      // Don't handle if modifier keys are pressed (except for ?)
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      const key = e.key.toLowerCase();

      // "G" prefix for navigation
      if (key === 'g' && !gPrefix) {
        gPrefix = true;
        if (gTimer) clearTimeout(gTimer);
        gTimer = setTimeout(() => { gPrefix = false; }, 1000);
        return;
      }

      if (gPrefix) {
        gPrefix = false;
        if (gTimer) clearTimeout(gTimer);
        const pid = getProjectId();

        switch (key) {
          case 'd':
            e.preventDefault();
            navigate('/');
            break;
          case 'b':
            e.preventDefault();
            navigate(`/projects/${pid}/board`);
            break;
          case 'l':
            e.preventDefault();
            navigate(`/projects/${pid}/backlog`);
            break;
          case 's':
            e.preventDefault();
            navigate(`/projects/${pid}/sprints`);
            break;
          case 'e':
            e.preventDefault();
            navigate(`/projects/${pid}/epics`);
            break;
          case 'a':
            e.preventDefault();
            navigate('/announcements');
            break;
          case 'p':
            e.preventDefault();
            navigate('/projects');
            break;
        }
        return;
      }

      // Single key shortcuts
      if (key === '?' && e.shiftKey) {
        e.preventDefault();
        options?.onShowHelp?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (gTimer) clearTimeout(gTimer);
    };
  }, [navigate, getProjectId, options]);
}
