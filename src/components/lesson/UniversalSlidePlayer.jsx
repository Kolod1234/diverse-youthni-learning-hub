import React, { useEffect, useState, useRef } from 'react';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { toPng, toJpeg } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Download, Image as ImageIcon } from 'lucide-react';

export default function UniversalSlidePlayer({ content, googleSlidesUrl, fileUrl, fileType }) {
  const [processedContent, setProcessedContent] = useState(content);
  const [isExporting, setIsExporting] = useState(false);
  const slideRef = useRef(null);

  // Export slide as image
  const exportAsImage = async (format = 'png') => {
    if (!slideRef.current) return;
    
    setIsExporting(true);
    try {
      const dataUrl = format === 'png' 
        ? await toPng(slideRef.current, { 
            quality: 1.0,
            pixelRatio: 2,
            cacheBust: true,
            backgroundColor: '#ffffff'
          })
        : await toJpeg(slideRef.current, { 
            quality: 0.95,
            pixelRatio: 2,
            cacheBust: true,
            backgroundColor: '#ffffff'
          });
      
      const link = document.createElement('a');
      link.download = `slide-${Date.now()}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export slide:', error);
    } finally {
      setIsExporting(false);
    }
  };

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
        <div className="w-full rounded-lg overflow-hidden" style={{ height: '85vh', minHeight: '500px' }}>
          <iframe 
            src={`https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000`}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
          />
        </div>
      );
    }
  }

  // Handle file-based content (PowerPoint, Word, PDF)
  if (fileUrl) {
    return (
      <div className="w-full rounded-lg overflow-hidden bg-gray-50" style={{ height: '75vh', minHeight: '600px' }}>
        <DocViewer
          documents={[{ uri: fileUrl, fileType: fileType }]}
          pluginRenderers={DocViewerRenderers}
          style={{ height: "100%", width: "100%" }}
          config={{
            header: {
              disableHeader: false,
              disableFileName: true,
              retainURLParams: false
            },
            pdfZoom: {
              defaultZoom: 1.1,
              zoomJump: 0.2,
            },
            pdfVerticalScrollByDefault: true,
          }}
          theme={{
            primary: "#3b82f6",
            secondary: "#f3f4f6",
            tertiary: "#e5e7eb",
            textPrimary: "#111827",
            textSecondary: "#6b7280",
            textTertiary: "#9ca3af",
            disableThemeScrollbar: false,
          }}
        />
      </div>
    );
  }

  // Handle HTML content with zoom support
  if (processedContent) {
    return (
      <div className="w-full rounded-lg overflow-hidden">
        <div className="flex justify-end gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportAsImage('png')}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export PNG'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportAsImage('jpeg')}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export JPG'}
          </Button>
        </div>
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
              ref={slideRef}
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