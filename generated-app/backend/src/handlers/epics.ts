import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { RouteResult } from '../router';
import { CreateEpicSchema, UpdateEpicSchema } from '@canopy/shared';
import { epicsDb } from '../db/epics';

export async function handleEpics(event: APIGatewayProxyEventV2): Promise<RouteResult> {
  const method = event.requestContext.http.method;
  const path = event.rawPath;

  // GET /api/projects/:projectId/epics
  const listMatch = path.match(/^\/api\/projects\/([^/]+)\/epics$/);
  if (listMatch && method === 'GET') {
    const epics = await epicsDb.listByProject(listMatch[1]);
    return { statusCode: 200, body: { success: true, data: { items: epics, cursor: null } } };
  }

  // POST /api/projects/:projectId/epics
  if (listMatch && method === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const parsed = CreateEpicSchema.safeParse({ ...body, projectId: listMatch[1] });
    if (!parsed.success) {
      return { statusCode: 400, body: { success: false, error: parsed.error.message } };
    }
    const epic = await epicsDb.create(parsed.data);
    return { statusCode: 201, body: { success: true, data: epic } };
  }

  // GET /api/epics/:id
  const getMatch = path.match(/^\/api\/epics\/([^/]+)$/);
  if (getMatch && method === 'GET') {
    const epic = await epicsDb.get(getMatch[1]);
    if (!epic) return { statusCode: 404, body: { success: false, error: 'Epic not found' } };
    return { statusCode: 200, body: { success: true, data: epic } };
  }

  // PUT /api/epics/:id
  if (getMatch && method === 'PUT') {
    const body = JSON.parse(event.body || '{}');
    const parsed = UpdateEpicSchema.safeParse(body);
    if (!parsed.success) {
      return { statusCode: 400, body: { success: false, error: parsed.error.message } };
    }
    const epic = await epicsDb.update(getMatch[1], parsed.data);
    return { statusCode: 200, body: { success: true, data: epic } };
  }

  // DELETE /api/epics/:id
  if (getMatch && method === 'DELETE') {
    await epicsDb.delete(getMatch[1]);
    return { statusCode: 200, body: { success: true } };
  }

  return { statusCode: 404, body: { success: false, error: 'Not found' } };
}
