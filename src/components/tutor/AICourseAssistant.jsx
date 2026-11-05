import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { Sparkles, BookOpen, Brain, FileText, Loader2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AICourseAssistant({ onApplySuggestion }) {
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('gcse');
  const [examBoard, setExamBoard] = useState('CCEA');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [activeTab, setActiveTab] = useState('outline');
  const [copied, setCopied] = useState({});

  const generateCourseOutline = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert education content creator specializing in ${examBoard} curriculum.

Create a comprehensive course outline for: "${topic}"
Target Audience: ${targetAudience}
Exam Board: ${examBoard}

Provide a detailed course structure including:
1. Course title and description
2. 6-8 main units/sections
3. For each unit: 3-5 specific lessons with titles and brief descriptions
4. Recommended duration for each lesson
5. Key learning objectives for each unit

Format as structured JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            course_title: { type: "string" },
            course_description: { type: "string" },
            duration_hours: { type: "number" },
            level: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
            units: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  unit_name: { type: "string" },
                  learning_objectives: { type: "array", items: { type: "string" } },
                  lessons: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        duration_minutes: { type: "number" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
      
      setSuggestions(prev => ({ ...prev, outline: response }));
      setActiveTab('outline');
    } catch (error) {
      console.error('Error generating outline:', error);
    }
    setLoading(false);
  };

  const generateResources = async (unitName, lessonTitle) => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `For the ${examBoard} ${targetAudience} course on "${topic}", suggest educational resources for:

Unit: ${unitName}
Lesson: ${lessonTitle}

Provide:
1. 3-4 diagram types that would help explain concepts (be specific)
2. 3-4 interactive elements or activities
3. Real-world examples and applications
4. Recommended multimedia resources (videos, simulations)
5. Practice exercises types

Format as JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            diagrams: { type: "array", items: { type: "string" } },
            interactive_elements: { type: "array", items: { type: "string" } },
            real_world_examples: { type: "array", items: { type: "string" } },
            multimedia: { type: "array", items: { type: "string" } },
            practice_exercises: { type: "array", items: { type: "string" } }
          }
        }
      });
      
      setSuggestions(prev => ({ ...prev, resources: response }));
      setActiveTab('resources');
    } catch (error) {
      console.error('Error generating resources:', error);
    }
    setLoading(false);
  };

  const generateQuizQuestions = async (unitName) => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create ${examBoard}-style assessment questions for ${targetAudience} level on:

Topic: ${topic}
Unit: ${unitName}

Generate 10 high-quality multiple choice questions that:
1. Align with ${examBoard} examination standards
2. Cover different difficulty levels
3. Test understanding, not just recall
4. Include clear explanations for correct answers

Format as JSON with questions, 4 options each, correct answer index (0-3), and explanation.`,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_answer: { type: "number" },
                  explanation: { type: "string" },
                  difficulty: { type: "string", enum: ["easy", "medium", "hard"] }
                }
              }
            },
            passing_score: { type: "number" },
            recommended_time_minutes: { type: "number" }
          }
        }
      });
      
      setSuggestions(prev => ({ ...prev, quiz: response }));
      setActiveTab('quiz');
    } catch (error) {
      console.error('Error generating quiz:', error);
    }
    setLoading(false);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [id]: true });
    setTimeout(() => setCopied({ ...copied, [id]: false }), 2000);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">AI Course Assistant</h3>
          <p className="text-sm text-muted-foreground">Powered by advanced AI to help you create better courses</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-card rounded-xl p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Course Topic</label>
            <Input
              placeholder="e.g., GCSE Biology Unit 1"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Target Audience</label>
            <Select value={targetAudience} onValueChange={setTargetAudience}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gcse">GCSE</SelectItem>
                <SelectItem value="a-level">A-Level</SelectItem>
                <SelectItem value="btec">BTEC</SelectItem>
                <SelectItem value="adult-learners">Adult Learners</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Exam Board</label>
          <Select value={examBoard} onValueChange={setExamBoard}>
            <SelectTrigger className="w-full md:w-1/2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CCEA">CCEA</SelectItem>
              <SelectItem value="AQA">AQA</SelectItem>
              <SelectItem value="Edexcel">Edexcel</SelectItem>
              <SelectItem value="OCR">OCR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={generateCourseOutline}
            disabled={!topic || loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BookOpen className="w-4 h-4 mr-2" />}
            Generate Course Outline
          </Button>
        </div>
      </div>

      {/* Results Section */}
      {suggestions && (
        <motion.div
          className="bg-card rounded-xl overflow-hidden"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b rounded-none bg-gray-50">
              {suggestions.outline && (
                <TabsTrigger value="outline">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Course Outline
                </TabsTrigger>
              )}
              {suggestions.resources && (
                <TabsTrigger value="resources">
                  <FileText className="w-4 h-4 mr-2" />
                  Resources
                </TabsTrigger>
              )}
              {suggestions.quiz && (
                <TabsTrigger value="quiz">
                  <Brain className="w-4 h-4 mr-2" />
                  Quiz Questions
                </TabsTrigger>
              )}
            </TabsList>

            {suggestions.outline && (
              <TabsContent value="outline" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-2xl font-bold text-foreground mb-2">{suggestions.outline.course_title}</h4>
                    <p className="text-muted-foreground mb-4">{suggestions.outline.course_description}</p>
                    <div className="flex gap-2">
                      <Badge>{suggestions.outline.level}</Badge>
                      <Badge variant="outline">{suggestions.outline.duration_hours} hours</Badge>
                    </div>
                  </div>

                  {suggestions.outline.units?.map((unit, idx) => (
                    <Card key={idx} className="p-4 border-purple-200">
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="font-bold text-foreground">{unit.unit_name}</h5>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateResources(unit.unit_name, unit.lessons[0]?.title)}
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Resources
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateQuizQuestions(unit.unit_name)}
                          >
                            <Brain className="w-3 h-3 mr-1" />
                            Quiz
                          </Button>
                        </div>
                      </div>

                      {unit.learning_objectives && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Learning Objectives:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {unit.learning_objectives.map((obj, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-purple-600 mt-1">•</span>
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="space-y-2">
                        {unit.lessons?.map((lesson, lIdx) => (
                          <div key={lIdx} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{lesson.title}</p>
                              <p className="text-xs text-muted-foreground">{lesson.description}</p>
                            </div>
                            <Badge variant="outline" className="shrink-0">
                              {lesson.duration_minutes} min
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}

                  <div className="flex gap-3">
                    <Button
                      onClick={() => onApplySuggestion?.(suggestions.outline)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      Apply to Course Form
                    </Button>
                    <Button
                      onClick={() => onApplySuggestion?.({ ...suggestions.outline, createLessons: true })}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    >
                      Create Course with Lessons
                    </Button>
                  </div>
                </div>
              </TabsContent>
            )}

            {suggestions.resources && (
              <TabsContent value="resources" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h5 className="font-semibold text-foreground mb-3">Recommended Diagrams</h5>
                    <div className="space-y-2">
                      {suggestions.resources.diagrams?.map((diagram, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span className="text-sm text-foreground">{diagram}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(diagram, `diagram-${idx}`)}
                          >
                            {copied[`diagram-${idx}`] ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-foreground mb-3">Interactive Elements</h5>
                    <div className="space-y-2">
                      {suggestions.resources.interactive_elements?.map((element, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <span className="text-sm text-foreground">{element}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(element, `interactive-${idx}`)}
                          >
                            {copied[`interactive-${idx}`] ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-foreground mb-3">Real-World Examples</h5>
                    <ul className="space-y-2">
                      {suggestions.resources.real_world_examples?.map((example, idx) => (
                        <li key={idx} className="text-sm text-gray-600 p-2 bg-green-50 rounded">• {example}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
            )}

            {suggestions.quiz && (
              <TabsContent value="quiz" className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Passing Score: <span className="font-semibold">{suggestions.quiz.passing_score}%</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Time: <span className="font-semibold">{suggestions.quiz.recommended_time_minutes} minutes</span>
                      </p>
                    </div>
                    <Button
                      onClick={() => onApplySuggestion?.(suggestions.quiz)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Create Quiz
                    </Button>
                  </div>

                  {suggestions.quiz.questions?.map((q, idx) => (
                    <Card key={idx} className="p-4 border-purple-200">
                      <div className="flex items-start justify-between mb-2">
                        <h6 className="font-medium text-foreground flex-1">Q{idx + 1}. {q.question}</h6>
                        <Badge className={
                          q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          q.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }>
                          {q.difficulty}
                        </Badge>
                      </div>
                      <div className="space-y-1 mb-3">
                        {q.options?.map((option, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2 rounded text-sm ${
                              oIdx === q.correct_answer
                                ? 'bg-green-100 border border-green-300'
                                : 'bg-gray-50'
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}. {option}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                        <span className="font-semibold">Explanation:</span> {q.explanation}
                      </p>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      )}
    </Card>
  );
}