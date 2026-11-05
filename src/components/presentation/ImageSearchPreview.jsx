import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Search, Image as ImageIcon, Check } from 'lucide-react';
import { toast } from 'sonner';
import { activateOnKey } from '@/lib/a11y';

export default function ImageSearchPreview({ isOpen, onClose, onSelectImage, defaultQuery = '' }) {
  const [searchQuery, setSearchQuery] = useState(defaultQuery);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searching, setSearching] = useState(false);

  const searchImages = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setSearching(true);
    try {
      const result = await base44.functions.invoke('searchUnsplashImages', {
        query: searchQuery,
        perPage: 9
      });

      if (result.data.images?.length > 0) {
        setImages(result.data.images);
        if (result.data.fallback) {
          toast.info('Using placeholder images - Add UNSPLASH_ACCESS_KEY for real images');
        }
      } else {
        toast.error('No images found');
        setImages([]);
      }
    } catch (error) {
      console.error('Error searching images:', error);
      toast.error('Failed to search images');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectImage = () => {
    if (selectedImage) {
      onSelectImage(selectedImage);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Search & Preview Images</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label>Search Term</Label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchImages()}
                placeholder="e.g., photosynthesis diagram, cell structure, water cycle"
              />
            </div>
            <Button
              onClick={searchImages}
              disabled={!searchQuery.trim() || searching}
              className="mt-auto bg-blue-600 hover:bg-blue-700"
            >
              {searching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Image Grid */}
          {images.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {images.map((image) => (
                <div role="button" tabIndex={0} onKeyDown={activateOnKey}
                  key={image.id}
                  onClick={() => setSelectedImage(image)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage?.id === image.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <img
                    src={image.thumbnail}
                    alt={image.description}
                    className="w-full h-48 object-cover"
                  />
                  {selectedImage?.id === image.id && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <div className="bg-blue-500 rounded-full p-2">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-white text-xs truncate">{image.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Search for images to preview</p>
            </div>
          )}

          {/* Preview Selected Image */}
          {selectedImage && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold mb-2">Selected Image Preview</h4>
              <img
                src={selectedImage.url}
                alt={selectedImage.description}
                className="w-full max-h-64 object-contain rounded-lg mb-2"
              />
              <p className="text-sm text-gray-600 mb-1">{selectedImage.description}</p>
              <p className="text-xs text-gray-500">
                Photo by{' '}
                <a
                  href={selectedImage.photographer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {selectedImage.photographer}
                </a>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSelectImage}
              disabled={!selectedImage}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Insert Image
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}