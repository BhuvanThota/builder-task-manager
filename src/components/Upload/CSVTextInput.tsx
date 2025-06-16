// src/components/CSVTextInput.tsx
'use client';

import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import Papa from 'papaparse';
import { processParsedData } from '@/utils/taskHelpers';
import { Task } from '@/types';

interface CSVTextInputProps {
  onDataLoaded: (tasks: Task[], headers: string[]) => void;
  onError: (error: string) => void;
  projectId?: string; // Optional for backwards compatibility
}

export default function CSVTextInput({ onDataLoaded, onError, projectId }: CSVTextInputProps) {
  const [showTextInput, setShowTextInput] = useState(false);
  const [csvText, setCsvText] = useState('');

  const handlePasteCSV = () => {
    if (csvText.trim()) {
      onError('');
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const extractedHeaders = results.meta.fields || [];
            // Use projectId if provided, otherwise generate a default one for backwards compatibility
            const currentProjectId = projectId || `default_${Date.now()}`;
            
            const { tasks, headers } = processParsedData(
              results.data as Record<string, unknown>[], 
              extractedHeaders,
              currentProjectId
            );
            
            if (tasks.length === 0) {
              onError('No valid tasks found in the CSV data.');
            } else {
              onDataLoaded(tasks, headers);
              setShowTextInput(false);
              setCsvText('');
            }
          } catch (error) {
            console.log("Error: parsing CSV data", error)
            onError('Error parsing CSV data. Please check the format.');
          }
        },
        error: () => {
          onError('Failed to parse CSV data.');
        }
      });
    } else {
      onError('Please enter some CSV data.');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowTextInput(!showTextInput)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        <FileText size={20} />
        Paste CSV
      </button>

      {showTextInput && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Paste CSV Data
            </h3>
            <button
              onClick={() => {
                setShowTextInput(false);
                setCsvText('');
                onError('');
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CSV Format Example:
              </label>
              <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
{`Plan,Focus,Status,Assigned To
Phase 1,Docker Mastery,Not Started,Self
Phase 2,Kubernetes,In Progress,Team Lead`}
              </pre>
            </div>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Paste your CSV data here..."
              className="w-full h-48 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-3">
              <button
                onClick={handlePasteCSV}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Import CSV
              </button>
              <button
                onClick={() => {
                  setShowTextInput(false);
                  setCsvText('');
                  onError('');
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}