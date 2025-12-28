import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

export default function AIGenerateMode({ onSlidesGenerated }) {
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [includeImages, setIncludeImages] = useState(true);
  const [generating, setGenerating] = useState(false);

  const generateFromTopic = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setGenerating(true);
    try {
      toast.info('Researching and generating slides...');
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert presentation designer and educator. Create a stunning, modern, visually-rich ${slideCount}-slide presentation about: "${topic}"

${details ? `Additional context: ${details}` : ''}

🎨 TEXT CONTENT (HTML) - Must include:

1. STUNNING HEADINGS:
<h2 style="font-size: 36px; font-weight: 800; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 24px;">Your Title</h2>

2. EXPLANATORY TEXT - Write ALL information as rich HTML:
- Detailed descriptions, definitions, explanations
- Step-by-step processes with numbered points
- Key facts and statistics with proper formatting
- Real-world examples and case studies
- Use <p>, <ul>, <ol>, <h3>, <strong>, <em> tags

3. STYLED CONTENT BLOCKS:
- Key points: <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 16px; box-shadow: 0 8px 24px rgba(102,126,234,0.3); margin: 20px 0;">Important info</div>
- Info boxes: <div style="background: #f1f5f9; border-left: 6px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 16px 0;">Additional details</div>
- Statistics: <div style="background: #fef3c7; border-left: 6px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 16px 0;">📊 Data point</div>

4. TWO-COLUMN LAYOUTS when appropriate:
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 20px 0;">
  <div>[Left column content]</div>
  <div>[Right column content]</div>
</div>

📚 CONTENT QUALITY REQUIREMENTS:
- Research deeply using internet data for ACCURATE, UP-TO-DATE information
- Verify all facts, statistics, dates, names, and spelling
- Include specific examples, case studies, real data with sources
- Add relevant context and comprehensive explanations
- Use professional language and proper grammar
- Make content educational, engaging, and comprehensive

${includeImages ? `
📸 IMAGE GENERATION:
For each slide that would benefit from a visual, include an "image_prompt" field with a detailed description for generating an educational diagram/illustration. The prompt should describe PURE VISUALS without text:
- Use phrases like "clean illustration", "diagram showing", "visual representation"
- Specify colors, style (minimalist, professional, artistic)
- Mention key visual elements to include
- Example: "Clean medical illustration of human heart showing chambers in red and blue, arrows indicating blood flow, professional style, no text labels"

Also include "image_position" field: "top", "center", "left", or "right"` : ''}

Return JSON with this exact structure:
{
  "slides": [
    {
      "title": "Slide Title",
      "content": "<detailed HTML content>",
      "order": 0${includeImages ? ',\n      "image_prompt": "description for image generation",\n      "image_position": "top"' : ''}
    }
  ]
}`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            slides: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                  order: { type: "number" },
                  ...(includeImages ? {
                    image_prompt: { type: "string" },
                    image_position: { type: "string" }
                  } : {})
                }
              }
            }
          }
        }
      });

      if (!response?.slides) {
        toast.error('Invalid response from AI');
        return;
      }

      let slides = response.slides;

      // Generate images if requested
      if (includeImages) {
        toast.info('Generating educational images and diagrams...');
        
        slides = await Promise.all(
          slides.map(async (slide, index) => {
            if (slide.image_prompt) {
              try {
                const imageResult = await base44.integrations.Core.GenerateImage({
                  prompt: slide.image_prompt
                });
                
                if (imageResult?.url) {
                  const position = slide.image_position?.toLowerCase() || 'top';
                  let contentWithImage = slide.content;

                  if (position === 'top' || position === 'center') {
                    contentWithImage = `<div style="text-align: center; margin-bottom: 20px;">
                      <img src="${imageResult.url}" alt="${slide.title}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
                    </div>${slide.content}`;
                  } else if (position === 'right') {
                    contentWithImage = `<div style="display: flex; gap: 20px; align-items: flex-start;">
                      <div style="flex: 1;">${slide.content}</div>
                      <div style="flex: 0 0 40%;">
                        <img src="${imageResult.url}" alt="${slide.title}" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
                      </div>
                    </div>`;
                  } else if (position === 'left') {
                    contentWithImage = `<div style="display: flex; gap: 20px; align-items: flex-start;">
                      <div style="flex: 0 0 40%;">
                        <img src="${imageResult.url}" alt="${slide.title}" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
                      </div>
                      <div style="flex: 1;">${slide.content}</div>
                    </div>`;
                  }

                  return { ...slide, content: contentWithImage };
                }
              } catch (error) {
                console.error('Failed to generate image:', error);
              }
            }
            return slide;
          })
        );
      }

      onSlidesGenerated(slides);
      toast.success(`Generated ${slideCount} slides${includeImages ? ' with educational images' : ''}!`);
    } catch (error) {
      console.error('Error generating presentation:', error);
      toast.error('Failed to generate presentation: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">AI-Powered Generation</h3>
        <p className="text-sm text-gray-600 mb-4">
          Let AI create a complete presentation on any topic
        </p>

        <div className="space-y-4">
          <div>
            <Label>Topic *</Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Climate Change, The Water Cycle, World War II"
            />
          </div>

          <div>
            <Label>Additional Details (Optional)</Label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Add specific points to cover, target audience, or any other details..."
              rows={4}
            />
          </div>

          <div>
            <Label>Number of Slides</Label>
            <Input
              type="number"
              value={slideCount}
              onChange={(e) => setSlideCount(parseInt(e.target.value) || 5)}
              min={3}
              max={15}
              className="max-w-xs"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
            <input
              type="checkbox"
              id="includeImages"
              checked={includeImages}
              onChange={(e) => setIncludeImages(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600"
            />
            <Label htmlFor="includeImages" className="flex-1 cursor-pointer text-sm">
              <span className="font-semibold text-purple-900">Generate AI Images</span>
              <p className="text-xs text-purple-700 mt-1">
                Automatically create educational diagrams, graphs, and illustrations for your slides
              </p>
            </Label>
          </div>

          <Button
            onClick={generateFromTopic}
            disabled={!topic.trim() || generating}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Presentation
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          AI Features
        </h4>
        <ul className="text-sm text-purple-700 space-y-1">
          <li>• Researches topic using internet data</li>
          <li>• Creates structured, educational content</li>
          <li>• Formats with professional styling</li>
          <li>• Includes examples and definitions</li>
          <li>• Generates custom educational images, diagrams & graphs</li>
          <li>• Integrates visuals seamlessly with content</li>
        </ul>
      </div>
    </div>
  );
}