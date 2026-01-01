import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function AIGenerateMode({ onSlidesGenerated }) {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [includeSpeakerNotes, setIncludeSpeakerNotes] = useState(true);
  const [contentType, setContentType] = useState('general'); 
  const [aiProvider, setAiProvider] = useState('default');
  const [generating, setGenerating] = useState(false);

  const generateSlides = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setGenerating(true);
    try {
      toast.info('Generating slide structure with perfect diagrams...');

      // Specialized instructions for diagram types based on content
      const diagramInstructions = {
        general: 'Use "graph TD" (Flowcharts) or "mindmap" for concepts.',
        code: 'Use "sequenceDiagram" to show code execution flow or "classDiagram" for architecture.',
        math: 'Use "graph LR" to show logical steps or dependencies.',
        history: 'Use "timeline" or "gantt" diagrams for chronological events.'
      };

      const prompt = `Create a COMPREHENSIVE educational presentation about "${topic}".
      ${description ? `Additional context: ${description}` : ''}

      Content Type: ${contentType.toUpperCase()}
      
      Generate exactly ${slideCount} slides.

      --- VISUALIZATION STRATEGY (CRITICAL) ---
      Every slide MUST have an educational visual. Choose the appropriate method:

      1. FLOWCHARTS/PROCESSES: Use 'diagramCode' (Mermaid.js)
         - For: workflows, timelines, organizational charts, decision trees, process flows
         - Generate valid MERMAID.JS code (no markdown blocks, just raw string)
         - ${diagramInstructions[contentType]}
         - Examples: "graph TD A[Start]-->B[Process]-->C[End]"

      2. LABELED ILLUSTRATIONS (PRIORITY for visual learning):
         - For: anatomy, cell structures, equipment parts, geography, biological systems, physics diagrams, chemistry structures
         - Use 'labeledIllustration' object with:
           * 'baseImagePrompt': "Scientific illustration of [subject], educational style, clean, white background, no text, no labels"
           * 'labels': Array with 5-12 key parts, each with:
             - 'text': Correctly spelled label name
             - 'x': Horizontal position (0-100)
             - 'y': Vertical position (0-100)
         - Examples: "Plant cell organelles", "Water cycle", "Human skeleton", "Volcano cross-section"

      CRITICAL: Every slide needs either diagramCode OR labeledIllustration. No slides without visuals.

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
                  description: 'Valid Mermaid.js syntax (e.g., graph TD, sequenceDiagram, mindmap). Use for flowcharts, processes, timelines.' 
                },
                labeledIllustration: {
                  type: 'object',
                  description: 'Use for educational diagrams needing pointing labels (e.g., cell anatomy, parts of a system, geography).',
                  properties: {
                    baseImagePrompt: { 
                      type: 'string',
                      description: 'A prompt for a CLEAN educational illustration with NO text or labels. Example: "Scientific illustration of plant cell, clean, white background, no text"'
                    },
                    labels: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          text: { type: 'string', description: 'Correct spelling of the label.' },
                          x: { type: 'number', description: 'X percentage coordinate (0-100) from left.' },
                          y: { type: 'number', description: 'Y percentage coordinate (0-100) from top.' }
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

      // Add order to slides
      slides = slides.map((slide, idx) => ({ ...slide, order: idx + 1 }));

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

        <div className="flex items-center space-x-2">
          <Switch
            id="speaker-notes"
            checked={includeSpeakerNotes}
            onCheckedChange={setIncludeSpeakerNotes}
          />
          <Label htmlFor="speaker-notes">Generate Speaker Notes</Label>
        </div>

        <div className="pt-2">
           <Label className="text-xs text-muted-foreground mb-2 block">AI Model</Label>
           <div className="flex gap-2">
             <Button 
               variant={aiProvider === 'default' ? "default" : "outline"} 
               size="sm"
               onClick={() => setAiProvider('default')}
               className="text-xs"
             >
               Standard
             </Button>
             <Button 
               variant={aiProvider === 'default_research' ? "default" : "outline"} 
               size="sm"
               onClick={() => setAiProvider('default_research')}
               className="text-xs"
             >
               Web Research
             </Button>
             <Button 
               variant={aiProvider === 'perplexity' ? "default" : "outline"} 
               size="sm"
               onClick={() => setAiProvider('perplexity')}
               className="text-xs"
             >
               <BookOpen className="w-3 h-3 mr-1" />
               Deep Research
             </Button>
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
            Generating Diagrams...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Presentation
          </>
        )}
      </Button>
    </div>
  );
}