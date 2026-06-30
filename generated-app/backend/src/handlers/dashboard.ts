import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { RouteResult } from '../router';
import { issuesDb } from '../db/issues';
import { sprintsDb } from '../db/sprints';

export async function handleDashboard(event: APIGatewayProxyEventV2): Promise<RouteResult> {
  const path = event.rawPath;
  const projectMatch = path.match(/^\/api\/projects\/([^/]+)\/dashboard$/);
  if (!projectMatch) {
    return { statusCode: 404, body: { success: false, error: 'Not found' } };
  }

  const projectId = projectMatch[1];
  const issues = await issuesDb.listByProject(projectId, {});
  const sprints = await sprintsDb.listByProject(projectId);

  const activeSprint = sprints.find(s => s.status === 'active');
  const statusDistribution: Record<string, number> = {};
  const priorityDistribution: Record<string, number> = {};
  let completedIssues = 0;

  for (const issue of issues) {
    statusDistribution[issue.status] = (statusDistribution[issue.status] || 0) + 1;
    priorityDistribution[issue.priority] = (priorityDistribution[issue.priority] || 0) + 1;
    if (issue.status === 'done') completedIssues++;
  }

  const dashboard = {
    statusDistribution,
    priorityDistribution,
    burndown: [],
    velocity: [],
    totalIssues: issues.length,
    completedIssues,
    activeSprint: activeSprint ? {
      id: activeSprint.id,
      name: activeSprint.name,
      progress: issues.length > 0 ? Math.round((completedIssues / issues.length) * 100) : 0,
      daysRemaining: activeSprint.endDate
        ? Math.max(0, Math.ceil((new Date(activeSprint.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0,
    } : null,
    recentActivity: [],
  };

  return { statusCode: 200, body: { success: true, data: dashboard } };
}
