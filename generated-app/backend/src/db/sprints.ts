import { docClient, TABLE_NAME } from './client';
import { GetCommand, PutCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { CreateSprint, UpdateSprint, Sprint } from '@canopy/shared';

export const sprintsDb = {
  async listByProject(projectId: string): Promise<Sprint[]> {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `PROJECT#${projectId}`,
        ':sk': 'SPRINT#',
      },
    }));
    return (result.Items || []) as unknown as Sprint[];
  },

  async get(id: string): Promise<Sprint | null> {
    // Need projectId - for now return null as stub
    return null;
  },

  async create(data: CreateSprint): Promise<Sprint> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const item: Record<string, unknown> = {
      PK: `PROJECT#${data.projectId}`,
      SK: `SPRINT#${id}`,
      GSI1PK: `PROJECT#${data.projectId}`,
      GSI1SK: `SPRINT#${data.startDate || now}`,
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
      entityType: 'Sprint',
    };
    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    return item as unknown as Sprint;
  },

  async update(id: string, data: UpdateSprint): Promise<Sprint> {
    // Stub
    return {} as Sprint;
  },

  async start(id: string): Promise<Sprint> {
    // Stub
    return {} as Sprint;
  },

  async complete(id: string): Promise<Sprint> {
    // Stub
    return {} as Sprint;
  },

  async delete(id: string): Promise<void> {
    // Stub
  },
};
