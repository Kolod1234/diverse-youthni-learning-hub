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

  // Google Slides content - render in proper container
  return (
    <div className="w-full mx-auto" style={{ maxWidth: '100%' }}>
      <div 
        className="google-slide-container"
        dangerouslySetInnerHTML={{ __html: content }}
        style={{
          width: '100%',
          fontSize: '16px',
          lineHeight: '1.4',
        }}
      />
      <style jsx>{`
        .google-slide-container {
          isolation: isolate;
        }
        .google-slide-container * {
          box-sizing: border-box;
        }
        .google-slide-container img {
          max-width: 100%;
          height: auto;
        }
        .google-slide-container div[style*="position: absolute"] {
          display: flex;
          align-items: flex-start;
          overflow: visible;
        }
      `}</style>
    </div>
  );
}