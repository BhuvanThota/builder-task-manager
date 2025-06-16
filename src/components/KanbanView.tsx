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
}

export default function KanbanView({ 
  tasks, 
  onStatusChange, 
  expandedTasks, 
  toggleTaskExpansion 
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {KANBAN_COLUMNS.map(column => (
        <div 
          key={column} 
          className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
          onDragEnter={(e) => handleDragEnter(e, column)}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column)}
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">
            {column} ({getTasksByStatus(column).length})
          </h3>
          <div
            className={`min-h-[200px] space-y-2 rounded-lg transition-colors ${
              dragOverColumn === column ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
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
                  className={`bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 cursor-move transition-all ${
                    draggingTask?.id === task.id ? 'opacity-50' : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                      <GripVertical size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {displayName.length > 50 && !isExpanded 
                          ? displayName.substring(0, 50) + '...' 
                          : displayName}
                      </h4>
                      
                      {task.assignee && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-600 dark:text-gray-400">
                          <User size={12} />
                          <span className="truncate">{task.assignee}</span>
                        </div>
                      )}
                      
                      {isExpanded && (
                        <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          {Object.entries(task).map(([key, value]) => {
                            if (!['id', 'status', 'assignee', 'createdAt'].includes(key) && value) {
                              return (
                                <div key={key} className="break-words">
                                  <span className="font-medium">{key}:</span> {value.toString()}
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      )}
                      
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`inline-block px-2 py-0.5 text-xs rounded-full border ${STATUS_COLORS[task.status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                          {task.status}
                        </span>
                        {displayName.length > 50 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskExpansion(task.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
