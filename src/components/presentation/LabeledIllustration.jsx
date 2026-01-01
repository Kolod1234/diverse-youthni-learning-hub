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

      {/* Render labels with professional textbook styling */}
      {data.labels?.map((label, index) => {
        const labelType = label.type || 'pointer';
        
        // STYLE A: SECTION HEADERS (Large, Bold, Clean - like "Meiosis I")
        if (labelType === 'header') {
          return (
            <div
              key={index}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 w-48 text-left"
              style={{ left: `${label.x}%`, top: `${label.y}%` }}
            >
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none border-l-4 border-indigo-600 pl-3">
                {label.text}
              </h3>
            </div>
          );
        }
        
        // STYLE B: STEP TITLES (Medium weight, centered - like "Prophase I")
        if (labelType === 'subtext') {
          return (
            <div
              key={index}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${label.x}%`, top: `${label.y}%` }}
            >
              <p className="text-sm font-bold text-slate-700 uppercase tracking-wide text-center bg-white/50 backdrop-blur-sm px-2 py-1 rounded">
                {label.text}
              </p>
            </div>
          );
        }
        
        // STYLE C: POINTERS (Small with dot and line - like "Centromere")
        return (
          <div
            key={index}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group"
            style={{ left: `${label.x}%`, top: `${label.y}%` }}
          >
            <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full ring-4 ring-indigo-100 z-10" />
            <div className="h-4 w-0.5 bg-indigo-200" />
            <div className="bg-white text-xs font-semibold text-slate-700 px-3 py-1 rounded shadow-sm border border-slate-200 whitespace-nowrap">
              {label.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}