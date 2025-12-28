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
        prompt: `Create a ${slideCount}-slide educational presentation about: "${topic}"

      ${details ? `Additional context: ${details}` : ''}

      For each slide, provide:
      - A clear title
      - Well-structured HTML content with paragraphs and lists
      - ${includeImages ? 'A brief image search query and description' : 'No images'}

      Use proper HTML formatting:
      - Headings: <h2>, <h3>
      - Paragraphs: <p>
      - Bold: <strong>
      - Lists: <ul><li>

      ${includeImages ? 'Include image_prompt (search query) and image_description for each slide.' : ''}

      Return ONLY valid JSON.`,
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
                    image_description: { type: "string" }
                  } : {})
                },
                required: ["title", "content", "order"]
              }
            }
          },
          required: ["slides"]
        }
      });

      if (!response?.slides) {
        toast.error('Invalid response from AI');
        return;
      }

      let slides = response.slides;

      // Search for images if requested
      if (includeImages) {
        toast.info('Searching for educational images and diagrams...');

        if (includeImages) {
          slides = await Promise.all(
            slides.map(async (slide) => {
              if (slide.image_prompt) {
                try {
                  const imageResult = await base44.functions.invoke('searchImageOnline', {
                    query: slide.image_prompt,
                    slideTitle: slide.title,
                    slideContent: slide.content,
                    presentationTopic: topic
                  });

                  if (imageResult?.data?.url) {
                    const imageDescription = slide.image_description || slide.title;
                    const contentWithImage = `<div style="text-align: center; margin-bottom: 24px;">
                      <img src="${imageResult.data.url}" alt="${imageDescription}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.15);" />
                      <p style="font-size: 14px; color: #64748b; margin-top: 8px; font-style: italic;">${imageDescription}</p>
                    </div>${slide.content}`;

                    return { ...slide, content: contentWithImage };
                  }
                } catch (error) {
                  console.error('Failed to search for image:', error);
                }
              }
              return slide;
            })
          );
        }
      }

      onSlidesGenerated(slides);
      toast.success(`Generated ${slideCount} slides${includeImages ? ' with web-sourced images' : ''}!`);
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
              <span className="font-semibold text-purple-900">Find Educational Images</span>
              <p className="text-xs text-purple-700 mt-1">
                Automatically search for high-quality educational images, diagrams, and illustrations from reputable sources
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
          <li>• Researches topic using internet data with cited sources</li>
          <li>• Creates structured, educational content with expert quotes</li>
          <li>• Formats with professional styling and HTML</li>
          <li>• Includes real statistics, examples, and definitions</li>
          <li>• Searches for high-quality educational images from reputable sources</li>
          <li>• Integrates visuals seamlessly with content</li>
        </ul>
      </div>
    </div>
  );
}