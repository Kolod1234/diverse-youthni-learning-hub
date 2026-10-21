import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Card, Container, Typography } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import { createPageUrl } from '@/utils';

// Shown in place of features that aren't finished yet, so nobody lands on a broken or blank screen.
export const COMING_SOON_PAGES = {
  ProjectGallery: { title: 'Project gallery', text: 'A place to show off and browse student projects.' },
  ProjectDetail: { title: 'Project gallery', text: 'A place to show off and browse student projects.' },
  CreationHub: { title: 'Creation hub', text: 'Submit your own projects to share with the community.' },
  AdminProjectSubmissions: { title: 'Project submissions', text: 'Review and approve projects students submit.' },
};

// Detail pages that only make sense for one chosen item (?id=...). Opened bare, they point back to the list.
export const NEEDS_ITEM = {
  ChallengePlayer: { what: 'a challenge', back: 'Challenges', backLabel: 'See challenges' },
  AcademyPlayer: { what: 'an academy', back: 'AcademyExplore', backLabel: 'Browse academies' },
  GroupProjectWorkspace: { what: 'a group project', back: 'Community', backLabel: 'Go to Community' },
  StudyGroupDetail: { what: 'a study group', back: 'Community', backLabel: 'Go to Community' },
};

export default function ComingSoon({ title, text, actionLabel = 'Back to Home', actionTo = createPageUrl('Home'), badge = 'Coming soon' }) {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
      <Card sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>
        <Box sx={{ width: 64, height: 64, mx: 'auto', mb: 2, borderRadius: '50%', bgcolor: '#0b2f5c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ConstructionIcon />
        </Box>
        {badge && (
          <Typography component="span" sx={{ display: 'inline-block', mb: 1.5, px: 1.5, py: 0.25, borderRadius: 999, bgcolor: '#fbbf24', color: '#1a1a1a', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {badge}
          </Typography>
        )}
        <Typography variant="h4" component="h1" fontWeight={700} sx={{ mb: 1 }}>{title}</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>{text}</Typography>
        <Button component={Link} to={actionTo} variant="contained" size="large">{actionLabel}</Button>
      </Card>
    </Container>
  );
}
