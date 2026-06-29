import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { PutCommand, QueryCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../db/client';
import { CreateIssueInputSchema, UpdateIssueInputSchema, MoveIssueInputSchema, CreateCommentInputSchema } from '@canopy/shared';
import { parseBody, getQueryParams } from '../utils/validation';
import { successResponse, createdResponse, notFoundResponse, errorResponse } from '../utils/response';
import type { RouteHandler } from '../router';

const list: RouteHandler = async (event, params) => {
  const { projectId } = params;
  const query = getQueryParams(event);

  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `PROJECT#${projectId}`,
      ':sk': 'ISSUE#',
    },
  }));

  let issues = (result.Items || []).map(stripKeys);

  // Apply filters
  if (query.status) {
    issues = issues.filter((i: any) => i.status === query.status);
  }
  if (query.priority) {
    issues = issues.filter((i: any) => i.priority === query.priority);
  }
  if (query.assignee) {
    issues = issues.filter((i: any) => i.assignee === query.assignee);
  }
  if (query.epicId) {
    issues = issues.filter((i: any) => i.epicId === query.epicId);
  }
  if (query.sprintId) {
    issues = issues.filter((i: any) => i.sprintId === query.sprintId);
  }
  if (query.type) {
    issues = issues.filter((i: any) => i.type === query.type);
  }
  if (query.search) {
    const s = query.search.toLowerCase();
    issues = issues.filter((i: any) =>
      i.title.toLowerCase().includes(s) ||
      (i.description && i.description.toLowerCase().includes(s)) ||
      i.key.toLowerCase().includes(s)
    );
  }

  // Sort
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  issues.sort((a: any, b: any) => {
    const aVal = a[sortBy] || '';
    const bVal = b[sortBy] || '';
    return aVal > bVal ? sortOrder : aVal < bVal ? -sortOrder : 0;
  });

  return successResponse({ issues, total: issues.length });
};

const create: RouteHandler = async (event, params) => {
  const { projectId } = params;
  const parsed = parseBody(event, CreateIssueInputSchema);
  if (!parsed.success) return parsed.error;

  const { data } = parsed;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  // Get project to increment issue counter
  const projectResult = await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { PK: `PROJECT#${projectId}`, SK: `PROJECT#${projectId}` },
    UpdateExpression: 'SET issueCounter = if_not_exists(issueCounter, :zero) + :inc',
    ExpressionAttributeValues: { ':zero': 0, ':inc': 1 },
    ReturnValues: 'ALL_NEW',
  }));

  const project = projectResult.Attributes!;
  const issueKey = `${project.key}-${project.issueCounter}`;

  const issue = {
    id,
    projectId,
    key: issueKey,
    title: data.title,
    description: data.description,
    type: data.type,
    status: 'todo' as const,
    priority: data.priority,
    assignee: data.assignee,
    reporter: data.reporter,
    epicId: data.epicId,
    sprintId: data.sprintId,
    storyPoints: data.storyPoints,
    labels: data.labels || [],
    order: 0,
    parentId: data.parentId,
    createdAt: now,
    updatedAt: now,
  };

  const gsi1pk = data.sprintId ? `SPRINT#${data.sprintId}` : `BACKLOG#${projectId}`;

  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `PROJECT#${projectId}`,
      SK: `ISSUE#${id}`,
      GSI1PK: gsi1pk,
      GSI1SK: `ISSUE#${String(issue.order).padStart(5, '0')}`,
      GSI2PK: data.assignee ? `ASSIGNEE#${data.assignee}` : 'UNASSIGNED',
      GSI2SK: `STATUS#${issue.status}#${id}`,
      ...issue,
    },
  }));

  return createdResponse({ issue });
};

const get: RouteHandler = async (_event, params) => {
  const { projectId, issueId } = params;

  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: `PROJECT#${projectId}`, SK: `ISSUE#${issueId}` },
  }));

  if (!result.Item) return notFoundResponse('Issue');

  // Get comments
  const commentsResult = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `ISSUE#${issueId}`,
      ':sk': 'COMMENT#',
    },
  }));

  const issue = stripKeys(result.Item);
  const comments = (commentsResult.Items || []).map(stripKeys);

  return successResponse({ issue, comments });
};

const update: RouteHandler = async (event, params) => {
  const { projectId, issueId } = params;
  const parsed = parseBody(event, UpdateIssueInputSchema);
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
      values[`:${key}`] = value === null ? null : value;
    }
  });

  // Update GSI keys if status or sprint changed
  if (data.status !== undefined) {
    expressions.push('GSI2SK = :gsi2sk');
    values[':gsi2sk'] = `STATUS#${data.status}#${issueId}`;
  }
  if (data.sprintId !== undefined) {
    expressions.push('GSI1PK = :gsi1pk');
    values[':gsi1pk'] = data.sprintId ? `SPRINT#${data.sprintId}` : `BACKLOG#${projectId}`;
  }

  try {
    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `PROJECT#${projectId}`, SK: `ISSUE#${issueId}` },
      UpdateExpression: `SET ${expressions.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ConditionExpression: 'attribute_exists(PK)',
      ReturnValues: 'ALL_NEW',
    }));

    return successResponse({ issue: stripKeys(result.Attributes!) });
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      return notFoundResponse('Issue');
    }
    throw error;
  }
};

const del: RouteHandler = async (_event, params) => {
  const { projectId, issueId } = params;

  await docClient.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { PK: `PROJECT#${projectId}`, SK: `ISSUE#${issueId}` },
  }));

  return successResponse({ success: true });
};

const move: RouteHandler = async (event, params) => {
  const { projectId, issueId } = params;
  const parsed = parseBody(event, MoveIssueInputSchema);
  if (!parsed.success) return parsed.error;

  const { data } = parsed;
  const now = new Date().toISOString();

  const expressions: string[] = ['#updatedAt = :updatedAt'];
  const names: Record<string, string> = { '#updatedAt': 'updatedAt' };
  const values: Record<string, unknown> = { ':updatedAt': now };

  if (data.status) {
    expressions.push('#status = :status');
    names['#status'] = 'status';
    values[':status'] = data.status;
    expressions.push('GSI2SK = :gsi2sk');
    values[':gsi2sk'] = `STATUS#${data.status}#${issueId}`;
  }
  if (data.sprintId !== undefined) {
    expressions.push('sprintId = :sprintId');
    values[':sprintId'] = data.sprintId;
    expressions.push('GSI1PK = :gsi1pk');
    values[':gsi1pk'] = data.sprintId ? `SPRINT#${data.sprintId}` : `BACKLOG#${projectId}`;
  }
  if (data.order !== undefined) {
    expressions.push('#order = :order');
    names['#order'] = 'order';
    values[':order'] = data.order;
    expressions.push('GSI1SK = :gsi1sk');
    values[':gsi1sk'] = `ISSUE#${String(data.order).padStart(5, '0')}`;
  }

  const result = await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { PK: `PROJECT#${projectId}`, SK: `ISSUE#${issueId}` },
    UpdateExpression: `SET ${expressions.join(', ')}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
    ReturnValues: 'ALL_NEW',
  }));

  return successResponse({ issue: stripKeys(result.Attributes!) });
};

const addComment: RouteHandler = async (event, params) => {
  const { projectId, issueId } = params;
  const parsed = parseBody(event, CreateCommentInputSchema);
  if (!parsed.success) return parsed.error;

  const { data } = parsed;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const comment = {
    id,
    issueId,
    projectId,
    author: data.author,
    body: data.body,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `ISSUE#${issueId}`,
      SK: `COMMENT#${now}#${id}`,
      GSI1PK: `PROJECT#${projectId}`,
      GSI1SK: `COMMENT#${now}`,
      ...comment,
    },
  }));

  return createdResponse({ comment });
};

const deleteComment: RouteHandler = async (event, params) => {
  const { issueId, commentId } = params;

  // Query for the comment to find its SK
  const queryResult = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `ISSUE#${issueId}`,
      ':sk': 'COMMENT#',
    },
  }));

  const commentItem = queryResult.Items?.find((i) => i.id === commentId);
  if (!commentItem) return notFoundResponse('Comment');

  await docClient.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { PK: commentItem.PK, SK: commentItem.SK },
  }));

  return successResponse({ success: true });
};

function stripKeys(item: Record<string, any>): Record<string, any> {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...rest } = item;
  return rest;
}

export const issueHandlers = { list, create, get, update, delete: del, move, addComment, deleteComment };
