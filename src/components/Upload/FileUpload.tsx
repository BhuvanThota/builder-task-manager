'use client';

import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { Task } from '@/types';
import TemplateUploadModal from './TemplateUploadModal';

interface FileUploadProps {
  onDataLoaded: (tasks: Task[], headers: string[]) => void;
  onError: (error: string) => void;
  projectId: string;
}

export default function FileUpload({ onDataLoaded, onError, projectId }: FileUploadProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUploadClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <button
        onClick={handleUploadClick}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      >
        <Upload size={18} />
        Upload File
      </button>

      <TemplateUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDataLoaded={onDataLoaded}
        onError={onError}
        projectId={projectId}
      />
    </>
  );
}