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
        bgcolor: '#1f2937', 
        borderBottom: 1, 
        borderColor: '#374151', 
        p: 2, 
        display: 'flex', 
        gap: 2, 
        alignItems: 'center', 
        overflowX: 'auto',
        flexWrap: 'wrap'
      }}>
        {/* Page Navigation */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Box sx={{ color: '#e5e7eb', fontSize: '0.875rem', minWidth: 120, textAlign: 'center' }}>
            Page {currentPage} of {numPages || '...'}
          </Box>
          <Button
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={!numPages || currentPage >= numPages}
            className="bg-gray-700 hover:bg-gray-600 text-white"
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
            bgcolor: '#374151',
            input: { color: 'white', fontSize: '0.875rem' },
            '& .MuiOutlinedInput-root': { 
              '& fieldset': { borderColor: '#4b5563' },
              '&:hover fieldset': { borderColor: '#6b7280' }
            }
          }}
        />

        {/* Bookmark Button */}
        <Button
          size="sm"
          onClick={toggleBookmark}
          className={`gap-2 ${
            bookmarkedPages.includes(currentPage)
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
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
          className="bg-green-600 hover:bg-green-700 text-white gap-2"
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
      <div className="relative flex-1 overflow-auto flex items-center justify-center bg-gray-950">
        {isLoading && (
          <div className="flex items-center justify-center">
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
          <div className="bg-white shadow-lg">
            <Page 
              pageNumber={currentPage}
              width={Math.min(900, typeof window !== 'undefined' ? window.innerWidth - 40 : 900)}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </div>
        </Document>
      </div>
    </div>
  );
}