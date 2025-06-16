'use client';

import React, { useState, useRef, DragEvent } from 'react';
import { GripVertical, User, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Task, KANBAN_COLUMNS, STATUS_COLORS, STATUS_CARD_STYLES, Status } from '@/types';
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
  const [dragOverColumn, setDragOverColumn] = useState<(typeof KANBAN_COLUMNS[number]) | null>(null);
  const dragCounter = useRef(0);

  const getTasksByStatus = (status: typeof KANBAN_COLUMNS[number]) => {
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

  const handleDragEnter = (e: DragEvent<HTMLDivElement>, column: typeof KANBAN_COLUMNS[number]) => {
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

  const handleDrop = (e: DragEvent<HTMLDivElement>, column: typeof KANBAN_COLUMNS[number]) => {
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

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getColumnColor = (column: string) => STATUS_CARD_STYLES[column] || 'bg-gray-100 dark:bg-gray-700';

  return (
    <div className="w-full">
      {/* Horizontal Scrollable Container */}
      <div className="overflow-x-auto pb-4">
        {/* Fixed minimum width container that ensures horizontal scrolling */}
        <div className="flex gap-6" style={{ minWidth: `${KANBAN_COLUMNS.length * 320 + (KANBAN_COLUMNS.length - 1) * 24}px` }}>
          {KANBAN_COLUMNS.map(column => {
            const columnTasks = getTasksByStatus(column);
            const taskCount = columnTasks.length;
            
            return (
              <div
                key={column}
                className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
              >
                {/* Column Header */}
                <div 
                  className={`p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl ${
                    dragOverColumn === column ? 'bg-blue-50 dark:bg-blue-900/20' : getColumnColor(column)
                  }`}
                  onDragEnter={(e) => handleDragEnter(e, column)}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {column}
                    </h3>
                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 rounded-full shadow-sm">
                      {taskCount}
                    </span>
                  </div>
                </div>

                {/* Tasks Container */}
                <div
                  className={`p-4 space-y-3 transition-colors ${
                    dragOverColumn === column ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                  }`}
                  style={{ minHeight: '500px', maxHeight: '600px', overflowY: 'auto' }}
                  onDragEnter={(e) => handleDragEnter(e, column)}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column)}
                >
                  {columnTasks.map((task) => {
                    const isExpanded = expandedTasks.has(task.id);
                    const displayName = getTaskDisplayName(task);
                    
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        onClick={(e) => handleTaskClick(e, task)}
                        className={`p-4 rounded-lg cursor-pointer transition-all group border-2 border-transparent
                          ${STATUS_CARD_STYLES[task.status] || 'bg-gray-50 dark:bg-gray-700'}
                          ${draggingTask?.id === task.id ? 'opacity-50' : 'hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-500 hover:-translate-y-1'}
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            {/* Task Title */}
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-3 leading-snug">
                              {displayName.length > 60 && !isExpanded 
                                ? displayName.substring(0, 60) + '...' 
                                : displayName}
                            </h4>
                            
                            {/* Task Details */}
                            <div className="space-y-2 mb-3">
                              {/* Priority Badge */}
                              {task['Priority'] && (
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(String(task['Priority']))}`}>
                                  {String(task['Priority'])}
                                </span>
                              )}

                              {/* Project */}
                              {task['Project'] && (
                                <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                  <span>📁</span>
                                  <span className="truncate">{String(task['Project'])}</span>
                                </div>
                              )}

                              {/* Assignee */}
                              {task.assignee && (
                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                  <User size={12} />
                                  <span className="truncate">{String(task.assignee)}</span>
                                </div>
                              )}

                              {/* Due Date */}
                              {task['Due Date'] && (
                                <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                  <span>📅</span>
                                  <span>{String(task['Due Date'])}</span>
                                </div>
                              )}
                            </div>

                            {/* Status Badge */}
                            <div className="mb-3">
                              <span className={`inline-block px-2 py-1 text-xs rounded-full border ${STATUS_COLORS[task.status] || 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}>
                                {String(task.status)}
                              </span>
                            </div>
                            
                            {/* Expanded Details */}
                            {isExpanded && (
                              <div className="mt-3 space-y-2 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-3">
                                {Object.entries(task).map(([key, value]) => {
                                  if (!['id', 'status', 'assignee', 'createdAt', 'Task Name', 'Priority', 'Project', 'Due Date'].includes(key) && value) {
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
                            
                            {/* Show More/Less Button */}
                            {displayName.length > 60 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTaskExpansion(task.id);
                                }}
                                className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs flex items-center gap-1 transition-colors"
                              >
                                {isExpanded ? (
                                  <>Show less <ChevronUp size={12} /></>
                                ) : (
                                  <>Show more <ChevronDown size={12} /></>
                                )}
                              </button>
                            )}

                            {/* Quick Action Buttons */}
                            <div className="mt-3 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {(() => {
                                const currentIndex = KANBAN_COLUMNS.indexOf(task.status as Status);
                                let availableColumns: { col: Status; index: number }[] = [];

                                if (currentIndex === 0) {
                                  // First column: show up to next two columns
                                  availableColumns = KANBAN_COLUMNS
                                    .map((col, index) => ({ col: col as Status, index }))
                                    .filter(({ index }) => index > currentIndex && index <= currentIndex + 2);
                                } else if (currentIndex === KANBAN_COLUMNS.length - 1) {
                                  // Last column: show up to previous two columns
                                  availableColumns = KANBAN_COLUMNS
                                    .map((col, index) => ({ col: col as Status, index }))
                                    .filter(({ index }) => index < currentIndex && index >= currentIndex - 2);
                                } else {
                                  // Middle columns: show previous and next columns
                                  availableColumns = KANBAN_COLUMNS
                                    .map((col, index) => ({ col: col as Status, index }))
                                    .filter(({ index }) => index === currentIndex - 1 || index === currentIndex + 1);
                                }

                                return availableColumns.map(({ col, index }) => {
                                  const isLeft = index < currentIndex;
                                  const arrow = isLeft ? '←' : '→';
                                  
                                  // Get color based on destination column
                                  const getButtonColor = (column: string) => STATUS_CARD_STYLES[column] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600';

                                  return (
                                    <button
                                      key={col}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onStatusChange(task.id, col as typeof KANBAN_COLUMNS[number]);
                                      }}
                                      className={`text-xs px-2 py-1 rounded transition-colors font-medium ${getButtonColor(col)}`}
                                    >
                                      {arrow} {col}
                                    </button>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Empty State */}
                  {taskCount === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus size={24} className="text-gray-400" />
                      </div>
                      <p className="text-sm font-medium mb-1">No tasks</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Drag tasks here or click to add
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="flex justify-center mt-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
          <span>←</span>
          <span>Scroll horizontally to view all columns</span>
          <span>→</span>
        </div>
      </div>
    </div>
  );
}