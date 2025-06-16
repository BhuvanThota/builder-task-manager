'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit3, Trash2, Save, User, Calendar, Tag, FileText } from 'lucide-react';
import { Task, KANBAN_COLUMNS, STATUS_COLORS } from '@/types';

interface TaskDetailsModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
  headers: string[];
}

export default function TaskDetailsModal({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  headers
}: TaskDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
      setIsEditing(false);
      setShowDeleteConfirm(false);
    }
  }, [task]);

  if (!isOpen || !task || !editedTask) return null;

  const handleSave = () => {
    if (editedTask) {
      onUpdate(editedTask);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  const handleFieldChange = (field: string, value: string) => {
    if (editedTask) {
      setEditedTask({
        ...editedTask,
        [field]: value
      });
    }
  };

  const getFieldIcon = (field: string) => {
    const fieldLower = field.toLowerCase();
    if (fieldLower.includes('assign')) return <User size={16} />;
    if (fieldLower.includes('date')) return <Calendar size={16} />;
    if (fieldLower.includes('status')) return <Tag size={16} />;
    return <FileText size={16} />;
  };

  const getDisplayName = () => {
    const priorityFields = ['Task Name', 'Plan', 'Focus', 'Project', 'Key Topics', 'Title', 'Name', 'Task', 'Description'];
    
    for (const field of priorityFields) {
      const value = editedTask[field];
      if (value && typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
    
    return 'Task Details';
  };

  // Get fields to display excluding status, assignee, and system fields
  const otherFields = headers.filter(header => 
    !['status', 'assignee', 'Status', 'Assigned To', 'Assignee', 'id', 'createdAt'].includes(header)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              STATUS_COLORS[editedTask.status]?.includes('bg-blue') ? 'bg-blue-500' :
              STATUS_COLORS[editedTask.status]?.includes('bg-green') ? 'bg-green-500' :
              STATUS_COLORS[editedTask.status]?.includes('bg-red') ? 'bg-red-500' :
              STATUS_COLORS[editedTask.status]?.includes('bg-purple') ? 'bg-purple-500' :
              STATUS_COLORS[editedTask.status]?.includes('bg-indigo') ? 'bg-indigo-500' :
              'bg-gray-500'
            }`} />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {getDisplayName()}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Edit task"
              >
                <Edit3 size={18} />
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Save changes"
              >
                <Save size={18} />
              </button>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Delete task"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Status and Assignee Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Tag size={16} />
                    Status
                  </div>
                </label>
                {isEditing ? (
                  <select
                    value={editedTask.status}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {KANBAN_COLUMNS.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`inline-block px-3 py-2 text-sm rounded-lg border w-full ${
                    STATUS_COLORS[editedTask.status] || 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                  }`}>
                    {editedTask.status}
                  </span>
                )}
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    Assignee
                  </div>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTask.assignee || ''}
                    onChange={(e) => handleFieldChange('assignee', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter assignee name"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <span className="text-gray-900 dark:text-white">
                      {editedTask.assignee || 'Unassigned'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Other Fields */}
            <div className="space-y-4">
              {otherFields.map(header => {
                const value = editedTask[header];
                return (
                  <div key={header}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <div className="flex items-center gap-2">
                        {getFieldIcon(header)}
                        {header}
                      </div>
                    </label>
                    {isEditing ? (
                      <textarea
                        value={value?.toString() || ''}
                        onChange={(e) => handleFieldChange(header, e.target.value)}
                        rows={header.toLowerCase().includes('description') || header.toLowerCase().includes('notes') ? 4 : 2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder={`Enter ${header.toLowerCase()}`}
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 min-h-[42px]">
                        <span className="text-gray-900 dark:text-white whitespace-pre-wrap">
                          {value?.toString() || 'Not specified'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Metadata */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  Created: {new Date(editedTask.createdAt).toLocaleDateString()}
                </div>
                <div>ID: {editedTask.id}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
            <button
              onClick={() => {
                setEditedTask({ ...task });
                setIsEditing(false);
              }}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Task</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete &quot;{getDisplayName()}&quot;?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}