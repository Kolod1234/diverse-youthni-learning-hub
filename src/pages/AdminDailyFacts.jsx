import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Box, Container, Typography, Card, Button, TextField, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RefreshIcon from '@mui/icons-material/Refresh';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import FactCard from '@/components/facts/FactCard.jsx';

const EMPTY_FORM = { fact: '', category: 'science', is_active: true };

export default function AdminDailyFacts() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingFact, setEditingFact] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [generatingFact, setGeneratingFact] = useState(false);

  const queryClient = useQueryClient();

  const { data: facts = [] } = useQuery({
    queryKey: ['daily-facts'],
    queryFn: () => base44.entities.DailyFact.list('-created_date', 500)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DailyFact.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['daily-facts']); setShowDialog(false); resetForm(); toast.success('Fact added!'); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DailyFact.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['daily-facts']); setShowDialog(false); resetForm(); toast.success('Fact updated!'); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DailyFact.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['daily-facts']); toast.success('Fact deleted'); }
  });

  const handleSubmit = () => {
    if (!formData.fact) { toast.error('Fact is required'); return; }
    if (editingFact) updateMutation.mutate({ id: editingFact.id, data: formData });
    else createMutation.mutate(formData);
  };

  const handleEdit = (fact) => {
    setEditingFact(fact);
    setFormData({ fact: fact.fact, category: fact.category, is_active: fact.is_active });
    setShowDialog(true);
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingFact(null);
  };

  const generateFactWithAI = async () => {
    setGeneratingFact(true);
    try {
      const result = await base44.functions.invoke('fetchDailyFactsFromSources');
      if (result.data.success) {
        queryClient.invalidateQueries(['daily-facts']);
        toast.success(`Added ${result.data.factsAdded} unique facts from ${result.data.sourcesAttempted} sources!`);
        setShowDialog(false);
      } else {
        toast.error('Failed to fetch facts from sources');
      }
    } catch (error) {
      toast.error('Failed to generate facts from sources');
    } finally {
      setGeneratingFact(false);
    }
  };

  const stats = {
    total: facts.length,
    active: facts.filter(f => f.is_active).length,
    byCategory: ['science', 'history', 'nature', 'technology', 'general'].reduce((acc, cat) => {
      acc[cat] = facts.filter(f => f.category === cat).length;
      return acc;
    }, {})
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="xl">
        <motion.div>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h3" fontWeight={700}>Daily Facts Library</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>Manage engaging facts across multiple categories</Typography>
            </Box>
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <Button variant="contained" startIcon={<RefreshIcon />} onClick={() => queryClient.invalidateQueries(['daily-facts'])} sx={{ bgcolor: '#4b5563', '&:hover': { bgcolor: '#374151' } }}>
                Refresh
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetForm(); setShowDialog(true); }} sx={{ bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' } }}>
                Add Fact
              </Button>
              <Button variant="contained" startIcon={<AutoAwesomeIcon />} onClick={generateFactWithAI} disabled={generatingFact} sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#7e22ce' } }}>
                {generatingFact ? 'Fetching...' : 'Fetch from Sources'}
              </Button>
            </Stack>
          </Stack>
        </motion.div>

        <motion.div>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 2, mb: 4 }}>
            {[
              { label: 'Total Facts', value: stats.total, color: 'text.primary', border: 'divider' },
              { label: 'Active', value: stats.active, color: '#16a34a', border: 'divider' },
              { label: 'Science', value: stats.byCategory.science, color: '#1d4ed8', border: '#bfdbfe' },
              { label: 'History', value: stats.byCategory.history, color: '#7e22ce', border: '#e9d5ff' },
              { label: 'Nature', value: stats.byCategory.nature, color: '#15803d', border: '#bbf7d0' },
            ].map((s) => (
              <Card key={s.label} sx={{ p: 2, border: 1, borderColor: s.border }}>
                <Typography variant="caption" sx={{ color: s.color, fontWeight: 500 }}>{s.label}</Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: s.color, mt: 1 }}>{s.value}</Typography>
              </Card>
            ))}
          </Box>
        </motion.div>

        <motion.div>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
            {facts.length > 0 ? (
              facts.map((fact, index) => (
                <Box key={fact.id} sx={{ position: 'relative', '&:hover .fact-actions': { opacity: 1 } }}>
                  <FactCard fact={fact} index={index} />
                  <Stack direction="row" spacing={1} className="fact-actions" sx={{ position: 'absolute', top: 16, right: 16, opacity: 0, transition: 'opacity 0.2s' }}>
                    <IconButton aria-label="Edit" size="small" onClick={() => handleEdit(fact)} sx={{ bgcolor: 'background.paper', boxShadow: 2, '&:hover': { bgcolor: 'background.paper' } }}>
                      <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton aria-label="Delete" size="small" onClick={() => { if (confirm('Delete this fact?')) deleteMutation.mutate(fact.id); }} sx={{ bgcolor: 'background.paper', boxShadow: 2, '&:hover': { bgcolor: 'background.paper' } }}>
                      <DeleteIcon sx={{ fontSize: 16, color: '#dc2626' }} />
                    </IconButton>
                  </Stack>
                </Box>
              ))
            ) : (
              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 8 }}>
                <LightbulbIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">No facts yet. Create one or fetch from sources!</Typography>
              </Box>
            )}
          </Box>
        </motion.div>

        <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingFact ? 'Edit Fact' : 'Add Fact'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Fact *" value={formData.fact} onChange={(e) => setFormData({ ...formData, fact: e.target.value })} multiline rows={4} fullWidth />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={formData.category} label="Category" onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <MenuItem value="science">Science</MenuItem>
                  <MenuItem value="history">History</MenuItem>
                  <MenuItem value="nature">Nature</MenuItem>
                  <MenuItem value="technology">Technology</MenuItem>
                  <MenuItem value="space">Space</MenuItem>
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
            <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' } }}>
              {editingFact ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}