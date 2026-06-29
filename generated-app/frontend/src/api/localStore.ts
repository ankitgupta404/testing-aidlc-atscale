/**
 * LocalStorage-based persistence layer for mock data.
 * Used when VITE_API_URL is not configured.
 * Provides a fully interactive experience without a backend.
 */

import { mockProjects, mockSprints, mockIssues, mockEpics, mockAnnouncements } from './mockData';
import type { Project, Issue, Sprint, Epic, Announcement, Comment } from '@canopy/shared';

const STORAGE_KEY = 'canopy-local-data';

interface LocalData {
  projects: Project[];
  issues: Record<string, Issue[]>;
  sprints: Record<string, Sprint[]>;
  epics: Record<string, Epic[]>;
  announcements: Announcement[];
  comments: Record<string, Comment[]>;
}

function getInitialData(): LocalData {
  return {
    projects: [...mockProjects],
    issues: { ...mockIssues },
    sprints: { ...mockSprints },
    epics: { ...mockEpics },
    announcements: [...mockAnnouncements],
    comments: {},
  };
}

function loadData(): LocalData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return getInitialData();
}

function saveData(data: LocalData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore - quota exceeded etc */ }
}

// Initialize
let data = loadData();

export const localStore = {
  // Projects
  getProjects: (): Project[] => data.projects,
  getProject: (id: string): Project | undefined => data.projects.find(p => p.id === id),
  createProject: (input: Partial<Project>): Project => {
    const project: Project = {
      id: crypto.randomUUID(),
      name: input.name || 'Untitled',
      key: input.key || 'UNT',
      description: input.description || '',
      lead: input.lead || 'Unknown',
      avatarColor: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
      issueCounter: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.projects.push(project);
    data.issues[project.id] = [];
    data.sprints[project.id] = [];
    data.epics[project.id] = [];
    saveData(data);
    return project;
  },
  deleteProject: (id: string): void => {
    data.projects = data.projects.filter(p => p.id !== id);
    delete data.issues[id];
    delete data.sprints[id];
    delete data.epics[id];
    saveData(data);
  },

  // Issues
  getIssues: (projectId: string): { issues: Issue[]; total: number } => {
    const issues = data.issues[projectId] || [];
    return { issues, total: issues.length };
  },
  getIssue: (projectId: string, issueId: string): { issue: Issue; comments: Comment[] } => {
    const issues = data.issues[projectId] || [];
    const issue = issues.find(i => i.id === issueId);
    if (!issue) throw new Error('Issue not found');
    const comments = data.comments[issueId] || [];
    return { issue, comments };
  },
  createIssue: (projectId: string, input: Partial<Issue>): Issue => {
    const project = data.projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');
    project.issueCounter = (project.issueCounter || 0) + 1;
    const issue: Issue = {
      id: crypto.randomUUID(),
      projectId,
      key: `${project.key}-${project.issueCounter}`,
      title: input.title || 'Untitled Issue',
      type: input.type || 'task',
      status: input.status || 'todo',
      priority: input.priority || 'medium',
      assignee: input.assignee,
      reporter: input.reporter || 'Current User',
      sprintId: input.sprintId,
      epicId: input.epicId,
      storyPoints: input.storyPoints,
      labels: input.labels || [],
      order: (data.issues[projectId]?.length || 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!data.issues[projectId]) data.issues[projectId] = [];
    data.issues[projectId].push(issue);
    saveData(data);
    return issue;
  },
  updateIssue: (projectId: string, issueId: string, input: Partial<Issue>): Issue => {
    const issues = data.issues[projectId] || [];
    const idx = issues.findIndex(i => i.id === issueId);
    if (idx === -1) throw new Error('Issue not found');
    issues[idx] = { ...issues[idx], ...input, updatedAt: new Date().toISOString() };
    saveData(data);
    return issues[idx];
  },
  moveIssue: (projectId: string, issueId: string, status: string): Issue => {
    const issues = data.issues[projectId] || [];
    const idx = issues.findIndex(i => i.id === issueId);
    if (idx === -1) throw new Error('Issue not found');
    issues[idx] = { ...issues[idx], status: status as any, updatedAt: new Date().toISOString() };
    saveData(data);
    return issues[idx];
  },
  deleteIssue: (projectId: string, issueId: string): void => {
    if (data.issues[projectId]) {
      data.issues[projectId] = data.issues[projectId].filter(i => i.id !== issueId);
      saveData(data);
    }
  },

  // Comments
  addComment: (issueId: string, input: Partial<Comment>, projectId?: string): Comment => {
    const comment: Comment = {
      id: crypto.randomUUID(),
      issueId,
      projectId: projectId || '',
      author: input.author || 'Current User',
      body: input.body || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!data.comments[issueId]) data.comments[issueId] = [];
    data.comments[issueId].push(comment);
    saveData(data);
    return comment;
  },

  // Sprints
  getSprints: (projectId: string): Sprint[] => data.sprints[projectId] || [],
  createSprint: (projectId: string, input: Partial<Sprint>): Sprint => {
    const sprint: Sprint = {
      id: crypto.randomUUID(),
      projectId,
      name: input.name || 'New Sprint',
      goal: input.goal || '',
      status: 'planning',
      startDate: input.startDate,
      endDate: input.endDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!data.sprints[projectId]) data.sprints[projectId] = [];
    data.sprints[projectId].push(sprint);
    saveData(data);
    return sprint;
  },

  // Epics
  getEpics: (projectId: string): Epic[] => data.epics[projectId] || [],

  // Announcements
  getAnnouncements: (): Announcement[] => data.announcements,
  createAnnouncement: (input: Partial<Announcement>): Announcement => {
    const announcement: Announcement = {
      id: crypto.randomUUID(),
      title: input.title || 'Untitled',
      body: input.body || '',
      type: input.type || 'info',
      author: input.author || 'Current User',
      pinned: input.pinned || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.announcements.unshift(announcement);
    saveData(data);
    return announcement;
  },
  updateAnnouncement: (id: string, input: Partial<Announcement>): Announcement => {
    const idx = data.announcements.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Announcement not found');
    data.announcements[idx] = { ...data.announcements[idx], ...input, updatedAt: new Date().toISOString() };
    saveData(data);
    return data.announcements[idx];
  },
  deleteAnnouncement: (id: string): void => {
    data.announcements = data.announcements.filter(a => a.id !== id);
    saveData(data);
  },

  // Reset to initial data
  reset: (): void => {
    data = getInitialData();
    saveData(data);
  },
};
