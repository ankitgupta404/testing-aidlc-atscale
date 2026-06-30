import { docClient, TABLE_NAME } from './client';
import { PutCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { CreateComment, UpdateComment, Comment } from '@canopy/shared';

export const commentsDb = {
  async listByIssue(issueId: string): Promise<Comment[]> {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `ISSUE#${issueId}`,
        ':sk': 'COMMENT#',
      },
    }));
    return (result.Items || []) as unknown as Comment[];
  },

  async create(data: CreateComment): Promise<Comment> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const item: Record<string, unknown> = {
      PK: `ISSUE#${data.issueId}`,
      SK: `COMMENT#${id}`,
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
      entityType: 'Comment',
    };
    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    return item as unknown as Comment;
  },

  async update(id: string, data: UpdateComment): Promise<Comment> {
    return {} as Comment;
  },

  async delete(id: string): Promise<void> {
    // Stub
  },
};
