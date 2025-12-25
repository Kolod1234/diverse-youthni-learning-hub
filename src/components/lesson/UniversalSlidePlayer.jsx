import React from 'react';

export default function UniversalSlidePlayer({ content, googleSlidesUrl, fileUrl, fileType }) {
  // Handle Google Slides iframe embed
  if (googleSlidesUrl) {
    const presentationId = googleSlidesUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    if (presentationId) {
      return (
        <div className="w-full">
          <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden" style={{ paddingTop: '56.25%' }}>
            <iframe 
              src={`https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000`}
              className="absolute top-0 left-0 w-full h-full border-0"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      );
    }
  }

  // Handle Microsoft Office files (PowerPoint, Word)
  if (fileUrl && (fileType === 'pptx' || fileType === 'docx' || fileType === 'pdf')) {
    return (
      <div className="w-full">
        <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden" style={{ paddingTop: '75%' }}>
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
            className="absolute top-0 left-0 w-full h-full border-0"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  // Handle PDF files
  if (fileUrl && fileType === 'pdf') {
    return (
      <div className="w-full">
        <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden" style={{ paddingTop: '141%' }}>
          <iframe
            src={fileUrl}
            className="absolute top-0 left-0 w-full h-full border-0"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  // Handle HTML content with smart responsive rendering
  if (content) {
    return (
      <div className="w-full">
        <style dangerouslySetInnerHTML={{ __html: `
          .slide-content-wrapper {
            width: 100%;
            max-width: 100%;
            overflow: hidden;
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
          }
          
          .slide-content-wrapper * {
            max-width: 100% !important;
          }
          
          .slide-content-wrapper img {
            width: 100% !important;
            height: auto !important;
            display: block !important;
            margin: 1rem auto !important;
            border-radius: 8px;
            object-fit: contain;
          }
          
          .slide-content-wrapper table {
            width: 100% !important;
            border-collapse: collapse;
            overflow-x: auto;
            display: block;
          }
          
          .slide-content-wrapper table td,
          .slide-content-wrapper table th {
            padding: 0.5rem;
            border: 1px solid #e5e7eb;
            word-wrap: break-word;
          }
          
          .slide-content-wrapper iframe,
          .slide-content-wrapper video {
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 16/9;
            border-radius: 8px;
          }
          
          .slide-content-wrapper h1,
          .slide-content-wrapper h2,
          .slide-content-wrapper h3,
          .slide-content-wrapper h4,
          .slide-content-wrapper h5,
          .slide-content-wrapper h6 {
            margin-top: 1rem;
            margin-bottom: 0.5rem;
            line-height: 1.4;
            word-wrap: break-word;
            color: #111827;
          }
          
          .slide-content-wrapper h1 { font-size: 2rem; font-weight: 700; }
          .slide-content-wrapper h2 { font-size: 1.5rem; font-weight: 600; }
          .slide-content-wrapper h3 { font-size: 1.25rem; font-weight: 600; }
          
          .slide-content-wrapper p {
            margin: 0.75rem 0;
            line-height: 1.6;
            color: #374151;
          }
          
          .slide-content-wrapper ul,
          .slide-content-wrapper ol {
            margin: 0.75rem 0;
            padding-left: 1.5rem;
          }
          
          .slide-content-wrapper li {
            margin: 0.5rem 0;
          }
          
          .slide-content-wrapper div[style*="position: absolute"],
          .slide-content-wrapper div[style*="position:absolute"] {
            position: relative !important;
            margin-bottom: 1rem;
          }
          
          @media (max-width: 640px) {
            .slide-content-wrapper {
              padding: 1rem;
            }
            
            .slide-content-wrapper h1 { font-size: 1.5rem; }
            .slide-content-wrapper h2 { font-size: 1.25rem; }
            .slide-content-wrapper h3 { font-size: 1.1rem; }
            
            .slide-content-wrapper p,
            .slide-content-wrapper li {
              font-size: 0.95rem;
            }
          }
        `}} />
        <div 
          className="slide-content-wrapper"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    );
  }

  return (
    <div className="w-full p-8 text-center bg-gray-50 rounded-lg">
      <p className="text-gray-500">No content available</p>
    </div>
  );
}