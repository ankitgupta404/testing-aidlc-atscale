import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { handleProjects } from './handlers/projects';
import { handleIssues } from './handlers/issues';
import { handleSprints } from './handlers/sprints';
import { handleEpics } from './handlers/epics';
import { handleComments } from './handlers/comments';
import { handleAnnouncements } from './handlers/announcements';
import { handleDashboard } from './handlers/dashboard';
import { handleSeed } from './handlers/seed';

export interface RouteResult {
  statusCode: number;
  body: unknown;
  headers?: Record<string, string>;
}

export async function router(event: APIGatewayProxyEventV2): Promise<RouteResult> {
  const method = event.requestContext.http.method;
  const path = event.rawPath;

  // Seed endpoint
  if (path === '/api/seed' && method === 'POST') {
    return handleSeed(event);
  }

  // Dashboard
  if (path.match(/^\/api\/projects\/[^/]+\/dashboard$/) && method === 'GET') {
    return handleDashboard(event);
  }

  // Announcements
  if (path.startsWith('/api/announcements')) {
    return handleAnnouncements(event);
  }

  // Comments
  if (path.match(/^\/api\/issues\/[^/]+\/comments/) || path.match(/^\/api\/comments\//)) {
    return handleComments(event);
  }

  // Issues (specific issue routes)
  if (path.match(/^\/api\/issues\/[^/]+/)) {
    return handleIssues(event);
  }

  // Issues (project-scoped)
  if (path.match(/^\/api\/projects\/[^/]+\/issues/)) {
    return handleIssues(event);
  }

  // Sprints (specific)
  if (path.match(/^\/api\/sprints\/[^/]+/)) {
    return handleSprints(event);
  }

  // Sprints (project-scoped)
  if (path.match(/^\/api\/projects\/[^/]+\/sprints/)) {
    return handleSprints(event);
  }

  // Epics (specific)
  if (path.match(/^\/api\/epics\/[^/]+/)) {
    return handleEpics(event);
  }

  // Epics (project-scoped)
  if (path.match(/^\/api\/projects\/[^/]+\/epics/)) {
    return handleEpics(event);
  }

  // Projects
  if (path.startsWith('/api/projects')) {
    return handleProjects(event);
  }

  // Health check
  if (path === '/' || path === '/api') {
    return { statusCode: 200, body: { success: true, data: { message: 'Canopy API is running' } } };
  }

  return { statusCode: 404, body: { success: false, error: 'Not found' } };
}
