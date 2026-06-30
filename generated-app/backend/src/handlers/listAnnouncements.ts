import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ListAnnouncementsQuerySchema } from '@aws-news-hub/shared';
import { docClient, TABLE_NAME } from '../db/client';
import { success, badRequest, serverError } from '../utils/response';

export async function listAnnouncements(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const params = event.queryStringParameters || {};
    const parsed = ListAnnouncementsQuerySchema.safeParse(params);

    if (!parsed.success) {
      return badRequest(parsed.error.issues.map(i => i.message).join(', '));
    }

    const { service, search, limit, nextToken } = parsed.data;

    let queryParams: Record<string, unknown>;

    if (service) {
      // Query by service using GSI1
      queryParams = {
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: {
          ':pk': `SERVICE#${service}`,
        },
        ScanIndexForward: false,
        Limit: limit,
      };
    } else {
      // Query all announcements using GSI2
      queryParams = {
        TableName: TABLE_NAME,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :pk',
        ExpressionAttributeValues: {
          ':pk': 'ALL_ANNOUNCEMENTS',
        },
        ScanIndexForward: false,
        Limit: limit,
      };
    }

    if (nextToken) {
      (queryParams as Record<string, unknown>).ExclusiveStartKey = JSON.parse(
        Buffer.from(nextToken, 'base64').toString('utf-8')
      );
    }

    const result = await docClient.send(new QueryCommand(queryParams as any));

    let announcements = (result.Items || []).map(item => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      service: item.service,
      date: item.date,
      link: item.link,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    // Apply search filter in-memory
    if (search) {
      const searchLower = search.toLowerCase();
      announcements = announcements.filter(
        a => a.title.toLowerCase().includes(searchLower) ||
             a.summary.toLowerCase().includes(searchLower)
      );
    }

    const responseNextToken = result.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
      : null;

    return success({
      announcements,
      nextToken: responseNextToken,
    });
  } catch (error) {
    console.error('Error listing announcements:', error);
    return serverError();
  }
}
