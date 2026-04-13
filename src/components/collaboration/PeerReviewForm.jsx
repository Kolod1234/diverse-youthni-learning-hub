import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, TextField, Button, Box, Typography, Rating, Chip, Stack } from '@mui/material';
import { Star, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function PeerReviewForm({ submission, onComplete }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [strengths, setStrengths] = useState(['']);
  const [improvements, setImprovements] = useState(['']);
  const [criteriaScores, setCriteriaScores] = useState([
    { criterion: 'Quality', score: 0, comment: '' },
    { criterion: 'Originality', score: 0, comment: '' },
    { criterion: 'Completeness', score: 0, comment: '' }
  ]);

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      return await base44.entities.PeerReview.create(reviewData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['peer-reviews']);
      toast.success('Peer review submitted!');
      onComplete?.();
    }
  });

  const handleSubmit = () => {
    if (!feedback.trim() || rating === 0) {
      toast.error('Please provide a rating and feedback');
      return;
    }

    submitReviewMutation.mutate({
      submission_id: submission.id,
      reviewee_email: submission.student_email,
      course_id: submission.course_id || submission.assignment?.course_id,
      rating,
      feedback,
      criteria_scores: criteriaScores,
      strengths: strengths.filter(s => s.trim()),
      improvements: improvements.filter(i => i.trim()),
      status: 'submitted'
    });
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Peer Review</Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Overall Rating</Typography>
        <Rating
          value={rating}
          onChange={(e, newValue) => setRating(newValue)}
          size="large"
          icon={<Star className="w-6 h-6" fill="currentColor" />}
          emptyIcon={<Star className="w-6 h-6" />}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Criteria Scores</Typography>
        {criteriaScores.map((criteria, idx) => (
          <Box key={idx} sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>{criteria.criterion}</Typography>
            <Rating
              value={criteria.score}
              onChange={(e, newValue) => {
                const updated = [...criteriaScores];
                updated[idx].score = newValue;
                setCriteriaScores(updated);
              }}
            />
            <TextField
              size="small"
              placeholder={`Comment on ${criteria.criterion.toLowerCase()}`}
              value={criteria.comment}
              onChange={(e) => {
                const updated = [...criteriaScores];
                updated[idx].comment = e.target.value;
                setCriteriaScores(updated);
              }}
              fullWidth
              sx={{ mt: 1 }}
            />
          </Box>
        ))}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Strengths</Typography>
        {strengths.map((strength, idx) => (
          <TextField
            key={idx}
            size="small"
            placeholder={`Strength ${idx + 1}`}
            value={strength}
            onChange={(e) => {
              const updated = [...strengths];
              updated[idx] = e.target.value;
              setStrengths(updated);
            }}
            fullWidth
            sx={{ mb: 1 }}
          />
        ))}
        <Button size="small" onClick={() => setStrengths([...strengths, ''])}>
          + Add Strength
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Areas for Improvement</Typography>
        {improvements.map((improvement, idx) => (
          <TextField
            key={idx}
            size="small"
            placeholder={`Improvement ${idx + 1}`}
            value={improvement}
            onChange={(e) => {
              const updated = [...improvements];
              updated[idx] = e.target.value;
              setImprovements(updated);
            }}
            fullWidth
            sx={{ mb: 1 }}
          />
        ))}
        <Button size="small" onClick={() => setImprovements([...improvements, ''])}>
          + Add Improvement
        </Button>
      </Box>

      <TextField
        label="Detailed Feedback"
        multiline
        rows={4}
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        fullWidth
        sx={{ mb: 3 }}
      />

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={submitReviewMutation.isPending}
        startIcon={<Send className="w-4 h-4" />}
        fullWidth
      >
        {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
      </Button>
    </Card>
  );
}