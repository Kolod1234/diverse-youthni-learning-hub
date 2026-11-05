import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Box, Container, Typography, Card, Button, TextField, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControlLabel, Checkbox, IconButton, Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { toast } from 'sonner';

const EMPTY_FORM = {
  student_name: '', student_email: '', student_avatar: '',
  month: '', achievement: '', testimonial: '', is_current: false
};

export default function AdminStudentOfMonth() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['student-of-month'],
    queryFn: () => base44.entities.StudentOfMonth.list('-created_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.StudentOfMonth.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['student-of-month']); setShowDialog(false); resetForm(); toast.success('Student added!'); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.StudentOfMonth.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['student-of-month']); setShowDialog(false); resetForm(); toast.success('Student updated!'); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.StudentOfMonth.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['student-of-month']); toast.success('Student removed'); }
  });

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, student_avatar: file_url });
      toast.success('Avatar uploaded!');
    } catch {
      toast.error('Upload failed');
    }
  };

  const handleSubmit = () => {
    if (!formData.student_name || !formData.month || !formData.achievement) {
      toast.error('Name, month, and achievement are required');
      return;
    }
    if (editingStudent) updateMutation.mutate({ id: editingStudent.id, data: formData });
    else createMutation.mutate(formData);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      student_name: student.student_name,
      student_email: student.student_email || '',
      student_avatar: student.student_avatar || '',
      month: student.month,
      achievement: student.achievement,
      testimonial: student.testimonial || '',
      is_current: student.is_current
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingStudent(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>Student of the Month</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>Recognize outstanding students</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetForm(); setShowDialog(true); }} sx={{ bgcolor: '#ca8a04', '&:hover': { bgcolor: '#a16207' } }}>
            Add Student
          </Button>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          {students.map((student) => (
            <Card
              key={student.id}
              sx={{
                p: 3,
                ...(student.is_current ? { border: 2, borderColor: '#facc15', bgcolor: '#fefce8' } : {})
              }}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar
                  src={student.student_avatar || undefined}
                  alt={student.student_name}
                  sx={{ width: 64, height: 64 }}
                >
                  {(student.student_name || '?').charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Typography fontWeight={700}>{student.student_name}</Typography>
                    {student.is_current && <EmojiEventsIcon sx={{ fontSize: 20, color: '#ca8a04' }} />}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{student.month}</Typography>
                  <Typography variant="body2">{student.achievement}</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <IconButton aria-label="Edit" size="small" onClick={() => handleEdit(student)}><EditIcon sx={{ fontSize: 18 }} /></IconButton>
                  <IconButton aria-label="Delete" size="small" onClick={() => { if (confirm('Remove this student?')) deleteMutation.mutate(student.id); }}>
                    <DeleteIcon sx={{ fontSize: 18, color: '#dc2626' }} />
                  </IconButton>
                </Stack>
              </Stack>
            </Card>
          ))}
        </Box>

        <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingStudent ? 'Edit Student' : 'Add Student of Month'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Student Name *" value={formData.student_name} onChange={(e) => setFormData({ ...formData, student_name: e.target.value })} fullWidth />
              <TextField label="Student Email" type="email" value={formData.student_email} onChange={(e) => setFormData({ ...formData, student_email: e.target.value })} fullWidth />
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5 }}>Avatar</Typography>
                <input type="file" accept="image/*" onChange={handleUploadAvatar} style={{ width: '100%' }} />
                {formData.student_avatar && <Avatar src={formData.student_avatar} sx={{ mt: 1, width: 64, height: 64 }} />}
              </Box>
              <TextField label="Month *" value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} placeholder="e.g., January 2026" fullWidth />
              <TextField label="Achievement *" value={formData.achievement} onChange={(e) => setFormData({ ...formData, achievement: e.target.value })} multiline rows={3} fullWidth />
              <TextField label="Testimonial" value={formData.testimonial} onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })} multiline rows={2} fullWidth />
              <FormControlLabel
                control={<Checkbox checked={formData.is_current} onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })} />}
                label="Current Student of Month"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => { setShowDialog(false); resetForm(); }}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: '#ca8a04', '&:hover': { bgcolor: '#a16207' } }}>
              {editingStudent ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}