import React from 'react';

export default function GoogleSlidePlayer({ content, googleSlidesUrl }) {
  // If Google Slides URL is provided, use iframe embed
  if (googleSlidesUrl) {
    const presentationId = googleSlidesUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    if (presentationId) {
      return (
        <div className="relative w-full overflow-hidden rounded-lg shadow-lg" style={{ paddingTop: '56.25%' }}>
          <iframe 
            src={`https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000`}
            className="absolute top-0 left-0 w-full h-full border-0"
            allowFullScreen
          />
        </div>
      );
    }
  }

  // Check if this is Google Slides content (has the positioned container structure)
  const isGoogleSlideContent = content?.includes('position: relative') && content?.includes('padding-top:');

  if (!isGoogleSlideContent) {
    // Regular content - render normally with mobile-optimized images
    return (
      <div className="w-full">
        <style dangerouslySetInnerHTML={{ __html: `
          .mobile-responsive-content {
            width: 100%;
            max-width: 100%;
            overflow-x: hidden;
          }

          .mobile-responsive-content img {
            max-width: 100% !important;
            height: auto !important;
            display: block !important;
            margin: 0 auto !important;
            border-radius: 8px;
          }

          .mobile-responsive-content table {
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: auto !important;
            display: block !important;
          }

          .mobile-responsive-content iframe,
          .mobile-responsive-content video {
            max-width: 100% !important;
            height: auto !important;
            aspect-ratio: 16/9;
          }

          @media (max-width: 768px) {
            .mobile-responsive-content {
              font-size: 14px;
            }

            .mobile-responsive-content h1 {
              font-size: 1.5rem !important;
            }

            .mobile-responsive-content h2 {
              font-size: 1.25rem !important;
            }

            .mobile-responsive-content h3 {
              font-size: 1.1rem !important;
            }

            .mobile-responsive-content img {
              width: 100% !important;
            }
          }
        `}} />
        <div 
          className="mobile-responsive-content prose prose-base md:prose-lg max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
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
          position: relative;
        }

        .google-slide-container > div {
          width: 100% !important;
          max-width: 100% !important;
          position: relative !important;
        }

        .google-slide-container * {
          box-sizing: border-box !important;
        }

        .google-slide-container img {
          max-width: 100% !important;
          height: auto !important;
          object-fit: contain !important;
          display: block !important;
          margin: 0 auto !important;
          border-radius: 8px;
        }

        .google-slide-container div[style*="position: absolute"] {
          position: relative !important;
          width: 100% !important;
          height: auto !important;
          overflow: visible !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          margin-bottom: 1rem;
        }

        .google-slide-container div[style*="position: absolute"] img {
          position: static !important;
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
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

        .google-slide-container table {
          width: 100% !important;
          max-width: 100% !important;
          overflow-x: auto !important;
          display: block !important;
        }

        @media (max-width: 768px) {
          .google-slide-container {
            font-size: 14px;
          }

          .google-slide-container img {
            width: 100% !important;
            max-width: 100% !important;
          }

          .google-slide-container h1 {
            font-size: 1.5rem !important;
          }

          .google-slide-container h2 {
            font-size: 1.25rem !important;
          }

          .google-slide-container h3 {
            font-size: 1.1rem !important;
          }
        }
      `}} />
      <div 
        className="google-slide-container"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}