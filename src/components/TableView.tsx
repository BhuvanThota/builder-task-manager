'use client';

import React, { useState } from 'react';
import { Task, KANBAN_COLUMNS, STATUS_COLORS } from '@/types';

interface TableViewProps {
  tasks: Task[];
  headers: string[];
  onStatusChange: (taskId: string, newStatus: string) => void;
  onFieldUpdate: (taskId: string, field: string, value: string) => void;
  onTaskClick: (task: Task) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function TableView({
  tasks,
  headers,
  onStatusChange,
  onFieldUpdate,
  onTaskClick,
  currentPage,
  totalPages,
  onPageChange
}: TableViewProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (e: React.MouseEvent, taskId: string, field: string, value: string) => {
    e.stopPropagation(); // Prevent row click when editing
    setEditingCell(`${taskId}-${field}`);
    setEditValue(value || '');
  };

  const handleSave = (taskId: string, field: string) => {
    if (field === 'Status') {
      onStatusChange(taskId, editValue);
    } else if (['Assigned To', 'Assignee', 'assignee'].includes(field)) {
      // Handle all possible assignee field names by updating the assignee property
      onFieldUpdate(taskId, 'assignee', editValue);
    } else {
      onFieldUpdate(taskId, field, editValue);
    }
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, taskId: string, field: string) => {
    if (e.key === 'Enter') {
      handleSave(taskId, field);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Prioritize certain columns
  const priorityColumns = ['Status', 'Assigned To', 'Assignee', 'assignee'];
  const sortedHeaders = [
    ...headers.filter(h => priorityColumns.includes(h)),
    ...headers.filter(h => !priorityColumns.includes(h))
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {sortedHeaders.map(header => (
                <th 
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map(task => (
              <tr 
                key={task.id} 
                onClick={() => onTaskClick(task)}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                {sortedHeaders.map(header => {
                  const cellKey = `${task.id}-${header}`;
                  let value = '';
                  
                  if (header === 'Status') {
                    value = task.status;
                  } else if (['Assigned To', 'Assignee', 'assignee'].includes(header)) {
                    // Handle all possible assignee field names
                    value = task.assignee || '';
                  } else {
                    const rawValue = task[header];
                    value = rawValue !== undefined && rawValue !== null
                      ? rawValue instanceof Date
                        ? rawValue.toLocaleDateString()
                        : String(rawValue)
                      : '';
                  }

                  return (
                    <td key={header} className="px-6 py-4 whitespace-nowrap">
                      {header === 'Status' ? (
                        <select
                          value={task.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            onStatusChange(task.id, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className={`px-2 py-1 text-xs rounded-full border ${STATUS_COLORS[task.status] || 'bg-gray-100 text-gray-800 border-gray-300'} cursor-pointer`}
                        >
                          {KANBAN_COLUMNS.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      ) : ['Assigned To', 'Assignee', 'assignee'].includes(header) ? (
                        // Special handling for assignee fields
                        editingCell === cellKey ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleSave(task.id, header)}
                            onKeyDown={(e) => handleKeyDown(e, task.id, header)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-2 py-1 border border-blue-400 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            autoFocus
                          />
                        ) : (
                          <div
                            onClick={(e) => handleEdit(e, task.id, header, value)}
                            className="text-sm cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 text-gray-900 dark:text-white"
                            title={value}
                          >
                            {value ? (
                              value.length > 50 ? value.substring(0, 50) + '...' : value
                            ) : (
                              <span className="text-gray-400">Click to edit</span>
                            )}
                          </div>
                        )
                      ) : editingCell === cellKey ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleSave(task.id, header)}
                          onKeyDown={(e) => handleKeyDown(e, task.id, header)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1 border border-blue-400 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          autoFocus
                        />
                      ) : (
                        <div
                          onClick={(e) => handleEdit(e, task.id, header, value)}
                          className="text-sm cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 text-gray-900 dark:text-white"
                          title={value}
                        >
                          {value ? (
                            value.length > 50 ? value.substring(0, 50) + '...' : value
                          ) : (
                            <span className="text-gray-400">Click to edit</span>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}