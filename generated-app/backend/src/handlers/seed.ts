import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { RouteResult } from '../router';
import { docClient, TABLE_NAME } from '../db/client';
import { BatchWriteCommand } from '@aws-sdk/lib-dynamodb';

const USERS = [
  { id: '10000000-0000-0000-0000-000000000001', name: 'Alice Chen', email: 'alice@canopy.dev', role: 'admin', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: '10000000-0000-0000-0000-000000000002', name: 'Bob Martinez', email: 'bob@canopy.dev', role: 'member', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: '10000000-0000-0000-0000-000000000003', name: 'Carol Williams', email: 'carol@canopy.dev', role: 'member', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: '10000000-0000-0000-0000-000000000004', name: 'David Park', email: 'david@canopy.dev', role: 'member', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: '10000000-0000-0000-0000-000000000005', name: 'Eva Thompson', email: 'eva@canopy.dev', role: 'member', createdAt: '2024-01-01T00:00:00.000Z' },
];

const PROJECT_ID = '20000000-0000-0000-0000-000000000001';
const SPRINT1_ID = '30000000-0000-0000-0000-000000000001';
const SPRINT2_ID = '30000000-0000-0000-0000-000000000002';
const SPRINT3_ID = '30000000-0000-0000-0000-000000000003';
const EPIC1_ID = '40000000-0000-0000-0000-000000000001';
const EPIC2_ID = '40000000-0000-0000-0000-000000000002';
const EPIC3_ID = '40000000-0000-0000-0000-000000000003';
const BOARD_ID = '50000000-0000-0000-0000-000000000001';

function makeIssueId(n: number): string {
  return `60000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
}

export async function handleSeed(_event: APIGatewayProxyEventV2): Promise<RouteResult> {
  const now = new Date().toISOString();
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const twoWeeksFromNow = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  const fourWeeksFromNow = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString();

  const items: Record<string, unknown>[] = [];

  // Users
  for (const user of USERS) {
    items.push({
      PK: `USER#${user.id}`,
      SK: `USER#${user.id}`,
      GSI1PK: 'ORG#default',
      GSI1SK: `USER#${user.id}`,
      ...user,
      entityType: 'User',
    });
  }

  // Project
  items.push({
    PK: `PROJECT#${PROJECT_ID}`,
    SK: `PROJECT#${PROJECT_ID}`,
    GSI1PK: 'ORG#default',
    GSI1SK: `PROJECT#${PROJECT_ID}`,
    id: PROJECT_ID,
    name: 'Canopy Platform',
    key: 'CAN',
    description: 'The main Canopy project management platform',
    leadUserId: USERS[0].id,
    status: 'active',
    issueCounter: 20,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: now,
    entityType: 'Project',
  });

  // Board
  items.push({
    PK: `PROJECT#${PROJECT_ID}`,
    SK: `BOARD#${BOARD_ID}`,
    id: BOARD_ID,
    projectId: PROJECT_ID,
    name: 'Default Board',
    columns: [
      { id: crypto.randomUUID(), name: 'Backlog', status: 'backlog', order: 0 },
      { id: crypto.randomUUID(), name: 'To Do', status: 'todo', order: 1 },
      { id: crypto.randomUUID(), name: 'In Progress', status: 'in_progress', order: 2 },
      { id: crypto.randomUUID(), name: 'In Review', status: 'in_review', order: 3 },
      { id: crypto.randomUUID(), name: 'Done', status: 'done', order: 4 },
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: now,
    entityType: 'Board',
  });

  // Sprints
  items.push({
    PK: `PROJECT#${PROJECT_ID}`,
    SK: `SPRINT#${SPRINT1_ID}`,
    GSI1PK: `PROJECT#${PROJECT_ID}`,
    GSI1SK: `SPRINT#${twoWeeksAgo}`,
    id: SPRINT1_ID,
    projectId: PROJECT_ID,
    name: 'Sprint 1 - Foundation',
    goal: 'Set up project structure and basic auth',
    status: 'completed',
    startDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: twoWeeksAgo,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: now,
    entityType: 'Sprint',
  });

  items.push({
    PK: `PROJECT#${PROJECT_ID}`,
    SK: `SPRINT#${SPRINT2_ID}`,
    GSI1PK: `PROJECT#${PROJECT_ID}`,
    GSI1SK: `SPRINT#${now}`,
    id: SPRINT2_ID,
    projectId: PROJECT_ID,
    name: 'Sprint 2 - Core Features',
    goal: 'Build kanban board and sprint management',
    status: 'active',
    startDate: twoWeeksAgo,
    endDate: twoWeeksFromNow,
    createdAt: twoWeeksAgo,
    updatedAt: now,
    entityType: 'Sprint',
  });

  items.push({
    PK: `PROJECT#${PROJECT_ID}`,
    SK: `SPRINT#${SPRINT3_ID}`,
    GSI1PK: `PROJECT#${PROJECT_ID}`,
    GSI1SK: `SPRINT#${twoWeeksFromNow}`,
    id: SPRINT3_ID,
    projectId: PROJECT_ID,
    name: 'Sprint 3 - Polish',
    goal: 'Mobile responsiveness and performance',
    status: 'planning',
    startDate: twoWeeksFromNow,
    endDate: fourWeeksFromNow,
    createdAt: now,
    updatedAt: now,
    entityType: 'Sprint',
  });

  // Epics
  items.push({
    PK: `PROJECT#${PROJECT_ID}`,
    SK: `EPIC#${EPIC1_ID}`,
    GSI1PK: `PROJECT#${PROJECT_ID}`,
    GSI1SK: `EPIC#${EPIC1_ID}`,
    GSI2PK: `PROJECT#${PROJECT_ID}`,
    GSI2SK: `EPIC#${EPIC1_ID}`,
    id: EPIC1_ID,
    projectId: PROJECT_ID,
    name: 'User Authentication',
    description: 'Complete authentication system with login, signup, and password reset',
    status: 'done',
    color: '#16a34a',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: now,
    entityType: 'Epic',
  });

  items.push({
    PK: `PROJECT#${PROJECT_ID}`,
    SK: `EPIC#${EPIC2_ID}`,
    GSI1PK: `PROJECT#${PROJECT_ID}`,
    GSI1SK: `EPIC#${EPIC2_ID}`,
    GSI2PK: `PROJECT#${PROJECT_ID}`,
    GSI2SK: `EPIC#${EPIC2_ID}`,
    id: EPIC2_ID,
    projectId: PROJECT_ID,
    name: 'Project Management Core',
    description: 'Core project management features including boards, sprints, and issues',
    status: 'in_progress',
    color: '#0284c7',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: now,
    entityType: 'Epic',
  });

  items.push({
    PK: `PROJECT#${PROJECT_ID}`,
    SK: `EPIC#${EPIC3_ID}`,
    GSI1PK: `PROJECT#${PROJECT_ID}`,
    GSI1SK: `EPIC#${EPIC3_ID}`,
    GSI2PK: `PROJECT#${PROJECT_ID}`,
    GSI2SK: `EPIC#${EPIC3_ID}`,
    id: EPIC3_ID,
    projectId: PROJECT_ID,
    name: 'Reporting & Analytics',
    description: 'Dashboard, burndown charts, velocity tracking',
    status: 'draft',
    color: '#7c3aed',
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: now,
    entityType: 'Epic',
  });

  // Issues
  const issueData = [
    { n: 1, title: 'Set up project structure', type: 'task', status: 'done', priority: 'high', assigneeId: USERS[0].id, sprintId: SPRINT1_ID, epicId: EPIC1_ID, storyPoints: 3 },
    { n: 2, title: 'Design authentication flow', type: 'story', status: 'done', priority: 'high', assigneeId: USERS[2].id, sprintId: SPRINT1_ID, epicId: EPIC1_ID, storyPoints: 5 },
    { n: 3, title: 'Implement login page', type: 'story', status: 'done', priority: 'high', assigneeId: USERS[1].id, sprintId: SPRINT1_ID, epicId: EPIC1_ID, storyPoints: 8 },
    { n: 4, title: 'Create project CRUD API', type: 'story', status: 'done', priority: 'high', assigneeId: USERS[3].id, sprintId: SPRINT1_ID, epicId: EPIC2_ID, storyPoints: 5 },
    { n: 5, title: 'Build Kanban board component', type: 'story', status: 'in_progress', priority: 'critical', assigneeId: USERS[1].id, sprintId: SPRINT2_ID, epicId: EPIC2_ID, storyPoints: 13 },
    { n: 6, title: 'Add drag-and-drop to board', type: 'task', status: 'in_progress', priority: 'high', assigneeId: USERS[1].id, sprintId: SPRINT2_ID, epicId: EPIC2_ID, storyPoints: 8 },
    { n: 7, title: 'Design dashboard layout', type: 'story', status: 'in_review', priority: 'medium', assigneeId: USERS[2].id, sprintId: SPRINT2_ID, epicId: EPIC3_ID, storyPoints: 5 },
    { n: 8, title: 'Implement burndown chart', type: 'story', status: 'todo', priority: 'medium', assigneeId: USERS[3].id, sprintId: SPRINT2_ID, epicId: EPIC3_ID, storyPoints: 8 },
    { n: 9, title: 'Fix board column overflow', type: 'bug', status: 'todo', priority: 'high', assigneeId: USERS[1].id, sprintId: SPRINT2_ID, epicId: EPIC2_ID, storyPoints: 3 },
    { n: 10, title: 'Add issue filtering', type: 'story', status: 'todo', priority: 'medium', assigneeId: USERS[0].id, sprintId: SPRINT2_ID, epicId: EPIC2_ID, storyPoints: 5 },
    { n: 11, title: 'Sprint planning improvements', type: 'story', status: 'backlog', priority: 'medium', assigneeId: USERS[0].id, sprintId: SPRINT3_ID, epicId: EPIC2_ID, storyPoints: 8 },
    { n: 12, title: 'Mobile responsive layout', type: 'story', status: 'backlog', priority: 'high', assigneeId: USERS[2].id, sprintId: SPRINT3_ID, epicId: EPIC2_ID, storyPoints: 13 },
    { n: 13, title: 'Performance optimization', type: 'task', status: 'backlog', priority: 'medium', assigneeId: USERS[3].id, sprintId: undefined, epicId: undefined, storyPoints: 5 },
    { n: 14, title: 'Add keyboard shortcuts', type: 'story', status: 'backlog', priority: 'low', assigneeId: USERS[1].id, sprintId: undefined, epicId: undefined, storyPoints: 3 },
    { n: 15, title: 'Write API documentation', type: 'task', status: 'backlog', priority: 'low', assigneeId: USERS[4].id, sprintId: undefined, epicId: undefined, storyPoints: 2 },
    { n: 16, title: 'Add epic progress tracking', type: 'story', status: 'backlog', priority: 'medium', assigneeId: USERS[3].id, sprintId: SPRINT3_ID, epicId: EPIC3_ID, storyPoints: 5 },
    { n: 17, title: 'Implement velocity chart', type: 'story', status: 'backlog', priority: 'medium', assigneeId: USERS[3].id, sprintId: SPRINT3_ID, epicId: EPIC3_ID, storyPoints: 8 },
    { n: 18, title: 'Fix issue ordering bug', type: 'bug', status: 'in_progress', priority: 'high', assigneeId: USERS[0].id, sprintId: SPRINT2_ID, epicId: EPIC2_ID, storyPoints: 2 },
    { n: 19, title: 'Add announcement system', type: 'story', status: 'in_review', priority: 'medium', assigneeId: USERS[4].id, sprintId: SPRINT2_ID, epicId: EPIC2_ID, storyPoints: 5 },
    { n: 20, title: 'Setup CI/CD pipeline', type: 'task', status: 'done', priority: 'critical', assigneeId: USERS[3].id, sprintId: SPRINT1_ID, epicId: EPIC1_ID, storyPoints: 3 },
  ];

  for (const issue of issueData) {
    const issueId = makeIssueId(issue.n);
    const item: Record<string, unknown> = {
      PK: `PROJECT#${PROJECT_ID}`,
      SK: `ISSUE#${issueId}`,
      GSI1PK: `PROJECT#${PROJECT_ID}#STATUS#${issue.status}`,
      GSI1SK: `ISSUE#${issueId}`,
      GSI2PK: `ASSIGNEE#${issue.assigneeId}`,
      GSI2SK: `ISSUE#${issueId}`,
      id: issueId,
      projectId: PROJECT_ID,
      key: `CAN-${issue.n}`,
      title: issue.title,
      type: issue.type,
      status: issue.status,
      priority: issue.priority,
      assigneeId: issue.assigneeId,
      reporterId: USERS[0].id,
      storyPoints: issue.storyPoints,
      labels: [],
      order: issue.n * 1000,
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: now,
      entityType: 'Issue',
    };
    if (issue.sprintId) {
      item.sprintId = issue.sprintId;
      item.GSI3PK = `SPRINT#${issue.sprintId}`;
      item.GSI3SK = `ISSUE#${issueId}`;
    }
    if (issue.epicId) {
      item.epicId = issue.epicId;
    }
    items.push(item);
  }

  // Announcements
  items.push({
    PK: 'ANNOUNCEMENT',
    SK: `ANNOUNCEMENT#70000000-0000-0000-0000-000000000001`,
    GSI3PK: 'ANNOUNCEMENT',
    GSI3SK: `DATE#${now}`,
    id: '70000000-0000-0000-0000-000000000001',
    title: 'Welcome to Canopy!',
    body: 'We are excited to launch Canopy, our new project management platform. Explore the features and let us know what you think!',
    priority: 'info',
    authorId: USERS[0].id,
    pinned: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: now,
    entityType: 'Announcement',
  });

  items.push({
    PK: 'ANNOUNCEMENT',
    SK: `ANNOUNCEMENT#70000000-0000-0000-0000-000000000002`,
    GSI3PK: 'ANNOUNCEMENT',
    GSI3SK: `DATE#${now}`,
    id: '70000000-0000-0000-0000-000000000002',
    title: 'Sprint 2 kickoff - Monday standup at 9am',
    body: 'Sprint 2 starts this Monday. Please review the sprint backlog and flag any blockers before the planning session.',
    priority: 'info',
    authorId: USERS[0].id,
    pinned: false,
    createdAt: twoWeeksAgo,
    updatedAt: now,
    entityType: 'Announcement',
  });

  items.push({
    PK: 'ANNOUNCEMENT',
    SK: `ANNOUNCEMENT#70000000-0000-0000-0000-000000000003`,
    GSI3PK: 'ANNOUNCEMENT',
    GSI3SK: `DATE#${now}`,
    id: '70000000-0000-0000-0000-000000000003',
    title: 'Production deploy scheduled for Friday 5pm',
    body: 'We will be deploying the latest changes to production on Friday at 5pm EST. Please ensure all PRs are merged by Thursday EOD.',
    priority: 'warning',
    authorId: USERS[3].id,
    pinned: false,
    createdAt: now,
    updatedAt: now,
    entityType: 'Announcement',
  });

  // Comments
  const commentItems = [
    { id: '80000000-0000-0000-0000-000000000001', issueId: makeIssueId(5), authorId: USERS[1].id, body: 'Making good progress on the board. DnD is tricky but coming along.' },
    { id: '80000000-0000-0000-0000-000000000002', issueId: makeIssueId(5), authorId: USERS[2].id, body: 'Let me know if you need design help with the drag states.' },
    { id: '80000000-0000-0000-0000-000000000003', issueId: makeIssueId(7), authorId: USERS[2].id, body: 'Dashboard mockups are in Figma. Reviewing with team tomorrow.' },
    { id: '80000000-0000-0000-0000-000000000004', issueId: makeIssueId(9), authorId: USERS[4].id, body: 'This happens when there are more than 10 cards in a column.' },
  ];

  for (const comment of commentItems) {
    items.push({
      PK: `ISSUE#${comment.issueId}`,
      SK: `COMMENT#${comment.id}`,
      id: comment.id,
      issueId: comment.issueId,
      authorId: comment.authorId,
      body: comment.body,
      createdAt: now,
      updatedAt: now,
      entityType: 'Comment',
    });
  }

  // Write all items in batches of 25
  const batches: Record<string, unknown>[][] = [];
  for (let i = 0; i < items.length; i += 25) {
    batches.push(items.slice(i, i + 25));
  }

  for (const batch of batches) {
    await docClient.send(new BatchWriteCommand({
      RequestItems: {
        [TABLE_NAME]: batch.map(item => ({
          PutRequest: { Item: item },
        })),
      },
    }));
  }

  return {
    statusCode: 200,
    body: { success: true, data: { message: `Seeded ${items.length} items`, itemCount: items.length } },
  };
}
