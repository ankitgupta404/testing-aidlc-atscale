import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { CreateAnnouncementInputSchema } from '@aws-news-hub/shared';
import { docClient, TABLE_NAME } from '../db/client';
import { created, badRequest, serverError } from '../utils/response';
import crypto from 'crypto';

export async function createAnnouncement(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const body = JSON.parse(event.body || '{}');
    const parsed = CreateAnnouncementInputSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues.map(i => i.message).join(', '));
    }

    const { title, summary, service, date, link } = parsed.data;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const item = {
      PK: `ANNOUNCEMENT#${id}`,
      SK: `ANNOUNCEMENT#${id}`,
      GSI1PK: `SERVICE#${service}`,
      GSI1SK: `DATE#${date}#${id}`,
      GSI2PK: 'ALL_ANNOUNCEMENTS',
      GSI2SK: `DATE#${date}#${id}`,
      id,
      title,
      summary,
      service,
      date,
      link,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }));

    return created({
      id,
      title,
      summary,
      service,
      date,
      link,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return serverError();
  }
}
