import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { RouteResult } from '../router';
import { CreateIssueSchema, UpdateIssueSchema, MoveIssueSchema } from '@canopy/shared';
import { issuesDb } from '../db/issues';

export async function handleIssues(event: APIGatewayProxyEventV2): Promise<RouteResult> {
  const method = event.requestContext.http.method;
  const path = event.rawPath;

  // GET /api/projects/:projectId/issues
  const listMatch = path.match(/^\/api\/projects\/([^/]+)\/issues$/);
  if (listMatch) {
    const projectId = listMatch[1];
    if (method === 'GET') {
      const params = event.queryStringParameters || {};
      const issues = await issuesDb.listByProject(projectId, params);
      return { statusCode: 200, body: { success: true, issues, data: { items: issues, cursor: null } } };
    }
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const parsed = CreateIssueSchema.safeParse({ ...body, projectId });
      if (!parsed.success) {
        return { statusCode: 400, body: { success: false, error: parsed.error.message } };
      }
      const issue = await issuesDb.create(parsed.data);
      return { statusCode: 201, body: { success: true, data: issue } };
    }
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

  // GET/PUT/DELETE /api/issues/:id
  const singleMatch = path.match(/^\/api\/issues\/([^/]+)$/);
  if (singleMatch) {
    const issueId = singleMatch[1];
    if (method === 'GET') {
      const issue = await issuesDb.get(issueId);
      if (!issue) return { statusCode: 404, body: { success: false, error: 'Issue not found' } };
      return { statusCode: 200, body: { success: true, issue, data: issue } };
    }
    if (method === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      const parsed = UpdateIssueSchema.safeParse(body);
      if (!parsed.success) {
        return { statusCode: 400, body: { success: false, error: parsed.error.message } };
      }
      const issue = await issuesDb.update(issueId, parsed.data);
      return { statusCode: 200, body: { success: true, data: issue } };
    }
    if (method === 'DELETE') {
      await issuesDb.delete(issueId);
      return { statusCode: 200, body: { success: true } };
    }
  }

  return { statusCode: 404, body: { success: false, error: 'Issue route not found' } };
}
