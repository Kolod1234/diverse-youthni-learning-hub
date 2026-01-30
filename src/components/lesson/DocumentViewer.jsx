import React from 'react';
import { FileText } from 'lucide-react';
import PowerPointRenderer from './PowerPointRenderer';

export default function DocumentViewer({ fileUrl, fileType }) {
  if (!fileUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4" />
          <p>No document available</p>
        </div>
      </div>
    );
  }

  // Use custom PowerPoint renderer for PPTX files
  if (fileType === 'pptx' || fileUrl.toLowerCase().endsWith('.pptx')) {
    return <PowerPointRenderer fileUrl={fileUrl} />;
  }

  // Fallback to basic viewer for other file types
  return (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="text-center text-gray-500">
        <FileText className="w-16 h-16 mx-auto mb-4" />
        <p>Document type not supported for inline viewing</p>
        <a 
          href={fileUrl} 
          download 
          className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Download File
        </a>
      </div>
    </div>
  );
}