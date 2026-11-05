import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Sparkles, Image as ImageIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CoverPicker({ fileUrl, onCoverChange, currentCover }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // --- Strategy 1: Automatic Extraction (using backend) ---
  const generateAutoCover = async () => {
    if (!fileUrl) return toast.error("Upload a PDF first!");
    
    setIsGenerating(true);
    const toastId = toast.loading('Extracting page 1...');
    try {
      const { data } = await base44.functions.invoke('extractPdfPage', {
        file_url: fileUrl,
        page_number: 0  // 0-indexed, so 0 = first page
      });

      if (!data.success) {
        toast.error(data.error || 'Failed to extract page', { id: toastId });
        return;
      }

      onCoverChange(data.extracted_page_url);
      toast.success("Cover generated from page 1!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to extract page: " + (error.message || 'Unknown error'), { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Strategy 2: Manual Upload ---
  const handleManualUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onCoverChange(file_url);
      toast.success("Manual cover uploaded!");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
      <Label className="text-base font-semibold">Book Cover</Label>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Preview Area */}
        <div className="w-32 h-44 bg-card border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
          {currentCover ? (
            <img src={currentCover} alt="Cover preview" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-8 h-8 text-slate-300" />
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-3">
          <p className="text-xs text-muted-foreground">
            Generate a cover automatically from the first page of your PDF, or upload your own image.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateAutoCover}
              disabled={isGenerating || !fileUrl}
              className="gap-2"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-indigo-500" />}
              Auto-Generate
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="gap-2"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-emerald-500" />}
              Upload Manual
            </Button>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              hidden 
              accept="image/*" 
              onChange={handleManualUpload} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}