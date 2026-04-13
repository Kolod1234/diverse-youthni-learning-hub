import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Container, Card, CardContent, CardHeader, Button, TextField, Typography,
  Box, Grid, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, Divider
} from '@mui/material';
import { Award, Plus, Edit, Trash2, Users, CheckCircle, BookOpen, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import AIAcademyGeneratorDialog from '@/components/academy/AIAcademyGeneratorDialog';

export default function AcademyManager() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [editingAcademy, setEditingAcademy] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    estimated_duration_weeks: 8,
    is_published: false
  });

  React.useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: academies = [], isLoading } = useQuery({
    queryKey: ['academies'],
    queryFn: () => base44.entities.Academy.list('-created_date', 100),
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.list('title', 500),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Academy.create({
        ...data,
        instructor_email: user.email,
        instructor_name: user.full_name,
        enrolled_count: 0,
        completion_count: 0,
        program_structure: []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['academies']);
      setShowDialog(false);
      resetForm();
      toast.success('Academy created!');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.Academy.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['academies']);
      setShowDialog(false);
      resetForm();
      toast.success('Academy updated!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Academy.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['academies']);
      toast.success('Academy deleted');
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      estimated_duration_weeks: 8,
      is_published: false
    });
    setEditingAcademy(null);
  };

  const handleEdit = (academy) => {
    setEditingAcademy(academy);
    setFormData({
      title: academy.title || '',
      description: academy.description || '',
      category: academy.category || '',
      estimated_duration_weeks: academy.estimated_duration_weeks || 8,
      is_published: academy.is_published || false
    });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (editingAcademy) {
      updateMutation.mutate({ id: editingAcademy.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Award className="w-8 h-8 text-blue-600" />
          <Typography variant="h4" fontWeight="bold">Learning Academies</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setShowAIDialog(true)}
            startIcon={<Sparkles className="w-5 h-5" />}
          >
            AI Create
          </Button>
          <Button
            variant="contained"
            onClick={() => setShowDialog(true)}
            startIcon={<Plus className="w-5 h-5" />}
          >
            Create Academy
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {academies.map((academy) => (
          <Grid item xs={12} md={6} lg={4} key={academy.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                title={academy.title}
                subheader={academy.category}
                action={
                  <Box>
                    <IconButton onClick={() => handleEdit(academy)}>
                      <Edit className="w-4 h-4" />
                    </IconButton>
                    <IconButton onClick={() => deleteMutation.mutate(academy.id)}>
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  </Box>
                }
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {academy.description}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip
                    label={academy.is_published ? 'Published' : 'Draft'}
                    color={academy.is_published ? 'success' : 'default'}
                    size="small"
                  />
                  <Chip
                    icon={<Users className="w-4 h-4" />}
                    label={`${academy.enrolled_count || 0} enrolled`}
                    size="small"
                  />
                  <Chip
                    icon={<CheckCircle className="w-4 h-4" />}
                    label={`${academy.completion_count || 0} certified`}
                    size="small"
                  />
                </Box>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate(`${createPageUrl('AcademyBuilder')}?id=${academy.id}`)}
                  startIcon={<BookOpen className="w-4 h-4" />}
                >
                  Build Program
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAcademy ? 'Edit Academy' : 'Create Academy'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="Category"
              >
                <MenuItem value="mathematics">Mathematics</MenuItem>
                <MenuItem value="science">Science</MenuItem>
                <MenuItem value="english">English</MenuItem>
                <MenuItem value="history">History</MenuItem>
                <MenuItem value="computer_science">Computer Science</MenuItem>
                <MenuItem value="business">Business</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Estimated Duration (weeks)"
              type="number"
              value={formData.estimated_duration_weeks}
              onChange={(e) => setFormData({ ...formData, estimated_duration_weeks: parseInt(e.target.value) })}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                />
              }
              label="Published"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowDialog(false); resetForm(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingAcademy ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <AIAcademyGeneratorDialog
        open={showAIDialog}
        onClose={() => setShowAIDialog(false)}
        user={user}
        onCreated={(academy) => {
          queryClient.invalidateQueries(['academies']);
          setShowAIDialog(false);
          navigate(`${createPageUrl('AcademyBuilder')}?id=${academy.id}`);
        }}
      />
    </Container>
  );
}