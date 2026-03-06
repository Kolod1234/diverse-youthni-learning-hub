import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Loader2, BookOpen, Brain } from 'lucide-react';
import { toast } from 'sonner';
import KnowledgeBaseUploader from '@/components/ai/KnowledgeBaseUploader';

export default function AIGenerateMode({ onSlidesGenerated }) {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [slideCount, setSlideCount] = useState(8);
  const [includeSpeakerNotes, setIncludeSpeakerNotes] = useState(true);
  const [contentType, setContentType] = useState('general');
  const [visualStyle, setVisualStyle] = useState('modern');
  const [aiProvider, setAiProvider] = useState('default');
  const [imageProvider, setImageProvider] = useState('base44');
  const [visualMode, setVisualMode] = useState('both');
  const [generating, setGenerating] = useState(false);
  const [useAILearning, setUseAILearning] = useState(true);

  // FIX #3: Moved sanitizeSlideContent above generateSlides so it is defined
  // before it is called. Arrow function (const) assignments are NOT hoisted,
  // so calling them before their definition throws a ReferenceError at runtime.
  const sanitizeSlideContent = (html) => {
    if (!html) return '<ul><li>Content here</li></ul>';
    // Wrap bare text in li if not already structured
    if (!html.includes('<ul>') && !html.includes('<li>')) {
      const lines = html.replace(/<[^>]+>/g, '').split('\n').filter(l => l.trim());
      return '<ul>' + lines.slice(0, 5).map(l => `<li>${l.trim()}</li>`).join('') + '</ul>';
    }
    return html;
  };

  const generateSlides = async () => {
    if (!topic.trim()) { toast.error('Please enter a topic'); return; }

    setGenerating(true);
    try {
      let learningContext = '';
      if (useAILearning) {
        try {
          // FIX #1a: Removed Markdown link syntax — was [toast.info](https://toast.info)(...)
          toast.info('AI analyzing past presentations...');
          const learningResult = await base44.functions.invoke('learnFromSlides', { topic, contentType });
          if (learningResult.data?.patterns) {
            const p = learningResult.data.patterns;
            learningContext = `\n\n--- AI LEARNED PATTERNS ---
PREFERRED STRUCTURES: ${p.slideStructures?.join('; ') || 'None yet'}
VISUAL PATTERNS: ${p.visualPatterns?.join('; ') || 'Standard'}
CONTENT ORGANIZATION: ${p.contentOrganization?.join('; ') || 'Default'}
STYLE PREFERENCES: ${p.stylePreferences?.join('; ') || 'Modern'}
TOPIC INSIGHTS: ${p.topicInsights || 'Researching...'}
--- Apply these learned preferences ---`;
          }
        } catch (err) {
          console.log('Learning failed, continuing');
        }
      }

      // FIX #1b: Removed Markdown link syntax — was [toast.info](https://toast.info)(...)
      toast.info('Generating slides...');

      const styleGuides = {
        modern: 'modern textbook style, clean lines, vibrant colors, professional',
        classic: 'traditional scientific illustration, detailed, neutral colors, academic',
        minimal: 'minimalist design, simple shapes, limited color palette, clean',
        colorful: 'bright and engaging, multiple colors, playful yet educational',
        technical: 'technical blueprint style, precise lines, engineering aesthetic'
      };

      const diagramInstructions = {
        general: 'Use "graph TD" (Flowcharts) or "mindmap" for concepts.',
        code: 'Use "sequenceDiagram" for code flow or "classDiagram" for architecture.',
        math: 'Use "graph LR" to show logical steps or dependencies.',
        history: 'Use "timeline" or "gantt" diagrams for chronological events.'
      };

      const prompt = `Create a COMPREHENSIVE educational presentation about "${topic}".
${description ? `Additional context: ${description}` : ''}
${learningContext}

Content Type: ${contentType.toUpperCase()}
Visual Style: ${visualStyle.toUpperCase()} - ${styleGuides[visualStyle]}

Generate EXACTLY ${slideCount} slides. This is a strict requirement — you MUST return exactly ${slideCount} slides, no more, no less.

CRITICAL CONTENT RULES:
1. Each slide covers ONE specific concept or subtopic only. Do NOT cram multiple topics into one slide.
2. Content per slide: MAXIMUM 5 bullet points. Each bullet point is ONE short sentence (max 12 words).
3. Use LaTeX math notation wrapped in $...$ for ALL scientific formulas, equations and notation.
   Examples: $H_2SO_4$, $E = mc^2$, $\\frac{d}{dx}[x^n] = nx^{n-1}$, $\\sum_{i=1}^{n} x_i$
4. Content HTML must use ONLY these tags: <ul>, <li>, <strong>, <em>. NO <p> tags, NO inline styles.
5. Each <li> must be concise — one clear point per bullet.
6. If contentType is "math" or "science", EVERY slide must include at least one LaTeX formula.

SLIDE STRUCTURE — follow this exact pattern:
- Slide 1: Title/Introduction slide (overview of topic)
- Slides 2 to ${slideCount - 1}: One concept per slide, progressing logically
- Slide ${slideCount}: Summary/Conclusion slide

VISUALIZATION RULES:
Visual Mode: ${visualMode.toUpperCase()}
${visualMode === 'diagrams' ? '- ONLY use diagramCode (Mermaid.js) — NO labeledIllustration' : ''}
${visualMode === 'images' ? '- ONLY use labeledIllustration — NO diagramCode' : ''}
${visualMode === 'both' ? '- Use diagramCode OR labeledIllustration on every slide where visual adds value' : ''}

MERMAID DIAGRAM RULES (diagramCode field):
- Raw Mermaid.js syntax only — no markdown, no backticks
- Node IDs: simple alphanumeric only (A, B, C1, step1) — NO spaces, NO special chars
- Node labels in brackets: A[Label Text]
- Connections: A-->B
- ${diagramInstructions[contentType]}
- Example valid syntax:
  graph TD
  A[Start]-->B[Process]
  B-->C[End]

LABELED ILLUSTRATION RULES (labeledIllustration field):
- Use for: anatomy, chemistry structures, geography, engineering diagrams
- baseImagePrompt: describe layout clearly, end with "clean white background, technical illustration style"
- labels: 5-12 labels with text, x (0-100), y (0-100), type (header/pointer/subtext)

${includeSpeakerNotes ? 'Include speakerNotes for each slide (2-3 sentences for the presenter).' : ''}

Return JSON with a "slides" array. REMEMBER: exactly ${slideCount} slides.`;

      const jsonSchema = {
        type: 'object',
        properties: {
          slides: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                content: { 
                  type: 'string',
                  description: 'HTML using ONLY <ul><li><strong><em> tags. Max 5 bullet points. Use $LaTeX$ for math/science formulas.'
                },
                diagramCode: { 
                  type: 'string',
                  description: 'RAW Mermaid.js syntax only. No backticks, no markdown fences.'
                },
                labeledIllustration: {
                  type: 'object',
                  properties: {
                    baseImagePrompt: { type: 'string' },
                    labels: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          text: { type: 'string' },
                          x: { type: 'number' },
                          y: { type: 'number' },
                          type: { type: 'string', enum: ['header', 'pointer', 'subtext'] }
                        }
                      }
                    }
                  }
                },
                speakerNotes: { type: 'string' }
              }
            }
          }
        }
      };

      let slideData;
      if (aiProvider === 'perplexity') {
        const response = await base44.functions.invoke('perplexitySearch', {
          query: prompt,
          return_json: true,
          json_schema: jsonSchema
        });
        slideData = response.data;
      } else {
        slideData = await base44.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: aiProvider === 'default_research',
          response_json_schema: jsonSchema
        });
      }

      let slides = slideData?.slides || [];
      if (!Array.isArray(slides) || slides.length === 0) {
        throw new Error('AI returned no slides. Please try again.');
      }

      // Enforce slide count — trim or warn
      if (slides.length > slideCount) slides = slides.slice(0, slideCount);

      slides = slides.map((slide, idx) => ({
        ...slide,
        id: Date.now() + idx,
        order: idx + 1,
        // Clean up any AI content that slipped through with wrong tags
        content: sanitizeSlideContent(slide.content),
        labeledIllustration: slide.labeledIllustration
          ? { ...slide.labeledIllustration, imageProvider }
          : undefined
      }));

      // Track analytics
      if (useAILearning && slides.length > 0) {
        try {
          await Promise.all(slides.map(slide =>
            base44.entities.SlideAnalytics.create({
              slide_content: slide.content,
              slide_title: slide.title,
              topic,
              visual_type: slide.diagramCode ? (slide.labeledIllustration ? 'both' : 'diagram') :
                           (slide.labeledIllustration ? 'image' : 'none'),
              content_type: contentType,
              visual_style: visualStyle,
              success_score: 100
            })
          ));
        } catch (err) {
          console.log('Analytics tracking failed:', err);
        }
      }

      onSlidesGenerated(slides);
      toast.success(`${slides.length} slides generated!`);
    } catch (error) {
      console.error('Generation error:', error);
      // FIX #1c: Removed Markdown link corruption — was [error.me](https://error.me)ssage
      // which split the word "message" and always fell through to the fallback string.
      toast.error(error.message || 'Failed to generate slides. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-medium">Intelligent AI System</span>
        </div>
        <KnowledgeBaseUploader />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Presentation Topic</Label>
          <Input
            id="topic"
            placeholder="e.g., The History of Artificial Intelligence"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Additional Context (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Specific areas to focus on, target audience, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Number of Slides</Label>
            <Input
              type="number"
              min={3}
              {/* FIX #2: Restored the truncated max prop — was cut off as "ma" */}
              max={30}
              value={slideCount}
              onChange={(e) => setSlideCount(Math.min(30, Math.max(3, parseInt(e.target.value) || 8)))}
            />
            <p className="text-xs text-gray-400">3 – 30 slides</p>
          </div>
          <div className="space-y-2">
            <Label>Content Type</Label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            >
              <option value="general">General</option>
              <option value="code">Coding / Technical</option>
              <option value="math">Math / Science</option>
              <option value="history">History / Social Studies</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Visual Style</Label>
          <select
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={visualStyle}
            onChange={(e) => setVisualStyle(e.target.value)}
          >
            <option value="modern">Modern Textbook</option>
            <option value="classic">Classic Scientific</option>
            <option value="minimal">Minimal Clean</option>
            <option value="colorful">Bright & Engaging</option>
            <option value="technical">Technical Blueprint</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="speaker-notes" checked={includeSpeakerNotes} onCheckedChange={setIncludeSpeakerNotes} />
          <Label htmlFor="speaker-notes">Generate Speaker Notes</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="ai-learning" checked={useAILearning} onCheckedChange={setUseAILearning} />
          <Label htmlFor="ai-learning" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Use AI Learning
          </Label>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Visual Content Type</Label>
          <div className="flex gap-2">
            {[['both', '📊 + 🖼️ Both'], ['diagrams', '📊 Diagrams'], ['images', '🖼️ Images']].map(([val, label]) => (
              <Button
                key={val}
                variant={visualMode === val ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVisualMode(val)}
                className="text-xs flex-1"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Text AI Model</Label>
            <div className="flex flex-col gap-2">
              {[
                ['default', 'Standard'],
                ['default_research', 'Web Research'],
                ['perplexity', 'Deep Research'],
              ].map(([val, label]) => (
                <Button
                  key={val}
                  variant={aiProvider === val ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAiProvider(val)}
                  className="text-xs w-full"
                >
                  {val === 'perplexity' && <BookOpen className="w-3 h-3 mr-1" />}
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Image Generator
              {visualMode === 'diagrams' && <span className="text-xs text-gray-400 ml-1">(disabled)</span>}
            </Label>
            <div className="flex flex-col gap-2">
              {[
                ['base44', 'Base44 AI'],
                ['dalle', 'DALL-E 3'],
                ['flux2', 'Flux 2'],
                ['canva', 'Canva AI'],
                ['modelslab', 'ModelLabs'],
              ].map(([val, label]) => (
                <Button
                  key={val}
                  variant={imageProvider === val ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setImageProvider(val)}
                  className="text-xs w-full"
                  disabled={visualMode === 'diagrams'}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Button
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
        size="lg"
        onClick={generateSlides}
        disabled={generating}
      >
        {generating ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{useAILearning ? 'AI Learning & Generating...' : 'Generating...'}</>
        ) : (
          <>{useAILearning ? <Brain className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}Generate {useAILearning ? 'Intelligent ' : ''}Presentation</>
        )}
      </Button>
    </div>
  );
}