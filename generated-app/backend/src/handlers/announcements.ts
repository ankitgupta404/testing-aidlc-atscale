import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { RouteResult } from '../router';
import { CreateAnnouncementSchema, UpdateAnnouncementSchema } from '@canopy/shared';
import { announcementsDb } from '../db/announcements';

export async function handleAnnouncements(event: APIGatewayProxyEventV2): Promise<RouteResult> {
  const method = event.requestContext.http.method;
  const path = event.rawPath;

  // GET /api/announcements
  if (path === '/api/announcements' && method === 'GET') {
    const announcements = await announcementsDb.list();
    return { statusCode: 200, body: { success: true, data: { items: announcements, cursor: null } } };
  }

  // POST /api/announcements
  if (path === '/api/announcements' && method === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const parsed = CreateAnnouncementSchema.safeParse(body);
    if (!parsed.success) {
      return { statusCode: 400, body: { success: false, error: parsed.error.message } };
    }
    const announcement = await announcementsDb.create(parsed.data);
    return { statusCode: 201, body: { success: true, data: announcement } };
  }

  // PUT /api/announcements/:id
  const updateMatch = path.match(/^\/api\/announcements\/([^/]+)$/);
  if (updateMatch && method === 'PUT') {
    const body = JSON.parse(event.body || '{}');
    const parsed = UpdateAnnouncementSchema.safeParse(body);
    if (!parsed.success) {
      return { statusCode: 400, body: { success: false, error: parsed.error.message } };
    }
    const announcement = await announcementsDb.update(updateMatch[1], parsed.data);
    return { statusCode: 200, body: { success: true, data: announcement } };
  }

  // DELETE /api/announcements/:id
  if (updateMatch && method === 'DELETE') {
    await announcementsDb.delete(updateMatch[1]);
    return { statusCode: 200, body: { success: true } };
  }

  return { statusCode: 404, body: { success: false, error: 'Not found' } };
}
