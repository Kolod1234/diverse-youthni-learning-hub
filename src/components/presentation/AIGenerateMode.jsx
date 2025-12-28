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
        prompt: `You are an expert presentation designer and educator. Create a stunning, professional, deeply-researched ${slideCount}-slide presentation about: "${topic}"

${details ? `Additional context: ${details}` : ''}

🔍 CRITICAL - DEEP RESEARCH & CITATION REQUIREMENTS:

**MANDATORY SOURCE CITATION:**
- EVERY statistic MUST include source and year (e.g., "According to WHO 2024, 2.3 billion people...")
- EVERY fact MUST be verifiable with a cited source (e.g., "NASA reports that...", "MIT study shows...")
- Include direct expert quotes with attribution (e.g., "Dr. Jane Smith, Harvard climatologist, states...")
- Reference specific research papers, studies, or reports by name

**DEPTH & SPECIFICITY:**
- Use EXACT numbers, percentages, dates - NO vague terms like "many" or "recent"
- Include real case studies with specific locations and outcomes
- Reference actual companies, organizations, or institutions by name
- Provide concrete examples from recent events (2023-2024 preferred)
- Include historical context with precise dates and figures

**AUTHORITATIVE SOURCES TO PRIORITIZE:**
- Academic institutions (universities, research centers)
- Government agencies and international organizations (WHO, UN, NASA, etc.)
- Peer-reviewed journals and scientific publications
- Industry leaders and recognized experts in the field
- Reputable news organizations for recent developments

**ENGAGEMENT & CREDIBILITY:**
- Start with compelling, fact-based hooks (e.g., "In 2024, scientists discovered...")
- Include surprising statistics that capture attention
- Use expert opinions to add authority
- Provide real-world implications and applications
- End with forward-looking insights based on current research

🎨 HTML FORMATTING - STRICT REQUIREMENTS:

**NEVER USE MARKDOWN** - Always use proper HTML tags:
- Bold text: <strong>text</strong> (NOT **text**)
- Italic: <em>text</em> (NOT *text*)
- Lists: <ul><li>item</li></ul> (NOT - item)
- Headings: <h2>, <h3> (NOT ## or ###)

1. STUNNING GRADIENT HEADINGS (required for each slide):
<h2 style="font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 20px; line-height: 1.3;">Main Title</h2>

2. RICH FORMATTED TEXT with proper HTML:
<p style="font-size: 18px; line-height: 1.8; color: #334155; margin-bottom: 16px;">
  <strong>Key term:</strong> Detailed explanation with <em>emphasis</em> where needed.
</p>

<ul style="list-style: none; padding: 0; margin: 20px 0;">
  <li style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 17px;">
    <strong style="color: #667eea;">✓ Point 1:</strong> Detailed information with specific data
  </li>
  <li style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 17px;">
    <strong style="color: #667eea;">✓ Point 2:</strong> More specific information
  </li>
</ul>

3. STYLED HIGHLIGHT BOXES:
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 12px; margin: 20px 0; box-shadow: 0 4px 12px rgba(102,126,234,0.3);">
  <h3 style="margin: 0 0 12px 0; font-size: 20px;">Key Insight</h3>
  <p style="margin: 0; font-size: 16px; line-height: 1.6;">Important information here</p>
</div>

<div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <p style="margin: 0; color: #1e293b; font-size: 16px;"><strong>💡 Did you know:</strong> Interesting fact with specific data</p>
</div>

4. DATA & STATISTICS BOXES:
<div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <p style="margin: 0; color: #78350f; font-size: 16px;"><strong>📊 Statistics:</strong> Include exact numbers, percentages, dates</p>
</div>

${includeImages ? `
🖼️ IMAGE GENERATION - CRITICAL REQUIREMENTS:

For EVERY slide, include:
- "image_prompt": Detailed prompt for educational illustration
- "image_description": Clear description of what the image shows (2-3 sentences)
- "image_position": "top", "center", "left", or "right"

**TEXT IN IMAGES - SPELLING RULES:**
⚠️ WARNING: Image generators often misspell text. To avoid spelling errors:
- If labels are needed, use ONLY simple, common, SHORT words (3-7 letters)
- Double-check spelling in your prompt: "EVAPORATION" not "EVAPORATON", "PRECIPITATION" not "PREIPITATION"
- Specify: "with correctly spelled labels" or "accurate text spelling"
- Keep text minimal - use arrows, colors, numbers instead where possible
- Better approach: Generate images with minimal text, put detailed explanations in the slide HTML content

**Image Prompt Examples:**
✅ "Educational water cycle diagram showing blue ocean, water droplets rising (evaporation), white clouds forming (condensation), rain falling (precipitation), green landscape with rivers, underground water flow - with clear correctly-spelled labels for each stage, professional educational illustration style, accurate spelling of all text"

✅ "Sustainable farm illustration with terraced fields, solar panels, diverse crops, drip irrigation - labeled with short correctly-spelled terms like 'SOLAR', 'CROPS', 'WATER', clean educational style, verify all text spelling"

✅ "Human heart cross-section showing chambers in red and blue colors, blood flow arrows, simple labels with correct spelling: 'ATRIUM', 'VENTRICLE', 'AORTA', medical illustration style, accurate text"

**BEST PRACTICE:**
Generate images with VISUAL CUES (colors, arrows, numbers) instead of text labels, then explain everything in the HTML content where spelling is guaranteed correct.

**Image Description Examples:**
- "image_description": "A labeled diagram of the water cycle showing evaporation from oceans, cloud formation, precipitation, surface runoff, and groundwater movement with arrows indicating flow direction."` : ''}

CONTENT STRUCTURE:
- Start with attention-grabbing gradient heading
- Use formatted bullet points with proper HTML
- Include styled highlight boxes for key concepts
- Add statistics in colored boxes with exact data
- End with actionable takeaways or conclusions
- Make every slide visually rich and informative

Return JSON:`,
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

      // Search for images if requested
      if (includeImages) {
        toast.info('Searching for educational images and diagrams...');

        slides = await Promise.all(
          slides.map(async (slide) => {
            if (slide.image_prompt) {
              try {
                const imageResult = await base44.functions.invoke('searchImageOnline', {
                  query: slide.image_prompt
                });

                if (imageResult?.data?.url) {
                  const position = slide.image_position?.toLowerCase() || 'top';
                  const imageDescription = slide.image_description || slide.title;
                  let contentWithImage = slide.content;

                  if (position === 'top' || position === 'center') {
                    contentWithImage = `<div style="text-align: center; margin-bottom: 24px;">
                      <img src="${imageResult.url}" alt="${imageDescription}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.15);" />
                      <p style="font-size: 14px; color: #64748b; margin-top: 8px; font-style: italic;">${imageDescription}</p>
                    </div>${slide.content}`;
                  } else if (position === 'right') {
                    contentWithImage = `<div style="display: flex; gap: 24px; align-items: flex-start;">
                      <div style="flex: 1;">${slide.content}</div>
                      <div style="flex: 0 0 40%;">
                        <img src="${imageResult.url}" alt="${imageDescription}" style="width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.15);" />
                        <p style="font-size: 14px; color: #64748b; margin-top: 8px; font-style: italic;">${imageDescription}</p>
                      </div>
                    </div>`;
                  } else if (position === 'left') {
                    contentWithImage = `<div style="display: flex; gap: 24px; align-items: flex-start;">
                      <div style="flex: 0 0 40%;">
                        <img src="${imageResult.url}" alt="${imageDescription}" style="width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.15);" />
                        <p style="font-size: 14px; color: #64748b; margin-top: 8px; font-style: italic;">${imageDescription}</p>
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