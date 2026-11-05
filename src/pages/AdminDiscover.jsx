import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Box, Container, Typography, Card, Button, TextField, Stack, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'sonner';

const EMPTY_FORM = { title: '', description: '', category: 'announcement', image_url: '', link: '', is_active: true };

export default function AdminDiscover() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const queryClient = useQueryClient();

  const { data: content = [] } = useQuery({
    queryKey: ['discover-content'],
    queryFn: () => base44.entities.DiscoverContent.list('-created_date', 500)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DiscoverContent.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['discover-content']); setShowDialog(false); resetForm(); toast.success('Content added!'); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DiscoverContent.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['discover-content']); setShowDialog(false); resetForm(); toast.success('Content updated!'); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DiscoverContent.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['discover-content']); toast.success('Content deleted'); }
  });

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, image_url: file_url });
      toast.success('Image uploaded!');
    } catch {
      toast.error('Upload failed');
    }
  };

  const handleSubmit = () => {
    if (!formData.title) { toast.error('Title is required'); return; }
    if (editingContent) updateMutation.mutate({ id: editingContent.id, data: formData });
    else createMutation.mutate(formData);
  };

  const handleEdit = (item) => {
    setEditingContent(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      category: item.category,
      image_url: item.image_url || '',
      link: item.link || '',
      is_active: item.is_active
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingContent(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>Discover Content</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>Manage tech news, gossips, and announcements</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetForm(); setShowDialog(true); }}>
            Add Content
          </Button>
        </Stack>

        <Stack spacing={2}>
          {content.map((item) => (
            <Card key={item.id} sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                {item.image_url && (
                  <Box component="img" src={item.image_url} alt={item.title} sx={{ width: 96, height: 96, borderRadius: 2, objectFit: 'cover' }} />
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={700} sx={{ mb: 1 }}>{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{item.description}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip label={item.category.replace('_', ' ')} size="small" sx={{ bgcolor: '#f3e8ff', color: '#7e22ce' }} />
                    <Chip
                      label={item.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{ bgcolor: item.is_active ? '#dcfce7' : '#f3f4f6', color: item.is_active ? '#15803d' : '#374151' }}
                    />
                  </Stack>
                </Box>
                <Stack direction="row" spacing={1}>
                  <IconButton aria-label="Edit" size="small" onClick={() => handleEdit(item)}><EditIcon sx={{ fontSize: 18 }} /></IconButton>
                  <IconButton aria-label="Delete" size="small" onClick={() => { if (confirm('Delete this content?')) deleteMutation.mutate(item.id); }}>
                    <DeleteIcon sx={{ fontSize: 18, color: '#dc2626' }} />
                  </IconButton>
                </Stack>
              </Stack>
            </Card>
          ))}
        </Stack>

        <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingContent ? 'Edit Content' : 'Add Content'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Title *" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} fullWidth />
              <TextField label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={3} fullWidth />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={formData.category} label="Category" onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <MenuItem value="tech_news">Tech News</MenuItem>
                  <MenuItem value="gossip">Gossip</MenuItem>
                  <MenuItem value="announcement">Announcement</MenuItem>
                </Select>
              </FormControl>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5 }}>Image</Typography>
                <input type="file" accept="image/*" onChange={handleUploadImage} style={{ width: '100%' }} />
                {formData.image_url && <Box component="img" src={formData.image_url} alt="Preview" sx={{ mt: 1, height: 96, borderRadius: 1 }} />}
              </Box>
              <TextField label="Link (optional)" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="https://..." fullWidth />
              <FormControlLabel
                control={<Checkbox checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />}
                label="Active"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => { setShowDialog(false); resetForm(); }}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>
              {editingContent ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}