import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Search, X, Image, Video, Music, Loader2, Sparkles, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { activateOnKey } from '@/lib/a11y';

export default function MediaLibrary({ isOpen, onClose, onSelectMedia }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: mediaFiles = [], isLoading } = useQuery({
    queryKey: ['media-library'],
    queryFn: () => base44.entities.MediaLibrary.list('-created_date', 1000),
    enabled: isOpen
  });

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      
      const fileType = file.type.startsWith('image/') ? 'image' 
        : file.type.startsWith('video/') ? 'video'
        : file.type.startsWith('audio/') ? 'audio' : 'image';

      toast.info('Analyzing media with AI...');
      const analysisResult = await base44.functions.invoke('analyzeMediaWithAI', {
        file_url: uploadResult.file_url,
        file_type: fileType
      });

      const mediaData = {
        file_url: uploadResult.file_url,
        file_name: file.name,
        file_type: fileType,
        mime_type: file.type,
        file_size: file.size,
        ai_tags: analysisResult.data?.tags || [],
        ai_description: analysisResult.data?.description || '',
        thumbnail_url: fileType === 'image' ? uploadResult.file_url : null
      };

      return base44.entities.MediaLibrary.create(mediaData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      toast.success('Media uploaded and tagged!');
    }
  });

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        await uploadMutation.mutateAsync(file);
      }
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredMedia = mediaFiles.filter(media => {
    const matchesType = selectedType === 'all' || media.file_type === selectedType;
    const matchesSearch = !searchQuery || 
      media.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      media.ai_tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      media.ai_description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      default: return <Image className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Media Library
          </DialogTitle>
        </DialogHeader>

        {/* Upload Section */}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,audio/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading & Analyzing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Media
              </>
            )}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, tags, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-1 border rounded-lg p-1">
            {['all', 'image', 'video', 'audio'].map(type => (
              <Button
                key={type}
                size="sm"
                variant={selectedType === type ? 'default' : 'ghost'}
                onClick={() => setSelectedType(type)}
                className="text-xs"
              >
                {type === 'all' ? 'All' : type}
              </Button>
            ))}
          </div>
        </div>

        {/* Media Grid */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Upload className="w-12 h-12 mb-2" />
              <p className="text-sm">No media files found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4">
              {filteredMedia.map((media) => (
                <div role="button" tabIndex={0} onKeyDown={activateOnKey}
                  key={media.id}
                  className="group relative border rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    onSelectMedia(media);
                    onClose();
                  }}
                >
                  {/* Preview */}
                  <div className="aspect-video bg-gray-100 flex items-center justify-center relative overflow-hidden">
                    {media.file_type === 'image' ? (
                      <img 
                        src={media.thumbnail_url || media.file_url} 
                        alt={media.file_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100">
                        {getFileIcon(media.file_type)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      {getFileIcon(media.file_type)}
                      <p className="text-xs font-medium truncate flex-1">{media.file_name}</p>
                    </div>
                    
                    {media.ai_description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{media.ai_description}</p>
                    )}

                    {media.ai_tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {media.ai_tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {media.ai_tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{media.ai_tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Select overlay */}
                  <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <Plus className="w-8 h-8 text-white" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}