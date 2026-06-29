import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../db/client';
import { getQueryParams } from '../utils/validation';
import { successResponse } from '../utils/response';
import type { RouteHandler } from '../router';

const dashboard: RouteHandler = async (_event, params) => {
  const { projectId } = params;

  // Get all issues for the project
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `PROJECT#${projectId}`,
      ':sk': 'ISSUE#',
    },
  }));

  const issues = result.Items || [];

  const totalIssues = issues.length;
  const openIssues = issues.filter((i) => i.status === 'todo' || i.status === 'in_progress' || i.status === 'in_review').length;
  const completedIssues = issues.filter((i) => i.status === 'done').length;
  const inProgressIssues = issues.filter((i) => i.status === 'in_progress').length;
  const totalStoryPoints = issues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
  const completedStoryPoints = issues
    .filter((i) => i.status === 'done')
    .reduce((sum, i) => sum + (i.storyPoints || 0), 0);

  const issuesByType: Record<string, number> = {};
  const issuesByPriority: Record<string, number> = {};
  issues.forEach((i) => {
    issuesByType[i.type] = (issuesByType[i.type] || 0) + 1;
    issuesByPriority[i.priority] = (issuesByPriority[i.priority] || 0) + 1;
  });

  // Recent activity (sorted by updatedAt)
  const recentIssues = [...issues]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 10);

  const recentActivity = recentIssues.map((i) => ({
    id: i.id,
    type: i.status === 'done' ? 'completed' as const : 'updated' as const,
    issueKey: i.key,
    issueTitle: i.title,
    actor: i.assignee || i.reporter,
    timestamp: i.updatedAt,
  }));

  return successResponse({
    stats: {
      totalIssues,
      openIssues,
      completedIssues,
      inProgressIssues,
      totalStoryPoints,
      completedStoryPoints,
      issuesByType,
      issuesByPriority,
      recentActivity,
    },
  });
};

const burndown: RouteHandler = async (event, params) => {
  const { projectId } = params;
  const query = getQueryParams(event);
  const sprintId = query.sprintId;

  if (!sprintId) {
    return successResponse({ data: [] });
  }

  // Get issues in the sprint
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `SPRINT#${sprintId}`,
      ':sk': 'ISSUE#',
    },
  }));

  const issues = result.Items || [];
  const totalPoints = issues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);

  // Generate burndown data (simplified - 14 days)
  const data = [];
  for (let day = 0; day <= 13; day++) {
    const date = new Date();
    date.setDate(date.getDate() - 13 + day);
    const ideal = totalPoints - (totalPoints / 13) * day;
    const completedByDay = issues
      .filter((i) => i.status === 'done' && new Date(i.updatedAt) <= date)
      .reduce((sum, i) => sum + (i.storyPoints || 0), 0);
    data.push({
      date: date.toISOString().split('T')[0],
      ideal: Math.max(0, Math.round(ideal * 10) / 10),
      actual: totalPoints - completedByDay,
    });
  }

  return successResponse({ data });
};

const velocity: RouteHandler = async (_event, params) => {
  const { projectId } = params;

  // Get all sprints for the project
  const sprintsResult = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `PROJECT#${projectId}`,
      ':sk': 'SPRINT#',
    },
  }));

  const sprints = (sprintsResult.Items || []).filter((s) => s.status === 'completed' || s.status === 'active');

  const data = [];
  for (const sprint of sprints) {
    // Get issues for this sprint
    const issuesResult = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `SPRINT#${sprint.id}`,
        ':sk': 'ISSUE#',
      },
    }));

    const sprintIssues = issuesResult.Items || [];
    const committed = sprintIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
    const completed = sprintIssues
      .filter((i) => i.status === 'done')
      .reduce((sum, i) => sum + (i.storyPoints || 0), 0);

    data.push({
      sprintName: sprint.name,
      committed,
      completed,
    });
  }

  return successResponse({ data });
};

export const boardHandlers = { dashboard, burndown, velocity };
