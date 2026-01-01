import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Loader2, Image as ImageIcon, BarChart2, Zap, BookOpen } from 'lucide-react';
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
        general: 'Use clear, educational language with extensive bullet points, real-world examples, case studies, and practical applications. Include statistics, research findings, and expert insights.',
        code: 'Include multiple complete code examples with detailed line-by-line explanations, best practices, common pitfalls to avoid, performance considerations, and real-world use cases. Use <pre><code> tags for code blocks with proper syntax.',
        math: 'Include comprehensive mathematical equations, formulas with complete derivations, step-by-step problem solving with explanations for each step, worked examples, visual diagrams, and practical applications. Use proper mathematical notation and explain the reasoning behind each step.',
        history: 'Present detailed chronological information with specific dates, key historical figures with their contributions, detailed analysis of causes and effects, historical context, primary source references, and long-term impacts on society.'
      };

      const prompt = `Create a COMPREHENSIVE educational presentation about "${topic}".
      ${description ? `Additional context: ${description}` : ''}

      Content Type: ${contentType.toUpperCase()}
      Special Instructions: ${contentInstructions[contentType]}

      Generate exactly ${slideCount} slides with MAXIMUM detail and depth.

      CRITICAL CONTENT REQUIREMENTS - Create EXTENSIVE, IN-DEPTH content for each slide:

      1. QUANTITY: Write 6-8 detailed bullet points per slide (minimum 5, maximum 10)
      2. DEPTH: Each bullet point MUST be 3-5 complete sentences with:
      - Specific facts, data, and statistics
      - Real-world examples and case studies
      - Expert insights and research findings
      - Practical applications and implications
      - Supporting evidence and reasoning

      3. STRUCTURE: Organize content with:
      - Main concepts with thorough explanations
      - Subpoints using <ul> within <li> for nested details
      - Use <h4> subheadings to break down complex topics
      - Use <strong> to highlight key terms and concepts
      - Use <em> for emphasis on important points

      4. CONTENT TYPE SPECIFIC:
      - Code: Multiple complete examples (10-30 lines each), detailed explanations of logic, best practices, edge cases, performance tips
      - Math: Full derivations, multiple worked examples, step-by-step solutions with reasoning, alternative approaches
      - History: Detailed timelines, key figures with biographies, comprehensive cause-effect analysis, social/economic/political context
      - General: Deep dive into concepts, multiple perspectives, research-backed information, practical applications

      5. NO SUMMARIES: Avoid high-level overviews. Provide specific, actionable, detailed information.

      Format requirements for 'content':
      - Return semantic HTML (<ul>, <li>, <p>, <strong>, <em>, <pre>, <code>, <h3>, <h4>)
      - Use nested <ul> within <li> for subpoints and additional details
      - DO NOT use inline styles (style="...")
      - DO NOT include <img> tags in the content
      - Use <h4> for section headers within slides
      - For code: Use <pre><code> with complete, runnable examples
      - For math: Use proper notation, show all work

      For each slide return:
      - title: string (specific and descriptive)
      - content: html string (extensive detail, NOT summary)
      - imagePrompt: string (detailed visual description for diagram/illustration)
      ${includeSpeakerNotes ? '- speakerNotes: string (comprehensive talking points with additional context, examples, and teaching tips - 5-6 sentences minimum)' : ''}

      Return JSON with a "slides" array.`;

      let slideData;

      const jsonSchema = {
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
      };

      if (aiProvider === 'perplexity') {
        // Use Perplexity for deep web-grounded research
        const response = await base44.functions.invoke('perplexitySearch', {
          query: prompt,
          return_json: true,
          json_schema: jsonSchema
        });
        slideData = response.data;
      } else if (aiProvider === 'academic') {
        // Academic mode: Use LLM with enhanced prompt for maximum detail
        const academicPrompt = prompt + `\n\nACADEMIC MODE: Provide scholarly-level depth with:
      - Extensive research-backed information
      - Multiple perspectives and viewpoints
      - Theoretical frameworks and concepts
      - Critical analysis and evaluation
      - Historical context and development
      - Current debates and controversies
      - Future implications and trends
      - Cross-references between concepts
      Write as if creating an academic textbook chapter with maximum comprehensiveness.`;

        slideData = await base44.integrations.Core.InvokeLLM({
          prompt: academicPrompt,
          add_context_from_internet: true,
          response_json_schema: jsonSchema
        });
      } else {
        // Use default LLM with optional web research
        slideData = await base44.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: aiProvider === 'default_research',
          response_json_schema: jsonSchema
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
            } else if (imageProvider === 'vertex') {
              imageResult = await base44.functions.invoke('generateImageWithVertex', {
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
            <Label>AI Research Mode</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
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
                <div className="text-xs font-medium">Standard AI</div>
                <div className="text-[10px] text-gray-500 mt-1">Fast, comprehensive</div>
              </button>
              <button
                onClick={() => setAiProvider('default_research')}
                disabled={generating}
                className={`p-3 rounded-lg border-2 transition-all ${
                  aiProvider === 'default_research'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <BarChart2 className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <div className="text-xs font-medium">Web Research</div>
                <div className="text-[10px] text-gray-500 mt-1">Real-time data</div>
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
                <div className="text-xs font-medium">Perplexity Pro</div>
                <div className="text-[10px] text-gray-500 mt-1">Deep research + citations</div>
              </button>
              <button
                onClick={() => setAiProvider('academic')}
                disabled={generating}
                className={`p-3 rounded-lg border-2 transition-all ${
                  aiProvider === 'academic'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <BookOpen className="w-5 h-5 mx-auto mb-1 text-green-600" />
                <div className="text-xs font-medium">Academic</div>
                <div className="text-[10px] text-gray-500 mt-1">Scholarly depth</div>
              </button>
            </div>
            <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
              <strong className="block mb-1 text-slate-700">Selected Mode:</strong>
              {aiProvider === 'default' && '• Fast comprehensive content generation using advanced AI'}
              {aiProvider === 'default_research' && '• Enhanced with live web search for current statistics, facts, and real-world examples'}
              {aiProvider === 'perplexity' && '• Deep web research with multiple sources, citations, and up-to-date information'}
              {aiProvider === 'academic' && '• Maximum detail with scholarly depth, comprehensive analysis, and extensive research'}
            </div>
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
                      onClick={() => setImageProvider('vertex')}
                      disabled={generating}
                      className={`p-2 rounded-lg border-2 transition-all text-xs ${
                        imageProvider === 'vertex'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Google Vertex
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

      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4">
        <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Advanced Features
        </h4>
        <ul className="text-sm text-indigo-700 space-y-2">
          <li>• <strong>Deep Content Generation:</strong> 6-8 detailed points per slide with comprehensive explanations</li>
          <li>• <strong>Research Modes:</strong> Standard AI, Web Research, Perplexity Pro, or Academic depth</li>
          <li>• <strong>Specialized Types:</strong> General, Code (with examples), Math (with proofs), History (with analysis)</li>
          <li>• <strong>Image AI:</strong> Base44, DALL-E 3, Google Vertex, Stability AI with custom aspect ratios</li>
          <li>• <strong>Real-Time Data:</strong> Web search integration for current statistics and facts</li>
          <li>• <strong>Speaker Notes:</strong> Detailed 5-6 sentence talking points with teaching tips</li>
          <li>• <strong>Full Customization:</strong> Editable slides with 6 visual themes</li>
        </ul>
      </div>
    </div>
  );
}