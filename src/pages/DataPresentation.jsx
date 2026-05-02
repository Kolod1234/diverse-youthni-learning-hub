import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Box, Button, Card, CardContent, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Container, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BarChartIcon from '@mui/icons-material/BarChart';
import SaveIcon from '@mui/icons-material/Save';
import MenuBookIcon from '@mui/icons-material/MenuBook';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const Sparkles = _w(AutoAwesomeIcon), BarChart3 = _w(BarChartIcon), Save = _w(SaveIcon), BookOpen = _w(MenuBookIcon);
import AIGenerateMode from '@/components/presentation/AIGenerateMode';
import SlideWorkspace from '@/components/presentation/SlideWorkspace';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

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
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eef2ff, #fdf2f8, #f3e8ff)' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ width: 56, height: 56, background: 'linear-gradient(to bottom right, #4f46e5, #7c3aed)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles className="w-7 h-7 text-white" />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', m: 0 }}>AI Slide Generator</Typography>
              <Typography variant="body2" color="textSecondary">Create beautiful presentations with AI</Typography>
            </Box>
          </Box>
        </Box>

        {generatedSlides.length === 0 ? (
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Card sx={{ p: 3 }}>
              <CardContent>
                <AIGenerateMode onSlidesGenerated={setGeneratedSlides} />
              </CardContent>
            </Card>
          </Box>
        ) : (
          <Box sx={{ position: 'fixed', inset: 0, zIndex: 50, bgcolor: 'white' }}>
            <SlideWorkspace
              initialSlides={generatedSlides}
              onChange={setGeneratedSlides}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}