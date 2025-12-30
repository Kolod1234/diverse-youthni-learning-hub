import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Search, Loader2, X, Link as LinkIcon, Image as ImageIcon, Palette, Ratio } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function ImageManager({ onImageSelected, onClose, slideTitle, slideContent }) {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [imageStyle, setImageStyle] = useState('photographic');
  const [aspectRatio, setAspectRatio] = useState('landscape');
  const [reverseSearchFile, setReverseSearchFile] = useState(null);

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
        slideContent,
        style: imageStyle,
        aspectRatio: aspectRatio
      });

      if (result?.data?.images && result.data.images.length > 0) {
        setSearchResults(result.data.images);
        toast.success(`Found ${result.data.images.length} images!`);
      } else {
        toast.error('No images found. Try a different query.');
      }
    } catch (error) {
      toast.error('Failed to search for image');
    } finally {
      setSearching(false);
    }
  };

  const handleReverseImageSearch = async (file) => {
    if (!file) return;

    setSearching(true);
    try {
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      
      const result = await base44.functions.invoke('reverseImageSearch', {
        imageUrl: uploadResult.file_url,
        slideTitle,
        slideContent,
        style: imageStyle
      });

      if (result?.data?.images && result.data.images.length > 0) {
        setSearchResults(result.data.images);
        toast.success(`Found ${result.data.images.length} similar images!`);
      } else {
        toast.error('No similar images found.');
      }
    } catch (error) {
      toast.error('Failed to search for similar images');
    } finally {
      setSearching(false);
      setReverseSearchFile(null);
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
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="search">
              <Search className="w-4 h-4 mr-2" />
              AI Search
            </TabsTrigger>
            <TabsTrigger value="reverse">
              <ImageIcon className="w-4 h-4 mr-2" />
              Similar
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Palette className="w-4 h-4" />
                  Image Style
                </Label>
                <select 
                  value={imageStyle} 
                  onChange={(e) => setImageStyle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  disabled={searching}
                >
                  <option value="photographic">📷 Photographic</option>
                  <option value="diagram">📊 Diagram</option>
                  <option value="illustrative">🎨 Illustration</option>
                  <option value="abstract">🌀 Abstract</option>
                </select>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Ratio className="w-4 h-4" />
                  Aspect Ratio
                </Label>
                <select 
                  value={aspectRatio} 
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  disabled={searching}
                >
                  <option value="landscape">🖼️ Landscape</option>
                  <option value="portrait">📱 Portrait</option>
                  <option value="square">⬜ Square</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                💡 AI searches Google for diverse, high-quality images matching your style and ratio preferences
              </p>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                <Label>Search Results ({searchResults.length} images)</Label>
                {searchResults.map((result, idx) => (
                  <div key={idx} className="border rounded-lg overflow-hidden hover:border-indigo-400 transition-colors">
                    <img src={result.url || result} alt="Search result" className="w-full h-48 object-cover" />
                    <div className="p-3 bg-gray-50">
                      {result.description && (
                        <p className="text-sm font-medium text-gray-800 mb-1">{result.description}</p>
                      )}
                      {result.source && (
                        <p className="text-xs text-gray-500 mb-2">Source: {result.source}</p>
                      )}
                      <div className="flex justify-between items-center gap-2">
                        <p className="text-xs text-gray-600 truncate flex-1">{result.url || result}</p>
                        <Button
                          size="sm"
                          onClick={() => {
                            onImageSelected(result.url || result);
                            toast.success('Image selected!');
                            onClose();
                          }}
                        >
                          Use Image
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reverse" className="space-y-4">
            <div>
              <Label>Find Similar Images</Label>
              <p className="text-sm text-gray-600 mb-4">Upload an image to find similar educational images</p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">Upload an image to find similar ones</p>
                <p className="text-xs text-gray-400 mb-4">PNG, JPG, GIF up to 10MB</p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setReverseSearchFile(file);
                      handleReverseImageSearch(file);
                    }
                  }}
                  disabled={searching}
                  className="hidden"
                  id="reverse-search-upload"
                />
                <Button asChild disabled={searching}>
                  <label htmlFor="reverse-search-upload" className="cursor-pointer">
                    {searching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Image
                      </>
                    )}
                  </label>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Palette className="w-4 h-4" />
                  Preferred Style
                </Label>
                <select 
                  value={imageStyle} 
                  onChange={(e) => setImageStyle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  disabled={searching}
                >
                  <option value="photographic">📷 Photographic</option>
                  <option value="diagram">📊 Diagram</option>
                  <option value="illustrative">🎨 Illustration</option>
                  <option value="abstract">🌀 Abstract</option>
                </select>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Ratio className="w-4 h-4" />
                  Aspect Ratio
                </Label>
                <select 
                  value={aspectRatio} 
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  disabled={searching}
                >
                  <option value="landscape">🖼️ Landscape</option>
                  <option value="portrait">📱 Portrait</option>
                  <option value="square">⬜ Square</option>
                </select>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                <Label>Similar Images ({searchResults.length} found)</Label>
                {searchResults.map((result, idx) => (
                  <div key={idx} className="border rounded-lg overflow-hidden hover:border-indigo-400 transition-colors">
                    <img src={result.url || result} alt="Similar image" className="w-full h-48 object-cover" />
                    <div className="p-3 bg-gray-50">
                      {result.description && (
                        <p className="text-sm font-medium text-gray-800 mb-1">{result.description}</p>
                      )}
                      {result.source && (
                        <p className="text-xs text-gray-500 mb-2">Source: {result.source}</p>
                      )}
                      <div className="flex justify-between items-center gap-2">
                        <p className="text-xs text-gray-600 truncate flex-1">{result.url || result}</p>
                        <Button
                          size="sm"
                          onClick={() => {
                            onImageSelected(result.url || result);
                            toast.success('Image selected!');
                            onClose();
                          }}
                        >
                          Use Image
                        </Button>
                      </div>
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