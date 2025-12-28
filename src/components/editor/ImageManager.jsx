import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Search, Loader2, X, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function ImageManager({ onImageSelected, onClose, slideTitle, slideContent }) {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const handleSearchImage = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setSearching(true);
    try {
      const result = await base44.functions.invoke('searchImageOnline', {
        query: searchQuery,
        slideTitle,
        slideContent
      });

      if (result?.data?.url) {
        setSearchResults([result.data.url]);
        toast.success('Image found!');
      } else {
        toast.error('No image found. Try a different query.');
      }
    } catch (error) {
      toast.error('Failed to search for image');
    } finally {
      setSearching(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      
      if (result?.file_url) {
        onImageSelected(result.file_url);
        toast.success('Image uploaded successfully!');
        onClose();
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!imageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    if (!imageUrl.startsWith('http')) {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return;
    }

    onImageSelected(imageUrl);
    toast.success('Image added!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-[600px] max-h-[80vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold">Add or Replace Image</h3>
            <p className="text-sm text-gray-500">Choose how you want to add an image</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="search">
              <Search className="w-4 h-4 mr-2" />
              AI Search
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url">
              <LinkIcon className="w-4 h-4 mr-2" />
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div>
              <Label>Search for Educational Images</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="E.g., 'water cycle diagram', 'cell structure'"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchImage()}
                  disabled={searching}
                />
                <Button onClick={handleSearchImage} disabled={searching || !searchQuery.trim()}>
                  {searching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                AI will search for high-quality educational images from reputable sources
              </p>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <Label>Search Results</Label>
                {searchResults.map((url, idx) => (
                  <div key={idx} className="border rounded-lg overflow-hidden">
                    <img src={url} alt="Search result" className="w-full h-48 object-cover" />
                    <div className="p-3 bg-gray-50 flex justify-between items-center">
                      <p className="text-xs text-gray-600 truncate flex-1">{url}</p>
                      <Button
                        size="sm"
                        onClick={() => {
                          onImageSelected(url);
                          toast.success('Image selected!');
                          onClose();
                        }}
                        className="ml-2"
                      >
                        Use This Image
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div>
              <Label>Upload Your Own Image</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400 mb-4">PNG, JPG, GIF up to 10MB</p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="file-upload"
                />
                <Button asChild disabled={uploading}>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </>
                    )}
                  </label>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div>
              <Label>Image URL</Label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="mt-2"
                onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
              />
              <p className="text-xs text-gray-500 mt-2">
                Paste a direct link to an image from the web
              </p>
            </div>

            {imageUrl && imageUrl.startsWith('http') && (
              <div className="border rounded-lg overflow-hidden">
                <img src={imageUrl} alt="Preview" className="w-full h-48 object-cover" onError={() => toast.error('Invalid image URL')} />
                <div className="p-3 bg-gray-50">
                  <p className="text-xs text-gray-600 truncate">{imageUrl}</p>
                </div>
              </div>
            )}

            <Button onClick={handleUrlSubmit} className="w-full" disabled={!imageUrl.trim()}>
              Add Image
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}