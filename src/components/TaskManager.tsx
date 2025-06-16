'use client';

import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Download, 
  Table, 
  Columns, 
  Moon, 
  Sun, 
  AlertCircle,
  Plus,
  Filter,
  Search,
  Users,
  BarChart3,
  GripVertical,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Task } from '@/types';

// Mock data for demonstration
const mockTasks = [
  {
    id: '1',
    status: 'In Progress',
    assignee: 'John Doe',
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
    createdAt: new Date(),
    'Task Name': 'Database optimization',
    'Priority': 'Low',
    'Project': 'Backend Services',
    'Due Date': '2024-07-25'
  }
];

const KANBAN_COLUMNS = [
  'Not Started',
  'In Progress',
  'Bugs',
  'Dev Completed',
  'Tested',
  'Deployed'
];

const STATUS_COLORS = {
  'Not Started': 'bg-gray-100 text-gray-800 border-gray-300',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-300',
  'Bugs': 'bg-red-100 text-red-800 border-red-300',
  'Dev Completed': 'bg-green-100 text-green-800 border-green-300',
  'Tested': 'bg-purple-100 text-purple-800 border-purple-300',
  'Deployed': 'bg-indigo-100 text-indigo-800 border-indigo-300'
};

const PRIORITY_COLORS = {
  'High': 'bg-red-50 text-red-700 border-red-200',
  'Medium': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Low': 'bg-green-50 text-green-700 border-green-200'
};

function isDateLike(val: unknown): val is Date {
  return (
    typeof val === 'object' &&
    val !== null &&
    typeof (val as Date).toDateString === 'function'
  );
}

function formatDisplayValue(value: unknown) {
  if (value instanceof Date) {
    return value.toLocaleString();
  }
  if (isDateLike(value)) {
    return (value as Date).toLocaleString();
  }
  return typeof value === 'string' || typeof value === 'number' ? value : '';
}

export default function ImprovedTaskManager() {
  const [tasks] = useState(mockTasks);
  const [view, setView] = useState('kanban');
  const [darkMode, setDarkMode] = useState(false);
  const [filterAssignee, setFilterAssignee] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState(new Set());

  const getTasksByStatus = (status: string) => {
    return tasks
      .filter(task => task.status === status)
      .filter(task => !filterAssignee || task.assignee.toLowerCase().includes(filterAssignee.toLowerCase()))
      .filter(task => !searchTerm || 
        task['Task Name']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchTerm.toLowerCase())
      );
  };

  const getTaskDisplayName = (task: Task) => {
    return task['Task Name'] || task['Project'] || 'Untitled Task';
  };

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const getUniqueAssignees = () => {
    return [...new Set(tasks.map(t => t.assignee).filter(Boolean))];
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Deployed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <div className="font-semibold text-gray-900 dark:text-white">{totalTasks}</div>
                  <div className="text-gray-500 dark:text-gray-400">Total</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{inProgressTasks}</div>
                  <div className="text-gray-500 dark:text-gray-400">Active</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">{completedTasks}</div>
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
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Bar */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left Side - Upload Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <label className="cursor-pointer">
                <input type="file" accept=".csv,.xlsx,.xls,.txt" className="hidden" />
                <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                  <Upload size={18} />
                  Upload File
                </div>
              </label>
              
              <button className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm">
                <FileText size={18} />
                Paste CSV
              </button>

              <button className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                <Download size={18} />
                Export
              </button>

              <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-sm">
                <Plus size={18} />
                Add Task
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
            Showing {tasks.filter(task => 
              (!filterAssignee || task.assignee.toLowerCase().includes(filterAssignee.toLowerCase())) &&
              (!searchTerm || 
                task['Task Name']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.assignee.toLowerCase().includes(searchTerm.toLowerCase())
              )
            ).length} of {totalTasks} tasks
          </p>
        </div>

        {/* Kanban View */}
        {view === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {KANBAN_COLUMNS.map(column => (
              <div key={column} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center justify-between">
                    <span>{column}</span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs">
                      {getTasksByStatus(column).length}
                    </span>
                  </h3>
                </div>
                <div className="p-4 space-y-3 min-h-[400px]">
                  {getTasksByStatus(column).map((task) => {
                    const isExpanded = expandedTasks.has(task.id);
                    const displayName = getTaskDisplayName(task);
                    
                    return (
                      <div
                        key={task.id}
                        className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            {(() => {
                                const displayNameStr = formatDisplayValue(displayName).toString();
                                return (
                                    <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                                    {displayNameStr.length > 60 && !isExpanded
                                        ? displayNameStr.substring(0, 60) + '...'
                                        : displayNameStr}
                                    </h4>
                                );
                            })()}

                            
                            <div className="flex items-center justify-between mb-3">
                              <span className={`inline-block px-2 py-1 text-xs rounded-full border ${STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]}`}>
                                {task.status}
                              </span>
                              {task['Priority'] && (
                                <span className={`inline-block px-2 py-1 text-xs rounded-full border ${PRIORITY_COLORS[task['Priority'] as keyof typeof PRIORITY_COLORS]}`}>
                                  {task['Priority']}
                                </span>
                              )}
                            </div>

                            {task.assignee && (
                              <div className="flex items-center gap-2 mb-2 text-xs text-gray-600 dark:text-gray-400">
                                <User size={12} />
                                <span className="truncate">{task.assignee}</span>
                              </div>
                            )}

                            {task['Due Date'] && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                Due: {formatDisplayValue(task['Due Date'])}
                              </div>
                            )}
                            
                            {isExpanded && (
                              <div className="mt-3 space-y-2 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-3">
                                {Object.entries(task).map(([key, value]) => {
                                  if (!['id', 'status', 'assignee', 'createdAt', 'Task Name', 'Priority', 'Due Date'].includes(key) && value) {
                                    const displayValue = formatDisplayValue(value);
                                    return (
                                      <div key={key} className="break-words">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{key}:</span> {displayValue}
                                      </div>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            )}
                            
                            {(() => {
                                const displayNameStr = formatDisplayValue(displayName).toString();
                                return displayNameStr.length > 60 && (
                                    <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTaskExpansion(task.id);
                                    }}
                                    className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs flex items-center gap-1"
                                    >
                                    {isExpanded ? (
                                        <>Show less <ChevronUp size={12} /></>
                                    ) : (
                                        <>Show more <ChevronDown size={12} /></>
                                    )}
                                    </button>
                                )
                            })()}
                            </div>
                            </div>
                        </div>
                        );
                    })}
                  
                  {getTasksByStatus(column).length === 0 && (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Plus size={20} />
                      </div>
                      <p className="text-sm">No tasks in {column.toLowerCase()}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table View */}
        {view === 'table' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Task</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Assignee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Due Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {tasks.filter(task => 
                    (!filterAssignee || task.assignee.toLowerCase().includes(filterAssignee.toLowerCase())) &&
                    (!searchTerm || 
                      task['Task Name']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      task.assignee.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                  ).map(task => (
                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDisplayValue(getTaskDisplayName(task))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">{task.assignee}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {task['Priority'] && (
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${PRIORITY_COLORS[task['Priority'] as keyof typeof PRIORITY_COLORS]}`}>
                            {task['Priority']}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {task['Project'] || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {task['Due Date'] || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {tasks.filter(task => 
              (!filterAssignee || task.assignee.toLowerCase().includes(filterAssignee.toLowerCase())) &&
              (!searchTerm || 
                task['Task Name']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.assignee.toLowerCase().includes(searchTerm.toLowerCase())
              )
            ).length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}