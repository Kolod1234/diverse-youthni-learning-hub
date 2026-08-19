import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Container, Card, CardContent, Button, TextField, Typography,
  Box, Grid, Select, MenuItem, FormControl, InputLabel, Chip, IconButton
} from '@mui/material';
import { Sparkles, BookOpen, Plus, FileText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ExpertContentCreator() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [contentType, setContentType] = useState('lesson');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [sections, setSections] = useState([
    { section_title: 'Introduction', section_type: 'text', placeholder_content: 'Introduce the topic...' }
  ]);

  React.useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: templates = [] } = useQuery({
    queryKey: ['expert-templates'],
    queryFn: () => base44.entities.ExpertContentTemplate.list('-created_date', 100),
  });

  const createLessonMutation = useMutation({
    mutationFn: async (lessonData) => {
      // Create course first
      const course = await base44.entities.Course.create({
        title: lessonData.title,
        description: lessonData.description,
        category: lessonData.category,
        instructor: user.full_name,
        level: 'intermediate',
        price: 0
      });

      // Create lesson with slides
      const slides = lessonData.sections.map((section, index) => ({
        title: section.section_title,
        content: section.placeholder_content,
        order: index
      }));

      await base44.entities.Lesson.create({
        course_id: course.id,
        title: lessonData.title,
        description: lessonData.description,
        content_type: 'richtext',
        slides: slides,
        order: 1
      });

      return course;
    },
    onSuccess: (course) => {
      toast.success('Content created successfully!');
      navigate(`/CourseDetails?id=${course.id}`);
    }
  });

  const generateAIContentMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert educator creating high-quality educational content for A-level students.

Create a comprehensive lesson on: ${data.title}

Description: ${data.description}
Category: ${data.category}

Generate structured content with:
1. Clear learning objectives
2. Engaging introduction
3. Main content sections with examples
4. Practice activities
5. Summary and key takeaways

Return JSON format:
{
  "sections": [
    {
      "section_title": "title",
      "section_type": "text",
      "placeholder_content": "detailed content with examples and explanations"
    }
  ]
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            sections: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  section_title: { type: 'string' },
                  section_type: { type: 'string' },
                  placeholder_content: { type: 'string' }
                }
              }
            }
          }
        }
      });
      return response;
    },
    onSuccess: (result) => {
      if (result.sections) {
        setSections(result.sections);
        toast.success('AI content generated!');
      }
    }
  });

  const handleAddSection = () => {
    setSections([...sections, {
      section_title: 'New Section',
      section_type: 'text',
      placeholder_content: ''
    }]);
  };

  const handleUpdateSection = (index, field, value) => {
    const updated = [...sections];
    updated[index][field] = value;
    setSections(updated);
  };

  const handleDeleteSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (!title || !description || !category) {
      toast.error('Please fill in all required fields');
      return;
    }
    createLessonMutation.mutate({ title, description, category, sections });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <BookOpen className="w-8 h-8 text-purple-600" />
          <Typography variant="h4" fontWeight="bold">Expert Content Creator</Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Create high-quality educational content with AI assistance
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Basic Information</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                  required
                />
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="mathematics">Mathematics</MenuItem>
                    <MenuItem value="science">Science</MenuItem>
                    <MenuItem value="english">English</MenuItem>
                    <MenuItem value="history">History</MenuItem>
                    <MenuItem value="computer_science">Computer Science</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  startIcon={<Sparkles className="w-4 h-4" />}
                  onClick={() => generateAIContentMutation.mutate({ title, description, category })}
                  disabled={!title || !description || !category || generateAIContentMutation.isPending}
                >
                  {generateAIContentMutation.isPending ? 'Generating...' : 'Generate AI Content'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Content Sections</Typography>
                <Button
                  variant="outlined"
                  startIcon={<Plus className="w-4 h-4" />}
                  onClick={handleAddSection}
                  size="small"
                >
                  Add Section
                </Button>
              </Box>

              {sections.map((section, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle2">Section {index + 1}</Typography>
                      <IconButton size="small" onClick={() => handleDeleteSection(index)}>
                        <Trash2 className="w-4 h-4" />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        label="Section Title"
                        value={section.section_title}
                        onChange={(e) => handleUpdateSection(index, 'section_title', e.target.value)}
                        fullWidth
                        size="small"
                      />
                      <TextField
                        label="Content"
                        value={section.placeholder_content}
                        onChange={(e) => handleUpdateSection(index, 'placeholder_content', e.target.value)}
                        multiline
                        rows={4}
                        fullWidth
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Button
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 3 }}
            onClick={handleCreate}
            disabled={createLessonMutation.isPending}
          >
            {createLessonMutation.isPending ? 'Creating...' : 'Create Content'}
          </Button>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Quick Templates</Typography>
              {templates.slice(0, 5).map((template) => (
                <Chip
                  key={template.id}
                  label={template.title}
                  onClick={() => {
                    setTitle(template.title);
                    setCategory(template.category);
                    setSections(template.structure?.sections || []);
                  }}
                  sx={{ mb: 1, mr: 1 }}
                  icon={<FileText className="w-4 h-4" />}
                />
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}