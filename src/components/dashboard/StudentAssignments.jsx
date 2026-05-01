import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, Box, Button, Typography, Chip, Stack, TextField, Skeleton } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UploadIcon from '@mui/icons-material/Upload';
import SendIcon from '@mui/icons-material/Send';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentAssignments({ enrollments, user }) {
  const [expandedAssignment, setExpandedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const queryClient = useQueryClient();

  const courseIds = enrollments.map(e => e.course_id);

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['student-assignments', courseIds.join(',')],
    queryFn: async () => {
      if (courseIds.length === 0) return [];
      const results = await Promise.all(
        courseIds.map(id => base44.entities.Assignment.filter({ course_id: id, is_published: true }, '-due_date', 50))
      );
      return results.flat();
    },
    enabled: courseIds.length > 0,
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['student-submissions', user?.email],
    queryFn: () => base44.entities.Submission.filter({ student_email: user?.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.Submission.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['student-submissions']);
      toast.success('Assignment submitted!');
    },
  });

  const handleFileUpload = async (e, assignmentId) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFiles(prev => ({
        ...prev,
        [assignmentId]: [...(prev[assignmentId] || []), { name: file.name, url: file_url }]
      }));
      toast.success('File uploaded!');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (assignment) => {
    const text = submissionText[assignment.id] || '';
    const files = uploadedFiles[assignment.id] || [];
    if (!text && files.length === 0) {
      toast.error('Please add some content or files before submitting');
      return;
    }
    submitMutation.mutate({
      assignment_id: assignment.id,
      student_email: user?.email,
      student_name: user?.full_name,
      content: text,
      file_urls: files.map(f => f.url),
      submitted_date: new Date().toISOString(),
    });
    setExpandedAssignment(null);
  };

  const getSubmission = (assignmentId) => submissions.find(s => s.assignment_id === assignmentId);
  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

  if (isLoading) {
    return (
      <Stack spacing={1.5}>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 2 }} />
        ))}
      </Stack>
    );
  }

  if (assignments.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 7, bgcolor: 'action.hover', borderRadius: 4 }}>
        <DescriptionIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
        <Typography variant="body1" fontWeight={500} sx={{ color: 'text.secondary' }}>
          No assignments yet
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.disabled', mt: 0.5 }}>
          Assignments from your enrolled courses will appear here
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5}>
      {assignments.map((assignment, i) => {
        const submission = getSubmission(assignment.id);
        const overdue = isOverdue(assignment.due_date) && !submission;
        const isExpanded = expandedAssignment === assignment.id;
        const borderColor = overdue ? '#fecaca' : submission ? '#bbf7d0' : 'divider';
        const iconBg = submission ? '#dcfce7' : overdue ? '#fee2e2' : '#dbeafe';
        const iconColor = submission ? '#16a34a' : overdue ? '#dc2626' : '#2563eb';

        return (
          <motion.div
            key={assignment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card sx={{ overflow: 'hidden', border: 1, borderColor, boxShadow: 0 }}>
              <Box
                onClick={() => setExpandedAssignment(isExpanded ? null : assignment.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  transition: 'background-color 0.15s',
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2.5,
                    bgcolor: iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {submission ? (
                    <CheckCircleIcon sx={{ fontSize: 20, color: iconColor }} />
                  ) : (
                    <DescriptionIcon sx={{ fontSize: 20, color: iconColor }} />
                  )}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ color: 'text.primary' }}>
                      {assignment.title}
                    </Typography>
                    {submission ? (
                      <Chip label="Submitted" size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#dcfce7', color: '#15803d' }} />
                    ) : overdue ? (
                      <Chip label="Overdue" size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#fee2e2', color: '#b91c1c' }} />
                    ) : (
                      <Chip label="Pending" size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#dbeafe', color: '#1d4ed8' }} />
                    )}
                    {submission?.is_graded && (
                      <Chip
                        label={`Graded: ${submission.grade}/${assignment.total_points}`}
                        size="small"
                        sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#f3e8ff', color: '#7e22ce' }}
                      />
                    )}
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.5, color: 'text.secondary' }}>
                    {assignment.due_date && (
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <AccessTimeIcon sx={{ fontSize: 12 }} />
                        <Typography variant="caption">
                          Due {new Date(assignment.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Typography>
                      </Stack>
                    )}
                    <Typography variant="caption">{assignment.total_points || 100} pts</Typography>
                  </Stack>
                </Box>

                {isExpanded
                  ? <KeyboardArrowUpIcon sx={{ fontSize: 18, color: 'text.disabled', flexShrink: 0 }} />
                  : <KeyboardArrowDownIcon sx={{ fontSize: 18, color: 'text.disabled', flexShrink: 0 }} />}
              </Box>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <Box sx={{ px: 2, pb: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Stack spacing={2}>
                        {assignment.description && (
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {assignment.description}
                          </Typography>
                        )}

                        {submission ? (
                          <Box sx={{ bgcolor: '#f0fdf4', border: 1, borderColor: '#bbf7d0', borderRadius: 2, p: 2 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <CheckCircleIcon sx={{ fontSize: 16, color: '#15803d' }} />
                              <Typography variant="body2" fontWeight={600} sx={{ color: '#15803d' }}>
                                Your Submission
                              </Typography>
                            </Stack>
                            {submission.content && (
                              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                {submission.content}
                              </Typography>
                            )}
                            {submission.file_urls?.length > 0 && (
                              <Stack spacing={0.5} sx={{ mt: 1 }}>
                                {submission.file_urls.map((url, j) => (
                                  <Typography
                                    key={j}
                                    component="a"
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="caption"
                                    sx={{ color: '#2563eb', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                                  >
                                    Attachment {j + 1}
                                  </Typography>
                                ))}
                              </Stack>
                            )}
                            {submission.feedback && (
                              <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: '#bbf7d0' }}>
                                <Typography variant="caption" fontWeight={600} sx={{ color: '#15803d' }}>
                                  Tutor Feedback:
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                  {submission.feedback}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        ) : (
                          <Stack spacing={1.5}>
                            <TextField
                              multiline
                              rows={4}
                              placeholder="Write your response here..."
                              value={submissionText[assignment.id] || ''}
                              onChange={(e) => setSubmissionText(prev => ({ ...prev, [assignment.id]: e.target.value }))}
                              fullWidth
                            />
                            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
                              <Button
                                component="label"
                                variant="outlined"
                                size="small"
                                startIcon={<UploadIcon sx={{ fontSize: 14 }} />}
                                disabled={uploading}
                              >
                                {uploading ? 'Uploading...' : 'Attach File'}
                                <input
                                  type="file"
                                  hidden
                                  onChange={(e) => handleFileUpload(e, assignment.id)}
                                  disabled={uploading}
                                />
                              </Button>
                              {(uploadedFiles[assignment.id] || []).map((f, j) => (
                                <Chip key={j} label={f.name} size="small" sx={{ height: 22, fontSize: '0.7rem' }} />
                              ))}
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<SendIcon sx={{ fontSize: 14 }} />}
                                onClick={() => handleSubmit(assignment)}
                                disabled={submitMutation.isPending}
                                sx={{ ml: 'auto', bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}
                              >
                                {submitMutation.isPending ? 'Submitting...' : 'Submit'}
                              </Button>
                            </Stack>
                          </Stack>
                        )}
                      </Stack>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        );
      })}
    </Stack>
  );
}