import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../db/client';
import { success, notFound, serverError } from '../utils/response';

export async function getAnnouncement(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const id = event.pathParameters?.id;

    if (!id) {
      return notFound('Announcement not found');
    }

    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `ANNOUNCEMENT#${id}`,
        SK: `ANNOUNCEMENT#${id}`,
      },
    }));

    if (!result.Item) {
      return notFound('Announcement not found');
    }

    const item = result.Item;
    return success({
      id: item.id,
      title: item.title,
      summary: item.summary,
      service: item.service,
      date: item.date,
      link: item.link,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  } catch (error) {
    console.error('Error getting announcement:', error);
    return serverError();
  }
}
