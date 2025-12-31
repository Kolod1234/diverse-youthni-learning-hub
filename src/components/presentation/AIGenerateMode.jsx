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
  const [aiProvider, setAiProvider] = useState('base44-pro');
  const [educationLevel, setEducationLevel] = useState('gcse');
  const [generating, setGenerating] = useState(false);

  const generatePresentation = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setGenerating(true);
    try {
      toast.info('🧠 Generating your presentation...');

      const levelInstructions = {
        phd: 'PhD/Research level with advanced academic content and in-depth analysis',
        alevel: 'A-Level (16-18 years) with detailed explanations and analytical depth',
        gcse: 'GCSE Level (14-16 years) with clear, structured content for secondary students',
        primary: 'Primary School (5-11 years) with simple, engaging content and clear examples'
      };

      const prompt = `Create a ${slideCount}-slide educational presentation about: "${topic}"
${details ? `\nAdditional context: ${details}` : ''}

TARGET AUDIENCE: ${levelInstructions[educationLevel]}

🎨 MODERN SLIDE DESIGN REQUIREMENTS:

Each slide MUST include:

1. GRADIENT HEADER:
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);">
  <h2 style="color: white; font-size: 28px; font-weight: 700; margin: 0;">[Title]</h2>
</div>

2. KEY CONCEPTS BOX:
<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 12px; color: white; margin: 20px 0; box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);">
  <h3 style="color: white; font-size: 20px; font-weight: 600; margin: 0 0 12px 0;">✨ Key Points</h3>
  <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
    <li>Point 1</li>
    <li>Point 2</li>
  </ul>
</div>

3. INFORMATION CARDS:
<div style="background: linear-gradient(to right, #f8fafc, #e0e7ff); border-left: 5px solid #3b82f6; padding: 20px; margin: 16px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  <h3 style="color: #1e40af; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">📌 Section Title</h3>
  <p style="color: #334155; line-height: 1.7; margin: 0;">[Content]</p>
</div>

4. DID YOU KNOW BOX:
<div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 16px; border-radius: 10px; border: 2px solid #fbbf24; margin: 16px 0; box-shadow: 0 2px 8px rgba(251, 191, 36, 0.2);">
  <strong style="color: #92400e; font-size: 16px;">💡 Did You Know?</strong>
  <p style="color: #78350f; margin: 8px 0 0 0; line-height: 1.6;">[Interesting fact]</p>
</div>

${includeImages ? `
🖼️ IMAGE REQUIREMENTS:
For EACH slide, provide "image_prompt" with detailed description:
- Specify EXACT visual elements (diagrams, charts, illustrations)
- Include ALL labels and text that should appear
- Describe colors, style, and layout
- Example: "Educational diagram showing DNA double helix structure with labeled components: Sugar-phosphate backbone (blue), Nitrogenous bases (color-coded: A-T in red, G-C in green), Hydrogen bonds (dashed lines). Professional scientific illustration style, white background."
` : ''}

📚 CONTENT REQUIREMENTS:
- Include specific facts, statistics, and examples
- Add real-world applications
- Use proper formatting with all style elements above
- Make content comprehensive yet accessible

Return ONLY valid JSON:
{
  "slides": [
    {
      "title": "Slide Title",
      "content": "[Full HTML with ALL styling elements]",
      "order": 1,
      ${includeImages ? '"image_prompt": "Detailed educational image description",' : ''}
      ${includeImages ? '"image_description": "Brief caption"' : ''}
    }
  ]
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
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

      if (!result?.slides || result.slides.length === 0) {
        throw new Error('No slides generated');
      }

      let slides = result.slides;

      // Generate images with Manus AI
      if (includeImages) {
        toast.info('🎨 Generating educational images...');
        
        slides = await Promise.all(
          slides.map(async (slide, index) => {
            if (slide.image_prompt) {
              try {
                const imageResult = await base44.functions.invoke('generateImageWithManus', {
                  prompt: slide.image_prompt,
                  aspect_ratio: '16:9'
                });

                if (imageResult?.data?.url) {
                  const imageDescription = slide.image_description || slide.title;
                  const contentWithImage = `
<div style="text-align: center; margin: 28px 0; padding: 20px; background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%); border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
  <img src="${imageResult.data.url}" alt="${imageDescription}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.15); border: 4px solid white;" />
  <p style="font-size: 15px; color: #475569; margin-top: 16px; font-weight: 500; font-style: italic;">📊 ${imageDescription}</p>
</div>
${slide.content}`;

                  toast.success(`Generated image ${index + 1}/${slides.length}`);
                  return { ...slide, content: contentWithImage };
                }
              } catch (error) {
                console.error('Image generation failed:', error);
              }
            }
            return slide;
          })
        );
      }

      onSlidesGenerated(slides);
      toast.success(`✨ Generated ${slideCount} professional slides!`);
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Failed to generate presentation: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">AI-Powered Slide Generator</h3>
        <p className="text-sm text-gray-600 mb-4">
          Create professional presentations with modern design and rich formatting
        </p>

        <div className="space-y-4">
          <div>
            <Label>Topic *</Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Climate Change, DNA Structure, World War II"
            />
          </div>

          <div>
            <Label>Additional Details (Optional)</Label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Specific points to cover, focus areas, or additional context..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Number of Slides</Label>
              <Input
                type="number"
                value={slideCount}
                onChange={(e) => setSlideCount(parseInt(e.target.value) || 5)}
                min={3}
                max={15}
              />
            </div>
            
            <div>
              <Label>Education Level</Label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="primary">Primary School (5-11)</option>
                <option value="gcse">GCSE (14-16)</option>
                <option value="alevel">A-Level (16-18)</option>
                <option value="phd">PhD/Research</option>
              </select>
            </div>
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
              <span className="font-semibold text-purple-900">Generate Educational Images</span>
              <p className="text-xs text-purple-700 mt-1">
                AI will create custom diagrams and illustrations using Manus AI
              </p>
            </Label>
          </div>

          <Button
            onClick={generatePresentation}
            disabled={!topic.trim() || generating}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
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
          Features
        </h4>
        <ul className="text-sm text-purple-700 space-y-1">
          <li>• Modern slides with gradient headers and styled boxes</li>
          <li>• Deep research with comprehensive, accurate content</li>
          <li>• High-quality educational diagrams with Manus AI</li>
          <li>• Professional formatting with rich visual hierarchy</li>
        </ul>
      </div>
    </div>
  );
}