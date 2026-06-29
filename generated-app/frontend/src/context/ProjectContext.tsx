import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useProjects } from '../api/projects';

interface ProjectContextType {
  currentProjectId: string | undefined;
  setCurrentProjectId: (id: string | undefined) => void;
}

const ProjectContext = createContext<ProjectContextType>({
  currentProjectId: undefined,
  setCurrentProjectId: () => {},
});

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(() => {
    // Try to restore from localStorage, fallback to seeded project
    const saved = localStorage.getItem('canopy:currentProjectId');
    return saved || '11111111-1111-1111-1111-111111111111';
  });

  const { data: projects } = useProjects();

  // Auto-select first project if none is selected
  useEffect(() => {
    if (!currentProjectId && projects && projects.length > 0) {
      setCurrentProjectId(projects[0].id);
    }
  }, [currentProjectId, projects]);

  // Persist selection
  useEffect(() => {
    if (currentProjectId) {
      localStorage.setItem('canopy:currentProjectId', currentProjectId);
    }
  }, [currentProjectId]);

  return (
    <ProjectContext.Provider value={{ currentProjectId, setCurrentProjectId }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  return useContext(ProjectContext);
}
