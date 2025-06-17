'use client';

import React, { useState, ChangeEvent } from 'react';
import { 
  Upload, 
  X, 
  FileSpreadsheet,
  FileText,
  Info,
  CheckCircle,
  Star,
  Clock,
  User,
  Tag,
  AlertCircle
} from 'lucide-react';
import Papa from 'papaparse';
import ExcelJS from 'exceljs';
import { processParsedData } from '@/utils/taskHelpers';
import { Task } from '@/types';

interface TemplateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (tasks: Task[], headers: string[]) => void;
  onError: (error: string) => void;
  projectId: string;
}

// Template service with mock data
const TemplateService = {
  getTemplateInfo: () => ({
    columnCount: 8,
    requiredColumns: ['Task Name', 'Status', 'Assignee'],
    recommendedColumns: ['Priority', 'Due Date', 'Description', 'Tags', 'Estimated Hours'],
    sampleRowCount: 5
  }),
  
  downloadCSVTemplate: async () => {
    const csvContent = `Task Name,Status,Assignee,Priority,Due Date,Description,Tags,Estimated Hours
Setup Development Environment,Not Started,John Doe,High,2024-12-01,Install and configure development tools,setup;environment,8
Design Database Schema,In Progress,Jane Smith,Medium,2024-12-05,Create database structure and relationships,database;design,12
Implement User Authentication,Not Started,Mike Johnson,High,2024-12-10,Build login and registration system,auth;security,16
Create API Endpoints,Not Started,Sarah Wilson,Medium,2024-12-15,Develop REST API for frontend integration,api;backend,20
Testing and QA,Not Started,Tom Brown,Low,2024-12-20,Comprehensive testing of all features,testing;qa,10`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'task-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
  
  downloadExcelTemplate: async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Task Template');
    
    // Headers
    const headers = ['Task Name', 'Status', 'Assignee', 'Priority', 'Due Date', 'Description', 'Tags', 'Estimated Hours'];
    worksheet.addRow(headers);
    
    // Sample data
    const sampleData = [
      ['Setup Development Environment', 'Not Started', 'John Doe', 'High', '2024-12-01', 'Install and configure development tools', 'setup;environment', 8],
      ['Design Database Schema', 'In Progress', 'Jane Smith', 'Medium', '2024-12-05', 'Create database structure and relationships', 'database;design', 12],
      ['Implement User Authentication', 'Not Started', 'Mike Johnson', 'High', '2024-12-10', 'Build login and registration system', 'auth;security', 16],
      ['Create API Endpoints', 'Not Started', 'Sarah Wilson', 'Medium', '2024-12-15', 'Develop REST API for frontend integration', 'api;backend', 20],
      ['Testing and QA', 'Not Started', 'Tom Brown', 'Low', '2024-12-20', 'Comprehensive testing of all features', 'testing;qa', 10]
    ];
    
    sampleData.forEach(row => worksheet.addRow(row));
    
    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 20;
    });
    
    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'task-template.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
};

export default function TemplateUploadModal({ 
  isOpen, 
  onClose, 
  onDataLoaded, 
  onError, 
  projectId 
}: TemplateUploadModalProps) {
  const [activeTab, setActiveTab] = useState<'template' | 'upload'>('template');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadType, setDownloadType] = useState<'csv' | 'excel' | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const templateInfo = TemplateService.getTemplateInfo();

  if (!isOpen) return null;

  const handleDownload = async (type: 'csv' | 'excel') => {
    setIsDownloading(true);
    setDownloadType(type);

    try {
      if (type === 'csv') {
        await TemplateService.downloadCSVTemplate();
      } else {
        await TemplateService.downloadExcelTemplate();
      }
    } catch (error) {
      console.error('Download failed:', error);
      onError('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
      setDownloadType(null);
    }
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    onError('');
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv' || fileExtension === 'txt') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult<Record<string, unknown>>) => {
          try {
            const extractedHeaders = results.meta.fields || [];
            const { tasks, headers } = processParsedData(
              results.data, 
              extractedHeaders,
              projectId
            );
            
            if (tasks.length === 0) {
              onError('No valid tasks found in the file.');
            } else {
              onDataLoaded(tasks, headers);
              onClose();
            }
          } catch (error) {
            console.error('Error parsing CSV file:', error);
            onError('Error parsing CSV file. Please check the format.');
          }
        },
        error: () => {
          onError('Failed to read CSV file.');
        }
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const workbook = new ExcelJS.Workbook();
          const buffer = e.target?.result;
          await workbook.xlsx.load(buffer as ArrayBuffer);
          const worksheet = workbook.worksheets[0];
          const jsonData: Record<string, unknown>[] = [];
          let headers: string[] = [];
          worksheet.eachRow((row, rowNumber) => {
            const values = row.values as (string | undefined)[];
            if (rowNumber === 1) {
              headers = values.slice(1) as string[]; // skip first empty cell
            } else {
              const obj: Record<string, unknown> = {};
              headers.forEach((header, i) => {
                obj[header] = values[i + 1];
              });
              jsonData.push(obj);
            }
          });
          if (jsonData.length > 0) {
            const { tasks, headers: processedHeaders } = processParsedData(
              jsonData, 
              headers,
              projectId
            );
            
            if (tasks.length === 0) {
              onError('No valid tasks found in the file.');
            } else {
              onDataLoaded(tasks, processedHeaders);
              onClose();
            }
          } else {
            onError('No data found in the Excel file.');
          }
        } catch (e) {
          console.error('Error parsing Excel file:', e);
          onError('Error parsing Excel file. Please check the format.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      onError('Please upload a CSV, TXT, or Excel file.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Import Tasks
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('template')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'template'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileSpreadsheet size={18} />
              Download Template
            </div>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Upload size={18} />
              Upload File
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'template' ? (
            <div className="space-y-6">
              {/* Template Description */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <FileSpreadsheet size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Optimized Task Template
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get started with our pre-configured template
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="Template details"
                  >
                    <Info size={18} />
                  </button>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Star size={16} className="text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {templateInfo.columnCount} optimized columns included
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <CheckCircle size={12} className="text-green-500" />
                      <span>Kanban board ready</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <User size={12} className="text-blue-500" />
                      <span>Team collaboration</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Clock size={12} className="text-orange-500" />
                      <span>Timeline tracking</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Tag size={12} className="text-purple-500" />
                      <span>Smart filtering</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {showDetails && (
                  <div className="mb-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Template Details:</h4>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="font-medium text-green-700 dark:text-green-400 mb-1">
                          ✅ Required Columns:
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 pl-4">
                          {templateInfo.requiredColumns.join(', ')}
                        </div>
                      </div>
                      
                      <div>
                        <div className="font-medium text-blue-700 dark:text-blue-400 mb-1">
                          💡 Recommended Columns:
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 pl-4">
                          {templateInfo.recommendedColumns.join(', ')}
                        </div>
                      </div>
                      
                      <div>
                        <div className="font-medium text-purple-700 dark:text-purple-400 mb-1">
                          📊 Sample Data:
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 pl-4">
                          {templateInfo.sampleRowCount} example tasks with realistic data
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Download Buttons */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {/* CSV Download */}
                    <button
                      onClick={() => handleDownload('csv')}
                      disabled={isDownloading}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-all font-medium ${
                        isDownloading && downloadType === 'csv'
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
                      } text-white shadow-sm hover:shadow-md`}
                    >
                      {isDownloading && downloadType === 'csv' ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <FileText size={18} />
                          <span>CSV Template</span>
                        </>
                      )}
                    </button>

                    {/* Excel Download */}
                    <button
                      onClick={() => handleDownload('excel')}
                      disabled={isDownloading}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-all font-medium ${
                        isDownloading && downloadType === 'excel'
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                      } text-white shadow-sm hover:shadow-md`}
                    >
                      {isDownloading && downloadType === 'excel' ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <FileSpreadsheet size={18} />
                          <span>Excel Template</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Format Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>CSV: Simple, universal format</span>
                    <span>Excel: Formatted with colors & instructions</span>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>💡 Quick Tips:</strong>
                  <ul className="mt-2 space-y-1 text-xs">
                    <li>• Download the Excel version for better formatting and instructions</li>
                    <li>• You can add custom columns after downloading</li>
                    <li>• Keep Status values exactly as shown for Kanban boards to work properly</li>
                    <li>• Use semicolons (;) to separate multiple tags</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Upload size={32} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Upload Your Task File
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Choose a CSV, Excel, or TXT file to import your tasks
                    </p>
                  </div>

                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      <Upload size={20} />
                      Choose File
                    </div>
                  </label>
                </div>
              </div>

              {/* Supported Formats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <FileText size={24} className="mx-auto mb-2 text-green-600" />
                  <div className="text-sm font-medium text-gray-900 dark:text-white">CSV Files</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">.csv, .txt</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <FileSpreadsheet size={24} className="mx-auto mb-2 text-blue-600" />
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Excel Files</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">.xlsx, .xls</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <CheckCircle size={24} className="mx-auto mb-2 text-purple-600" />
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Auto-detect</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Headers & data</div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Important:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Make sure your file has headers in the first row</li>
                      <li>• Include at least &quot;Task Name&quot;, &quot;Status&quot;, and &quot;Assignee&quot; columns</li>
                      <li>• Status values should match: Not Started, In Progress, Deployed</li>
                      <li>• Large files may take a moment to process</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          {activeTab === 'template' && (
            <button
              onClick={() => setActiveTab('upload')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue to Upload
            </button>
          )}
        </div>
      </div>
    </div>
  );
}