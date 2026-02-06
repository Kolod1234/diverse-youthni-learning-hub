import React from 'react';

export default function PDFViewer({ fileUrl, title }) {
  // Use PDF.js viewer with the file URL
  const viewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(fileUrl)}`;

  return (
    <div style={{ 
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    }}>
      <iframe
        src={viewerUrl}
        title={title || "PDF Viewer"}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        frameBorder="0"
      />
    </div>
  );
}