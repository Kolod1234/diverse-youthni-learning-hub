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
      // First, generate the presentation structure and content
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a comprehensive ${slideCount}-slide presentation about: "${topic}"

${details ? `Additional context: ${details}` : ''}

Requirements:
- Professional educational content
- Beautiful HTML formatting with colors and styles
- Include examples, definitions, and key concepts
- Engaging and visually appealing
- Appropriate for students/learners
${includeImages ? `- For EVERY slide, provide a detailed, specific image prompt that describes an educational illustration, diagram, chart, or visual that would enhance learning
- Image prompts should be very specific: describe colors, composition, style, and educational value
- Examples: "A labeled diagram showing the water cycle with evaporation, condensation, precipitation, and collection stages in bright colors", "An infographic-style chart comparing renewable vs non-renewable energy sources with icons and percentages", "An illustrated timeline of World War II major events with dates and locations"
- Specify whether the image should be placed at the top, right, left, or integrated into the content` : ''}

Return ${slideCount} slides with title, rich HTML content${includeImages ? ', detailed image prompt for each slide, and preferred image position (top/right/left/center)' : ''}.`,
        add_context_from_internet: true,
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
                  order: { type: 'number' },
                  ...(includeImages && {
                    image_prompt: { type: 'string' },
                    image_position: { type: 'string' }
                  })
                }
              }
            }
          }
        }
      });

      let slides = result.slides || [];

      // If images are requested, generate them for slides that need them
      if (includeImages && slides.length > 0) {
        toast.info(`Generating ${slides.length} educational images...`);
        
        const imagePromises = slides.map(async (slide, index) => {
          if (slide.image_prompt && slide.image_prompt.trim()) {
            try {
              // Generate high-quality educational image with enhanced prompting
              const imageResult = await base44.integrations.Core.GenerateImage({
                prompt: `Professional educational illustration for presentation slide titled "${slide.title}". 
Topic: ${topic}
Visual description: ${slide.image_prompt}

Style requirements:
- Clean, modern, educational design
- High contrast and clear visual hierarchy  
- Suitable for learning and teaching
- Professional color palette
- Clear labels and text if applicable
- Infographic or diagram style when appropriate
- No watermarks or text overlays
- High quality and visually engaging

Focus: Create a clear, informative visual that enhances understanding and learning.`
              });
              
              // Integrate image into content based on position
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
              
              return {
                ...slide,
                content: contentWithImage,
                image_url: imageResult.url
              };
            } catch (error) {
              console.error(`Failed to generate image for slide ${index + 1}:`, error);
              toast.error(`Could not generate image for slide ${index + 1}`);
              return slide;
            }
          }
          return slide;
        });

        slides = await Promise.all(imagePromises);
      }

      onSlidesGenerated(slides);
      toast.success(`AI presentation generated${includeImages ? ' with images' : ''}!`);
    } catch (error) {
      toast.error('Failed to generate presentation');
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