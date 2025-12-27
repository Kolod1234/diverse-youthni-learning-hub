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
        prompt: `You are an expert presentation designer and educator. Create a stunning, modern, visually-rich ${slideCount}-slide presentation about: "${topic}"

${details ? `Additional context: ${details}` : ''}

🎨 MODERN SLIDE DESIGN REQUIREMENTS:
Create BEAUTIFUL, MAGAZINE-QUALITY slides with:

1. STUNNING HEADINGS:
   - Large, bold, gradient headings: <h2 style="font-size: 36px; font-weight: 800; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 24px;">
   - Use different gradient combinations per slide: purple-blue, orange-pink, green-teal, red-orange

2. TWO-COLUMN LAYOUTS (use frequently):
   <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: start;">
     <div>[Left column content with heading, text, lists]</div>
     <div>[Right column with contrasting info, examples, or will contain image]</div>
   </div>

3. MODERN STYLED BOXES & CARDS:
   - Key concepts: <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 16px; box-shadow: 0 8px 24px rgba(102,126,234,0.3); margin: 20px 0;">
   - Info cards: <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
   - Highlight boxes: <div style="background: linear-gradient(to right, #fef3c7, #fde68a); border-left: 6px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 16px 0;">

4. VISUAL ELEMENTS:
   - Numbered circles: <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 50%; font-weight: 700; font-size: 20px; margin-right: 16px;">1</div>
   - Icon-style badges: <span style="background: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; display: inline-block; margin: 4px;">
   - Progress bars, arrows, dividers

5. RICH TYPOGRAPHY:
   - Subheadings: <h3 style="color: #1e293b; font-size: 24px; font-weight: 700; margin-top: 24px; margin-bottom: 12px;">
   - Body text: <p style="color: #475569; font-size: 16px; line-height: 1.8; margin-bottom: 16px;">
   - Highlighted terms: <span style="background: linear-gradient(120deg, #fbbf24 0%, #f59e0b 100%); padding: 3px 8px; border-radius: 6px; font-weight: 600; color: #78350f;">
   - Lists with custom bullets and spacing

6. STATISTICS & DATA:
   - Large numbers: <div style="font-size: 56px; font-weight: 800; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">85%</div>
   - Stat cards in grid layout

${includeImages ? `
🖼️ IMAGE GENERATION - MANDATORY FOR EVERY SLIDE:
Generate a SPECIFIC, DETAILED image for each slide:
- Types: Diagrams, infographics, charts, illustrations, concept maps, timelines, process flows
- Be EXTREMELY SPECIFIC: colors, elements, labels, arrows, layout, style
- Examples:
  * "Modern infographic showing 5 steps of photosynthesis: sunlight (yellow rays), chlorophyll (green molecules), water (blue drops), glucose (orange hexagon), oxygen (gray bubbles). Flowing circular arrows connecting each step. Vibrant colors, clean design, labeled."
  * "Split-screen comparison: left side renewable energy (wind turbine icon, solar panel icon, water dam icon) in green/blue tones with upward arrows, right side fossil fuels (oil barrel, coal, gas flame) in gray/black with downward arrows. Percentage bars below each."
  * "Anatomical diagram of human heart with 4 chambers clearly labeled in different colors: right atrium (light blue), right ventricle (dark blue), left atrium (light red), left ventricle (dark red). Blood flow arrows, valves marked."
  
Position: top, center, right, left (specify for layout)` : ''}

📚 CONTENT QUALITY:
- Research deeply using internet context for ACCURATE, UP-TO-DATE information
- Verify facts, statistics, dates, names
- Use correct spelling and grammar
- Include specific examples, case studies, real data
- Add relevant context and explanations
- Make it comprehensive yet clear

Return ${slideCount} slides with attention-grabbing titles, modern HTML layouts${includeImages ? ', and specific image prompts for each slide' : ''}.`,
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