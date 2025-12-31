import React, { useState } from 'react';
import { PptxRenderer } from '@kandiforge/pptx-renderer';

const PptxViewer = () => {
  const [pptxFile, setPptxFile] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPptxFile(file);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Upload PPTX to Web Slides</h2>
      
      {/* File Uploader */}
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="file" 
          accept=".pptx" 
          onChange={handleFileUpload} 
        />
      </div>

      {/* The Slideshow Renderer */}
      {pptxFile ? (
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
          <PptxRenderer 
            pptxSource={pptxFile} 
            width={960} 
            height={540} 
            showFilmstrip={true} 
            filmstripPosition="bottom" 
          />
        </div>
      ) : (
        <p>Please upload a .pptx file to view the presentation.</p>
      )}
    </div>
  );
};

export default PptxViewer;