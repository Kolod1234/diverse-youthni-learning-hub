import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { base44 } from '@/api/base44Client';
import ImageGeneratorModal from '@/components/authoring/ImageGeneratorModal';
import { 
  Sparkles, Loader2, CheckCircle, BookOpen, 
  Brain, Clock, Target, FileText, X, Wand2, ChevronLeft, ChevronRight, 
  ImagePlus, Layers, RefreshCw, Copy, Trash2, Save, Eye, Edit3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EnhancedAISlideGenerator({ courseId, onSlidesGenerated, onClose, existingLessonId = null }) {
  // Course & Section Management
  const [existingSections, setExistingSections] = useState([]);
  const [operationMode, setOperationMode] = useState('create'); // 'create' or 'replace'
  const [selectedLesson, setSelectedLesson] = useState(null);
  
  // Content Generation Settings
  const [topic, setTopic] = useState('');
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [curriculum, setCurriculum] = useState('GCSE');
  const [examBoard, setExamBoard] = useState('AQA');
  const [numSlides, setNumSlides] = useState('8');
  const [sectionName, setSectionName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  
  // Quiz Settings
  const [includeQuiz, setIncludeQuiz] = useState(true);
  const [quizDifficulty, setQuizDifficulty] = useState('medium');
  const [quizTimeLimit, setQuizTimeLimit] = useState('15');
  
  // Audience & Complexity
  const [targetAudience, setTargetAudience] = useState('secondary');
  const [complexityLevel, setComplexityLevel] = useState('intermediate');
  
  // Multimedia & AI Settings
  const [includeMultimedia, setIncludeMultimedia] = useState(true);
  const [generateImages, setGenerateImages] = useState(false);
  const [imageProvider, setImageProvider] = useState('base44');
  const [visualStyle, setVisualStyle] = useState('modern');
  const [includeDiagrams, setIncludeDiagrams] = useState(true);
  const [includeInteractives, setIncludeInteractives] = useState(true);
  
  // AI Model Selection
  const [aiProvider, setAiProvider] = useState('default_research');
  const [useAILearning, setUseAILearning] = useState(true);
  
  // Generation State
  const [generating, setGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);
  
  // Image Generation
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [imageGeneratorSlideIdx, setImageGeneratorSlideIdx] = useState(null);
  
  // Edit Mode
  const [editMode, setEditMode] = useState(false);
  const [editedSlideContent, setEditedSlideContent] = useState('');

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const lessons = await base44.entities.Lesson.filter({ course_id: courseId });
        const sections = [...new Set(lessons.map(l => l.section).filter(Boolean))];
        setExistingSections(sections);
        
        // If replacing, fetch the existing lesson
        if (existingLessonId) {
          const lesson = await base44.entities.Lesson.get(existingLessonId);
          setSelectedLesson(lesson);
          setTopic(lesson.title);
          setSectionName(lesson.section);
        }
      } catch (error) {
        console.error('Failed to fetch sections:', error);
      }
    };
    
    if (courseId) {
      fetchSections();
    }
  }, [courseId, existingLessonId]);

  const sanitizeSlideContent = (html) => {
    if (!html) return '<ul><li>Content here</li></ul>';
    let clean = html
      .replace(/```html\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();
    if (!clean.includes('<')) {
      const lines = clean.split('\n').filter(l => l.trim());
      return '<ul>' + lines.slice(0, 5).map(l => `<li>${l.trim()}</li>`).join('') + '</ul>';
    }
    return clean;
  };

  const generateContent = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setGenerating(true);
    
    try {
      // Step 1: AI Learning from past presentations
      let learningContext = '';
      if (useAILearning) {
        setCurrentStep('🧠 AI analyzing past presentations...');
        try {
          const learningResult = await base44.functions.invoke('learnFromSlides', { topic, contentType: 'general' });
          if (learningResult.data?.patterns) {
            const p = learningResult.data.patterns;
            learningContext = `\n\n--- AI LEARNED PATTERNS ---
PREFERRED STRUCTURES: ${p.slideStructures?.join('; ') || 'None yet'}
VISUAL PATTERNS: ${p.visualPatterns?.join('; ') || 'Standard'}
CONTENT ORGANIZATION: ${p.contentOrganization?.join('; ') || 'Default'}
STYLE PREFERENCES: ${p.stylePreferences?.join('; ') || 'Modern'}
TOPIC INSIGHTS: ${p.topicInsights || 'Researching...'}
--- Apply these learned preferences ---`;
          }
        } catch (err) {
          console.log('Learning failed, continuing');
        }
      }

      // Step 2: Generate slides
      setCurrentStep('🎨 Generating professional slides with rich graphics...');
      
      const styleGuides = {
        modern: 'premium modern presentation design, clean visual hierarchy, elegant spacing, strong contrast, polished educational layout',
        classic: 'refined academic presentation design, balanced composition, subtle color palette, formal and credible visual style',
        minimal: 'minimal premium slide design, lots of white space, crisp typography, restrained accents, clean editorial look',
        colorful: 'visually rich educational design, vibrant but controlled colors, engaging composition, modern classroom-friendly polish',
        technical: 'technical presentation design, structured layout, data-driven visual language, precise diagrams, professional blueprint aesthetic'
      };

      const diagramInstructions = {
        general: 'Use "graph TD" (Flowcharts) or "mindmap" for concepts.',
        code: 'Use "sequenceDiagram" for code flow or "classDiagram" for architecture.',
        math: 'Use "graph LR" to show logical steps or dependencies.',
        history: 'Use "timeline" or "gantt" diagrams for chronological events.'
      };

      const slidesPrompt = `You are an expert educational content creator with expertise in visual design, pedagogy, and curriculum alignment.

Create a COMPREHENSIVE LESSON with ${numSlides} HIGHLY DETAILED, PROFESSIONAL slides for: "${topic}"
${additionalPrompt ? `\n\nADDITIONAL REQUIREMENTS: ${additionalPrompt}` : ''}
${learningContext}

CURRICULUM: ${curriculum} - ${examBoard} Exam Board
TARGET AUDIENCE: ${targetAudience} students
COMPLEXITY LEVEL: ${complexityLevel}
VISUAL STYLE: ${visualStyle} - ${styleGuides[visualStyle]}

CRITICAL SLIDE STRUCTURE (EXACTLY ${numSlides} SLIDES):
- Slide 1: Title/Introduction with engaging hook and lesson overview
- Slides 2-${parseInt(numSlides) - 2}: Core content - one concept per slide, progressive difficulty
- Slide ${parseInt(numSlides) - 1}: Summary of key points
- Slide ${numSlides}: Assessment/Reflection questions

CONTENT REQUIREMENTS FOR EACH SLIDE:
1. **Rich HTML with Professional Styling**:
   - Use gradients: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
   - Box shadows: box-shadow: 0 4px 12px rgba(0,0,0,0.1)
   - Rounded corners: border-radius: 12px to 16px
   - Proper spacing: padding: 20px to 30px; margin: 15px 0
   - Font hierarchy: h2 (28-32px), h3 (20-24px), p (16-18px)

2. **Visual Elements** (include on 80% of slides):
   - Images: <img src="https://via.placeholder.com/800x500/4F46E5/FFFFFF?text=Descriptive+Label" style="width: 100%; border-radius: 12px; margin: 20px 0;" alt="Clear description"/>
   - Tables for comparisons
   - Color-coded boxes (definitions in blue, examples in green, warnings in red)
   - Icons using emoji: 💡 🎯 ⚠️ ✓ → ★

3. **Content Quality**:
   - 3-5 main bullet points per slide (max 15 words each)
   - Real-world applications
   - Key vocabulary highlighted with <strong> or <span style="color: #6366F1">
   - Age-appropriate language

4. **Multimedia & Interactives** (${includeMultimedia ? 'REQUIRED' : 'Optional'}):
   ${includeDiagrams ? '- Mermaid diagrams for processes, systems, relationships' : ''}
   ${includeInteractives ? '- Interactive elements: polls, quizzes, drag-drop, fill-blanks' : ''}
   - Video suggestions where relevant
   - Image suggestions with detailed descriptions

${includeQuiz ? `\nQUIZ REQUIREMENTS (to be generated separately):
- ${quizDifficulty} difficulty level
- ${quizDifficulty === 'easy' ? '15' : quizDifficulty === 'medium' ? '25' : '40'} questions
- Mix of question types: recall, application, analysis
- Detailed explanations for each answer` : ''}

EXAMPLE SLIDE FORMAT:
{
  "title": "Introduction to Photosynthesis",
  "content": "<div style='background: linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%); padding: 30px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);'><h2 style='color: #0C4A6E; font-size: 32px; margin-bottom: 20px;'>🌿 What is Photosynthesis?</h2><p style='font-size: 18px; line-height: 1.8; color: #334155;'>Photosynthesis is the remarkable process by which plants convert light energy into chemical energy...</p><img src='https://via.placeholder.com/800x400/10B981/FFFFFF?text=Photosynthesis+Process+Diagram' style='width: 100%; border-radius: 12px; margin: 20px 0;' alt='Detailed diagram showing photosynthesis process'/><div style='background: white; padding: 20px; border-left: 5px solid #10B981; border-radius: 8px; margin: 20px 0;'><h3 style='color: #059669;'>💡 Key Equation</h3><p style='font-size: 20px; text-align: center; font-weight: bold;'>6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂</p></div></div>",
  "speaker_notes": "Start by asking students what they ate for breakfast and trace it back to plants.",
  "multimedia_suggestions": {
    "images": ["Photosynthesis diagram showing chloroplast structure", "Leaf cross-section illustration"],
    "videos": ["Time-lapse of plant growth over 30 days"],
    "diagram_code": "graph TD\\nA[Sunlight]-->B[Chloroplast]\\nB-->C[Glucose Production]",
    "interactive": ["Label the parts of a chloroplast"]
  }
}

Return ONLY valid JSON with this structure:
{
  "lesson_outline": {
    "learning_objectives": ["Objective 1", "Objective 2", "Objective 3"],
    "key_concepts": ["Concept 1", "Concept 2"],
    "prerequisites": ["Prior knowledge needed"],
    "difficulty_rating": "Easy/Medium/Advanced"
  },
  "slides": [
    {
      "title": "Clear, engaging slide title",
      "content": "Rich HTML content with inline styles, images, tables",
      "speaker_notes": "Teaching tips and discussion prompts (2-3 sentences)",
      "multimedia_suggestions": {
        "images": ["Detailed image description 1", "Description 2"],
        "videos": ["Video topic suggestion"],
        "diagram_code": "Mermaid syntax or null",
        "interactive": ["Interactive element suggestion"]
      }
    }
  ]
}

REMEMBER: Exactly ${numSlides} slides. Professional educational quality. ${curriculum} ${examBoard} aligned.`;

      let slideData;
      if (aiProvider === 'perplexity') {
        setCurrentStep('🔍 Using Perplexity for deep research...');
        const response = await base44.functions.invoke('perplexitySearch', {
          query: slidesPrompt,
          return_json: true,
          json_schema: {
            type: 'object',
            properties: {
              lesson_outline: { type: 'object' },
              slides: { type: 'array', items: { type: 'object' } }
            }
          }
        });
        slideData = response.data;
      } else {
        slideData = await base44.integrations.Core.InvokeLLM({
          prompt: slidesPrompt,
          add_context_from_internet: aiProvider === 'default_research',
          response_json_schema: {
            type: 'object',
            properties: {
              lesson_outline: {
                type: 'object',
                properties: {
                  learning_objectives: { type: 'array', items: { type: 'string' } },
                  key_concepts: { type: 'array', items: { type: 'string' } },
                  prerequisites: { type: 'array', items: { type: 'string' } },
                  difficulty_rating: { type: 'string' }
                }
              },
              slides: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    content: { type: 'string' },
                    speaker_notes: { type: 'string' },
                    multimedia_suggestions: { type: 'object' }
                  }
                }
              }
            }
          }
        });
      }

      let slides = slideData?.slides || [];
      if (!Array.isArray(slides) || slides.length === 0) {
        throw new Error('No slides generated. Please try again.');
      }

      // Enforce exact slide count
      if (slides.length > numSlides) {
        slides = slides.slice(0, parseInt(numSlides));
      } else if (slides.length < parseInt(numSlides)) {
        const missing = parseInt(numSlides) - slides.length;
        for (let i = 0; i < missing; i++) {
          slides.push({
            title: `Additional Content ${i + 1}`,
            content: '<ul><li>Content to be added</li></ul>',
            order: slides.length + 1
          });
        }
      }

      // Step 3: Generate AI images if requested
      if (generateImages && includeMultimedia) {
        setCurrentStep('🖼️ Generating AI images for slides...');
        const updatedSlides = [...slides];
        
        for (let i = 0; i < updatedSlides.length; i++) {
          const slide = updatedSlides[i];
          if (slide.multimedia_suggestions?.images?.length > 0) {
            const imageDesc = slide.multimedia_suggestions.images[0];
            try {
              let imageUrl;
              if (imageProvider === 'base44') {
                const imgResponse = await base44.integrations.Core.GenerateImage({ prompt: imageDesc });
                imageUrl = imgResponse.url;
              } else {
                const imgResponse = await base44.functions.invoke('generateImageForSlide', {
                  prompt: imageDesc,
                  style: 'illustration',
                  provider: imageProvider
                });
                imageUrl = imgResponse.data.imageUrl;
              }
              
              if (imageUrl) {
                const placeholderRegex = /<img[^>]*src="[^"]*placeholder[^"]*"[^>]*>/;
                if (placeholderRegex.test(slide.content)) {
                  slide.content = slide.content.replace(
                    placeholderRegex,
                    `<img src="${imageUrl}" style="width: 100%; border-radius: 12px; margin: 20px 0;" alt="${imageDesc}"/>`
                  );
                } else {
                  slide.content += `<img src="${imageUrl}" style="width: 100%; border-radius: 12px; margin: 20px 0;" alt="${imageDesc}"/>`;
                }
              }
            } catch (err) {
              console.warn(`Failed to generate image for slide ${i + 1}:`, err);
            }
          }
        }
        slides = updatedSlides;
      }

      // Step 4: Generate quiz if requested
      let quiz = null;
      if (includeQuiz) {
        setCurrentStep('📝 Creating comprehensive assessment quiz...');
        const quizPrompt = `Create a COMPREHENSIVE quiz for "${topic}" (${curriculum} ${examBoard}).

DIFFICULTY: ${quizDifficulty}
QUESTIONS: ${quizDifficulty === 'easy' ? '15' : quizDifficulty === 'medium' ? '25' : '40'}

REQUIREMENTS:
- Test deep understanding, not just memorization
- Mix: concept application, analysis, problem-solving
- Exactly 4 plausible options per question
- DETAILED explanations (3-5 sentences)
- ${curriculum} ${examBoard} aligned

Return JSON:
{
  "title": "Quiz Title",
  "description": "Description",
  "questions": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correct_answer": 0,
      "explanation": "Detailed explanation"
    }
  ],
  "assessment_criteria": "What this assesses"
}`;

        const quizResult = await base44.integrations.Core.InvokeLLM({
          prompt: quizPrompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              questions: { type: 'array', items: { type: 'object' } },
              assessment_criteria: { type: 'string' }
            }
          }
        });

        if (quizResult?.questions?.length > 0) {
          quiz = quizResult;
        }
      }

      // Step 5: Generate learning objectives
      setCurrentStep('🎯 Generating pedagogical materials...');
      const objectivesPrompt = `For "${topic}" (${curriculum} ${examBoard}), create:

1. Learning Objectives (5-7): Bloom's taxonomy verbs
2. Success Criteria (5-7): Observable, student-friendly
3. Common Misconceptions (4-6): Typical errors with explanations
4. Extension Activities (4-6): Advanced learner tasks

Return JSON:
{
  "learning_objectives": ["Students will be able to..."],
  "success_criteria": ["I can explain..."],
  "common_misconceptions": ["Students often think..."],
  "extension_activities": ["Research and present..."]
}`;

      const objectivesResult = await base44.integrations.Core.InvokeLLM({
        prompt: objectivesPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            learning_objectives: { type: 'array', items: { type: 'string' } },
            success_criteria: { type: 'array', items: { type: 'string' } },
            common_misconceptions: { type: 'array', items: { type: 'string' } },
            extension_activities: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      // Track analytics
      if (useAILearning && slides.length > 0) {
        try {
          await Promise.all(slides.map(slide =>
            base44.entities.SlideAnalytics.create({
              slide_content: slide.content,
              slide_title: slide.title,
              topic,
              visual_type: slide.multimedia_suggestions?.diagram_code ? 'diagram' : 'standard',
              content_type: 'general',
              visual_style: visualStyle,
              success_score: 100
            })
          ));
        } catch (err) {
          console.log('Analytics tracking failed:', err);
        }
      }

      setGeneratedContent({
        lesson_outline: slideData.lesson_outline || {},
        slides: slides.map((s, i) => ({ ...s, id: Date.now() + i, order: i + 1 })),
        quiz: quiz || null,
        objectives: {
          learning_objectives: objectivesResult?.learning_objectives || [],
          success_criteria: objectivesResult?.success_criteria || [],
          common_misconceptions: objectivesResult?.common_misconceptions || [],
          extension_activities: objectivesResult?.extension_activities || []
        },
        metadata: {
          topic,
          curriculum,
          examBoard,
          targetAudience,
          complexityLevel,
          visualStyle,
          generatedDate: new Date().toISOString(),
        }
      });

      setCurrentStep('');
      toast.success(`✨ Generated ${slides.length} slides successfully!`);
    } catch (error) {
      toast.error(error.message || 'Failed to generate content');
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
      
      if (operationMode === 'replace' && selectedLesson) {
        // Update existing lesson
        await base44.entities.Lesson.update(selectedLesson.id, {
          title: topic,
          description: `${curriculum} ${examBoard} aligned lesson on ${topic}`,
          slides: generatedContent.slides.map((slide, idx) => ({
            title: slide.title,
            content: slide.content,
            order: idx + 1
          })),
          section: finalSection || selectedLesson.section
        });
        
        toast.success(`✓ Updated "${topic}" successfully!`);
      } else {
        // Create new lesson
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
          section: finalSection || 'General'
        });

        // Save quiz if generated
        if (generatedContent.quiz?.questions?.length > 0) {
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
        
        toast.success(`✓ Created "${topic}" with ${generatedContent.slides.length} slides!`);
      }
      
      onSlidesGenerated?.();
      onClose?.();
    } catch (error) {
      toast.error('Failed to save content');
      console.error(error);
    }
  };

  const handleEditSlide = (slide, index) => {
    setEditMode(true);
    setEditedSlideContent(slide.content);
    setPreviewSlideIndex(index);
  };

  const saveEditedSlide = () => {
    if (!generatedContent) return;
    
    const updatedSlides = [...generatedContent.slides];
    updatedSlides[previewSlideIndex] = {
      ...updatedSlides[previewSlideIndex],
      content: editedSlideContent
    };
    
    setGeneratedContent({ ...generatedContent, slides: updatedSlides });
    setEditMode(false);
    toast.success('Slide updated!');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Enhanced AI Slide Generator</h2>
                <p className="text-sm text-gray-600">Create or replace course topics with professional slides & AI images</p>
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
              <div className="space-y-6 max-w-4xl mx-auto">
                {/* Operation Mode */}
                <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                  <div className="flex items-center gap-4 mb-3">
                    <Layers className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Operation Mode</h3>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      variant={operationMode === 'create' ? 'default' : 'outline'}
                      onClick={() => setOperationMode('create')}
                      className="flex-1"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Create New Topic
                    </Button>
                    <Button
                      variant={operationMode === 'replace' ? 'default' : 'outline'}
                      onClick={() => setOperationMode('replace')}
                      className="flex-1"
                      disabled={!existingLessonId}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Replace Existing Topic
                    </Button>
                  </div>
                  {operationMode === 'replace' && selectedLesson && (
                    <p className="text-xs text-blue-700 mt-2">
                      ✓ Replacing: <strong>{selectedLesson.title}</strong>
                    </p>
                  )}
                </Card>

                {/* Topic Input */}
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
                    <Label className="text-base font-semibold">Section/Path</Label>
                    <Select value={sectionName} onValueChange={(value) => {
                      setSectionName(value);
                      if (value !== '_new_section') setNewSectionName('');
                    }}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select or create new section" />
                      </SelectTrigger>
                      <SelectContent>
                        {existingSections.map((section) => (
                          <SelectItem key={section} value={section}>{section}</SelectItem>
                        ))}
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
                  </div>

                  <div>
                    <Label className="text-base font-semibold">Additional Instructions</Label>
                    <Textarea
                      value={additionalPrompt}
                      onChange={(e) => setAdditionalPrompt(e.target.value)}
                      placeholder="Focus areas, specific requirements, case studies..."
                      className="mt-2 h-20"
                    />
                  </div>
                </div>

                {/* Curriculum Settings */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Curriculum</Label>
                    <Select value={curriculum} onValueChange={setCurriculum}>
                      <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
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
                      <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
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
                    <Label>Slides</Label>
                    <Select value={numSlides} onValueChange={setNumSlides}>
                      <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 slides</SelectItem>
                        <SelectItem value="8">8 slides</SelectItem>
                        <SelectItem value="10">10 slides</SelectItem>
                        <SelectItem value="15">15 slides</SelectItem>
                        <SelectItem value="20">20 slides</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Advanced Settings */}
                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="multimedia">Multimedia</TabsTrigger>
                    <TabsTrigger value="ai">AI Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="content" className="space-y-4 mt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Target Audience</Label>
                        <Select value={targetAudience} onValueChange={setTargetAudience}>
                          <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="primary">Primary (5-11)</SelectItem>
                            <SelectItem value="secondary">Secondary (11-16)</SelectItem>
                            <SelectItem value="college">College (16-18)</SelectItem>
                            <SelectItem value="university">University</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Complexity</Label>
                        <Select value={complexityLevel} onValueChange={setComplexityLevel}>
                          <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="quiz-toggle">Generate Quiz</Label>
                        <Switch
                          id="quiz-toggle"
                          checked={includeQuiz}
                          onCheckedChange={setIncludeQuiz}
                        />
                      </div>
                      {includeQuiz && (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Quiz Difficulty</Label>
                            <Select value={quizDifficulty} onValueChange={setQuizDifficulty}>
                              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="easy">Easy (15 Qs)</SelectItem>
                                <SelectItem value="medium">Medium (25 Qs)</SelectItem>
                                <SelectItem value="hard">Hard (40 Qs)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Time Limit (min)</Label>
                            <Select value={quizTimeLimit} onValueChange={setQuizTimeLimit}>
                              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="15">15</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="30">30</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="multimedia" className="space-y-4 mt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="multimedia-toggle">Include Multimedia</Label>
                        <Switch
                          id="multimedia-toggle"
                          checked={includeMultimedia}
                          onCheckedChange={setIncludeMultimedia}
                        />
                      </div>
                      
                      {includeMultimedia && (
                        <>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="diagrams-toggle">Include Diagrams</Label>
                            <Switch
                              id="diagrams-toggle"
                              checked={includeDiagrams}
                              onCheckedChange={setIncludeDiagrams}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor="interactives-toggle">Include Interactives</Label>
                            <Switch
                              id="interactives-toggle"
                              checked={includeInteractives}
                              onCheckedChange={setIncludeInteractives}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor="images-toggle" className="flex items-center gap-2">
                              <ImagePlus className="w-4 h-4 text-blue-600" />
                              Auto-Generate AI Images
                            </Label>
                            <Switch
                              id="images-toggle"
                              checked={generateImages}
                              onCheckedChange={setGenerateImages}
                            />
                          </div>
                          
                          {generateImages && (
                            <div>
                              <Label>Image Provider</Label>
                              <Select value={imageProvider} onValueChange={setImageProvider}>
                                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="base44">Base44 AI</SelectItem>
                                  <SelectItem value="dalle">DALL-E 3</SelectItem>
                                  <SelectItem value="flux2">Flux 2</SelectItem>
                                  <SelectItem value="canva">Canva AI</SelectItem>
                                  <SelectItem value="modelslab">ModelLabs</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          
                          <div>
                            <Label>Visual Style</Label>
                            <Select value={visualStyle} onValueChange={setVisualStyle}>
                              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="modern">Modern Textbook</SelectItem>
                                <SelectItem value="classic">Classic Scientific</SelectItem>
                                <SelectItem value="minimal">Minimal Clean</SelectItem>
                                <SelectItem value="colorful">Bright & Engaging</SelectItem>
                                <SelectItem value="technical">Technical Blueprint</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="ai" className="space-y-4 mt-4">
                    <div>
                      <Label>AI Text Model</Label>
                      <Select value={aiProvider} onValueChange={setAiProvider}>
                        <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Standard</SelectItem>
                          <SelectItem value="default_research">Web Research</SelectItem>
                          <SelectItem value="perplexity">Deep Research</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="learning-toggle" className="flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Use AI Learning
                      </Label>
                      <Switch
                        id="learning-toggle"
                        checked={useAILearning}
                        onCheckedChange={setUseAILearning}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Generate Button */}
                <Button
                  onClick={generateContent}
                  disabled={generating || !topic.trim()}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 h-14 text-base font-semibold shadow-lg"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {currentStep || 'Generating...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      {operationMode === 'replace' ? 'Replace Topic' : 'Generate Complete Lesson'}
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
                      <h3 className="text-lg font-bold text-gray-900">Lesson Generated Successfully!</h3>
                      <p className="text-sm text-gray-600">
                        {generatedContent.slides.length} slides
                        {generatedContent.quiz && ` + ${generatedContent.quiz.questions.length} question quiz`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{generatedContent.metadata.curriculum}</Badge>
                    <Badge variant="secondary">{generatedContent.metadata.examBoard}</Badge>
                    <Badge variant="outline">{generatedContent.metadata.targetAudience}</Badge>
                    <Badge variant="secondary">{generatedContent.metadata.visualStyle}</Badge>
                  </div>
                </Card>

                {/* Slides Preview */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      Slides Preview
                    </h3>
                    <Badge className="bg-indigo-100 text-indigo-800">
                      {generatedContent.slides.length} slides
                    </Badge>
                  </div>
                  
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
                      <div className="flex gap-2">
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSlide(generatedContent.slides[previewSlideIndex], previewSlideIndex)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="max-h-[500px] overflow-y-auto bg-white p-6">
                      {editMode ? (
                        <Textarea
                          value={editedSlideContent}
                          onChange={(e) => setEditedSlideContent(e.target.value)}
                          className="w-full h-[400px] font-mono text-sm"
                        />
                      ) : (
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: generatedContent.slides[previewSlideIndex]?.content || '<p>No content</p>' }}
                        />
                      )}
                    </div>
                    
                    {editMode ? (
                      <div className="px-4 py-3 bg-gray-50 border-t flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>Cancel</Button>
                        <Button size="sm" onClick={saveEditedSlide}>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-t p-4">
                        {generatedContent.slides[previewSlideIndex]?.speaker_notes && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-blue-900 mb-1">💡 Speaker Notes:</p>
                            <p className="text-sm text-blue-800">{generatedContent.slides[previewSlideIndex].speaker_notes}</p>
                          </div>
                        )}
                        {generatedContent.slides[previewSlideIndex]?.multimedia_suggestions && (
                          <div>
                            <p className="text-xs font-semibold text-purple-900 mb-2">🎨 Multimedia:</p>
                            <div className="space-y-1 text-xs text-purple-800">
                              {generatedContent.slides[previewSlideIndex].multimedia_suggestions.images?.length > 0 && (
                                <div><strong>Images:</strong> {generatedContent.slides[previewSlideIndex].multimedia_suggestions.images.join(', ')}</div>
                              )}
                              {generatedContent.slides[previewSlideIndex].multimedia_suggestions.diagram_code && (
                                <div><strong>Diagram:</strong> Mermaid diagram included</div>
                              )}
                              {generatedContent.slides[previewSlideIndex].multimedia_suggestions.interactive?.length > 0 && (
                                <div><strong>Interactive:</strong> {generatedContent.slides[previewSlideIndex].multimedia_suggestions.interactive.join(', ')}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  <ScrollArea className="w-full">
                    <div className="flex gap-2 pb-2">
                      {generatedContent.slides.map((slide, idx) => (
                        <button
                          key={idx}
                          onClick={() => setPreviewSlideIndex(idx)}
                          className={`flex-shrink-0 w-40 p-2 text-left rounded-lg border-2 transition-all ${
                            previewSlideIndex === idx
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-xs font-medium truncate mb-1">{idx + 1}. {slide.title}</div>
                          <div className="w-full h-10 bg-gray-100 rounded text-[6px] overflow-hidden p-1">
                            {slide.content.replace(/<[^>]*>/g, ' ').substring(0, 40)}...
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
                    <div className="flex gap-2 mb-4">
                      <Badge>{generatedContent.quiz.questions.length} questions</Badge>
                      <Badge variant="secondary">{quizDifficulty}</Badge>
                      <Badge variant="outline">{quizTimeLimit} min</Badge>
                    </div>
                    <details>
                      <summary className="cursor-pointer text-sm font-medium text-purple-700">Preview Questions</summary>
                      <div className="mt-3 space-y-2">
                        {generatedContent.quiz.questions.slice(0, 3).map((q, idx) => (
                          <div key={idx} className="p-3 bg-white rounded border">
                            <p className="font-medium text-sm mb-2">Q{idx + 1}: {q.question}</p>
                            <div className="space-y-1">
                              {q.options.map((opt, optIdx) => (
                                <div key={optIdx} className={`text-xs p-2 rounded ${optIdx === q.correct_answer ? 'bg-green-100 text-green-800' : 'bg-gray-50'}`}>
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

                {/* Learning Objectives */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      Learning Objectives
                    </h4>
                    <ul className="space-y-1">
                      {generatedContent.objectives?.learning_objectives?.slice(0, 5).map((obj, idx) => (
                        <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 shrink-0" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      Key Concepts
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.lesson_outline?.key_concepts?.slice(0, 6).map((concept, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{concept}</Badge>
                      ))}
                    </div>
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
              <Button variant="outline" onClick={() => {
                setGeneratedContent(null);
                setEditMode(false);
              }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate New
              </Button>
              <Button 
                onClick={saveContent}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {operationMode === 'replace' ? 'Update Topic' : 'Save to Course'}
              </Button>
            </div>
          </div>
        )}

        {/* Image Generator Modal */}
        {showImageGenerator && imageGeneratorSlideIdx !== null && (
          <ImageGeneratorModal
            onImageSelect={(imageUrl) => {
              const updatedSlides = [...generatedContent.slides];
              const slide = updatedSlides[imageGeneratorSlideIdx];
              slide.content += `<img src="${imageUrl}" style="width: 100%; border-radius: 12px; margin: 20px 0;" alt="Generated image"/>`;
              setGeneratedContent({ ...generatedContent, slides: updatedSlides });
              setShowImageGenerator(false);
            }}
            onClose={() => {
              setShowImageGenerator(false);
              setImageGeneratorSlideIdx(null);
            }}
          />
        )}
      </motion.div>
    </div>
  );
}