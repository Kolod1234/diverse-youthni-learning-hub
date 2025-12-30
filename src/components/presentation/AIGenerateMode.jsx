import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Lightbulb, Image } from 'lucide-react';
import { toast } from 'sonner';
import ImageSearchPreview from './ImageSearchPreview';

export default function AIGenerateMode({ onSlidesGenerated }) {
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [includeImages, setIncludeImages] = useState(true);
  const [aiProvider, setAiProvider] = useState('perplexity'); // 'perplexity', 'chatgpt', 'canva'
  const [useWebImages, setUseWebImages] = useState(true);
  const [imageGenerator, setImageGenerator] = useState('nano-banana'); // 'nano-banana', 'dalle', 'imagen'
  const [educationLevel, setEducationLevel] = useState('gcse');
  const [imageSearchTerms, setImageSearchTerms] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [currentSlideForImage, setCurrentSlideForImage] = useState(null);
  const [generatedSlides, setGeneratedSlides] = useState([]);

  const generateFromTopic = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setGenerating(true);
    try {
      toast.info('Researching and generating slides...');

      let response;

      const levelInstructions = {
        phd: 'PhD/Research level - Advanced academic content with in-depth analysis, research methodologies, and scholarly references',
        alevel: 'A-Level (16-18 years) - Advanced secondary education with detailed explanations and analytical depth',
        gcse: 'GCSE Level (14-16 years) - Clear, structured content suitable for secondary school students',
        primary: 'Primary School (5-11 years) - Simple, engaging content with clear examples and age-appropriate language'
      };

      if (aiProvider === 'perplexity') {
        // Use Perplexity for research-based content
        const researchResult = await base44.functions.invoke('perplexitySearch', {
          query: `Create a ${slideCount}-slide educational presentation about: "${topic}"
      ${details ? `\nContext: ${details}` : ''}
      
      TARGET AUDIENCE: ${levelInstructions[educationLevel]}
      Adapt the complexity, vocabulary, and depth of content accordingly.

      CRITICAL: Return ONLY valid JSON in this EXACT format (no markdown, no extra text):
      {
      "slides": [
      {
      "title": "Engaging slide title",
      "content": "Well-researched content with <h2>, <h3>, <p>, <strong>, <ul>, <li> HTML tags. Include specific facts, statistics, examples with proper context.",
      "order": 1,
      ${includeImages && useWebImages ? '"image_url": "Direct URL to relevant educational image from web (Wikimedia Commons, NASA, NIH, .edu, .gov sources)",' : includeImages ? '"image_prompt": "Specific search query for finding a relevant educational image",' : ''}
      "image_description": "Brief description of what the image shows"
      }
      ]
      }

      Research requirements:
      - Use current, accurate information from reliable sources
      - Include specific facts, statistics, and real examples
      - Make content educational and engaging for students
      - Format content with proper HTML for visual hierarchy

      ${includeImages && useWebImages ? 'IMPORTANT: For EVERY slide, search the web for a RELEVANT educational image that DIRECTLY relates to that specific slide\'s content. Use image_url (full https:// URL ending in .jpg, .png, .svg) and image_description. CRITICAL: The image MUST match the slide topic exactly - if the slide is about cell division, find cell division diagrams from biology sources (Wikimedia Commons biology images, .edu biology departments, science textbooks). If about space, use NASA. Always match image source to the subject matter. Prioritize labeled diagrams and illustrations over generic photos.' : includeImages ? 'IMPORTANT: Include "image_prompt" (detailed instructions for generating educational diagrams using Nano Banana image generation) and "image_description" for EVERY slide. For image_prompt, provide specific, detailed instructions for creating educational diagrams, infographics, or illustrations suitable for the topic.' : ''}

      Return ONLY the JSON object, nothing else.`
        });

        if (researchResult?.data?.content) {
          try {
            // Try to parse JSON from the response
            const content = researchResult.data.content.trim();
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              response = JSON.parse(jsonMatch[0]);
              toast.success('Research-based content generated with citations!');
            } else {
              throw new Error('No JSON found in response');
            }
          } catch (parseError) {
            console.error('Failed to parse Perplexity response:', parseError);
            toast.error('Failed to parse AI response, falling back to standard AI');
          }
          }
          } else if (aiProvider === 'chatgpt') {
            // Use ChatGPT for content generation
            const chatgptResult = await base44.functions.invoke('geminiGeneration', {
          query: `Create a ${slideCount}-slide educational presentation about: "${topic}"
          ${details ? `\nContext: ${details}` : ''}

          TARGET AUDIENCE: ${levelInstructions[educationLevel]}
          Adapt the complexity, vocabulary, and depth of content accordingly.

          CRITICAL: Return ONLY valid JSON in this EXACT format (no markdown, no extra text):
          {
          "slides": [
          {
          "title": "Engaging slide title",
          "content": "Well-researched content with <h2>, <h3>, <p>, <strong>, <ul>, <li> HTML tags. Include specific facts, statistics, examples.",
          "order": 1,
          ${includeImages ? '"image_prompt": "Specific search query for finding a relevant educational image",' : ''}
          "image_description": "Brief description of what the image shows"
          }
          ]
          }

          ${includeImages ? 'IMPORTANT: Include "image_prompt" (detailed search query) and "image_description" for EVERY slide.' : ''}

          Return ONLY the JSON object, nothing else.`
          });

          if (chatgptResult?.data?.content) {
          try {
            const content = chatgptResult.data.content.trim();
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              response = JSON.parse(jsonMatch[0]);
              toast.success('Content generated with ChatGPT!');
            } else {
              throw new Error('No JSON found in response');
            }
          } catch (parseError) {
            console.error('Failed to parse ChatGPT response:', parseError);
            toast.error('Failed to parse AI response, falling back to standard AI');
          }
          }
          } else if (aiProvider === 'canva') {
        // Use Canva AI for design-focused content
        const canvaResult = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a professional presentation designer creating visually stunning slides.

Create a ${slideCount}-slide presentation about: "${topic}"
${details ? `\nContext: ${details}` : ''}

TARGET AUDIENCE: ${levelInstructions[educationLevel]}

DESIGN PRINCIPLES (Canva-style):
- Use clear, visual hierarchy with bold headings
- Keep text concise and impactful (bullet points preferred)
- Focus on visual storytelling over dense text
- Each slide should have one key message
- Content should be easily digestible at a glance
- Use professional, engaging language

CRITICAL: Return ONLY valid JSON in this EXACT format:
{
  "slides": [
    {
      "title": "Short, impactful title (max 6 words)",
      "content": "Concise, visually-focused content with <h2>, <h3>, <p>, <strong>, <ul>, <li> tags. Use short sentences and bullet points. Max 3-4 points per slide.",
      "order": 1,
      ${includeImages ? '"image_prompt": "Design-focused description for finding relevant visual",' : ''}
      "image_description": "What the visual represents",
      "design_notes": "Color scheme suggestion (e.g., 'vibrant blues', 'warm sunset tones')"
    }
  ]
}

Design requirements:
- Each slide max 50 words of text
- Focus on visual impact and clarity
- Use bullet points liberally
- Create slides that "pop" visually
- Think like a graphic designer, not a writer

${includeImages ? 'Include "image_prompt" (visual search query for design-focused images) and "image_description" for EVERY slide. Focus on impactful visuals.' : ''}

Return ONLY the JSON object, nothing else.`,
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
                      image_description: { type: "string" },
                      design_notes: { type: "string" }
                    } : {})
                  },
                  required: ["title", "content", "order"]
                }
              }
            },
            required: ["slides"]
          }
        });

        if (canvaResult?.slides) {
          response = canvaResult;
          toast.success('Design-focused content generated with Canva AI!');
        }
      }

          if (!response) {
        response = await base44.integrations.Core.InvokeLLM({
          prompt: `Create a ${slideCount}-slide educational presentation about: "${topic}"

${details ? `Additional context: ${details}` : ''}

TARGET AUDIENCE: ${levelInstructions[educationLevel]}
Adapt the complexity, vocabulary, and depth of content accordingly.

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
      }

      if (!response?.slides) {
        toast.error('Invalid response from AI');
        return;
      }

      let slides = response.slides;

      // Add images if requested
      if (includeImages) {
        if (useWebImages) {
          toast.info('Searching high-quality images from Unsplash...');
          slides = await Promise.all(
            slides.map(async (slide) => {
              const searchQuery = imageSearchTerms || slide.image_prompt || slide.title;
              try {
                const result = await base44.functions.invoke('searchUnsplashImages', {
                  query: searchQuery,
                  perPage: 1
                });

                if (result.data.images?.length > 0) {
                  const image = result.data.images[0];
                  const imageDescription = slide.image_description || slide.title;
                  const contentWithImage = `<div style="text-align: center; margin-bottom: 24px;">
                    <img src="${image.url}" alt="${imageDescription}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.15);" />
                    <p style="font-size: 14px; color: #64748b; margin-top: 8px; font-style: italic;">${imageDescription}</p>
                    <p style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Photo by <a href="${image.photographer_url}" target="_blank" style="color: #64748b;">${image.photographer}</a></p>
                  </div>${slide.content}`;
                  return { ...slide, content: contentWithImage };
                }
              } catch (error) {
                console.error('Failed to fetch Unsplash image:', error);
              }
              return slide;
            })
          );
        } else {
          const generatorName = imageGenerator === 'dalle' ? 'DALL-E 3' : imageGenerator === 'imagen' ? 'Stable Diffusion' : 'Nano Banana AI';
          toast.info(`Generating educational diagrams with ${generatorName}...`);
          
          slides = await Promise.all(
            slides.map(async (slide) => {
              if (slide.image_prompt) {
                try {
                  let generatedImage;
                  
                  if (imageGenerator === 'dalle') {
                    // Use DALL-E for image generation
                    const result = await base44.functions.invoke('geminiImageGeneration', {
                      prompt: slide.image_prompt,
                      topic: `${topic} - ${slide.title}`
                    });
                    
                    if (result.data?.url) {
                      generatedImage = { url: result.data.url };
                    }
                  } else if (imageGenerator === 'imagen') {
                    // Use Stable Diffusion for image generation
                    const imagenPrompt = `Educational diagram and illustration: ${slide.image_prompt}

Topic: ${topic} - ${slide.title}
Style: Professional educational diagram, clear and informative
Purpose: Help students understand the concept
Level: ${levelInstructions[educationLevel]}
Quality: High-detail, classroom-ready visual`;

                    const result = await base44.functions.invoke('generateImagenAI', {
                      prompt: imagenPrompt,
                      aspectRatio: 'landscape'
                    });
                    
                    if (result.data?.url) {
                      generatedImage = { url: result.data.url };
                    }
                  } else {
                    // Use Nano Banana (default)
                    const imagePrompt = `Educational diagram and illustration showing: ${slide.image_prompt}

CRITICAL REQUIREMENTS FOR NANO BANANA:
- Clean, professional educational diagram style
- If text is needed, ensure PERFECT spelling of all scientific and technical terms
- Clear labels with correct spelling (double-check terms like "mitosis", "meiosis", "photosynthesis", etc.)
- Simple, clean design suitable for students at ${educationLevel} level
- No text artifacts or misspellings
- Professional educational quality suitable for classroom use

Context: ${topic} - ${slide.title}
Style: Illustrative diagram, infographic, or educational chart
Purpose: Help students understand ${slide.image_prompt}
Level: ${levelInstructions[educationLevel]}`;

                    generatedImage = await base44.integrations.Core.GenerateImage({
                      prompt: imagePrompt
                    });
                  }

                  if (generatedImage?.url) {
                    const imageDescription = slide.image_description || slide.title;
                    const contentWithImage = `<div style="text-align: center; margin-bottom: 24px;">
                      <img src="${generatedImage.url}" alt="${imageDescription}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.15);" />
                      <p style="font-size: 14px; color: #64748b; margin-top: 8px; font-style: italic;">${imageDescription}</p>
                    </div>${slide.content}`;

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
      }

      setGeneratedSlides(slides);
      onSlidesGenerated(slides);
      setHasGenerated(true);
      toast.success(`Generated ${slideCount} slides${includeImages ? (useWebImages ? ' with Unsplash images' : ' with AI-generated images') : ''}!`);
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

          {includeImages && useWebImages && (
            <div>
              <Label>Image Search Terms (Optional)</Label>
              <Input
                value={imageSearchTerms}
                onChange={(e) => setImageSearchTerms(e.target.value)}
                placeholder="e.g., biology diagrams, chemical structures, historical photos"
              />
              <p className="text-xs text-gray-500 mt-1">
                Specify custom search terms for images. Leave empty to use slide titles.
              </p>
            </div>
          )}

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
              <span className="font-semibold text-purple-900">Generate Educational Diagrams</span>
              <p className="text-xs text-purple-700 mt-1">
                AI-generated illustrative diagrams and infographics with correct spelling verification
              </p>
            </Label>
          </div>

          {includeImages && (
            <>
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <input
                  type="checkbox"
                  id="useWebImages"
                  checked={useWebImages}
                  onChange={(e) => setUseWebImages(e.target.checked)}
                  className="w-4 h-4 rounded text-green-600"
                />
                <Label htmlFor="useWebImages" className="flex-1 cursor-pointer text-sm">
                  <span className="font-semibold text-green-900">🌐 Use Web-Sourced Images</span>
                  <p className="text-xs text-green-700 mt-1">
                    Find real educational images from authoritative sources (unchecked = AI-generated images)
                  </p>
                </Label>
              </div>

              {!useWebImages && (
                <div className="space-y-2">
                  <Label>Image Generator</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setImageGenerator('nano-banana')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        imageGenerator === 'nano-banana'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-sm mb-1">🍌 Nano Banana</div>
                      <div className="text-xs text-gray-600">Fast diagrams</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageGenerator('dalle')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        imageGenerator === 'dalle'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-sm mb-1">✨ DALL-E 3</div>
                      <div className="text-xs text-gray-600">High-quality</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageGenerator('imagen')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        imageGenerator === 'imagen'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-sm mb-1">🎨 Stable Diffusion</div>
                      <div className="text-xs text-gray-600">Professional</div>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label>AI Provider</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setAiProvider('perplexity')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  aiProvider === 'perplexity'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-sm mb-1">🔍 Perplexity</div>
                <div className="text-xs text-gray-600">Web search & citations</div>
              </button>
              <button
                type="button"
                onClick={() => setAiProvider('chatgpt')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  aiProvider === 'chatgpt'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-sm mb-1">💬 GPT-3.5</div>
                <div className="text-xs text-gray-600">OpenAI GPT-3.5</div>
              </button>
              <button
                type="button"
                onClick={() => setAiProvider('canva')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  aiProvider === 'canva'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-sm mb-1">🎨 Canva AI</div>
                <div className="text-xs text-gray-600">Design-focused</div>
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={generateFromTopic}
              disabled={!topic.trim() || generating}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {hasGenerated ? 'Generate Again' : 'Generate Presentation'}
                </>
              )}
            </Button>
            
            {hasGenerated && !generating && (
              <Button
                onClick={generateFromTopic}
                disabled={!topic.trim()}
                variant="outline"
                className="px-6 border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                Regenerate
              </Button>
            )}
          </div>
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
      <li>• Searches high-quality images from Unsplash with proper attribution</li>
      <li>• Integrates visuals seamlessly with content</li>
      </ul>
      </div>

      <ImageSearchPreview
      isOpen={showImagePreview}
      onClose={() => setShowImagePreview(false)}
      onSelectImage={(image) => {
      // Handle image selection if needed
      toast.success('Image selected!');
      }}
      defaultQuery={imageSearchTerms || topic}
      />
      </div>
      );
      }