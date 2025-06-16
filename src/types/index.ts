export interface Task {
    id: string;
    status: string;
    assignee: string;
    createdAt: Date;
    [key: string]: string | number | Date | undefined | boolean; // For dynamic fields
  }
  
  export interface TaskManagerState {
    tasks: Task[];
    headers: string[];
    view: 'kanban' | 'table';
    darkMode: boolean;
    filterAssignee: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    currentPage: number;
    expandedTasks: Set<string>;
  }
  
  export const KANBAN_COLUMNS = [
    'Not Started',
    'In Progress',
    'Bugs',
    'Dev Completed',
    'Tested',
    'Deployed'
  ] as const;
  
  export const STATUS_COLORS: Record<string, string> = {
    'Not Started': 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
    'Bugs': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
    'Dev Completed': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
    'Tested': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700',
    'Deployed': 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-700'
  };