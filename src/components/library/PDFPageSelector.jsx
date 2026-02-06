import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function PDFPageSelector({ pdfUrl, onPageSelect }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [extracting, setExtracting] = useState(false);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleExtractPage = async () => {
    setExtracting(true);
    try {
      const result = await base44.functions.invoke('extractPdfPage', {
        file_url: pdfUrl,
        page_number: currentPage - 1
      });

      console.log('Extract result:', result);

      if (result.data?.success && result.data?.page_url) {
        onPageSelect(result.data.page_url);
        toast.success(`Page ${currentPage} extracted! Click "Save Changes" to apply.`);
      } else {
        toast.error(result.data?.error || 'Failed to extract page');
        console.error('Extraction failed:', result.data);
      }
    } catch (error) {
      console.error('Extract error:', error);
      toast.error(error.message || 'Failed to extract page');
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center" style={{ minHeight: '400px' }}>
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          }
          error={
            <div className="text-red-500 p-4">
              Failed to load PDF
            </div>
          }
        >
          <Page 
            pageNumber={currentPage} 
            width={400}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>

      {numPages && (
        <>
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
        </>
      )}
    </div>
  );
}