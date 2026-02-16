import React, { useState, useRef } from 'react';
import { Document, Page } from 'react-pdf';
import { Loader2, Search, Bookmark, FileImage, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Box, TextField, Chip, Dialog, DialogContent } from '@mui/material';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AnnotationTools from './AnnotationTools';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

export default function PDFViewer({ fileUrl, title, onCoverCapture }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedPages, setBookmarkedPages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  const toggleBookmark = () => {
    setBookmarkedPages(prev =>
      prev.includes(currentPage)
        ? prev.filter(p => p !== currentPage)
        : [...prev, currentPage]
    );
  };

  const handleSetCover = async () => {
    if (onCoverCapture) {
      await onCoverCapture(currentPage);
    }
  };

  const goToPage = (page) => {
    if (page > 0 && page <= numPages) {
      setCurrentPage(page);
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  return (
    <div ref={containerRef} style={{ 
      width: '100%', 
      height: '100%', 
      backgroundColor: '#111827', 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden',
      ...(isFullscreen && {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        width: '100vw',
        height: '100vh'
      })
    }}>
      {/* Toolbar */}
      <Box sx={{ 
        bgcolor: '#ffffff', 
        borderBottom: 2, 
        borderColor: '#e5e7eb', 
        p: 2, 
        display: 'flex', 
        gap: 2, 
        alignItems: 'center', 
        overflowX: 'auto',
        flexWrap: 'wrap',
        boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
        zIndex: 10,
        position: 'relative'
      }}>
        {/* Page Navigation */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Box sx={{ color: '#1f2937', fontSize: '0.875rem', fontWeight: 600, minWidth: 120, textAlign: 'center' }}>
            Page {currentPage} of {numPages || '...'}
          </Box>
          <Button
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={!numPages || currentPage >= numPages}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Box>

        {/* Search Bar */}
        <TextField
          size="small"
          placeholder="Search text..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ 
            width: 200,
            bgcolor: '#f3f4f6',
            input: { color: '#1f2937', fontSize: '0.875rem' },
            '& .MuiOutlinedInput-root': { 
              '& fieldset': { borderColor: '#d1d5db' },
              '&:hover fieldset': { borderColor: '#9ca3af' }
            }
          }}
        />

        {/* Bookmark Button */}
        <Button
          size="sm"
          onClick={toggleBookmark}
          className={`gap-2 font-medium ${
            bookmarkedPages.includes(currentPage)
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
          }`}
          title="Bookmark this page"
        >
          <Bookmark className="w-4 h-4" />
          {bookmarkedPages.includes(currentPage) ? 'Bookmarked' : 'Bookmark'}
        </Button>

        {/* Set as Cover */}
        <Button
          size="sm"
          onClick={handleSetCover}
          className="bg-green-600 hover:bg-green-700 text-white gap-2 font-medium"
          title="Set current page as cover"
        >
          <FileImage className="w-4 h-4" />
          Set as Cover
        </Button>

        {/* Fullscreen Button */}
        <Button
          size="sm"
          onClick={toggleFullscreen}
          className="bg-gray-600 hover:bg-gray-700 text-white gap-2 font-medium ml-auto"
          title="Toggle fullscreen"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </Button>
      </Box>

      {/* Bookmarks Display */}
      {bookmarkedPages.length > 0 && (
        <Box sx={{ 
          bgcolor: '#f9fafb', 
          borderBottom: 1, 
          borderColor: '#e5e7eb',
          p: 1.5, 
          display: 'flex', 
          gap: 1, 
          flexWrap: 'wrap',
          maxHeight: 60,
          overflowY: 'auto'
        }}>
          {bookmarkedPages.map((page) => (
            <Chip
              key={page}
              label={`Page ${page}`}
              onClick={() => goToPage(page)}
              onDelete={() => setBookmarkedPages(prev => prev.filter(p => p !== page))}
              sx={{ 
                bgcolor: '#4f46e5', 
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.75rem',
                height: 24,
                fontWeight: 600
              }}
            />
          ))}
        </Box>
      )}

      {/* PDF Viewer */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflowY: 'auto', 
        overflowX: 'auto', 
        backgroundColor: '#111827', 
        padding: isFullscreen ? '0' : '16px', 
        minHeight: 0,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {!fileUrl && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', color: '#9ca3af' }}>
            No file URL provided
          </div>
        )}

        {fileUrl && (
          <>
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            )}

            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
                setIsLoading(false);
              }}
              onLoadError={(error) => {
                console.error('PDF load error:', error);
                setIsLoading(false);
              }}
              loading={<Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />}
            >
              <div style={{ 
                backgroundColor: 'white', 
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', 
                margin: isFullscreen ? '0' : '16px auto', 
                width: isFullscreen ? '100%' : 'fit-content',
                height: isFullscreen ? '100%' : 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Page 
                  pageNumber={currentPage}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  width={isFullscreen ? window.innerWidth : undefined}
                />
              </div>
            </Document>
          </>
        )}
      </div>
    </div>
  );
}