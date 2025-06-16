// src/utils/taskHelpers.ts
import { Task } from '@/types';

// Define interfaces for better type safety
interface RawTaskData {
  id?: string;
  Status?: string;
  status?: string;
  'Assigned To'?: string;
  'Assignee'?: string;
  'assignee'?: string;
  'assigned_to'?: string;
  'assigned to'?: string;
  [key: string]: string | number | Date | undefined | null;
}

interface CleanedRowData {
  [key: string]: string | number | Date | undefined;
}

export const createTask = (data: RawTaskData, headers: string[], projectId?: string): Task => {
  // Generate unique ID
  const id = data.id || `${projectId || 'default'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Handle status field - check multiple possible field names
  const status = data.Status || data.status || 'Not Started';
  
  // Handle assignee field - check multiple possible field names with proper precedence
  let assignee = '';
  const assigneeFields: (keyof RawTaskData)[] = ['Assigned To', 'assignee', 'Assignee', 'assigned_to', 'assigned to'];
  for (const field of assigneeFields) {
    const fieldValue = data[field];
    if (fieldValue && typeof fieldValue === 'string' && fieldValue.trim()) {
      assignee = fieldValue.trim();
      break;
    }
  }
  
  const task: Task = {
    id,
    status,
    assignee,
    projectId: projectId || 'default', // Provide default for backwards compatibility
    createdAt: new Date(),
  };

  // Add all other fields dynamically, excluding the ones we've already handled
  const excludedFields = ['id', 'status', 'assignee', 'Status', 'Assigned To', 'Assignee', 'assigned_to', 'assigned to', 'createdAt', 'projectId'];
  
  headers.forEach(header => {
    if (!excludedFields.some(excluded => excluded.toLowerCase() === header.toLowerCase())) {
      // Only add if the field has a value
      const fieldValue = data[header];
      if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
        task[header] = fieldValue;
      }
    }
  });

  return task;
};

export const getTaskDisplayName = (task: Task): string => {
  // Priority fields to check for display name
  const priorityFields = ['Task Name', 'Plan', 'Focus', 'Project', 'Key Topics', 'Title', 'Name', 'Task', 'Description'];
  
  // Check priority fields first
  for (const field of priorityFields) {
    const value = task[field];
    if (value && typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  
  // If no priority field found, find first non-empty field (excluding system fields)
  const systemFields = ['id', 'status', 'assignee', 'createdAt', 'projectId'];
  for (const [key, value] of Object.entries(task)) {
    if (!systemFields.includes(key) && value && typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  
  return 'Untitled Task';
};

// Overloaded function to support both old and new signatures
export function processParsedData(
  data: Record<string, unknown>[], 
  extractedHeaders: string[]
): { tasks: Task[], headers: string[] };
export function processParsedData(
  data: Record<string, unknown>[], 
  extractedHeaders: string[],
  projectId: string
): { tasks: Task[], headers: string[] };
export function processParsedData(
  data: Record<string, unknown>[], 
  extractedHeaders: string[],
  projectId?: string
): { tasks: Task[], headers: string[] } {
  // Clean and normalize headers
  const cleanHeaders = extractedHeaders
    .map(header => header?.toString().trim())
    .filter((header): header is string => header !== undefined && header.length > 0);
  
  // Ensure required headers are included if not present
  const assigneeHeaders = ['Assigned To', 'Assignee', 'assignee'];
  
  // Check if any assignee field exists, if not add 'Assigned To'
  const hasAssigneeField = cleanHeaders.some(header => 
    assigneeHeaders.some(assigneeField => 
      assigneeField.toLowerCase() === header.toLowerCase()
    )
  );
  
  if (!hasAssigneeField) {
    cleanHeaders.push('Assigned To');
  }
  
  // Add Status if not present
  if (!cleanHeaders.some(header => header.toLowerCase() === 'status')) {
    cleanHeaders.push('Status');
  }
  
  // Remove duplicates while preserving order
  const uniqueHeaders = [...new Set(cleanHeaders)];
  
  // Use provided projectId or generate a default one
  const currentProjectId = projectId || `default_${Date.now()}`;
  
  // Filter and process data
  const validTasks = data
    .filter((row): row is Record<string, unknown> => {
      // Skip empty rows
      if (!row || typeof row !== 'object') return false;
      
      // Check if row has any meaningful content
      return Object.values(row).some(value => 
        value !== undefined && 
        value !== null && 
        value.toString().trim().length > 0
      );
    })
    .map(row => {
      // Clean the row data
      const cleanedRow: CleanedRowData = {};
      Object.keys(row).forEach(key => {
        const cleanKey = key?.toString().trim();
        if (cleanKey) {
          const value = row[key];
          // Convert empty strings to undefined for cleaner data
          if (value === '' || value === null) {
            cleanedRow[cleanKey] = undefined;
          } else if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
            cleanedRow[cleanKey] = value;
          } else {
            // Convert other types to string
            cleanedRow[cleanKey] = value?.toString();
          }
        }
      });
      
      return createTask(cleanedRow as RawTaskData, uniqueHeaders, currentProjectId);
    });
  
  return { 
    tasks: validTasks, 
    headers: uniqueHeaders 
  };
}

// Utility functions for task management
export const filterTasksByProject = (tasks: Task[], projectId: string): Task[] => {
  return tasks.filter(task => task.projectId === projectId);
};

export const getTaskStats = (tasks: Task[]) => {
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === 'Deployed').length;
  const inProgress = tasks.filter(task => task.status === 'In Progress').length;
  const notStarted = tasks.filter(task => task.status === 'Not Started').length;
  const bugs = tasks.filter(task => task.status === 'Bugs').length;
  const tested = tasks.filter(task => task.status === 'Tested').length;
  const devCompleted = tasks.filter(task => task.status === 'Dev Completed').length;

  return {
    total,
    completed,
    inProgress,
    notStarted,
    bugs,
    tested,
    devCompleted,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
};

export const getUniqueAssignees = (tasks: Task[]): string[] => {
  const assignees = tasks
    .map(task => task.assignee)
    .filter(assignee => assignee && assignee.trim())
    .map(assignee => assignee.trim());
  
  return [...new Set(assignees)].sort();
};