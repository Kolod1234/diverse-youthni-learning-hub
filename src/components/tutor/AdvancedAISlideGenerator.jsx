import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { base44 } from '@/api/base44Client';
import { 
  Sparkles, Loader2, CheckCircle, BookOpen, 
  Brain, Clock, Target, FileText, X, Wand2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdvancedAISlideGenerator({ courseId, onSlidesGenerated, onClose }) {
  const [existingSections, setExistingSections] = useState([]);
  const [topic, setTopic] = useState('');
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [curriculum, setCurriculum] = useState('GCSE');
  const [examBoard, setExamBoard] = useState('AQA');
  const [numSlides, setNumSlides] = useState('5');
  const [sectionName, setSectionName] = useState('');
  const [includeQuiz, setIncludeQuiz] = useState(true);
  const [quizDifficulty, setQuizDifficulty] = useState('medium');
  const [quizTimeLimit, setQuizTimeLimit] = useState('15');
  
  const [generating, setGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const lessons = await base44.entities.Lesson.filter({ course_id: courseId });
        const sections = [...new Set(lessons.map(l => l.section).filter(Boolean))];
        setExistingSections(sections);
      } catch (error) {
        console.error('Failed to fetch sections:', error);
      }
    };
    
    if (courseId) {
      fetchSections();
    }
  }, [courseId]);

  const generateContent = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setGenerating(true);
    
    try {
      // Step 1: Generate slides
      setCurrentStep('Searching online resources and generating slides...');
      
      const slidesResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert educational content creator. Generate comprehensive, modern lesson slides for:

TOPIC: ${topic}
${additionalPrompt ? `ADDITIONAL REQUIREMENTS: ${additionalPrompt}` : ''}

CURRICULUM: ${curriculum} - ${examBoard} Exam Board
NUMBER OF SLIDES: ${numSlides}

Requirements:
1. Search and research current ${curriculum} ${examBoard} curriculum standards, textbooks, teaching resources, and academic materials from trusted online sources
2. Create ${numSlides} detailed, engaging slides with:
   - Clear, modern visual HTML layouts
   - Relevant diagrams, charts, and visual elements (use placeholder images with descriptive URLs)
   - Key definitions, concepts, and explanations
   - Real-world examples and applications
   - Interactive elements (use the card, poll, quiz extensions we have)
3. Make content age-appropriate for ${curriculum} level students
4. Include academic rigor aligned with ${examBoard} standards
5. Use proper HTML formatting with inline styles for visual appeal

Return JSON array of slides:
[
  {
    "title": "Slide title",
    "content": "Rich HTML content with inline styles, diagrams, cards, etc.",
    "speaker_notes": "Teaching tips and key points for instructors"
  }
]`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            slides: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                  speaker_notes: { type: "string" }
                }
              }
            }
          }
        }
      });

      const slides = slidesResult.slides || [];
      
      // Step 2: Generate quiz if requested
      let quiz = null;
      if (includeQuiz) {
        setCurrentStep('Creating advanced assessment quiz...');
        
        const quizResult = await base44.integrations.Core.InvokeLLM({
          prompt: `Based on the topic "${topic}" for ${curriculum} ${examBoard}, create a challenging time-based quiz.

DIFFICULTY: ${quizDifficulty}
NUMBER OF QUESTIONS: ${quizDifficulty === 'easy' ? '15' : quizDifficulty === 'medium' ? '25' : '40'}

Requirements:
1. Create questions that assess deep understanding, not just memorization
2. Include a mix of: concept application, analysis, and problem-solving
3. Each question should have 4 well-crafted options
4. Provide detailed explanations for correct answers
5. Align with ${curriculum} ${examBoard} assessment objectives

Return JSON:
{
  "title": "Quiz title",
  "description": "Brief description",
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Detailed explanation of why this is correct"
    }
  ],
  "assessment_criteria": "What skills this quiz assesses"
}`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    options: { type: "array", items: { type: "string" } },
                    correct_answer: { type: "number" },
                    explanation: { type: "string" }
                  }
                }
              },
              assessment_criteria: { type: "string" }
            }
          }
        });

        quiz = quizResult;
      }

      // Step 3: Generate learning objectives and success criteria
      setCurrentStep('Generating learning objectives...');
      
      const objectivesResult = await base44.integrations.Core.InvokeLLM({
        prompt: `For the topic "${topic}" aligned with ${curriculum} ${examBoard}, generate:

1. Clear learning objectives
2. Success criteria for student assessment
3. Common misconceptions to address
4. Extension activities for advanced students

Return JSON format.`,
        response_json_schema: {
          type: "object",
          properties: {
            learning_objectives: { type: "array", items: { type: "string" } },
            success_criteria: { type: "array", items: { type: "string" } },
            common_misconceptions: { type: "array", items: { type: "string" } },
            extension_activities: { type: "array", items: { type: "string" } }
          }
        }
      });

      setGeneratedContent({
        slides,
        quiz,
        objectives: objectivesResult,
        metadata: {
          topic,
          curriculum,
          examBoard,
          generatedDate: new Date().toISOString(),
        }
      });

      setCurrentStep('');
      toast.success('Content generated successfully!');
    } catch (error) {
      toast.error('Failed to generate content');
      console.error(error);
      setCurrentStep('');
    } finally {
      setGenerating(false);
    }
  };

  const saveContent = async () => {
    if (!generatedContent) return;

    try {
      // Save lesson with slides
      const lesson = await base44.entities.Lesson.create({
        course_id: courseId,
        title: topic,
        description: `${curriculum} ${examBoard} aligned lesson on ${topic}`,
        slides: generatedContent.slides.map((slide, idx) => ({
          title: slide.title,
          content: slide.content,
          order: idx + 1
        })),
        order: 999,
        section: sectionName || generatedContent.metadata.curriculum
      });

      // Save quiz if generated
      if (generatedContent.quiz) {
        await base44.entities.Quiz.create({
          course_id: courseId,
          lesson_id: lesson.id,
          title: generatedContent.quiz.title,
          description: generatedContent.quiz.description,
          passing_score: quizDifficulty === 'hard' ? 75 : 70,
          time_limit_minutes: parseInt(quizTimeLimit),
          questions: generatedContent.quiz.questions,
        });
      }

      toast.success('Lesson and quiz saved!');
      onSlidesGenerated?.();
      onClose?.();
    } catch (error) {
      toast.error('Failed to save content');
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Advanced AI Slide Generator</h2>
                <p className="text-sm text-gray-600">Curriculum-aligned content with assessments</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
              {!generatedContent ? (
                <div className="space-y-6 max-w-3xl mx-auto">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  What This AI Can Do
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Generate curriculum-aligned slides with real-time research</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Create modern, visual content with diagrams and interactive elements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Build time-based assessment quizzes with detailed feedback</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Auto-grade and provide personalized student recommendations</span>
                  </li>
                </ul>
              </Card>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Topic / Lesson Title *</Label>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Photosynthesis, Quadratic Equations, World War II"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold">Section/Path (Optional)</Label>
                  <Select value={sectionName} onValueChange={setSectionName}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select existing section or type new one" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingSections.length > 0 && (
                        <>
                          {existingSections.map((section) => (
                            <SelectItem key={section} value={section}>
                              {section}
                            </SelectItem>
                          ))}
                        </>
                      )}
                      <SelectItem value="_new_section">+ Create New Section</SelectItem>
                    </SelectContent>
                  </Select>
                  {sectionName === '_new_section' && (
                    <Input
                      value=""
                      onChange={(e) => setSectionName(e.target.value)}
                      placeholder="Enter new section name"
                      className="mt-2"
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-1">Organize lesson into a course section or learning path</p>
                </div>

                <div>
                  <Label className="text-base font-semibold">Additional Instructions (Optional)</Label>
                  <Textarea
                    value={additionalPrompt}
                    onChange={(e) => setAdditionalPrompt(e.target.value)}
                    placeholder="e.g., Focus on practical applications, include case studies, add more diagrams..."
                    className="mt-2 h-20"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Curriculum Standard</Label>
                    <Select value={curriculum} onValueChange={setCurriculum}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GCSE">GCSE</SelectItem>
                        <SelectItem value="A-Level">A-Level</SelectItem>
                        <SelectItem value="IB">IB</SelectItem>
                        <SelectItem value="AP">AP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Exam Board</Label>
                    <Select value={examBoard} onValueChange={setExamBoard}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AQA">AQA</SelectItem>
                        <SelectItem value="Edexcel">Edexcel</SelectItem>
                        <SelectItem value="OCR">OCR</SelectItem>
                        <SelectItem value="CCEA">CCEA</SelectItem>
                        <SelectItem value="WJEC">WJEC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Number of Slides</Label>
                    <Select value={numSlides} onValueChange={setNumSlides}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 slides</SelectItem>
                        <SelectItem value="5">5 slides</SelectItem>
                        <SelectItem value="8">8 slides</SelectItem>
                        <SelectItem value="10">10 slides</SelectItem>
                        <SelectItem value="15">15 slides</SelectItem>
                        <SelectItem value="20">20 slides</SelectItem>
                        <SelectItem value="30">30 slides</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Quiz Difficulty</Label>
                    <Select value={quizDifficulty} onValueChange={setQuizDifficulty}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy (15 questions)</SelectItem>
                        <SelectItem value="medium">Medium (25 questions)</SelectItem>
                        <SelectItem value="hard">Hard (40 questions)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Quiz Time Limit (minutes)</Label>
                    <Select value={quizTimeLimit} onValueChange={setQuizTimeLimit}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="20">20 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="includeQuiz"
                    checked={includeQuiz}
                    onChange={(e) => setIncludeQuiz(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="includeQuiz" className="cursor-pointer">
                    Generate assessment quiz with auto-grading
                  </Label>
                </div>
              </div>

              <Button
                onClick={generateContent}
                disabled={generating || !topic.trim()}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-14 text-base font-semibold shadow-lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Lesson Content
                  </>
                )}
              </Button>

              {generating && currentStep && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <p className="text-sm text-blue-900">{currentStep}</p>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Success Header */}
              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Content Generated Successfully!</h3>
                    <p className="text-sm text-gray-600">
                      {generatedContent.slides.length} slides
                      {generatedContent.quiz && ` + ${generatedContent.quiz.questions.length} question quiz`}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    {generatedContent.metadata.curriculum}
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-800">
                    {generatedContent.metadata.examBoard}
                  </Badge>
                  {generatedContent.quiz && (
                    <Badge className="bg-orange-100 text-orange-800">
                      <Clock className="w-3 h-3 mr-1" />
                      {quizTimeLimit} min quiz
                    </Badge>
                  )}
                </div>
              </Card>

              {/* Learning Objectives */}
              <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  Learning Objectives
                </h3>
                <ul className="space-y-2">
                  {generatedContent.objectives.learning_objectives?.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Slides Preview with Slider */}
              <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Generated Slides Preview
                </h3>
                
                {/* Slide Viewer */}
                <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden mb-4">
                  <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Slide {previewSlideIndex + 1} of {generatedContent.slides.length}
                      </Badge>
                      <h4 className="font-semibold text-gray-900">
                        {generatedContent.slides[previewSlideIndex]?.title}
                      </h4>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewSlideIndex(Math.max(0, previewSlideIndex - 1))}
                        disabled={previewSlideIndex === 0}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewSlideIndex(Math.min(generatedContent.slides.length - 1, previewSlideIndex + 1))}
                        disabled={previewSlideIndex === generatedContent.slides.length - 1}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto bg-white">
                    <div className="p-6">
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: generatedContent.slides[previewSlideIndex]?.content || '' 
                        }}
                      />
                    </div>
                  </div>
                  
                  {generatedContent.slides[previewSlideIndex]?.speaker_notes && (
                    <div className="bg-blue-50 border-t border-blue-200 px-4 py-3">
                      <p className="text-xs text-blue-900">
                        <strong>Speaker Notes:</strong> {generatedContent.slides[previewSlideIndex].speaker_notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Slide Thumbnails - Horizontal Scroll */}
                <ScrollArea className="w-full">
                  <div className="flex gap-2 pb-2">
                    {generatedContent.slides.map((slide, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPreviewSlideIndex(idx)}
                        className={`flex-shrink-0 w-48 p-2 text-left rounded-lg border-2 transition-all ${
                          previewSlideIndex === idx
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="text-xs font-medium text-gray-900 truncate mb-1">
                          {idx + 1}. {slide.title}
                        </div>
                        <div className="w-full h-12 bg-gray-100 rounded text-[8px] text-gray-500 overflow-hidden p-1">
                          {slide.content.replace(/<[^>]*>/g, ' ').substring(0, 50)}...
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </Card>

              {/* Quiz Preview */}
              {generatedContent.quiz && (
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    Assessment Quiz
                  </h3>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-100 text-purple-800">
                        {generatedContent.quiz.questions.length} questions
                      </Badge>
                      <Badge className="bg-orange-100 text-orange-800">
                        <Clock className="w-3 h-3 mr-1" />
                        {quizTimeLimit} minutes
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        {quizDifficulty} difficulty
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>Assessment Criteria:</strong> {generatedContent.quiz.assessment_criteria}
                    </p>
                  </div>
                  
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-purple-700 hover:text-purple-800">
                      Preview Questions
                    </summary>
                    <div className="mt-3 space-y-3">
                      {generatedContent.quiz.questions.slice(0, 3).map((q, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-lg border">
                          <p className="font-medium text-sm text-gray-900 mb-2">
                            Q{idx + 1}: {q.question}
                          </p>
                          <div className="space-y-1">
                            {q.options.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className={`text-xs p-2 rounded ${
                                  optIdx === q.correct_answer
                                    ? 'bg-green-100 text-green-800 font-medium'
                                    : 'bg-gray-50 text-gray-600'
                                }`}
                              >
                                {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                </Card>
              )}

              {/* Additional Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Common Misconceptions</h4>
                  <ul className="space-y-1">
                    {generatedContent.objectives.common_misconceptions?.map((misc, idx) => (
                      <li key={idx} className="text-xs text-gray-600">• {misc}</li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Extension Activities</h4>
                  <ul className="space-y-1">
                    {generatedContent.objectives.extension_activities?.map((act, idx) => (
                      <li key={idx} className="text-xs text-gray-600">• {act}</li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Footer */}
        {generatedContent && (
          <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
            <div className="flex items-center justify-between gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setGeneratedContent(null);
                  setTopic('');
                  setAdditionalPrompt('');
                  setSectionName('');
                }}
              >
                Generate New Content
              </Button>
              <Button 
                onClick={saveContent}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Save to Course
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}