import type { Project, Issue, Sprint, Epic, Announcement, DashboardStats } from '@canopy/shared';

const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString();
const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
const twoWeeksFromNow = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
const now = new Date().toISOString();

export const mockProjects: Project[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Canopy Platform',
    key: 'CAN',
    description: 'A full-featured project management application built with modern web technologies.',
    lead: 'Sarah Chen',
    avatarColor: '#1B4332',
    issueCounter: 22,
    createdAt: fourWeeksAgo,
    updatedAt: now,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Mobile App',
    key: 'MOB',
    description: 'Companion mobile application for Canopy with native features.',
    lead: 'Marcus Johnson',
    avatarColor: '#2563EB',
    issueCounter: 10,
    createdAt: fourWeeksAgo,
    updatedAt: now,
  },
];

export const mockSprints: Record<string, Sprint[]> = {
  '11111111-1111-1111-1111-111111111111': [
    { id: 'aaaa1111-1111-1111-1111-111111111111', projectId: '11111111-1111-1111-1111-111111111111', name: 'Sprint 1', goal: 'Project foundation and core setup', status: 'completed', startDate: fourWeeksAgo, endDate: twoWeeksAgo, createdAt: fourWeeksAgo, updatedAt: twoWeeksAgo },
    { id: 'aaaa2222-2222-2222-2222-222222222222', projectId: '11111111-1111-1111-1111-111111111111', name: 'Sprint 2', goal: 'Board management and real-time updates', status: 'active', startDate: twoWeeksAgo, endDate: oneWeekFromNow, createdAt: twoWeeksAgo, updatedAt: now },
    { id: 'aaaa3333-3333-3333-3333-333333333333', projectId: '11111111-1111-1111-1111-111111111111', name: 'Sprint 3', goal: 'Reporting and analytics', status: 'planning', startDate: oneWeekFromNow, endDate: twoWeeksFromNow, createdAt: now, updatedAt: now },
  ],
  '22222222-2222-2222-2222-222222222222': [
    { id: 'bbbb1111-1111-1111-1111-111111111111', projectId: '22222222-2222-2222-2222-222222222222', name: 'Sprint 1', goal: 'Mobile app foundation', status: 'completed', startDate: fourWeeksAgo, endDate: twoWeeksAgo, createdAt: fourWeeksAgo, updatedAt: twoWeeksAgo },
    { id: 'bbbb2222-2222-2222-2222-222222222222', projectId: '22222222-2222-2222-2222-222222222222', name: 'Sprint 2', goal: 'Core features implementation', status: 'active', startDate: twoWeeksAgo, endDate: oneWeekFromNow, createdAt: twoWeeksAgo, updatedAt: now },
    { id: 'bbbb3333-3333-3333-3333-333333333333', projectId: '22222222-2222-2222-2222-222222222222', name: 'Sprint 3', goal: 'Polish and testing', status: 'planning', startDate: oneWeekFromNow, endDate: twoWeeksFromNow, createdAt: now, updatedAt: now },
  ],
};

export const mockEpics: Record<string, Epic[]> = {
  '11111111-1111-1111-1111-111111111111': [
    { id: 'cccc1111-1111-1111-1111-111111111111', projectId: '11111111-1111-1111-1111-111111111111', name: 'User Authentication', description: 'Set up user authentication and authorization', status: 'done', color: '#16A34A', createdAt: fourWeeksAgo, updatedAt: twoWeeksAgo },
    { id: 'cccc2222-2222-2222-2222-222222222222', projectId: '11111111-1111-1111-1111-111111111111', name: 'Board Management', description: 'Kanban board with drag-and-drop functionality', status: 'in_progress', color: '#2563EB', createdAt: fourWeeksAgo, updatedAt: now },
    { id: 'cccc3333-3333-3333-3333-333333333333', projectId: '11111111-1111-1111-1111-111111111111', name: 'Reporting Dashboard', description: 'Analytics and reporting features with charts', status: 'not_started', color: '#7C3AED', createdAt: fourWeeksAgo, updatedAt: fourWeeksAgo },
  ],
  '22222222-2222-2222-2222-222222222222': [
    { id: 'dddd1111-1111-1111-1111-111111111111', projectId: '22222222-2222-2222-2222-222222222222', name: 'Core Setup', description: 'React Native project setup and navigation', status: 'done', color: '#16A34A', createdAt: fourWeeksAgo, updatedAt: twoWeeksAgo },
    { id: 'dddd2222-2222-2222-2222-222222222222', projectId: '22222222-2222-2222-2222-222222222222', name: 'Task Management', description: 'Mobile task management features', status: 'in_progress', color: '#2563EB', createdAt: fourWeeksAgo, updatedAt: now },
    { id: 'dddd3333-3333-3333-3333-333333333333', projectId: '22222222-2222-2222-2222-222222222222', name: 'Offline Support', description: 'Offline-first data sync', status: 'not_started', color: '#7C3AED', createdAt: fourWeeksAgo, updatedAt: fourWeeksAgo },
  ],
};

export const mockIssues: Record<string, Issue[]> = {
  '11111111-1111-1111-1111-111111111111': [
    { id: 'i001', projectId: '11111111-1111-1111-1111-111111111111', key: 'CAN-1', title: 'Set up project scaffolding with Vite and React', type: 'task', status: 'done', priority: 'high', assignee: 'Sarah Chen', reporter: 'Sarah Chen', sprintId: 'aaaa1111-1111-1111-1111-111111111111', epicId: 'cccc1111-1111-1111-1111-111111111111', storyPoints: 3, labels: ['frontend'], order: 1, createdAt: fourWeeksAgo, updatedAt: twoWeeksAgo },
    { id: 'i002', projectId: '11111111-1111-1111-1111-111111111111', key: 'CAN-2', title: 'Design forest-inspired color palette', type: 'task', status: 'done', priority: 'medium', assignee: 'Alex Rivera', reporter: 'Sarah Chen', sprintId: 'aaaa1111-1111-1111-1111-111111111111', epicId: 'cccc1111-1111-1111-1111-111111111111', storyPoints: 2, labels: ['ui'], order: 2, createdAt: fourWeeksAgo, updatedAt: twoWeeksAgo },
    { id: 'i003', projectId: '11111111-1111-1111-1111-111111111111', key: 'CAN-3', title: 'Implement DynamoDB single-table design', type: 'story', status: 'done', priority: 'high', assignee: 'Priya Patel', reporter: 'Sarah Chen', sprintId: 'aaaa1111-1111-1111-1111-111111111111', epicId: 'cccc1111-1111-1111-1111-111111111111', storyPoints: 8, labels: ['backend'], order: 3, createdAt: fourWeeksAgo, updatedAt: twoWeeksAgo },
    { id: 'i004', projectId: '11111111-1111-1111-1111-111111111111', key: 'CAN-4', title: 'Create shared Zod schemas package', type: 'task', status: 'done', priority: 'high', assignee: 'Sarah Chen', reporter: 'Sarah Chen', sprintId: 'aaaa1111-1111-1111-1111-111111111111', epicId: 'cccc1111-1111-1111-1111-111111111111', storyPoints: 5, labels: ['api'], order: 4, createdAt: fourWeeksAgo, updatedAt: twoWeeksAgo },
    { id: 'i005', projectId: '11111111-1111-1111-1111-111111111111', key: 'CAN-5', title: 'Set up CDK infrastructure stack', type: 'story', status: 'done', priority: 'critical', assignee: 'Marcus Johnson', reporter: 'Sarah Chen', sprintId: 'aaaa1111-1111-1111-1111-111111111111', epicId: 'cccc1111-1111-1111-1111-111111111111', storyPoints: 8, labels: ['backend'], order: 5, createdAt: fourWeeksAgo, updatedAt: twoWeeksAgo },
    { id: 'i006', projectId: '11111111-1111-1111-1111-111111111111', key: 'CAN-6', title: 'Implement project CRUD API', type: 'story', status: 'done', priority: 'high', assignee: 'Priya Patel', reporter: 'Sarah Chen', sprintId: 'aaaa1111-1111-1111-1111-111111111111', epicId: 'cccc1111-1111-1111-1111-111111111111', storyPoints: 5, labels: ['api', 'backend'], order: 6, createdAt: fourWeeksAgo, updatedAt: twoWeeksAgo },
    { id: 'i007', projectId: '11111111-1111-1111-1111-111111111111', key: 'CAN-7', title: 'Build Kanban board with drag-and-drop', type: 'story', status: 'in_progress', priority: 'high', assignee: 'Sarah Chen', reporter: 'Sarah Chen', sprintId: 'aaaa2222-2222-2222-2222-222222222222', epicId: 'cccc2222-2222-2222-2222-222222222222', storyPoints: 13, labels: ['frontend', 'ui'], order: 7, createdAt: twoWeeksAgo, updatedAt: now },
    { id: 'i008', projectId: '11111111-1111-1111-1111-111111111111', key: 'CAN-8', title: 'Add issue filtering and search', type: 'story', status: 'in_review', priority: 'medium', assignee: 'Priya Patel', reporter: 'Sarah Chen', sprintId: 'aaaa2222-2222-2222-2222-222222222222', epicId: 'cccc2222-2222-2222-2222-222222222222', storyPoints: 8, labels: ['frontend'], order: 8, createdAt: twoWeeksAgo, updatedAt: now },
    { id: 'i009', projectId: '11111111-1111-1111-1111-111111111111', key: 'CAN-9', title: 'Create burndown chart component', type: 'task', status: 'todo', priority: 'medium', assignee: 'Alex Rivera', reporter: 'Sarah Chen', sprintId: 'aaaa2222-2222-2222-2222-222222222222', epicId: 'cccc3333-3333-3333-3333-333333333333', storyPoints: 5, labels: ['frontend'], order: 9, createdAt: twoWeeksAgo, updatedAt: now },
    { id: 'i010', projectId: '11111111-1111-1111-1111-111111111111', key: 'CAN-10', title: 'Implement sprint lifecycle management', type: 'story', status: 'in_progress', priority: 'high', assignee: 'Marcus Johnson', reporter: 'Sarah Chen', sprintId: 'aaaa2222-2222-2222-2222-222222222222', epicId: 'cccc2222-2222-2222-2222-222222222222', storyPoints: 8, labels: ['backend'], order: 10, createdAt: twoWeeksAgo, updatedAt: now },
    { id: 'i011', projectId: '11111111-1111-1111-1111-111111111111', key: 'CAN-11', title: 'Fix: Board cards not updating after drag', type: 'bug', status: 'in_progress', priority: 'high', assignee: 'Sarah Chen', reporter: 'Priya Patel', sprintId: 'aaaa2222-2222-2222-2222-222222222222', epicId: 'cccc2222-2222-2222-2222-222222222222', storyPoints: 3, labels: ['frontend', 'bug'], order: 11, createdAt: twoWeeksAgo, updatedAt: now },
    { id: 'i012', projectId: '11111111-1111-1111-1111-111111111111', key: 'CAN-12', title: 'Fix: Sprint dates not validating correctly', type: 'bug', status: 'todo', priority: 'medium', assignee: 'Priya Patel', reporter: 'Marcus Johnson', sprintId: 'aaaa2222-2222-2222-2222-222222222222', epicId: 'cccc2222-2222-2222-2222-222222222222', storyPoints: 2, labels: ['backend', 'bug'], order: 12, createdAt: twoWeeksAgo, updatedAt: now },
    { id: 'i013', projectId: '11111111-1111-1111-1111-111111111111', key: 'CAN-13', title: 'Add optimistic updates for board moves', type: 'task', status: 'done', priority: 'medium', assignee: 'Sarah Chen', reporter: 'Sarah Chen', sprintId: 'aaaa2222-2222-2222-2222-222222222222', epicId: 'cccc2222-2222-2222-2222-222222222222', storyPoints: 5, labels: ['frontend'], order: 13, createdAt: twoWeeksAgo, updatedAt: now },
    { id: 'i014', projectId: '11111111-1111-1111-1111-111111111111', key: 'CAN-14', title: 'Implement issue comments with markdown', type: 'story', status: 'todo', priority: 'medium', assignee: 'Priya Patel', reporter: 'Sarah Chen', sprintId: 'aaaa3333-3333-3333-3333-333333333333', epicId: 'cccc2222-2222-2222-2222-222222222222', storyPoints: 5, labels: ['frontend'], order: 14, createdAt: now, updatedAt: now },
    { id: 'i015', projectId: '11111111-1111-1111-1111-111111111111', key: 'CAN-15', title: 'Add comment system to issues', type: 'story', status: 'todo', priority: 'medium', assignee: 'Marcus Johnson', reporter: 'Sarah Chen', sprintId: 'aaaa3333-3333-3333-3333-333333333333', epicId: 'cccc2222-2222-2222-2222-222222222222', storyPoints: 5, labels: ['backend'], order: 15, createdAt: now, updatedAt: now },
    { id: 'i016', projectId: '11111111-1111-1111-1111-111111111111', key: 'CAN-16', title: 'Build velocity chart for reporting', type: 'task', status: 'todo', priority: 'low', reporter: 'Sarah Chen', epicId: 'cccc3333-3333-3333-3333-333333333333', storyPoints: 5, labels: ['frontend'], order: 16, createdAt: now, updatedAt: now },
    { id: 'i017', projectId: '11111111-1111-1111-1111-111111111111', key: 'CAN-17', title: 'Mobile responsive layout', type: 'story', status: 'todo', priority: 'medium', reporter: 'Alex Rivera', storyPoints: 8, labels: ['frontend', 'ui'], order: 17, createdAt: now, updatedAt: now },
    { id: 'i018', projectId: '11111111-1111-1111-1111-111111111111', key: 'CAN-18', title: 'Add keyboard shortcuts', type: 'task', status: 'todo', priority: 'low', assignee: 'Alex Rivera', reporter: 'Sarah Chen', storyPoints: 3, labels: ['frontend'], order: 18, createdAt: now, updatedAt: now },
    { id: 'i019', projectId: '11111111-1111-1111-1111-111111111111', key: 'CAN-19', title: 'Performance optimization for large boards', type: 'task', status: 'todo', priority: 'low', reporter: 'Sarah Chen', epicId: 'cccc2222-2222-2222-2222-222222222222', storyPoints: 5, labels: ['performance'], order: 19, createdAt: now, updatedAt: now },
    { id: 'i020', projectId: '11111111-1111-1111-1111-111111111111', key: 'CAN-20', title: 'Add dark mode support', type: 'story', status: 'todo', priority: 'low', assignee: 'Alex Rivera', reporter: 'Sarah Chen', storyPoints: 5, labels: ['ui'], order: 20, createdAt: now, updatedAt: now },
    { id: 'i021', projectId: '11111111-1111-1111-1111-111111111111', key: 'CAN-21', title: 'Fix: Issue counter reset on project update', type: 'bug', status: 'done', priority: 'critical', assignee: 'Sarah Chen', reporter: 'Priya Patel', sprintId: 'aaaa1111-1111-1111-1111-111111111111', epicId: 'cccc1111-1111-1111-1111-111111111111', storyPoints: 2, labels: ['backend', 'bug'], order: 21, createdAt: fourWeeksAgo, updatedAt: twoWeeksAgo },
    { id: 'i022', projectId: '11111111-1111-1111-1111-111111111111', key: 'CAN-22', title: 'Create epic progress tracking', type: 'story', status: 'todo', priority: 'medium', reporter: 'Sarah Chen', sprintId: 'aaaa3333-3333-3333-3333-333333333333', epicId: 'cccc3333-3333-3333-3333-333333333333', storyPoints: 8, labels: ['frontend'], order: 22, createdAt: now, updatedAt: now },
  ],
  '22222222-2222-2222-2222-222222222222': [
    { id: 'i101', projectId: '22222222-2222-2222-2222-222222222222', key: 'MOB-1', title: 'Initialize React Native project', type: 'task', status: 'done', priority: 'high', assignee: 'Marcus Johnson', reporter: 'Marcus Johnson', sprintId: 'bbbb1111-1111-1111-1111-111111111111', epicId: 'dddd1111-1111-1111-1111-111111111111', storyPoints: 3, labels: ['setup'], order: 1, createdAt: fourWeeksAgo, updatedAt: twoWeeksAgo },
    { id: 'i102', projectId: '22222222-2222-2222-2222-222222222222', key: 'MOB-2', title: 'Set up navigation with React Navigation', type: 'task', status: 'done', priority: 'high', assignee: 'Marcus Johnson', reporter: 'Marcus Johnson', sprintId: 'bbbb1111-1111-1111-1111-111111111111', epicId: 'dddd1111-1111-1111-1111-111111111111', storyPoints: 5, labels: ['frontend'], order: 2, createdAt: fourWeeksAgo, updatedAt: twoWeeksAgo },
    { id: 'i103', projectId: '22222222-2222-2222-2222-222222222222', key: 'MOB-3', title: 'Configure CI/CD for mobile builds', type: 'task', status: 'done', priority: 'medium', assignee: 'Priya Patel', reporter: 'Marcus Johnson', sprintId: 'bbbb1111-1111-1111-1111-111111111111', epicId: 'dddd1111-1111-1111-1111-111111111111', storyPoints: 8, labels: ['devops'], order: 3, createdAt: fourWeeksAgo, updatedAt: twoWeeksAgo },
    { id: 'i104', projectId: '22222222-2222-2222-2222-222222222222', key: 'MOB-4', title: 'Build task list view with filters', type: 'story', status: 'in_progress', priority: 'high', assignee: 'Marcus Johnson', reporter: 'Marcus Johnson', sprintId: 'bbbb2222-2222-2222-2222-222222222222', epicId: 'dddd2222-2222-2222-2222-222222222222', storyPoints: 8, labels: ['frontend'], order: 4, createdAt: twoWeeksAgo, updatedAt: now },
    { id: 'i105', projectId: '22222222-2222-2222-2222-222222222222', key: 'MOB-5', title: 'Implement task detail screen', type: 'story', status: 'in_review', priority: 'high', assignee: 'Priya Patel', reporter: 'Marcus Johnson', sprintId: 'bbbb2222-2222-2222-2222-222222222222', epicId: 'dddd2222-2222-2222-2222-222222222222', storyPoints: 5, labels: ['frontend'], order: 5, createdAt: twoWeeksAgo, updatedAt: now },
    { id: 'i106', projectId: '22222222-2222-2222-2222-222222222222', key: 'MOB-6', title: 'Add push notifications', type: 'story', status: 'todo', priority: 'medium', assignee: 'Marcus Johnson', reporter: 'Marcus Johnson', sprintId: 'bbbb2222-2222-2222-2222-222222222222', epicId: 'dddd2222-2222-2222-2222-222222222222', storyPoints: 8, labels: ['backend'], order: 6, createdAt: twoWeeksAgo, updatedAt: now },
    { id: 'i107', projectId: '22222222-2222-2222-2222-222222222222', key: 'MOB-7', title: 'Implement offline data sync', type: 'story', status: 'todo', priority: 'high', reporter: 'Marcus Johnson', sprintId: 'bbbb3333-3333-3333-3333-333333333333', epicId: 'dddd3333-3333-3333-3333-333333333333', storyPoints: 13, labels: ['backend'], order: 7, createdAt: now, updatedAt: now },
    { id: 'i108', projectId: '22222222-2222-2222-2222-222222222222', key: 'MOB-8', title: 'Fix: App crash on task reorder', type: 'bug', status: 'in_progress', priority: 'critical', assignee: 'Priya Patel', reporter: 'Marcus Johnson', sprintId: 'bbbb2222-2222-2222-2222-222222222222', epicId: 'dddd2222-2222-2222-2222-222222222222', storyPoints: 3, labels: ['bug'], order: 8, createdAt: twoWeeksAgo, updatedAt: now },
    { id: 'i109', projectId: '22222222-2222-2222-2222-222222222222', key: 'MOB-9', title: 'Add biometric authentication', type: 'story', status: 'todo', priority: 'low', reporter: 'Marcus Johnson', storyPoints: 5, labels: ['security'], order: 9, createdAt: now, updatedAt: now },
    { id: 'i110', projectId: '22222222-2222-2222-2222-222222222222', key: 'MOB-10', title: 'Build widget for iOS home screen', type: 'story', status: 'todo', priority: 'low', reporter: 'Marcus Johnson', storyPoints: 8, labels: ['ios'], order: 10, createdAt: now, updatedAt: now },
  ],
};

export const mockAnnouncements: Announcement[] = [
  { id: 'ann-001', title: 'Sprint 2 Kickoff', body: 'Sprint 2 has begun! Focus areas: Board management and real-time updates. Daily standups at 9:30 AM.', type: 'info', author: 'Sarah Chen', pinned: true, createdAt: twoWeeksAgo, updatedAt: twoWeeksAgo },
  { id: 'ann-002', title: 'Deployment Window Friday', body: 'Production deployment scheduled for Friday 6-8 PM. Please merge all PRs by Thursday EOD.', type: 'warning', author: 'Marcus Johnson', pinned: false, createdAt: now, updatedAt: now },
  { id: 'ann-003', title: 'v1.0 Released!', body: 'Congratulations team! Canopy v1.0 is now live. Check out the release notes for details.', type: 'success', author: 'Sarah Chen', pinned: false, createdAt: fourWeeksAgo, updatedAt: fourWeeksAgo },
];

export function getMockDashboardStats(projectId: string): DashboardStats {
  const issues = mockIssues[projectId] || [];
  const totalIssues = issues.length;
  const completedIssues = issues.filter(i => i.status === 'done').length;
  const inProgressIssues = issues.filter(i => i.status === 'in_progress').length;
  const openIssues = totalIssues - completedIssues - issues.filter(i => i.status === 'cancelled').length;
  const totalStoryPoints = issues.reduce((s, i) => s + (i.storyPoints || 0), 0);
  const completedStoryPoints = issues.filter(i => i.status === 'done').reduce((s, i) => s + (i.storyPoints || 0), 0);

  const issuesByType: Record<string, number> = {};
  const issuesByPriority: Record<string, number> = {};
  issues.forEach(i => {
    issuesByType[i.type] = (issuesByType[i.type] || 0) + 1;
    issuesByPriority[i.priority] = (issuesByPriority[i.priority] || 0) + 1;
  });

  return {
    totalIssues,
    openIssues,
    completedIssues,
    inProgressIssues,
    totalStoryPoints,
    completedStoryPoints,
    issuesByType,
    issuesByPriority,
    recentActivity: issues.slice(0, 8).map(i => ({
      id: i.id,
      type: i.status === 'done' ? 'completed' as const : 'updated' as const,
      issueKey: i.key,
      issueTitle: i.title,
      actor: i.assignee || i.reporter,
      timestamp: i.updatedAt,
    })),
  };
}
