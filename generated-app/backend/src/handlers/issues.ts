import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { RouteResult } from '../router';
import { CreateIssueSchema, UpdateIssueSchema, MoveIssueSchema } from '@canopy/shared';
import { issuesDb } from '../db/issues';

export async function handleIssues(event: APIGatewayProxyEventV2): Promise<RouteResult> {
  const method = event.requestContext.http.method;
  const path = event.rawPath;

  // GET /api/projects/:projectId/issues
  const listMatch = path.match(/^\/api\/projects\/([^/]+)\/issues$/);
  if (listMatch && method === 'GET') {
    const projectId = listMatch[1];
    const params = event.queryStringParameters || {};
    const issues = await issuesDb.listByProject(projectId, params);
    return { statusCode: 200, body: { success: true, data: { items: issues, cursor: null } } };
  }

  // POST /api/projects/:projectId/issues
  if (listMatch && method === 'POST') {
    const projectId = listMatch[1];
    const body = JSON.parse(event.body || '{}');
    const parsed = CreateIssueSchema.safeParse({ ...body, projectId });
    if (!parsed.success) {
      return { statusCode: 400, body: { success: false, error: parsed.error.message } };
    }
    const issue = await issuesDb.create(parsed.data);
    return { statusCode: 201, body: { success: true, data: issue } };
  }

  // PUT /api/issues/:id/move
  const moveMatch = path.match(/^\/api\/issues\/([^/]+)\/move$/);
  if (moveMatch && method === 'PUT') {
    const body = JSON.parse(event.body || '{}');
    const parsed = MoveIssueSchema.safeParse(body);
    if (!parsed.success) {
      return { statusCode: 400, body: { success: false, error: parsed.error.message } };
    }
    const issue = await issuesDb.move(moveMatch[1], parsed.data);
    return { statusCode: 200, body: { success: true, data: issue } };
  }

  // GET /api/issues/:id
  const getMatch = path.match(/^\/api\/issues\/([^/]+)$/);
  if (getMatch && method === 'GET') {
    const issue = await issuesDb.get(getMatch[1]);
    if (!issue) return { statusCode: 404, body: { success: false, error: 'Issue not found' } };
    return { statusCode: 200, body: { success: true, data: issue } };
  }

  // PUT /api/issues/:id
  if (getMatch && method === 'PUT') {
    const body = JSON.parse(event.body || '{}');
    const parsed = UpdateIssueSchema.safeParse(body);
    if (!parsed.success) {
      return { statusCode: 400, body: { success: false, error: parsed.error.message } };
    }
    const issue = await issuesDb.update(getMatch[1], parsed.data);
    return { statusCode: 200, body: { success: true, data: issue } };
  }

  // DELETE /api/issues/:id
  if (getMatch && method === 'DELETE') {
    await issuesDb.delete(getMatch[1]);
    return { statusCode: 200, body: { success: true } };
  }

  return { statusCode: 404, body: { success: false, error: 'Not found' } };
}
