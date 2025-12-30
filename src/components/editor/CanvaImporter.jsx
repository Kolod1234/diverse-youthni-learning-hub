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
      toast.error('Please enter a Canva design URL or ID');
      return;
    }

    setLoading(true);
    try {
      toast.info('Importing Canva design...');
      
      const result = await base44.functions.invoke('canvaIntegration', {
        action: 'import_design',
        canvaUrl: canvaUrl.trim()
      });

      if (result?.data?.export) {
        const exportData = result.data.export;
        const designData = result.data.design;
        
        setPreviewData({ exportData, designData });
        
        // Convert Canva export to slides
        if (exportData.job?.url || exportData.url) {
          const imageUrl = exportData.job?.url || exportData.url;
          
          // Create slides from the exported design
          const slides = [{
            title: designData?.title || 'Imported from Canva',
            content: `<div style="text-align: center; padding: 20px;">
              <h2 style="color: #1A3C5A; font-size: 32px; font-weight: 700; margin-bottom: 20px;">${designData?.title || 'Imported Design'}</h2>
              <img src="${imageUrl}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Canva Design" />
              <p style="color: #6B7280; font-size: 14px; margin-top: 12px; font-style: italic;">Imported from Canva</p>
            </div>`,
            order: 1
          }];

          onImport(slides);
          toast.success('Canva design imported successfully!');
          onClose();
        } else {
          toast.error('Unable to extract design content');
        }
      } else {
        toast.error('Failed to import Canva design');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import design: ' + (error.message || 'Unknown error'));
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
              <li>Open your Canva design or click "Browse Designs" below</li>
              <li>Copy the design URL from your browser</li>
              <li>Paste the URL here to import</li>
              <li>We'll extract the design and add it to your slides</li>
            </ol>
          </div>

          {/* Input */}
          <div>
            <Label>Canva Design URL or ID</Label>
            <Input
              value={canvaUrl}
              onChange={(e) => setCanvaUrl(e.target.value)}
              placeholder="https://www.canva.com/design/ABC123/..."
              className="mt-2"
              disabled={loading}
              onKeyPress={(e) => e.key === 'Enter' && handleImportDesign()}
            />
            <p className="text-xs text-gray-500 mt-2">
              Paste the full Canva design URL or just the design ID
            </p>
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
              Browse Designs
            </Button>
          </div>

          {/* Preview if available */}
          {previewData && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Preview: {previewData.designData?.title || 'Canva Design'}
              </p>
              <p className="text-xs text-gray-600">
                Design will be imported as a slide with the original image and styling
              </p>
            </div>
          )}

          {/* Tips */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2">💡 Pro Tips</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Works with any Canva design you have access to</li>
              <li>• Presentation designs work best for multi-slide imports</li>
              <li>• Individual designs become single slides</li>
              <li>• Maintains original Canva styling and layout</li>
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
                Import Design
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}