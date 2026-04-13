import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Container, Card, CardContent, Button, TextField, Typography,
  Box, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, Divider, Select, MenuItem, FormControl, InputLabel,
  Collapse
} from '@mui/material';
import { Plus, X, GripVertical, Save, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ModuleCourseLessonsPreview from '@/components/academy/ModuleCourseLessonsPreview';

export default function AcademyBuilder() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = new URLSearchParams(location.search);
  const academyId = params.get('id');

  const [modules, setModules] = useState([]);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [showCertDialog, setShowCertDialog] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null);
  const [moduleForm, setModuleForm] = useState({
    module_title: '',
    module_description: '',
    course_ids: [],
    order: 0
  });
  const [certRequirements, setCertRequirements] = useState({
    minimum_completion: 80,
    minimum_score: 70,
    final_assessment_required: false
  });

  const { data: academy, isLoading } = useQuery({
    queryKey: ['academy', academyId],
    queryFn: () => base44.entities.Academy.get(academyId),
    enabled: !!academyId
  });

  const { data: allCourses = [] } = useQuery({
   queryKey: ['all-courses'],
   queryFn: () => base44.entities.Course.list('title', 500),
  });

  React.useEffect(() => {
   const lessonsSubscription = base44.entities.Lesson.subscribe(() => {
     queryClient.invalidateQueries(['module-lessons']);
   });

   return () => lessonsSubscription();
  }, [queryClient]);

  React.useEffect(() => {
    if (academy) {
      setModules(academy.program_structure || []);
      setCertRequirements(academy.certification_requirements || {
        minimum_completion: 80,
        minimum_score: 70,
        final_assessment_required: false
      });
    }
  }, [academy]);

  const updateAcademyMutation = useMutation({
    mutationFn: (data) => base44.entities.Academy.update(academyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['academy', academyId]);
      toast.success('Academy updated!');
    }
  });

  const handleAddModule = () => {
    if (editingModule !== null) {
      const updated = [...modules];
      updated[editingModule] = { ...moduleForm, order: editingModule };
      setModules(updated);
    } else {
      setModules([...modules, { ...moduleForm, order: modules.length }]);
    }
    setShowModuleDialog(false);
    setModuleForm({ module_title: '', module_description: '', course_ids: [], order: 0 });
    setEditingModule(null);
  };

  const handleEditModule = (index) => {
    setEditingModule(index);
    setModuleForm(modules[index]);
    setShowModuleDialog(true);
  };

  const handleDeleteModule = (index) => {
    setModules(modules.filter((_, i) => i !== index).map((module, moduleIndex) => ({ ...module, order: moduleIndex })));
  };

  const handleReorderModules = (sourceIndex, destinationIndex) => {
    const updated = [...modules];
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(destinationIndex, 0, moved);
    setModules(updated.map((module, moduleIndex) => ({ ...module, order: moduleIndex })));
  };

  const handleReorderLessons = async (courseId, sourceIndex, destinationIndex, lessons) => {
    const updatedLessons = [...lessons];
    const [moved] = updatedLessons.splice(sourceIndex, 1);
    updatedLessons.splice(destinationIndex, 0, moved);

    await Promise.all(
      updatedLessons.map((lesson, index) => base44.entities.Lesson.update(lesson.id, { order: index + 1 }))
    );

    queryClient.invalidateQueries(['module-lessons']);
    toast.success('Lesson order updated');
  };

  const handleSave = () => {
    updateAcademyMutation.mutate({
      program_structure: modules.map((module, moduleIndex) => ({ ...module, order: moduleIndex })),
      certification_requirements: certRequirements
    });
  };

  if (isLoading) {
    return <Container maxWidth="lg" sx={{ py: 4 }}><Typography>Loading...</Typography></Container>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(createPageUrl('AcademyManager'))}
          sx={{ mb: 2 }}
        >
          Back to Academies
        </Button>
        <Typography variant="h4" fontWeight="bold">{academy?.title}</Typography>
        <Typography color="text.secondary">Build your structured certification program</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Drag modules to reorder them, and expand a module to reorder its lessons.
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Program Modules</Typography>
            <Button
              variant="contained"
              startIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowModuleDialog(true)}
            >
              Add Module
            </Button>
          </Box>

          <DragDropContext onDragEnd={(result) => {
            if (!result.destination) return;
            handleReorderModules(result.source.index, result.destination.index);
          }}>
            <Droppable droppableId="academy-modules">
              {(provided) => (
                <List ref={provided.innerRef} {...provided.droppableProps}>
                  {modules.map((module, index) => (
                    <Draggable key={`${module.module_title}-${index}`} draggableId={`${module.module_title}-${index}`} index={index}>
                      {(dragProvided) => (
                        <Box ref={dragProvided.innerRef} {...dragProvided.draggableProps}>
                          <ListItem
                            secondaryAction={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton onClick={() => setExpandedModule(expandedModule === index ? null : index)}>
                                  {expandedModule === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </IconButton>
                                <IconButton onClick={() => handleEditModule(index)}>
                                  <GripVertical className="w-4 h-4" />
                                </IconButton>
                                <IconButton onClick={() => handleDeleteModule(index)}>
                                  <X className="w-4 h-4" />
                                </IconButton>
                              </Box>
                            }
                          >
                            <Box {...dragProvided.dragHandleProps} sx={{ display: 'flex', mr: 1.5, cursor: 'grab', color: 'text.secondary' }}>
                              <GripVertical className="w-4 h-4" />
                            </Box>
                            <ListItemText
                              primary={`${index + 1}. ${module.module_title}`}
                              secondary={
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="body2" color="text.secondary">{module.module_description}</Typography>
                                  <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                    {module.course_ids?.map((courseId) => {
                                      const course = allCourses.find(c => c.id === courseId);
                                      return course ? <Chip key={courseId} label={course.title} size="small" /> : null;
                                    })}
                                  </Box>
                                  <Collapse in={expandedModule === index}>
                                    <ModuleCourseLessonsPreview module={module} onReorderLessons={handleReorderLessons} />
                                  </Collapse>
                                </Box>
                              }
                            />
                          </ListItem>
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Certification Requirements</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Minimum Completion %"
              type="number"
              value={certRequirements.minimum_completion}
              onChange={(e) => setCertRequirements({ ...certRequirements, minimum_completion: parseInt(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Minimum Average Score %"
              type="number"
              value={certRequirements.minimum_score}
              onChange={(e) => setCertRequirements({ ...certRequirements, minimum_score: parseInt(e.target.value) })}
              fullWidth
            />
          </Box>
          <Button
            variant="outlined"
            onClick={() => setShowCertDialog(true)}
            sx={{ mt: 2 }}
          >
            Configure Certificate
          </Button>
        </CardContent>
      </Card>

      <Button
        variant="contained"
        size="large"
        startIcon={<Save className="w-5 h-5" />}
        onClick={handleSave}
        fullWidth
      >
        Save Academy Structure
      </Button>

      <Dialog open={showModuleDialog} onClose={() => setShowModuleDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingModule !== null ? 'Edit Module' : 'Add Module'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Module Title"
              value={moduleForm.module_title}
              onChange={(e) => setModuleForm({ ...moduleForm, module_title: e.target.value })}
              fullWidth
            />
            <TextField
              label="Module Description"
              value={moduleForm.module_description}
              onChange={(e) => setModuleForm({ ...moduleForm, module_description: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Courses in this Module</InputLabel>
              <Select
                multiple
                value={moduleForm.course_ids}
                onChange={(e) => setModuleForm({ ...moduleForm, course_ids: e.target.value })}
                label="Courses in this Module"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((id) => {
                      const course = allCourses.find(c => c.id === id);
                      return course ? <Chip key={id} label={course.title} size="small" /> : null;
                    })}
                  </Box>
                )}
              >
                {allCourses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>{course.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowModuleDialog(false); setEditingModule(null); }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddModule}>
            {editingModule !== null ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}