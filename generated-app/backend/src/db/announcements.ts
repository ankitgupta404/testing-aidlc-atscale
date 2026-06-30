import { docClient, TABLE_NAME } from './client';
import { PutCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { CreateAnnouncement, UpdateAnnouncement, Announcement } from '@canopy/shared';

export const announcementsDb = {
  async list(): Promise<Announcement[]> {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': 'ANNOUNCEMENT',
      },
    }));
    const items = (result.Items || []) as unknown as Announcement[];
    // Sort: pinned first, then by createdAt desc
    return items.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },

  async create(data: CreateAnnouncement): Promise<Announcement> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const item: Record<string, unknown> = {
      PK: 'ANNOUNCEMENT',
      SK: `ANNOUNCEMENT#${id}`,
      GSI3PK: 'ANNOUNCEMENT',
      GSI3SK: `DATE#${now}`,
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
      entityType: 'Announcement',
    };
    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    return item as unknown as Announcement;
  },

  async update(id: string, data: UpdateAnnouncement): Promise<Announcement> {
    const now = new Date().toISOString();
    // Get existing
    const existing = await this.list();
    const ann = existing.find(a => a.id === id);
    if (!ann) throw new Error('Announcement not found');

    const updated = { ...ann, ...data, updatedAt: now };
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: 'ANNOUNCEMENT',
        SK: `ANNOUNCEMENT#${id}`,
        GSI3PK: 'ANNOUNCEMENT',
        GSI3SK: `DATE#${updated.createdAt}`,
        ...updated,
        entityType: 'Announcement',
      },
    }));
    return updated as Announcement;
  },

  async delete(id: string): Promise<void> {
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: 'ANNOUNCEMENT', SK: `ANNOUNCEMENT#${id}` },
    }));
  },
};
