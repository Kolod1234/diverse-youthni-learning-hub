import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { tempCircleImageBase64 } from '../temp-circle-upload';
import {
  Box, Container, Typography, Card, Button, TextField, Chip, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, Menu, MenuItem,
  FormControl, InputLabel, Select, FormControlLabel, Checkbox, IconButton
} from '@mui/material';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import { toast } from 'sonner';
import { format } from 'date-fns';

const RSS_SOURCES = [
  { id: 'bbc', label: 'BBC News' },
  { id: 'bbceducation', label: 'BBC Education' },
  { id: 'cnn', label: 'CNN' },
  { id: 'eani', label: 'Education Authority NI' },
  { id: 'deni', label: 'Department of Education NI' },
  { id: 'govuk', label: 'Gov.uk Education' },
  { id: 'ukparliament', label: 'UK Parliament Education' },
  { id: 'ocnni', label: 'OCN NI' },
  { id: 'ukhomeoffice', label: 'UK Home Office' },
  { id: 'migrantni', label: 'Migrant NI' },
  { id: 'metroweather', label: 'Metro UK' },
  { id: 'msn', label: 'MSN News' },
];

const ALL_SOURCE_IDS = RSS_SOURCES.map(s => s.id);

const EMPTY_FORM = {
  title: '', description: '', link: '', image_url: '',
  published_date: new Date().toISOString().split('T')[0],
  category: '', is_featured: false,
};

export default function AdminRSSFeed() {
  const [user, setUser] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingFeed, setEditingFeed] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [importMenuAnchor, setImportMenuAnchor] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('circle') !== '1') return;
    let cancelled = false;
    const uploadRaster = async () => {
      try {
        const binary = window.atob(tempCircleImageBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
        const file = new File([bytes], 'circle-properties-two-key-properties.jpg', { type: 'image/jpeg' });
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        if (!cancelled) document.body.dataset.tempCircleUrl = file_url;
      } catch (error) {
        if (!cancelled) document.body.dataset.tempCircleError = error?.message || 'upload failed';
      }
    };
    uploadRaster();
    return () => { cancelled = true; };
  }, []);

  const { data: feedItems = [] } = useQuery({
    queryKey: ['rss-feed-admin'],
    queryFn: () => base44.entities.RSSFeed.list('-published_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RSSFeed.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['rss-feed-admin']);
      queryClient.invalidateQueries(['rss-feed']);
      toast.success('RSS feed item created!');
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RSSFeed.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['rss-feed-admin']);
      queryClient.invalidateQueries(['rss-feed']);
      toast.success('RSS feed item updated!');
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RSSFeed.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['rss-feed-admin']);
      queryClient.invalidateQueries(['rss-feed']);
      toast.success('RSS feed item deleted!');
    },
  });

  const importFeedMutation = useMutation({
    mutationFn: async (source) => {
      const response = await base44.functions.invoke('importRSSFeeds', { source });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['rss-feed-admin']);
      queryClient.invalidateQueries(['rss-feed']);
      toast.success(data.message || 'RSS feed imported successfully!');
    },
    onError: (error) => toast.error(error.message || 'Failed to import RSS feed'),
  });

  const cleanupMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('cleanupOldNews', {});
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['rss-feed-admin']);
      queryClient.invalidateQueries(['rss-feed']);
      toast.success(data.message || 'Old news cleaned up successfully!');
    },
    onError: (error) => toast.error(error.message || 'Failed to cleanup old news'),
  });

  const handleOpenDialog = (feed = null) => {
    if (feed) {
      setEditingFeed(feed);
      setFormData({
        title: feed.title,
        description: feed.description,
        link: feed.link || '',
        image_url: feed.image_url || '',
        published_date: feed.published_date ? new Date(feed.published_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        category: feed.category || '',
        is_featured: feed.is_featured || false,
      });
    } else {
      setEditingFeed(null);
      setFormData(EMPTY_FORM);
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => { setShowDialog(false); setEditingFeed(null); };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, image_url: result.file_url });
      toast.success('Image uploaded successfully!');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) { toast.error('Title and description are required'); return; }
    const submitData = { ...formData, published_date: new Date(formData.published_date).toISOString() };
    if (editingFeed) updateMutation.mutate({ id: editingFeed.id, data: submitData });
    else createMutation.mutate(submitData);
  };

  if (!user || user.role !== 'admin') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover' }}>
        <Card sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700}>Admin Access Only</Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #eff6ff, white)' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>News & Announcements Manager</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>Import daily news or create custom announcements for your users</Typography>
            <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 12, height: 12, bgcolor: '#22c55e', borderRadius: '50%' }} className="animate-pulse" />
                <Typography variant="caption" color="text.secondary">Live news from 11 sources</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 12, height: 12, bgcolor: '#3b82f6', borderRadius: '50%' }} />
                <Typography variant="caption" color="text.secondary">Custom announcements</Typography>
              </Stack>
            </Stack>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => cleanupMutation.mutate()} disabled={cleanupMutation.isPending}>
              Clean Old News
            </Button>
            <Button
              variant="outlined"
              color="success"
              startIcon={<DownloadIcon />}
              onClick={() => ALL_SOURCE_IDS.forEach(source => importFeedMutation.mutate(source))}
              disabled={importFeedMutation.isPending}
            >
              Refresh All News
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={(e) => setImportMenuAnchor(e.currentTarget)} disabled={importFeedMutation.isPending}>
              Import Source
            </Button>
            <Menu anchorEl={importMenuAnchor} open={Boolean(importMenuAnchor)} onClose={() => setImportMenuAnchor(null)} PaperProps={{ sx: { maxHeight: 384 } }}>
              {RSS_SOURCES.map((src) => (
                <MenuItem key={src.id} onClick={() => { importFeedMutation.mutate(src.id); setImportMenuAnchor(null); }}>
                  {src.label}
                </MenuItem>
              ))}
            </Menu>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' } }}>
              Create Custom Announcement
            </Button>
          </Stack>
        </Stack>

        <Stack spacing={2}>
          {feedItems.map((item) => (
            <Card key={item.id} sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                {item.image_url && (
                  <Box component="img" src={item.image_url} alt={item.title} loading="lazy" sx={{ width: 160, height: 112, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />
                )}
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap">
                        <Typography variant="h6" fontWeight={700}>{item.title}</Typography>
                        {item.is_featured && <Chip label="Featured" size="small" sx={{ bgcolor: '#facc15', color: '#1f2937' }} />}
                        {item.category && <Chip label={item.category} size="small" variant="outlined" />}
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{item.description}</Typography>
                      {item.link && (
                        <Stack direction="row" spacing={0.5} alignItems="center" component="a" href={item.link} target="_blank" rel="noopener noreferrer" sx={{ color: '#2563eb', '&:hover': { color: '#1d4ed8' }, textDecoration: 'none' }}>
                          <OpenInNewIcon sx={{ fontSize: 12 }} />
                          <Typography variant="caption">View article</Typography>
                        </Stack>
                      )}
                      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
                        Published: {format(new Date(item.published_date || item.created_date), 'MMM d, yyyy')}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" onClick={() => handleOpenDialog(item)} sx={{ border: 1, borderColor: 'divider' }}>
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => { if (confirm('Delete this feed item?')) deleteMutation.mutate(item.id); }} sx={{ bgcolor: '#dc2626', color: 'white', '&:hover': { bgcolor: '#b91c1c' } }}>
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </Card>
          ))}
        </Stack>

        {feedItems.length === 0 && (
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <RssFeedIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>No Feed Items Yet</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>Create your first RSS feed item</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Add Feed Item</Button>
          </Card>
        )}

        <Dialog open={showDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingFeed ? 'Edit News Item' : 'Create Custom Announcement'}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {editingFeed ? 'Update news item details' : 'Share important updates with your users on the homepage'}
            </Typography>
          </DialogTitle>
          <Box component="form" onSubmit={handleSubmit}>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField label="Title *" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} fullWidth required />
                <TextField label="Description *" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={3} fullWidth required />
                <TextField label="Link (URL)" type="url" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} fullWidth placeholder="https://..." />
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Image</Typography>
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ width: '100%', marginBottom: 8 }} />
                  <TextField label="Or paste image URL" type="url" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} fullWidth size="small" placeholder="https://..." />
                  {formData.image_url && (
                    <Box component="img" src={formData.image_url} alt="Preview" sx={{ mt: 1, width: '100%', height: 128, objectFit: 'cover', borderRadius: 1, border: 1, borderColor: 'divider' }} />
                  )}
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Source / Category</InputLabel>
                    <Select value={formData.category} label="Source / Category" onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                      <MenuItem value="">Select source...</MenuItem>
                      <MenuItem value="ANNOUNCEMENT">📢 Custom Announcement</MenuItem>
                      <MenuItem value="BBC">BBC News</MenuItem>
                      <MenuItem value="BBCEDUCATION">BBC Education</MenuItem>
                      <MenuItem value="CNN">CNN</MenuItem>
                      <MenuItem value="EANI">Education Authority NI</MenuItem>
                      <MenuItem value="DENI">Department of Education NI</MenuItem>
                      <MenuItem value="GOVUK">Gov.uk Education</MenuItem>
                      <MenuItem value="UKPARLIAMENT">UK Parliament Education</MenuItem>
                      <MenuItem value="OCNNI">OCN NI</MenuItem>
                      <MenuItem value="UKHOMEOFFICE">UK Home Office</MenuItem>
                      <MenuItem value="MIGRANTNI">Migrant NI</MenuItem>
                      <MenuItem value="METROWEATHER">Metro UK</MenuItem>
                      <MenuItem value="MSN">MSN News</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField label="Published Date" type="date" value={formData.published_date} onChange={(e) => setFormData({ ...formData, published_date: e.target.value })} fullWidth size="small" InputLabelProps={{ shrink: true }} />
                </Box>
                <FormControlLabel
                  control={<Checkbox checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} />}
                  label="Featured item"
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button type="button" variant="outlined" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending} sx={{ bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' } }}>
                {editingFeed ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Container>
    </Box>
  );
}