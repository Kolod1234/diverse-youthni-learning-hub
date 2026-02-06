import React from 'react';

/**
 * MultiFileViewer Component
 * @param {string} fileUrl - The public URL of the document
 * @param {string} fileType - 'pdf' | 'docx' | 'xlsx' | 'pptx'
 */
const MultiFileViewer = ({ fileUrl, fileType }) => {
  
  // Encode URL for the Google Docs Viewer
  const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;

  return (
    <div className="viewer-container">
      {/* We use a conditional check. 
          Standard browsers handle PDF well, but Office files 
          need the Google Viewer helper.
      */}
      <iframe
        src={fileType === 'pdf' ? fileUrl : googleViewerUrl}
        title="File Viewer"
        className="responsive-iframe"
        frameBorder="0"
      >
        <p>Your browser does not support iframes.</p>
      </iframe>

      <style jsx>{`
        .viewer-container {
          position: relative;
          overflow: hidden;
          width: 100%;
          /* Maintain a nice aspect ratio for documents */
          padding-top: 100%; /* Default for Mobile (1:1) */
        }

        /* Tablet Layout */
        @media (min-width: 768px) {
          .viewer-container {
            padding-top: 75%; /* 4:3 Aspect Ratio */
          }
        }

        /* Laptop Layout */
        @media (min-width: 1024px) {
          .viewer-container {
            padding-top: 56.25%; /* 16:9 Aspect Ratio */
          }
        }

        .responsive-iframe {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default MultiFileViewer;