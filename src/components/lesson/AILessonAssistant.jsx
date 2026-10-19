import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Sparkles, Copy, Check, LayoutTemplate, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { sanitizeHtml } from '@/components/security/SafeHtml';
export default function AILessonAssistant({ lessonTitle, lessonContent, learningObjectives = [], existingSlides = [], onSlidesGenerated }) {
  const [activeTool, setActiveTool] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [slideCount, setSlideCount] = useState(6);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const generateSummary = async () => {
    if (!lessonContent) {
      toast.error('Please add lesson content first');
      return;
    }
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateLessonSummary', {
        lessonTitle,
        lessonContent,
        learningObjectives
      });
      setResult({
        type: 'summary',
        content: response.data.summary
      });
    } catch (error) {
      toast.error(error.message || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const generateQuizzes = async () => {
    if (!lessonContent) {
      toast.error('Please add lesson content first');
      return;
    }
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateQuizQuestions', {
        lessonTitle,
        lessonContent,
        questionCount: 5,
        difficultyLevel: 'medium'
      });
      setResult({
        type: 'quiz',
        content: response.data.questions
      });
    } catch (error) {
      toast.error(error.message || 'Failed to generate quiz questions');
    } finally {
      setLoading(false);
    }
  };

  const generateSlides = async () => {
    if (!lessonTitle?.trim()) {
      toast.error('Please add a lesson title first');
      return;
    }
    setActiveTool('slides');
    setLoading(true);
    try {
      const plainDescription = (lessonContent || '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 1500);

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert instructional designer creating a written lesson deck.

Lesson title: "${lessonTitle}"
${plainDescription ? `Lesson description: ${plainDescription}` : ''}
${learningObjectives?.length ? `Learning objectives:\n- ${learningObjectives.filter(Boolean).join('\n- ')}` : ''}

Generate exactly ${slideCount} slides for this lesson. Structure:
1. Title slide
2. Learning objectives slide (if objectives provided, otherwise lesson overview)
3-${slideCount - 1}. Core concept slides (one clear idea per slide, with explanations, examples, and where helpful bullet points)
${slideCount}. Summary / key takeaways slide

Each slide's "content" must be a short HTML snippet using basic tags only: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <blockquote>. Do NOT include <html>, <body>, <script>, or inline styles. Keep content concise — 80-180 words per slide.`,
        response_json_schema: {
          type: 'object',
          properties: {
            slides: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  content: { type: 'string' }
                },
                required: ['title', 'content']
              }
            }
          },
          required: ['slides']
        }
      });

      const generated = (response?.slides || []).map((s, idx) => ({
        title: s.title,
        content: s.content,
        order: existingSlides.length + idx + 1
      }));

      if (!generated.length) {
        throw new Error('No slides were returned');
      }

      setResult({ type: 'slides', content: generated });
    } catch (error) {
      toast.error(error.message || 'Failed to generate slides');
    } finally {
      setLoading(false);
    }
  };

  const appendGeneratedSlides = () => {
    if (!result?.content?.length || !onSlidesGenerated) return;
    onSlidesGenerated([...(existingSlides || []), ...result.content]);
    toast.success(`${result.content.length} slides added to your lesson`);
    setResult(null);
  };

  const replaceWithGeneratedSlides = () => {
    if (!result?.content?.length || !onSlidesGenerated) return;
    const reordered = result.content.map((s, i) => ({ ...s, order: i + 1 }));
    onSlidesGenerated(reordered);
    toast.success(`Replaced with ${reordered.length} AI-generated slides`);
    setResult(null);
  };

  const suggestResources = async () => {
    if (!lessonContent) {
      toast.error('Please add lesson content first');
      return;
    }
    setLoading(true);
    try {
      const response = await base44.functions.invoke('suggestLessonResources', {
        lessonTitle,
        lessonContent,
        resourceType: 'all'
      });
      setResult({
        type: 'resources',
        content: response.data.resources
      });
    } catch (error) {
      toast.error(error.message || 'Failed to suggest resources');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-purple-200">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-900">AI Lesson Assistant</h2>
      </div>

      {!result ? (
        <div>
          <p className="text-sm text-gray-600 mb-3">Use AI to enhance your lesson content:</p>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <label className="text-xs font-medium text-gray-700">Number of slides to generate:</label>
            <select
              value={slideCount}
              onChange={(e) => setSlideCount(parseInt(e.target.value))}
              className="text-xs border border-purple-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              disabled={loading}
            >
              {[4, 5, 6, 8, 10, 12].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              onClick={generateSlides}
              disabled={loading}
              className="relative text-left h-auto flex-col items-start p-4 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg ring-2 ring-purple-300 ring-offset-2 col-span-2 lg:col-span-1"
            >
              <span className="absolute top-2 right-2 text-[10px] font-bold bg-yellow-400 text-yellow-900 rounded-full px-2 py-0.5">
                ★ AI
              </span>
              {loading && activeTool === 'slides' ? (
                <Loader2 className="w-5 h-5 animate-spin mb-2 text-white" />
              ) : (
                <LayoutTemplate className="w-5 h-5 mb-2 text-white" />
              )}
              <span className="font-bold text-sm text-white">Generate Slides</span>
              <span className="text-xs text-purple-100">Full lesson deck from title</span>
            </Button>

            <Button
              onClick={generateSummary}
              disabled={loading}
              variant="outline"
              className="text-left h-auto flex-col items-start p-3"
            >
              {loading && activeTool === 'summary' ? (
                <Loader2 className="w-4 h-4 animate-spin mb-2" />
              ) : (
                <Sparkles className="w-4 h-4 mb-2 text-purple-600" />
              )}
              <span className="font-semibold text-sm">Generate Summary</span>
              <span className="text-xs text-gray-500">Auto-generate lesson overview</span>
            </Button>

            <Button
              onClick={generateQuizzes}
              disabled={loading}
              variant="outline"
              className="text-left h-auto flex-col items-start p-3"
            >
              {loading && activeTool === 'quiz' ? (
                <Loader2 className="w-4 h-4 animate-spin mb-2" />
              ) : (
                <Sparkles className="w-4 h-4 mb-2 text-purple-600" />
              )}
              <span className="font-semibold text-sm">Draft Quiz</span>
              <span className="text-xs text-gray-500">Create quiz questions</span>
            </Button>

            <Button
              onClick={suggestResources}
              disabled={loading}
              variant="outline"
              className="text-left h-auto flex-col items-start p-3"
            >
              {loading && activeTool === 'resources' ? (
                <Loader2 className="w-4 h-4 animate-spin mb-2" />
              ) : (
                <Sparkles className="w-4 h-4 mb-2 text-purple-600" />
              )}
              <span className="font-semibold text-sm">Suggest Resources</span>
              <span className="text-xs text-gray-500">Find enrichment materials</span>
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">
              {result.type === 'summary' && 'Generated Summary'}
              {result.type === 'quiz' && 'Quiz Questions'}
              {result.type === 'resources' && 'Suggested Resources'}
              {result.type === 'slides' && `Generated ${result.content.length} Slides`}
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setResult(null)}
              className="text-gray-500"
            >
              Close
            </Button>
          </div>

          <div className="bg-white rounded-lg p-4 mb-4 max-h-96 overflow-y-auto border border-purple-100">
            {result.type === 'summary' && (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {result.content}
              </p>
            )}

            {result.type === 'quiz' && (
              <div className="space-y-4">
                {result.content.map((q, idx) => (
                  <div key={idx} className="pb-4 border-b border-gray-200 last:border-0">
                    <p className="font-semibold text-sm mb-2 text-gray-900">
                      Q{idx + 1}: {q.question}
                    </p>
                    <div className="space-y-1 mb-2">
                      {q.options.map((opt, i) => (
                        <p
                          key={i}
                          className={`text-sm ${
                            String.fromCharCode(65 + i) === q.correctAnswer
                              ? 'text-green-600 font-semibold'
                              : 'text-gray-600'
                          }`}
                        >
                          {String.fromCharCode(65 + i)}) {opt}
                        </p>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 italic">
                      Explanation: {q.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {result.type === 'resources' && (
              <div className="space-y-3">
                {result.content.map((res, idx) => (
                  <div key={idx} className="pb-3 border-b border-gray-200 last:border-0">
                    <p className="font-semibold text-sm text-gray-900">{res.title}</p>
                    <p className="text-xs text-purple-600 mb-1">
                      Type: {res.type} • {res.duration}
                    </p>
                    <p className="text-sm text-gray-700">{res.description}</p>
                  </div>
                ))}
              </div>
            )}

            {result.type === 'slides' && (
              <div className="space-y-3">
                {result.content.map((slide, idx) => (
                  <div key={idx} className="pb-3 border-b border-gray-200 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono bg-purple-100 text-purple-700 rounded px-2 py-0.5">#{idx + 1}</span>
                      <p className="font-semibold text-sm text-gray-900">{slide.title}</p>
                    </div>
                    <div
                      className="text-xs text-gray-600 prose prose-sm max-w-none line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(slide.content) }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {result.type === 'slides' && onSlidesGenerated ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                size="sm"
                onClick={appendGeneratedSlides}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Lesson {existingSlides?.length ? `(+${result.content.length})` : ''}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={replaceWithGeneratedSlides}
                disabled={!existingSlides?.length}
                title={!existingSlides?.length ? 'No existing slides to replace' : ''}
              >
                Replace all existing slides
              </Button>
            </div>
          ) : (
          <Button
            size="sm"
            onClick={() =>
              handleCopy(
                result.type === 'summary'
                  ? result.content
                  : JSON.stringify(result.content, null, 2)
              )
            }
            variant="outline"
            className="w-full"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Result
              </>
            )}
          </Button>
          )}
        </div>
      )}
    </Card>
  );
}