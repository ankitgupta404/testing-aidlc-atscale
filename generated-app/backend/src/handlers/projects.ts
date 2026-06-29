import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { PutCommand, QueryCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../db/client';
import { CreateProjectInputSchema, UpdateProjectInputSchema } from '@canopy/shared';
import { parseBody } from '../utils/validation';
import { successResponse, createdResponse, notFoundResponse, errorResponse } from '../utils/response';
import type { RouteHandler } from '../router';

const list: RouteHandler = async () => {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: { ':pk': 'PROJECTS' },
  }));

  const projects = (result.Items || []).map(stripKeys);
  return successResponse({ projects });
};

const create: RouteHandler = async (event) => {
  const parsed = parseBody(event, CreateProjectInputSchema);
  if (!parsed.success) return parsed.error;

  const { data } = parsed;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const project = {
    id,
    name: data.name,
    key: data.key,
    description: data.description,
    lead: data.lead,
    avatarColor: data.avatarColor || '#1B4332',
    issueCounter: 0,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `PROJECT#${id}`,
      SK: `PROJECT#${id}`,
      GSI1PK: 'PROJECTS',
      GSI1SK: `PROJECT#${data.name}`,
      ...project,
    },
    ConditionExpression: 'attribute_not_exists(PK)',
  }));

  return createdResponse({ project });
};

const get: RouteHandler = async (_event, params) => {
  const { projectId } = params;

  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: `PROJECT#${projectId}`, SK: `PROJECT#${projectId}` },
  }));

  if (!result.Item) return notFoundResponse('Project');
  return successResponse({ project: stripKeys(result.Item) });
};

const update: RouteHandler = async (event, params) => {
  const { projectId } = params;
  const parsed = parseBody(event, UpdateProjectInputSchema);
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
      Key: { PK: `PROJECT#${projectId}`, SK: `PROJECT#${projectId}` },
      UpdateExpression: `SET ${expressions.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ConditionExpression: 'attribute_exists(PK)',
      ReturnValues: 'ALL_NEW',
    }));

    return successResponse({ project: stripKeys(result.Attributes!) });
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      return notFoundResponse('Project');
    }
    throw error;
  }
};

const del: RouteHandler = async (_event, params) => {
  const { projectId } = params;

  await docClient.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { PK: `PROJECT#${projectId}`, SK: `PROJECT#${projectId}` },
  }));

  return successResponse({ success: true });
};

function stripKeys(item: Record<string, any>): Record<string, any> {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...rest } = item;
  return rest;
}

export const projectHandlers = { list, create, get, update, delete: del };
