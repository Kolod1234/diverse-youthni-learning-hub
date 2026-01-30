import React from 'react';
import { FileText } from 'lucide-react';

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

  // Use Microsoft Office Online Viewer for PPTX files
  const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;

  return (
    <div className="w-full h-full">
      <iframe
        src={viewerUrl}
        className="w-full h-full border-0"
        title="Document Viewer"
        allowFullScreen
      />
    </div>
  );
}