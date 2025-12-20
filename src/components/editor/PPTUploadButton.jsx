import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileUp, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function PPTUploadButton({ onSlidesConverted }) {
  const [isConverting, setIsConverting] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    const validTypes = [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(ppt|pptx)$/i)) {
      toast.error('Please upload a PowerPoint file (.ppt or .pptx)');
      return;
    }

    setIsConverting(true);
    toast.loading('Converting PowerPoint to slides...', { id: 'ppt-convert' });

    try {
      // Upload file
      console.log('Uploading file...', file.name);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      console.log('File uploaded:', file_url);

      // Convert PPT to slides
      console.log('Converting PPT to slides...');
      const response = await base44.functions.invoke('convertPPTToSlides', {
        fileUrl: file_url
      });

      console.log('Function response:', response);

      if (response.data.success && response.data.slides) {
        console.log('Conversion successful, slides:', response.data.slides);
        onSlidesConverted(response.data.slides);
        toast.success(`Successfully converted ${response.data.slides.length} slides!`, { id: 'ppt-convert' });
      } else {
        console.error('Conversion failed:', response.data);
        throw new Error(response.data.error || 'Conversion failed');
      }
    } catch (error) {
      console.error('PPT conversion error:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.message || 'Failed to convert PowerPoint. Please try again.', { id: 'ppt-convert' });
    } finally {
      setIsConverting(false);
      event.target.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        onChange={handleFileUpload}
        className="hidden"
        id="ppt-upload"
        disabled={isConverting}
      />
      <label htmlFor="ppt-upload">
        <Button 
          type="button"
          variant="outline" 
          size="sm"
          disabled={isConverting}
          asChild
        >
          <span className="cursor-pointer">
            {isConverting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <FileUp className="w-4 h-4 mr-2" />
                Upload PPT
              </>
            )}
          </span>
        </Button>
      </label>
    </div>
  );
}