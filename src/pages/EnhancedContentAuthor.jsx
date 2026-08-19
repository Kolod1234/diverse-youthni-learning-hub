import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container, Card, Box, Typography, Tabs, Tab, Button,
  TextField, Grid
} from '@mui/material';
import { FileText, Beaker, Package, Save } from 'lucide-react';
import AIRichTextEditor from '@/components/authoring/AIRichTextEditor';
import SimulationBuilder from '@/components/interactive/SimulationBuilder';
import SCORMUploader from '@/components/scorm/SCORMUploader';
import { toast } from 'sonner';

export default function EnhancedContentAuthor() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    course_id: '',
    content_type: 'richtext',
    slides: []
  });
  const [currentSlideContent, setCurrentSlideContent] = useState('');

  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: courses = [] } = useQuery({
    queryKey: ['my-courses'],
    queryFn: async () => {
      const allCourses = await base44.entities.Course.list();
      return allCourses.filter(c => c.created_by === user?.email || user?.role === 'admin');
    },
    enabled: !!user
  });

  const saveLessonMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Lesson.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lessons']);
      toast.success('Lesson created with enhanced content!');
    }
  });

  const handleSaveLesson = () => {
    if (!lessonData.title || !lessonData.course_id) {
      toast.error('Please provide title and select a course');
      return;
    }

    const slides = currentSlideContent ? [{ 
      title: 'Main Content', 
      content: currentSlideContent, 
      order: 0 
    }] : [];

    saveLessonMutation.mutate({
      ...lessonData,
      slides,
      order: 0
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          Enhanced Content Authoring
        </Typography>
        <Typography color="text.secondary">
          Create engaging lessons with AI assistance, simulations, and SCORM content
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3, mb: 3 }}>
            <TextField
              label="Lesson Title"
              value={lessonData.title}
              onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />

            <TextField
              label="Description"
              multiline
              rows={2}
              value={lessonData.description}
              onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
              fullWidth
              sx={{ mb: 3 }}
            />

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                <Tab icon={<FileText className="w-4 h-4" />} label="Rich Text" />
                <Tab icon={<Beaker className="w-4 h-4" />} label="Simulations" />
                <Tab icon={<Package className="w-4 h-4" />} label="SCORM" />
              </Tabs>
            </Box>

            {activeTab === 0 && (
              <AIRichTextEditor
                content={currentSlideContent}
                onChange={setCurrentSlideContent}
                placeholder="Start writing your lesson content or use AI to generate it..."
              />
            )}

            {activeTab === 1 && (
              <SimulationBuilder
                lessonId={null}
                courseId={lessonData.course_id}
                onCreated={() => toast.success('Simulation created!')}
              />
            )}

            {activeTab === 2 && (
              <SCORMUploader
                courseId={lessonData.course_id}
                lessonId={null}
                onUploaded={(data) => {
                  toast.success('SCORM package ready!');
                }}
              />
            )}
          </Card>

          <Button
            variant="contained"
            size="large"
            startIcon={<Save className="w-5 h-5" />}
            onClick={handleSaveLesson}
            disabled={saveLessonMutation.isPending}
            fullWidth
          >
            {saveLessonMutation.isPending ? 'Saving...' : 'Save Lesson'}
          </Button>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>AI Writing Assistant</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Use AI to help you create professional educational content quickly
              </Typography>
              <Box sx={{ bgcolor: 'primary.light', p: 2, borderRadius: 1 }}>
                <Typography variant="caption" fontWeight="bold" sx={{ display: 'block', mb: 1 }}>
                  💡 Quick Tips:
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                  • Click "AI Generate" to create content from scratch
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                  • Select text and click "Improve" to enhance it
                </Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  • Use specific prompts for better results
                </Typography>
              </Box>
            </Box>
          </Card>

          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Interactive Content</Typography>
            <Typography variant="body2" color="text.secondary">
              Add simulations and SCORM packages to create immersive learning experiences
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}