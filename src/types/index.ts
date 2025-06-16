export interface Task {
    id: string;
    status: string;
    assignee: string;
    createdAt: Date;
    [key: string]: string | number | Date | undefined; // For dynamic fields
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
    'Not Started': 'bg-gray-100 text-gray-800 border-gray-300',
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-300',
    'Bugs': 'bg-red-100 text-red-800 border-red-300',
    'Dev Completed': 'bg-green-100 text-green-800 border-green-300',
    'Tested': 'bg-purple-100 text-purple-800 border-purple-300',
    'Deployed': 'bg-indigo-100 text-indigo-800 border-indigo-300'
  };