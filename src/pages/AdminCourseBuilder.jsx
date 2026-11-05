import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Box, Container, Typography, Card, Button, Chip, IconButton, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ImageIcon from '@mui/icons-material/Image';
import { toast } from 'sonner';
import PageSectionEditor from '@/components/admin/PageSectionEditor';
import CourseBasicInfoEditor from '@/components/admin/CourseBasicInfoEditor';

export default function AdminCourseBuilder() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const courseId = params.get('course');
  const [editingSection, setEditingSection] = useState(null);
  const [editingBasicInfo, setEditingBasicInfo] = useState(false);
  const queryClient = useQueryClient();

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['course-sections', courseId],
    queryFn: () => base44.entities.PageSection.filter({ course_id: courseId }, 'order', 100),
    enabled: !!courseId
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PageSection.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['course-sections']); toast.success('Section deleted'); }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.PageSection.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries(['course-sections'])
  });

  const reorderMutation = useMutation({
    mutationFn: async (reorderedSections) => {
      await Promise.all(
        reorderedSections.map((section, index) => base44.entities.PageSection.update(section.id, { order: index }))
      );
    },
    onSuccess: () => queryClient.invalidateQueries(['course-sections'])
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    reorderMutation.mutate(items);
  };

  if (!courseId || !course) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No course selected</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ p: 3 }}>
        <Card sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={700}>Course Landing Page Builder</Typography>
              <Typography variant="body2" color="text.secondary">{course.title}</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<ImageIcon sx={{ fontSize: 16 }} />} onClick={() => setEditingBasicInfo(true)}>
                Edit Thumbnail
              </Button>
              <Button variant="contained" startIcon={<AddIcon sx={{ fontSize: 16 }} />} onClick={() => setEditingSection({ course_id: courseId })}>
                Add Section
              </Button>
            </Stack>
          </Stack>

          {sections.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, bgcolor: 'action.hover', borderRadius: 2, border: '2px dashed', borderColor: 'divider' }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>No custom sections yet</Typography>
              <Button variant="contained" startIcon={<AddIcon sx={{ fontSize: 16 }} />} onClick={() => setEditingSection({ course_id: courseId })}>
                Add First Section
              </Button>
            </Box>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="sections">
                {(provided) => (
                  <Stack {...provided.droppableProps} ref={provided.innerRef} spacing={1.5}>
                    {sections.map((section, index) => (
                      <Draggable key={section.id} draggableId={section.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              p: 2,
                              boxShadow: snapshot.isDragging ? 4 : 1,
                              opacity: section.is_active ? 1 : 0.5,
                            }}
                          >
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Box {...provided.dragHandleProps} sx={{ cursor: 'grab' }}>
                                <DragIndicatorIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Chip label={section.section_type} size="small" sx={{ bgcolor: '#e0e7ff', color: '#4338ca', fontSize: '0.75rem', mb: 0.5 }} />
                                <Typography fontWeight={600}>{section.title || 'Untitled'}</Typography>
                              </Box>
                              <Stack direction="row" spacing={1}>
                                <IconButton aria-label={section.is_active ? 'Hide section' : 'Show section'}
                                  size="small"
                                  onClick={() => toggleActiveMutation.mutate({ id: section.id, is_active: !section.is_active })}
                                >
                                  {section.is_active ? <VisibilityIcon sx={{ fontSize: 16 }} /> : <VisibilityOffIcon sx={{ fontSize: 16 }} />}
                                </IconButton>
                                <IconButton aria-label="Edit" size="small" onClick={() => setEditingSection(section)}>
                                  <EditIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                                <IconButton aria-label="Delete" size="small" onClick={() => deleteMutation.mutate(section.id)}>
                                  <DeleteIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                                </IconButton>
                              </Stack>
                            </Stack>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Stack>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </Card>
      </Container>

      {editingSection && (
        <PageSectionEditor section={editingSection} onClose={() => setEditingSection(null)} />
      )}
      {editingBasicInfo && (
        <CourseBasicInfoEditor course={course} onClose={() => setEditingBasicInfo(false)} />
      )}
    </Box>
  );
}