import { Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProjectProvider } from './context/ProjectContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectListPage } from './pages/ProjectListPage';
import { BacklogPage } from './pages/BacklogPage';
import { BoardPage } from './pages/BoardPage';
import { SprintPage } from './pages/SprintPage';
import { EpicsPage } from './pages/EpicsPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <ToastProvider>
      <ProjectProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectListPage />} />
            <Route path="/projects/:projectId/backlog" element={<BacklogPage />} />
            <Route path="/projects/:projectId/board" element={<BoardPage />} />
            <Route path="/projects/:projectId/sprints" element={<SprintPage />} />
            <Route path="/projects/:projectId/epics" element={<EpicsPage />} />
            <Route path="/projects/:projectId/settings" element={<SettingsPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
          </Route>
        </Routes>
      </ProjectProvider>
    </ToastProvider>
  );
}
