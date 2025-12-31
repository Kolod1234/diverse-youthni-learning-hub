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
          <div className="fixed inset-0 z-50 bg-white">
            <SlideWorkspace
              initialSlides={generatedSlides}
              onChange={setGeneratedSlides}
            />
          </div>
        )}
      </div>
    </div>
  );
}