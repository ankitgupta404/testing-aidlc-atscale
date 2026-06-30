import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { RouteResult } from '../router';
import { CreateProjectSchema, UpdateProjectSchema } from '@canopy/shared';
import { projectsDb } from '../db/projects';

export async function handleProjects(event: APIGatewayProxyEventV2): Promise<RouteResult> {
  const method = event.requestContext.http.method;
  const path = event.rawPath;

  // GET /api/projects - list all
  if (path === '/api/projects' && method === 'GET') {
    const projects = await projectsDb.list();
    return { statusCode: 200, body: { success: true, data: { items: projects, cursor: null } } };
  }

  // POST /api/projects - create
  if (path === '/api/projects' && method === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const parsed = CreateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return { statusCode: 400, body: { success: false, error: parsed.error.message } };
    }
    const project = await projectsDb.create(parsed.data);
    return { statusCode: 201, body: { success: true, data: project } };
  }

  // GET /api/projects/:id
  const getMatch = path.match(/^\/api\/projects\/([^/]+)$/);
  if (getMatch && method === 'GET') {
    const project = await projectsDb.get(getMatch[1]);
    if (!project) return { statusCode: 404, body: { success: false, error: 'Project not found' } };
    return { statusCode: 200, body: { success: true, data: project } };
  }

  // PUT /api/projects/:id
  if (getMatch && method === 'PUT') {
    const body = JSON.parse(event.body || '{}');
    const parsed = UpdateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return { statusCode: 400, body: { success: false, error: parsed.error.message } };
    }
    const project = await projectsDb.update(getMatch[1], parsed.data);
    return { statusCode: 200, body: { success: true, data: project } };
  }

  // DELETE /api/projects/:id
  if (getMatch && method === 'DELETE') {
    await projectsDb.delete(getMatch[1]);
    return { statusCode: 200, body: { success: true } };
  }

  return { statusCode: 404, body: { success: false, error: 'Not found' } };
}
