import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ContentBlockEditor({ block, onUpdate }) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onUpdate({ url: file_url });
      toast.success('File uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  switch (block.type) {
    case 'text':
      return (
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">Text Content</label>
          <Textarea
            value={block.content || ''}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Enter text content..."
            rows={4}
            className="w-full"
          />
        </div>
      );

    case 'image':
      return (
        <div className="space-y-3">
          <label className="text-xs font-medium text-gray-700">Image Block</label>
          {block.url ? (
            <div className="space-y-2">
              <img 
                src={block.url} 
                alt={block.alt || 'Image'} 
                className="w-full rounded-lg border"
              />
              <Input
                value={block.alt || ''}
                onChange={(e) => onUpdate({ alt: e.target.value })}
                placeholder="Alt text (optional)"
                className="text-sm"
              />
              <Button
                onClick={() => onUpdate({ url: '', alt: '' })}
                variant="outline"
                size="sm"
              >
                Remove Image
              </Button>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id={`image-upload-${block.id}`}
                disabled={uploading}
              />
              <label htmlFor={`image-upload-${block.id}`}>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={uploading}
                  asChild
                >
                  <span>
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </>
                    )}
                  </span>
                </Button>
              </label>
              <p className="text-xs text-gray-500 mt-2">Or enter image URL:</p>
              <Input
                value={block.url || ''}
                onChange={(e) => onUpdate({ url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="mt-1"
              />
            </div>
          )}
        </div>
      );

    case 'video':
      return (
        <div className="space-y-3">
          <label className="text-xs font-medium text-gray-700">Video Block</label>
          {block.url ? (
            <div className="space-y-2">
              <video 
                src={block.url} 
                controls 
                className="w-full rounded-lg border"
              />
              <Button
                onClick={() => onUpdate({ url: '' })}
                variant="outline"
                size="sm"
              >
                Remove Video
              </Button>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
                id={`video-upload-${block.id}`}
                disabled={uploading}
              />
              <label htmlFor={`video-upload-${block.id}`}>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={uploading}
                  asChild
                >
                  <span>
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Video
                      </>
                    )}
                  </span>
                </Button>
              </label>
              <p className="text-xs text-gray-500 mt-2">Or enter video URL:</p>
              <Input
                value={block.url || ''}
                onChange={(e) => onUpdate({ url: e.target.value })}
                placeholder="https://example.com/video.mp4"
                className="mt-1"
              />
            </div>
          )}
        </div>
      );

    case 'code':
      return (
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">Code Block</label>
          <Input
            value={block.language || 'javascript'}
            onChange={(e) => onUpdate({ language: e.target.value })}
            placeholder="Language (e.g., javascript, python)"
            className="mb-2"
          />
          <Textarea
            value={block.content || ''}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Enter code..."
            rows={6}
            className="font-mono text-sm"
          />
        </div>
      );

    default:
      return null;
  }
}