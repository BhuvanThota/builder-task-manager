import { Project, ProjectData } from '../types';

// Get all projects
export function getProjects(): Project[] {
  return JSON.parse(localStorage.getItem('taskManagerProjects') || '[]');
}

// Save all projects
export function saveProjects(projects: Project[]) {
  localStorage.setItem('taskManagerProjects', JSON.stringify(projects));
}

// Get current project data
export function getProjectData(projectId: string): ProjectData | null {
  const data = localStorage.getItem(`taskManagerData_${projectId}`);
  return data ? JSON.parse(data) : null;
}

// Save current project data
export function saveProjectData(projectId: string, data: ProjectData) {
  localStorage.setItem(`taskManagerData_${projectId}` , JSON.stringify(data));
}

// Delete a project and its data
export function deleteProject(projectId: string) {
  const projects = getProjects().filter(p => p.id !== projectId);
  saveProjects(projects);
  localStorage.removeItem(`taskManagerData_${projectId}`);
}
