import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function LabeledIllustration({ data, onImageGenerated }) {
  const [generating, setGenerating] = useState(false);
  const [imageProvider, setImageProvider] = useState(data.imageProvider || 'base44');
  const imageUrl = data.generatedUrl;

  const generateBaseImage = async () => {
    if (!data.baseImagePrompt) return;
    
    setGenerating(true);
    try {
      const providerName = imageProvider === 'dalle' ? 'DALL-E 3' : imageProvider === 'flux2' ? 'Flux 2' : 'Base44 AI';
      toast.info(`Generating with ${providerName}...`);
      
      // Build label text list for the prompt
      const labelTexts = data.labels?.map(l => l.text).join(', ') || '';
      
      const finalPrompt = `${data.baseImagePrompt}. High-quality educational illustration, clean, detailed, isolated on white background. CRITICAL: Include clear, legible text labels for: ${labelTexts}. The text must be perfectly spelled and clearly visible on the image.`;
      
      let result;
      if (imageProvider === 'dalle') {
        result = await base44.functions.invoke('generateImageWithDallE', {
          prompt: finalPrompt,
          size: '1792x1024'
        });
      } else if (imageProvider === 'flux2') {
        result = await base44.functions.invoke('generateImageWithFlux2', {
          prompt: finalPrompt,
          aspect_ratio: '16:9'
        });
      } else if (imageProvider === 'canva') {
        result = await base44.functions.invoke('canvaIntegration', {
          action: 'generate_image',
          prompt: finalPrompt
        });
      } else {
        result = await base44.integrations.Core.GenerateImage({
          prompt: finalPrompt
        });
      }
      
      const url = result.data?.url || result.url;
      if (url) {
        onImageGenerated(url);
        toast.success('Illustration generated with integrated text!');
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
        <p className="text-sm text-slate-500 mb-4 max-w-md italic">"{data.baseImagePrompt}"</p>
        
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button 
            variant={imageProvider === 'base44' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setImageProvider('base44')}
            disabled={generating}
          >
            Base44 AI
          </Button>
          <Button 
            variant={imageProvider === 'dalle' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setImageProvider('dalle')}
            disabled={generating}
          >
            DALL-E 3
          </Button>
          <Button 
            variant={imageProvider === 'flux2' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setImageProvider('flux2')}
            disabled={generating}
          >
            Flux 2
          </Button>
          <Button 
            variant={imageProvider === 'canva' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setImageProvider('canva')}
            disabled={generating}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
          >
            Canva AI
          </Button>
        </div>

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
    <div className="relative w-full min-h-[500px] bg-white rounded-xl overflow-hidden border shadow-sm">
      <img 
        src={imageUrl} 
        alt="Educational diagram" 
        className="w-full h-full object-contain p-2"
      />
    </div>
  );
}