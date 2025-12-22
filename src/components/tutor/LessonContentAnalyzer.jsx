import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { base44 } from '@/api/base44Client';
import { 
  Brain, Loader2, CheckCircle, AlertCircle, 
  BookOpen, Target, Link as LinkIcon, Lightbulb,
  TrendingUp, X, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function LessonContentAnalyzer({ lesson, onClose }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [improving, setImproving] = useState(false);

  const analyzeContent = async () => {
    setAnalyzing(true);
    
    try {
      // Extract text content from slides
      const textContent = lesson.slides?.map(slide => {
        const plainText = slide.content?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        return `${slide.title || ''}\n${plainText}`;
      }).join('\n\n') || lesson.description || '';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this educational lesson content and provide a comprehensive assessment:

LESSON TITLE: ${lesson.title}
LESSON CONTENT:
${textContent.substring(0, 4000)}

Provide analysis in the following JSON format:
{
  "readability": {
    "score": "Easy/Medium/Advanced",
    "grade_level": "Grade 9-10",
    "improvements": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
  },
  "learning_objectives": [
    {"objective": "Main learning goal 1", "importance": "high"},
    {"objective": "Main learning goal 2", "importance": "medium"}
  ],
  "key_concepts": ["Concept 1", "Concept 2", "Concept 3", "Concept 4"],
  "accuracy_check": {
    "status": "verified/needs_review",
    "concerns": ["Any factual concerns or areas to verify"],
    "confidence": "high/medium/low"
  },
  "supplementary_materials": [
    {"type": "video", "title": "Suggested video title", "reason": "Why this helps"},
    {"type": "reading", "title": "Suggested article/book", "reason": "Why this helps"},
    {"type": "activity", "title": "Hands-on activity", "reason": "Why this helps"}
  ],
  "engagement_score": 75,
  "overall_quality": "Good/Excellent/Needs Improvement",
  "strengths": ["Strength 1", "Strength 2"],
  "areas_for_improvement": ["Area 1", "Area 2"]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            readability: {
              type: "object",
              properties: {
                score: { type: "string" },
                grade_level: { type: "string" },
                improvements: { type: "array", items: { type: "string" } }
              }
            },
            learning_objectives: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  objective: { type: "string" },
                  importance: { type: "string" }
                }
              }
            },
            key_concepts: { type: "array", items: { type: "string" } },
            accuracy_check: {
              type: "object",
              properties: {
                status: { type: "string" },
                concerns: { type: "array", items: { type: "string" } },
                confidence: { type: "string" }
              }
            },
            supplementary_materials: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  title: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            engagement_score: { type: "number" },
            overall_quality: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            areas_for_improvement: { type: "array", items: { type: "string" } }
          }
        },
        add_context_from_internet: true
      });

      setAnalysis(result);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze content');
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const applyImprovements = async () => {
    setImproving(true);
    try {
      const textContent = lesson.slides?.map(slide => {
        const plainText = slide.content?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        return `${slide.title || ''}\n${plainText}`;
      }).join('\n\n') || lesson.description || '';

      const improvementPrompt = `You are an expert educational content creator. Improve this lesson content based on the following analysis:

LESSON TITLE: ${lesson.title}
CURRENT CONTENT:
${textContent.substring(0, 3000)}

AREAS FOR IMPROVEMENT:
${analysis.areas_for_improvement?.map((area, i) => `${i + 1}. ${area}`).join('\n')}

READABILITY IMPROVEMENTS:
${analysis.readability?.improvements?.map((imp, i) => `${i + 1}. ${imp}`).join('\n')}

Your task:
1. Add interactive elements (polls, quizzes, Q&A sections, interactive images with hotspots)
2. Expand explanations for complex concepts with detailed examples, analogies, and real-world applications
3. Add visual elements using <img> tags with descriptive placeholder URLs
4. Include colorful info boxes using the card system for definitions, key points, warnings, examples, and tips
5. Add diagrams, charts, and tables where appropriate
6. Include summary sections and key takeaways
7. Make content more engaging and student-friendly

Return ONLY valid JSON with this structure:
{
  "improved_slides": [
    {
      "title": "Slide title",
      "content": "Enhanced HTML content with inline styles, interactive elements, detailed explanations, visual aids, and card elements"
    }
  ],
  "improvement_summary": "Brief summary of what was improved (one sentence)"
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: improvementPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            improved_slides: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" }
                }
              }
            },
            improvement_summary: { type: "string" }
          }
        }
      });
      
      await base44.entities.Lesson.update(lesson.id, {
        slides: result.improved_slides.map((slide, idx) => ({
          ...slide,
          order: idx + 1
        }))
      });

      toast.success('✨ ' + result.improvement_summary);
      onClose();
    } catch (error) {
      toast.error('Failed to apply improvements: ' + error.message);
    } finally {
      setImproving(false);
    }
  };

  const getReadabilityColor = (score) => {
    if (score === 'Easy') return 'bg-green-100 text-green-800 border-green-200';
    if (score === 'Medium') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-orange-100 text-orange-800 border-orange-200';
  };

  const getAccuracyColor = (status) => {
    if (status === 'verified') return 'text-green-600';
    return 'text-orange-600';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">AI Content Analysis</h2>
                  <p className="text-sm text-gray-600">{lesson.title}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-6">
            {!analysis && !analyzing && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Analyze Lesson Content
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Get AI-powered insights on readability, learning objectives, accuracy, and recommendations for improvement.
                </p>
                <Button onClick={analyzeContent} className="bg-indigo-600 hover:bg-indigo-700">
                  <Brain className="w-4 h-4 mr-2" />
                  Start Analysis
                </Button>
              </div>
            )}

            {analyzing && (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Analyzing Content...
                </h3>
                <p className="text-gray-600">
                  AI is examining your lesson for quality, accuracy, and engagement
                </p>
              </div>
            )}

            {analysis && (
              <div className="space-y-6">
                {/* Overall Quality */}
                <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Overall Quality</h3>
                    <Badge className="bg-indigo-600 text-white text-base px-3 py-1">
                      {analysis.overall_quality}
                    </Badge>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700">Engagement Score</span>
                      <span className="font-semibold text-indigo-600">{analysis.engagement_score}%</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-3">
                      <div 
                        className="bg-indigo-600 h-3 rounded-full transition-all"
                        style={{ width: `${analysis.engagement_score}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Strengths
                      </h4>
                      <ul className="space-y-1">
                        {analysis.strengths?.map((strength, idx) => (
                          <li key={idx} className="text-sm text-gray-700">• {strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                        Areas for Improvement
                      </h4>
                      <ul className="space-y-1 mb-3">
                        {analysis.areas_for_improvement?.map((area, idx) => (
                          <li key={idx} className="text-sm text-gray-700">• {area}</li>
                        ))}
                      </ul>
                      {analysis.areas_for_improvement?.length > 0 && (
                        <Button
                          onClick={applyImprovements}
                          disabled={improving}
                          size="sm"
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 mt-2"
                        >
                          {improving ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                              Fixing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 mr-2" />
                              Fix All
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Readability */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    Readability Assessment
                  </h3>
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className={`${getReadabilityColor(analysis.readability?.score)} border`}>
                      {analysis.readability?.score} Level
                    </Badge>
                    <span className="text-sm text-gray-600">{analysis.readability?.grade_level}</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Suggested Improvements:</h4>
                  <ul className="space-y-2">
                    {analysis.readability?.improvements?.map((improvement, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-indigo-600 mt-0.5">→</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Learning Objectives */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600" />
                    Learning Objectives
                  </h3>
                  <div className="space-y-2">
                    {analysis.learning_objectives?.map((obj, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{obj.objective}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {obj.importance} importance
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Key Concepts */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-indigo-600" />
                    Key Concepts Identified
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.key_concepts?.map((concept, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </Card>

                {/* Accuracy Check */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertCircle className={`w-5 h-5 ${getAccuracyColor(analysis.accuracy_check?.status)}`} />
                    Factual Accuracy Check
                  </h3>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className={analysis.accuracy_check?.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                      {analysis.accuracy_check?.status === 'verified' ? '✓ Verified' : '⚠ Needs Review'}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      Confidence: {analysis.accuracy_check?.confidence}
                    </span>
                  </div>
                  {analysis.accuracy_check?.concerns?.length > 0 && (
                    <>
                      <h4 className="font-medium text-gray-900 mb-2">Areas to Verify:</h4>
                      <ul className="space-y-2">
                        {analysis.accuracy_check.concerns.map((concern, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-orange-600 mt-0.5">!</span>
                            <span>{concern}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </Card>

                {/* Supplementary Materials */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-indigo-600" />
                    Recommended Supplementary Materials
                  </h3>
                  <div className="space-y-3">
                    {analysis.supplementary_materials?.map((material, idx) => (
                      <div key={idx} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-indigo-100">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            {material.type === 'video' && <span className="text-white text-xs">📹</span>}
                            {material.type === 'reading' && <span className="text-white text-xs">📚</span>}
                            {material.type === 'activity' && <span className="text-white text-xs">🎯</span>}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{material.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {material.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{material.reason}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {analysis && (
            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  💡 Analysis powered by AI with internet fact-checking
                </p>
                <Button onClick={analyzeContent} variant="outline" size="sm">
                  <Brain className="w-4 h-4 mr-2" />
                  Re-analyze
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}