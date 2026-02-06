import React from 'react';

export default function PDFViewer({ fileUrl, title }) {
  return (
    <div style={{ 
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      backgroundColor: '#525659'
    }}>
      <object
        data={fileUrl}
        type="application/pdf"
        style={{
          width: '100%',
          height: '100%',
          border: 'none'
        }}
      >
        <iframe
          src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(fileUrl)}`}
          title={title || "PDF Viewer"}
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          frameBorder="0"
        />
      </object>
    </div>
  );
}