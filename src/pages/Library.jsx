import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import usePullToRefresh from '@/components/lesson/usePullToRefresh';
import { RefreshCw } from 'lucide-react';
import { 
  Card, Button, TextField, InputLabel, FormControl, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Container, IconButton, Tabs, Tab, InputAdornment, Select, MenuItem
} from '@mui/material';
import { BookOpen, Download, Search, X, Upload, Plus, Trash2, Edit, Share2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import PDFViewer from '@/components/library/PDFViewer';
import TagInput from '@/components/library/TagInput';
import ShareDialog from '@/components/library/ShareDialog';
import CommentsSection from '@/components/library/CommentsSection';
import ActivityHistory from '@/components/library/ActivityHistory';
import EditBookDialog from '@/components/library/EditBookDialog';
import CoverPicker from '@/components/library/CoverPicker';
import BulkUploadManager from '@/components/library/BulkUploadManager';
import LibraryPermissionManager from '@/components/library/LibraryPermissionManager';
import AILibraryAssistant from '@/components/library/AILibraryAssistant';
import { useLibraryPermissions } from '@/components/library/useLibraryPermissions';

export default function Library() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [viewingBook, setViewingBook] = useState(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [sharingBook, setSharingBook] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [user, setUser] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [suggestingTags, setSuggestingTags] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [detailTabValue, setDetailTabValue] = useState('details');
  const [showPermissionManager, setShowPermissionManager] = useState(false);
  const { canUpload, canEditBook: checkCanEditBook, canDeleteBook: checkCanDeleteBook, canManageUsers } = useLibraryPermissions(user?.email);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'gcse_books',
    file_url: '',
    cover_image: '',
    author: '',
    tags: [],
    is_featured: false
  });
  const fileInputRef = React.useRef(null);
  const scrollContainerRef = useRef(null);

  const queryClient = useQueryClient();

  // Pull to refresh
  const { isPulling, pullDistance } = usePullToRefresh(async () => {
    await queryClient.invalidateQueries(['library-resources']);
  });

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: resources = [] } = useQuery({
    queryKey: ['library-resources'],
    queryFn: () => base44.entities.LibraryResource.list('-created_date', 500)
  });

  // Check for book ID in sessionStorage from AI assistant
  useEffect(() => {
    const bookId = sessionStorage.getItem('openLibraryBookId');
    if (bookId && resources.length > 0) {
      const book = resources.find(r => r.id === bookId);
      if (book) {
        setSelectedBook(book);
        sessionStorage.removeItem('openLibraryBookId');
      }
    }
  }, [resources]);

  const [selectedTags, setSelectedTags] = useState([]);

  // Get all unique tags from resources
  const allTags = [...new Set(resources.flatMap(r => r.tags || []))].sort();

  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = !searchQuery || 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => resource.tags?.includes(tag));
      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [resources, searchQuery, selectedCategory, selectedTags]);

  const featuredBooks = filteredResources.filter(r => r.is_featured).slice(0, 5);
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'youth_work', label: 'Youth Work' },
    { id: 'gcse_books', label: 'GCSE Books' },
    { id: 'gcse_past_questions', label: 'GCSE Past Questions' },
    { id: 'a_level_books', label: 'A-Level Books' },
    { id: 'inspirational', label: 'Inspirational' },
    { id: 'dyni_books', label: 'DYNI Books' },
    { id: 'workbooks_logbooks', label: 'Workbooks & Logbooks' },
    { id: 'history_books', label: 'History Books' }
  ];

  const handleDownload = async (resource) => {
    try {
      await base44.entities.LibraryResource.update(resource.id, {
        downloads_count: (resource.downloads_count || 0) + 1
      });
      await base44.entities.FileActivity.create({
        resource_id: resource.id,
        action: 'downloaded',
        user_name: user?.full_name
      });
      window.open(resource.file_url, '_blank');
    } catch (error) {
      window.open(resource.file_url, '_blank');
    }
  };

  const handleView = async (resource) => {
    try {
      await base44.entities.FileActivity.create({
        resource_id: resource.id,
        action: 'viewed',
        user_name: user?.full_name
      });
    } catch (error) {
      console.error('Failed to log view:', error);
    }
  };

  const handleShare = (book) => {
    setSharingBook(book);
    setShowShareDialog(true);
  };

  const handleEdit = (book) => {
    if (!canEditBookUI(book)) {
      toast.error('You do not have permission to edit this book');
      return;
    }
    setEditingBook(book);
    setShowEditDialog(true);
  };

  const canEditBookUI = (book) => {
    if (!user || !book) return false;
    return user.role === 'admin';
  };

  const canDeleteBookUI = (book) => {
    if (!user || !book) return false;
    return user.role === 'admin';
  };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LibraryResource.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['library-resources']);
      setShowUploadDialog(false);
      resetForm();
      toast.success('Book uploaded successfully!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LibraryResource.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['library-resources']);
      toast.success('Book deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete book');
    }
  });

  const handleInitiateUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('=== UPLOAD START ===');
    console.log('File:', file.name);
    console.log('Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('Type:', file.type);

    // Check file size (500MB limit)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File too large! Maximum size is 500MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB`);
      e.target.value = '';
      return;
    }

    setUploadingFile(true);
    setUploadProgress(0);

    try {
      console.log('Uploading file...');
      
      // Simulated progress updates while uploading
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 5;
        });
      }, 500);

      try {
        console.log('Uploading file directly with Core.UploadFile...');
        const result = await base44.integrations.Core.UploadFile({ file });
        const file_url = result.file_url;
        
        clearInterval(progressInterval);
        console.log('File uploaded successfully:', file_url);
        setUploadProgress(95);

        // Create book record
        const bookData = {
          title: file.name.replace(/\.[^/.]+$/, ''),
          author: '',
          description: '',
          category: 'gcse_books',
          file_url: file_url,
          cover_image: '',
          tags: [],
          is_featured: false
        };

        console.log('Creating book record...');
        const newBook = await base44.entities.LibraryResource.create(bookData);
        console.log('Book created:', newBook.id);

        setUploadProgress(100);

        // Reset filters to show the new book
        setSelectedCategory('all');
        setSelectedTags([]);
        setSearchQuery('');

        // Force refresh
        await queryClient.invalidateQueries(['library-resources']);
        await queryClient.refetchQueries(['library-resources']);

        console.log('=== UPLOAD COMPLETE ===');
        toast.success(`"${bookData.title}" uploaded successfully! Scroll down to see it.`, { duration: 4000 });

        // Small delay to allow UI to update
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 500);
        } catch (uploadError) {
        clearInterval(progressInterval);
        throw uploadError;
        }

        } catch (error) {
      console.error('=== UPLOAD ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error:', error);

      toast.error(`Upload failed: ${error.message}`, { duration: 5000 });
    } finally {
      setUploadingFile(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleUploadCoverInForm = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, cover_image: file_url });
      toast.success('Cover image uploaded!');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleUploadCover = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, cover_image: file_url });
      toast.success('Cover image uploaded!');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.file_url) {
      toast.error('Title and file are required');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleDelete = async (book) => {
    if (!canDeleteBookUI(book)) {
      toast.error('You do not have permission to delete this book');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      deleteMutation.mutate(book.id);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'gcse_books',
      file_url: '',
      cover_image: '',
      author: '',
      tags: [],
      is_featured: false
    });
  };

  const handleSuggestTags = async () => {
    setSuggestingTags(true);
    try {
      const { data } = await base44.functions.invoke('suggestTags', {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        author: formData.author
      });
      
      if (data.success && data.tags) {
        setTagSuggestions(data.tags);
        toast.success('Tag suggestions ready!');
      }
    } catch (error) {
      toast.error('Failed to suggest tags');
    } finally {
      setSuggestingTags(false);
    }
  };

  return (
    <Box ref={scrollContainerRef} sx={{ minHeight: '100vh', bgcolor: '#f9fafb', position: 'relative' }}>
          {/* Pull to Refresh Indicator */}
          {isPulling && (
            <Box
              sx={{
                position: 'fixed',
                top: 64,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                zIndex: 9999,
                transition: 'transform 0.2s',
                transform: `translateY(${Math.min(pullDistance, 80)}px)`,
                pointerEvents: 'none'
              }}
            >
              <Box sx={{ bgcolor: '#2563eb', color: 'white', px: 3, py: 1.5, borderRadius: 50, boxShadow: 6, display: 'flex', alignItems: 'center', gap: 1 }}>
                <RefreshCw className={`w-4 h-4 ${pullDistance > 80 ? 'animate-spin' : ''}`} />
                <Typography variant="body2" fontWeight={600}>
                  {pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
                </Typography>
              </Box>
            </Box>
          )}
          {/* Mobile Upload FAB */}
          {canUpload && (
          <Box
          onClick={handleInitiateUpload}
          sx={{
            display: { xs: 'flex', sm: 'none' },
            position: 'fixed',
            bottom: 80,
            right: 16,
            zIndex: 9999,
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: '#4f46e5',
            color: 'white',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: uploadingFile || analyzing ? 'not-allowed' : 'pointer',
            opacity: uploadingFile || analyzing ? 0.6 : 1,
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
            '&:hover': { boxShadow: '0 6px 16px rgba(79, 70, 229, 0.6)' }
          }}
          >
          <Plus className="w-6 h-6" />
          </Box>
          )}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ bgcolor: '#4f46e5', p: 1, borderRadius: 2 }}>
              <BookOpen size={24} color="white" />
            </Box>
            <Typography variant="h4" fontWeight={700}>BookBase</Typography>
          </Box>

          <Box sx={{ flex: 1, maxWidth: 450, minWidth: 200, display: { xs: 'none', sm: 'block' }, order: { xs: 3, md: 2 } }}>
            <TextField
              placeholder="Search your favourite books"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} color="#9ca3af" />
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', order: { xs: 2, md: 3 } }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.epub,.mobi,.doc,.docx"
              onChange={handleFileSelected}
              style={{ display: 'none' }}
            />
            <Button 
              onClick={() => setShowBulkUpload(true)}
              variant="outlined"
              size="small"
              disabled={!canUpload}
              sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}
            >
              <Upload className="w-4 h-4" />
              Bulk Import
            </Button>
            <Button 
              onClick={handleInitiateUpload}
              disabled={uploadingFile || analyzing || !canUpload}
              variant="contained"
              size="small"
              sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' }, gap: 1, minHeight: 44 }}
            >
              <Plus className="w-4 h-4" />
              Upload
            </Button>
          </Box>
        </Box>

        {/* Mobile Search */}
        <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 3 }}>
          <TextField
            placeholder="Search books"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} color="#9ca3af" />
                </InputAdornment>
              ),
            }}
            sx={{ bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Box>

        {/* Featured Section */}
        {featuredBooks.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recommended</h2>
              <button className="text-indigo-600 text-sm font-medium hover:underline">See All →</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {featuredBooks.map((book) => (
                <div 
                  key={book.id}
                  className="cursor-pointer group relative"
                  onClick={() => window.location.href = createPageUrl('BookDetails') + '?id=' + book.id}
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
                    {book.cover_image && book.cover_image.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                      <img
                        src={book.cover_image}
                        alt={book.title}
                        className="w-full aspect-[3/4] object-contain bg-gray-100 transform transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : book.file_url?.toLowerCase().endsWith('.pdf') ? (
                      <div className="w-full aspect-[3/4] overflow-hidden bg-gray-100 relative">
                        <iframe
                          src={`${book.file_url}#page=1&toolbar=0&navpanes=0&scrollbar=0`}
                          className="w-[120%] h-[120%] border-none"
                          style={{
                            transform: 'scale(0.85)',
                            transformOrigin: 'top left',
                            overflow: 'hidden',
                            pointerEvents: 'none'
                          }}
                          scrolling="no"
                        />
                        <div className="absolute inset-0 z-10 cursor-pointer" style={{ pointerEvents: 'auto' }} />
                      </div>
                    ) : (
                      <div className="w-full aspect-[3/4] bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105">
                        <BookOpen className="w-12 h-12 text-indigo-600" />
                      </div>
                    )}
                  </div>
                  {canEditBookUI(book) && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(book);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-full shadow-lg"
                        title="Edit book"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {canDeleteBookUI(book) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(book);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg"
                          title="Delete book"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                  <div className="mt-2">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{book.title}</h3>
                    <p className="text-xs text-gray-500">{book.author || 'Unknown Author'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Filter by Tags</h2>
          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 15).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onClick={() => {
                  setSelectedTags(prev => 
                    prev.includes(tag) 
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  );
                }}
                sx={{
                  cursor: 'pointer',
                  bgcolor: selectedTags.includes(tag) ? 'primary.main' : 'transparent',
                  color: selectedTags.includes(tag) ? 'white' : 'text.primary',
                  border: 1,
                  borderColor: selectedTags.includes(tag) ? 'primary.main' : 'divider',
                  '&:hover': { bgcolor: selectedTags.includes(tag) ? 'primary.dark' : '#eef2ff' }
                }}
              />
            ))}
            {selectedTags.length > 0 && (
              <Button
                variant="text"
                size="small"
                onClick={() => setSelectedTags([])}
                sx={{ fontSize: '0.75rem' }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>
        )}

        {/* All Books Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredResources.map((book) => (
            <div 
              key={book.id}
              className="cursor-pointer group relative"
              onClick={() => window.location.href = createPageUrl('BookDetails') + '?id=' + book.id}
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
                {book.cover_image && book.cover_image.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                  <img
                    src={book.cover_image}
                    alt={book.title}
                    className="w-full aspect-[3/4] object-contain bg-gray-100 transform transition-transform duration-300 group-hover:scale-105"
                  />
                ) : book.file_url?.toLowerCase().endsWith('.pdf') ? (
                  <div className="w-full aspect-[3/4] overflow-hidden bg-gray-100 relative">
                    <iframe
                      src={`${book.file_url}#page=1&toolbar=0&navpanes=0&scrollbar=0`}
                      className="w-[120%] h-[120%] border-none"
                      style={{
                        transform: 'scale(0.85)',
                        transformOrigin: 'top left',
                        overflow: 'hidden',
                        pointerEvents: 'none'
                      }}
                      scrolling="no"
                    />
                    <div className="absolute inset-0 z-10 cursor-pointer" style={{ pointerEvents: 'auto' }} />
                  </div>
                ) : (
                  <div className="w-full aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105">
                    <BookOpen className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              {canEditBookUI(book) && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(book);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-full shadow-lg"
                    title="Edit book"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {canDeleteBookUI(book) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(book);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg"
                      title="Delete book"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              <div className="mt-2">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{book.title}</h3>
                <p className="text-xs text-gray-500">{book.author || 'Unknown Author'}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No resources found</p>
          </div>
        )}
        </Container>



        {/* Floating AI Assistant Button */}
        <AILibraryAssistant resources={resources} />

        {/* Upload Progress Dialog */}
        <Dialog open={uploadingFile} onClose={() => {}}>
          <DialogTitle>Uploading Book</DialogTitle>
          <DialogContent>
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Progress</Typography>
                  <Typography variant="body2" fontWeight={600} color="primary">{Math.round(uploadProgress)}%</Typography>
                </Box>
                <Box sx={{ width: '100%', bgcolor: '#e5e7eb', borderRadius: 50, height: 8, overflow: 'hidden' }}>
                  <Box 
                    sx={{ 
                      bgcolor: '#4f46e5', 
                      height: '100%', 
                      transition: 'width 0.3s ease-out',
                      width: `${uploadProgress}%`
                    }}
                  />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Please wait while your book is being uploaded...
              </Typography>
            </Box>
          </DialogContent>
        </Dialog>

      {/* Book Detail Modal */}
      <Dialog open={!!selectedBook} onClose={() => setSelectedBook(null)} maxWidth="lg" fullWidth>
        <DialogContent sx={{ p: 0, maxHeight: '90vh', overflow: 'hidden' }}>
          {selectedBook && (
            <div className="flex flex-col md:flex-row h-full gap-0">
              {/* Book Cover */}
              <div className="md:w-1/3 bg-gradient-to-br from-slate-800 to-slate-900 p-4 flex flex-col items-center overflow-y-auto">
                {selectedBook.cover_image ? (
                  selectedBook.cover_image.toLowerCase().includes('.pdf') ? (
                    <div className="w-40 h-52 rounded-lg shadow-2xl mb-3 bg-white flex-shrink-0">
                      <iframe
                        src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(selectedBook.cover_image)}`}
                        className="w-full h-full rounded-lg"
                        style={{ border: 'none' }}
                      />
                    </div>
                  ) : (
                    <img
                      src={selectedBook.cover_image}
                      alt={selectedBook.title}
                      className="w-40 h-52 rounded-lg shadow-2xl mb-3 object-cover bg-gray-100 flex-shrink-0"
                    />
                  )
                ) : (
                  <div className="w-40 h-52 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center mb-3 flex-shrink-0">
                    <BookOpen className="w-16 h-16 text-gray-400" />
                  </div>
                )}

                <div className="w-full space-y-2 flex-shrink-0">
                  <Button 
                    onClick={() => {
                      handleView(selectedBook);
                      setViewingBook(selectedBook);
                      setShowPdfViewer(true);
                      setSelectedBook(null);
                    }}
                    variant="outline"
                    className="w-full gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20 min-h-[44px]"
                  >
                    <BookOpen className="w-5 h-5" />
                    Read Online
                  </Button>
                  <Button 
                    onClick={() => handleDownload(selectedBook)}
                    className="w-full bg-white/10 hover:bg-white/20 gap-2 text-white border border-white/20 min-h-[44px]"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </Button>
                  <Button 
                    onClick={() => handleShare(selectedBook)}
                    variant="outline"
                    className="w-full gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20 min-h-[44px]"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </Button>
                  {canEditBookUI(selectedBook) && (
                    <>
                      <Button 
                        onClick={() => {
                          handleEdit(selectedBook);
                          setSelectedBook(null);
                        }}
                        variant="outline"
                        className="w-full gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20"
                      >
                        <Edit className="w-5 h-5" />
                        Edit
                      </Button>
                      {selectedBook.file_url?.toLowerCase().endsWith('.pdf') && (
                        <Button 
                          onClick={() => {
                            setViewingBook(selectedBook);
                            setShowPdfViewer(true);
                            setSelectedBook(null);
                          }}
                          variant="outline"
                          className="w-full gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20"
                        >
                          <Upload className="w-5 h-5" />
                          Set Page as Cover
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Book Details & Collaboration */}
              <Box sx={{ width: { xs: '100%', md: '66.666%' }, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                  <IconButton
                    onClick={() => setSelectedBook(null)}
                    sx={{ position: 'absolute', top: 16, right: 16 }}
                  >
                    <X size={20} />
                  </IconButton>

                  <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>{selectedBook.title}</Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>{selectedBook.author || 'Unknown Author'}</Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight={700}>{selectedBook.downloads_count || 0}</Typography>
                      <Typography variant="caption" color="text.secondary">Downloads</Typography>
                    </Box>
                    <Chip label={selectedBook.category} sx={{ textTransform: 'capitalize' }} />
                  </Box>
                </Box>

                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                  <Tabs value={detailTabValue} onChange={(e, newValue) => setDetailTabValue(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab value="details" label="Details" />
                    <Tab value="comments" label="Comments" />
                    <Tab value="activity" label="Activity" />
                  </Tabs>

                  {detailTabValue === 'details' && (
                    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {selectedBook.description && (
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Description</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{selectedBook.description}</Typography>
                        </Box>
                      )}

                      {selectedBook.tags && selectedBook.tags.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Tags</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {selectedBook.tags.map((tag, i) => (
                              <Chip key={i} label={tag} variant="outlined" size="small" />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  )}

                  {detailTabValue === 'comments' && (
                    <Box sx={{ p: 3 }}>
                      <CommentsSection resourceId={selectedBook.id} />
                    </Box>
                  )}

                  {detailTabValue === 'activity' && (
                    <Box sx={{ p: 3 }}>
                      <ActivityHistory resourceId={selectedBook.id} />
                    </Box>
                  )}
                </Box>
              </Box>
            </div>
          )}
      </DialogContent>
    </Dialog>

      {/* Share Dialog */}
      <ShareDialog
        resource={sharingBook}
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
      />

      {/* Edit Dialog */}
      <EditBookDialog
        book={editingBook}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      {/* PDF Viewer Dialog */}
      <Dialog open={showPdfViewer} onClose={() => setShowPdfViewer(false)} maxWidth={false} fullWidth>
        <DialogContent sx={{ p: 0, maxWidth: '95vw', height: '95vh', overflow: 'hidden' }}>
          {viewingBook && (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b bg-white">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{viewingBook.title}</h3>
                  {viewingBook.author && <p className="text-sm text-gray-600">{viewingBook.author}</p>}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleDownload(viewingBook)}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button variant="ghost" onClick={() => setShowPdfViewer(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 flex flex-col" id="pdf-viewer-container">
                {canEditBookUI(viewingBook) && viewingBook.file_url?.toLowerCase().endsWith('.pdf') && (
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b flex items-center justify-center gap-3">
                    <Button 
                      size="sm"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        try {
                          const toastId = toast.loading('Capturing first page as cover...');

                          const response = await base44.functions.invoke('extractPdfPage', {
                            file_url: viewingBook.file_url,
                            page_number: 0
                          });

                          if (!response.data.success) {
                            toast.error(response.data.error || 'Failed to capture page', { id: toastId });
                            return;
                          }

                          await base44.entities.LibraryResource.update(viewingBook.id, {
                            cover_image: response.data.extracted_page_url
                          });

                          queryClient.invalidateQueries(['library-resources']);
                          toast.success('Cover image saved!', { id: toastId });
                          setShowPdfViewer(false);
                        } catch (error) {
                          console.error('Capture failed:', error);
                          toast.error('Failed to capture page: ' + error.message);
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Capture First Page as Cover
                    </Button>
                  </div>
                )}
                <div className="flex-1">
                   <PDFViewer 
                     fileUrl={viewingBook.file_url} 
                     title={viewingBook.title}
                     resourceId={viewingBook.id}
                     onCoverCapture={async (pageNum) => {
                       try {
                         const toastId = toast.loading(`Capturing page ${pageNum} as cover...`);
                         const response = await base44.functions.invoke('extractPdfPage', {
                           file_url: viewingBook.file_url,
                           page_number: pageNum - 1
                         });
                         if (!response.data.success) {
                           toast.error(response.data.error || 'Failed to capture page', { id: toastId });
                           return;
                         }
                         await base44.entities.LibraryResource.update(viewingBook.id, {
                           cover_image: response.data.extracted_page_url
                         });
                         queryClient.invalidateQueries(['library-resources']);
                         toast.success('Cover image saved!', { id: toastId });
                       } catch (error) {
                         toast.error('Failed to capture page: ' + error.message);
                       }
                     }}
                   />
                 </div>
              </div>
            </div>
          )}
      </DialogContent>
    </Dialog>

      {/* Permission Manager Dialog */}
      {canManageUsers && (
       <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 50 }}>
         <Button
           variant="contained"
           onClick={() => setShowPermissionManager(true)}
           sx={{ bgcolor: '#4f46e5', borderRadius: '50%', width: 56, height: 56, minWidth: 0, p: 0 }}
           title="Manage library permissions"
         >
           <Edit className="w-6 h-6" />
         </Button>
       </Box>
      )}

      <LibraryPermissionManager
       open={showPermissionManager}
       onOpenChange={setShowPermissionManager}
      />

      {/* Bulk Upload Manager */}
      <BulkUploadManager
       open={showBulkUpload}
       onOpenChange={setShowBulkUpload}
       onSuccess={() => {
         queryClient.invalidateQueries(['library-resources']);
         setShowBulkUpload(false);
       }}
      />

      {/* Upload Book Dialog - Shows after AI analysis */}
      <Dialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Add Book Details
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Fill in the book information below, or click "AI Analyze" to auto-fill.
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={async () => {
                  if (!formData.file_url) return;
                  setAnalyzing(true);
                  try {
                    toast.loading('Analyzing with AI...');
                    const { data } = await base44.functions.invoke('analyzeBook', { file_url: formData.file_url });
                    if (data.success && data.analysis) {
                      setFormData({
                        ...formData,
                        title: data.analysis.title || formData.title,
                        author: data.analysis.author || formData.author,
                        description: data.analysis.description || formData.description,
                        category: data.analysis.category || formData.category,
                        cover_image: data.analysis.cover_image || formData.cover_image,
                        tags: data.analysis.tags || formData.tags
                      });
                      toast.success('Analysis complete!');
                    } else {
                      toast.error('Analysis failed');
                    }
                  } catch (error) {
                    toast.error('Analysis failed');
                  } finally {
                    setAnalyzing(false);
                  }
                }}
                disabled={analyzing || !formData.file_url}
              >
                {analyzing ? 'Analyzing...' : '✨ AI Analyze Book'}
              </Button>
            </Box>
            <Box>
              <InputLabel>Title *</InputLabel>
              <TextField 
                fullWidth
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                placeholder="Book title"
                sx={{ mt: 1 }}
              />
            </Box>
            <Box>
              <InputLabel>Author</InputLabel>
              <TextField 
                fullWidth
                value={formData.author} 
                onChange={(e) => setFormData({ ...formData, author: e.target.value })} 
                placeholder="Author name"
                sx={{ mt: 1 }}
              />
            </Box>
            <Box>
              <InputLabel>Description</InputLabel>
              <TextField 
                fullWidth
                multiline
                rows={3}
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                placeholder="Brief description of the book"
                sx={{ mt: 1 }}
              />
            </Box>
            <Box>
              <InputLabel>Category</InputLabel>
              <Select 
                fullWidth
                value={formData.category} 
                onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                sx={{ mt: 1 }}
              >
                <MenuItem value="youth_work">Youth Work</MenuItem>
                <MenuItem value="gcse_books">GCSE Books</MenuItem>
                <MenuItem value="gcse_past_questions">GCSE Past Questions</MenuItem>
                <MenuItem value="a_level_books">A-Level Books</MenuItem>
                <MenuItem value="inspirational">Inspirational</MenuItem>
                <MenuItem value="dyni_books">DYNI Books</MenuItem>
                <MenuItem value="workbooks_logbooks">Workbooks & Logbooks</MenuItem>
                <MenuItem value="history_books">History Books</MenuItem>
              </Select>
            </Box>
            <CoverPicker
              fileUrl={formData.file_url}
              currentCover={formData.cover_image}
              onCoverChange={(url) => setFormData({ ...formData, cover_image: url })}
            />
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <InputLabel>Tags</InputLabel>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleSuggestTags}
                  disabled={suggestingTags || !formData.title}
                >
                  {suggestingTags ? 'Suggesting...' : '✨ AI Suggest Tags'}
                </Button>
              </Box>
              <TagInput
                tags={formData.tags}
                onChange={(tags) => setFormData({ ...formData, tags })}
                suggestions={tagSuggestions}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input 
                type="checkbox" 
                checked={formData.is_featured} 
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} 
                id="featured"
              />
              <InputLabel htmlFor="featured">Feature this book</InputLabel>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            variant="outlined"
            onClick={() => { setShowUploadDialog(false); resetForm(); }}
            sx={{ minHeight: 44 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleSubmit} 
            disabled={uploadingCover}
            sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' }, minHeight: 44 }}
          >
            Save Book
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}