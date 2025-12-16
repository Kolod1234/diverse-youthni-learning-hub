import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, File, FileText, Image as ImageIcon, 
  Presentation, Code, Trash2, Loader2, Download
} from 'lucide-react';
import { toast } from 'sonner';

const FILE_TYPES = {
  pdf: { icon: FileText, color: 'text-red-600', bg: 'bg-red-50' },
  doc: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  docx: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  ppt: { icon: Presentation, color: 'text-orange-600', bg: 'bg-orange-50' },
  pptx: { icon: Presentation, color: 'text-orange-600', bg: 'bg-orange-50' },
  zip: { icon: File, color: 'text-purple-600', bg: 'bg-purple-50' },
  js: { icon: Code, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  py: { icon: Code, color: 'text-blue-600', bg: 'bg-blue-50' },
  html: { icon: Code, color: 'text-orange-600', bg: 'bg-orange-50' },
  css: { icon: Code, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  json: { icon: Code, color: 'text-gray-600', bg: 'bg-gray-50' },
  jpg: { icon: ImageIcon, color: 'text-green-600', bg: 'bg-green-50' },
  jpeg: { icon: ImageIcon, color: 'text-green-600', bg: 'bg-green-50' },
  png: { icon: ImageIcon, color: 'text-green-600', bg: 'bg-green-50' },
  default: { icon: File, color: 'text-gray-600', bg: 'bg-gray-50' }
};

export default function FileUploadManager({ resources = [], onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      
      const results = await Promise.all(uploadPromises);
      
      const newResources = results.map((result, index) => ({
        name: files[index].name,
        url: result.file_url,
        type: files[index].type,
        size: files[index].size
      }));

      onChange([...resources, ...newResources]);
      toast.success(`${files.length} file(s) uploaded successfully!`);
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index) => {
    const updated = resources.filter((_, i) => i !== index);
    onChange(updated);
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const config = FILE_TYPES[ext] || FILE_TYPES.default;
    return config;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      <div>
        <input
          type="file"
          multiple
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
          id="file-upload-manager"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.js,.py,.html,.css,.json,.jpg,.jpeg,.png,.gif,.txt,.md"
        />
        <label htmlFor="file-upload-manager">
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            disabled={uploading}
            onClick={() => document.getElementById('file-upload-manager').click()}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Supplementary Materials
              </>
            )}
          </Button>
        </label>
        <p className="text-xs text-gray-500 mt-2">
          PDFs, slides, code files, images, and documents accepted
        </p>
      </div>

      {resources.length > 0 && (
        <div className="space-y-2">
          {resources.map((resource, index) => {
            const fileConfig = getFileIcon(resource.name);
            const Icon = fileConfig.icon;
            
            return (
              <Card key={index} className="p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-lg ${fileConfig.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${fileConfig.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{resource.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(resource.size)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </a>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRemove(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}