import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function FileUploadMode({ onSlidesGenerated }) {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const fileExt = file.name.split('.').pop().toLowerCase();
      
      if (fileExt === 'pptx') {
        setUploadedFile({ url: file_url, name: file.name, type: 'pptx' });
        toast.success('PPTX uploaded! Click "Convert to Slides" to process.');
      } else {
        await processFile(file_url, file.name);
      }
      setUploading(false);
    } catch (error) {
      toast.error('Failed to upload file');
      setUploading(false);
    }
  };

  const convertPptxToSlides = async () => {
    if (!uploadedFile) return;
    
    setProcessing(true);
    try {
      toast.info('Converting PowerPoint to Google Slides...');
      const result = await base44.functions.invoke('convertPptxToGoogleSlides', { file_url: uploadedFile.url });
      
      if (result.data?.error) {
        throw new Error(result.data.error);
      }
      
      if (result.data?.embedUrl) {
        const slide = {
          title: uploadedFile.name.replace('.pptx', ''),
          content: `<div class="professional-slide-stage"><iframe src="${result.data.embedUrl}?start=false&loop=false&delayms=3000" frameborder="0" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe></div>`,
          order: 1
        };
        onSlidesGenerated([slide]);
        toast.success('Converted to Google Slides! You can now view and edit it.');
        setUploadedFile(null);
      } else {
        throw new Error('Failed to generate Google Slides embed URL');
      }
    } catch (error) {
      console.error('PPTX conversion error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Conversion failed';
      toast.error('Failed to convert PPTX: ' + errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  const processFile = async (fileUrl, fileName) => {
    setProcessing(true);
    try {
      const fileExt = fileName.split('.').pop().toLowerCase();
      
      // For other file types, extract structured data
      const extractionResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: fileUrl,
        json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            sections: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  heading: { type: 'string' },
                  content: { type: 'string' },
                  data_points: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      });

      if (extractionResult.status === 'error') {
        throw new Error(extractionResult.details);
      }

      const extractedData = extractionResult.output;

      // Generate slides using AI
      const slideContent = await base44.integrations.Core.InvokeLLM({
        prompt: `Create presentation slides from this data:
        
${JSON.stringify(extractedData, null, 2)}

Generate 5-7 slides with:
- Title slide with main topic
- Content slides with key information
- Data visualization suggestions
- Summary slide

Format each slide with HTML styling for beautiful presentation.`,
        response_json_schema: {
          type: 'object',
          properties: {
            slides: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  content: { type: 'string' },
                  order: { type: 'number' }
                }
              }
            }
          }
        }
      });

      onSlidesGenerated(slideContent.slides || []);
      toast.success('Presentation generated successfully!');
    } catch (error) {
      toast.error('Failed to process file: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Upload Your Data File</h3>
        <p className="text-sm text-gray-600 mb-4">
          Supports CSV, Excel, JSON, PDF, DOCX, and PowerPoint (PPTX) files
        </p>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading || processing}
            className="hidden"
            id="file-upload"
            accept=".csv,.xlsx,.xls,.json,.pdf,.docx,.txt,.pptx"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            {uploading || processing ? (
              <div>
                <Loader2 className="w-12 h-12 text-indigo-600 mx-auto mb-3 animate-spin" />
                <p className="text-gray-900 font-medium">
                  {uploading ? 'Uploading...' : 'Processing file...'}
                </p>
                <p className="text-sm text-gray-500 mt-1">This may take a moment</p>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-900 font-medium mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">CSV, Excel, JSON, PDF, DOCX, PPTX</p>
              </div>
            )}
          </label>
        </div>

        {uploadedFile && uploadedFile.type === 'pptx' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-900">📄 {uploadedFile.name}</p>
                <p className="text-sm text-green-700">Ready to convert</p>
              </div>
              <Button
                onClick={convertPptxToSlides}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  'Convert to Slides'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          How it works
        </h4>
        <ul className="text-sm text-indigo-700 space-y-1">
          <li>• AI extracts key information from your file</li>
          <li>• Automatically creates structured slides</li>
          <li>• Generates charts for numerical data</li>
          <li>• You can edit slides after generation</li>
        </ul>
      </div>
    </div>
  );
}