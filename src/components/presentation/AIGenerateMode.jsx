import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Loader2, Image as ImageIcon, BarChart2, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function AIGenerateMode({ onSlidesGenerated }) {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [includeImages, setIncludeImages] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(false);
  const [includeSpeakerNotes, setIncludeSpeakerNotes] = useState(true);
  const [contentType, setContentType] = useState('general'); // 'general', 'code', 'math', 'history'
  const [aiProvider, setAiProvider] = useState('default'); // 'default' or 'perplexity'
  const [imageProvider, setImageProvider] = useState('base44'); // 'base44', 'manus', 'dalle', 'stability'
  const [imageAspectRatio, setImageAspectRatio] = useState('16:9'); // '16:9', '1:1', '4:3', '9:16'
  const [generating, setGenerating] = useState(false);

  const generateSlides = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setGenerating(true);
    try {
      toast.info('Generating slide structure...');

      // Step 1: Generate slide structure with specialized instructions
      const contentInstructions = {
        general: 'Use clear, educational language with bullet points and examples',
        code: 'Include code examples with syntax highlighting, best practices, and step-by-step explanations. Use <pre><code> tags for code blocks',
        math: 'Include mathematical equations, formulas, step-by-step problem solving, and visual diagrams. Use proper mathematical notation',
        history: 'Present information chronologically with dates, key figures, causes and effects, and historical context'
      };

      const prompt = `Create an educational presentation about "${topic}".
      ${description ? `Additional context: ${description}` : ''}

      Content Type: ${contentType.toUpperCase()}
      Special Instructions: ${contentInstructions[contentType]}

      Generate exactly ${slideCount} slides.

      CRITICAL: Create DETAILED, COMPREHENSIVE content for each slide:
      - Write 4-6 bullet points per slide with DETAILED explanations (not just one-line summaries)
      - Each bullet point should be 2-3 sentences with specific information, examples, and context
      - Include relevant facts, statistics, definitions, and real-world applications
      - For code: Include full working examples with explanations
      - For math: Show complete solutions with step-by-step reasoning
      - For history: Provide detailed context, causes, effects, and significance

      Format requirements for 'content':
      - Return semantic HTML (<ul>, <li>, <p>, <strong>, <em>, <pre>, <code>, <h3>, <h4>)
      - DO NOT use inline styles (style="...")
      - DO NOT include <img> tags in the content
      - Use <strong> for emphasis and key terms
      - Use subheadings (<h4>) to organize complex information
      - For code content type: Include practical code examples in <pre><code> blocks
      - For math content type: Include formulas and equations
      - For history content type: Include dates and timelines

      For each slide return:
      - title: string
      - content: html string (detailed, not summary)
      - imagePrompt: string (visual description for an image)
      ${includeSpeakerNotes ? '- speakerNotes: string (detailed talking points for the presenter, 3-4 sentences)' : ''}

      Return JSON with a "slides" array.`;

      let slideData;
      
      if (aiProvider === 'perplexity') {
        // Use Perplexity for web-grounded research
        const response = await base44.functions.invoke('perplexitySearch', {
          query: prompt,
          return_json: true,
          json_schema: {
            type: 'object',
            properties: {
              slides: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    content: { type: 'string' },
                    imagePrompt: { type: 'string' },
                    speakerNotes: { type: 'string' }
                  }
                }
              }
            }
          }
        });
        slideData = response.data;
      } else {
        // Use default LLM
        slideData = await base44.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: aiProvider === 'default_research',
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
                    imagePrompt: { type: 'string' },
                    speakerNotes: { type: 'string' }
                  }
                }
              }
            }
          }
        });
      }

      let slides = slideData.slides || [];

      // Step 2: Generate images
      if (includeImages) {
        toast.info('Generating slide visuals...');

        const imagePromises = slides.map(async (slide, idx) => {
          // If no prompt, just return the slide as is
          if (!slide.imagePrompt) return { ...slide, order: idx + 1 };

          try {
            console.log(`Generating image for slide ${idx + 1}:`, slide.imagePrompt);

            let imageResult;
            const enhancedPrompt = `Educational diagram, flat vector style, white background: ${slide.imagePrompt}`;

            // Map aspect ratio for different providers
            const dalleSize = imageAspectRatio === '1:1' ? '1024x1024' : '1792x1024';

            // Choose image provider
            if (imageProvider === 'base44') {
              const result = await base44.integrations.Core.GenerateImage({
                prompt: enhancedPrompt
              });
              imageResult = { data: { url: result.url } };
            } else if (imageProvider === 'dalle') {
              imageResult = await base44.functions.invoke('generateImageWithDallE', {
                prompt: enhancedPrompt,
                size: dalleSize
              });
            } else if (imageProvider === 'stability') {
              imageResult = await base44.functions.invoke('generateImageWithStability', {
                prompt: enhancedPrompt,
                aspect_ratio: imageAspectRatio
              });
            } else {
              // Default to Manus
              imageResult = await base44.functions.invoke('generateImageWithManus', {
                prompt: enhancedPrompt,
                aspect_ratio: imageAspectRatio
              });
            }

            console.log(`Result for slide ${idx + 1}:`, imageResult);

            // Check for URL in likely locations (adjust based on your actual API response)
            const imageUrl = imageResult.data?.url || imageResult?.url || imageResult?.response?.url;

            if (imageUrl) {
              return { 
                ...slide, 
                imageUrl: imageUrl, // Store image SEPARATELY, don't inject into HTML
                order: idx + 1 
              };
            } else {
              console.warn('Image generated but no URL found in response', imageResult);
              return { ...slide, order: idx + 1 };
            }
          } catch (error) {
            console.error(`Image gen failed for slide ${idx + 1}:`, error);
            // Return slide without image rather than failing completely
            return { ...slide, order: idx + 1 };
          }
        });

        slides = await Promise.all(imagePromises);
      } else {
        slides = slides.map((slide, idx) => ({ ...slide, order: idx + 1 }));
      }

      onSlidesGenerated(slides);
      toast.success('Presentation generated!');
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

          <div>
            <Label>Content Type</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => setContentType('general')}
                disabled={generating}
                className={`p-2 rounded-lg border-2 transition-all text-xs ${
                  contentType === 'general'
                    ? 'border-indigo-600 bg-indigo-50 font-semibold'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                📚 General
              </button>
              <button
                onClick={() => setContentType('code')}
                disabled={generating}
                className={`p-2 rounded-lg border-2 transition-all text-xs ${
                  contentType === 'code'
                    ? 'border-green-600 bg-green-50 font-semibold'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                💻 Code Examples
              </button>
              <button
                onClick={() => setContentType('math')}
                disabled={generating}
                className={`p-2 rounded-lg border-2 transition-all text-xs ${
                  contentType === 'math'
                    ? 'border-blue-600 bg-blue-50 font-semibold'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                🔢 Mathematics
              </button>
              <button
                onClick={() => setContentType('history')}
                disabled={generating}
                className={`p-2 rounded-lg border-2 transition-all text-xs ${
                  contentType === 'history'
                    ? 'border-amber-600 bg-amber-50 font-semibold'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                📜 History/Timeline
              </button>
            </div>
          </div>

          <div>
            <Label>AI Content Provider</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <button
                onClick={() => setAiProvider('default')}
                disabled={generating}
                className={`p-3 rounded-lg border-2 transition-all ${
                  aiProvider === 'default'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Sparkles className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                <div className="text-xs font-medium">Standard</div>
              </button>
              <button
                onClick={() => setAiProvider('default_research')}
                disabled={generating}
                className={`p-3 rounded-lg border-2 transition-all ${
                  aiProvider === 'default_research'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <BarChart2 className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                <div className="text-xs font-medium">Research</div>
              </button>
              <button
                onClick={() => setAiProvider('perplexity')}
                disabled={generating}
                className={`p-3 rounded-lg border-2 transition-all ${
                  aiProvider === 'perplexity'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Zap className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                <div className="text-xs font-medium">Perplexity</div>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {aiProvider === 'default' && '• Fast generation with standard AI'}
              {aiProvider === 'default_research' && '• Enhanced with web search for current info'}
              {aiProvider === 'perplexity' && '• Real-time web search with citations'}
            </p>
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
              <BarChart2 className="w-4 h-4 text-purple-600" />
              <Label className="cursor-pointer">Speaker Notes</Label>
            </div>
            <Switch
              checked={includeSpeakerNotes}
              onCheckedChange={setIncludeSpeakerNotes}
              disabled={generating}
            />
          </div>

            {includeImages && (
              <div className="ml-6 pt-2 space-y-3">
                <div>
                  <Label className="text-xs text-gray-600 mb-2 block">Image Generator</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setImageProvider('base44')}
                      disabled={generating}
                      className={`p-2 rounded-lg border-2 transition-all text-xs ${
                        imageProvider === 'base44'
                          ? 'border-indigo-600 bg-indigo-50 font-semibold'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Base44 AI
                    </button>
                    <button
                      onClick={() => setImageProvider('dalle')}
                      disabled={generating}
                      className={`p-2 rounded-lg border-2 transition-all text-xs ${
                        imageProvider === 'dalle'
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      DALL-E 3
                    </button>
                    <button
                      onClick={() => setImageProvider('manus')}
                      disabled={generating}
                      className={`p-2 rounded-lg border-2 transition-all text-xs ${
                        imageProvider === 'manus'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Manus
                    </button>
                    <button
                      onClick={() => setImageProvider('stability')}
                      disabled={generating}
                      className={`p-2 rounded-lg border-2 transition-all text-xs ${
                        imageProvider === 'stability'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Stability AI
                    </button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-gray-600 mb-2 block">Aspect Ratio</Label>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => setImageAspectRatio('16:9')}
                      disabled={generating}
                      className={`p-2 rounded-lg border-2 transition-all text-xs ${
                        imageAspectRatio === '16:9'
                          ? 'border-indigo-600 bg-indigo-50 font-semibold'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      16:9
                    </button>
                    <button
                      onClick={() => setImageAspectRatio('1:1')}
                      disabled={generating}
                      className={`p-2 rounded-lg border-2 transition-all text-xs ${
                        imageAspectRatio === '1:1'
                          ? 'border-indigo-600 bg-indigo-50 font-semibold'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      1:1
                    </button>
                    <button
                      onClick={() => setImageAspectRatio('4:3')}
                      disabled={generating}
                      className={`p-2 rounded-lg border-2 transition-all text-xs ${
                        imageAspectRatio === '4:3'
                          ? 'border-indigo-600 bg-indigo-50 font-semibold'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      4:3
                    </button>
                    <button
                      onClick={() => setImageAspectRatio('9:16')}
                      disabled={generating}
                      className={`p-2 rounded-lg border-2 transition-all text-xs ${
                        imageAspectRatio === '9:16'
                          ? 'border-indigo-600 bg-indigo-50 font-semibold'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      9:16
                    </button>
                  </div>
                </div>
              </div>
            )}

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
          <li>• <strong>Specialized content types:</strong> General, Code, Math, History</li>
          <li>• <strong>AI models:</strong> Standard, Research, or Perplexity</li>
          <li>• <strong>Image generators:</strong> Base44, DALL-E, Manus, Stability</li>
          <li>• <strong>Speaker notes:</strong> Auto-generated talking points</li>
          <li>• <strong>Real-time data:</strong> Web-grounded research content</li>
          <li>• Fully editable after generation</li>
        </ul>
      </div>
    </div>
  );
}