import { Project, ProjectData } from '../types';

// LEGACY WRAPPERS: Use StorageService from services/storageService.ts for all new code.
// These are kept for backward compatibility but now use the correct keys.

const PROJECTS_KEY = 'taskManager_projects';
const PROJECT_DATA_KEY = (projectId: string) => `taskManager_project_${projectId}`;

// Get all projects
export function getProjects(): Project[] {
  const data = localStorage.getItem(PROJECTS_KEY);
  return JSON.parse(data || '[]');
}

// Save all projects
export function saveProjects(projects: Project[]) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

// Get current project data
export function getProjectData(projectId: string): ProjectData | null {
  const key = PROJECT_DATA_KEY(projectId);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

// Save current project data
export function saveProjectData(projectId: string, data: ProjectData) {
  const key = PROJECT_DATA_KEY(projectId);
  localStorage.setItem(key, JSON.stringify(data));
}

// Delete a project and its data
export function deleteProject(projectId: string) {
  const key = PROJECT_DATA_KEY(projectId);
  const projects = getProjects().filter(p => p.id !== projectId);
  saveProjects(projects);
  localStorage.removeItem(key);
}
