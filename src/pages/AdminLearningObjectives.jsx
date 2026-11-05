import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Container, Typography, Card, Button, TextField, Stack, IconButton, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'sonner';

export default function AdminLearningObjectives() {
  const [updateResult, setUpdateResult] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [manualObjectives, setManualObjectives] = useState([]);
  const queryClient = useQueryClient();

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['all-lessons'],
    queryFn: () => base44.entities.Lesson.list('created_date', 500)
  });

  const lessonsWithoutObjectives = lessons.filter(l => !l.learning_objectives || l.learning_objectives.length === 0);

  const updateAllMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('updateLearningObjectives', {});
      return response.data;
    },
    onSuccess: (data) => {
      setUpdateResult(data);
      queryClient.invalidateQueries(['all-lessons']);
      toast.success(`Successfully updated ${data.processed} lessons!`);
    },
    onError: () => toast.error('Failed to update learning objectives')
  });

  const saveManualMutation = useMutation({
    mutationFn: async ({ lessonId, objectives }) => {
      await base44.entities.Lesson.update(lessonId, { learning_objectives: objectives });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-lessons']);
      setEditingLesson(null);
      setManualObjectives([]);
      toast.success('Learning objectives saved!');
    },
    onError: () => toast.error('Failed to save objectives')
  });

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress sx={{ color: '#4f46e5' }} />
          <Typography color="text.secondary">Loading lessons...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>Learning Objectives Manager</Typography>
          <Typography color="text.secondary">Update CCEA-aligned learning objectives for all lessons</Typography>
        </Box>

        <Card sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Status Overview</Typography>
              <Typography color="text.secondary">
                <strong style={{ color: '#4f46e5' }}>{lessons.length}</strong> total lessons
              </Typography>
              <Typography color="text.secondary">
                <strong style={{ color: '#ea580c' }}>{lessonsWithoutObjectives.length}</strong> lessons need objectives
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={updateAllMutation.isPending ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <AutoAwesomeIcon />}
              onClick={() => updateAllMutation.mutate()}
              disabled={updateAllMutation.isPending || lessonsWithoutObjectives.length === 0}
            >
              {updateAllMutation.isPending ? 'Updating...' : 'Update All Learning Objectives'}
            </Button>
          </Stack>

          {lessonsWithoutObjectives.length === 0 && (
            <Box sx={{ bgcolor: '#f0fdf4', border: 1, borderColor: '#bbf7d0', borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CheckCircleIcon sx={{ color: '#16a34a' }} />
              <Typography fontWeight={500} sx={{ color: '#166534' }}>All lessons have learning objectives!</Typography>
            </Box>
          )}
        </Card>

        {updateResult && (
          <Card sx={{ p: 3, mb: 3, border: 1, borderColor: '#bbf7d0', bgcolor: '#f0fdf4' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <CheckCircleIcon sx={{ color: '#16a34a' }} />
              <Typography variant="h6" fontWeight={600}>Update Complete</Typography>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="body2"><strong>Total lessons processed:</strong> {updateResult.total_lessons}</Typography>
              <Typography variant="body2"><strong>Successfully updated:</strong> {updateResult.processed}</Typography>
              {updateResult.failed > 0 && (
                <Typography variant="body2" sx={{ color: '#dc2626' }}><strong>Failed:</strong> {updateResult.failed}</Typography>
              )}
            </Stack>
            <Button size="small" variant="outlined" startIcon={<RefreshIcon sx={{ fontSize: 16 }} />} onClick={() => window.location.reload()} sx={{ mt: 2 }}>
              Refresh Page
            </Button>
          </Card>
        )}

        <Card sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Lessons Without Objectives</Typography>
          {lessonsWithoutObjectives.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>All lessons have learning objectives! 🎉</Typography>
          ) : (
            <Stack spacing={1} sx={{ maxHeight: 384, overflowY: 'auto' }}>
              {lessonsWithoutObjectives.map((lesson) => (
                <Stack key={lesson.id} direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <ErrorOutlineIcon sx={{ fontSize: 16, color: '#f97316', flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={500} noWrap>{lesson.title}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{lesson.course_id}</Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon sx={{ fontSize: 12 }} />}
                    onClick={() => {
                      setEditingLesson(lesson);
                      setManualObjectives(lesson.learning_objectives || ['']);
                    }}
                  >
                    Add
                  </Button>
                </Stack>
              ))}
            </Stack>
          )}
        </Card>
      </Container>

      <Dialog
        open={!!editingLesson}
        onClose={() => { setEditingLesson(null); setManualObjectives([]); }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Learning Objectives: {editingLesson?.title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {manualObjectives.map((obj, idx) => (
              <Stack key={idx} direction="row" spacing={1}>
                <TextField
                  multiline
                  rows={2}
                  fullWidth
                  placeholder={`Learning objective ${idx + 1}`}
                  value={obj}
                  onChange={(e) => {
                    const updated = [...manualObjectives];
                    updated[idx] = e.target.value;
                    setManualObjectives(updated);
                  }}
                />
                <IconButton aria-label="Close" onClick={() => setManualObjectives(manualObjectives.filter((_, i) => i !== idx))}>
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Stack>
            ))}
            <Button
              variant="outlined"
              fullWidth
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              onClick={() => setManualObjectives([...manualObjectives, ''])}
            >
              Add Objective
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => { setEditingLesson(null); setManualObjectives([]); }}>Cancel</Button>
          <Button
            variant="contained"
            disabled={saveManualMutation.isPending}
            onClick={() => {
              const filtered = manualObjectives.filter(o => o.trim());
              if (filtered.length === 0) { toast.error('Please add at least one objective'); return; }
              saveManualMutation.mutate({ lessonId: editingLesson.id, objectives: filtered });
            }}
            sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}
          >
            {saveManualMutation.isPending ? 'Saving...' : 'Save Objectives'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}