import React from 'react';

export default function PDFViewer({ fileUrl, title }) {
  const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;

  return (
    <div style={{ 
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    }}>
      <iframe
        src={googleViewerUrl}
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