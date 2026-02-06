import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Download, Search, X, Upload, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function Library() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [user, setUser] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
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

  const filteredResources = resources.filter(resource => {
    const matchesSearch = !searchQuery || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.author?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
      window.open(resource.file_url, '_blank');
    } catch (error) {
      window.open(resource.file_url, '_blank');
    }
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
    if (!file) return;

    setUploadingFile(true);
    setAnalyzing(true);
    
    try {
      // Upload file
      toast.loading('Uploading file...');
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      toast.loading('Analyzing book with AI...');
      
      // Analyze the book with AI
      try {
        const { data } = await base44.functions.invoke('analyzeBook', { file_url });
        if (data.success && data.analysis) {
          setFormData({
            title: data.analysis.title || '',
            author: data.analysis.author || '',
            description: data.analysis.description || '',
            category: data.analysis.category || 'book',
            file_url,
            cover_image: '',
            tags: data.analysis.tags || [],
            is_featured: false
          });
          toast.success('Book analyzed! Review and edit details.');
          setShowUploadDialog(true);
        } else {
          setFormData({ ...formData, file_url });
          toast.info('Analysis incomplete. Please fill in the details.');
          setShowUploadDialog(true);
        }
      } catch (error) {
        console.error('Analysis failed:', error);
        setFormData({ ...formData, file_url });
        toast.info('Please fill in the book details manually.');
        setShowUploadDialog(true);
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploadingFile(false);
      setAnalyzing(false);
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
                      <img
                        src={book.cover_image}
                        alt={book.title}
                        className="w-full aspect-[3/4] object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-[3/4] bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
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
                  <img
                    src={book.cover_image}
                    alt={book.title}
                    className="w-full aspect-[3/4] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
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

      {/* Book Detail Modal */}
      <Dialog open={!!selectedBook} onOpenChange={() => setSelectedBook(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          {selectedBook && (
            <div className="flex flex-col md:flex-row">
              {/* Book Cover */}
              <div className="md:w-2/5 bg-gradient-to-br from-slate-800 to-slate-900 p-8 flex items-center justify-center">
                {selectedBook.cover_image ? (
                  <img
                    src={selectedBook.cover_image}
                    alt={selectedBook.title}
                    className="w-full max-w-xs rounded-lg shadow-2xl"
                  />
                ) : (
                  <div className="w-full max-w-xs aspect-[3/4] bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-24 h-24 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Book Details */}
              <div className="md:w-3/5 p-8 overflow-y-auto">
                <button
                  onClick={() => setSelectedBook(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedBook.title}</h1>
                <p className="text-gray-600 mb-4">{selectedBook.author || 'Unknown Author'}</p>

                <div className="flex items-center gap-6 mb-6 text-sm">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{selectedBook.downloads_count || 0}</div>
                    <div className="text-gray-500">Downloads</div>
                  </div>
                  <div className="text-center">
                    <Badge className="capitalize">{selectedBook.category}</Badge>
                  </div>
                </div>

                {selectedBook.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{selectedBook.description}</p>
                  </div>
                )}

                {selectedBook.tags && selectedBook.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedBook.tags.map((tag, i) => (
                        <Badge key={i} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={() => handleDownload(selectedBook)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Now
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Book Dialog - Shows after AI analysis */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Book Details</DialogTitle>
            <p className="text-sm text-gray-500 mt-1">AI has analyzed your book. Review and edit the details below.</p>
          </DialogHeader>
          <div className="space-y-4 mt-4">
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
            <div>
              <Label>Cover Image {uploadingCover && '(Uploading...)'}</Label>
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handleUploadCoverInForm}
                disabled={uploadingCover}
              />
              {formData.cover_image && (
                <img src={formData.cover_image} alt="Cover" className="mt-2 h-32 rounded" />
              )}
            </div>
            <div>
              <Label>Tags (comma separated)</Label>
              <Input 
                value={formData.tags.join(', ')} 
                onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} 
                placeholder="education, science, history"
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