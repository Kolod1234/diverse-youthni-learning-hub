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
      toast.info('Generating slides with AI...');

      // Step 1: Generate slide structure and content
      const prompt = `Create an educational presentation about "${topic}".
${description ? `Additional context: ${description}` : ''}

Generate exactly ${slideCount} slides with the following structure:
1. Title slide with compelling main title and subtitle
2. ${slideCount - 2} content slides with detailed information
3. Summary/conclusion slide

CRITICAL FORMATTING REQUIREMENTS:
- Return ONLY valid HTML content
- Use HTML tags for formatting: <strong> for bold, <em> for italic, <u> for underline
- NEVER use markdown syntax like ** or * or _
- Use <h3> for headings, <p> for paragraphs, <ul><li> for bullet lists
- Use <br> for line breaks
- Include inline styles for colors and spacing
- Make content professional, clear, and educational

For each slide provide:
- title: A clear, engaging title (plain text)
- content: Well-formatted HTML with proper tags and inline styles
- imagePrompt: ${includeImages ? 'A detailed description of a relevant educational image, diagram, or illustration' : 'null'}

Return a JSON object with a "slides" array.`;

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

      // Step 2: Generate images for slides that need them
      if (includeImages && slides.some(s => s.imagePrompt)) {
        toast.info('Generating high-quality images with AI...');
        
        const imagePromises = slides.map(async (slide, idx) => {
          if (slide.imagePrompt && slide.imagePrompt.trim()) {
            try {
              const imageResult = await base44.functions.invoke('generateImageWithManus', {
                prompt: `Professional educational illustration: ${slide.imagePrompt}. Style: Clear, detailed, suitable for educational presentation. High quality, informative, visually appealing.`,
                aspect_ratio: '16:9'
              });
              
              if (imageResult.data?.url) {
                return {
                  ...slide,
                  content: `<div style="text-align: center; margin: 20px 0;">
                    <img src="${imageResult.data.url}" alt="${slide.title}" style="width: 90%; max-width: 800px; height: auto; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.15); display: inline-block;" />
                  </div>
                  ${slide.content}`,
                  order: idx + 1
                };
              } else {
                console.error('No URL in image result:', imageResult);
              }
            } catch (error) {
              console.error('Image generation failed for slide:', slide.title, error);
              toast.error(`Image generation failed for: ${slide.title}`);
            }
          }
          return { ...slide, order: idx + 1 };
        });

        slides = await Promise.all(imagePromises);
        toast.success('Images generated successfully!');
      } else {
        slides = slides.map((slide, idx) => ({ ...slide, order: idx + 1 }));
      }

      // Ensure proper HTML formatting (no wrapping needed - content should already be HTML)
      slides = slides.map(slide => ({
        ...slide,
        content: slide.content || ''
      }));

      onSlidesGenerated(slides);
      toast.success(`Generated ${slides.length} slides successfully!`);
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