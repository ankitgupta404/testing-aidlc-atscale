import { PutCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../db/client';
import { CreateSprintInputSchema, UpdateSprintInputSchema } from '@canopy/shared';
import { parseBody } from '../utils/validation';
import { successResponse, createdResponse, notFoundResponse, errorResponse } from '../utils/response';
import type { RouteHandler } from '../router';

const list: RouteHandler = async (_event, params) => {
  const { projectId } = params;

  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `PROJECT#${projectId}`,
      ':sk': 'SPRINT#',
    },
  }));

  const sprints = (result.Items || []).map(stripKeys);
  return successResponse({ sprints });
};

const create: RouteHandler = async (event, params) => {
  const { projectId } = params;
  const parsed = parseBody(event, CreateSprintInputSchema);
  if (!parsed.success) return parsed.error;

  const { data } = parsed;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const sprint = {
    id,
    projectId,
    name: data.name,
    goal: data.goal,
    status: 'planning' as const,
    startDate: data.startDate,
    endDate: data.endDate,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `PROJECT#${projectId}`,
      SK: `SPRINT#${id}`,
      GSI1PK: `PROJECT#${projectId}`,
      GSI1SK: `SPRINT#planning#${data.name}`,
      ...sprint,
    },
  }));

  return createdResponse({ sprint });
};

const update: RouteHandler = async (event, params) => {
  const { projectId, sprintId } = params;
  const parsed = parseBody(event, UpdateSprintInputSchema);
  if (!parsed.success) return parsed.error;

  const { data } = parsed;
  const now = new Date().toISOString();

  const expressions: string[] = ['#updatedAt = :updatedAt'];
  const names: Record<string, string> = { '#updatedAt': 'updatedAt' };
  const values: Record<string, unknown> = { ':updatedAt': now };

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      expressions.push(`#${key} = :${key}`);
      names[`#${key}`] = key;
      values[`:${key}`] = value;
    }
  });

  try {
    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `PROJECT#${projectId}`, SK: `SPRINT#${sprintId}` },
      UpdateExpression: `SET ${expressions.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ConditionExpression: 'attribute_exists(PK)',
      ReturnValues: 'ALL_NEW',
    }));

    return successResponse({ sprint: stripKeys(result.Attributes!) });
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      return notFoundResponse('Sprint');
    }
    throw error;
  }
};

const start: RouteHandler = async (_event, params) => {
  const { projectId, sprintId } = params;
  const now = new Date().toISOString();

  // Check no other sprint is active
  const sprintsResult = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `PROJECT#${projectId}`,
      ':sk': 'SPRINT#',
    },
  }));

  const activeSprint = sprintsResult.Items?.find((s) => s.status === 'active' && s.id !== sprintId);
  if (activeSprint) {
    return errorResponse(409, 'CONFLICT', 'Another sprint is already active');
  }

  const result = await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { PK: `PROJECT#${projectId}`, SK: `SPRINT#${sprintId}` },
    UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt, startDate = if_not_exists(startDate, :startDate)',
    ExpressionAttributeNames: { '#status': 'status', '#updatedAt': 'updatedAt' },
    ExpressionAttributeValues: { ':status': 'active', ':updatedAt': now, ':startDate': now },
    ReturnValues: 'ALL_NEW',
  }));

  return successResponse({ sprint: stripKeys(result.Attributes!) });
};

const complete: RouteHandler = async (_event, params) => {
  const { projectId, sprintId } = params;
  const now = new Date().toISOString();

  // Get all issues in this sprint
  const issuesResult = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `SPRINT#${sprintId}`,
      ':sk': 'ISSUE#',
    },
  }));

  // Move incomplete issues to backlog
  let movedToBacklog = 0;
  const incompleteIssues = (issuesResult.Items || []).filter(
    (i) => i.status !== 'done' && i.status !== 'cancelled'
  );

  for (const issue of incompleteIssues) {
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: issue.PK, SK: issue.SK },
      UpdateExpression: 'SET sprintId = :null, GSI1PK = :backlog, #updatedAt = :now',
      ExpressionAttributeNames: { '#updatedAt': 'updatedAt' },
      ExpressionAttributeValues: {
        ':null': null,
        ':backlog': `BACKLOG#${projectId}`,
        ':now': now,
      },
    }));
    movedToBacklog++;
  }

  // Mark sprint as completed
  const result = await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { PK: `PROJECT#${projectId}`, SK: `SPRINT#${sprintId}` },
    UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt, endDate = if_not_exists(endDate, :endDate)',
    ExpressionAttributeNames: { '#status': 'status', '#updatedAt': 'updatedAt' },
    ExpressionAttributeValues: { ':status': 'completed', ':updatedAt': now, ':endDate': now },
    ReturnValues: 'ALL_NEW',
  }));

  return successResponse({ sprint: stripKeys(result.Attributes!), movedToBacklog });
};

const del: RouteHandler = async (_event, params) => {
  const { projectId, sprintId } = params;

  await docClient.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { PK: `PROJECT#${projectId}`, SK: `SPRINT#${sprintId}` },
  }));

  return successResponse({ success: true });
};

function stripKeys(item: Record<string, any>): Record<string, any> {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...rest } = item;
  return rest;
}

export const sprintHandlers = { list, create, update, start, complete, delete: del };
