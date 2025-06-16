'use client';

import React, { useState, useRef, DragEvent } from 'react';
import { GripVertical, User, ChevronDown, ChevronUp } from 'lucide-react';
import { Task, KANBAN_COLUMNS, STATUS_COLORS } from '@/types';
import { getTaskDisplayName } from '@/utils/taskHelpers';

interface KanbanViewProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: string) => void;
  expandedTasks: Set<string>;
  toggleTaskExpansion: (taskId: string) => void;
  onTaskClick: (task: Task) => void;
}

export default function KanbanView({ 
  tasks, 
  onStatusChange, 
  expandedTasks, 
  toggleTaskExpansion,
  onTaskClick 
}: KanbanViewProps) {
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const dragCounter = useRef(0);

  const getTasksByStatus = (status: string) => {
    return tasks
      .filter(task => task.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, task: Task) => {
    setDraggingTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
  };

  const handleDragEnd = () => {
    setDraggingTask(null);
    setDragOverColumn(null);
    dragCounter.current = 0;
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>, column: string) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOverColumn(column);
  };

  const handleDragLeave = () => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverColumn(null);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, column: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggingTask && draggingTask.status !== column) {
      onStatusChange(draggingTask.id, column);
    }
    
    setDraggingTask(null);
    setDragOverColumn(null);
    dragCounter.current = 0;
  };

  const handleTaskClick = (e: React.MouseEvent, task: Task) => {
    // Don't trigger click if we're dragging
    if (draggingTask) return;
    
    onTaskClick(task);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {KANBAN_COLUMNS.map(column => (
        <div key={column} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div 
            className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
              dragOverColumn === column ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
            onDragEnter={(e) => handleDragEnter(e, column)}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column)}
          >
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center justify-between">
              <span>{column}</span>
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs">
                {getTasksByStatus(column).length}
              </span>
            </h3>
          </div>
          <div
            className={`p-4 space-y-3 min-h-[400px] transition-colors ${
              dragOverColumn === column ? 'bg-blue-50 dark:bg-blue-900/10' : ''
            }`}
            onDragEnter={(e) => handleDragEnter(e, column)}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column)}
          >
            {getTasksByStatus(column).map((task) => {
              const isExpanded = expandedTasks.has(task.id);
              const displayName = getTaskDisplayName(task);
              
              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                  onClick={(e) => handleTaskClick(e, task)}
                  className={`bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer transition-all group ${
                    draggingTask?.id === task.id ? 'opacity-50' : 'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                        {displayName.length > 60 && !isExpanded 
                          ? displayName.substring(0, 60) + '...' 
                          : displayName}
                      </h4>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full border ${STATUS_COLORS[task.status] || 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}>
                          {task.status}
                        </span>
                      </div>

                      {task.assignee && (
                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-600 dark:text-gray-400">
                          <User size={12} />
                          <span className="truncate">{task.assignee}</span>
                        </div>
                      )}
                      
                      {isExpanded && (
                        <div className="mt-3 space-y-2 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-3">
                          {Object.entries(task).map(([key, value]) => {
                            if (!['id', 'status', 'assignee', 'createdAt'].includes(key) && value) {
                              return (
                                <div key={key} className="break-words">
                                  <span className="font-medium text-gray-700 dark:text-gray-300">{key}:</span> {value.toString()}
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      )}
                      
                      {displayName.length > 60 && (
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
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {getTasksByStatus(column).length === 0 && (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <GripVertical size={20} />
                </div>
                <p className="text-sm">No tasks in {column.toLowerCase()}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}