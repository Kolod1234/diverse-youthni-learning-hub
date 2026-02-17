import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Scissors, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function PDFSnippingTool({ onCapture, onCancel }) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [currentPos, setCurrentPos] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isSelecting && startPos) {
        setCurrentPos({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = async (e) => {
      if (isSelecting && startPos) {
        setIsSelecting(false);
        const endPos = { x: e.clientX, y: e.clientY };
        await captureSelection(startPos, endPos);
      }
    };

    if (isSelecting) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting, startPos]);

  const handleMouseDown = (e) => {
    if (e.target === overlayRef.current || e.target.closest('.selection-box')) {
      setStartPos({ x: e.clientX, y: e.clientY });
      setCurrentPos({ x: e.clientX, y: e.clientY });
      setIsSelecting(true);
    }
  };

  const captureSelection = async (start, end) => {
    setCapturing(true);
    try {
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);

      if (width < 10 || height < 10) {
        toast.error('Selection too small');
        setStartPos(null);
        setCurrentPos(null);
        setCapturing(false);
        return;
      }

      // Find the PDF page canvas/iframe
      const pdfContainer = document.querySelector('.react-pdf__Page');
      if (!pdfContainer) {
        toast.error('PDF page not found');
        setCapturing(false);
        return;
      }

      // Capture the entire PDF page
      const canvas = await html2canvas(pdfContainer, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        scale: 2
      });

      // Get the relative position within the PDF container
      const containerRect = pdfContainer.getBoundingClientRect();
      const relX = x - containerRect.left;
      const relY = y - containerRect.top;

      // Calculate scale factor
      const scaleX = canvas.width / containerRect.width;
      const scaleY = canvas.height / containerRect.height;

      // Create a new canvas for the cropped area
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = width * scaleX;
      croppedCanvas.height = height * scaleY;
      const ctx = croppedCanvas.getContext('2d');

      // Draw the cropped portion
      ctx.drawImage(
        canvas,
        relX * scaleX,
        relY * scaleY,
        width * scaleX,
        height * scaleY,
        0,
        0,
        width * scaleX,
        height * scaleY
      );

      // Convert to blob
      const blob = await new Promise(resolve => croppedCanvas.toBlob(resolve, 'image/png', 1.0));
      const file = new File([blob], `cover-snippet-${Date.now()}.png`, { type: 'image/png' });

      // Upload the file
      toast.loading('Uploading cover image...');
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      toast.success('Cover captured!');
      onCapture(file_url);

    } catch (error) {
      console.error('Capture error:', error);
      toast.error('Failed to capture: ' + error.message);
    } finally {
      setCapturing(false);
      setStartPos(null);
      setCurrentPos(null);
    }
  };

  const getSelectionBox = () => {
    if (!startPos || !currentPos) return null;

    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);

    return { x, y, width, height };
  };

  const selectionBox = getSelectionBox();

  return (
    <div
      ref={overlayRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        cursor: 'crosshair',
        zIndex: 9999
      }}
    >
      <div style={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 8,
        zIndex: 10000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '12px 24px',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <Scissors className="w-4 h-4 inline mr-2" />
          {capturing ? 'Capturing...' : 'Click and drag to select area'}
        </div>
        <Button
          onClick={onCancel}
          variant="destructive"
          size="sm"
          className="gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </Button>
      </div>

      {selectionBox && (
        <div
          className="selection-box"
          style={{
            position: 'absolute',
            left: selectionBox.x,
            top: selectionBox.y,
            width: selectionBox.width,
            height: selectionBox.height,
            border: '2px solid #4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            pointerEvents: 'none'
          }}
        >
          <div style={{
            position: 'absolute',
            top: -24,
            left: 0,
            backgroundColor: '#4f46e5',
            color: 'white',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 600
          }}>
            {Math.round(selectionBox.width)} × {Math.round(selectionBox.height)}
          </div>
        </div>
      )}
    </div>
  );
}