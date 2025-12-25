import React from 'react';

export default function GoogleSlidePlayer({ content }) {
  // Check if this is Google Slides content (has the positioned container structure)
  const isGoogleSlideContent = content?.includes('position: relative') && content?.includes('padding-top:');
  
  if (!isGoogleSlideContent) {
    // Regular content - render normally
    return (
      <div 
        className="prose prose-base md:prose-lg max-w-none text-gray-700"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Google Slides content - render in proper container with fixed layout
  return (
    <div className="w-full mx-auto overflow-hidden" style={{ maxWidth: '100%' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .google-slide-container {
          width: 100% !important;
          height: auto !important;
          max-width: 100% !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          isolation: isolate;
        }
        
        .google-slide-container > div {
          width: 100% !important;
          max-width: 100% !important;
        }
        
        .google-slide-container * {
          box-sizing: border-box !important;
        }
        
        .google-slide-container img {
          max-width: 100% !important;
          height: auto !important;
          object-fit: contain !important;
        }
        
        .google-slide-container div[style*="position: absolute"] {
          overflow: visible !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
        
        .google-slide-container h1,
        .google-slide-container h2,
        .google-slide-container h3 {
          line-height: 1.4 !important;
          margin-bottom: 0.5rem !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
        
        .google-slide-container p,
        .google-slide-container span,
        .google-slide-container div {
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
      `}} />
      <div 
        className="google-slide-container"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}