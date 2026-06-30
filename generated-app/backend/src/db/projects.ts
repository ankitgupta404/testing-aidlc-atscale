import { docClient, TABLE_NAME } from './client';
import { GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { CreateProject, UpdateProject, Project } from '@canopy/shared';

export const projectsDb = {
  async list(): Promise<Project[]> {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: { ':pk': 'ORG#default' },
    }));
    return (result.Items || []).filter(i => i.entityType === 'Project') as unknown as Project[];
  },

  async get(id: string): Promise<Project | null> {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `PROJECT#${id}`, SK: `PROJECT#${id}` },
    }));
    return (result.Item as unknown as Project) || null;
  },

  async create(data: CreateProject): Promise<Project> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const project: Record<string, unknown> = {
      PK: `PROJECT#${id}`,
      SK: `PROJECT#${id}`,
      GSI1PK: 'ORG#default',
      GSI1SK: `PROJECT#${id}`,
      id,
      ...data,
      issueCounter: 0,
      createdAt: now,
      updatedAt: now,
      entityType: 'Project',
    };
    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: project }));
    return project as unknown as Project;
  },

  async update(id: string, data: UpdateProject): Promise<Project> {
    const now = new Date().toISOString();
    const existing = await this.get(id);
    if (!existing) throw new Error('Project not found');

    const updated = { ...existing, ...data, updatedAt: now };
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `PROJECT#${id}`,
        SK: `PROJECT#${id}`,
        GSI1PK: 'ORG#default',
        GSI1SK: `PROJECT#${id}`,
        ...updated,
        entityType: 'Project',
      },
    }));
    return updated as Project;
  },

  async delete(id: string): Promise<void> {
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `PROJECT#${id}`, SK: `PROJECT#${id}` },
    }));
  },

  async incrementIssueCounter(id: string): Promise<number> {
    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `PROJECT#${id}`, SK: `PROJECT#${id}` },
      UpdateExpression: 'SET issueCounter = if_not_exists(issueCounter, :zero) + :inc',
      ExpressionAttributeValues: { ':zero': 0, ':inc': 1 },
      ReturnValues: 'UPDATED_NEW',
    }));
    return (result.Attributes?.issueCounter as number) || 1;
  },
};
