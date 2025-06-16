'use client';

import React, { useState, useCallback } from 'react';
import { 
  Download, 
  Table, 
  Columns, 
  AlertCircle,
  Plus,
  Filter,
  Search,
  Users,
  BarChart3
} from 'lucide-react';
import { Task } from '@/types';
import FileUpload from './FileUpload';
import CSVTextInput from './CSVTextInput';
import KanbanView from './KanbanView';
import TableView from './TableView';
import TaskDetailsModal from './TaskDetailsModal';
import ThemeToggle from './ThemeToggle';
import ExcelJS from 'exceljs';

// Mock data for demonstration when no file is uploaded
const mockTasks: Task[] = [
  {
    id: '1',
    status: 'In Progress',
    assignee: 'John Doe',
    projectId: 'default_project', // Add this line
    createdAt: new Date(),
    'Task Name': 'Implement user authentication',
    'Priority': 'High',
    'Project': 'Dashboard v2.0',
    'Due Date': '2024-07-15'
  },
  {
    id: '2',
    status: 'Not Started',
    assignee: 'Jane Smith',
    projectId: 'default_project', // Add this line
    createdAt: new Date(),
    'Task Name': 'Design landing page',
    'Priority': 'Medium',
    'Project': 'Marketing Site',
    'Due Date': '2024-07-20'
  },
  {
    id: '3',
    status: 'Dev Completed',
    assignee: 'Mike Johnson',
    projectId: 'default_project', // Add this line
    createdAt: new Date(),
    'Task Name': 'API integration testing',
    'Priority': 'High',
    'Project': 'Mobile App',
    'Due Date': '2024-07-10'
  },
  {
    id: '4',
    status: 'Tested',
    assignee: 'Sarah Wilson',
    projectId: 'default_project', // Add this line
    createdAt: new Date(),
    'Task Name': 'Database optimization',
    'Priority': 'Low',
    'Project': 'Backend Services',
    'Due Date': '2024-07-25'
  }
];

const mockHeaders = ['Task Name', 'Priority', 'Project', 'Due Date'];

const ITEMS_PER_PAGE = 20;

export default function TaskManager() {
  // Local storage keys
  const STORAGE_TASKS_KEY = 'taskManager_tasks';
  const STORAGE_HEADERS_KEY = 'taskManager_headers';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [darkMode, setDarkMode] = useState(false);
  const [filterAssignee, setFilterAssignee] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  
  // Modal state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDataLoaded = useCallback((newTasks: Task[], newHeaders: string[]) => {
    setTasks(newTasks);
    setHeaders(newHeaders);
    setCurrentPage(1);
    setError('');
    // Save to localStorage
    localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(newTasks));
    localStorage.setItem(STORAGE_HEADERS_KEY, JSON.stringify(newHeaders));
  }, []);

  const handleStatusChange = useCallback((taskId: string, newStatus: string) => {
    setTasks(prevTasks => {
      const updated = prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleFieldUpdate = useCallback((taskId: string, field: string, value: string) => {
    setTasks(prevTasks => {
      const updated = prevTasks.map(task =>
        task.id === taskId ? { ...task, [field]: value } : task
      );
      localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  }, []);

  const handleTaskUpdate = useCallback((updatedTask: Task) => {
    setTasks(prevTasks => {
      const updated = prevTasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      );
      localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(updated));
      return updated;
    });
    setSelectedTask(updatedTask);
  }, []);

  const handleTaskDelete = useCallback((taskId: string) => {
    setTasks(prevTasks => {
      const updated = prevTasks.filter(task => task.id !== taskId);
      localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(updated));
      return updated;
    });
    setIsModalOpen(false);
    setSelectedTask(null);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTask(null);
  }, []);

  const toggleTaskExpansion = useCallback((taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);

  const filteredTasks = tasks.filter(task => 
    (!filterAssignee || task.assignee.toLowerCase().includes(filterAssignee.toLowerCase())) &&
    (!searchTerm || 
      Object.values(task).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  );

  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = view === 'table' 
    ? filteredTasks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : filteredTasks;

  const getUniqueAssignees = () => {
    return [...new Set(tasks.map(t => t.assignee).filter(Boolean))];
  };

  const handleExport = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Tasks');

      // Add headers
      const exportHeaders = ['Status', 'Assignee', ...headers];
      worksheet.addRow(exportHeaders);

      // Add data
      filteredTasks.forEach(task => {
        const row = [
          task.status,
          task.assignee,
          ...headers.map(header => task[header] || '')
        ];
        worksheet.addRow(row);
      });

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        column.width = 15;
      });

      // Generate file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasks-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export tasks. Please try again.');
    }
  };

  const addNewTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      status: 'Not Started',
      assignee: '',
      projectId: 'default_project',
      createdAt: new Date(),
      'Task Name': 'New Task'
    };
    setTasks(prev => {
      const updated = [newTask, ...prev];
      localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Deployed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;

  // Reset localStorage and restore defaults
  const handleReset = () => {
    localStorage.removeItem(STORAGE_TASKS_KEY);
    localStorage.removeItem(STORAGE_HEADERS_KEY);
    setTasks(mockTasks);
    setHeaders(mockHeaders);
    setCurrentPage(1);
    setError('');
    setShowResetModal(false);
  };

  // On mount, load tasks/headers from localStorage or mock data
  React.useEffect(() => {
    function getInitialTasks(): Task[] {
      try {
        const stored = localStorage.getItem(STORAGE_TASKS_KEY);
        if (stored) return JSON.parse(stored, (key, value) => {
          if (key === 'createdAt' && value) return new Date(value);
          return value;
        });
      } catch {}
      // Use mockTasks but convert date strings to Date on client
      return mockTasks.map(task => ({
        ...task,
        createdAt: typeof task.createdAt === 'string' ? new Date(task.createdAt) : task.createdAt
      }));
    }
    function getInitialHeaders(): string[] {
      try {
        const stored = localStorage.getItem(STORAGE_HEADERS_KEY);
        if (stored) return JSON.parse(stored);
      } catch {}
      return mockHeaders;
    }
    setTasks(getInitialTasks());
    setHeaders(getInitialHeaders());
    setIsLoaded(true);

    // In case another tab resets localStorage
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_TASKS_KEY || e.key === STORAGE_HEADERS_KEY) {
        setTasks(getInitialTasks());
        setHeaders(getInitialHeaders());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Builder Task Manager
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage your projects efficiently
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-4">
              {/* Stats */}
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white">{isLoaded ? totalTasks : '-'}</div>
                  <div className="text-gray-500 dark:text-gray-400">Total</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{isLoaded ? inProgressTasks : '-'}</div>
                  <div className="text-gray-500 dark:text-gray-400">Active</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">{isLoaded ? completedTasks : '-'}</div>
                  <div className="text-gray-500 dark:text-gray-400">Done</div>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setView('kanban')}
                  className={`px-3 py-1.5 rounded flex items-center gap-2 transition-colors text-sm ${
                    view === 'kanban' 
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Columns size={16} />
                  Board
                </button>
                <button
                  onClick={() => setView('table')}
                  className={`px-3 py-1.5 rounded flex items-center gap-2 transition-colors text-sm ${
                    view === 'table' 
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Table size={16} />
                  Table
                </button>
              </div>

              {/* Dark Mode Toggle */}
              <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full Width for Kanban */}
      <div className={`w-full ${view === 'kanban' ? 'px-4 sm:px-6 lg:px-8' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'} py-8`}>
        {/* Action Bar */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left Side - Upload Actions */}
            <div className="flex flex-wrap items-center gap-3 relative">
              <FileUpload onDataLoaded={handleDataLoaded} onError={setError} />
              <CSVTextInput onDataLoaded={handleDataLoaded} onError={setError} />
              
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <Download size={18} />
                Export
              </button>

              <button 
                onClick={addNewTask}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-sm"
              >
                <Plus size={18} />
                Add Task
              </button>

              <button
                onClick={() => setShowResetModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                title="Reset and clear all task data"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Reset
              </button> 
            </div>

            {/* Right Side - Search and Filters */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
                  showFilters
                    ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <Filter size={18} />
                Filters
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500" />
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                <button 
                  onClick={() => setError('')}
                  className="ml-auto text-red-500 hover:text-red-700 dark:hover:text-red-300"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-500" />
                  <select
                    value={filterAssignee}
                    onChange={(e) => setFilterAssignee(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="">All Assignees</option>
                    {getUniqueAssignees().map(assignee => (
                      <option key={assignee} value={assignee}>{assignee}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    setFilterAssignee('');
                    setSearchTerm('');
                  }}
                  className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Task Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isLoaded ? (
              <>Showing {filteredTasks.length} of {totalTasks} tasks</>
            ) : (
              <>Loading tasks...</>
            )}
          </p>
        </div>

        {/* Views */}
        {view === 'kanban' ? (
          <KanbanView
            tasks={filteredTasks}
            onStatusChange={handleStatusChange}
            expandedTasks={expandedTasks}
            toggleTaskExpansion={toggleTaskExpansion}
            onTaskClick={handleTaskClick}
          />
        ) : (
          <TableView
            tasks={paginatedTasks}
            headers={headers}
            onStatusChange={handleStatusChange}
            onFieldUpdate={handleFieldUpdate}
            onTaskClick={handleTaskClick}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* No Tasks State */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {tasks.length === 0 
                ? 'Upload a file or paste CSV data to get started' 
                : 'Try adjusting your search or filters'
              }
            </p>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-sm w-full border border-red-400">
            <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" /> Confirm Reset
            </h2>
            <p className="text-gray-700 dark:text-gray-200 mb-6">Are you sure you want to reset all task data? <b>This cannot be undone.</b></p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => setShowResetModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold"
                onClick={handleReset}
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      <TaskDetailsModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onUpdate={handleTaskUpdate}
        onDelete={handleTaskDelete}
        headers={headers}
      />
    </div>
  );
}