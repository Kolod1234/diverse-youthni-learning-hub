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

  const sanitizeSlideContent = (html) => {
    if (!html) return '<ul><li>Content here</li></ul>';

    // Strip markdown code fences AI sometimes wraps content in
    let clean = html
      .replace(/```html\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();

    // If plain text with no HTML tags at all, convert lines to bullets
    if (!clean.includes('<')) {
      const lines = clean.split('\n').filter(l => l.trim());
      return '<ul>' + lines.slice(0, 5).map(l => `<li>${l.trim()}</li>`).join('') + '</ul>';
    }

    // If it has <p> tags but no bullets, convert paragraphs to bullet points
    if (!clean.includes('<ul>') && !clean.includes('<li>') && clean.includes('<p>')) {
      const matches = [...clean.matchAll(/<p[^>]*>(.*?)<\/p>/gs)];
      if (matches.length > 0) {
        return '<ul>' + matches.slice(0, 5).map(m => `<li>${m[1].trim()}</li>`).join('') + '</ul>';
      }
    }

    // If has no list structure at all, wrap lines in bullets
    if (!clean.includes('<ul>') && !clean.includes('<li>')) {
      const lines = clean.replace(/<[^>]+>/g, '').split('\n').filter(l => l.trim());
      return '<ul>' + lines.slice(0, 5).map(l => `<li>${l.trim()}</li>`).join('') + '</ul>';
    }

    return clean;
  };

  const generateSlides = async () => {
    if (!topic.trim()) { toast.error('Please enter a topic'); return; }

    setGenerating(true);
    try {
      let learningContext = '';
      if (useAILearning) {
        try {
          // FIX 1 (line 65): Removed markdown hyperlink wrapping around toast.info(...)
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

      // FIX 2 (line 82): Removed markdown hyperlink wrapping around toast.info(...)
      toast.info('Generating slides...');

      const styleGuides = {
        modern: 'premium modern presentation design, clean visual hierarchy, elegant spacing, strong contrast, polished educational layout',
        classic: 'refined academic presentation design, balanced composition, subtle color palette, formal and credible visual style',
        minimal: 'minimal premium slide design, lots of white space, crisp typography, restrained accents, clean editorial look',
        colorful: 'visually rich educational design, vibrant but controlled colors, engaging composition, modern classroom-friendly polish',
        technical: 'technical presentation design, structured layout, data-driven visual language, precise diagrams, professional blueprint aesthetic'
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
4. Content HTML must use ONLY these tags: <ul>, <li>, <strong>, <em>. NO <p> tags, NO inline styles, NO markdown.
5. Each <li> must be concise — one clear point per bullet.
6. NEVER wrap content in markdown code fences like backtick backtick backtick html — output raw HTML only.
7. If contentType is "math" or "science", EVERY slide must include at least one LaTeX formula.

PROFESSIONAL SLIDE DESIGN RULES:
1. Titles must be short, punchy, and presentation-style, not paragraph-like.
2. Each slide should have a clear layout intent such as: hero intro, comparison, process flow, concept explainer, timeline, formula breakdown, checklist, summary.
3. Prefer content that is visually chunked into 3-5 strong bullets rather than dense explanation.
4. Make slides feel visually dynamic by varying slide purpose across the deck.
5. Include a visual on almost every slide where it improves understanding.
6. Use concrete examples, comparisons, sequences, or frameworks to make slides feel polished.
7. For intro and closing slides, make the content broader and more presentation-like rather than overly detailed.

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
- Prefer diagrams that look presentation-worthy: clean flows, comparisons, systems, steps, cycles, hierarchies
- Example valid syntax:
  graph TD
  A[Start]-->B[Process]
  B-->C[End]

LABELED ILLUSTRATION RULES (labeledIllustration field):
- Use for: anatomy, chemistry structures, geography, engineering diagrams
- baseImagePrompt: describe layout clearly, end with "clean white background, technical illustration style"
- labels: 5-12 labels with text, x (0-100), y (0-100), type (header/pointer/subtext)
- Prompts should describe visually appealing, polished educational graphics, not generic stock visuals

${includeSpeakerNotes ? 'Include speakerNotes for each slide (2-3 sentences for the presenter).' : ''}

OUTPUT QUALITY RULES:
- Avoid repetitive titles like "Key Concept 1" or "Important Information"
- Avoid generic bullets that could fit any topic
- Make each slide feel distinct and purposeful
- Favor clarity, elegance, and presentation quality over sheer volume of text

Return JSON with a "slides" array. REMEMBER: exactly ${slideCount} slides. NO markdown fences anywhere in the response.`;

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
                  description: 'Raw HTML ONLY using <ul><li><strong><em> tags. Max 5 bullet points. NO markdown, NO code fences, NO backticks.'
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

      // Enforce exact slide count: truncate if too many, pad if too few
      if (slides.length > slideCount) {
        slides = slides.slice(0, slideCount);
      } else if (slides.length < slideCount) {
        // Pad with placeholder slides to reach requested count
        const missingCount = slideCount - slides.length;
        for (let i = 0; i < missingCount; i++) {
          slides.push({
            title: `Additional Content ${i + 1}`,
            content: '<ul><li>Content to be added</li></ul>',
            order: slides.length + 1
          });
        }
      }

      slides = slides.map((slide, idx) => ({
        ...slide,
        id: Date.now() + idx,
        order: idx + 1,
        content: sanitizeSlideContent(slide.content),
        labeledIllustration: slide.labeledIllustration
          ? { ...slide.labeledIllustration, imageProvider }
          : undefined
      }));

      if (useAILearning && slides.length > 0) {
        try {
          await Promise.all(slides.map(slide =>
            base44.entities.SlideAnalytics.create({
              slide_content: slide.content,
              slide_title: slide.title,
              topic,
              visual_type: slide.diagramCode
                ? (slide.labeledIllustration ? 'both' : 'diagram')
                : (slide.labeledIllustration ? 'image' : 'none'),
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
      // FIX 3 (line 248): Removed markdown hyperlink wrapping around error.message
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
            <option value="colorful">Bright &amp; Engaging</option>
            <option value="technical">Technical Blueprint</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="speaker-notes"
            checked={includeSpeakerNotes}
            onCheckedChange={setIncludeSpeakerNotes}
          />
          <Label htmlFor="speaker-notes">Generate Speaker Notes</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="ai-learning"
            checked={useAILearning}
            onCheckedChange={setUseAILearning}
          />
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
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {useAILearning ? 'AI Learning & Generating...' : 'Generating...'}
          </>
        ) : (
          <>
            {useAILearning ? <Brain className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate {useAILearning ? 'Intelligent ' : ''}Presentation
          </>
        )}
      </Button>
    </div>
  );
}