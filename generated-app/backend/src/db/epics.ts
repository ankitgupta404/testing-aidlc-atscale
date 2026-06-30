import { docClient, TABLE_NAME } from './client';
import { GetCommand, PutCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { CreateEpic, UpdateEpic, Epic } from '@canopy/shared';

export const epicsDb = {
  async listByProject(projectId: string): Promise<Epic[]> {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `PROJECT#${projectId}`,
        ':sk': 'EPIC#',
      },
    }));
    return (result.Items || []) as unknown as Epic[];
  },

  async get(id: string): Promise<Epic | null> {
    return null;
  },

  async create(data: CreateEpic): Promise<Epic> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const item: Record<string, unknown> = {
      PK: `PROJECT#${data.projectId}`,
      SK: `EPIC#${id}`,
      GSI1PK: `PROJECT#${data.projectId}`,
      GSI1SK: `EPIC#${id}`,
      GSI2PK: `PROJECT#${data.projectId}`,
      GSI2SK: `EPIC#${id}`,
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
      entityType: 'Epic',
    };
    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    return item as unknown as Epic;
  },

  async update(id: string, data: UpdateEpic): Promise<Epic> {
    return {} as Epic;
  },

  async delete(id: string): Promise<void> {
    // Stub
  },
};
