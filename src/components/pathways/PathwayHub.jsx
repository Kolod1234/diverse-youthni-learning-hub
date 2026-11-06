import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Box, Button, Card, Container, Typography } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ExploreIcon from '@mui/icons-material/Explore';
import DescriptionIcon from '@mui/icons-material/Description';
import VideocamIcon from '@mui/icons-material/Videocam';
import SchoolIcon from '@mui/icons-material/School';
import ScienceIcon from '@mui/icons-material/Science';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FlagIcon from '@mui/icons-material/Flag';
import EventIcon from '@mui/icons-material/Event';
import ForumIcon from '@mui/icons-material/Forum';
import ChatIcon from '@mui/icons-material/Chat';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { createPageUrl } from '@/utils';
import { roleHome } from '@/components/layout/MainNav';
import PathwayCards from '@/components/pathways/PathwayCards';
import { PATHWAYS, getPathways, pathwayById, savePathways, takePendingPathway } from '@/components/pathways/pathways';

// Stage 1 "My hub": what a signed-in person sees on Home. One block of services per chosen
// pathway, then the things everyone shares, then the other pathways (still open to them).

const tile = (to, title, text, Icon) => ({ to, title, text, Icon });

function servicesFor(id, myLearningTo) {
  if (id === 'learning') return [
    tile(myLearningTo, 'My learning', 'Your courses and what to do next.', MenuBookIcon),
    tile(createPageUrl('Explore'), 'Explore courses', 'Maths, sciences, English and more.', ExploreIcon),
    tile(createPageUrl('CCEAPastPapers'), 'CCEA past papers', 'Practise with real exam questions.', DescriptionIcon),
    tile(createPageUrl('Sessions'), 'Live sessions', 'Join a session with a tutor.', VideocamIcon),
    tile(createPageUrl('Tutors'), 'Tutors', 'Find a tutor and book help.', SchoolIcon),
    tile('/laboratory', 'Virtual laboratory', 'Try science experiments online.', ScienceIcon),
  ];
  if (id === 'youth_work') return [
    tile(createPageUrl('YouthWork'), 'Qualifications and courses', 'Your OCN units and progress.', WorkspacesIcon),
    tile(createPageUrl('YouthWorkWorkbook'), 'My workbooks', 'Complete your workbook tasks.', AssignmentIcon),
    tile(createPageUrl('YouthWorkLanding'), 'About Youth Work', 'How the OCN pathway works.', InfoOutlinedIcon),
  ];
  if (id === 'leadership') return [
    tile(createPageUrl('Programs'), 'Programmes', 'Your programme, activities, rota and logbook.', FlagIcon),
    tile(createPageUrl('Events'), 'Events', 'Upcoming activities and trips.', EventIcon),
    tile(createPageUrl('LeadershipLanding'), 'About the programme', 'Mentoring and personal development.', InfoOutlinedIcon),
  ];
  return [];
}

const SHARED = [
  tile(createPageUrl('Community'), 'Community', 'News, challenges and the art gallery.', ForumIcon),
  tile(createPageUrl('Events'), 'Events', 'What is coming up.', EventIcon),
  tile(createPageUrl('MessageCenter'), 'Messages', 'Talk to your tutors and mentors.', ChatIcon),
  tile(createPageUrl('Achievements'), 'Achievements', 'Badges and certificates you have earned.', EmojiEventsIcon),
  tile(createPageUrl('Profile'), 'My profile', 'Your details and settings.', PersonIcon),
];

function TileGrid({ tiles }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
      {tiles.map(t => (
        <Card key={t.title} component={Link} to={t.to}
          sx={{ p: 2.5, display: 'flex', gap: 2, alignItems: 'flex-start', textDecoration: 'none', color: 'inherit',
            '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main', outlineOffset: 2 },
            '@media (hover: hover)': { '&:hover': { boxShadow: 4 } } }}>
          <Box sx={{ flex: '0 0 44px', height: 44, borderRadius: '12px', bgcolor: '#0b2f5c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <t.Icon aria-hidden="true" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700 }}>{t.title}</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.9375rem' }}>{t.text}</Typography>
          </Box>
        </Card>
      ))}
    </Box>
  );
}

const SectionTitle = ({ children }) => (
  <Typography component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 2 }}>{children}</Typography>
);

export default function PathwayHub({ user }) {
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const chosen = getPathways(user);
  const home = roleHome(user);
  const isStaff = home !== 'Dashboard';
  const myLearningTo = createPageUrl('Dashboard') + (isStaff ? '?as=student' : '');
  const firstName = (user?.full_name || '').trim().split(' ')[0];

  const choose = async (id) => {
    setBusyId(id);
    setError('');
    try {
      await savePathways([id]);
      await queryClient.invalidateQueries({ queryKey: ['auth-me'] });
    } catch {
      setError('Your choice could not be saved. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  // Someone who picked a pathway before signing in gets that choice saved once they are back.
  useEffect(() => {
    if (chosen.length) return;
    const pending = takePendingPathway();
    if (pending) choose(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const others = PATHWAYS.filter(p => !chosen.includes(p.id));

  return (
    <Box>
      <Box component="section" sx={{ bgcolor: '#0b2f5c', color: '#fff', py: { xs: 4, md: 5 } }}>
        <Container maxWidth="lg" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Box>
            <Typography component="h1" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 700 }}>
              {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
            </Typography>
            <Typography sx={{ color: '#dbe4f0', fontSize: '1.0625rem' }}>
              {chosen.length
                ? <>Your pathway: <strong>{chosen.map(id => pathwayById(id)?.label).join(', ')}</strong></>
                : 'Choose a pathway to see the services for you.'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {chosen.length > 0 && (
              <Button component={Link} to={createPageUrl('WelcomeCover')} state={{ forceShow: true }} variant="outlined"
                sx={{ borderColor: '#fff', color: '#fff', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}>
                Change pathway
              </Button>
            )}
            {isStaff && (
              <Button component={Link} to={createPageUrl(home)} variant="contained"
                sx={{ bgcolor: '#fff', color: '#0b2f5c', '&:hover': { bgcolor: '#e8edf5' } }}>
                Go to my dashboard
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 }, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {error && <Typography role="alert" color="error">{error}</Typography>}

        {chosen.length === 0 ? (
          <Box component="section">
            <SectionTitle>Choose your pathway</SectionTitle>
            <Typography color="text.secondary" sx={{ mb: 2.5 }}>
              Your pathway decides what you see first. You can change it at any time, and every part of the Hub stays open to you.
            </Typography>
            <PathwayCards onChoose={choose} busyId={busyId} />
          </Box>
        ) : chosen.map(id => (
          <Box component="section" key={id}>
            <SectionTitle>{pathwayById(id).label}</SectionTitle>
            <TileGrid tiles={servicesFor(id, myLearningTo)} />
          </Box>
        ))}

        <Box component="section">
          <SectionTitle>For everyone</SectionTitle>
          <TileGrid tiles={SHARED} />
        </Box>

        {chosen.length > 0 && others.length > 0 && (
          <Box component="section">
            <SectionTitle>Other pathways</SectionTitle>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
              {others.map(p => (
                <Card key={p.id} sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography sx={{ fontWeight: 700 }}>{p.label}</Typography>
                  <Typography color="text.secondary">{p.description}</Typography>
                  <Button component={Link} to={createPageUrl(p.about || p.start)} variant="text" sx={{ alignSelf: 'flex-start', px: 0 }}>
                    Find out more
                  </Button>
                </Card>
              ))}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
