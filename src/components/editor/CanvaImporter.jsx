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

  const handleImportDesign = async () => {
    if (!canvaUrl.trim()) {
      toast.error('Please enter a Canva design URL');
      return;
    }

    setLoading(true);
    try {
      toast.info('Importing from Canva...');
      
      const result = await base44.functions.invoke('canvaIntegration', {
        action: 'import_design',
        canvaUrl: canvaUrl.trim()
      });

      if (result?.data?.images && result.data.images.length > 0) {
        const slides = result.data.images.map((imageUrl, idx) => ({
          title: `Canva Design ${idx + 1}`,
          content: `<div style="text-align: center; padding: 20px;">
            <img src="${imageUrl}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Canva Design" />
            <p style="color: #6B7280; font-size: 14px; margin-top: 12px; font-style: italic;">Imported from Canva</p>
          </div>`,
          order: idx + 1
        }));

        onImport(slides);
        toast.success(`Imported ${slides.length} slide(s) from Canva!`);
        onClose();
      } else {
        toast.error('No images found in Canva design');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error.response?.data?.error || 'Failed to import from Canva. Make sure you have access to this design.');
    } finally {
      setLoading(false);
    }
  };

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
          <img src="${result.file_url}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Canva Design" />
        </div>`,
        order: 1
      }];

      onImport(slides);
      toast.success('Design uploaded successfully!');
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
              <li>Copy the design URL from your browser</li>
              <li>Paste it below - we'll automatically download and convert it</li>
              <li>All pages will be imported as slides</li>
            </ol>
          </div>

          {/* URL Input */}
          <div>
            <Label>Canva Design URL</Label>
            <Input
              value={canvaUrl}
              onChange={(e) => setCanvaUrl(e.target.value)}
              placeholder="https://www.canva.com/design/ABC123/..."
              className="mt-2"
              disabled={loading}
              onKeyPress={(e) => e.key === 'Enter' && handleImportDesign()}
            />
            <p className="text-xs text-gray-500 mt-2">
              Paste your Canva design URL
            </p>
          </div>

          {/* OR Manual Upload */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or upload manually</span>
            </div>
          </div>

          <div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
              <FileImage className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-3">Upload downloaded Canva design</p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={loading}
                className="hidden"
                id="canva-upload"
              />
              <Button asChild variant="outline" size="sm" disabled={loading}>
                <label htmlFor="canva-upload" className="cursor-pointer">
                  Choose File
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
            <h4 className="font-semibold text-purple-900 mb-2">Pro Tips</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• URL import automatically downloads all pages</li>
              <li>• Works with presentations and single designs</li>
              <li>• Make sure your design is accessible (not private)</li>
              <li>• Multi-page designs become multiple slides</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleImportDesign}
            disabled={loading || !canvaUrl.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Import from URL
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}