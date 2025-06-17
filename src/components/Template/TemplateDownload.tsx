'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Info, 
  CheckCircle,
  Star,
  Clock,
  User,
  Tag
} from 'lucide-react';
import { TemplateService } from '../../services/templateService';

interface TemplateDownloadProps {
  className?: string;
}

export default function TemplateDownload({ className = '' }: TemplateDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadType, setDownloadType] = useState<'csv' | 'excel' | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const templateInfo = TemplateService.getTemplateInfo();

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
      alert('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
      setDownloadType(null);
    }
  };

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileSpreadsheet size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Default Template
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get started with our optimized task template
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

      {/* Template Preview */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Star size={16} className="text-yellow-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {templateInfo.columnCount} optimized columns
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <CheckCircle size={12} className="text-green-500" />
            <span>Kanban ready</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <User size={12} className="text-blue-500" />
            <span>Team friendly</span>
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
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Template Includes:</h4>
          
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

      {/* Quick Tips */}
      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>💡 Quick Tips:</strong>
          <ul className="mt-1 space-y-1 text-xs">
            <li>• Use the Excel version for better formatting and instructions</li>
            <li>• You can add custom columns after downloading</li>
            <li>• Keep Status values exactly as shown for Kanban boards</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
