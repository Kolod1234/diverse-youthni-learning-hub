import React, { useState, useRef } from 'react';
import { Loader2, Search, Bookmark, Highlighter, StickyNote, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextField, Box, Chip } from '@mui/material';

export default function PDFViewer({ fileUrl, title, onCoverCapture }) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedPages, setBookmarkedPages] = useState([]);
  const [annotationMode, setAnnotationMode] = useState(null);
  const [noteText, setNoteText] = useState('');
  const iframeRef = useRef(null);

  const viewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(fileUrl)}`;

  const toggleBookmark = () => {
    setBookmarkedPages(prev =>
      prev.includes(currentPage)
        ? prev.filter(p => p !== currentPage)
        : [...prev, currentPage]
    );
  };

  const handleSearch = () => {
    if (iframeRef.current && searchQuery) {
      iframeRef.current.contentWindow.postMessage({
        type: 'SEARCH_PDF',
        query: searchQuery
      }, '*');
    }
  };

  const handleSetCover = async () => {
    if (onCoverCapture) {
      await onCoverCapture(currentPage);
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
        {/* Search Bar */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', minWidth: 250 }}>
          <TextField
            size="small"
            placeholder="Search text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ 
              bgcolor: '#374151',
              input: { color: 'white', fontSize: '0.875rem' },
              '& .MuiOutlinedInput-root': { 
                '& fieldset': { borderColor: '#4b5563' },
                '&:hover fieldset': { borderColor: '#6b7280' }
              }
            }}
          />
          <Button
            size="sm"
            onClick={handleSearch}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Search className="w-4 h-4" />
          </Button>
        </Box>

        {/* Page Info */}
        <Box sx={{ color: '#e5e7eb', fontSize: '0.875rem', minWidth: 120 }}>
          Page {currentPage} of {totalPages}
        </Box>

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

        {/* Annotation Mode */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="sm"
            onClick={() => setAnnotationMode(annotationMode === 'highlight' ? null : 'highlight')}
            className={`gap-2 ${
              annotationMode === 'highlight'
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-gray-700 hover:bg-gray-600'
            } text-white`}
            title="Highlight text (select text to highlight)"
          >
            <Highlighter className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => setAnnotationMode(annotationMode === 'note' ? null : 'note')}
            className={`gap-2 ${
              annotationMode === 'note'
                ? 'bg-purple-500 hover:bg-purple-600'
                : 'bg-gray-700 hover:bg-gray-600'
            } text-white`}
            title="Add note"
          >
            <StickyNote className="w-4 h-4" />
          </Button>
        </Box>

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
              onClick={() => {
                iframeRef.current?.contentWindow.postMessage({
                  type: 'GOTO_PAGE',
                  page: page - 1
                }, '*');
                setCurrentPage(page);
              }}
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

      {/* Note Input */}
      {annotationMode === 'note' && (
        <Box sx={{ 
          bgcolor: '#374151', 
          borderBottom: 1, 
          borderColor: '#4b5563',
          p: 2, 
          display: 'flex', 
          gap: 2 
        }}>
          <TextField
            fullWidth
            size="small"
            placeholder={`Add note for page ${currentPage}...`}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            multiline
            rows={2}
            sx={{ 
              bgcolor: '#1f2937',
              input: { color: 'white' },
              '& .MuiOutlinedInput-root': { 
                '& fieldset': { borderColor: '#4b5563' },
                '&:hover fieldset': { borderColor: '#6b7280' }
              }
            }}
          />
          <Button
            size="sm"
            onClick={() => {
              if (noteText.trim()) {
                // Store note (can be extended with local storage or backend)
                console.log(`Note on page ${currentPage}: ${noteText}`);
                setNoteText('');
              }
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Save
          </Button>
        </Box>
      )}

      {/* PDF Viewer */}
      <div className="relative flex-1 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-900/80">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={viewerUrl}
          title={title || 'PDF Viewer'}
          className="w-full h-full border-none"
          onLoad={() => {
            setIsLoading(false);
            // Try to detect page changes
            const checkPage = setInterval(() => {
              try {
                const viewer = iframeRef.current?.contentWindow?.PDFViewerApplication;
                if (viewer?.page) {
                  setCurrentPage(viewer.page);
                  setTotalPages(viewer.pagesCount || 0);
                }
              } catch (e) {
                // Cross-origin restriction
              }
            }, 1000);
            return () => clearInterval(checkPage);
          }}
          sandbox="allow-scripts allow-same-origin allow-forms"
          allowFullScreen
        />
      </div>
    </div>
  );
}