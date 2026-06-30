import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { RouteResult } from '../router';
import { CreateSprintSchema, UpdateSprintSchema } from '@canopy/shared';
import { sprintsDb } from '../db/sprints';

export async function handleSprints(event: APIGatewayProxyEventV2): Promise<RouteResult> {
  const method = event.requestContext.http.method;
  const path = event.rawPath;

  // GET /api/projects/:projectId/sprints
  const listMatch = path.match(/^\/api\/projects\/([^/]+)\/sprints$/);
  if (listMatch && method === 'GET') {
    const sprints = await sprintsDb.listByProject(listMatch[1]);
    return { statusCode: 200, body: { success: true, data: { items: sprints, cursor: null } } };
  }

  // POST /api/projects/:projectId/sprints
  if (listMatch && method === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const parsed = CreateSprintSchema.safeParse({ ...body, projectId: listMatch[1] });
    if (!parsed.success) {
      return { statusCode: 400, body: { success: false, error: parsed.error.message } };
    }
    const sprint = await sprintsDb.create(parsed.data);
    return { statusCode: 201, body: { success: true, data: sprint } };
  }

  // PUT /api/sprints/:id/start
  const startMatch = path.match(/^\/api\/sprints\/([^/]+)\/start$/);
  if (startMatch && method === 'PUT') {
    const sprint = await sprintsDb.start(startMatch[1]);
    return { statusCode: 200, body: { success: true, data: sprint } };
  }

  // PUT /api/sprints/:id/complete
  const completeMatch = path.match(/^\/api\/sprints\/([^/]+)\/complete$/);
  if (completeMatch && method === 'PUT') {
    const sprint = await sprintsDb.complete(completeMatch[1]);
    return { statusCode: 200, body: { success: true, data: sprint } };
  }

  // GET /api/sprints/:id
  const getMatch = path.match(/^\/api\/sprints\/([^/]+)$/);
  if (getMatch && method === 'GET') {
    const sprint = await sprintsDb.get(getMatch[1]);
    if (!sprint) return { statusCode: 404, body: { success: false, error: 'Sprint not found' } };
    return { statusCode: 200, body: { success: true, data: sprint } };
  }

  // PUT /api/sprints/:id
  if (getMatch && method === 'PUT') {
    const body = JSON.parse(event.body || '{}');
    const parsed = UpdateSprintSchema.safeParse(body);
    if (!parsed.success) {
      return { statusCode: 400, body: { success: false, error: parsed.error.message } };
    }
    const sprint = await sprintsDb.update(getMatch[1], parsed.data);
    return { statusCode: 200, body: { success: true, data: sprint } };
  }

  // DELETE /api/sprints/:id
  if (getMatch && method === 'DELETE') {
    await sprintsDb.delete(getMatch[1]);
    return { statusCode: 200, body: { success: true } };
  }

  return { statusCode: 404, body: { success: false, error: 'Not found' } };
}
