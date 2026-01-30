import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Wand2, Copy, Download } from 'lucide-react';

export default function ImageGeneratorModal({ onImageSelect, onClose }) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('illustration');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);

  const styles = [
    'illustration',
    'photograph',
    'digital-art',
    'oil-painting',
    'watercolor',
    'sketch',
    '3d-render',
    'anime',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter an image prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await base44.functions.invoke('generateImageForSlide', {
        prompt: prompt.trim(),
        style,
      });

      if (response.data.success) {
        setGeneratedImage(response.data);
      } else {
        setError(response.data.error || 'Failed to generate image');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsertImage = () => {
    if (generatedImage) {
      onImageSelect(generatedImage.imageUrl);
      onClose();
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const a = document.createElement('a');
      a.href = generatedImage.imageUrl;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Generate Image for Slide</CardTitle>
            <CardDescription>Create AI-powered images for your lessons</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isGenerating}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Prompt Input */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">Image Description</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate... (e.g., 'A diagram showing photosynthesis process with plants and sunlight')"
              disabled={isGenerating}
              className="w-full border border-input rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none"
              rows={4}
            />
          </div>

          {/* Style Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">Style</label>
            <div className="grid grid-cols-4 gap-2">
              {styles.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  disabled={isGenerating}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition capitalize ${
                    style === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Generated Image Preview */}
          {generatedImage && (
            <div className="space-y-3">
              <label className="block text-sm font-medium">Generated Image</label>
              <div className="border border-input rounded-md overflow-hidden bg-gray-50">
                <img
                  src={generatedImage.imageUrl}
                  alt="Generated"
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
              <p className="text-xs text-gray-500">
                Generated: {new Date(generatedImage.timestamp).toLocaleTimeString()}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Generate Image'}
            </Button>

            {generatedImage && (
              <>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {/* Insert Button */}
          {generatedImage && (
            <Button
              onClick={handleInsertImage}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Copy className="w-4 h-4" />
              Insert Image into Lesson
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}