import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Loader2, ExternalLink, Download, Sparkles } from 'lucide-react';

export default function CanvaIntegration({ onImageImported, onClose }) {
  const [loading, setLoading] = useState(false);
  const [canvaUrl, setCanvaUrl] = useState('');

  const handleOpenCanva = () => {
    window.open('https://www.canva.com/', '_blank');
    toast.info('Create your design in Canva, then download and upload it here');
  };

  const handleDirectLink = () => {
    window.open('https://www.canva.com/create', '_blank');
    toast.info('Start creating - download your design when done and upload it here');
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
      onImageImported(result.file_url);
      toast.success('Canva design imported successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            Design with Canva
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Create professional designs with Canva and import them into your slide
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quick Start Guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Quick Start</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Click "Open Canva" to create your design</li>
              <li>Design your slide, infographic, or diagram</li>
              <li>Download your design as PNG or JPG</li>
              <li>Upload it below to add to your slide</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleOpenCanva}
              className="h-24 flex-col gap-2 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <ExternalLink className="w-6 h-6" />
              <span className="text-sm font-semibold">Open Canva</span>
            </Button>

            <Button
              onClick={handleDirectLink}
              variant="outline"
              className="h-24 flex-col gap-2 border-2 hover:bg-gray-50"
            >
              <Sparkles className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-semibold">Go to Canva.com</span>
            </Button>
          </div>

          {/* Upload Section */}
          <div className="border-t pt-4">
            <label className="block mb-2">
              <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Upload Your Canva Design
              </span>
              <span className="text-xs text-gray-500 block mt-1">
                After creating your design in Canva, download it and upload here
              </span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={loading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-50 file:to-blue-50 file:text-purple-700 hover:file:bg-gradient-to-r hover:file:from-purple-100 hover:file:to-blue-100 cursor-pointer"
            />
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2">Pro Tips</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Use Canva's education templates for quick professional designs</li>
              <li>• Download as PNG for best quality in your slides</li>
              <li>• Create diagrams, infographics, and visual aids easily</li>
              <li>• Canva has thousands of free educational graphics</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}