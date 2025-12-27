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
${includeImages ? `- For each slide, specify if it needs an image/diagram/graph and provide a detailed description for generating it` : ''}

Return ${slideCount} slides with title, rich HTML content${includeImages ? ', and image descriptions where appropriate' : ''}.`,
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
        toast.info('Generating educational images...');
        
        const imagePromises = slides.map(async (slide, index) => {
          if (slide.image_prompt && slide.image_prompt.trim()) {
            try {
              // Generate educational image
              const imageResult = await base44.integrations.Core.GenerateImage({
                prompt: `Educational illustration for a presentation slide about "${topic}". ${slide.image_prompt}. 
Style: Clean, professional, educational, suitable for learning materials. 
Focus: Clear visuals that support learning and understanding.`
              });
              
              return {
                ...slide,
                image_url: imageResult.url
              };
            } catch (error) {
              console.error(`Failed to generate image for slide ${index + 1}`);
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