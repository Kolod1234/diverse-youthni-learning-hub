import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function PDFPageSelector({ pdfUrl, onPageSelect }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [extracting, setExtracting] = useState(false);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(null);

  useEffect(() => {
    const loadPdfInfo = async () => {
      try {
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        
        if (!window.pdfjsLib) {
          const script = document.createElement('script');
          script.src = 'https://mozilla.github.io/pdf.js/build/pdf.js';
          document.head.appendChild(script);
          await new Promise(resolve => script.onload = resolve);
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';
        }

        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setNumPages(pdf.numPages);
        setLoading(false);
      } catch (error) {
        console.error('Error loading PDF:', error);
        toast.error('Failed to load PDF');
        setLoading(false);
      }
    };

    loadPdfInfo();
  }, [pdfUrl]);

  useEffect(() => {
    if (iframeRef.current && !loading) {
      const viewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}#page=${currentPage}`;
      iframeRef.current.src = viewerUrl;
    }
  }, [currentPage, pdfUrl, loading]);

  const handleExtractPage = async () => {
    setExtracting(true);
    try {
      const { data } = await base44.functions.invoke('extractPdfPage', {
        file_url: pdfUrl,
        page_number: currentPage - 1
      });

      if (data.success && data.page_url) {
        onPageSelect(data.page_url);
        toast.success(`Page ${currentPage} set as cover!`);
      } else {
        toast.error(data.error || 'Failed to extract page');
      }
    } catch (error) {
      console.error('Extract error:', error);
      toast.error('Failed to extract page');
    } finally {
      setExtracting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="border rounded-lg overflow-hidden bg-gray-100" style={{ height: '400px' }}>
        <iframe
          ref={iframeRef}
          className="w-full h-full"
          style={{ border: 'none' }}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <span className="text-sm text-gray-600">
          Page {currentPage} of {numPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
          disabled={currentPage === numPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <Button
        onClick={handleExtractPage}
        disabled={extracting}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
      >
        {extracting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Extracting Page {currentPage}...
          </>
        ) : (
          `Use Page ${currentPage} as Cover`
        )}
      </Button>
    </div>
  );
}