import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function LabeledIllustration({ data, onImageGenerated }) {
  const [generating, setGenerating] = useState(false);
  const imageUrl = data.generatedUrl;

  const generateBaseImage = async () => {
    if (!data.baseImagePrompt) return;
    
    setGenerating(true);
    try {
      toast.info('Generating scientific illustration...');
      
      const result = await base44.functions.invoke('generateImageWithFlux2', {
        prompt: data.baseImagePrompt + ", scientific illustration style, clean, white background, no text, no labels",
        aspect_ratio: '1:1'
      });
      
      const url = result.data?.url;
      if (url) {
        onImageGenerated(url);
        toast.success('Illustration generated!');
      } else {
        toast.error('Failed to generate illustration');
      }
    } catch (error) {
      console.error('Illustration generation error:', error);
      toast.error('Failed to generate illustration');
    } finally {
      setGenerating(false);
    }
  };

  if (!imageUrl) {
    return (
      <div className="w-full h-96 bg-slate-100 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-8">
        <p className="text-sm text-slate-500 mb-4 text-center italic max-w-md">
          {data.baseImagePrompt}
        </p>
        <Button onClick={generateBaseImage} disabled={generating}>
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2"/>
              Generate Scientific Illustration
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] bg-white rounded-xl overflow-hidden border shadow-sm">
      {/* Base image (AI-generated, text-free) */}
      <img 
        src={imageUrl} 
        alt="Scientific diagram" 
        className="w-full h-full object-contain"
      />

      {/* React overlay labels with correct spelling */}
      {data.labels?.map((label, index) => (
        <div
          key={index}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ left: `${label.x}%`, top: `${label.y}%` }}
        >
          {/* Pointer dot */}
          <div className="w-3 h-3 bg-indigo-600 rounded-full border-2 border-white shadow-md mx-auto mb-1"></div>
          {/* Label text */}
          <div className="bg-white/95 backdrop-blur-sm text-xs font-semibold text-indigo-900 px-3 py-1.5 rounded-full shadow-lg border border-indigo-200 whitespace-nowrap">
            {label.text}
          </div>
        </div>
      ))}
    </div>
  );
}