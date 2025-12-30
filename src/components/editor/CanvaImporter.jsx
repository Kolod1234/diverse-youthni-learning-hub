import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Loader2, Download, ExternalLink, FileImage, Sparkles } from 'lucide-react';

export default function CanvaImporter({ onImport, onClose }) {
  const [canvaUrl, setCanvaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setLoading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      
      const slides = [{
        title: file.name.replace(/\.[^/.]+$/, ''),
        content: `<div style="text-align: center; padding: 20px;">
          <h2 style="color: #1A3C5A; font-size: 32px; font-weight: 700; margin-bottom: 20px;">Imported from Canva</h2>
          <img src="${result.file_url}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Canva Design" />
        </div>`,
        order: 1
      }];

      onImport(slides);
      toast.success('Canva design imported successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCanva = () => {
    window.open('https://www.canva.com/folder/all-designs', '_blank');
    toast.info('Copy the design URL and paste it here');
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <FileImage className="w-4 h-4 text-white" />
            </div>
            Import Canva Design
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Import your existing Canva designs as presentation templates
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* How it works */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              How it works
            </h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Open your Canva design</li>
              <li>Click "Share" → "Download" → Choose PNG or JPG</li>
              <li>Download the design to your computer</li>
              <li>Upload it below to add to your slides</li>
            </ol>
          </div>

          {/* Upload section */}
          <div>
            <Label>Upload Canva Design</Label>
            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
              <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">Download from Canva, then upload here</p>
              <p className="text-xs text-gray-400 mb-4">PNG or JPG format</p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={loading}
                className="hidden"
                id="canva-upload"
              />
              <Button asChild disabled={loading}>
                <label htmlFor="canva-upload" className="cursor-pointer">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Choose File
                    </>
                  )}
                </label>
              </Button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleOpenCanva}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Canva
            </Button>
          </div>



          {/* Tips */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2">💡 Pro Tips</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Download your design from Canva as PNG for best quality</li>
              <li>• For presentations, download each page separately</li>
              <li>• High-resolution exports look best on slides</li>
              <li>• Transparent backgrounds work great for overlays</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={loading}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}