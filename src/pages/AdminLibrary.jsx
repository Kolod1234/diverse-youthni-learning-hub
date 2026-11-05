import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Box, Container, Typography, Card, CardContent, CardMedia, Button, TextField, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'sonner';

const EMPTY_FORM = {
  title: '', description: '', category: 'document', file_url: '',
  cover_image: '', author: '', tags: [], is_featured: false
};

export default function AdminLibrary() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [uploadingFile, setUploadingFile] = useState(false);

  const queryClient = useQueryClient();

  const { data: resources = [] } = useQuery({
    queryKey: ['library-resources'],
    queryFn: () => base44.entities.LibraryResource.list('-created_date', 500)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LibraryResource.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['library-resources']); setShowDialog(false); resetForm(); toast.success('Resource added!'); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LibraryResource.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['library-resources']); setShowDialog(false); resetForm(); toast.success('Resource updated!'); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LibraryResource.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['library-resources']); toast.success('Resource deleted'); }
  });

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, file_url });
      toast.success('File uploaded!');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleUploadCover = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, cover_image: file_url });
      toast.success('Cover image uploaded!');
    } catch {
      toast.error('Upload failed');
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.file_url) { toast.error('Title and file are required'); return; }
    if (editingResource) updateMutation.mutate({ id: editingResource.id, data: formData });
    else createMutation.mutate(formData);
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description || '',
      category: resource.category,
      file_url: resource.file_url,
      cover_image: resource.cover_image || '',
      author: resource.author || '',
      tags: resource.tags || [],
      is_featured: resource.is_featured || false
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingResource(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>Library Management</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>Manage educational resources</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetForm(); setShowDialog(true); }} sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}>
            Add Resource
          </Button>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
          {resources.map((resource) => (
            <Card key={resource.id} sx={{ overflow: 'hidden' }}>
              {resource.cover_image && (
                <CardMedia component="img" image={resource.cover_image} alt={resource.title} sx={{ height: 192, objectFit: 'cover' }} />
              )}
              <CardContent>
                <Typography fontWeight={700} sx={{ mb: 1 }}>{resource.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {resource.description}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 2 }}>{resource.category}</Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton aria-label="Edit" size="small" onClick={() => handleEdit(resource)} sx={{ border: 1, borderColor: 'divider' }}>
                    <EditIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton aria-label="Delete" size="small" onClick={() => { if (confirm('Delete this resource?')) deleteMutation.mutate(resource.id); }} sx={{ border: 1, borderColor: 'divider' }}>
                    <DeleteIcon sx={{ fontSize: 16, color: '#dc2626' }} />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingResource ? 'Edit Resource' : 'Add Resource'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Title *" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} fullWidth />
              <TextField label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={3} fullWidth />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={formData.category} label="Category" onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <MenuItem value="book">Book</MenuItem>
                  <MenuItem value="document">Document</MenuItem>
                  <MenuItem value="video">Video</MenuItem>
                  <MenuItem value="article">Article</MenuItem>
                  <MenuItem value="research">Research</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5 }}>File * {uploadingFile && '(Uploading...)'}</Typography>
                <input type="file" onChange={handleUploadFile} disabled={uploadingFile} style={{ width: '100%' }} />
                {formData.file_url && <Typography variant="caption" sx={{ color: '#16a34a', mt: 0.5, display: 'block' }}>✓ File uploaded</Typography>}
              </Box>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5 }}>Cover Image</Typography>
                <input type="file" accept="image/*" onChange={handleUploadCover} style={{ width: '100%' }} />
                {formData.cover_image && <Box component="img" src={formData.cover_image} alt="Cover" sx={{ mt: 1, height: 96, borderRadius: 1 }} />}
              </Box>
              <TextField label="Author" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} fullWidth />
              <TextField
                label="Tags (comma separated)"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                fullWidth
              />
              <FormControlLabel
                control={<Checkbox checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} />}
                label="Featured"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => { setShowDialog(false); resetForm(); }}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={uploadingFile} sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}>
              {editingResource ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}