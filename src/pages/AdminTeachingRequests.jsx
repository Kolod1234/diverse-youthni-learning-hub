import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Box, Container, Typography, Card, Button, Chip, Avatar, Stack, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ShieldIcon from '@mui/icons-material/Shield';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { isCourseExplicitlyAssignedToTutor } from '@/components/tutor/tutorAccess';

const normEmail = (v) => (v == null ? '' : String(v).trim().toLowerCase());

export default function AdminTeachingRequests() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('pending');
  const [decisionDialog, setDecisionDialog] = useState(null); // { request, action }
  const [adminResponse, setAdminResponse] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['admin-teaching-requests'],
    queryFn: () => base44.entities.CourseTeachingRequest.list('-created_date', 500),
    enabled: !!user && user.role === 'admin',
  });

  // Decision mutation:
  // - On approve: add the tutor's email to Course.assigned_tutors (the ONLY
  //   place in the app that adds to assigned_tutors via an explicit admin
  //   action) and stamp the request as approved.
  // - On reject: only stamp the request as rejected.
  // Never creates/updates Enrollment.
  const decisionMutation = useMutation({
    mutationFn: async ({ request, action, response }) => {
      if (action === 'approve') {
        const liveCourses = await base44.entities.Course.filter({ id: request.course_id });
        const course = liveCourses[0];
        if (!course) throw new Error('Course no longer exists.');

        const tutorEmail = normEmail(request.tutor_email);
        const current = Array.isArray(course.assigned_tutors) ? course.assigned_tutors : [];
        const already = current.some(e => normEmail(e) === tutorEmail);
        if (!already) {
          if (current.length >= 2) {
            throw new Error('This course already has the maximum of 2 assigned tutors.');
          }
          await base44.entities.Course.update(course.id, {
            assigned_tutors: [...current, request.tutor_email],
          });
        }
      }

      await base44.entities.CourseTeachingRequest.update(request.id, {
        status: action === 'approve' ? 'approved' : 'rejected',
        processed_by: user.email,
        processed_date: new Date().toISOString(),
        admin_response: response || '',
      });
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-teaching-requests'] });
      queryClient.invalidateQueries({ queryKey: ['teaching-request'] });
      queryClient.invalidateQueries({ queryKey: ['course'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success(vars.action === 'approve' ? 'Tutor assigned to course.' : 'Request rejected.');
      setDecisionDialog(null);
      setAdminResponse('');
    },
    onError: (err) => toast.error(err.message || 'Failed to process the request.'),
  });

  if (user === null) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (user.role !== 'admin') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover' }}>
        <Card sx={{ p: 5, maxWidth: 400, textAlign: 'center' }}>
          <ShieldIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>Admin Only</Typography>
          <Typography color="text.secondary">You need admin privileges to access this page.</Typography>
          <Box sx={{ mt: 3 }}>
            <Link to={createPageUrl('Home')} style={{ textDecoration: 'none' }}>
              <Button variant="contained">Go Home</Button>
            </Link>
          </Box>
        </Card>
      </Box>
    );
  }

  const filtered = requests.filter(r => r.status === tab);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>Course Teaching Requests</Typography>
          <Typography color="text.secondary">
            Tutors requesting to be assigned to a specific course. Approving will add the
            tutor's email to that course's assigned_tutors list.
          </Typography>
        </Box>

        <Card sx={{ mb: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
            <Tab value="pending" label={`Pending (${requests.filter(r => r.status === 'pending').length})`} icon={<HourglassEmptyIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
            <Tab value="approved" label={`Approved (${requests.filter(r => r.status === 'approved').length})`} icon={<CheckCircleIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
            <Tab value="rejected" label={`Rejected (${requests.filter(r => r.status === 'rejected').length})`} icon={<CancelIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
          </Tabs>
        </Card>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : filtered.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <SchoolIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
            <Typography color="text.secondary">No {tab} requests.</Typography>
          </Card>
        ) : (
          <Stack spacing={1.5}>
            {filtered.map(req => (
              <Card key={req.id} sx={{ p: 2.5 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent="space-between">
                  <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
                    <Avatar sx={{ bgcolor: '#e0e7ff', color: '#4338ca' }}>{req.tutor_name?.charAt(0) || 'T'}</Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontWeight={600} noWrap>{req.tutor_name || req.tutor_email}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{req.tutor_email}</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Wants to teach: <strong>{req.course_title || req.course_id}</strong>
                      </Typography>
                      {req.message && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                          “{req.message}”
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
                        Submitted {req.created_date ? format(new Date(req.created_date), 'MMM d, yyyy HH:mm') : ''}
                        {req.processed_date && ` · ${req.status} ${format(new Date(req.processed_date), 'MMM d, yyyy')} by ${req.processed_by || 'admin'}`}
                      </Typography>
                      {req.admin_response && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                          Admin note: {req.admin_response}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                  {req.status === 'pending' ? (
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<CancelIcon sx={{ fontSize: 16 }} />}
                        onClick={() => { setDecisionDialog({ request: req, action: 'reject' }); setAdminResponse(''); }}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                        onClick={() => { setDecisionDialog({ request: req, action: 'approve' }); setAdminResponse(''); }}
                        sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
                      >
                        Approve & Assign
                      </Button>
                    </Stack>
                  ) : (
                    <Chip
                      label={req.status}
                      size="small"
                      sx={{
                        bgcolor: req.status === 'approved' ? '#dcfce7' : '#fee2e2',
                        color: req.status === 'approved' ? '#15803d' : '#b91c1c',
                        textTransform: 'capitalize',
                      }}
                    />
                  )}
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Container>

      <Dialog open={!!decisionDialog} onClose={() => setDecisionDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {decisionDialog?.action === 'approve' ? 'Approve and assign tutor?' : 'Reject this request?'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {decisionDialog?.action === 'approve'
              ? `This will add ${decisionDialog?.request?.tutor_email} to "${decisionDialog?.request?.course_title}" assigned tutors. No enrollment record will be created.`
              : `This will mark the request as rejected. No course data will change.`}
          </Typography>
          <TextField
            label="Message to tutor (optional)"
            multiline
            rows={3}
            fullWidth
            value={adminResponse}
            onChange={(e) => setAdminResponse(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDecisionDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            color={decisionDialog?.action === 'approve' ? 'success' : 'error'}
            disabled={decisionMutation.isPending}
            onClick={() => decisionMutation.mutate({
              request: decisionDialog.request,
              action: decisionDialog.action,
              response: adminResponse,
            })}
          >
            {decisionMutation.isPending ? 'Saving…' : (decisionDialog?.action === 'approve' ? 'Approve & Assign' : 'Reject')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}