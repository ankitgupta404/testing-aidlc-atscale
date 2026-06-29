import { Routes, Route, Navigate } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';
import AppShell from './components/layout/AppShell';
import DashboardPage from './pages/DashboardPage';
import ProjectListPage from './pages/ProjectListPage';
import BoardPage from './pages/BoardPage';
import BacklogPage from './pages/BacklogPage';
import IssueDetailPage from './pages/IssueDetailPage';
import SprintPage from './pages/SprintPage';
import EpicsPage from './pages/EpicsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <ProjectProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/projects/:projectId/board" element={<BoardPage />} />
          <Route path="/projects/:projectId/backlog" element={<BacklogPage />} />
          <Route path="/projects/:projectId/issues/:issueId" element={<IssueDetailPage />} />
          <Route path="/projects/:projectId/sprints" element={<SprintPage />} />
          <Route path="/projects/:projectId/epics" element={<EpicsPage />} />
          <Route path="/projects/:projectId/settings" element={<SettingsPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ProjectProvider>
  );
}
