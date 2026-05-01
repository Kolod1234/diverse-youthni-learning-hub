import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, Button, Chip, TextField, Box, Typography, Stack, IconButton, Collapse } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UploadIcon from '@mui/icons-material/Upload';
import SendIcon from '@mui/icons-material/Send';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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
          <Box key={i} sx={{ height: 80, bgcolor: 'action.hover', borderRadius: 3 }} className="animate-pulse" />
        ))}
      </Stack>
    );
  }

  if (assignments.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 7, bgcolor: 'action.hover', borderRadius: 4 }}>
        <DescriptionIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1.5 }} />
        <Typography fontWeight={500} color="text.secondary">No assignments yet</Typography>
        <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
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
        const borderColor = overdue ? 'error.light' : submission ? 'success.light' : 'divider';

        return (
          <motion.div
            key={assignment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card sx={{ overflow: 'hidden', border: 1, borderColor }}>
              <Box
                onClick={() => setExpandedAssignment(isExpanded ? null : assignment.id)}
                sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
              >
                <Box sx={{ width: 40, height: 40, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, bgcolor: submission ? '#d1fae5' : overdue ? '#fee2e2' : '#dbeafe' }}>
                  {submission ? (
                    <CheckCircleIcon sx={{ fontSize: 20, color: '#059669' }} />
                  ) : (
                    <DescriptionIcon sx={{ fontSize: 20, color: overdue ? '#dc2626' : '#2563eb' }} />
                  )}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Typography fontWeight={600} noWrap>{assignment.title}</Typography>
                    {submission ? (
                      <Chip label="Submitted" size="small" sx={{ bgcolor: '#d1fae5', color: '#059669', height: 20, fontSize: '0.65rem' }} />
                    ) : overdue ? (
                      <Chip label="Overdue" size="small" sx={{ bgcolor: '#fee2e2', color: '#dc2626', height: 20, fontSize: '0.65rem' }} />
                    ) : (
                      <Chip label="Pending" size="small" sx={{ bgcolor: '#dbeafe', color: '#2563eb', height: 20, fontSize: '0.65rem' }} />
                    )}
                    {submission?.is_graded && (
                      <Chip label={`Graded: ${submission.grade}/${assignment.total_points}`} size="small" sx={{ bgcolor: '#f3e8ff', color: '#7c3aed', height: 20, fontSize: '0.65rem' }} />
                    )}
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.5, color: 'text.secondary' }}>
                    {assignment.due_date && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <AccessTimeIcon sx={{ fontSize: 12 }} />
                        <Typography variant="caption">
                          Due {new Date(assignment.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Typography>
                      </Stack>
                    )}
                    <Typography variant="caption">{assignment.total_points || 100} pts</Typography>
                  </Stack>
                </Box>

                <IconButton size="small" sx={{ flexShrink: 0 }}>
                  {isExpanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                </IconButton>
              </Box>

              <Collapse in={isExpanded}>
                <Box sx={{ px: 2, pb: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  {assignment.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{assignment.description}</Typography>
                  )}

                  {submission ? (
                    <Box sx={{ bgcolor: '#f0fdf4', border: 1, borderColor: '#bbf7d0', borderRadius: 3, p: 2 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: '#15803d' }} />
                        <Typography variant="body2" fontWeight={600} sx={{ color: '#15803d' }}>Your Submission</Typography>
                      </Stack>
                      {submission.content && <Typography variant="body2" sx={{ mt: 1 }}>{submission.content}</Typography>}
                      {submission.file_urls?.length > 0 && (
                        <Stack spacing={0.5} sx={{ mt: 1 }}>
                          {submission.file_urls.map((url, idx) => (
                            <Typography key={idx} component="a" href={url} target="_blank" rel="noopener noreferrer" variant="caption" sx={{ color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}>
                              Attachment {idx + 1}
                            </Typography>
                          ))}
                        </Stack>
                      )}
                      {submission.feedback && (
                        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: '#bbf7d0' }}>
                          <Typography variant="caption" fontWeight={600} sx={{ color: '#15803d' }}>Tutor Feedback:</Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>{submission.feedback}</Typography>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Stack spacing={1.5}>
                      <TextField
                        multiline
                        rows={4}
                        fullWidth
                        placeholder="Write your response here..."
                        value={submissionText[assignment.id] || ''}
                        onChange={(e) => setSubmissionText(prev => ({ ...prev, [assignment.id]: e.target.value }))}
                      />
                      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Button
                          component="label"
                          variant="outlined"
                          size="small"
                          startIcon={<UploadIcon sx={{ fontSize: 14 }} />}
                          disabled={uploading}
                        >
                          {uploading ? 'Uploading...' : 'Attach File'}
                          <input type="file" hidden onChange={(e) => handleFileUpload(e, assignment.id)} disabled={uploading} />
                        </Button>
                        {(uploadedFiles[assignment.id] || []).map((f, idx) => (
                          <Chip key={idx} label={f.name} size="small" variant="outlined" />
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
                </Box>
              </Collapse>
            </Card>
          </motion.div>
        );
      })}
    </Stack>
  );
}