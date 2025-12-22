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
  Sparkles, Loader2, CheckCircle, CheckCircle2, BookOpen, 
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
  const [newSectionName, setNewSectionName] = useState('');
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
        console.log('Fetched lessons:', lessons);
        console.log('Extracted sections:', sections);
        setExistingSections(sections);
      } catch (error) {
        console.error('Failed to fetch sections:', error);
      }
    };
    
    if (courseId) {
      console.log('Fetching sections for courseId:', courseId);
      fetchSections();
    } else {
      console.warn('No courseId provided to AdvancedAISlideGenerator');
    }
  }, [courseId]);

  const generateContent = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setGenerating(true);
    
    try {
      // Step 1: Generate slides with Gemini
      setCurrentStep('Using Gemini AI to create professional slides with rich graphics...');
      
      const slidesPrompt = `You are an expert educational content creator with expertise in visual design and pedagogy.

Create ${numSlides} HIGHLY DETAILED, PROFESSIONAL lesson slides for: "${topic}"
${additionalPrompt ? `\n\nADDITIONAL REQUIREMENTS: ${additionalPrompt}` : ''}

CURRICULUM: ${curriculum} - ${examBoard} Exam Board

CRITICAL REQUIREMENTS FOR PROFESSIONAL QUALITY:

1. **Rich HTML Content**: Each slide MUST include:
   - Professional styling with gradients, shadows, and modern design
   - Multiple sections with clear visual hierarchy
   - Color-coded information boxes (definitions, examples, key points)
   - Real placeholder images with DESCRIPTIVE alt text (e.g., "diagram-of-photosynthesis-process.png")
   - Tables, charts, and diagrams where appropriate
   - Visual callouts and highlights for important information

2. **Visual Elements**: Include in your HTML:
   - <img> tags with descriptive placeholder URLs like: https://via.placeholder.com/800x500/4F46E5/FFFFFF?text=Photosynthesis+Diagram
   - Styled <div> boxes for definitions (blue gradient background)
   - <table> for comparing concepts
   - Color-coded <span> elements for key terms
   - Icons using emoji or symbols (✓, →, ★, 💡, ⚠️)

3. **Content Structure**: Each slide should have:
   - A clear, engaging title
   - 3-5 main points with detailed explanations
   - Visual examples or diagrams
   - Real-world applications
   - Key vocabulary highlighted
   - At least 200-400 words of well-formatted content

4. **HTML Styling**: Use inline styles for:
   - Background gradients: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
   - Box shadows: box-shadow: 0 4px 12px rgba(0,0,0,0.1)
   - Rounded corners: border-radius: 12px
   - Padding and spacing: padding: 20px; margin: 15px 0
   - Font sizes: h2 {font-size: 28px}, p {font-size: 16px}

5. **Educational Quality**:
   - Aligned with ${curriculum} ${examBoard} curriculum
   - Age-appropriate language and examples
   - Progressive difficulty across slides
   - Include mnemonics or memory aids where helpful

EXAMPLE FORMAT:
{
  "title": "Introduction to Photosynthesis",
  "content": "<div style='background: linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%); padding: 30px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);'><h2 style='color: #0C4A6E; font-size: 32px; margin-bottom: 20px;'>🌿 What is Photosynthesis?</h2><p style='font-size: 18px; line-height: 1.8; color: #334155;'>Photosynthesis is the remarkable process by which plants convert light energy into chemical energy...</p><img src='https://via.placeholder.com/800x400/10B981/FFFFFF?text=Photosynthesis+Process+Diagram' style='width: 100%; border-radius: 12px; margin: 20px 0;' alt='Detailed diagram showing photosynthesis process'/><div style='background: white; padding: 20px; border-left: 5px solid #10B981; border-radius: 8px; margin: 20px 0;'><h3 style='color: #059669;'>💡 Key Equation</h3><p style='font-size: 20px; text-align: center; font-weight: bold;'>6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂</p></div></div>",
  "speaker_notes": "Start by asking students what they ate for breakfast and trace it back to plants. Emphasize that ALL food energy ultimately comes from the sun via photosynthesis."
}

Return ONLY valid JSON with this structure:
{
  "slides": [
    {
      "title": "Slide title here",
      "content": "Rich HTML content with inline styles, images, tables, etc.",
      "speaker_notes": "Teaching tips and discussion prompts"
    }
  ]
}`;

      const slidesResponse = await base44.functions.invoke('generateWithGemini', {
        prompt: slidesPrompt,
        type: 'slides'
      });

      console.log('Full Manus API response:', slidesResponse);
      console.log('Response data:', slidesResponse.data);

      if (!slidesResponse.data?.success) {
        throw new Error(slidesResponse.data?.error || 'Failed to generate slides with Manus');
      }

      const slidesResult = slidesResponse.data.result;
      console.log('Slides result from Manus:', slidesResult);
      
      const slides = slidesResult?.slides || [];
      console.log('Extracted slides array:', slides);
      console.log('Number of slides extracted:', slides.length);
      
      if (!slides || slides.length === 0) {
        throw new Error('No slides were generated. Please try again with a different topic or instructions.');
      }
      
      // Log first and last slide to verify
      console.log('First slide:', slides[0]);
      console.log('Last slide:', slides[slides.length - 1]);
      
      // Step 2: Generate quiz if requested with Gemini
      let quiz = null;
      if (includeQuiz) {
        setCurrentStep('Creating comprehensive assessment quiz with Gemini...');
        
        const quizPrompt = `Create a COMPREHENSIVE, CHALLENGING quiz for "${topic}" (${curriculum} ${examBoard}).

DIFFICULTY: ${quizDifficulty}
NUMBER OF QUESTIONS: ${quizDifficulty === 'easy' ? '15' : quizDifficulty === 'medium' ? '25' : '40'}

REQUIREMENTS:
1. Questions should test deep understanding, not just memorization
2. Mix of question types: concept application, analysis, problem-solving, and critical thinking
3. Each question MUST have exactly 4 well-crafted, plausible options
4. Include questions of varying difficulty within the ${quizDifficulty} level
5. Provide DETAILED explanations (3-5 sentences) for correct answers
6. Align with ${curriculum} ${examBoard} assessment objectives and mark schemes
7. Include real-world scenarios where applicable

QUESTION QUALITY:
- Avoid obvious wrong answers
- Use diagrams/scenarios in questions where appropriate
- Include numerical problems if relevant to the topic
- Test both knowledge recall AND application
- Ensure distractors (wrong answers) are plausible but clearly incorrect

Return ONLY valid JSON:
{
  "title": "Comprehensive ${topic} Assessment",
  "description": "A challenging ${quizDifficulty}-level quiz testing your understanding of ${topic}",
  "questions": [
    {
      "question": "Question text here (can include HTML for formatting)",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Detailed explanation of why this answer is correct and why others are wrong"
    }
  ],
  "assessment_criteria": "This quiz assesses [specific skills and knowledge areas]"
}`;

        const quizResponse = await base44.functions.invoke('generateWithGemini', {
          prompt: quizPrompt,
          type: 'quiz'
        });

        const quizResult = quizResponse.data?.success ? quizResponse.data.result : null;

        if (!quizResult || !quizResult.questions || quizResult.questions.length === 0) {
          toast.error('Quiz generation failed, but slides were created successfully');
          quiz = null;
        } else {
          quiz = quizResult;
        }
      }

      // Step 3: Generate learning objectives with Gemini
      setCurrentStep('Generating comprehensive learning objectives...');
      
      const objectivesPrompt = `For "${topic}" (${curriculum} ${examBoard}), create comprehensive pedagogical materials:

1. **Learning Objectives** (5-7 items): Clear, measurable objectives using Bloom's taxonomy verbs
2. **Success Criteria** (5-7 items): Specific, observable criteria students can use for self-assessment
3. **Common Misconceptions** (4-6 items): Typical student errors or misunderstandings with explanations
4. **Extension Activities** (4-6 items): Challenging tasks for advanced learners

Make all items specific to ${curriculum} ${examBoard} standards and curriculum.

Return ONLY valid JSON:
{
  "learning_objectives": ["Students will be able to...", "..."],
  "success_criteria": ["I can explain...", "I can calculate...", "..."],
  "common_misconceptions": ["Students often think... but actually...", "..."],
  "extension_activities": ["Research and present...", "Create a model of...", "..."]
}`;

      const objectivesResponse = await base44.functions.invoke('generateWithGemini', {
        prompt: objectivesPrompt,
        type: 'objectives'
      });

      const objectivesResult = objectivesResponse.data?.success ? objectivesResponse.data.result : null;

      const objectives = {
        learning_objectives: objectivesResult?.learning_objectives || [],
        success_criteria: objectivesResult?.success_criteria || [],
        common_misconceptions: objectivesResult?.common_misconceptions || [],
        extension_activities: objectivesResult?.extension_activities || []
      };

      console.log('Generated slides:', slides);
      console.log('Number of slides:', slides?.length);
      
      setGeneratedContent({
        slides: slides || [],
        quiz: quiz || null,
        objectives,
        metadata: {
          topic,
          curriculum,
          examBoard,
          generatedDate: new Date().toISOString(),
        }
      });

      setCurrentStep('');
      toast.success(`Content generated successfully! ${slides?.length || 0} slides created`);
    } catch (error) {
      const errorMessage = error.message || 'Failed to generate content';
      toast.error(errorMessage);
      console.error('Generation error:', error);
      setCurrentStep('');
      setGeneratedContent(null);
    } finally {
      setGenerating(false);
    }
  };

  const saveContent = async () => {
    if (!generatedContent) return;

    try {
      const finalSection = sectionName === '_new_section' ? newSectionName : sectionName;
      console.log('Saving with section:', finalSection);
      console.log('sectionName:', sectionName);
      console.log('newSectionName:', newSectionName);
      
      // Save lesson with slides
      const lesson = await base44.entities.Lesson.create({
        course_id: courseId,
        title: topic,
        description: `${curriculum} ${examBoard} aligned lesson on ${topic}`,
        slides: (generatedContent?.slides || []).map((slide, idx) => ({
          title: slide.title,
          content: slide.content,
          order: idx + 1
        })),
        order: 999,
        section: finalSection || 'General'
      });

      // Save quiz if generated
      if (generatedContent?.quiz?.questions?.length > 0) {
        await base44.entities.Quiz.create({
          course_id: courseId,
          lesson_id: lesson.id,
          title: generatedContent.quiz.title || 'Quiz',
          description: generatedContent.quiz.description || '',
          passing_score: quizDifficulty === 'hard' ? 75 : 70,
          time_limit_minutes: parseInt(quizTimeLimit),
          questions: generatedContent.quiz.questions,
        });
      }

      console.log('Lesson saved successfully:', lesson);
      toast.success(`✓ Saved "${topic}" with ${generatedContent.slides.length} slides to "${finalSection || 'General'}" section!`, {
        duration: 5000
      });
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
                  <Select value={sectionName} onValueChange={(value) => {
                    setSectionName(value);
                    if (value !== '_new_section') {
                      setNewSectionName('');
                    }
                  }}>
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
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
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
                      {generatedContent?.slides?.length || 0} slides
                      {generatedContent?.quiz?.questions && ` + ${generatedContent.quiz.questions.length} question quiz`}
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
                  {(generatedContent?.objectives?.learning_objectives || []).map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Slides Preview with Slider */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Generated Slides Preview
                  </h3>
                  <Badge className="bg-indigo-100 text-indigo-800 text-base px-3 py-1">
                    {generatedContent?.slides?.length || 0} Total Slides
                  </Badge>
                </div>
                
                {/* Slide Viewer */}
                <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden mb-4">
                  <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Slide {previewSlideIndex + 1} of {generatedContent?.slides?.length || 0}
                      </Badge>
                      <h4 className="font-semibold text-gray-900">
                        {generatedContent?.slides?.[previewSlideIndex]?.title || 'Untitled'}
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
                        onClick={() => setPreviewSlideIndex(Math.min((generatedContent?.slides?.length || 1) - 1, previewSlideIndex + 1))}
                        disabled={previewSlideIndex === (generatedContent?.slides?.length || 1) - 1}
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
                         __html: generatedContent?.slides?.[previewSlideIndex]?.content || '<p>No content available</p>' 
                       }}
                      />
                    </div>
                  </div>
                  
                  {generatedContent?.slides?.[previewSlideIndex]?.speaker_notes && (
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
                    {(generatedContent?.slides || []).map((slide, idx) => (
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
                        {generatedContent?.quiz?.questions?.length || 0} questions
                      </Badge>
                      <Badge className="bg-orange-100 text-orange-800">
                        <Clock className="w-3 h-3 mr-1" />
                        {quizTimeLimit} minutes
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        {quizDifficulty} difficulty
                      </Badge>
                    </div>
                    {generatedContent?.quiz?.assessment_criteria && (
                      <p className="text-sm text-gray-700">
                        <strong>Assessment Criteria:</strong> {generatedContent.quiz.assessment_criteria}
                      </p>
                    )}
                  </div>
                  
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-purple-700 hover:text-purple-800">
                      Preview Questions
                    </summary>
                    <div className="mt-3 space-y-3">
                      {(generatedContent?.quiz?.questions || []).slice(0, 3).map((q, idx) => (
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
                    {(generatedContent?.objectives?.common_misconceptions || []).map((misc, idx) => (
                      <li key={idx} className="text-xs text-gray-600">• {misc}</li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Extension Activities</h4>
                  <ul className="space-y-1">
                    {(generatedContent?.objectives?.extension_activities || []).map((act, idx) => (
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
                  setNewSectionName('');
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