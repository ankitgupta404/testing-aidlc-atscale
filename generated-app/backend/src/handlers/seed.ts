import { PutCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../db/client';
import { successResponse } from '../utils/response';
import type { RouteHandler } from '../router';

export const seedHandler: RouteHandler = async () => {
  const now = new Date().toISOString();
  const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString();
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const twoWeeksFromNow = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  // Project IDs
  const canopyId = '11111111-1111-1111-1111-111111111111';
  const mobileId = '22222222-2222-2222-2222-222222222222';

  // Sprint IDs
  const canSprint1Id = 'aaaa1111-1111-1111-1111-111111111111';
  const canSprint2Id = 'aaaa2222-2222-2222-2222-222222222222';
  const canSprint3Id = 'aaaa3333-3333-3333-3333-333333333333';
  const mobSprint1Id = 'bbbb1111-1111-1111-1111-111111111111';
  const mobSprint2Id = 'bbbb2222-2222-2222-2222-222222222222';
  const mobSprint3Id = 'bbbb3333-3333-3333-3333-333333333333';

  // Epic IDs
  const canEpic1Id = 'cccc1111-1111-1111-1111-111111111111';
  const canEpic2Id = 'cccc2222-2222-2222-2222-222222222222';
  const canEpic3Id = 'cccc3333-3333-3333-3333-333333333333';
  const mobEpic1Id = 'dddd1111-1111-1111-1111-111111111111';
  const mobEpic2Id = 'dddd2222-2222-2222-2222-222222222222';
  const mobEpic3Id = 'dddd3333-3333-3333-3333-333333333333';

  const users = ['Sarah Chen', 'Marcus Johnson', 'Priya Patel', 'Alex Rivera'];
  const issueCounter = { can: 0, mob: 0 };

  function nextKey(project: 'can' | 'mob') {
    issueCounter[project]++;
    return project === 'can' ? `CAN-${issueCounter[project]}` : `MOB-${issueCounter[project]}`;
  }

  // All items to write
  const items: any[] = [];

  // Projects
  items.push({
    PK: `PROJECT#${canopyId}`, SK: `PROJECT#${canopyId}`,
    GSI1PK: 'PROJECTS', GSI1SK: 'PROJECT#Canopy Platform',
    id: canopyId, name: 'Canopy Platform', key: 'CAN',
    description: 'A full-featured project management application built with modern web technologies.',
    lead: 'Sarah Chen', avatarColor: '#1B4332', issueCounter: 0,
    createdAt: fourWeeksAgo, updatedAt: now,
  });

  items.push({
    PK: `PROJECT#${mobileId}`, SK: `PROJECT#${mobileId}`,
    GSI1PK: 'PROJECTS', GSI1SK: 'PROJECT#Mobile App',
    id: mobileId, name: 'Mobile App', key: 'MOB',
    description: 'Companion mobile application for Canopy with native features.',
    lead: 'Marcus Johnson', avatarColor: '#2563EB', issueCounter: 0,
    createdAt: fourWeeksAgo, updatedAt: now,
  });

  // Sprints - Canopy
  items.push({
    PK: `PROJECT#${canopyId}`, SK: `SPRINT#${canSprint1Id}`,
    GSI1PK: `PROJECT#${canopyId}`, GSI1SK: 'SPRINT#completed#Sprint 1',
    id: canSprint1Id, projectId: canopyId, name: 'Sprint 1', goal: 'Project foundation and core setup',
    status: 'completed', startDate: fourWeeksAgo, endDate: twoWeeksAgo,
    createdAt: fourWeeksAgo, updatedAt: twoWeeksAgo,
  });
  items.push({
    PK: `PROJECT#${canopyId}`, SK: `SPRINT#${canSprint2Id}`,
    GSI1PK: `PROJECT#${canopyId}`, GSI1SK: 'SPRINT#active#Sprint 2',
    id: canSprint2Id, projectId: canopyId, name: 'Sprint 2', goal: 'Board management and real-time updates',
    status: 'active', startDate: twoWeeksAgo, endDate: oneWeekFromNow,
    createdAt: twoWeeksAgo, updatedAt: now,
  });
  items.push({
    PK: `PROJECT#${canopyId}`, SK: `SPRINT#${canSprint3Id}`,
    GSI1PK: `PROJECT#${canopyId}`, GSI1SK: 'SPRINT#planning#Sprint 3',
    id: canSprint3Id, projectId: canopyId, name: 'Sprint 3', goal: 'Reporting and analytics',
    status: 'planning', startDate: oneWeekFromNow, endDate: twoWeeksFromNow,
    createdAt: now, updatedAt: now,
  });

  // Sprints - Mobile
  items.push({
    PK: `PROJECT#${mobileId}`, SK: `SPRINT#${mobSprint1Id}`,
    GSI1PK: `PROJECT#${mobileId}`, GSI1SK: 'SPRINT#completed#Sprint 1',
    id: mobSprint1Id, projectId: mobileId, name: 'Sprint 1', goal: 'Mobile app foundation',
    status: 'completed', startDate: fourWeeksAgo, endDate: twoWeeksAgo,
    createdAt: fourWeeksAgo, updatedAt: twoWeeksAgo,
  });
  items.push({
    PK: `PROJECT#${mobileId}`, SK: `SPRINT#${mobSprint2Id}`,
    GSI1PK: `PROJECT#${mobileId}`, GSI1SK: 'SPRINT#active#Sprint 2',
    id: mobSprint2Id, projectId: mobileId, name: 'Sprint 2', goal: 'Core features implementation',
    status: 'active', startDate: twoWeeksAgo, endDate: oneWeekFromNow,
    createdAt: twoWeeksAgo, updatedAt: now,
  });
  items.push({
    PK: `PROJECT#${mobileId}`, SK: `SPRINT#${mobSprint3Id}`,
    GSI1PK: `PROJECT#${mobileId}`, GSI1SK: 'SPRINT#planning#Sprint 3',
    id: mobSprint3Id, projectId: mobileId, name: 'Sprint 3', goal: 'Polish and testing',
    status: 'planning', startDate: oneWeekFromNow, endDate: twoWeeksFromNow,
    createdAt: now, updatedAt: now,
  });

  // Epics - Canopy
  items.push({
    PK: `PROJECT#${canopyId}`, SK: `EPIC#${canEpic1Id}`,
    GSI1PK: `PROJECT#${canopyId}`, GSI1SK: 'EPIC#done#User Authentication',
    id: canEpic1Id, projectId: canopyId, name: 'User Authentication',
    description: 'Set up user authentication and authorization',
    status: 'done', color: '#16A34A',
    createdAt: fourWeeksAgo, updatedAt: twoWeeksAgo,
  });
  items.push({
    PK: `PROJECT#${canopyId}`, SK: `EPIC#${canEpic2Id}`,
    GSI1PK: `PROJECT#${canopyId}`, GSI1SK: 'EPIC#in_progress#Board Management',
    id: canEpic2Id, projectId: canopyId, name: 'Board Management',
    description: 'Kanban board with drag-and-drop functionality',
    status: 'in_progress', color: '#2563EB',
    createdAt: fourWeeksAgo, updatedAt: now,
  });
  items.push({
    PK: `PROJECT#${canopyId}`, SK: `EPIC#${canEpic3Id}`,
    GSI1PK: `PROJECT#${canopyId}`, GSI1SK: 'EPIC#not_started#Reporting Dashboard',
    id: canEpic3Id, projectId: canopyId, name: 'Reporting Dashboard',
    description: 'Analytics and reporting features with charts',
    status: 'not_started', color: '#7C3AED',
    createdAt: fourWeeksAgo, updatedAt: fourWeeksAgo,
  });

  // Epics - Mobile
  items.push({
    PK: `PROJECT#${mobileId}`, SK: `EPIC#${mobEpic1Id}`,
    GSI1PK: `PROJECT#${mobileId}`, GSI1SK: 'EPIC#done#Core Setup',
    id: mobEpic1Id, projectId: mobileId, name: 'Core Setup',
    description: 'React Native project setup and navigation', status: 'done', color: '#16A34A',
    createdAt: fourWeeksAgo, updatedAt: twoWeeksAgo,
  });
  items.push({
    PK: `PROJECT#${mobileId}`, SK: `EPIC#${mobEpic2Id}`,
    GSI1PK: `PROJECT#${mobileId}`, GSI1SK: 'EPIC#in_progress#Task Management',
    id: mobEpic2Id, projectId: mobileId, name: 'Task Management',
    description: 'Mobile task management features', status: 'in_progress', color: '#2563EB',
    createdAt: fourWeeksAgo, updatedAt: now,
  });
  items.push({
    PK: `PROJECT#${mobileId}`, SK: `EPIC#${mobEpic3Id}`,
    GSI1PK: `PROJECT#${mobileId}`, GSI1SK: 'EPIC#not_started#Offline Support',
    id: mobEpic3Id, projectId: mobileId, name: 'Offline Support',
    description: 'Offline-first data sync', status: 'not_started', color: '#7C3AED',
    createdAt: fourWeeksAgo, updatedAt: fourWeeksAgo,
  });

  // Issues - Canopy Project
  const canopyIssues = [
    { title: 'Set up project scaffolding with Vite and React', type: 'task', status: 'done', priority: 'high', sprint: canSprint1Id, epic: canEpic1Id, points: 3, assignee: 'Sarah Chen' },
    { title: 'Design forest-inspired color palette', type: 'task', status: 'done', priority: 'medium', sprint: canSprint1Id, epic: canEpic1Id, points: 2, assignee: 'Alex Rivera' },
    { title: 'Implement DynamoDB single-table design', type: 'story', status: 'done', priority: 'high', sprint: canSprint1Id, epic: canEpic1Id, points: 8, assignee: 'Priya Patel' },
    { title: 'Create shared Zod schemas package', type: 'task', status: 'done', priority: 'high', sprint: canSprint1Id, epic: canEpic1Id, points: 5, assignee: 'Sarah Chen' },
    { title: 'Set up CDK infrastructure stack', type: 'story', status: 'done', priority: 'critical', sprint: canSprint1Id, epic: canEpic1Id, points: 8, assignee: 'Marcus Johnson' },
    { title: 'Implement project CRUD API', type: 'story', status: 'done', priority: 'high', sprint: canSprint1Id, epic: canEpic1Id, points: 5, assignee: 'Priya Patel' },
    { title: 'Build Kanban board with drag-and-drop', type: 'story', status: 'in_progress', priority: 'high', sprint: canSprint2Id, epic: canEpic2Id, points: 13, assignee: 'Sarah Chen' },
    { title: 'Add issue filtering and search', type: 'story', status: 'in_review', priority: 'medium', sprint: canSprint2Id, epic: canEpic2Id, points: 8, assignee: 'Priya Patel' },
    { title: 'Create burndown chart component', type: 'task', status: 'todo', priority: 'medium', sprint: canSprint2Id, epic: canEpic3Id, points: 5, assignee: 'Alex Rivera' },
    { title: 'Implement sprint lifecycle management', type: 'story', status: 'in_progress', priority: 'high', sprint: canSprint2Id, epic: canEpic2Id, points: 8, assignee: 'Marcus Johnson' },
    { title: 'Fix: Board cards not updating after drag', type: 'bug', status: 'in_progress', priority: 'high', sprint: canSprint2Id, epic: canEpic2Id, points: 3, assignee: 'Sarah Chen' },
    { title: 'Fix: Sprint dates not validating correctly', type: 'bug', status: 'todo', priority: 'medium', sprint: canSprint2Id, epic: canEpic2Id, points: 2, assignee: 'Priya Patel' },
    { title: 'Add optimistic updates for board moves', type: 'task', status: 'done', priority: 'medium', sprint: canSprint2Id, epic: canEpic2Id, points: 5, assignee: 'Sarah Chen' },
    { title: 'Implement issue comments with markdown', type: 'story', status: 'todo', priority: 'medium', sprint: canSprint3Id, epic: canEpic2Id, points: 5, assignee: 'Priya Patel' },
    { title: 'Add comment system to issues', type: 'story', status: 'todo', priority: 'medium', sprint: canSprint3Id, epic: canEpic2Id, points: 5, assignee: 'Marcus Johnson' },
    { title: 'Build velocity chart for reporting', type: 'task', status: 'todo', priority: 'low', sprint: null, epic: canEpic3Id, points: 5, assignee: null },
    { title: 'Mobile responsive layout', type: 'story', status: 'todo', priority: 'medium', sprint: null, epic: null, points: 8, assignee: null },
    { title: 'Add keyboard shortcuts', type: 'task', status: 'todo', priority: 'low', sprint: null, epic: null, points: 3, assignee: 'Alex Rivera' },
    { title: 'Performance optimization for large boards', type: 'task', status: 'todo', priority: 'low', sprint: null, epic: canEpic2Id, points: 5, assignee: null },
    { title: 'Add dark mode support', type: 'story', status: 'todo', priority: 'low', sprint: null, epic: null, points: 5, assignee: 'Alex Rivera' },
    { title: 'Fix: Issue counter reset on project update', type: 'bug', status: 'done', priority: 'critical', sprint: canSprint1Id, epic: canEpic1Id, points: 2, assignee: 'Sarah Chen' },
    { title: 'Create epic progress tracking', type: 'story', status: 'todo', priority: 'medium', sprint: canSprint3Id, epic: canEpic3Id, points: 8, assignee: null },
  ];

  for (const issue of canopyIssues) {
    const id = crypto.randomUUID();
    const key = nextKey('can');
    const gsi1pk = issue.sprint ? `SPRINT#${issue.sprint}` : `BACKLOG#${canopyId}`;
    const order = issueCounter.can;

    items.push({
      PK: `PROJECT#${canopyId}`, SK: `ISSUE#${id}`,
      GSI1PK: gsi1pk, GSI1SK: `ISSUE#${String(order).padStart(5, '0')}`,
      GSI2PK: issue.assignee ? `ASSIGNEE#${issue.assignee}` : 'UNASSIGNED',
      GSI2SK: `STATUS#${issue.status}#${id}`,
      id, projectId: canopyId, key, title: issue.title, type: issue.type,
      status: issue.status, priority: issue.priority,
      assignee: issue.assignee || undefined, reporter: 'Sarah Chen',
      epicId: issue.epic || undefined, sprintId: issue.sprint || undefined,
      storyPoints: issue.points, labels: [], order,
      createdAt: fourWeeksAgo, updatedAt: issue.status === 'done' ? twoWeeksAgo : now,
    });
  }

  // Issues - Mobile Project
  const mobileIssues = [
    { title: 'Initialize React Native project', type: 'task', status: 'done', priority: 'high', sprint: mobSprint1Id, epic: mobEpic1Id, points: 3, assignee: 'Marcus Johnson' },
    { title: 'Set up navigation with React Navigation', type: 'task', status: 'done', priority: 'high', sprint: mobSprint1Id, epic: mobEpic1Id, points: 5, assignee: 'Marcus Johnson' },
    { title: 'Configure CI/CD for mobile builds', type: 'task', status: 'done', priority: 'medium', sprint: mobSprint1Id, epic: mobEpic1Id, points: 8, assignee: 'Priya Patel' },
    { title: 'Build task list view with filters', type: 'story', status: 'in_progress', priority: 'high', sprint: mobSprint2Id, epic: mobEpic2Id, points: 8, assignee: 'Marcus Johnson' },
    { title: 'Implement task detail screen', type: 'story', status: 'in_review', priority: 'high', sprint: mobSprint2Id, epic: mobEpic2Id, points: 5, assignee: 'Priya Patel' },
    { title: 'Add push notifications', type: 'story', status: 'todo', priority: 'medium', sprint: mobSprint2Id, epic: mobEpic2Id, points: 8, assignee: 'Marcus Johnson' },
    { title: 'Implement offline data sync', type: 'story', status: 'todo', priority: 'high', sprint: mobSprint3Id, epic: mobEpic3Id, points: 13, assignee: null },
    { title: 'Fix: App crash on task reorder', type: 'bug', status: 'in_progress', priority: 'critical', sprint: mobSprint2Id, epic: mobEpic2Id, points: 3, assignee: 'Priya Patel' },
    { title: 'Add biometric authentication', type: 'story', status: 'todo', priority: 'low', sprint: null, epic: null, points: 5, assignee: null },
    { title: 'Build widget for iOS home screen', type: 'story', status: 'todo', priority: 'low', sprint: null, epic: null, points: 8, assignee: null },
  ];

  for (const issue of mobileIssues) {
    const id = crypto.randomUUID();
    const key = nextKey('mob');
    const gsi1pk = issue.sprint ? `SPRINT#${issue.sprint}` : `BACKLOG#${mobileId}`;
    const order = issueCounter.mob;

    items.push({
      PK: `PROJECT#${mobileId}`, SK: `ISSUE#${id}`,
      GSI1PK: gsi1pk, GSI1SK: `ISSUE#${String(order).padStart(5, '0')}`,
      GSI2PK: issue.assignee ? `ASSIGNEE#${issue.assignee}` : 'UNASSIGNED',
      GSI2SK: `STATUS#${issue.status}#${id}`,
      id, projectId: mobileId, key, title: issue.title, type: issue.type,
      status: issue.status, priority: issue.priority,
      assignee: issue.assignee || undefined, reporter: 'Marcus Johnson',
      epicId: issue.epic || undefined, sprintId: issue.sprint || undefined,
      storyPoints: issue.points, labels: [], order,
      createdAt: fourWeeksAgo, updatedAt: issue.status === 'done' ? twoWeeksAgo : now,
    });
  }

  // Update project issue counters
  items[0].issueCounter = issueCounter.can;
  items[1].issueCounter = issueCounter.mob;

  // Announcements
  items.push({
    PK: 'ANNOUNCEMENTS', SK: 'ANNOUNCEMENT#ann-001',
    GSI1PK: 'ANN_TYPE#info', GSI1SK: `ANNOUNCEMENT#${now}`,
    id: 'ann-001', title: 'Sprint 2 Kickoff', body: 'Sprint 2 has begun! Focus areas: Board management and real-time updates. Daily standups at 9:30 AM.',
    type: 'info', author: 'Sarah Chen', pinned: true,
    createdAt: twoWeeksAgo, updatedAt: twoWeeksAgo,
  });
  items.push({
    PK: 'ANNOUNCEMENTS', SK: 'ANNOUNCEMENT#ann-002',
    GSI1PK: 'ANN_TYPE#warning', GSI1SK: `ANNOUNCEMENT#${now}`,
    id: 'ann-002', title: 'Deployment Window Friday', body: 'Production deployment scheduled for Friday 6-8 PM. Please merge all PRs by Thursday EOD.',
    type: 'warning', author: 'Marcus Johnson', pinned: false,
    createdAt: now, updatedAt: now,
  });
  items.push({
    PK: 'ANNOUNCEMENTS', SK: 'ANNOUNCEMENT#ann-003',
    GSI1PK: 'ANN_TYPE#success', GSI1SK: `ANNOUNCEMENT#${fourWeeksAgo}`,
    id: 'ann-003', title: 'v1.0 Released!', body: 'Congratulations team! Canopy v1.0 is now live. Check out the release notes for details.',
    type: 'success', author: 'Sarah Chen', pinned: false,
    createdAt: fourWeeksAgo, updatedAt: fourWeeksAgo,
  });

  // Write items in batches of 25 (DynamoDB limit)
  const batches = [];
  for (let i = 0; i < items.length; i += 25) {
    batches.push(items.slice(i, i + 25));
  }

  for (const batch of batches) {
    await docClient.send(new BatchWriteCommand({
      RequestItems: {
        [TABLE_NAME]: batch.map((item) => ({
          PutRequest: { Item: item },
        })),
      },
    }));
  }

  return successResponse({ success: true, message: `Seeded ${items.length} items successfully` });
};
