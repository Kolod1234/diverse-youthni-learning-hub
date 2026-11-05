import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import { sanitizeHtml } from '@/components/security/SafeHtml';
import { activateOnKey } from '@/lib/a11y';
const SLIDE_TYPES = [
  { value: 'title', label: 'Title Slide', description: 'Eye-catching introduction slide' },
  { value: 'content', label: 'Content Slide', description: 'Text-based informational slide' },
  { value: 'image', label: 'Image-Heavy Slide', description: 'Visual-focused with images' },
  { value: 'list', label: 'List Slide', description: 'Bullet points or numbered lists' },
  { value: 'comparison', label: 'Comparison Slide', description: 'Side-by-side comparisons' },
  { value: 'quote', label: 'Quote Slide', description: 'Highlighted quotes or testimonials' },
  { value: 'data', label: 'Data Slide', description: 'Charts, graphs, or statistics' },
  { value: 'summary', label: 'Summary Slide', description: 'Key takeaways or conclusion' }
];

export default function AITemplateGenerator({ onTemplateGenerated, onClose }) {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(['title', 'content', 'summary']);
  const [slideCount, setSlideCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [generatedSlides, setGeneratedSlides] = useState(null);

  const toggleSlideType = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const generateTemplate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert educational slide designer. Create ${slideCount} professional, visually appealing slides about "${topic}".

Keywords to emphasize: ${keywords || 'none specified'}

Slide types to include: ${selectedTypes.map(t => SLIDE_TYPES.find(st => st.value === t)?.label).join(', ')}

For each slide, generate clean HTML content with:
- Modern, responsive design with Tailwind CSS classes
- Appropriate headings, text formatting, and spacing
- Color schemes using gradients (indigo, blue, purple, teal themes)
- Professional typography and visual hierarchy
- Icons or visual elements where appropriate (use emoji or text symbols)

Return ONLY a JSON array of slide objects in this exact format:
[
  {
    "title": "Slide Title",
    "type": "title|content|image|list|comparison|quote|data|summary",
    "content": "<div class='p-8 min-h-[400px] bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl'>HTML content here</div>"
  }
]

Make each slide visually distinct and engaging. Use semantic HTML and Tailwind utility classes for styling.`,
        response_json_schema: {
          type: "object",
          properties: {
            slides: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  type: { type: "string" },
                  content: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (response?.slides && Array.isArray(response.slides)) {
        setGeneratedSlides(response.slides);
        toast.success(`Generated ${response.slides.length} slides!`);
      } else {
        toast.error('Failed to generate slides');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate template');
    } finally {
      setGenerating(false);
    }
  };

  const saveAsTemplate = async () => {
    try {
      await base44.entities.Template.create({
        name: `AI Generated: ${topic}`,
        description: `AI-generated template for ${topic}. Keywords: ${keywords || 'none'}`,
        category: 'lesson',
        is_public: false,
        tags: [topic, 'AI-generated', ...keywords.split(',').map(k => k.trim()).filter(Boolean)],
        content: {
          slides: generatedSlides,
          metadata: {
            generated_by_ai: true,
            topic,
            keywords
          }
        }
      });
      toast.success('Template saved!');
      onTemplateGenerated?.();
    } catch (error) {
      toast.error('Failed to save template');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-card">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                AI Template Generator
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Generate professional slide templates with AI</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!generatedSlides ? (
            <div className="space-y-6">
              {/* Topic Input */}
              <div>
                <Label className="text-base font-semibold">Topic *</Label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Introduction to Photosynthesis, World War II Timeline, Python Basics"
                  className="mt-2"
                />
              </div>

              {/* Keywords */}
              <div>
                <Label className="text-base font-semibold">Keywords (Optional)</Label>
                <Textarea
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Enter comma-separated keywords to emphasize (e.g., chlorophyll, sunlight, glucose)"
                  rows={2}
                  className="mt-2"
                />
              </div>

              {/* Slide Count */}
              <div>
                <Label className="text-base font-semibold">Number of Slides: {slideCount}</Label>
                <input
                  type="range"
                  min="3"
                  max="15"
                  value={slideCount}
                  onChange={(e) => setSlideCount(parseInt(e.target.value))}
                  className="w-full mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>3</span>
                  <span>15</span>
                </div>
              </div>

              {/* Slide Types */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Slide Types to Include</Label>
                <div className="grid grid-cols-2 gap-3">
                  {SLIDE_TYPES.map((type) => (
                    <Card role="button" tabIndex={0} onKeyDown={activateOnKey}
                      key={type.value}
                      className={`p-4 cursor-pointer transition-all ${
                        selectedTypes.includes(type.value)
                          ? 'border-indigo-500 bg-indigo-50 shadow-md'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                      onClick={() => toggleSlideType(type.value)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{type.label}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                        </div>
                        {selectedTypes.includes(type.value) && (
                          <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateTemplate}
                disabled={generating || !topic.trim() || selectedTypes.length === 0}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Template
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Generated Slides</h3>
                  <p className="text-sm text-muted-foreground">{generatedSlides.length} slides created</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setGeneratedSlides(null)}>
                    Generate New
                  </Button>
                  <Button onClick={saveAsTemplate} className="bg-indigo-600 hover:bg-indigo-700">
                    Save Template
                  </Button>
                </div>
              </div>

              {/* Preview Generated Slides */}
              <div className="space-y-4">
                {generatedSlides.map((slide, idx) => (
                  <motion.div
                    key={idx}
                  >
                    <Card className="overflow-hidden">
                      <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">Slide {idx + 1}: {slide.title}</h4>
                          <Badge variant="outline" className="mt-1">
                            {SLIDE_TYPES.find(t => t.value === slide.type)?.label || slide.type}
                          </Badge>
                        </div>
                      </div>
                      <div 
                        className="p-6"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(slide.content) }}
                      />
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}