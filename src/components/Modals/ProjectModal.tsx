// components/Modals/ProjectModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Folder, FileText, Palette } from 'lucide-react';
import { Project, PROJECT_COLORS } from '../../types';

interface ProjectModalProps {
  isOpen: boolean;
  project?: Project | null; // null for create, Project for edit
  existingProjects: Project[];
  onClose: () => void;
  onSave: (projectData: { name: string; description: string; color: string }) => void;
}

export default function ProjectModal({
  isOpen,
  project,
  existingProjects,
  onClose,
  onSave,
}: ProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(PROJECT_COLORS[0]);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const isEditing = !!project;
  const title = isEditing ? 'Edit Project' : 'Create New Project';

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (project) {
        setName(project.name);
        setDescription(project.description || '');
        setSelectedColor(project.color);
      } else {
        setName('');
        setDescription('');
        // Find an unused color
        const usedColors = existingProjects.map(p => p.color);
        const availableColor = PROJECT_COLORS.find(color => !usedColors.includes(color)) || PROJECT_COLORS[0];
        setSelectedColor(availableColor);
      }
      setErrors({});
    }
  }, [isOpen, project, existingProjects]);

  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Project name must be at least 2 characters';
    } else if (name.trim().length > 50) {
      newErrors.name = 'Project name must be less than 50 characters';
    } else {
      // Check for duplicate names (excluding current project if editing)
      const duplicateName = existingProjects.some(p => 
        p.name.toLowerCase() === name.trim().toLowerCase() && 
        (!isEditing || p.id !== project?.id)
      );
      if (duplicateName) {
        newErrors.name = 'A project with this name already exists';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onSave({
      name: name.trim(),
      description: description.trim(),
      color: selectedColor,
    });

    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Folder size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <FileText size={16} />
                Project Name *
              </div>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={validateForm}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.name 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Enter project name"
              autoFocus
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Brief description of the project (optional)"
              maxLength={200}
            />
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
              {description.length}/200
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <div className="flex items-center gap-2">
                <Palette size={16} />
                Project Color
              </div>
            </label>
            <div className="grid grid-cols-5 gap-3">
              {PROJECT_COLORS.map((color) => {
                const isUsed = existingProjects.some(p => 
                  p.color === color && (!isEditing || p.id !== project?.id)
                );
                const isSelected = selectedColor === color;
                
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    disabled={isUsed}
                    className={`w-12 h-12 rounded-lg border-2 transition-all relative ${
                      isSelected 
                        ? 'border-gray-900 dark:border-white scale-110' 
                        : 'border-gray-200 dark:border-gray-600 hover:scale-105'
                    } ${
                      isUsed && !isSelected 
                        ? 'opacity-40 cursor-not-allowed' 
                        : 'cursor-pointer'
                    }`}
                    style={{ backgroundColor: color }}
                    title={isUsed ? 'Color already in use' : 'Select this color'}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-gray-900 rounded-full" />
                        </div>
                      </div>
                    )}
                    {isUsed && !isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <X size={16} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Colors marked with × are already in use by other projects
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!name.trim()}
            >
              <Save size={16} />
              {isEditing ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}