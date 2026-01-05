import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Search, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function ArtGallery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArt, setSelectedArt] = useState(null);
  const queryClient = useQueryClient();

  const { data: artworks = [] } = useQuery({
    queryKey: ['art-gallery'],
    queryFn: () => base44.entities.ArtGallery.list('-created_date', 500)
  });

  const likeArtMutation = useMutation({
    mutationFn: ({ id, likes }) => base44.entities.ArtGallery.update(id, { likes_count: likes + 1 }),
    onSuccess: () => queryClient.invalidateQueries(['art-gallery'])
  });

  const filteredArtworks = artworks.filter(art => {
    const matchesSearch = !searchQuery || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.artist_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Palette className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Art Gallery</h1>
          </div>
          <p className="text-gray-600">Student artwork and creative expressions</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search artworks..."
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
            <option value="painting">Painting</option>
            <option value="drawing">Drawing</option>
            <option value="photography">Photography</option>
            <option value="digital">Digital Art</option>
            <option value="sculpture">Sculpture</option>
            <option value="mixed_media">Mixed Media</option>
          </select>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredArtworks.map((art) => (
            <Card
              key={art.id}
              className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
              onClick={() => setSelectedArt(art)}
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={art.image_url}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {art.is_featured && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500">Featured</Badge>
                )}
              </div>
              <div className="p-4">
                <Badge variant="outline" className="mb-2 capitalize">{art.category}</Badge>
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{art.title}</h3>
                <p className="text-sm text-gray-600 mb-3">By {art.artist_name}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    likeArtMutation.mutate({ id: art.id, likes: art.likes_count || 0 });
                  }}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600"
                >
                  <Heart className="w-4 h-4" />
                  {art.likes_count || 0} likes
                </button>
              </div>
            </Card>
          ))}
        </div>

        {filteredArtworks.length === 0 && (
          <div className="text-center py-12">
            <Palette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No artworks found</p>
          </div>
        )}

        <Dialog open={!!selectedArt} onOpenChange={() => setSelectedArt(null)}>
          <DialogContent className="max-w-4xl">
            {selectedArt && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedArt.image_url}
                    alt={selectedArt.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <Badge variant="outline" className="mb-3 capitalize">{selectedArt.category}</Badge>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedArt.title}</h2>
                  <p className="text-gray-600 mb-4">By {selectedArt.artist_name}</p>
                  {selectedArt.description && (
                    <p className="text-gray-700 mb-6">{selectedArt.description}</p>
                  )}
                  <button
                    onClick={() => likeArtMutation.mutate({ id: selectedArt.id, likes: selectedArt.likes_count || 0 })}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-600"
                  >
                    <Heart className="w-5 h-5" />
                    {selectedArt.likes_count || 0} likes
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}