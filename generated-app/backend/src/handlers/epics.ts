import { PutCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../db/client';
import { CreateEpicInputSchema, UpdateEpicInputSchema } from '@canopy/shared';
import { parseBody } from '../utils/validation';
import { successResponse, createdResponse, notFoundResponse } from '../utils/response';
import type { RouteHandler } from '../router';

const list: RouteHandler = async (_event, params) => {
  const { projectId } = params;

  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `PROJECT#${projectId}`,
      ':sk': 'EPIC#',
    },
  }));

  const epics = (result.Items || []).map(stripKeys);
  return successResponse({ epics });
};

const create: RouteHandler = async (event, params) => {
  const { projectId } = params;
  const parsed = parseBody(event, CreateEpicInputSchema);
  if (!parsed.success) return parsed.error;

  const { data } = parsed;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const epic = {
    id,
    projectId,
    name: data.name,
    description: data.description,
    status: 'not_started' as const,
    color: data.color || '#2563EB',
    startDate: data.startDate,
    targetDate: data.targetDate,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `PROJECT#${projectId}`,
      SK: `EPIC#${id}`,
      GSI1PK: `PROJECT#${projectId}`,
      GSI1SK: `EPIC#not_started#${data.name}`,
      ...epic,
    },
  }));

  return createdResponse({ epic });
};

const update: RouteHandler = async (event, params) => {
  const { projectId, epicId } = params;
  const parsed = parseBody(event, UpdateEpicInputSchema);
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

  try {
    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `PROJECT#${projectId}`, SK: `EPIC#${epicId}` },
      UpdateExpression: `SET ${expressions.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ConditionExpression: 'attribute_exists(PK)',
      ReturnValues: 'ALL_NEW',
    }));

    return successResponse({ epic: stripKeys(result.Attributes!) });
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      return notFoundResponse('Epic');
    }
    throw error;
  }
};

const del: RouteHandler = async (_event, params) => {
  const { projectId, epicId } = params;

  await docClient.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { PK: `PROJECT#${projectId}`, SK: `EPIC#${epicId}` },
  }));

  return successResponse({ success: true });
};

function stripKeys(item: Record<string, any>): Record<string, any> {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...rest } = item;
  return rest;
}

export const epicHandlers = { list, create, update, delete: del };
