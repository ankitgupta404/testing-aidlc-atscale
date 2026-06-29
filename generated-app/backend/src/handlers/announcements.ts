import { PutCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../db/client';
import { CreateAnnouncementInputSchema, UpdateAnnouncementInputSchema } from '@canopy/shared';
import { parseBody } from '../utils/validation';
import { successResponse, createdResponse, notFoundResponse } from '../utils/response';
import type { RouteHandler } from '../router';

const list: RouteHandler = async () => {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': 'ANNOUNCEMENTS',
      ':sk': 'ANNOUNCEMENT#',
    },
    ScanIndexForward: false,
  }));

  const announcements = (result.Items || []).map(stripKeys);
  return successResponse({ announcements });
};

const create: RouteHandler = async (event) => {
  const parsed = parseBody(event, CreateAnnouncementInputSchema);
  if (!parsed.success) return parsed.error;

  const { data } = parsed;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const announcement = {
    id,
    title: data.title,
    body: data.body,
    type: data.type,
    author: data.author,
    pinned: data.pinned || false,
    expiresAt: data.expiresAt,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: 'ANNOUNCEMENTS',
      SK: `ANNOUNCEMENT#${id}`,
      GSI1PK: `ANN_TYPE#${data.type}`,
      GSI1SK: `ANNOUNCEMENT#${now}`,
      ...announcement,
    },
  }));

  return createdResponse({ announcement });
};

const update: RouteHandler = async (event, params) => {
  const { announcementId } = params;
  const parsed = parseBody(event, UpdateAnnouncementInputSchema);
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
      Key: { PK: 'ANNOUNCEMENTS', SK: `ANNOUNCEMENT#${announcementId}` },
      UpdateExpression: `SET ${expressions.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ConditionExpression: 'attribute_exists(PK)',
      ReturnValues: 'ALL_NEW',
    }));

    return successResponse({ announcement: stripKeys(result.Attributes!) });
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      return notFoundResponse('Announcement');
    }
    throw error;
  }
};

const del: RouteHandler = async (_event, params) => {
  const { announcementId } = params;

  await docClient.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { PK: 'ANNOUNCEMENTS', SK: `ANNOUNCEMENT#${announcementId}` },
  }));

  return successResponse({ success: true });
};

function stripKeys(item: Record<string, any>): Record<string, any> {
  const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...rest } = item;
  return rest;
}

export const announcementHandlers = { list, create, update, delete: del };
