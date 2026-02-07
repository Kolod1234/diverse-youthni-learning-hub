import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Download, Search, X, Upload, Plus, Trash2, Edit, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import PDFViewer from '@/components/library/PDFViewer';
import TagInput from '@/components/library/TagInput';
import ShareDialog from '@/components/library/ShareDialog';
import CommentsSection from '@/components/library/CommentsSection';
import ActivityHistory from '@/components/library/ActivityHistory';
import EditBookDialog from '@/components/library/EditBookDialog';
import CoverPicker from '@/components/library/CoverPicker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [user, setUser] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [suggestingTags, setSuggestingTags] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState([]);
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

  const queryClient = useQueryClient();

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
    setEditingBook(book);
    setShowEditDialog(true);
  };

  const canEditBook = (book) => {
    return user && (user.role === 'admin' || user.is_tutor || book.created_by === user.email);
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
      setUploadingFile(false);
      return;
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      toast.error(`File too large! Maximum size is 50MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB`);
      e.target.value = '';
      setUploadingFile(false);
      return;
    }

    setUploadingFile(true);
    setAnalyzing(false);
    setUploadProgress(0);
    let progressInterval = null;

    try {
      // Simulate progress for better UX
      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) return prev;
          if (prev >= 80) return prev + Math.random() * 2;
          return prev + Math.random() * 15;
        });
      }, 300);

      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Set basic data and show dialog immediately
      setFormData({
        title: file.name.replace(/\.[^/.]+$/, ''),
        author: '',
        description: '',
        category: 'gcse_books',
        file_url,
        cover_image: '',
        tags: [],
        is_featured: false
      });

      toast.success('File uploaded! Fill in details below.');
      setShowUploadDialog(true);
    } catch (error) {
      if (progressInterval) clearInterval(progressInterval);
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}. Please try again.`);
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

  const handleDelete = (book) => {
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

  const canUpload = user && (user.role === 'admin' || user.is_tutor);

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">BookBase</h1>
          </div>
          
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search your favourite books"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          </div>

          {canUpload && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.epub,.mobi,.doc,.docx"
                onChange={handleFileSelected}
                className="hidden"
              />
              <Button 
                onClick={handleInitiateUpload}
                disabled={uploadingFile || analyzing}
                className="bg-indigo-600 hover:bg-indigo-700 gap-2"
              >
                <Plus className="w-5 h-5" />
                {uploadingFile || analyzing ? 'Analyzing...' : 'Upload Book'}
              </Button>
            </>
          )}
        </div>

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
                  onClick={() => setSelectedBook(book)}
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
                    {book.cover_image ? (
                      book.cover_image.toLowerCase().includes('.pdf') ? (
                        <div className="w-full aspect-[3/4] bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center p-4 text-white transform transition-transform duration-300 group-hover:scale-105">
                          <BookOpen className="w-16 h-16 mb-3 opacity-90" />
                          <p className="text-sm font-semibold text-center line-clamp-3">{book.title}</p>
                        </div>
                      ) : (
                        <img
                          src={book.cover_image}
                          alt={book.title}
                          className="w-full aspect-[3/4] object-contain bg-gray-100 transform transition-transform duration-300 group-hover:scale-105"
                        />
                      )
                    ) : (
                      <div className="w-full aspect-[3/4] bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105">
                        <BookOpen className="w-12 h-12 text-indigo-600" />
                      </div>
                    )}
                  </div>
                  {canUpload && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(book);
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      title="Delete book"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-indigo-100 transition-colors"
                  onClick={() => {
                    setSelectedTags(prev => 
                      prev.includes(tag) 
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    );
                  }}
                >
                  {tag}
                </Badge>
              ))}
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTags([])}
                  className="text-xs"
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
              onClick={() => setSelectedBook(book)}
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
                {book.cover_image ? (
                  book.cover_image.toLowerCase().includes('.pdf') ? (
                    <div className="w-full aspect-[3/4] bg-gradient-to-br from-gray-700 to-gray-900 flex flex-col items-center justify-center p-4 text-white transform transition-transform duration-300 group-hover:scale-105">
                      <BookOpen className="w-12 h-12 mb-2 opacity-90" />
                      <p className="text-xs font-semibold text-center line-clamp-2">{book.title}</p>
                    </div>
                  ) : (
                    <img
                      src={book.cover_image}
                      alt={book.title}
                      className="w-full aspect-[3/4] object-contain bg-gray-100 transform transition-transform duration-300 group-hover:scale-105"
                    />
                  )
                ) : book.file_url?.toLowerCase().endsWith('.pdf') ? (
                  <div className="w-full aspect-[3/4] overflow-hidden bg-gray-100 relative">
                    <iframe
                      src={`${book.file_url}#page=1&toolbar=0&navpanes=0&scrollbar=0`}
                      className="w-[120%] h-[120%] pointer-events-none border-none"
                      style={{
                        transform: 'scale(0.85)',
                        transformOrigin: 'top left',
                        overflow: 'hidden'
                      }}
                      scrolling="no"
                    />
                    <div className="absolute inset-0 z-10 bg-transparent" />
                  </div>
                ) : (
                  <div className="w-full aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105">
                    <BookOpen className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              {canUpload && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(book);
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  title="Delete book"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
        </div>

        {/* Upload Progress Dialog */}
        <Dialog open={uploadingFile} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Uploading Book</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-indigo-600">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Please wait while your book is being uploaded...
            </p>
          </div>
        </DialogContent>
        </Dialog>

      {/* Book Detail Modal */}
      <Dialog open={!!selectedBook} onOpenChange={() => setSelectedBook(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
          {selectedBook && (
            <div className="flex flex-col md:flex-row h-full">
              {/* Book Cover */}
              <div className="md:w-1/3 bg-gradient-to-br from-slate-800 to-slate-900 p-6 flex flex-col items-center justify-start">
                {selectedBook.cover_image ? (
                  selectedBook.cover_image.toLowerCase().includes('.pdf') ? (
                    <div className="w-full max-w-xs rounded-lg shadow-2xl mb-6 bg-white">
                      <iframe
                        src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(selectedBook.cover_image)}`}
                        className="w-full aspect-[3/4] rounded-lg"
                        style={{ border: 'none' }}
                      />
                    </div>
                  ) : (
                    <img
                      src={selectedBook.cover_image}
                      alt={selectedBook.title}
                      className="w-full max-w-xs rounded-lg shadow-2xl mb-6 object-contain bg-gray-100"
                    />
                  )
                ) : (
                  <div className="w-full max-w-xs aspect-[3/4] bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center mb-6">
                    <BookOpen className="w-24 h-24 text-gray-400" />
                  </div>
                )}

                <div className="w-full space-y-2">
                  <Button 
                    onClick={() => {
                      handleView(selectedBook);
                      setViewingBook(selectedBook);
                      setShowPdfViewer(true);
                      setSelectedBook(null);
                    }}
                    variant="outline"
                    className="w-full gap-2 bg-white"
                  >
                    <BookOpen className="w-5 h-5" />
                    Read Online
                  </Button>
                  <Button 
                    onClick={() => handleDownload(selectedBook)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </Button>
                  <Button 
                    onClick={() => handleShare(selectedBook)}
                    variant="outline"
                    className="w-full gap-2 bg-white"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </Button>
                  {canEditBook(selectedBook) && (
                    <>
                      <Button 
                        onClick={() => {
                          handleEdit(selectedBook);
                          setSelectedBook(null);
                        }}
                        variant="outline"
                        className="w-full gap-2 bg-white"
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
                          className="w-full gap-2 bg-white"
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
              <div className="md:w-2/3 flex flex-col overflow-hidden">
                <div className="p-6 border-b">
                  <button
                    onClick={() => setSelectedBook(null)}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedBook.title}</h1>
                  <p className="text-gray-600 mb-4">{selectedBook.author || 'Unknown Author'}</p>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{selectedBook.downloads_count || 0}</div>
                      <div className="text-gray-500">Downloads</div>
                    </div>
                    <Badge className="capitalize">{selectedBook.category}</Badge>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
                      <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600">
                        Details
                      </TabsTrigger>
                      <TabsTrigger value="comments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600">
                        Comments
                      </TabsTrigger>
                      <TabsTrigger value="activity" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600">
                        Activity
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="p-6 space-y-4">
                      {selectedBook.description && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                          <p className="text-gray-600 text-sm leading-relaxed">{selectedBook.description}</p>
                        </div>
                      )}

                      {selectedBook.tags && selectedBook.tags.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedBook.tags.map((tag, i) => (
                              <Badge key={i} variant="outline">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="comments" className="p-6">
                      <CommentsSection resourceId={selectedBook.id} />
                    </TabsContent>

                    <TabsContent value="activity" className="p-6">
                      <ActivityHistory resourceId={selectedBook.id} />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
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
      <Dialog open={showPdfViewer} onOpenChange={setShowPdfViewer}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-[95vh] p-0">
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
                {canEditBook(viewingBook) && viewingBook.file_url?.toLowerCase().endsWith('.pdf') && (
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b flex items-center justify-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen className="w-4 h-4" />
                      <span>Extract page as cover:</span>
                    </div>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Page #"
                      className="w-20 h-8"
                      id="page-number-input"
                    />
                    <Button 
                      size="sm"
                      onClick={async () => {
                        try {
                          const pageInput = document.getElementById('page-number-input');
                          const pageNumber = parseInt(pageInput.value);

                          if (!pageNumber || pageNumber < 1) {
                            toast.error('Please enter a valid page number');
                            return;
                          }

                          const toastId = toast.loading('Extracting page...');

                          const { data } = await base44.functions.invoke('extractPdfPage', {
                            file_url: viewingBook.file_url,
                            page_number: pageNumber - 1  // Convert to 0-indexed
                          });

                          if (!data.success) {
                            toast.error(data.error || 'Failed to extract page', { id: toastId });
                            return;
                          }

                          // Update book with extracted page as cover
                          await base44.entities.LibraryResource.update(viewingBook.id, {
                            cover_image: data.extracted_page_url
                          });

                          queryClient.invalidateQueries(['library-resources']);
                          toast.success('Cover image saved!', { id: toastId });
                          setShowPdfViewer(false);
                        } catch (error) {
                          console.error('Extract failed:', error);
                          toast.error('Failed to extract page: ' + error.message);
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Set as Cover
                    </Button>
                  </div>
                )}
                <div className="flex-1">
                  <PDFViewer fileUrl={viewingBook.file_url} title={viewingBook.title} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Book Dialog - Shows after AI analysis */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Book Details</DialogTitle>
            <p className="text-sm text-gray-500 mt-1">Fill in the book information below, or click "AI Analyze" to auto-fill.</p>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex justify-end mb-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
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
            </div>
            <div>
              <Label>Title *</Label>
              <Input 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                placeholder="Book title"
              />
            </div>
            <div>
              <Label>Author</Label>
              <Input 
                value={formData.author} 
                onChange={(e) => setFormData({ ...formData, author: e.target.value })} 
                placeholder="Author name"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                rows={3}
                placeholder="Brief description of the book"
              />
            </div>
            <div>
              <Label>Category</Label>
              <select 
                value={formData.category} 
                onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="youth_work">Youth Work</option>
                <option value="gcse_books">GCSE Books</option>
                <option value="gcse_past_questions">GCSE Past Questions</option>
                <option value="a_level_books">A-Level Books</option>
                <option value="inspirational">Inspirational</option>
                <option value="dyni_books">DYNI Books</option>
                <option value="workbooks_logbooks">Workbooks & Logbooks</option>
                <option value="history_books">History Books</option>
              </select>
            </div>
            <CoverPicker
              fileUrl={formData.file_url}
              currentCover={formData.cover_image}
              onCoverChange={(url) => setFormData({ ...formData, cover_image: url })}
            />
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Tags</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSuggestTags}
                  disabled={suggestingTags || !formData.title}
                >
                  {suggestingTags ? 'Suggesting...' : '✨ AI Suggest Tags'}
                </Button>
              </div>
              <TagInput
                tags={formData.tags}
                onChange={(tags) => setFormData({ ...formData, tags })}
                suggestions={tagSuggestions}
              />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={formData.is_featured} 
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} 
                id="featured"
              />
              <Label htmlFor="featured">Feature this book</Label>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => { setShowUploadDialog(false); resetForm(); }} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={uploadingCover} 
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                Save Book
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}