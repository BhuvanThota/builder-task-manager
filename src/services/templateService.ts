// src/services/templateService.ts
import ExcelJS from 'exceljs';

export interface DefaultTemplate {
  headers: string[];
  sampleData: Record<string, string>[];
  description: string;
}

// Default template with essential columns for optimal task management
export const DEFAULT_TEMPLATE: DefaultTemplate = {
  headers: [
    'Task Name',        // Primary identifier - displayed prominently
    'Status',           // Required for Kanban columns
    'Assigned To',      // Required for assignee functionality
    'Priority',         // High/Medium/Low for visual indicators
    'Project',          // Project categorization
    'Due Date',         // Timeline management
    'Description',      // Detailed task information
    'Category',         // Task grouping (Feature/Bug/Enhancement)
    'Effort',          // Story points or time estimate
    'Tags'             // Comma-separated tags for filtering
  ],
  sampleData: [
    {
      'Task Name': 'Set up project repository',
      'Status': 'Not Started',
      'Assigned To': 'John Doe',
      'Priority': 'High',
      'Project': 'Website Redesign',
      'Due Date': '2024-12-31',
      'Description': 'Initialize Git repository and set up basic project structure',
      'Category': 'Setup',
      'Effort': '3 hours',
      'Tags': 'setup, git, initialization'
    },
    {
      'Task Name': 'Design user interface mockups',
      'Status': 'In Progress',
      'Assigned To': 'Jane Smith',
      'Priority': 'High',
      'Project': 'Website Redesign',
      'Due Date': '2025-01-15',
      'Description': 'Create wireframes and high-fidelity mockups for all main pages',
      'Category': 'Design',
      'Effort': '2 days',
      'Tags': 'design, ui, mockups'
    },
    {
      'Task Name': 'Implement user authentication',
      'Status': 'Dev Completed',
      'Assigned To': 'Mike Johnson',
      'Priority': 'High',
      'Project': 'Backend Services',
      'Due Date': '2025-01-10',
      'Description': 'Build login/logout functionality with JWT tokens',
      'Category': 'Feature',
      'Effort': '1 week',
      'Tags': 'auth, backend, security'
    },
    {
      'Task Name': 'Write API documentation',
      'Status': 'Tested',
      'Assigned To': 'Sarah Wilson',
      'Priority': 'Medium',
      'Project': 'Backend Services',
      'Due Date': '2025-01-20',
      'Description': 'Document all API endpoints with examples and parameters',
      'Category': 'Documentation',
      'Effort': '4 hours',
      'Tags': 'docs, api, documentation'
    },
    {
      'Task Name': 'Deploy to production',
      'Status': 'Deployed',
      'Assigned To': 'DevOps Team',
      'Priority': 'High',
      'Project': 'Website Redesign',
      'Due Date': '2025-01-25',
      'Description': 'Deploy the completed website to production servers',
      'Category': 'Deployment',
      'Effort': '2 hours',
      'Tags': 'deployment, production, release'
    },
    {
      'Task Name': 'Fix mobile responsive issues',
      'Status': 'Bugs',
      'Assigned To': 'Jane Smith',
      'Priority': 'Medium',
      'Project': 'Website Redesign',
      'Due Date': '2025-01-12',
      'Description': 'Resolve layout issues on mobile devices under 768px width',
      'Category': 'Bug',
      'Effort': '1 day',
      'Tags': 'mobile, responsive, css'
    }
  ],
  description: 'This template includes all essential columns for effective task management with Kanban boards and project tracking.'
};

export class TemplateService {
  /**
   * Download the default CSV template
   */
  static async downloadCSVTemplate(): Promise<void> {
    try {
      const csvContent = this.generateCSVContent();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'task-manager-template.csv';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV template:', error);
      throw new Error('Failed to download CSV template');
    }
  }

  /**
   * Download the default Excel template with formatting
   */
  static async downloadExcelTemplate(): Promise<void> {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Task Manager Template');

      // Add headers
      const headerRow = worksheet.addRow(DEFAULT_TEMPLATE.headers);
      
      // Style the header row
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF3B82F6' } // Blue background
        };
        cell.font = {
          color: { argb: 'FFFFFFFF' }, // White text
          bold: true,
          size: 12
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Add sample data
      DEFAULT_TEMPLATE.sampleData.forEach((row) => {
        const dataRow = worksheet.addRow(DEFAULT_TEMPLATE.headers.map(header => row[header] || ''));
        
        // Style data rows
        dataRow.eachCell((cell, index) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
          };
          
          // Color code status column
          if (DEFAULT_TEMPLATE.headers[index - 1] === 'Status') {
            const status = cell.value as string;
            cell.fill = this.getStatusColor(status);
            cell.font = { bold: true };
          }
          
          // Color code priority column
          if (DEFAULT_TEMPLATE.headers[index - 1] === 'Priority') {
            const priority = cell.value as string;
            cell.fill = this.getPriorityColor(priority);
            cell.font = { bold: true };
          }
        });
      });

      // Auto-fit columns
      worksheet.columns.forEach((column, index) => {
        const header = DEFAULT_TEMPLATE.headers[index];
        let maxLength = header.length;
        
        // Calculate max length for each column
        DEFAULT_TEMPLATE.sampleData.forEach(row => {
          const cellValue = row[header] || '';
          maxLength = Math.max(maxLength, cellValue.length);
        });
        
        column.width = Math.min(Math.max(maxLength + 2, 12), 50);
      });

      // Add instructions sheet
      const instructionsSheet = workbook.addWorksheet('Instructions');
      this.addInstructions(instructionsSheet);

      // Generate and download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'task-manager-template.xlsx';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Excel template:', error);
      throw new Error('Failed to download Excel template');
    }
  }

  /**
   * Generate CSV content
   */
  private static generateCSVContent(): string {
    const headers = DEFAULT_TEMPLATE.headers.join(',');
    const rows = DEFAULT_TEMPLATE.sampleData.map(row => 
      DEFAULT_TEMPLATE.headers.map(header => {
        const value = row[header] || '';
        // Escape commas and quotes in CSV
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }

  /**
   * Get status color for Excel formatting
   */
  private static getStatusColor(status: string) {
    const colors = {
      'Not Started': { argb: 'FFF3F4F6' },    // Gray
      'In Progress': { argb: 'FFDBEAFE' },     // Blue
      'Bugs': { argb: 'FFFECACA' },           // Red
      'Dev Completed': { argb: 'FFD1FAE5' },  // Green
      'Tested': { argb: 'FFEDE9FE' },         // Purple
      'Deployed': { argb: 'FFE0E7FF' }        // Indigo
    };
    
    return {
      type: 'pattern' as const,
      pattern: 'solid' as const,
      fgColor: colors[status as keyof typeof colors] || colors['Not Started']
    };
  }

  /**
   * Get priority color for Excel formatting
   */
  private static getPriorityColor(priority: string) {
    const colors = {
      'High': { argb: 'FFFECACA' },     // Light red
      'Medium': { argb: 'FFFEF3C7' },   // Light yellow
      'Low': { argb: 'FFD1FAE5' }       // Light green
    };
    
    return {
      type: 'pattern' as const,
      pattern: 'solid' as const,
      fgColor: colors[priority as keyof typeof colors] || colors['Medium']
    };
  }

  /**
   * Add instructions to Excel template
   */
  private static addInstructions(worksheet: ExcelJS.Worksheet): void {
    const instructions = [
      'Task Manager Template - Instructions',
      '',
      'REQUIRED COLUMNS (Do not remove):',
      '• Task Name: Primary identifier for each task',
      '• Status: Must be one of: Not Started, In Progress, Bugs, Dev Completed, Tested, Deployed',
      '• Assigned To: Person responsible for the task',
      '',
      'RECOMMENDED COLUMNS:',
      '• Priority: High, Medium, or Low',
      '• Project: Group related tasks together',
      '• Due Date: Target completion date (YYYY-MM-DD format)',
      '• Description: Detailed task information',
      '• Category: Type of work (Feature, Bug, Enhancement, etc.)',
      '• Effort: Time estimate or story points',
      '• Tags: Comma-separated keywords for filtering',
      '',
      'USAGE TIPS:',
      '• You can add more columns as needed',
      '• Dates should be in YYYY-MM-DD format',
      '• Keep task names concise but descriptive',
      '• Use consistent values for Status and Priority',
      '• Tags help with filtering and organization',
      '',
      'GETTING STARTED:',
      '1. Fill in your tasks using the sample data as a guide',
      '2. Save the file as CSV or keep as Excel',
      '3. Upload to your Task Manager project',
      '4. Start managing your tasks with Kanban boards!',
      '',
      'Need help? Check the application documentation.'
    ];

    instructions.forEach((instruction, index) => {
      const row = worksheet.addRow([instruction]);
      
      if (index === 0) {
        // Title
        row.getCell(1).font = { bold: true, size: 16, color: { argb: 'FF1F2937' } };
      } else if (instruction.includes(':') && !instruction.startsWith('•')) {
        // Section headers
        row.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF374151' } };
      } else if (instruction.startsWith('•')) {
        // Bullet points
        row.getCell(1).font = { size: 11, color: { argb: 'FF4B5563' } };
      } else if (instruction.match(/^\d+\./)) {
        // Numbered lists
        row.getCell(1).font = { size: 11, color: { argb: 'FF4B5563' } };
      }
    });

    worksheet.getColumn(1).width = 80;
  }

  /**
   * Get template info for display
   */
  static getTemplateInfo() {
    return {
      description: DEFAULT_TEMPLATE.description,
      columnCount: DEFAULT_TEMPLATE.headers.length,
      sampleRowCount: DEFAULT_TEMPLATE.sampleData.length,
      requiredColumns: ['Task Name', 'Status', 'Assigned To'],
      recommendedColumns: ['Priority', 'Project', 'Due Date', 'Description'],
      statusOptions: ['Not Started', 'In Progress', 'Bugs', 'Dev Completed', 'Tested', 'Deployed'],
      priorityOptions: ['High', 'Medium', 'Low']
    };
  }
}