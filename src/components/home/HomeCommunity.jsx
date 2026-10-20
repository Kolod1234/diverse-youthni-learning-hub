import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Card, Container, Typography } from '@mui/material';
import { createPageUrl } from '@/utils';

const Heading = ({ children, action }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 1, mb: 2 }}>
    <Typography component="h2" sx={{ fontSize: '1.625rem', fontWeight: 700 }}>{children}</Typography>
    {action}
  </Box>
);

// Redesign: lower half of Home — real community photos, real reviews, latest news, partner banner.
export default function HomeCommunity({ photos = [], reviews = [], posts = [] }) {
  const shownReviews = reviews.filter(r => r.comment && r.rating >= 4).slice(0, 3);
  return (
    <Container maxWidth="lg" sx={{ pb: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {photos.length > 0 && (
        <Box component="section">
          <Heading>Life at Diverse Youth NI</Heading>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5 }}>
            {photos.slice(0, 6).map((p, i) => (
              <Box key={p.id || i} component="img" src={p.image_url} alt="Diverse Youth NI session" loading="lazy"
                sx={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: '14px', display: 'block', bgcolor: 'action.hover' }} />
            ))}
          </Box>
        </Box>
      )}

      {shownReviews.length > 0 && (
        <Box component="section">
          <Heading>What learners say</Heading>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
            {shownReviews.map(r => (
              <Card key={r.id} sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography sx={{ color: '#d97706', letterSpacing: 2 }} aria-label={`${r.rating} out of 5 stars`}>{'★'.repeat(Math.round(r.rating))}</Typography>
                <Typography>“{r.comment}”</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>{r.user_name || 'Learner'}</Typography>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {posts.length > 0 && (
        <Box component="section">
          <Heading>Latest news</Heading>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
            {posts.slice(0, 3).map(p => (
              <Card key={p.id} sx={{ overflow: 'hidden' }}>
                {p.featured_image && <Box component="img" src={p.featured_image} alt="" loading="lazy" sx={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block' }} />}
                <Box sx={{ p: 2 }}>
                  <Typography sx={{ fontWeight: 700 }}>{p.title}</Typography>
                  {p.read_time_minutes ? <Typography variant="body2" color="text.secondary">{p.read_time_minutes} min read</Typography> : null}
                </Box>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      <Box component="section" sx={{ bgcolor: '#0b2f5c', color: '#fff', borderRadius: '14px', p: { xs: 3, md: 4 }, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 700 }}>Are you a school or after-school centre?</Typography>
          <Typography sx={{ color: '#dbe4f0' }}>Partner with us for free seats and your own dashboard. Coming soon.</Typography>
        </Box>
        <Button component={Link} to={createPageUrl('ContactUs')} variant="contained" color="secondary">Talk to us</Button>
      </Box>
    </Container>
  );
}
