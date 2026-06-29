import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Router } from './router';
import { projectHandlers } from './handlers/projects';
import { issueHandlers } from './handlers/issues';
import { sprintHandlers } from './handlers/sprints';
import { epicHandlers } from './handlers/epics';
import { announcementHandlers } from './handlers/announcements';
import { boardHandlers } from './handlers/board';
import { seedHandler } from './handlers/seed';

const router = new Router();

// Projects
router.add('GET', '/api/projects', projectHandlers.list);
router.add('POST', '/api/projects', projectHandlers.create);
router.add('GET', '/api/projects/:projectId', projectHandlers.get);
router.add('PUT', '/api/projects/:projectId', projectHandlers.update);
router.add('DELETE', '/api/projects/:projectId', projectHandlers.delete);

// Issues
router.add('GET', '/api/projects/:projectId/issues', issueHandlers.list);
router.add('POST', '/api/projects/:projectId/issues', issueHandlers.create);
router.add('GET', '/api/projects/:projectId/issues/:issueId', issueHandlers.get);
router.add('PUT', '/api/projects/:projectId/issues/:issueId', issueHandlers.update);
router.add('DELETE', '/api/projects/:projectId/issues/:issueId', issueHandlers.delete);
router.add('PATCH', '/api/projects/:projectId/issues/:issueId/move', issueHandlers.move);

// Comments
router.add('POST', '/api/projects/:projectId/issues/:issueId/comments', issueHandlers.addComment);
router.add('DELETE', '/api/projects/:projectId/issues/:issueId/comments/:commentId', issueHandlers.deleteComment);

// Sprints
router.add('GET', '/api/projects/:projectId/sprints', sprintHandlers.list);
router.add('POST', '/api/projects/:projectId/sprints', sprintHandlers.create);
router.add('PUT', '/api/projects/:projectId/sprints/:sprintId', sprintHandlers.update);
router.add('POST', '/api/projects/:projectId/sprints/:sprintId/start', sprintHandlers.start);
router.add('POST', '/api/projects/:projectId/sprints/:sprintId/complete', sprintHandlers.complete);
router.add('DELETE', '/api/projects/:projectId/sprints/:sprintId', sprintHandlers.delete);

// Epics
router.add('GET', '/api/projects/:projectId/epics', epicHandlers.list);
router.add('POST', '/api/projects/:projectId/epics', epicHandlers.create);
router.add('PUT', '/api/projects/:projectId/epics/:epicId', epicHandlers.update);
router.add('DELETE', '/api/projects/:projectId/epics/:epicId', epicHandlers.delete);

// Announcements
router.add('GET', '/api/announcements', announcementHandlers.list);
router.add('POST', '/api/announcements', announcementHandlers.create);
router.add('PUT', '/api/announcements/:announcementId', announcementHandlers.update);
router.add('DELETE', '/api/announcements/:announcementId', announcementHandlers.delete);

// Dashboard / Reports
router.add('GET', '/api/projects/:projectId/dashboard', boardHandlers.dashboard);
router.add('GET', '/api/projects/:projectId/burndown', boardHandlers.burndown);
router.add('GET', '/api/projects/:projectId/velocity', boardHandlers.velocity);

// Seed
router.add('POST', '/api/seed', seedHandler);

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const method = event.requestContext.http.method;
  const path = event.rawPath;

  console.log(`${method} ${path}`);

  try {
    const result = await router.resolve(method, path, event);
    return result;
  } catch (error) {
    console.error('Unhandled error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      }),
    };
  }
};
