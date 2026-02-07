import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function PDFViewer({ fileUrl, title }) {
  const [isLoading, setIsLoading] = useState(true);

  const viewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(fileUrl)}`;

  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-50">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      )}

      <iframe
        id="pdf-viewer-iframe"
        src={viewerUrl}
        title={title || "PDF Viewer"}
        className="w-full h-full border-none"
        onLoad={() => setIsLoading(false)}
        sandbox="allow-scripts allow-same-origin allow-forms"
        allowFullScreen
      />
    </div>
  );
}