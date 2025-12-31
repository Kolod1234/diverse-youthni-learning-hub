import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, BarChart3, Save, BookOpen } from 'lucide-react';
import AIGenerateMode from '@/components/presentation/AIGenerateMode';
import SlideWorkspace from '@/components/presentation/SlideWorkspace';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function DataPresentation() {
  const [generatedSlides, setGeneratedSlides] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [lessonMode, setLessonMode] = useState('new');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-for-lesson'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons-for-course', selectedCourse],
    queryFn: () => base44.entities.Lesson.filter({ course_id: selectedCourse }),
    enabled: !!selectedCourse,
  });

  const saveAsTemplate = async () => {
    if (generatedSlides.length === 0) {
      toast.error('No slides to save');
      return;
    }

    const name = prompt('Enter template name:');
    if (!name) return;

    try {
      await base44.entities.Template.create({
        name,
        description: 'AI Generated Presentation',
        category: 'slide',
        content: { slides: generatedSlides },
        is_public: false,
        tags: ['ai-generated']
      });
      toast.success('Saved as template!');
    } catch (error) {
      toast.error('Failed to save template');
    }
  };

  const addToCourse = async () => {
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    if (lessonMode === 'new' && !newLessonTitle.trim()) {
      toast.error('Please enter a lesson title');
      return;
    }

    if (lessonMode === 'replace' && !selectedLesson) {
      toast.error('Please select a lesson to replace');
      return;
    }

    setSaving(true);
    try {
      if (lessonMode === 'new') {
        const maxOrder = lessons.reduce((max, l) => Math.max(max, l.order || 0), 0);
        await base44.entities.Lesson.create({
          course_id: selectedCourse,
          title: newLessonTitle,
          content_type: 'richtext',
          slides: generatedSlides,
          order: maxOrder + 1,
        });
        toast.success('Lesson created successfully!');
      } else {
        await base44.entities.Lesson.update(selectedLesson, {
          slides: generatedSlides,
        });
        toast.success('Lesson updated successfully!');
      }
      setShowAddDialog(false);
      setSelectedCourse('');
      setSelectedLesson('');
      setNewLessonTitle('');
    } catch (error) {
      toast.error('Failed to save lesson');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Slide Generator</h1>
              <p className="text-gray-500">Create beautiful presentations with AI</p>
            </div>
          </div>
        </div>

        {generatedSlides.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <Card className="p-6">
              <AIGenerateMode onSlidesGenerated={setGeneratedSlides} />
            </Card>
          </div>
        ) : (
          <div className="h-screen -mt-8 -mx-4">
            <Card className="h-full rounded-none border-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Generated Slides {generatedSlides.length > 0 && `(${generatedSlides.length})`}
                </h2>
                {generatedSlides.length > 0 && (
                  <div className="flex gap-2">
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Add to Course
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Slides to Course</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label>Select Course *</Label>
                            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a course" />
                              </SelectTrigger>
                              <SelectContent>
                                {courses.map(course => (
                                  <SelectItem key={course.id} value={course.id}>
                                    {course.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Lesson Action</Label>
                            <Select value={lessonMode} onValueChange={setLessonMode}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">Create New Lesson</SelectItem>
                                <SelectItem value="replace">Replace Existing Lesson</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {lessonMode === 'new' ? (
                            <div>
                              <Label>New Lesson Title *</Label>
                              <Input
                                value={newLessonTitle}
                                onChange={(e) => setNewLessonTitle(e.target.value)}
                                placeholder="Enter lesson title"
                              />
                            </div>
                          ) : (
                            <div>
                              <Label>Select Lesson to Replace *</Label>
                              <Select value={selectedLesson} onValueChange={setSelectedLesson}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a lesson" />
                                </SelectTrigger>
                                <SelectContent>
                                  {lessons.map(lesson => (
                                    <SelectItem key={lesson.id} value={lesson.id}>
                                      {lesson.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <Button
                            onClick={addToCourse}
                            disabled={saving}
                            className="w-full"
                          >
                            {saving ? 'Saving...' : lessonMode === 'new' ? 'Create Lesson' : 'Update Lesson'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      onClick={saveAsTemplate}
                      variant="outline"
                      size="sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save as Template
                    </Button>
                  </div>
                )}
              </div>

              {generatedSlides.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No slides generated yet</p>
                  <p className="text-sm text-gray-400">Enter a topic to get started</p>
                </div>
              ) : (
                <SlideWorkspace
                  initialSlides={generatedSlides}
                  onChange={setGeneratedSlides}
                />
              )}
            </Card>
            </div>
            )}
      </div>
    </div>
  );
}