// components/TaskManager/MultiProjectTaskManager.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Download, 
  Table, 
  Columns, 
  AlertCircle,
  Plus,
  Search,
  Trash2,
  FolderOpen
} from 'lucide-react';
import { Task, Project, ProjectData, AppState, MAX_PROJECTS } from '../../types';
import { StorageService } from '../../services/storageService';
import ProjectSidebar from '../Sidebar/ProjectSidebar';
import ProjectModal from '../Modals/ProjectModal';
import KanbanView from '../KanbanView';
import TableView from '../TableView';
import TaskDetailsModal from '../TaskDetailsModal';
import ThemeToggle from '../ThemeToggle';
import ExcelJS from 'exceljs';
import FileUpload from '../Upload/FileUpload';
import CSVTextInput from '../Upload/CSVTextInput';

const ITEMS_PER_PAGE = 20;

export default function MultiProjectTaskManager() {
  // App State
  const [appState, setAppState] = useState<AppState>({
    currentProjectId: null,
    projects: [],
    darkMode: false,
    sidebarCollapsed: false,
  });

  // Current Project Data
  const [projectData, setProjectData] = useState<ProjectData>({
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

  // UI State
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Project | null>(null);

  // Initialize app on mount
// Keep only this useEffect and modify it:
useEffect(() => {
  const initialAppState = StorageService.getAppState();
  
  // If no current project is set but projects exist, set to first project
  if (!initialAppState.currentProjectId && initialAppState.projects.length > 0) {
    initialAppState.currentProjectId = initialAppState.projects[0].id;
  }
  
  setAppState(initialAppState);

  if (initialAppState.currentProjectId) {
    const data = StorageService.getProjectData(initialAppState.currentProjectId);
    setProjectData(data);
  }
}, []);


  // Save app state whenever it changes
  useEffect(() => {
    StorageService.saveAppState(appState);
  }, [appState]);

  // Save project data whenever it changes
  useEffect(() => {
    if (appState.currentProjectId && projectData) {
      StorageService.saveProjectData(appState.currentProjectId, projectData);
    }
  }, [appState.currentProjectId, projectData]);

  const currentProject = appState.projects.find(p => p.id === appState.currentProjectId);

  // Project Management
  const handleCreateProject = useCallback(() => {
    if (appState.projects.length >= MAX_PROJECTS) {
      setError(`Maximum ${MAX_PROJECTS} projects allowed`);
      return;
    }
    setEditingProject(null);
    setIsProjectModalOpen(true);
  }, [appState.projects.length]);

  const handleEditProject = useCallback((project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  }, []);

  const handleSaveProject = useCallback((projectInfo: { name: string; description: string; color: string }) => {
    try {
      if (editingProject) {
        // Update existing project
        const updatedProject = StorageService.updateProject(editingProject.id, {
          name: projectInfo.name,
          description: projectInfo.description,
          color: projectInfo.color,
        });
        
        if (updatedProject) {
          setAppState(prev => ({
            ...prev,
            projects: prev.projects.map(p => p.id === updatedProject.id ? updatedProject : p)
          }));
        }
      } else {
        // Create new project
        const newProject = StorageService.createProject(projectInfo.name, projectInfo.description);
        setAppState(prev => ({
          ...prev,
          projects: [...prev.projects, newProject],
          currentProjectId: newProject.id, // Switch to new project
        }));
        
        // Load empty project data
        setProjectData(StorageService.getProjectData(newProject.id));
      }
      
      setIsProjectModalOpen(false);
      setEditingProject(null);
      setError('');
    } catch (error) {
      console.error('Error saving project:', error);
      setError('Failed to save project');
    }
  }, [editingProject]);

  const handleDeleteProject = useCallback((project: Project) => {
    setShowDeleteConfirm(project);
  }, []);

  const confirmDeleteProject = useCallback(() => {
    if (!showDeleteConfirm) return;
    
    try {
      const success = StorageService.deleteProject(showDeleteConfirm.id);
      
      if (success) {
        const remainingProjects = appState.projects.filter(p => p.id !== showDeleteConfirm.id);
        const newCurrentProjectId = remainingProjects.length > 0 ? remainingProjects[0].id : null;
        
        setAppState(prev => ({
          ...prev,
          projects: remainingProjects,
          currentProjectId: newCurrentProjectId,
        }));
        
        // Load data for new current project or clear if no projects
        if (newCurrentProjectId) {
          setProjectData(StorageService.getProjectData(newCurrentProjectId));
        } else {
          setProjectData({
            tasks: [],
            headers: [],
            filters: { assignee: '', search: '', status: '', priority: '' },
            view: 'kanban',
            currentPage: 1,
          });
        }
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project');
    } finally {
      setShowDeleteConfirm(null);
    }
  }, [showDeleteConfirm, appState.projects]);

  const handleSelectProject = useCallback((projectId: string) => {
    if (projectId === appState.currentProjectId) return;
    
    try {
      const data = StorageService.getProjectData(projectId);
      setProjectData(data);
      setAppState(prev => ({ ...prev, currentProjectId: projectId }));
      setError('');
    } catch (error) {
      console.error('Error switching project:', error);
      setError('Failed to load project data');
    }
  }, [appState.currentProjectId]);

  const handleExportProject = useCallback(async (project: Project) => {
    try {
      const exportData = StorageService.exportProjectData(project.id);
      if (!exportData) {
        setError('Failed to export project data');
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(project.name);

      // Add headers
      const exportHeaders = ['Status', 'Assignee', ...exportData.data.headers];
      worksheet.addRow(exportHeaders);

      // Add data
      exportData.data.tasks.forEach(task => {
        const row = [
          task.status,
          task.assignee,
          ...exportData.data.headers.map(header => task[header] || '')
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
      a.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export project data');
    }
  }, []);

  // Data Management
  const handleDataLoaded = useCallback((tasks: Task[], headers: string[]) => {
    if (!appState.currentProjectId) return;

    setProjectData(prev => ({
      ...prev,
      tasks: [...tasks, ...prev.tasks],
      headers: Array.from(new Set([...headers, ...prev.headers])),
    }));
    
    setError('');
  }, [appState.currentProjectId]);

  const handleStatusChange = useCallback((taskId: string, newStatus: string) => {
    if (!appState.currentProjectId) return;

    setProjectData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ),
    }));
  }, [appState.currentProjectId]);

  const handleFieldUpdate = useCallback((taskId: string, field: string, value: string) => {
    if (!appState.currentProjectId) return;

    setProjectData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId ? { ...task, [field]: value } : task
      ),
    }));
  }, [appState.currentProjectId]);

  const handleTaskUpdate = useCallback((updatedTask: Task) => {
    if (!appState.currentProjectId) return;

    setProjectData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      ),
    }));
    setSelectedTask(updatedTask);
  }, [appState.currentProjectId]);

  const handleTaskDelete = useCallback((taskId: string) => {
    if (!appState.currentProjectId) return;

    setProjectData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId),
    }));
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  }, [appState.currentProjectId]);

  const addNewTask = useCallback(() => {
    if (!appState.currentProjectId) return;

    const newTask: Task = {
      id: `${appState.currentProjectId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId: appState.currentProjectId,
      status: 'Not Started',
      assignee: '',
      createdAt: new Date(),
      'Task Name': 'New Task'
    };

    setProjectData(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
  }, [appState.currentProjectId]);

  // Filtering and Pagination
  const filteredTasks = projectData.tasks.filter(task => 
    (!projectData.filters.assignee || task.assignee.toLowerCase().includes(projectData.filters.assignee.toLowerCase())) &&
    (!projectData.filters.search || 
      Object.values(task).some(value => 
        value && value.toString().toLowerCase().includes(projectData.filters.search.toLowerCase())
      )
    ) &&
    (!projectData.filters.status || task.status === projectData.filters.status)
  );

  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = projectData.view === 'table' 
    ? filteredTasks.slice((projectData.currentPage - 1) * ITEMS_PER_PAGE, projectData.currentPage * ITEMS_PER_PAGE)
    : filteredTasks;

  // UI Handlers
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

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  }, []);

  const getUniqueAssignees = useCallback(() => {
    return [...new Set(projectData.tasks.map(t => t.assignee).filter(Boolean))];
  }, [projectData.tasks]);

  // Stats
  const totalTasks = projectData.tasks.length;
  const completedTasks = projectData.tasks.filter(t => t.status === 'Deployed').length;
  const inProgressTasks = projectData.tasks.filter(t => t.status === 'In Progress').length;

  return (
    <div className={`flex h-screen transition-colors duration-200 ${appState.darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <ProjectSidebar
        projects={appState.projects}
        currentProjectId={appState.currentProjectId}
        collapsed={appState.sidebarCollapsed}
        onToggleCollapse={() => setAppState(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }))}
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
        onEditProject={handleEditProject}
        onDeleteProject={handleDeleteProject}
        onExportProject={handleExportProject}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Project Info */}
              <div className="flex items-center space-x-4">
                {currentProject ? (
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: currentProject.color }}
                    />
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        {currentProject.name}
                      </h1>
                      {currentProject.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {currentProject.description}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <FolderOpen className="w-8 h-8 text-gray-400" />
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        No Project Selected
                      </h1>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Create or select a project to get started
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side Controls */}
              <div className="flex items-center space-x-4">
                {/* Stats */}
                {currentProject && (
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
                )}

                {/* View Toggle */}
                {currentProject && (
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setProjectData(prev => ({ ...prev, view: 'kanban' }))}
                      className={`px-3 py-1.5 rounded flex items-center gap-2 transition-colors text-sm ${
                        projectData.view === 'kanban' 
                          ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Columns size={16} />
                      Board
                    </button>
                    <button
                      onClick={() => setProjectData(prev => ({ ...prev, view: 'table' }))}
                      className={`px-3 py-1.5 rounded flex items-center gap-2 transition-colors text-sm ${
                        projectData.view === 'table' 
                          ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Table size={16} />
                      Table
                    </button>
                  </div>
                )}

                {/* Dark Mode Toggle */}
                <ThemeToggle 
                  darkMode={appState.darkMode} 
                  setDarkMode={(darkMode) => setAppState(prev => ({ ...prev, darkMode }))} 
                />
              </div>
            </div>
          </div>
        </header>

        {/* Action Bar */}
        {currentProject && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left Side - Upload Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <FileUpload
                  projectId={currentProject.id}
                  onDataLoaded={handleDataLoaded}
                  onError={setError}
                />
                <CSVTextInput
                    projectId={currentProject.id}
                    onDataLoaded={handleDataLoaded}
                    onError={setError}
                />
                
                <button 
                  onClick={() => handleExportProject(currentProject)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                  <Download size={18} />
                  Export
                </button>

                <button 
                  onClick={addNewTask}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-sm"
                >
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
                    value={projectData.filters.search}
                    onChange={(e) => setProjectData(prev => ({
                      ...prev,
                      filters: { ...prev.filters, search: e.target.value }
                    }))}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                </div>

                {/* Assignee Filter */}
                <select
                  value={projectData.filters.assignee}
                  onChange={(e) => setProjectData(prev => ({
                    ...prev,
                    filters: { ...prev.filters, assignee: e.target.value }
                  }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Assignees</option>
                  {getUniqueAssignees().map(assignee => (
                    <option key={assignee} value={assignee}>{assignee}</option>
                  ))}
                </select>
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
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {!currentProject ? (
            // No Project Selected State
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <FolderOpen size={64} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Welcome to Task Manager
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create your first project or select an existing one from the sidebar to start managing your tasks.
                </p>
                <button
                  onClick={handleCreateProject}
                  disabled={appState.projects.length >= MAX_PROJECTS}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                >
                  <Plus size={20} />
                  Create Your First Project
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {appState.projects.length}/{MAX_PROJECTS} projects used
                </p>
              </div>
            </div>
          ) : (
            // Project Content
            <div className="h-full overflow-auto p-6">
              {/* Task Count */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredTasks.length} of {totalTasks} tasks in {currentProject.name}
                </p>
              </div>

              {/* Views */}
              {projectData.view === 'kanban' ? (
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
                  headers={projectData.headers}
                  onStatusChange={handleStatusChange}
                  onFieldUpdate={handleFieldUpdate}
                  onTaskClick={handleTaskClick}
                  currentPage={projectData.currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setProjectData(prev => ({ ...prev, currentPage: page }))}
                />
              )}

              {/* No Tasks State */}
              {filteredTasks.length === 0 && totalTasks === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Upload a file, paste CSV data, or create a new task to get started
                  </p>
                  <button
                    onClick={addNewTask}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={16} />
                    Create First Task
                  </button>
                </div>
              )}

              {/* Filtered No Results */}
              {filteredTasks.length === 0 && totalTasks > 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Try adjusting your search or filters
                  </p>
                  <button
                    onClick={() => setProjectData(prev => ({
                      ...prev,
                      filters: { assignee: '', search: '', status: '', priority: '' }
                    }))}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        project={editingProject}
        existingProjects={appState.projects}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
      />

      <TaskDetailsModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onUpdate={handleTaskUpdate}
        onDelete={handleTaskDelete}
        headers={projectData.headers}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Project</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete <strong>&quot;{showDeleteConfirm.name}&quot;</strong>? 
              All tasks and data in this project will be permanently lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}