import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { listAnnouncements } from './handlers/listAnnouncements';
import { getAnnouncement } from './handlers/getAnnouncement';
import { createAnnouncement } from './handlers/createAnnouncement';
import { updateAnnouncement } from './handlers/updateAnnouncement';
import { deleteAnnouncement } from './handlers/deleteAnnouncement';
import { corsHeaders } from './utils/response';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  // Handle CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  const { routeKey } = event;

  switch (routeKey) {
    case 'GET /announcements':
      return listAnnouncements(event);
    case 'GET /announcements/{id}':
      return getAnnouncement(event);
    case 'POST /announcements':
      return createAnnouncement(event);
    case 'PUT /announcements/{id}':
      return updateAnnouncement(event);
    case 'DELETE /announcements/{id}':
      return deleteAnnouncement(event);
    default:
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Not found' }),
      };
  }
};
