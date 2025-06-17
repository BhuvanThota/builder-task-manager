// src/services/storageService.ts
import { Project, ProjectData, AppState, Task, PROJECT_COLORS } from '@/types';

interface StoredProject {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  completedCount: number;
  color: string;
}

interface StoredTask {
  id: string;
  status: string;
  assignee: string;
  projectId: string;
  createdAt: string;
  [key: string]: string | number | boolean | undefined;
}

interface StoredProjectData {
  tasks: StoredTask[];
  headers: string[];
  filters: {
    assignee: string;
    search: string;
    status: string;
    priority: string;
  };
  view: 'kanban' | 'table';
  currentPage: number;
}

interface ExportData {
  appState: AppState;
  projects: Array<{
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    taskCount: number;
    completedCount: number;
    color: string;
    data: ProjectData;
  }>;
  exportedAt: string;
  version: string;
}

interface ImportProject {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  completedCount: number;
  color: string;
  data?: ProjectData;
}

interface ImportData {
  appState?: AppState;
  projects?: ImportProject[];
  exportedAt?: string;
  version?: string;
}

export class StorageService {
  private static readonly KEYS = {
    APP_STATE: 'taskManager_appState',
    PROJECTS: 'taskManager_projects',
    PROJECT_DATA: (id: string) => `taskManager_project_${id}`,
  };

  // App State Management
  static getAppState(): AppState {
    try {
      const stored = localStorage.getItem(this.KEYS.APP_STATE);
      const projects = this.getProjects(); // Always get current projects from storage
      
      
      if (stored) {
        const parsed = JSON.parse(stored) as AppState;
        
        // Always use the actual projects from storage, not the stored app state projects
        const result = {
          currentProjectId: parsed.currentProjectId || (projects.length > 0 ? projects[0].id : null),
          projects: projects, // Use actual projects from storage
          darkMode: parsed.darkMode || false,
          sidebarCollapsed: parsed.sidebarCollapsed || false,
        };
        
        return result;
      } else {
        console.warn(`[StorageService] No app state found in localStorage under '${this.KEYS.APP_STATE}'`);
      }
    } catch (error) {
      console.error('Error reading app state:', error);
    }
    
    // Fallback: create new app state with current projects
    const projects = this.getProjects();
    const fallbackState = {
      currentProjectId: projects.length > 0 ? projects[0].id : null,
      projects: projects,
      darkMode: false,
      sidebarCollapsed: false,
    };
    
    return fallbackState;
  }

  static saveAppState(state: AppState): void {
    try {
      localStorage.setItem(this.KEYS.APP_STATE, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving app state:', error);
    }
  }

  // Project Management
  static getProjects(): Project[] {
    try {
      const stored = localStorage.getItem(this.KEYS.PROJECTS);
      if (stored) {
        const projects = JSON.parse(stored) as StoredProject[];
        return projects.map((p) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        }));
      }
    } catch (error) {
      console.error('Error reading projects:', error);
    }
    return [];
  }

  static saveProjects(projects: Project[]): void {
    try {
      localStorage.setItem(this.KEYS.PROJECTS, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  }

  static createProject(name: string, description?: string): Project {
    const projects = this.getProjects();
    const existingColors = projects.map(p => p.color);
    const availableColors = PROJECT_COLORS.filter(color => !existingColors.includes(color));
    const selectedColor = availableColors.length > 0 
      ? availableColors[0] 
      : PROJECT_COLORS[projects.length % PROJECT_COLORS.length];

    const newProject: Project = {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      description: description?.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      taskCount: 0,
      completedCount: 0,
      color: selectedColor,
    };

    const updatedProjects = [...projects, newProject];
    this.saveProjects(updatedProjects);
    
    // Initialize empty project data
    this.saveProjectData(newProject.id, {
      tasks: [],
      headers: [],
      filters: {
        assignee: '',
        search: '',
        status: '',
        priority: '',
      },
      view: 'kanban',
      currentPage: 1,
    });

    return newProject;
  }

  static updateProject(projectId: string, updates: Partial<Project>): Project | null {
    const projects = this.getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) return null;

    const updatedProject = {
      ...projects[projectIndex],
      ...updates,
      updatedAt: new Date(),
    };

    projects[projectIndex] = updatedProject;
    this.saveProjects(projects);
    return updatedProject;
  }

  static deleteProject(projectId: string): boolean {
    try {
      // Remove from projects list
      const projects = this.getProjects();
      const filteredProjects = projects.filter(p => p.id !== projectId);
      this.saveProjects(filteredProjects);

      // Remove project data
      localStorage.removeItem(this.KEYS.PROJECT_DATA(projectId));

      // Update app state if this was the current project
      const appState = this.getAppState();
      if (appState.currentProjectId === projectId) {
        appState.currentProjectId = filteredProjects.length > 0 ? filteredProjects[0].id : null;
        this.saveAppState(appState);
      }

      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }

  // Project Data Management
  static getProjectData(projectId: string): ProjectData {
    try {
      const stored = localStorage.getItem(this.KEYS.PROJECT_DATA(projectId));
      if (stored) {
        const data = JSON.parse(stored) as StoredProjectData;
        return {
          tasks: data.tasks?.map((task) => ({
            ...task,
            createdAt: new Date(task.createdAt),
          })) || [],
          headers: data.headers || [],
          filters: data.filters || {
            assignee: '',
            search: '',
            status: '',
            priority: '',
          },
          view: data.view || 'kanban',
          currentPage: data.currentPage || 1,
        };
      }
    } catch (error) {
      console.error('Error reading project data:', error);
    }

    // Return default empty project data
    return {
      tasks: [],
      headers: [],
      filters: {
        assignee: '',
        search: '',
        status: '',
        priority: '',
      },
      view: 'kanban',
      currentPage: 1,
    };
  }

  static saveProjectData(projectId: string, data: ProjectData): void {
    try {
      localStorage.setItem(this.KEYS.PROJECT_DATA(projectId), JSON.stringify(data));
      
      // Update project metadata
      this.updateProjectMetadata(projectId, data.tasks);
    } catch (error) {
      console.error('Error saving project data:', error);
    }
  }

  static updateProjectMetadata(projectId: string, tasks: Task[]): void {
    const taskCount = tasks.length;
    const completedCount = tasks.filter(task => task.status === 'Deployed').length;
    
    this.updateProject(projectId, {
      taskCount,
      completedCount,
    });
  }

  // Task Operations
  static addTaskToProject(projectId: string, task: Task): void {
    const projectData = this.getProjectData(projectId);
    projectData.tasks = [task, ...projectData.tasks];
    this.saveProjectData(projectId, projectData);
  }

  static updateTaskInProject(projectId: string, taskId: string, updates: Partial<Task>): boolean {
    try {
      const projectData = this.getProjectData(projectId);
      const taskIndex = projectData.tasks.findIndex(task => task.id === taskId);
      
      if (taskIndex === -1) return false;

      projectData.tasks[taskIndex] = {
        ...projectData.tasks[taskIndex],
        ...updates,
      };

      this.saveProjectData(projectId, projectData);
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      return false;
    }
  }

  static deleteTaskFromProject(projectId: string, taskId: string): boolean {
    try {
      const projectData = this.getProjectData(projectId);
      projectData.tasks = projectData.tasks.filter(task => task.id !== taskId);
      this.saveProjectData(projectId, projectData);
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  // Bulk Operations
  static importTasksToProject(projectId: string, tasks: Task[], headers: string[]): void {
    const projectData = this.getProjectData(projectId);
    
    // Assign project ID to all tasks
    const projectTasks = tasks.map(task => ({
      ...task,
      projectId,
    }));

    projectData.tasks = [...projectTasks, ...projectData.tasks];
    projectData.headers = Array.from(new Set([...headers, ...projectData.headers]));
    
    this.saveProjectData(projectId, projectData);
  }

  static exportProjectData(projectId: string): { project: Project; data: ProjectData } | null {
    try {
      const projects = this.getProjects();
      const project = projects.find(p => p.id === projectId);
      
      if (!project) return null;

      const data = this.getProjectData(projectId);
      
      return { project, data };
    } catch (error) {
      console.error('Error exporting project data:', error);
      return null;
    }
  }

  // Utility Methods
  static getTotalStorageSize(): number {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith('taskManager_')) {
        total += localStorage[key].length;
      }
    }
    return total;
  }

  static clearAllData(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('taskManager_'));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  // Database Migration Helpers (for future PostgreSQL migration)
  static exportForDatabase(): ExportData {
    const appState = this.getAppState();
    const projects = this.getProjects();
    
    const exportData: ExportData = {
      appState,
      projects: projects.map(project => ({
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        data: this.getProjectData(project.id),
      })),
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };

    return exportData;
  }

  static importFromDatabase(data: ImportData): boolean {
    try {
      // Clear existing data
      this.clearAllData();

      // Import app state
      if (data.appState) {
        this.saveAppState(data.appState);
      }

      // Import projects and their data
      if (data.projects) {
        const projects: Project[] = data.projects.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
          taskCount: p.taskCount,
          completedCount: p.completedCount,
          color: p.color,
        }));

        this.saveProjects(projects);

        // Import project data
        data.projects.forEach((p) => {
          if (p.data) {
            this.saveProjectData(p.id, p.data);
          }
        });
      }

      return true;
    } catch (error) {
      console.error('Error importing from database:', error);
      return false;
    }
  }
}