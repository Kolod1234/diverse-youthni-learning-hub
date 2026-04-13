import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Button, TextField, Typography, FormControl, InputLabel,
  Select, MenuItem, CircularProgress
} from '@mui/material';
import { Sparkles } from 'lucide-react';

export default function AIAcademyGeneratorDialog({ open, onClose, user, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    topic: '',
    curriculum: 'GCSE',
    examBoard: 'AQA',
    category: 'science',
    estimated_duration_weeks: 8,
  });
  const [loading, setLoading] = useState(false);

  const resetAndClose = () => {
    setForm({
      title: '',
      topic: '',
      curriculum: 'GCSE',
      examBoard: 'AQA',
      category: 'science',
      estimated_duration_weeks: 8,
    });
    onClose();
  };

  const handleGenerate = async () => {
    if (!form.title.trim() || !form.topic.trim()) {
      toast.error('Please enter a title and topic');
      return;
    }

    setLoading(true);
    try {
      const prompt = `Create a structured academy blueprint for ${form.topic}.
Academy title: ${form.title}
Curriculum: ${form.curriculum}
Exam board: ${form.examBoard}
Category: ${form.category}
Duration: ${form.estimated_duration_weeks} weeks

Return a professional academy with 3 to 5 modules. Each module should contain 1 to 3 courses. Each course should contain 3 to 6 lessons. Each lesson must include:
- title
- description
- 4 to 8 slide objects with title and rich HTML content
- 3 learning objectives
- one quiz with 5 multiple choice questions
- multimedia suggestions including images and videos

Keep the content practical, well-structured, and curriculum-aligned.
Return only valid JSON.`;

      const blueprint = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            academy_description: { type: 'string' },
            certification_requirements: {
              type: 'object',
              properties: {
                minimum_completion: { type: 'number' },
                minimum_score: { type: 'number' },
                final_assessment_required: { type: 'boolean' }
              }
            },
            modules: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  module_title: { type: 'string' },
                  module_description: { type: 'string' },
                  required_competencies: { type: 'array', items: { type: 'string' } },
                  courses: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        category: { type: 'string' },
                        level: { type: 'string' },
                        lessons: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              title: { type: 'string' },
                              description: { type: 'string' },
                              learning_objectives: { type: 'array', items: { type: 'string' } },
                              multimedia_suggestions: {
                                type: 'object',
                                properties: {
                                  images: { type: 'array', items: { type: 'string' } },
                                  videos: { type: 'array', items: { type: 'string' } }
                                }
                              },
                              slides: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    title: { type: 'string' },
                                    content: { type: 'string' }
                                  }
                                }
                              },
                              quiz: {
                                type: 'object',
                                properties: {
                                  title: { type: 'string' },
                                  description: { type: 'string' },
                                  questions: {
                                    type: 'array',
                                    items: {
                                      type: 'object',
                                      properties: {
                                        question: { type: 'string' },
                                        options: { type: 'array', items: { type: 'string' } },
                                        correct_answer: { type: 'number' },
                                        explanation: { type: 'string' }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      const createdCourses = [];
      const programStructure = [];

      for (let moduleIndex = 0; moduleIndex < (blueprint.modules || []).length; moduleIndex += 1) {
        const module = blueprint.modules[moduleIndex];
        const courseIds = [];

        for (const course of module.courses || []) {
          const createdCourse = await base44.entities.Course.create({
            title: course.title,
            description: course.description,
            category: course.category || form.category,
            qualification_type: form.curriculum.toLowerCase() === 'a-level' ? 'alevel' : 'gcse',
            exam_board: form.examBoard,
            level: course.level || 'intermediate',
            assigned_tutors: user?.email ? [user.email] : [],
          });

          courseIds.push(createdCourse.id);
          createdCourses.push(createdCourse.id);

          for (let lessonIndex = 0; lessonIndex < (course.lessons || []).length; lessonIndex += 1) {
            const lesson = course.lessons[lessonIndex];
            const createdLesson = await base44.entities.Lesson.create({
              course_id: createdCourse.id,
              title: lesson.title,
              description: lesson.description,
              learning_objectives: lesson.learning_objectives || [],
              slides: (lesson.slides || []).map((slide, slideIndex) => ({
                title: slide.title,
                content: slide.content,
                order: slideIndex + 1,
              })),
              resources: [
                ...((lesson.multimedia_suggestions?.images || []).map((item) => ({ name: item, url: '', type: 'image_suggestion' }))),
                ...((lesson.multimedia_suggestions?.videos || []).map((item) => ({ name: item, url: '', type: 'video_suggestion' }))),
              ],
              order: lessonIndex + 1,
              section: module.module_title,
              content_type: 'richtext',
            });

            if (lesson.quiz?.questions?.length) {
              await base44.entities.Quiz.create({
                course_id: createdCourse.id,
                lesson_id: createdLesson.id,
                title: lesson.quiz.title || `${lesson.title} Quiz`,
                description: lesson.quiz.description || '',
                questions: lesson.quiz.questions,
                passing_score: 70,
                difficulty: 'medium',
                is_published: true,
              });
            }
          }
        }

        programStructure.push({
          module_title: module.module_title,
          module_description: module.module_description,
          course_ids: courseIds,
          required_competencies: module.required_competencies || [],
          order: moduleIndex,
        });
      }

      const academy = await base44.entities.Academy.create({
        title: form.title,
        description: blueprint.academy_description || `${form.curriculum} academy for ${form.topic}`,
        category: form.category,
        instructor_email: user.email,
        instructor_name: user.full_name,
        estimated_duration_weeks: form.estimated_duration_weeks,
        is_published: false,
        enrolled_count: 0,
        completion_count: 0,
        program_structure: programStructure,
        certification_requirements: blueprint.certification_requirements || {
          minimum_completion: 80,
          minimum_score: 70,
          final_assessment_required: false,
        },
      });

      toast.success('AI academy created with courses, lessons, and quizzes');
      onCreated?.(academy);
      resetAndClose();
    } catch (error) {
      toast.error(error.message || 'Failed to generate academy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={resetAndClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Sparkles className="w-5 h-5" />
          AI Academy Generator
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Enter a topic and curriculum and AI will create the academy, courses, lessons, slides, and quizzes for you.
          </Typography>
          <TextField label="Academy Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} fullWidth />
          <TextField label="Main Topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Curriculum</InputLabel>
            <Select value={form.curriculum} label="Curriculum" onChange={(e) => setForm({ ...form, curriculum: e.target.value })}>
              <MenuItem value="GCSE">GCSE</MenuItem>
              <MenuItem value="A-Level">A-Level</MenuItem>
              <MenuItem value="IB">IB</MenuItem>
              <MenuItem value="AP">AP</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Exam Board</InputLabel>
            <Select value={form.examBoard} label="Exam Board" onChange={(e) => setForm({ ...form, examBoard: e.target.value })}>
              <MenuItem value="AQA">AQA</MenuItem>
              <MenuItem value="Edexcel">Edexcel</MenuItem>
              <MenuItem value="OCR">OCR</MenuItem>
              <MenuItem value="CCEA">CCEA</MenuItem>
              <MenuItem value="WJEC">WJEC</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select value={form.category} label="Category" onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <MenuItem value="mathematics">Mathematics</MenuItem>
              <MenuItem value="science">Science</MenuItem>
              <MenuItem value="english_language">English Language</MenuItem>
              <MenuItem value="history">History</MenuItem>
              <MenuItem value="computer_science">Computer Science</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Duration (weeks)" type="number" value={form.estimated_duration_weeks} onChange={(e) => setForm({ ...form, estimated_duration_weeks: parseInt(e.target.value || '8', 10) })} fullWidth />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={resetAndClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={handleGenerate} disabled={loading}>
          {loading ? <CircularProgress size={18} color="inherit" /> : 'Generate Academy'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}