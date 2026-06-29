import { createContext, useContext, useState, ReactNode } from 'react';

interface ProjectContextType {
  currentProjectId: string | undefined;
  setCurrentProjectId: (id: string | undefined) => void;
}

const ProjectContext = createContext<ProjectContextType>({
  currentProjectId: '11111111-1111-1111-1111-111111111111',
  setCurrentProjectId: () => {},
});

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(
    '11111111-1111-1111-1111-111111111111'
  );

  return (
    <ProjectContext.Provider value={{ currentProjectId, setCurrentProjectId }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  return useContext(ProjectContext);
}
