import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { FileText, Upload, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

export default function PowerPointHandler({ onSlidesConverted, onClose }) {
  const [file, setFile] = useState(null);
  const [converting, setConverting] = useState(false);
  const [convertedSlides, setConvertedSlides] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.pptx')) {
      toast.error('Please select a valid .pptx file');
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
  };

  const handleConvert = async () => {
    if (!file) {
      toast.error('Please select a PowerPoint file');
      return;
    }

    setConverting(true);
    const loadingToast = toast.loading('Converting PowerPoint to slides...');

    try {
      // Upload file first
      const uploadResponse = await base44.integrations.Core.UploadFile({
        file: file,
      });

      if (!uploadResponse.file_url) {
        throw new Error('Failed to upload file');
      }

      // Convert PPTX to slides
      const response = await base44.functions.invoke('convertPptxToCustomSlides', {
        fileUrl: uploadResponse.file_url,
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Conversion failed');
      }

      setConvertedSlides(response.data.slides);
      toast.dismiss(loadingToast);
      toast.success(`✨ Converted ${response.data.slideCount} slides!`);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Failed to convert PowerPoint');
      console.error('Conversion error:', error);
    } finally {
      setConverting(false);
    }
  };

  const handleUseSlides = () => {
    if (convertedSlides && onSlidesConverted) {
      onSlidesConverted(convertedSlides);
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-lg">PowerPoint to Slides</h2>
              <p className="text-xs text-gray-600">Convert your PPTX file to lesson slides</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {!convertedSlides ? (
            <>
              {/* File Upload */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold">Select PowerPoint File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept=".pptx"
                    onChange={handleFileSelect}
                    disabled={converting}
                    className="hidden"
                    id="pptx-input"
                  />
                  <label htmlFor="pptx-input" className="cursor-pointer block">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">
                      {file ? `Selected: ${fileName}` : 'Click to select or drag PPTX file'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PowerPoint (.pptx) files only</p>
                  </label>
                </div>
              </div>

              {/* Convert Button */}
              <Button
                onClick={handleConvert}
                disabled={!file || converting}
                className="w-full bg-blue-600 hover:bg-blue-700 h-11"
              >
                {converting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Convert to Slides
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              {/* Conversion Success */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Conversion Complete!</p>
                  <p className="text-sm text-green-700">{convertedSlides.length} slides extracted</p>
                </div>
              </div>

              {/* Slides Preview */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold">Preview Slides</label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {convertedSlides.map((slide, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-blue-700">{idx + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{slide.title}</p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{slide.content.replace(/<[^>]*>/g, '')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setConvertedSlides(null);
                    setFile(null);
                    setFileName('');
                  }}
                  className="flex-1"
                >
                  Convert Another
                </Button>
                <Button
                  onClick={handleUseSlides}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Use These Slides
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}