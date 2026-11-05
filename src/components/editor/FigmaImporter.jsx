import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Loader2, Download, ExternalLink, Layers, Sparkles } from 'lucide-react';

export default function FigmaImporter({ onImport, onClose }) {
  const [figmaUrl, setFigmaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const handleImportFigma = async () => {
    if (!figmaUrl.trim()) {
      toast.error('Please enter a Figma file URL');
      return;
    }

    setLoading(true);
    try {
      toast.info('Importing Figma design...');
      
      const result = await base44.functions.invoke('importFigmaDesign', {
        figmaUrl: figmaUrl.trim()
      });

      if (result?.data?.images && result.data.images.length > 0) {
        const slides = result.data.images.map((img, idx) => ({
          title: img.name || `Figma Frame ${idx + 1}`,
          content: `<div style="text-align: center; padding: 20px;">
            <h2 style="color: #1A3C5A; font-size: 32px; font-weight: 700; margin-bottom: 20px;">${img.name || 'Imported from Figma'}</h2>
            <img src="${img.url}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="${img.name}" />
            <p style="color: #6B7280; font-size: 14px; margin-top: 12px; font-style: italic;">Imported from Figma</p>
          </div>`,
          order: idx + 1
        }));

        onImport(slides);
        toast.success(`Imported ${slides.length} frame(s) from Figma!`);
        onClose();
      } else {
        toast.error('No frames found in Figma file');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import Figma design: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFigma = () => {
    window.open('https://www.figma.com/', '_blank');
    toast.info('Copy the file URL from Figma and paste it here');
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            Import from Figma
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Import frames from your Figma designs as presentation slides
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* How it works */}
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <h4 className="font-semibold text-pink-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              How it works
            </h4>
            <ol className="text-sm text-pink-800 space-y-1 list-decimal list-inside">
              <li>Open your Figma file</li>
              <li>Copy the file URL from your browser</li>
              <li>Paste the URL here</li>
              <li>All frames will be imported as slides</li>
            </ol>
          </div>

          {/* Input */}
          <div>
            <Label>Figma File URL</Label>
            <Input
              value={figmaUrl}
              onChange={(e) => setFigmaUrl(e.target.value)}
              placeholder="https://www.figma.com/file/..."
              className="mt-2"
              disabled={loading}
              onKeyPress={(e) => e.key === 'Enter' && handleImportFigma()}
            />
            <p className="text-xs text-gray-500 mt-2">
              Paste the full Figma file URL
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleOpenFigma}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Figma
            </Button>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-pink-50 to-orange-50 border border-pink-200 rounded-lg p-4">
            <h4 className="font-semibold text-pink-900 mb-2">Pro Tips</h4>
            <ul className="text-sm text-pink-800 space-y-1">
              <li>• Works with shared Figma files (requires access token)</li>
              <li>• Each top-level frame becomes a slide</li>
              <li>• Exports frames as high-quality PNG images</li>
              <li>• Best for presentation mockups and designs</li>
            </ul>
          </div>

          {/* Requirements notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              ⚠️ Figma Personal Access Token required. Set FIGMA_ACCESS_TOKEN in secrets.
            </p>
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
            onClick={handleImportFigma}
            disabled={loading || !figmaUrl.trim()}
            className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Import Frames
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}