import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Project } from '@canopy/shared';

interface ProjectContextType {
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
}

const ProjectContext = createContext<ProjectContextType>({
  currentProject: null,
  setCurrentProject: () => {},
});

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>(() => {
    const saved = localStorage.getItem('canopy-current-project');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (currentProject) {
      localStorage.setItem('canopy-current-project', JSON.stringify(currentProject));
    } else {
      localStorage.removeItem('canopy-current-project');
    }
  }, [currentProject]);

  return (
    <ProjectContext.Provider value={{ currentProject, setCurrentProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  return useContext(ProjectContext);
}
