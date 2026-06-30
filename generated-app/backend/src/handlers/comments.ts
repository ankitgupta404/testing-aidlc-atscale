import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { RouteResult } from '../router';
import { CreateCommentSchema, UpdateCommentSchema } from '@canopy/shared';
import { commentsDb } from '../db/comments';

export async function handleComments(event: APIGatewayProxyEventV2): Promise<RouteResult> {
  const method = event.requestContext.http.method;
  const path = event.rawPath;

  // GET /api/issues/:issueId/comments
  const listMatch = path.match(/^\/api\/issues\/([^/]+)\/comments$/);
  if (listMatch && method === 'GET') {
    const comments = await commentsDb.listByIssue(listMatch[1]);
    return { statusCode: 200, body: { success: true, data: { items: comments, cursor: null } } };
  }

  // POST /api/issues/:issueId/comments
  if (listMatch && method === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const parsed = CreateCommentSchema.safeParse({ ...body, issueId: listMatch[1] });
    if (!parsed.success) {
      return { statusCode: 400, body: { success: false, error: parsed.error.message } };
    }
    const comment = await commentsDb.create(parsed.data);
    return { statusCode: 201, body: { success: true, data: comment } };
  }

  // PUT /api/comments/:id
  const updateMatch = path.match(/^\/api\/comments\/([^/]+)$/);
  if (updateMatch && method === 'PUT') {
    const body = JSON.parse(event.body || '{}');
    const parsed = UpdateCommentSchema.safeParse(body);
    if (!parsed.success) {
      return { statusCode: 400, body: { success: false, error: parsed.error.message } };
    }
    const comment = await commentsDb.update(updateMatch[1], parsed.data);
    return { statusCode: 200, body: { success: true, data: comment } };
  }

  // DELETE /api/comments/:id
  if (updateMatch && method === 'DELETE') {
    await commentsDb.delete(updateMatch[1]);
    return { statusCode: 200, body: { success: true } };
  }

  return { statusCode: 404, body: { success: false, error: 'Not found' } };
}
