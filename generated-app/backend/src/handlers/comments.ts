import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { RouteResult } from '../router';
import { CreateCommentSchema, UpdateCommentSchema } from '@canopy/shared';
import { commentsDb } from '../db/comments';

export async function handleComments(event: APIGatewayProxyEventV2): Promise<RouteResult> {
  const method = event.requestContext.http.method;
  const path = event.rawPath;

  // GET /api/issues/:issueId/comments
  const listMatch = path.match(/^\/api\/issues\/([^/]+)\/comments$/);
  if (listMatch) {
    const issueId = listMatch[1];
    if (method === 'GET') {
      const comments = await commentsDb.listByIssue(issueId);
      return { statusCode: 200, body: { success: true, comments, data: { items: comments, cursor: null } } };
    }
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const parsed = CreateCommentSchema.safeParse({ ...body, issueId });
      if (!parsed.success) {
        return { statusCode: 400, body: { success: false, error: parsed.error.message } };
      }
      const comment = await commentsDb.create(parsed.data);
      return { statusCode: 201, body: { success: true, data: comment } };
    }
  }

  // PUT /api/comments/:id
  const updateMatch = path.match(/^\/api\/comments\/([^/]+)$/);
  if (updateMatch) {
    const commentId = updateMatch[1];
    if (method === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      const parsed = UpdateCommentSchema.safeParse(body);
      if (!parsed.success) {
        return { statusCode: 400, body: { success: false, error: parsed.error.message } };
      }
      const comment = await commentsDb.update(commentId, parsed.data);
      return { statusCode: 200, body: { success: true, data: comment } };
    }
    if (method === 'DELETE') {
      await commentsDb.delete(commentId);
      return { statusCode: 200, body: { success: true } };
    }
  }

  return { statusCode: 404, body: { success: false, error: 'Comment route not found' } };
}
