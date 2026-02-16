import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { Loader2, Search, Bookmark, FileImage, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Box, TextField, Chip } from '@mui/material';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

export default function PDFViewer({ fileUrl, title, onCoverCapture }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedPages, setBookmarkedPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="relative w-full h-full bg-gray-900 flex flex-col overflow-hidden">
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
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
      </Box>

      {/* Bookmarks Display */}
      {bookmarkedPages.length > 0 && (
        <Box sx={{ 
          bgcolor: '#1f2937', 
          borderBottom: 1, 
          borderColor: '#374151',
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
                height: 24
              }}
            />
          ))}
        </Box>
      )}

      {/* PDF Viewer */}
      <div className="relative flex-1 overflow-y-auto overflow-x-hidden flex justify-center bg-gray-950 p-4">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
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
          className="flex justify-center"
        >
          <div className="bg-white shadow-2xl my-4">
            <Page 
              pageNumber={currentPage}
              scale={1.5}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </div>
        </Document>
      </div>
    </div>
  );
}