import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Box, Typography, Chip
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { toast } from 'sonner';
import { isCourseExplicitlyAssignedToTutor } from '@/components/tutor/tutorAccess';

const normEmail = (v) => (v == null ? '' : String(v).trim().toLowerCase());

/**
 * RequestToTeachButton — for users with is_tutor === true who are not yet
 * assigned to a given course. Creates a CourseTeachingRequest with status
 * "pending". Never updates Course.assigned_tutors and never creates an
 * Enrollment — admin approval (in AdminTeachingRequests) is the only path
 * that can actually assign the tutor.
 */
export default function RequestToTeachButton({ course, user }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  // Server-side filter: requests this tutor has made for this course.
  const { data: existingRequests = [], isLoading } = useQuery({
    queryKey: ['teaching-request', course?.id, user?.email],
    queryFn: () => base44.entities.CourseTeachingRequest.filter({
      course_id: course.id,
      tutor_email: user.email,
    }, '-created_date', 10),
    enabled: !!course?.id && !!user?.email,
  });

  const pendingRequest = existingRequests.find(r => r.status === 'pending') || null;
  const approvedRequest = existingRequests.find(r => r.status === 'approved') || null;
  const alreadyAssigned = isCourseExplicitlyAssignedToTutor(course, user);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Final guard before insert: re-check both conditions so a duplicate
      // pending request or a request for an already-assigned course can't
      // sneak through if the local cache is stale.
      const liveCourse = (await base44.entities.Course.filter({ id: course.id }))[0];
      if (liveCourse && isCourseExplicitlyAssignedToTutor(liveCourse, user)) {
        throw new Error('You are already assigned to this course.');
      }
      const live = await base44.entities.CourseTeachingRequest.filter({
        course_id: course.id,
        tutor_email: normEmail(user.email),
      }, '-created_date', 50);
      if (live.some(r => r.status === 'pending')) {
        throw new Error('You already have a pending request for this course.');
      }
      return base44.entities.CourseTeachingRequest.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teaching-request', course.id, user.email] });
      queryClient.invalidateQueries({ queryKey: ['admin-teaching-requests'] });
      toast.success('Request sent. An admin will review it.');
      setOpen(false);
      setMessage('');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to send request.');
    },
  });

  const handleSubmit = () => {
    createMutation.mutate({
      course_id: course.id,
      course_title: course.title || '',
      tutor_email: normEmail(user.email),
      tutor_name: user.full_name || '',
      message: message.trim(),
      status: 'pending',
    });
  };

  if (alreadyAssigned) {
    return (
      <Chip
        icon={<CheckCircleIcon />}
        label="You are assigned to this course"
        sx={{ bgcolor: '#dcfce7', color: '#15803d', width: '100%', py: 2.5, fontWeight: 600 }}
      />
    );
  }

  if (pendingRequest) {
    return (
      <Chip
        icon={<HourglassEmptyIcon />}
        label="Request pending admin review"
        sx={{ bgcolor: '#fef3c7', color: '#a16207', width: '100%', py: 2.5, fontWeight: 600 }}
      />
    );
  }

  return (
    <>
      <Button
        variant="contained"
        fullWidth
        size="large"
        startIcon={<SchoolIcon />}
        onClick={() => setOpen(true)}
        disabled={isLoading}
        sx={{ py: 2, fontSize: '1.125rem', borderRadius: 3 }}
      >
        Request to Teach
      </Button>
      {approvedRequest && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
          A previous request was approved but you are no longer in the assigned tutors list. Submit a new request if needed.
        </Typography>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request to teach this course</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              You are requesting to be assigned as a tutor on <strong>{course.title}</strong>.
              An admin will review and respond. You will not be enrolled as a learner
              and you will not be assigned to the course until an admin approves.
            </Typography>
            <TextField
              label="Message to admin (optional)"
              multiline
              rows={4}
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Briefly explain why you would be a good fit to teach this course."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Sending…' : 'Send request'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}