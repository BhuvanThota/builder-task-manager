'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical,
  Edit3,
  Trash2,
  Download,
  FileText,
  CheckCircle,
  Clock,
  FolderOpen
} from 'lucide-react';
import { Project, MAX_PROJECTS } from '../../types';

interface ProjectSidebarProps {
  projects: Project[];
  currentProjectId: string | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onExportProject: (project: Project) => void;
}

export default function ProjectSidebar({
  projects,
  currentProjectId,
  collapsed,
  onToggleCollapse,
  onSelectProject,
  onCreateProject,
  onEditProject,
  onDeleteProject,
  onExportProject,
}: ProjectSidebarProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const currentProject = projects.find(p => p.id === currentProjectId);
  const canCreateMore = projects.length < MAX_PROJECTS;

  const handleMenuToggle = (projectId: string) => {
    setOpenMenuId(openMenuId === projectId ? null : projectId);
  };

  const closeMenu = () => setOpenMenuId(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getProgressPercentage = (project: Project) => {
    return project.taskCount > 0 ? Math.round((project.completedCount / project.taskCount) * 100) : 0;
  };

  return (
    <div className={`relative bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-80'
    } flex flex-col h-full`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Projects</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {projects.length} of {MAX_PROJECTS}
            </p>
          </div>
        )}
        
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight size={20} className="text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronLeft size={20} className="text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Create Project Button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onCreateProject}
          disabled={!canCreateMore}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
            canCreateMore
              ? 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              : 'bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
          title={!canCreateMore ? `Maximum ${MAX_PROJECTS} projects allowed` : 'Create new project'}
        >
          <Plus size={20} />
          {!collapsed && (
            <span className="font-medium">
              {canCreateMore ? 'New Project' : 'Limit Reached'}
            </span>
          )}
        </button>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto">
        {projects.length === 0 ? (
          <div className="p-4 text-center">
            {!collapsed && (
              <div className="text-gray-500 dark:text-gray-400">
                <FolderOpen size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No projects yet</p>
                <p className="text-xs mt-1">Create your first project to get started</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {projects.map((project) => {
              const isActive = project.id === currentProjectId;
              const progress = getProgressPercentage(project);
              
              return (
                <div
                  key={project.id}
                  className={`relative group rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div
                    onClick={() => {
                      onSelectProject(project.id);
                      closeMenu();
                    }}
                    className="p-3 cursor-pointer flex items-center gap-3"
                  >
                    {/* Project Color Indicator */}
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />

                    {!collapsed && (
                      <div className="flex-1 min-w-0">
                        {/* Project Name */}
                        <h3 className={`font-medium truncate ${
                          isActive 
                            ? 'text-blue-900 dark:text-blue-100' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {project.name}
                        </h3>

                        {/* Project Stats */}
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <FileText size={12} />
                            <span>{project.taskCount}</span>
                          </div>
                          
                          {project.completedCount > 0 && (
                            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                              <CheckCircle size={12} />
                              <span>{project.completedCount}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock size={12} />
                            <span>{formatDate(project.updatedAt)}</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {project.taskCount > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                              <span>Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full transition-all duration-300"
                                style={{
                                  width: `${progress}%`,
                                  backgroundColor: project.color,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        {project.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
                            {project.description}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Menu Button */}
                    {!collapsed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuToggle(project.id);
                        }}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                      >
                        <MoreVertical size={16} className="text-gray-400" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown Menu */}
                  {openMenuId === project.id && !collapsed && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={closeMenu}
                      />
                      
                      {/* Menu */}
                      <div className="absolute right-2 top-12 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]">
                        <button
                          onClick={() => {
                            onEditProject(project);
                            closeMenu();
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Edit3 size={14} />
                          Edit Project
                        </button>
                        
                        <button
                          onClick={() => {
                            onExportProject(project);
                            closeMenu();
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Download size={14} />
                          Export Data
                        </button>
                        
                        <hr className="my-1 border-gray-200 dark:border-gray-600" />
                        
                        <button
                          onClick={() => {
                            onDeleteProject(project);
                            closeMenu();
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                        >
                          <Trash2 size={14} />
                          Delete Project
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Current Project Summary (when collapsed) */}
      {collapsed && currentProject && (
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div
              className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: currentProject.color }}
            >
              {currentProject.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                {currentProject.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {currentProject.taskCount} tasks
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
