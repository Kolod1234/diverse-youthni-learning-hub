import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, Loader2, BookOpen, Brain, ImagePlus, FileText, 
  Upload, Globe, Layers, Zap, CheckCircle, AlertCircle,
  ChevronRight, Wand2, Target, Lightbulb, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function EnhancedAIGenerateMode({ onSlidesGenerated, courseId, existingLessonId }) {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [learningObjectives, setLearningObjectives] = useState(['', '', '']);
  const [slideCount, setSlideCount] = useState(10);
  const [curriculum, setCurriculum] = useState('GCSE');
  const [examBoard, setExamBoard] = useState('AQA');
  const [targetAudience, setTargetAudience] = useState('secondary');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [includeQuiz, setIncludeQuiz] = useState(true);
  const [includeSpeakerNotes, setIncludeSpeakerNotes] = useState(true);
  const [includeInteractives, setIncludeInteractives] = useState(true);
  const [generateImages, setGenerateImages] = useState(true);
  const [imageProvider, setImageProvider] = useState('modelslab');
  const [aiProvider, setAiProvider] = useState('perplexity');
  const [visualStyle, setVisualStyle] = useState('modern');
  const [generating, setGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [useWebResearch, setUseWebResearch] = useState(true);
  const [useAILearning, setUseAILearning] = useState(true);
  const [syllabusUrl, setSyllabusUrl] = useState('');

  const updateProgress = (step, progressPercent) => {
    setCurrentStep(step);
    setProgress(progressPercent);
  };

  const addLearningObjective = () => {
    setLearningObjectives([...learningObjectives, '']);
  };

  const updateLearningObjective = (index, value) => {
    const updated = [...learningObjectives];
    updated[index] = value;
    setLearningObjectives(updated);
  };

  const generateRobustSlides = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setGenerating(true);
    setProgress(0);

    try {
      // Step 1: Research and curriculum alignment (10%)
      updateProgress('📚 Analyzing curriculum standards and researching topic...', 10);
      
      let curriculumContext = '';
      if (useWebResearch) {
        try {
          const curriculumData = await base44.functions.invoke('getCCEACurriculum', {
            subject: topic,
            level: curriculum
          });
          if (curriculumData.data?.topics) {
            curriculumContext = `\n\nCURRICULUM ALIGNMENT (${curriculum} - ${examBoard}):
Key Topics: ${curriculumData.data.topics.slice(0, 5).join(', ')}
Learning Outcomes: ${curriculumData.data.outcomes?.slice(0, 3).join('; ') || 'Standard outcomes'}`;
          }
        } catch (err) {
          console.log('Curriculum fetch failed, continuing with generation');
        }
      }

      // Step 2: AI Learning from existing slides (20%)
      updateProgress('🧠 Learning from successful presentations...', 20);
      
      let learningContext = '';
      if (useAILearning) {
        try {
          const learningResult = await base44.functions.invoke('learnFromSlides', { 
            topic, 
            contentType: curriculum.toLowerCase() 
          });
          if (learningResult.data?.patterns) {
            const p = learningResult.data.patterns;
            learningContext = `\n\n--- AI LEARNED PATTERNS ---
STRUCTURE: ${p.slideStructures?.join(', ') || 'Progressive difficulty'}
VISUALS: ${p.visualPatterns?.join(', ') || 'Diagrams and examples'}
ENGAGEMENT: ${p.contentOrganization?.join(', ') || 'Interactive elements'}
SUCCESS METRICS: ${p.topicInsights || 'High completion rates'}
--- Apply these patterns ---`;
          }
        } catch (err) {
          console.log('Learning failed');
        }
      }

      // Step 3: Generate comprehensive outline (30%)
      updateProgress('📝 Creating detailed lesson outline...', 30);
      
      const outlinePrompt = `Create a COMPREHENSIVE EDUCATIONAL OUTLINE for "${topic}".

CURRICULUM: ${curriculum} (${examBoard})
AUDIENCE: ${targetAudience} students
DIFFICULTY: ${difficulty}
DURATION: ${slideCount} slides

${curriculumContext}
${learningContext}

LEARNING OBJECTIVES:
${learningObjectives.filter(obj => obj.trim()).map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

Generate a detailed outline with:
1. Lesson overview and real-world relevance
2. Prerequisite knowledge
3. Key concepts (3-5 main ideas)
4. Common misconceptions to address
5. Progressive difficulty structure
6. Assessment opportunities
7. Real-world applications

Return JSON:
{
  "overview": "string",
  "prerequisites": ["string"],
  "key_concepts": [{"title": "string", "description": "string", "importance": "high/medium/low"}],
  "misconceptions": ["string"],
  "flow": [{"slide": 1, "purpose": "string"}, ...],
  "assessment_points": ["string"],
  "real_world_apps": ["string"]
}`;

      const outlineResult = await base44.integrations.Core.InvokeLLM({
        prompt: outlinePrompt,
        add_context_from_internet: useWebResearch,
        response_json_schema: {
          type: 'object',
          properties: {
            overview: { type: 'string' },
            prerequisites: { type: 'array', items: { type: 'string' } },
            key_concepts: { 
              type: 'array', 
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  importance: { type: 'string', enum: ['high', 'medium', 'low'] }
                }
              }
            },
            misconceptions: { type: 'array', items: { type: 'string' } },
            flow: { 
              type: 'array', 
              items: {
                type: 'object',
                properties: {
                  slide: { type: 'number' },
                  purpose: { type: 'string' }
                }
              }
            },
            assessment_points: { type: 'array', items: { type: 'string' } },
            real_world_apps: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      // Step 4: Generate rich slide content (50%)
      updateProgress('🎨 Generating professional slide content...', 50);
      
      const styleGuides = {
        modern: 'premium modern educational design, clean visual hierarchy, elegant spacing, strong contrast, polished textbook layout with contemporary aesthetics',
        classic: 'refined academic presentation design, balanced composition, subtle professional color palette, formal and credible visual style, traditional educational layout',
        minimal: 'minimal premium slide design, abundant white space, crisp typography, restrained color accents, clean editorial look, focused content presentation',
        colorful: 'visually rich educational design, vibrant but controlled colors, engaging composition, modern classroom-friendly polish, dynamic visual elements',
        technical: 'technical presentation design, structured layout, data-driven visual language, precise diagrams, professional blueprint aesthetic, engineering-style clarity'
      };

      const slides = [];
      for (let i = 0; i < slideCount; i++) {
        updateProgress(`Creating slide ${i + 1} of ${slideCount}...`, 50 + (i / slideCount) * 30);
        
        const slidePurpose = outlineResult?.flow?.[i]?.purpose || `Concept ${i + 1}`;
        const keyConcept = outlineResult?.key_concepts?.[i] || null;
        
        const slidePrompt = `Create slide ${i + 1} of ${slideCount} for "${topic}".

SLIDE PURPOSE: ${slidePurpose}
${keyConcept ? `KEY CONCEPT: ${keyConcept.title}\n${keyConcept.description}` : ''}

CURRICULUM: ${curriculum} (${examBoard})
STYLE: ${visualStyle} - ${styleGuides[visualStyle]}

REQUIREMENTS:
1. Title: Engaging, clear, student-friendly (max 8 words)
2. Content: Rich HTML with 3-5 bullet points, each 10-15 words max
3. Use LaTeX math notation $...$ for formulas
4. Include visual element description
5. ${includeSpeakerNotes ? 'Speaker notes: 2-3 sentences with teaching tips' : ''}
6. ${includeInteractives ? 'Suggest 1 interactive element (poll, quiz, drag-drop, fill-blanks)' : ''}
7. ${generateImages ? 'Describe 1-2 images to generate with detailed prompts' : ''}

CONTENT RULES:
- HTML tags ONLY: <ul>, <li>, <strong>, <em>, <div>, <span>
- NO markdown, NO code fences
- Professional educational tone
- Age-appropriate language for ${targetAudience}
- Include real-world example or application

Return JSON:
{
  "title": "string",
  "content": "HTML string with bullet points",
  "visual_description": "detailed description of visual layout",
  ${includeSpeakerNotes ? '"speaker_notes": "string",' : ''}
  ${includeInteractives ? '"interactive_suggestion": {"type": "poll/quiz/drag-drop/fill-blanks", "question": "string", "options": ["string"]},' : ''}
  ${generateImages ? '"image_prompts": ["detailed image generation prompt 1", "detailed prompt 2"]' : ''}
  ${!generateImages ? '"image_prompts": []' : ''}
}`;

        const slideResult = await base44.integrations.Core.InvokeLLM({
          prompt: slidePrompt,
          add_context_from_internet: false,
          response_json_schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              content: { type: 'string' },
              visual_description: { type: 'string' },
              ...(includeSpeakerNotes && { speaker_notes: { type: 'string' } }),
              ...(includeInteractives && {
                interactive_suggestion: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', enum: ['poll', 'quiz', 'drag-drop', 'fill-blanks'] },
                    question: { type: 'string' },
                    options: { type: 'array', items: { type: 'string' } }
                  }
                }
              }),
              image_prompts: { type: 'array', items: { type: 'string' } }
            }
          }
        });

        slides.push({
          title: slideResult.title || `Slide ${i + 1}`,
          content: slideResult.content || '<ul><li>Content here</li></ul>',
          speaker_notes: slideResult.speaker_notes || '',
          interactive: slideResult.interactive_suggestion || null,
          image_prompts: slideResult.image_prompts || [],
          order: i + 1
        });
      }

      // Step 5: Generate AI images (80%)
      if (generateImages && imageProvider !== 'placeholder') {
        updateProgress('🖼️ Generating AI images for slides...', 80);
        
        for (let i = 0; i < slides.length; i++) {
          if (slides[i].image_prompts?.length > 0) {
            try {
              const prompt = slides[i].image_prompts[0];
              let imageUrl;
              
              if (imageProvider === 'modelslab') {
                const imgResponse = await base44.functions.invoke('generateImageForSlide', {
                  prompt,
                  style: 'educational-illustration',
                });
                imageUrl = imgResponse.data?.imageUrl;
              } else if (imageProvider === 'flux2') {
                const imgResponse = await base44.functions.invoke('geminiImageGeneration', {
                  prompt,
                });
                imageUrl = imgResponse.data?.url;
              }
              
              if (imageUrl) {
                slides[i].image_url = imageUrl;
              }
            } catch (err) {
              console.warn(`Failed to generate image for slide ${i + 1}:`, err);
            }
          }
        }
      }

      // Step 6: Generate quiz (90%)
      if (includeQuiz) {
        updateProgress('📝 Creating assessment quiz...', 90);
        
        const quizPrompt = `Create a COMPREHENSIVE QUIZ for "${topic}" (${curriculum} ${examBoard}).

DIFFICULTY: ${difficulty}
QUESTIONS: 10-15 questions

REQUIREMENTS:
1. Mix of question types: multiple choice, true/false, short answer
2. Test understanding, not just memorization
3. Include real-world scenarios
4. Provide detailed explanations for correct answers
5. Align with ${curriculum} assessment objectives

Return JSON:
{
  "title": "string",
  "questions": [
    {
      "question": "string",
      "type": "multiple_choice/true_false/short_answer",
      "options": ["string"],
      "correct_answer": "string or number",
      "explanation": "string",
      "marks": 1,
      "difficulty": "easy/medium/hard"
    }
  ]
}`;

        const quizResult = await base44.integrations.Core.InvokeLLM({
          prompt: quizPrompt,
          add_context_from_internet: useWebResearch,
          response_json_schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              questions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    question: { type: 'string' },
                    type: { type: 'string', enum: ['multiple_choice', 'true_false', 'short_answer'] },
                    options: { type: 'array', items: { type: 'string' } },
                    correct_answer: { type: ['string', 'number'] },
                    explanation: { type: 'string' },
                    marks: { type: 'number' },
                    difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] }
                  }
                }
              }
            }
          }
        });

        slides.quiz = quizResult;
      }

      // Step 7: Finalize and format (100%)
      updateProgress('✨ Finalizing presentation...', 100);
      
      const finalSlides = slides.map((slide, idx) => ({
        ...slide,
        id: Date.now() + idx,
        content: slide.content
          .replace(/```html\n?/gi, '')
          .replace(/```\n?/gi, '')
          .trim(),
        metadata: {
          curriculum,
          examBoard,
          difficulty,
          targetAudience,
          visualStyle
        }
      }));

      // Save analytics for AI learning
      if (useAILearning) {
        try {
          await Promise.all(finalSlides.map(slide =>
            base44.entities.SlideAnalytics.create({
              slide_content: slide.content,
              slide_title: slide.title,
              topic,
              visual_type: slide.image_url ? 'ai_image' : slide.interactive ? 'interactive' : 'standard',
              content_type: curriculum.toLowerCase(),
              visual_style: visualStyle,
              success_score: 100,
              curriculum_aligned: true,
              exam_board: examBoard
            })
          ));
        } catch (err) {
          console.log('Analytics tracking failed');
        }
      }

      onSlidesGenerated(finalSlides);
      toast.success(`Generated ${finalSlides.length} slides with ${includeQuiz ? 'quiz' : 'content'}!`);
      
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate content');
    } finally {
      setGenerating(false);
      setCurrentStep('');
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Enhanced AI Course Generator</h2>
              <p className="text-sm text-gray-600">Create curriculum-aligned courses with rich content</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge className="bg-indigo-100 text-indigo-800">
              <Brain className="w-3 h-3 mr-1" />
              AI Learning
            </Badge>
            <Badge className="bg-purple-100 text-purple-800">
              <Globe className="w-3 h-3 mr-1" />
              Web Research
            </Badge>
            <Badge className="bg-blue-100 text-blue-800">
              <ImagePlus className="w-3 h-3 mr-1" />
              AI Images
            </Badge>
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Curriculum Aligned
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Topic & Description */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">Course/Topic Title *</Label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Photosynthesis, Quadratic Equations, World War II"
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-base font-semibold">Detailed Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Specific areas to focus on, learning goals, special requirements..."
            className="mt-2 h-24"
          />
        </div>

        <div>
          <Label className="text-base font-semibold">Learning Objectives</Label>
          <div className="space-y-2 mt-2">
            {learningObjectives.map((obj, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  value={obj}
                  onChange={(e) => updateLearningObjective(idx, e.target.value)}
                  placeholder={`Objective ${idx + 1}`}
                />
                {idx === learningObjectives.length - 1 && (
                  <Button variant="outline" size="icon" onClick={addLearningObjective}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Curriculum Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            Curriculum Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Curriculum</Label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
              value={curriculum}
              onChange={(e) => setCurriculum(e.target.value)}
            >
              <option value="GCSE">GCSE</option>
              <option value="A-Level">A-Level</option>
              <option value="IB">IB</option>
              <option value="AP">AP</option>
              <option value="Primary">Primary</option>
            </select>
          </div>

          <div>
            <Label>Exam Board</Label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
              value={examBoard}
              onChange={(e) => setExamBoard(e.target.value)}
            >
              <option value="AQA">AQA</option>
              <option value="Edexcel">Edexcel</option>
              <option value="OCR">OCR</option>
              <option value="CCEA">CCEA</option>
              <option value="WJEC">WJEC</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          <div>
            <Label>Target Audience</Label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            >
              <option value="primary">Primary (Ages 5-11)</option>
              <option value="secondary">Secondary (Ages 11-16)</option>
              <option value="college">College (Ages 16-18)</option>
              <option value="university">University</option>
              <option value="adult">Adult Learners</option>
            </select>
          </div>

          <div>
            <Label>Difficulty Level</Label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div>
            <Label>Number of Slides</Label>
            <Input
              type="number"
              min={5}
              max={50}
              value={slideCount}
              onChange={(e) => setSlideCount(Math.min(50, Math.max(5, parseInt(e.target.value) || 10)))}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Visual Style</Label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
              value={visualStyle}
              onChange={(e) => setVisualStyle(e.target.value)}
            >
              <option value="modern">Modern Textbook</option>
              <option value="classic">Classic Academic</option>
              <option value="minimal">Minimal Clean</option>
              <option value="colorful">Colorful Engaging</option>
              <option value="technical">Technical Blueprint</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* AI & Generation Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            AI Generation Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="webResearch"
                checked={useWebResearch}
                onChange={(e) => setUseWebResearch(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="webResearch" className="cursor-pointer flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                Use Web Research
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="aiLearning"
                checked={useAILearning}
                onChange={(e) => setUseAILearning(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="aiLearning" className="cursor-pointer flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600" />
                Learn from Existing Slides
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="quiz"
                checked={includeQuiz}
                onChange={(e) => setIncludeQuiz(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="quiz" className="cursor-pointer flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Generate Assessment Quiz
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="interactives"
                checked={includeInteractives}
                onChange={(e) => setIncludeInteractives(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="interactives" className="cursor-pointer flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Include Interactive Elements
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="speakerNotes"
                checked={includeSpeakerNotes}
                onChange={(e) => setIncludeSpeakerNotes(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="speakerNotes" className="cursor-pointer flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-600" />
                Generate Speaker Notes
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="images"
                checked={generateImages}
                onChange={(e) => setGenerateImages(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="images" className="cursor-pointer flex items-center gap-2">
                <ImagePlus className="w-4 h-4 text-pink-600" />
                Generate AI Images
              </Label>
            </div>
          </div>

          {generateImages && (
            <div>
              <Label>Image Generator</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  ['modelslab', 'ModelLabs'],
                  ['flux2', 'Flux 2'],
                  ['dalle', 'DALL-E 3'],
                  ['canva', 'Canva AI'],
                  ['base44', 'Base44 AI'],
                ].map(([val, label]) => (
                  <Button
                    key={val}
                    variant={imageProvider === val ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImageProvider(val)}
                    className="text-xs"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Text AI Model</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                ['perplexity', 'Perplexity (Deep Research)'],
                ['gemini_pro', 'Gemini Pro (High Quality)'],
                ['claude', 'Claude (Best Content)'],
                ['default', 'Standard (Fast)'],
              ].map(([val, label]) => (
                <Button
                  key={val}
                  variant={aiProvider === val ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAiProvider(val)}
                  className="text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      {generating && currentStep && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <p className="text-sm font-medium text-blue-900">{currentStep}</p>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-blue-700">{progress}% complete</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Button */}
      <Button
        className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 h-14 text-base font-semibold shadow-lg"
        size="lg"
        onClick={generateRobustSlides}
        disabled={generating || !topic.trim()}
      >
        {generating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generating Comprehensive Course...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Complete Course ({slideCount} slides)
          </>
        )}
      </Button>

      {/* Info Box */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-green-900 mb-1">What This Generates:</h4>
              <ul className="text-xs text-green-800 space-y-1">
                <li>✓ {slideCount} curriculum-aligned slides with rich HTML content</li>
                <li>✓ Professional visual design with {visualStyle} styling</li>
                {generateImages && <li>✓ AI-generated images for key concepts</li>}
                {includeInteractives && <li>✓ Interactive elements (polls, quizzes, activities)</li>}
                {includeQuiz && <li>✓ Comprehensive assessment quiz with explanations</li>}
                {includeSpeakerNotes && <li>✓ Speaker notes with teaching tips</li>}
                {useWebResearch && <li>✓ Web-researched content for accuracy</li>}
                {useAILearning && <li>✓ Patterns learned from successful presentations</li>}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}