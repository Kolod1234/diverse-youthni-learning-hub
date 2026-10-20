import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Box, Container, Typography, Card, CardContent, CardMedia, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Avatar,
  Grid, Select, MenuItem, FormControl, InputLabel, Tabs, Tab
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import WifiIcon from '@mui/icons-material/Wifi';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const Calendar = _w(CalendarTodayIcon), MapPin = _w(LocationOnIcon), Clock = _w(AccessTimeIcon), Users = _w(PeopleIcon);
const Wifi = _w(WifiIcon), CheckCircle = _w(CheckCircleIcon), X = _w(CloseIcon), HelpCircle = _w(HelpOutlineIcon);
import PaginationBar from '@/components/ui/PaginationBar';
import { format, isPast, isFuture, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

const CATEGORY_COLORS = {
  workshop: '#4f46e5',
  webinar: '#2563eb',
  social: '#16a34a',
  competition: '#dc2626',
  training: '#4f46e5',
  other: '#475569'
};

export default function Events() {
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('upcoming');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpNote, setRsvpNote] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 12;
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events-published'],
    queryFn: () => base44.entities.Event.filter({ is_published: true }, 'date', 200),
  });

  const { data: myRsvps = [] } = useQuery({
    queryKey: ['my-rsvps', user?.email],
    queryFn: () => base44.entities.EventRSVP.filter({ user_email: user.email }, '-created_date', 500),
    enabled: !!user,
  });

  const { data: eventRsvps = [] } = useQuery({
    queryKey: ['event-rsvps', selectedEvent?.id],
    queryFn: () => base44.entities.EventRSVP.filter({ event_id: selectedEvent.id }, '-created_date', 500),
    enabled: !!selectedEvent,
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ event_id, status }) => {
      const existing = myRsvps.find(r => r.event_id === event_id);
      if (existing) {
        return base44.entities.EventRSVP.update(existing.id, { status, note: rsvpNote });
      }
      return base44.entities.EventRSVP.create({
        event_id, status,
        user_email: user.email,
        user_name: user.full_name || user.email,
        note: rsvpNote
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-rsvps'] });
      queryClient.invalidateQueries({ queryKey: ['event-rsvps'] });
      setRsvpNote('');
    }
  });

  const now = new Date();
  const filteredEvents = events.filter(e => {
    const eventDate = parseISO(e.date);
    if (filter === 'upcoming') return isFuture(eventDate) || format(eventDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
    if (filter === 'past') return isPast(eventDate) && format(eventDate, 'yyyy-MM-dd') !== format(now, 'yyyy-MM-dd');
    if (filter === 'my') return myRsvps.some(r => r.event_id === e.id && r.status === 'going');
    return true;
  });

  const getMyRsvp = (eventId) => myRsvps.find(r => r.event_id === eventId);
  const goingCount = (eventId) => eventRsvps.filter(r => r.event_id === eventId && r.status === 'going').length;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero */}
      <Box sx={{ bgcolor: '#0b2f5c', py: 8 }}>
        <Container maxWidth="xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Calendar size={36} color="white" />
              <Typography variant="h3" fontWeight={800} color="white">Events</Typography>
            </Box>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: 600 }}>
              Workshops, webinars, social gatherings and more. Join us and connect with the community.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 5 }}>
        {/* Filter Tabs */}
        <Tabs value={filter} onChange={(_, v) => setFilter(v)} sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Upcoming" value="upcoming" />
          <Tab label="Past Events" value="past" />
          {user && <Tab label="My RSVPs" value="my" />}
          <Tab label="All Events" value="all" />
        </Tabs>
        

        {isLoading ? (
          <Grid container spacing={3}>
            {[1,2,3].map(i => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Card sx={{ height: 360 }}>
                  <Box sx={{ height: 200, bgcolor: 'action.hover' }} className="animate-pulse" />
                  <CardContent>
                    <Box sx={{ height: 20, bgcolor: 'action.hover', borderRadius: 1, mb: 1 }} className="animate-pulse" />
                    <Box sx={{ height: 16, bgcolor: 'action.hover', borderRadius: 1, width: '60%' }} className="animate-pulse" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : filteredEvents.length === 0 ? (

          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Calendar size={64} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
            <Typography variant="h6" color="text.secondary">No events found</Typography>
            <Typography variant="body2" color="text.disabled">Check back soon for upcoming events!</Typography>
          </Box>
        ) : (
          <Box>
          <Grid container spacing={3}>
            {filteredEvents.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((event, idx) => {
              const myRsvp = getMyRsvp(event.id);
              const isPastEvent = isPast(parseISO(event.date)) && format(parseISO(event.date), 'yyyy-MM-dd') !== format(now, 'yyyy-MM-dd');
              return (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={event.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card
                      onClick={() => setSelectedEvent(event)}
                      sx={{
                        cursor: 'pointer', borderRadius: 3, overflow: 'hidden',
                        boxShadow: 2, '&:hover': { boxShadow: 6 }, transition: 'all 0.2s',
                        border: 1, borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column'
                      }}
                    >
                      {event.image_url ? (
                        <CardMedia component="img" height="180" image={event.image_url} alt={event.title} sx={{ objectFit: 'cover' }} />
                      ) : (
                        <Box sx={{ height: 140, background: `linear-gradient(135deg, ${CATEGORY_COLORS[event.category] || '#475569'}, ${CATEGORY_COLORS[event.category] || '#475569'}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Calendar size={48} color="rgba(255,255,255,0.7)" />
                        </Box>
                      )}
                      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                          <Chip label={event.category} size="small" sx={{ bgcolor: CATEGORY_COLORS[event.category] + '15', color: CATEGORY_COLORS[event.category], fontWeight: 600, textTransform: 'capitalize', fontSize: '0.7rem' }} />
                          {isPastEvent && <Chip label="Past" size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />}
                          {myRsvp && <Chip label={myRsvp.status === 'going' ? '✓ Going' : myRsvp.status === 'maybe' ? '? Maybe' : '✗ Not Going'} size="small" color={myRsvp.status === 'going' ? 'success' : myRsvp.status === 'maybe' ? 'warning' : 'default'} sx={{ fontSize: '0.7rem' }} />}
                        </Box>

                        <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5, lineHeight: 1.3 }}>{event.title}</Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Calendar size={14} color="#6b7280" />
                            <Typography variant="caption" color="text.secondary">
                              {format(parseISO(event.date), 'EEE, MMM d, yyyy')}
                              {event.start_time && ` · ${event.start_time}${event.end_time ? ` – ${event.end_time}` : ''}`}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {event.is_online ? <Wifi size={14} color="#6b7280" /> : <MapPin size={14} color="#6b7280" />}
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {event.is_online ? 'Online Event' : (event.location || 'TBC')}
                            </Typography>
                          </Box>
                        </Box>

                        {event.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                            {event.description}
                          </Typography>
                        )}

                        {event.rsvp_enabled && !isPastEvent && user && (
                          <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                            {['going', 'maybe', 'not_going'].map(status => (
                              <Button
                                key={status}
                                size="small"
                                variant={myRsvp?.status === status ? 'contained' : 'outlined'}
                                onClick={(e) => { e.stopPropagation(); rsvpMutation.mutate({ event_id: event.id, status }); }}
                                sx={{
                                  flex: 1, fontSize: '0.7rem', py: 0.5,
                                  ...(myRsvp?.status === status && status === 'going' ? { bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } } : {}),
                                  ...(myRsvp?.status === status && status === 'maybe' ? { bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' } } : {}),
                                  ...(myRsvp?.status === status && status === 'not_going' ? { bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' } } : {}),
                                }}
                              >
                                {status === 'going' ? '✓ Going' : status === 'maybe' ? '? Maybe' : '✗ No'}
                              </Button>
                            ))}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
          <PaginationBar page={page} totalItems={filteredEvents.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
          </Box>
        )}
      </Container>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onClose={() => setSelectedEvent(null)} maxWidth="sm" fullWidth>
        {selectedEvent && (
          <>
            {selectedEvent.image_url && (
              <Box sx={{ height: 220, overflow: 'hidden' }}>
                <Box component="img" src={selectedEvent.image_url} alt={selectedEvent.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
            )}
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Chip label={selectedEvent.category} size="small" sx={{ bgcolor: CATEGORY_COLORS[selectedEvent.category] + '15', color: CATEGORY_COLORS[selectedEvent.category], textTransform: 'capitalize', fontWeight: 600 }} />
              </Box>
              {selectedEvent.title}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Calendar size={18} color="#6b7280" />
                  <Typography variant="body2">
                    {format(parseISO(selectedEvent.date), 'EEEE, MMMM d, yyyy')}
                    {selectedEvent.start_time && ` · ${selectedEvent.start_time}${selectedEvent.end_time ? ` – ${selectedEvent.end_time}` : ''}`}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {selectedEvent.is_online ? <Wifi size={18} color="#6b7280" /> : <MapPin size={18} color="#6b7280" />}
                  <Typography variant="body2">
                    {selectedEvent.is_online ? 'Online Event' : (selectedEvent.location || 'Location TBC')}
                    {selectedEvent.is_online && selectedEvent.online_link && (
                      <> · <a href={selectedEvent.online_link} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>Join Link</a></>
                    )}
                  </Typography>
                </Box>
                {selectedEvent.max_capacity > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Users size={18} color="#6b7280" />
                    <Typography variant="body2">{eventRsvps.filter(r => r.status === 'going').length} / {selectedEvent.max_capacity} attending</Typography>
                  </Box>
                )}
                {selectedEvent.rsvp_deadline && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Clock size={18} color="#6b7280" />
                    <Typography variant="body2">RSVP by {format(parseISO(selectedEvent.rsvp_deadline), 'MMM d, yyyy')}</Typography>
                  </Box>
                )}
              </Box>

              {selectedEvent.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  {selectedEvent.description}
                </Typography>
              )}

              {/* Attendees */}
              {eventRsvps.filter(r => r.status === 'going').length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    ATTENDEES ({eventRsvps.filter(r => r.status === 'going').length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {eventRsvps.filter(r => r.status === 'going').slice(0, 10).map(r => (
                      <Avatar key={r.id} sx={{ width: 28, height: 28, fontSize: 12, bgcolor: '#0b2f5c' }} title={r.user_name}>
                        {r.user_name?.[0] || '?'}
                      </Avatar>
                    ))}
                    {eventRsvps.filter(r => r.status === 'going').length > 10 && (
                      <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: '#e2e8f0', color: '#64748b' }}>
                        +{eventRsvps.filter(r => r.status === 'going').length - 10}
                      </Avatar>
                    )}
                  </Box>
                </Box>
              )}

              {/* RSVP */}
              {selectedEvent.rsvp_enabled && user && !isPast(parseISO(selectedEvent.date)) && (
                <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Your RSVP</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                    {[
                      { status: 'going', label: 'Going', icon: <CheckCircle size={14} />, color: '#16a34a' },
                      { status: 'maybe', label: 'Maybe', icon: <HelpCircle size={14} />, color: '#d97706' },
                      { status: 'not_going', label: "Can't go", icon: <X size={14} />, color: '#dc2626' }
                    ].map(({ status, label, icon, color }) => {
                      const myRsvp = getMyRsvp(selectedEvent.id);
                      const isSelected = myRsvp?.status === status;
                      return (
                        <Button
                          key={status}
                          size="small"
                          variant={isSelected ? 'contained' : 'outlined'}
                          startIcon={icon}
                          onClick={() => rsvpMutation.mutate({ event_id: selectedEvent.id, status })}
                          sx={{
                            flex: 1,
                            ...(isSelected ? { bgcolor: color, borderColor: color, '&:hover': { bgcolor: color + 'dd' } } : { borderColor: color, color })
                          }}
                        >
                          {label}
                        </Button>
                      );
                    })}
                  </Box>
                  <TextField
                    fullWidth size="small"
                    placeholder="Add a note (optional)..."
                    value={rsvpNote}
                    onChange={e => setRsvpNote(e.target.value)}
                  />
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedEvent(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}