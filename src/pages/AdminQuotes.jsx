import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Box, Container, Typography, Card, Button, TextField, Chip, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import { toast } from 'sonner';

export default function AdminQuotes() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [formData, setFormData] = useState({ quote: '', author: '', category: 'motivation', is_active: true });

  const queryClient = useQueryClient();

  const { data: quotes = [] } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => base44.entities.InspirationalQuote.list('-created_date', 500)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.InspirationalQuote.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['quotes']); setShowDialog(false); resetForm(); toast.success('Quote added!'); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.InspirationalQuote.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['quotes']); setShowDialog(false); resetForm(); toast.success('Quote updated!'); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.InspirationalQuote.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['quotes']); toast.success('Quote deleted'); }
  });

  const handleSubmit = () => {
    if (!formData.quote || !formData.author) { toast.error('Quote and author are required'); return; }
    if (editingQuote) updateMutation.mutate({ id: editingQuote.id, data: formData });
    else createMutation.mutate(formData);
  };

  const handleEdit = (quote) => {
    setEditingQuote(quote);
    setFormData({ quote: quote.quote, author: quote.author, category: quote.category, is_active: quote.is_active });
    setShowDialog(true);
  };

  const resetForm = () => {
    setFormData({ quote: '', author: '', category: 'motivation', is_active: true });
    setEditingQuote(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>Inspirational Quotes</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>Manage motivational quotes</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetForm(); setShowDialog(true); }} sx={{ bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' } }}>
            Add Quote
          </Button>
        </Stack>

        <Stack spacing={2}>
          {quotes.map((quote) => (
            <Card key={quote.id} sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <FormatQuoteIcon sx={{ fontSize: 32, color: '#d97706', flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>"{quote.quote}"</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>— {quote.author}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip label={quote.category} size="small" sx={{ bgcolor: '#fef3c7', color: '#a16207' }} />
                    <Chip
                      label={quote.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{ bgcolor: quote.is_active ? '#dcfce7' : '#f3f4f6', color: quote.is_active ? '#15803d' : '#374151' }}
                    />
                  </Stack>
                </Box>
                <Stack direction="row" spacing={1}>
                  <IconButton aria-label="Edit" size="small" onClick={() => handleEdit(quote)}><EditIcon sx={{ fontSize: 18 }} /></IconButton>
                  <IconButton aria-label="Delete" size="small" onClick={() => { if (confirm('Delete this quote?')) deleteMutation.mutate(quote.id); }}>
                    <DeleteIcon sx={{ fontSize: 18, color: '#dc2626' }} />
                  </IconButton>
                </Stack>
              </Stack>
            </Card>
          ))}
        </Stack>

        <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingQuote ? 'Edit Quote' : 'Add Quote'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Quote *" value={formData.quote} onChange={(e) => setFormData({ ...formData, quote: e.target.value })} multiline rows={4} fullWidth />
              <TextField label="Author *" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} fullWidth />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={formData.category} label="Category" onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <MenuItem value="education">Education</MenuItem>
                  <MenuItem value="leadership">Leadership</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="motivation">Motivation</MenuItem>
                  <MenuItem value="wisdom">Wisdom</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={<Checkbox checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />}
                label="Active"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => { setShowDialog(false); resetForm(); }}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' } }}>
              {editingQuote ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}