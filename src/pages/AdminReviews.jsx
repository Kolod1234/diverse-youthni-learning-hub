import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Box, Container, Typography, Card, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'sonner';

export default function AdminReviews() {
  const [user, setUser] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['all-reviews-admin'],
    queryFn: () => base44.entities.Review.list('-created_date', 500),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Review.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-reviews-admin']);
      setEditDialog(false);
      setEditingReview(null);
      toast.success('Review updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Review.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-reviews-admin']);
      toast.success('Review deleted');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateMutation.mutate({
      id: editingReview.id,
      data: {
        rating: parseInt(formData.get('rating')),
        comment: formData.get('comment'),
        user_name: formData.get('user_name'),
      },
    });
  };

  if (user?.role !== 'admin') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">Admin access required</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>Review Management</Typography>
          <Typography color="text.secondary">Edit and manage all user reviews</Typography>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#4f46e5' }} />
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            {reviews.map((review) => (
              <Card key={review.id} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                    onClick={() => { setEditingReview(review); setEditDialog(true); }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
                    onClick={() => {
                      if (confirm('Delete this review?')) {
                        deleteMutation.mutate(review.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ display: 'flex', gap: 0.25 }}>
                    {[...Array(5)].map((_, i) => (
                      i < review.rating
                        ? <StarIcon key={i} sx={{ fontSize: 16, color: '#facc15' }} />
                        : <StarBorderIcon key={i} sx={{ fontSize: 16, color: '#d1d5db' }} />
                    ))}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {review.rating_type || 'course'} review
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 1.5, color: 'text.primary' }}>
                  "{review.comment}"
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                  <Typography variant="caption" fontWeight={500}>
                    {review.user_name || review.created_by}
                  </Typography>
                  <Typography variant="caption">•</Typography>
                  <Typography variant="caption">
                    {new Date(review.created_date).toLocaleDateString()}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Container>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Review</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="User Name"
                name="user_name"
                defaultValue={editingReview?.user_name || editingReview?.created_by || ''}
                required
                fullWidth
              />
              <TextField
                label="Rating (1-5)"
                name="rating"
                type="number"
                inputProps={{ min: 1, max: 5 }}
                defaultValue={editingReview?.rating || 5}
                required
                fullWidth
              />
              <TextField
                label="Comment"
                name="comment"
                multiline
                rows={4}
                defaultValue={editingReview?.comment || ''}
                required
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save Changes</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}