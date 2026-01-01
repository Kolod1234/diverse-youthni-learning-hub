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
      toast.info('Generating educational illustration...');
      
      const finalPrompt = `${data.baseImagePrompt}. High-quality educational illustration, clean, detailed, isolated on white background. IMPORTANT: Do not include any text, letters, numbers, or arrows in the image itself.`;
      
      const result = await base44.functions.invoke('generateImageWithFlux2', {
        prompt: finalPrompt,
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
      <div className="w-full h-[400px] bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center">
        <Sparkles className="w-10 h-10 text-indigo-400 mb-4" />
        <h3 className="font-semibold text-slate-700">Visual Diagram Needed</h3>
        <p className="text-sm text-slate-500 mb-6 max-w-md italic">"{data.baseImagePrompt}"</p>
        <Button onClick={generateBaseImage} disabled={generating}>
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2"/>
              Generate Diagram
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[4/3] md:aspect-[16/9] bg-white rounded-xl overflow-hidden border shadow-sm">
      <img 
        src={imageUrl} 
        alt="Educational diagram" 
        className="w-full h-full object-contain p-4"
      />

      {/* Render labels with different styles based on type */}
      {data.labels?.map((label, index) => {
        const labelType = label.type || 'pointer';
        
        return (
          <div
            key={index}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `${label.x}%`, top: `${label.y}%` }}
          >
            {labelType === 'header' ? (
              // Header Style - Main sections
              <div className="bg-slate-900/90 text-white px-4 py-1.5 rounded-md font-bold text-sm shadow-xl backdrop-blur-md border border-slate-700">
                {label.text}
              </div>
            ) : labelType === 'subtext' ? (
              // Subtext Style - Additional details
              <div className="bg-yellow-50/90 text-yellow-800 px-3 py-1 rounded-sm text-xs font-medium border border-yellow-200 shadow-sm">
                {label.text}
              </div>
            ) : (
              // Default Pointer Style - Specific parts
              <>
                <div className="w-3 h-3 bg-indigo-600 rounded-full border-2 border-white shadow-sm z-20 relative ring-2 ring-indigo-600/20" />
                <div className="absolute top-4 bg-white/95 backdrop-blur text-xs font-semibold text-slate-800 px-3 py-1.5 rounded-md shadow-md border border-slate-200 whitespace-nowrap z-10">
                  {label.text}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}