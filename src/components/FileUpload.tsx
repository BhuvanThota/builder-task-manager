'use client';

import React, { ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import Papa from 'papaparse';
import ExcelJS from 'exceljs';
import { processParsedData } from '@/utils/taskHelpers';
import { Task } from '@/types';

interface FileUploadProps {
  onDataLoaded: (tasks: Task[], headers: string[]) => void;
  onError: (error: string) => void;
}

export default function FileUpload({ onDataLoaded, onError }: FileUploadProps) {
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
            const { tasks, headers } = processParsedData(results.data, extractedHeaders);
            if (tasks.length === 0) {
              onError('No valid tasks found in the file.');
            } else {
              onDataLoaded(tasks, headers);
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
            const { tasks, headers: processedHeaders } = processParsedData(jsonData, headers);
            if (tasks.length === 0) {
              onError('No valid tasks found in the file.');
            } else {
              onDataLoaded(tasks, processedHeaders);
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
    <label className="cursor-pointer">
      <input
        type="file"
        accept=".csv,.xlsx,.xls,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        <Upload size={20} />
        Upload File
      </div>
    </label>
  );
}
