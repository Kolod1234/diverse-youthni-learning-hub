import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Loader2, Image as ImageIcon, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AIGenerateMode({ onSlidesGenerated }) {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [includeImages, setIncludeImages] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(false);
  const [deepResearch, setDeepResearch] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generateSlides = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setGenerating(true);
    try {
      toast.info('Generating slide structure...');

      // Step 1: Generate slide structure 
      // We ask for CLEAN content so we can style it ourselves in React
      const prompt = `Create an educational presentation about "${topic}".
  ${description ? `Additional context: ${description}` : ''}

  Generate exactly ${slideCount} slides.

  Format requirements for 'content':
  - Return semantic HTML (<ul>, <li>, <p>, <strong>)
  - DO NOT use inline styles (style="...")
  - DO NOT include <img> tags in the content
  - Keep text concise (bullet points preferred)

  For each slide return:
  - title: string
  - content: html string
  - imagePrompt: string (visual description for an image)

  Return JSON with a "slides" array.`;

      const slideData = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: deepResearch,
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
                  imagePrompt: { type: 'string' }
                }
              }
            }
          }
        }
      });

      let slides = slideData.slides || [];

      // Step 2: Generate images
      if (includeImages) {
        toast.info('Generating slide visuals...');

        const imagePromises = slides.map(async (slide, idx) => {
          // If no prompt, just return the slide as is
          if (!slide.imagePrompt) return { ...slide, order: idx + 1 };

          try {
            console.log(`Generating image for slide ${idx + 1}:`, slide.imagePrompt);

            const imageResult = await base44.functions.invoke('generateImageWithManus', {
              prompt: `Educational diagram, flat vector style, white background: ${slide.imagePrompt}`,
              aspect_ratio: '16:9' // or '4:3' depending on your slide shape
            });

            console.log(`Result for slide ${idx + 1}:`, imageResult);

            // Check for URL in likely locations (adjust based on your actual API response)
            const imageUrl = imageResult.data?.url || imageResult?.url || imageResult?.response?.url;

            if (imageUrl) {
              return { 
                ...slide, 
                imageUrl: imageUrl, // Store image SEPARATELY, don't inject into HTML
                order: idx + 1 
              };
            } else {
              console.warn('Image generated but no URL found in response', imageResult);
              return { ...slide, order: idx + 1 };
            }
          } catch (error) {
            console.error(`Image gen failed for slide ${idx + 1}:`, error);
            // Return slide without image rather than failing completely
            return { ...slide, order: idx + 1 };
          }
        });

        slides = await Promise.all(imagePromises);
      } else {
        slides = slides.map((slide, idx) => ({ ...slide, order: idx + 1 }));
      }

      onSlidesGenerated(slides);
      toast.success('Presentation generated!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate slides: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">AI-Powered Slide Generation</h3>
        
        <div className="space-y-4">
          <div>
            <Label>Topic *</Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Photosynthesis, World War II, Python Programming"
              disabled={generating}
            />
          </div>

          <div>
            <Label>Additional Details (Optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide additional context, specific areas to cover, or learning objectives..."
              rows={3}
              disabled={generating}
            />
          </div>

          <div>
            <Label>Number of Slides</Label>
            <Input
              type="number"
              value={slideCount}
              onChange={(e) => setSlideCount(Math.max(3, Math.min(20, parseInt(e.target.value) || 5)))}
              min={3}
              max={20}
              disabled={generating}
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <Label className="cursor-pointer">Generate Images</Label>
              </div>
              <Switch
                checked={includeImages}
                onCheckedChange={setIncludeImages}
                disabled={generating}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                <Label className="cursor-pointer">Include Data Visualizations</Label>
              </div>
              <Switch
                checked={includeCharts}
                onCheckedChange={setIncludeCharts}
                disabled={generating}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <Label className="cursor-pointer">Deep Research Mode</Label>
              </div>
              <Switch
                checked={deepResearch}
                onCheckedChange={setDeepResearch}
                disabled={generating}
              />
            </div>
          </div>
        </div>

        <Button
          onClick={generateSlides}
          disabled={generating || !topic.trim()}
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Slides...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Presentation
            </>
          )}
        </Button>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Features
        </h4>
        <ul className="text-sm text-indigo-700 space-y-1">
          <li>• AI-generated content with proper formatting</li>
          <li>• Professional images tailored to your topic</li>
          <li>• Modern slide layouts with rich typography</li>
          <li>• Deep research mode for comprehensive content</li>
          <li>• Fully editable after generation</li>
        </ul>
      </div>
    </div>
  );
}