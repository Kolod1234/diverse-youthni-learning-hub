import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function AILessonAssistant({ lessonTitle, lessonContent, learningObjectives = [] }) {
  const [activeTool, setActiveTool] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

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
          <p className="text-sm text-gray-600 mb-4">Use AI to enhance your lesson content:</p>
          <div className="grid md:grid-cols-3 gap-3">
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
          </div>

          <Button
            size="sm"
            onClick={() =>
              handleCopy(
                result.type === 'summary'
                  ? result.content
                  : result.type === 'quiz'
                  ? JSON.stringify(result.content, null, 2)
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
        </div>
      )}
    </Card>
  );
}