import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';

export default function RiseImportDialog({ courseId, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    setIsImporting(true);
    try {
      setProgress(25);
      
      // Upload file first
      const uploadResponse = await base44.integrations.Core.UploadFile({
        file: file,
      });
      
      setProgress(50);

      // Import Rise module
      const importResponse = await base44.functions.invoke('importRiseModule', {
        courseId,
        fileUrl: uploadResponse.file_url,
        fileName: file.name,
      });

      setProgress(100);
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (error) {
      alert('Import failed: ' + error.message);
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Import Rise Module</CardTitle>
            <CardDescription>Upload your Articulate Rise course file</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isImporting}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* File Input */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition">
            <input
              type="file"
              accept=".zip,.pptx"
              onChange={handleFileSelect}
              disabled={isImporting}
              className="hidden"
              id="rise-file"
            />
            <label htmlFor="rise-file" className="cursor-pointer block">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium">{file?.name || 'Click to select file'}</p>
              <p className="text-xs text-gray-500">ZIP or PPTX file</p>
            </label>
          </div>

          {/* Progress Bar */}
          {isImporting && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleImport}
              disabled={!file || isImporting}
              className="flex-1"
            >
              {isImporting ? 'Importing...' : 'Import'}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isImporting}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}