/**
 * Endpoint route map for the Canopy API.
 * Used by both frontend API client and backend router.
 */

export const ENDPOINTS = {
  // Projects
  projects: {
    list: 'GET /api/projects',
    create: 'POST /api/projects',
    get: 'GET /api/projects/:projectId',
    update: 'PUT /api/projects/:projectId',
    delete: 'DELETE /api/projects/:projectId',
  },

  // Issues
  issues: {
    list: 'GET /api/projects/:projectId/issues',
    create: 'POST /api/projects/:projectId/issues',
    get: 'GET /api/projects/:projectId/issues/:issueId',
    update: 'PUT /api/projects/:projectId/issues/:issueId',
    delete: 'DELETE /api/projects/:projectId/issues/:issueId',
    move: 'PATCH /api/projects/:projectId/issues/:issueId/move',
  },

  // Comments
  comments: {
    create: 'POST /api/projects/:projectId/issues/:issueId/comments',
    delete: 'DELETE /api/projects/:projectId/issues/:issueId/comments/:commentId',
  },

  // Sprints
  sprints: {
    list: 'GET /api/projects/:projectId/sprints',
    create: 'POST /api/projects/:projectId/sprints',
    update: 'PUT /api/projects/:projectId/sprints/:sprintId',
    start: 'POST /api/projects/:projectId/sprints/:sprintId/start',
    complete: 'POST /api/projects/:projectId/sprints/:sprintId/complete',
    delete: 'DELETE /api/projects/:projectId/sprints/:sprintId',
  },

  // Epics
  epics: {
    list: 'GET /api/projects/:projectId/epics',
    create: 'POST /api/projects/:projectId/epics',
    update: 'PUT /api/projects/:projectId/epics/:epicId',
    delete: 'DELETE /api/projects/:projectId/epics/:epicId',
  },

  // Announcements
  announcements: {
    list: 'GET /api/announcements',
    create: 'POST /api/announcements',
    update: 'PUT /api/announcements/:announcementId',
    delete: 'DELETE /api/announcements/:announcementId',
  },

  // Dashboard / Board
  dashboard: {
    stats: 'GET /api/projects/:projectId/dashboard',
    burndown: 'GET /api/projects/:projectId/burndown',
    velocity: 'GET /api/projects/:projectId/velocity',
  },

  // Seed
  seed: {
    run: 'POST /api/seed',
  },
} as const;

export type EndpointMap = typeof ENDPOINTS;
