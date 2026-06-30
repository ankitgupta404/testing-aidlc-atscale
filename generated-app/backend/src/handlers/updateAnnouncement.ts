import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { UpdateAnnouncementInputSchema } from '@aws-news-hub/shared';
import { docClient, TABLE_NAME } from '../db/client';
import { success, badRequest, notFound, serverError } from '../utils/response';

export async function updateAnnouncement(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const id = event.pathParameters?.id;

    if (!id) {
      return notFound('Announcement not found');
    }

    const body = JSON.parse(event.body || '{}');
    const parsed = UpdateAnnouncementInputSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues.map(i => i.message).join(', '));
    }

    // Get existing item
    const existing = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `ANNOUNCEMENT#${id}`,
        SK: `ANNOUNCEMENT#${id}`,
      },
    }));

    if (!existing.Item) {
      return notFound('Announcement not found');
    }

    const updates = parsed.data;
    const now = new Date().toISOString();
    const existingItem = existing.Item as Record<string, any>;

    // Recalculate GSI keys if service or date changed
    const effectiveDate = updates.date || existingItem.date;
    const effectiveService = updates.service || existingItem.service;

    const updatedItem: Record<string, any> = {
      ...existingItem,
      ...updates,
      updatedAt: now,
      GSI1PK: `SERVICE#${effectiveService}`,
      GSI1SK: `DATE#${effectiveDate}#${id}`,
      GSI2SK: `DATE#${effectiveDate}#${id}`,
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: updatedItem,
    }));

    return success({
      id: updatedItem.id,
      title: updatedItem.title,
      summary: updatedItem.summary,
      service: updatedItem.service,
      date: updatedItem.date,
      link: updatedItem.link,
      createdAt: updatedItem.createdAt,
      updatedAt: updatedItem.updatedAt,
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    return serverError();
  }
}
