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
    console.log('Generate button clicked!');
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    console.log('Starting generation for topic:', topic);
    setGenerating(true);
    try {
      // Generate presentation structure and content using Manus AI
      const response = await base44.functions.invoke('manusContentGeneration', {
        prompt: `You are an expert presentation designer and educator. Create a stunning, modern, visually-rich ${slideCount}-slide presentation about: "${topic}"

      ${details ? `Additional context: ${details}` : ''}

      🎨 CANVAS MODE - TEXT & VISUALS SEPARATION:
      Create slides with SEPARATE text content and visual images:

      **TEXT CONTENT (HTML) - Must include:**
      1. STUNNING HEADINGS:
      - <h2 style="font-size: 36px; font-weight: 800; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 24px;">

      2. EXPLANATORY TEXT - Write ALL information as HTML:
      - Descriptions, definitions, explanations
      - Step-by-step processes with numbered points
      - Key facts and statistics
      - Examples and case studies
      - Use <p>, <ul>, <ol>, <h3> tags

      3. STYLED CONTENT BLOCKS:
      - Key points: <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 16px; box-shadow: 0 8px 24px rgba(102,126,234,0.3); margin: 20px 0;">
      - Info boxes: <div style="background: #f1f5f9; border-left: 6px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 16px 0;">
      - Lists with icons and styled bullets

      4. TWO-COLUMN LAYOUTS:
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
      <div>[Left: explanatory text, definitions, key points]</div>
      <div>[Right: examples, statistics, case studies - image will be inserted here]</div>
      </div>

      ${includeImages ? `
      🖼️ IMAGE REQUIREMENTS - VISUALS WITHOUT TEXT:

      **CRITICAL: Images must be PURE VISUALS with NO TEXT or minimal labels**
      - Images are decorative illustrations to complement the text
      - DO NOT put explanations or descriptions in images
      - Use simple, clean, artistic representations
      - Avoid text labels, lengthy annotations, or spelling errors

      **Image Types & Examples:**
      - Water Cycle: "Artistic illustration of water cycle showing blue ocean, white clouds, rain droplets, green landscape, and sun - flowing circular arrows connecting stages, vibrant colors, minimalist style, no text labels"
      - Renewable Energy: "Clean illustration showing wind turbine, solar panel, and water dam in modern flat design style with green and blue color palette, simple icons, no text"
      - Human Heart: "Medical illustration of anatomical heart showing chambers in different shades of red and blue, simple arrows indicating blood flow, clean professional style, minimal or no labels"
      - Photosynthesis: "Botanical illustration showing leaf, sunlight rays, water molecules, and oxygen bubbles in natural green tones, simple arrows, artistic style, no text"

      **Layout:**
      - Position: "left" (image floats left, text wraps right)
      - Position: "right" (image floats right, text wraps left)  
      - Position: "top" (image above text content)
      - Position: "center" (image between content sections)

      Remember: Text explains, image illustrates. Keep them separate!` : ''}

      📚 CONTENT QUALITY:
      - Research deeply for ACCURATE, UP-TO-DATE information
      - Verify facts, statistics, dates, names
      - Use correct spelling and grammar
      - Include specific examples, case studies, real data
      - Add relevant context and explanations
      - Make it comprehensive yet clear

      Return JSON with ${slideCount} slides array, each with: title, content (HTML), order, ${includeImages ? 'image_prompt, image_position' : ''}.`,
        slideCount,
        includeImages
      });

      console.log('Full response from Manus:', response);
      const result = response.data || response;
      console.log('Result object:', result);
      let slides = result.slides || [];
      console.log('Extracted slides:', slides);

      if (!slides || slides.length === 0) {
        toast.error('No slides generated. Please try again.');
        return;
      }

      // If images are requested, generate them for slides that need them
      if (includeImages && slides.length > 0) {
        toast.info(`Generating ${slides.length} educational images...`);
        
        const imagePromises = slides.map(async (slide, index) => {
          if (slide.image_prompt && slide.image_prompt.trim()) {
            try {
              // Generate high-quality educational image using Puter SDXL
              const imageResult = await base44.functions.invoke('puterImageGeneration', {
                prompt: `Professional educational illustration: ${slide.image_prompt}. Clean, modern design, high quality, educational style, suitable for "${slide.title}" slide about ${topic}.`
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

      console.log('Final slides to send:', slides);
      console.log('Calling onSlidesGenerated with slides');
      onSlidesGenerated(slides);
      toast.success(`AI presentation generated${includeImages ? ' with images' : ''}!`);
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