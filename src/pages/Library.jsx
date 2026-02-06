import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Download, Search, Star, X, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function Library() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBook, setSelectedBook] = useState(null);

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
    { id: 'book', label: 'Books' },
    { id: 'document', label: 'Documents' },
    { id: 'video', label: 'Videos' },
    { id: 'article', label: 'Articles' },
    { id: 'research', label: 'Research' },
    { id: 'other', label: 'Other' }
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
                  className="cursor-pointer group"
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
              className="cursor-pointer group"
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
    </div>
  );
}