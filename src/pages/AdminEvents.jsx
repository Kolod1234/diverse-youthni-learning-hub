import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Box, Container, Typography, Card, CardContent, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Grid,
  Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel,
  IconButton, Avatar, Tabs, Tab, Divider
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WifiIcon from '@mui/icons-material/Wifi';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
const _w = (I) => ({ size, color, style, ...r }) => <I style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const Calendar = _w(CalendarTodayIcon), Plus = _w(AddIcon), Trash2 = _w(DeleteIcon), Edit = _w(EditIcon);
const Users = _w(PeopleIcon), MapPin = _w(LocationOnIcon), Wifi = _w(WifiIcon), Eye = _w(VisibilityIcon), EyeOff = _w(VisibilityOffIcon);
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

const CATEGORIES = ['workshop', 'webinar', 'social', 'competition', 'training', 'other'];
const EMPTY_FORM = {
  title: '', description: '', date: '', start_time: '', end_time: '',
  location: '', is_online: false, online_link: '', image_url: '',
  category: 'other', max_capacity: 0, rsvp_enabled: true,
  rsvp_deadline: '', is_published: true
};

export default function AdminEvents() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { data: events = [] } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => base44.entities.Event.list('-date', 200),
  });

  const { data: rsvps = [] } = useQuery({
    queryKey: ['all-event-rsvps'],
    queryFn: () => base44.entities.EventRSVP.list('-created_date', 1000),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Event.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['events-published'] });
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      toast.success('Event created!');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Event.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['events-published'] });
      setDialogOpen(false);
      setEditingEvent(null);
      setForm(EMPTY_FORM);
      toast.success('Event updated!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Event.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast.success('Event deleted');
    }
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, is_published }) => base44.entities.Event.update(id, { is_published }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-events'] })
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, image_url: file_url }));
    setUploading(false);
  };

  const openCreate = () => {
    setEditingEvent(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setForm({ ...EMPTY_FORM, ...event });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title || !form.date) { toast.error('Title and date are required'); return; }
    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const getEventRsvps = (eventId) => rsvps.filter(r => r.event_id === eventId);
  const goingCount = (eventId) => getEventRsvps(eventId).filter(r => r.status === 'going').length;

  const selectedEventRsvps = selectedEventId ? rsvps.filter(r => r.event_id === selectedEventId) : [];
  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Calendar size={28} color="#0b2f5c" />
          <Box>
            <Typography variant="h4" fontWeight={700}>Event Manager</Typography>
            <Typography color="text.secondary">Create and manage events with RSVP tracking</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={openCreate} sx={{ bgcolor: '#0b2f5c', '&:hover': { bgcolor: '#12396b' } }}>
          New Event
        </Button>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label={`All Events (${events.length})`} />
        <Tab label={`RSVPs (${rsvps.length})`} />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          {events.map(event => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={event.id}>
              <Card sx={{ borderRadius: 3, border: 1, borderColor: 'divider', opacity: event.is_published ? 1 : 0.6 }}>
                {event.image_url && (
                  <Box component="img" src={event.image_url} alt={event.title} sx={{ width: '100%', height: 140, objectFit: 'cover' }} />
                )}
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                        <Chip label={event.category} size="small" sx={{ textTransform: 'capitalize', fontSize: '0.75rem' }} />
                        {!event.is_published && <Chip label="Draft" size="small" variant="outlined" color="warning" />}
                      </Box>
                      <Typography variant="subtitle1" fontWeight={700}>{event.title}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    📅 {format(parseISO(event.date), 'MMM d, yyyy')}{event.start_time ? ` · ${event.start_time}` : ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {event.is_online ? '🌐 Online' : `📍 ${event.location || 'TBC'}`}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Users size={14} color="#6b7280" />
                    <Typography variant="caption" color="text.secondary">
                      {goingCount(event.id)} going{event.max_capacity > 0 ? ` / ${event.max_capacity} capacity` : ''}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton aria-label="Edit" size="small" onClick={() => openEdit(event)} title="Edit"><Edit size={16} /></IconButton>
                    <IconButton aria-label={event.is_published ? 'Unpublish' : 'Publish'} size="small" onClick={() => togglePublishMutation.mutate({ id: event.id, is_published: !event.is_published })} title={event.is_published ? 'Unpublish' : 'Publish'}>
                      {event.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                    </IconButton>
                    <IconButton aria-label="View RSVPs" size="small" onClick={() => { setSelectedEventId(event.id); setTab(1); }} title="View RSVPs">
                      <Users size={16} color="#2563eb" />
                    </IconButton>
                    <IconButton aria-label="Delete" size="small" onClick={() => { if (confirm('Delete this event?')) deleteMutation.mutate(event.id); }} title="Delete">
                      <Trash2 size={16} color="#dc2626" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {events.length === 0 && (
            <Grid size={12}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Calendar size={48} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
                <Typography color="text.secondary">No events yet. Create your first event!</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {tab === 1 && (
        <Box>
          {/* Event selector */}
          <FormControl sx={{ mb: 3, minWidth: 280 }}>
            <InputLabel>Filter by Event</InputLabel>
            <Select value={selectedEventId || ''} label="Filter by Event" onChange={e => setSelectedEventId(e.target.value || null)}>
              <MenuItem value="">All Events</MenuItem>
              {events.map(e => <MenuItem key={e.id} value={e.id}>{e.title}</MenuItem>)}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {(selectedEventId ? selectedEventRsvps : rsvps).map(rsvp => {
              const ev = events.find(e => e.id === rsvp.event_id);
              return (
                <Card key={rsvp.id}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: '#0b2f5c', fontSize: 14 }}>
                          {rsvp.user_name?.[0] || '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{rsvp.user_name}</Typography>
                          <Typography variant="caption" color="text.secondary">{rsvp.user_email}</Typography>
                          {!selectedEventId && ev && (
                            <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>{ev.title}</Typography>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {rsvp.note && <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 200, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>"{rsvp.note}"</Typography>}
                        <Chip
                          label={rsvp.status === 'going' ? '✓ Going' : rsvp.status === 'maybe' ? '? Maybe' : '✗ Not Going'}
                          size="small"
                          color={rsvp.status === 'going' ? 'success' : rsvp.status === 'maybe' ? 'warning' : 'default'}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
            {(selectedEventId ? selectedEventRsvps : rsvps).length === 0 && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Users size={40} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
                <Typography color="text.secondary">No RSVPs yet</Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Event Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} fullWidth />
          <TextField label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} fullWidth multiline rows={3} />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField label="Date *" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={form.category} label="Category" onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <MenuItem key={c} value={c} sx={{ textTransform: 'capitalize' }}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField label="Start Time" type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField label="End Time" type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
          </Box>

          <FormControlLabel
            control={<Switch checked={form.is_online} onChange={e => setForm(f => ({ ...f, is_online: e.target.checked }))} />}
            label="Online Event"
          />
          {form.is_online ? (
            <TextField label="Meeting Link" value={form.online_link} onChange={e => setForm(f => ({ ...f, online_link: e.target.value }))} fullWidth placeholder="https://meet.google.com/..." />
          ) : (
            <TextField label="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} fullWidth placeholder="Address or venue name" />
          )}

          <Divider />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField label="Max Capacity (0 = unlimited)" type="number" value={form.max_capacity} onChange={e => setForm(f => ({ ...f, max_capacity: Number(e.target.value) }))} fullWidth />
            <TextField label="RSVP Deadline" type="date" value={form.rsvp_deadline} onChange={e => setForm(f => ({ ...f, rsvp_deadline: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
          </Box>

          {/* Image upload */}
          <Box>
            <Typography variant="body2" fontWeight={600} gutterBottom>Banner Image</Typography>
            <input type="file" accept="image/*" id="event-img-upload" hidden onChange={handleImageUpload} />
            <Button variant="outlined" size="small" onClick={() => document.getElementById('event-img-upload').click()} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
            {form.image_url && (
              <Box component="img" src={form.image_url} sx={{ mt: 1, height: 80, borderRadius: 1, objectFit: 'cover', display: 'block' }} />
            )}
            <TextField label="Or paste image URL" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} fullWidth size="small" sx={{ mt: 1 }} />
          </Box>

          <Divider />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControlLabel control={<Switch checked={form.rsvp_enabled} onChange={e => setForm(f => ({ ...f, rsvp_enabled: e.target.checked }))} color="success" />} label="Enable RSVP" />
            <FormControlLabel control={<Switch checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} color="primary" />} label="Published" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} sx={{ bgcolor: '#0b2f5c', '&:hover': { bgcolor: '#12396b' } }}>
            {editingEvent ? 'Save Changes' : 'Create Event'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}