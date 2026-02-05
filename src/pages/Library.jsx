import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Download, Search, Filter, FileText, Video, File } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Library() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: resources = [] } = useQuery({
    queryKey: ['library-resources'],
    queryFn: () => base44.entities.LibraryResource.list('-created_date', 500)
  });

  const filteredResources = resources.filter(resource => {
    const matchesSearch = !searchQuery || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryIcons = {
    book: BookOpen,
    document: FileText,
    video: Video,
    article: File,
    research: File,
    other: File
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Library</h1>
          <p className="text-gray-600">Educational resources and materials</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value="all">All Categories</option>
            <option value="book">Books</option>
            <option value="document">Documents</option>
            <option value="video">Videos</option>
            <option value="article">Articles</option>
            <option value="research">Research</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => {
            const Icon = categoryIcons[resource.category] || File;
            
            return (
              <Card key={resource.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {resource.cover_image && (
                  <img
                    src={resource.cover_image}
                    alt={resource.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Icon className="w-5 h-5 text-indigo-600 shrink-0" />
                    <Badge variant="secondary" className="capitalize">{resource.category}</Badge>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-2">{resource.title}</h3>
                  {resource.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{resource.description}</p>
                  )}
                  
                  {resource.author && (
                    <p className="text-xs text-gray-500 mb-3">By {resource.author}</p>
                  )}

                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {resource.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  )}

                  <Button 
                    className="w-full gap-2" 
                    variant="outline"
                    onClick={async () => {
                      try {
                        await base44.entities.LibraryResource.update(resource.id, {
                          downloads_count: (resource.downloads_count || 0) + 1
                        });
                        window.open(resource.file_url, '_blank');
                      } catch (error) {
                        window.open(resource.file_url, '_blank');
                      }
                    }}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    {resource.downloads_count || 0} downloads
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No resources found</p>
          </div>
        )}
      </div>
    </div>
  );
}