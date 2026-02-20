import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card, Box, Typography, Button, List, ListItem, ListItemText,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControlLabel, Checkbox
} from '@mui/material';
import { CheckCircle, XCircle, AlertCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ContentReviewWorkflow({ versionId, entityType, entityId }) {
  const queryClient = useQueryClient();
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewComments, setReviewComments] = useState('');
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [criteria, setCriteria] = useState([
    { criterion: 'Accuracy', passed: true, comment: '' },
    { criterion: 'Clarity', passed: true, comment: '' },
    { criterion: 'Completeness', passed: true, comment: '' },
    { criterion: 'Alignment with objectives', passed: true, comment: '' }
  ]);

  const { data: reviews = [] } = useQuery({
    queryKey: ['content-reviews', versionId],
    queryFn: () => base44.entities.ContentReview.filter({ version_id: versionId }, '-created_date')
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      const review = await base44.entities.ContentReview.create(reviewData);
      
      // Update version status
      await base44.entities.ContentVersion.update(versionId, {
        review_status: reviewStatus
      });
      
      return review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['content-reviews']);
      queryClient.invalidateQueries(['content-versions']);
      toast.success('Review submitted!');
      setShowReviewDialog(false);
      setReviewComments('');
    }
  });

  const handleSubmitReview = async () => {
    const user = await base44.auth.me();
    
    submitReviewMutation.mutate({
      version_id: versionId,
      entity_type: entityType,
      entity_id: entityId,
      reviewer_email: user.email,
      reviewer_name: user.full_name,
      status: reviewStatus,
      review_criteria: criteria,
      comments: reviewComments,
      reviewed_date: new Date().toISOString()
    });
  };

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Content Reviews</Typography>
        <Button
          variant="contained"
          startIcon={<Send className="w-4 h-4" />}
          onClick={() => setShowReviewDialog(true)}
        >
          Submit Review
        </Button>
      </Box>

      <List>
        {reviews.map((review) => (
          <ListItem
            key={review.id}
            sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {review.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-600" />}
              {review.status === 'rejected' && <XCircle className="w-4 h-4 text-red-600" />}
              {review.status === 'needs_changes' && <AlertCircle className="w-4 h-4 text-orange-600" />}
              <Typography variant="subtitle2">{review.reviewer_name}</Typography>
              <Chip label={review.status} size="small" color={
                review.status === 'approved' ? 'success' : 
                review.status === 'rejected' ? 'error' : 'warning'
              } />
            </Box>
            <Typography variant="body2" sx={{ mb: 1 }}>{review.comments}</Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(review.reviewed_date).toLocaleDateString()}
            </Typography>
          </ListItem>
        ))}
        {reviews.length === 0 && (
          <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
            No reviews yet
          </Typography>
        )}
      </List>

      <Dialog open={showReviewDialog} onClose={() => setShowReviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Submit Content Review</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>Review Criteria</Typography>
            {criteria.map((item, idx) => (
              <Box key={idx} sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={item.passed}
                      onChange={(e) => {
                        const updated = [...criteria];
                        updated[idx].passed = e.target.checked;
                        setCriteria(updated);
                      }}
                    />
                  }
                  label={item.criterion}
                />
                <TextField
                  size="small"
                  placeholder="Comment"
                  value={item.comment}
                  onChange={(e) => {
                    const updated = [...criteria];
                    updated[idx].comment = e.target.value;
                    setCriteria(updated);
                  }}
                  fullWidth
                  sx={{ ml: 4 }}
                />
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Overall Decision</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={reviewStatus === 'approved' ? 'contained' : 'outlined'}
                color="success"
                onClick={() => setReviewStatus('approved')}
              >
                Approve
              </Button>
              <Button
                variant={reviewStatus === 'needs_changes' ? 'contained' : 'outlined'}
                color="warning"
                onClick={() => setReviewStatus('needs_changes')}
              >
                Needs Changes
              </Button>
              <Button
                variant={reviewStatus === 'rejected' ? 'contained' : 'outlined'}
                color="error"
                onClick={() => setReviewStatus('rejected')}
              >
                Reject
              </Button>
            </Box>
          </Box>

          <TextField
            label="Review Comments"
            multiline
            rows={4}
            value={reviewComments}
            onChange={(e) => setReviewComments(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReviewDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitReview}
            disabled={submitReviewMutation.isPending}
          >
            {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}