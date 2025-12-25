import React, { useEffect, useState } from 'react';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function UniversalSlidePlayer({ content, googleSlidesUrl, fileUrl, fileType }) {
  const [processedContent, setProcessedContent] = useState(content);

  // Convert images to base64 for better compatibility
  useEffect(() => {
    if (!content) return;

    const convertImagesToBase64 = async () => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const images = tempDiv.querySelectorAll('img');

      const promises = Array.from(images).map(async (img) => {
        const src = img.getAttribute('src');
        if (!src || src.startsWith('data:')) return; // Skip if already base64

        try {
          const response = await fetch(src);
          const blob = await response.blob();
          const reader = new FileReader();
          
          return new Promise((resolve) => {
            reader.onloadend = () => {
              img.setAttribute('src', reader.result);
              resolve();
            };
            reader.onerror = () => resolve(); // Continue on error
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.warn('Failed to convert image:', src);
        }
      });

      await Promise.all(promises);
      setProcessedContent(tempDiv.innerHTML);
    };

    convertImagesToBase64();
  }, [content]);

  // Handle Google Slides iframe embed with zoom
  if (googleSlidesUrl) {
    const presentationId = googleSlidesUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    if (presentationId) {
      return (
        <div className="w-full rounded-lg overflow-hidden" style={{ height: '70vh', minHeight: '500px' }}>
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={3}
            centerOnInit
          >
            <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
              <div style={{ width: '100%', height: '70vh', minHeight: '500px', backgroundColor: '#1f2937' }}>
                <iframe 
                  src={`https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000`}
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>
      );
    }
  }

  // Handle file-based content (PowerPoint, Word, PDF)
  if (fileUrl) {
    return (
      <div className="w-full rounded-lg overflow-hidden bg-white shadow-sm" style={{ height: '70vh', minHeight: '500px' }}>
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={3}
          centerOnInit
        >
          <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
            <DocViewer
              documents={[{ uri: fileUrl }]}
              pluginRenderers={DocViewerRenderers}
              style={{ height: "100%" }}
              config={{
                header: {
                  disableHeader: false,
                  disableFileName: false,
                  retainURLParams: false
                }
              }}
            />
          </TransformComponent>
        </TransformWrapper>
      </div>
    );
  }

  // Handle HTML content with zoom support
  if (processedContent) {
    return (
      <div className="w-full rounded-lg overflow-hidden">
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
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={3}
          centerOnInit
        >
          <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
            <div 
              className="slide-content-wrapper"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />
          </TransformComponent>
        </TransformWrapper>
      </div>
    );
  }

  return (
    <div className="w-full p-8 text-center bg-gray-50 rounded-lg">
      <p className="text-gray-500">No content available</p>
    </div>
  );
}