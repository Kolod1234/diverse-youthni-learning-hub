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
  const [slideCount, setSlideCount] = useState(5);
  const [includeSpeakerNotes, setIncludeSpeakerNotes] = useState(true);
  const [contentType, setContentType] = useState('general'); 
  const [visualStyle, setVisualStyle] = useState('modern');
  const [aiProvider, setAiProvider] = useState('default');
  const [imageProvider, setImageProvider] = useState('base44');
  const [visualMode, setVisualMode] = useState('both'); // 'images', 'diagrams', 'both'
  const [generating, setGenerating] = useState(false);
  const [useAILearning, setUseAILearning] = useState(true);

  const generateSlides = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setGenerating(true);
    try {
      // Learn from past slides if enabled
      let learningContext = '';
      if (useAILearning) {
        try {
          toast.info('AI analyzing past presentations...');
          const learningResult = await base44.functions.invoke('learnFromSlides', {
            topic,
            contentType
          });
          
          if (learningResult.data?.patterns) {
            const p = learningResult.data.patterns;
            learningContext = `\n\n--- AI LEARNED PATTERNS (from ${learningResult.data.successfulSlidesCount} successful slides) ---
PREFERRED STRUCTURES: ${p.slideStructures?.join('; ') || 'None yet'}
VISUAL PATTERNS: ${p.visualPatterns?.join('; ') || 'Standard'}
CONTENT ORGANIZATION: ${p.contentOrganization?.join('; ') || 'Default'}
STYLE PREFERENCES: ${p.stylePreferences?.join('; ') || 'Modern'}
TOPIC INSIGHTS: ${p.topicInsights || 'Researching...'}
--- Apply these learned preferences to this presentation ---`;
          }
        } catch (err) {
          console.log('Learning failed, continuing with standard generation');
        }
      }
      
      toast.info('Generating intelligent slides...');

      // Specialized instructions for diagram types based on content
      const diagramInstructions = {
        general: 'Use "graph TD" (Flowcharts) or "mindmap" for concepts.',
        code: 'Use "sequenceDiagram" to show code execution flow or "classDiagram" for architecture.',
        math: 'Use "graph LR" to show logical steps or dependencies.',
        history: 'Use "timeline" or "gantt" diagrams for chronological events.'
      };

      const styleGuides = {
        modern: 'modern textbook style, clean lines, vibrant colors, professional',
        classic: 'traditional scientific illustration, detailed, neutral colors, academic',
        minimal: 'minimalist design, simple shapes, limited color palette, clean',
        colorful: 'bright and engaging, multiple colors, playful yet educational',
        technical: 'technical blueprint style, precise lines, engineering aesthetic'
      };

      const prompt = `Create a COMPREHENSIVE educational presentation about "${topic}".
      ${description ? `Additional context: ${description}` : ''}
      ${learningContext}

      Content Type: ${contentType.toUpperCase()}
      Visual Style: ${visualStyle.toUpperCase()} - ${styleGuides[visualStyle]}

      Generate exactly ${slideCount} slides with CONSISTENT visual style throughout.

      --- VISUALIZATION STRATEGY (CRITICAL) ---
      Visual Mode: ${visualMode.toUpperCase()}
      ${visualMode === 'diagrams' ? 'ONLY use diagramCode (Mermaid.js) - NO labeledIllustration' : ''}
      ${visualMode === 'images' ? 'ONLY use labeledIllustration - NO diagramCode' : ''}
      ${visualMode === 'both' ? 'Use BOTH diagramCode AND labeledIllustration where appropriate' : ''}

      1. FLOWCHARTS/PROCESSES: Use 'diagramCode' (Mermaid.js)${visualMode === 'images' ? ' - SKIP THIS if mode is images-only' : ''}
         - For: workflows, timelines, organizational charts, decision trees, process flows
         - CRITICAL: Generate VALID Mermaid.js syntax only (no markdown blocks, no backticks, just raw code)
         - ${diagramInstructions[contentType]}
         - IMPORTANT MERMAID RULES:
           * Node IDs must be simple (A, B, C1, step1) - NO spaces, NO special chars except underscore
           * Node labels in brackets: A[Label Text]
           * Connections: A-->B or A---|Label|-->B
           * Valid examples:
             - graph TD
               G1[G1 Phase]-->S[S Phase]
               S-->G2[G2 Phase]
               G2-->M[M Phase]
             - sequenceDiagram
               User->>System: Request
               System->>Database: Query
         - Test your syntax mentally before outputting

      2. LABELED ILLUSTRATIONS (UNIVERSAL - works for ALL domains):${visualMode === 'diagrams' ? ' - SKIP THIS if mode is diagrams-only' : ''}
         - For: ANY structure/system that needs pointing labels (anatomy, engines, geography, architecture, chemistry, etc.)
         - Use 'labeledIllustration' object with:
           * 'baseImagePrompt': Must describe the LAYOUT based on complexity
           * 'labels': Array of 5-12 labels with 'text', 'x', 'y', and 'type' fields

         LAYOUT INSTRUCTIONS:
         1. SIMPLE OBJECT (e.g. "Mitochondria"): "A single clean 3D cutaway of [Object], ${styleGuides[visualStyle]}, white background, with text labels"

         2. LINEAR PROCESS (e.g. "Mitosis"): "A horizontal sequence of 4-5 distinct steps showing [Process], connected by arrows, ${styleGuides[visualStyle]}, white background, with text labels"

         3. MULTI-STAGE PROCESS (e.g. "Meiosis", "Krebs Cycle"): "A scientific diagram split into TWO HORIZONTAL PANELS. Top panel shows [Stage 1] with 4 steps. Bottom panel shows [Stage 2] with 4 steps. Light gray panel backgrounds to distinguish rows, ${styleGuides[visualStyle]}, white background, with text labels"

         LABEL TYPES & USAGE:
         - 'header': PANEL TITLES (e.g., "Meiosis I") - place at top-left of each major section
         - 'subtext': STEP NAMES (e.g., "Prophase I") - place above or below each cell/step
         - 'pointer': TINY DETAILS (e.g., "Centromere") - point to specific features inside diagrams

         UNIVERSAL EXAMPLES:
         1. ENGINEERING: "Cutaway of jet engine" → labels: "Combustion Chamber" (pointer)
         2. BIOLOGY PROCESS: "Meiosis stages" → labels: "Meiosis I" (header), "Prophase I" (subtext), "Chromosome" (pointer)
         3. GEOGRAPHY: "Cross-section of volcano" → labels: "Volcanic Structure" (header), "Magma Chamber" (pointer)

         MAINTAIN CONSISTENT ${visualStyle.toUpperCase()} STYLE across all illustrations

         CRITICAL: ${visualMode === 'both' 
         ? 'Use BOTH diagramCode AND labeledIllustration on slides where both are relevant. Every slide should have at least one visual.' 
         : visualMode === 'diagrams' 
          ? 'ONLY use diagramCode. Every slide needs a diagram.'
          : 'ONLY use labeledIllustration. Every slide needs a labeled illustration.'}

      --- CONTENT REQUIREMENTS ---
      1. Write 5-7 detailed bullet points per slide.
      2. Use semantic HTML (<ul>, <li>, <strong>, <em>).
      3. No images <img> in the HTML content.

      Return JSON with a "slides" array following this schema exactly.`;

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
                diagramCode: { 
                  type: 'string', 
                  description: 'RAW Mermaid.js code ONLY (no markdown, no backticks). Must be valid syntax. Node IDs: simple alphanumeric only (A, B, step1). Node labels: in brackets [Text]. Example: graph TD\nA[Start]-->B[Process]-->C[End]' 
                },
                labeledIllustration: {
                  type: 'object',
                  description: 'Use for ANY slide that needs a specific diagram with pointers (Engines, Maps, Anatomy, Architecture, Chemistry, etc.).',
                  properties: {
                    baseImagePrompt: { 
                      type: 'string',
                      description: 'Describe the subject cleanly. CRITICAL: Must end with "clean white background, technical illustration style, with integrated text labels"'
                    },
                    labels: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          text: { type: 'string', description: 'Correct spelling of the label' },
                          x: { type: 'number', description: 'X percentage (0-100) from left' },
                          y: { type: 'number', description: 'Y percentage (0-100) from top' },
                          type: {
                            type: 'string',
                            enum: ['header', 'pointer', 'subtext'],
                            description: 'Use "header" for main sections, "pointer" for specific parts, "subtext" for extra details'
                          }
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

      // Call the AI Provider
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

      let slides = slideData.slides || [];
      
      if (!Array.isArray(slides)) {
        slides = [];
      }

      // Add order and imageProvider to slides
      slides = slides.map((slide, idx) => ({
        ...slide,
        order: idx + 1,
        labeledIllustration: slide.labeledIllustration 
          ? { ...slide.labeledIllustration, imageProvider }
          : undefined
      }));

      // Track slides for AI learning
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
      toast.success('Educational slides generated with diagrams and illustrations!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate slides. Please try again.');
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
            <Label>Slide Count</Label>
            <Input
              type="number"
              min={1}
              max={15}
              value={slideCount}
              onChange={(e) => setSlideCount(parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Content Type</Label>
            <select
              className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
          <Label>Visual Style (Applied to All Visuals)</Label>
          <select
            className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
            Use AI Learning (analyzes your past slides & knowledge base)
          </Label>
          </div>

        <div className="space-y-4 pt-2">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Visual Content Type</Label>
            <div className="flex gap-2">
              <Button 
                variant={visualMode === 'both' ? "default" : "outline"} 
                size="sm"
                onClick={() => setVisualMode('both')}
                className="text-xs flex-1"
              >
                📊 + 🖼️ Both
              </Button>
              <Button 
                variant={visualMode === 'diagrams' ? "default" : "outline"} 
                size="sm"
                onClick={() => setVisualMode('diagrams')}
                className="text-xs flex-1"
              >
                📊 Diagrams
              </Button>
              <Button 
                variant={visualMode === 'images' ? "default" : "outline"} 
                size="sm"
                onClick={() => setVisualMode('images')}
                className="text-xs flex-1"
              >
                🖼️ Images
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Text AI Model</Label>
              <div className="flex flex-col gap-2">
                <Button 
                  variant={aiProvider === 'default' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setAiProvider('default')}
                  className="text-xs w-full"
                >
                  Standard
                </Button>
                <Button 
                  variant={aiProvider === 'default_research' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setAiProvider('default_research')}
                  className="text-xs w-full"
                >
                  Web Research
                </Button>
                <Button 
                  variant={aiProvider === 'perplexity' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setAiProvider('perplexity')}
                  className="text-xs w-full"
                >
                  <BookOpen className="w-3 h-3 mr-1" />
                  Deep Research
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Image Generator
                {visualMode === 'diagrams' && <span className="text-xs text-gray-400 ml-1">(disabled)</span>}
              </Label>
              <div className="flex flex-col gap-2">
                <Button 
                  variant={imageProvider === 'base44' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setImageProvider('base44')}
                  className="text-xs w-full"
                  disabled={visualMode === 'diagrams'}
                >
                  Base44 AI
                </Button>
                <Button 
                  variant={imageProvider === 'dalle' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setImageProvider('dalle')}
                  className="text-xs w-full"
                  disabled={visualMode === 'diagrams'}
                >
                  DALL-E 3
                </Button>
                <Button 
                  variant={imageProvider === 'flux2' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setImageProvider('flux2')}
                  className="text-xs w-full"
                  disabled={visualMode === 'diagrams'}
                >
                  Flux 2
                </Button>
              </div>
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
            {useAILearning ? 'AI Learning & Generating...' : 'Generating Diagrams...'}
          </>
        ) : (
          <>
            {useAILearning ? <Brain className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate {useAILearning ? 'Intelligent' : ''} Presentation
          </>
        )}
      </Button>
    </div>
  );
}