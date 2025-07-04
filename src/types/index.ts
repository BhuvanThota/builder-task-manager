// src/types/index.ts
export interface Task {
  id: string;
  status: string;
  assignee: string;
  createdAt: Date;
  projectId: string; // New: Link task to project
  [key: string]: string | number | Date | undefined | boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  taskCount: number;
  completedCount: number;
  color: string; // For visual identification
}

export interface ProjectData {
  tasks: Task[];
  headers: string[];
  filters: ProjectFilters;
  view: 'kanban' | 'table';
  currentPage: number;
}

export interface ProjectFilters {
  assignee: string;
  search: string;
  status: string;
  priority: string;
}

export interface AppState {
  currentProjectId: string | null;
  projects: Project[];
  darkMode: boolean;
  sidebarCollapsed: boolean;
}

export const KANBAN_COLUMNS = [
  'Not Started',
  'In Progress', 
  'Bugs',
  'Dev Completed',
  'Tested',
  'Deployed'
] as const;

export type Status = typeof KANBAN_COLUMNS[number];

export const STATUS_COLORS: Record<string, string> = {
  'Not Started': 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  'Bugs': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
  'Dev Completed': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  'Tested': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
  'Deployed': 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700'
};

export const STATUS_CARD_STYLES: Record<string, string> = {
  'Not Started': 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 text-gray-800 dark:text-gray-300',
  'In Progress': 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 ring-1 ring-inset ring-blue-300 dark:ring-blue-700 text-blue-800 dark:text-blue-300',
  'Bugs': 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 ring-1 ring-inset ring-red-300 dark:ring-red-700 text-red-800 dark:text-red-300',
  'Dev Completed': 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 ring-1 ring-inset ring-green-300 dark:ring-green-700 text-green-800 dark:text-green-300',
  'Tested': 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 ring-1 ring-inset ring-purple-300 dark:ring-purple-700 text-purple-800 dark:text-purple-300',
  'Deployed': 'bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30 ring-1 ring-inset ring-indigo-300 dark:ring-indigo-700 text-indigo-800 dark:text-indigo-300',
};

export const PROJECT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6366F1'  // Indigo
];

export const MAX_PROJECTS = 10;

// Database-ready interfaces for future PostgreSQL migration
export interface DatabaseProject {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: Date;
  updated_at: Date;
  user_id?: string; // For multi-user support
}

export interface DatabaseTask {
  id: string;
  project_id: string;
  status: string;
  assignee: string | null;
  created_at: Date;
  updated_at: Date;
  data: Record<string, string | number | Date | boolean | null | undefined>; // JSON field for dynamic task fields
  user_id?: string;
}

export interface DatabaseProjectHeaders {
  id: string;
  project_id: string;
  headers: string[];
  created_at: Date;
}