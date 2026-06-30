import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../db/client';
import { noContent, notFound, serverError } from '../utils/response';

export async function deleteAnnouncement(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const id = event.pathParameters?.id;

    if (!id) {
      return notFound('Announcement not found');
    }

    // Check if item exists
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

    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `ANNOUNCEMENT#${id}`,
        SK: `ANNOUNCEMENT#${id}`,
      },
    }));

    return noContent();
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return serverError();
  }
}
