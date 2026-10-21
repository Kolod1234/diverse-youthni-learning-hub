import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Card, Container, Tab, Tabs } from '@mui/material';
import { createPageUrl } from '@/utils';

// Redesign (wireframes L4, L6, L7, L8): related pages shown as tabs of one section.
// Each tab is its own page, so nothing about how those pages work changes.
export const SECTIONS = [
  { name: 'Live sessions', staffOnly: false, tabs: [['Sessions', 'Upcoming'], ['Tutors', 'Tutors'], ['Events', 'Events'], ['SessionRecordings', 'Recordings']] },
  { name: 'Community', staffOnly: false, side: true, tabs: [['Community', 'Feed'], ['Challenges', 'Challenges'], ['ArtGallery', 'Art gallery'], ['MessageCenter', 'Messages'], ['NotificationCenter', 'Notifications']] },
  { name: 'My account', staffOnly: false, side: true, tabs: [['Profile', 'Profile'], ['Achievements', 'Achievements'], ['Settings', 'Settings']] },
  { name: 'Tutor', staffOnly: true, tabs: [['TutorDashboardOverview', 'Overview'], ['TutorSessionsDashboard', 'Sessions'], ['TutorCourseManager', 'Courses'], ['TutorBookingManager', 'Bookings'], ['GradeAssignments', 'Marking'], ['StudentAnalytics', 'Analytics']] },
];

export function sectionFor(pageName, user) {
  const isStaff = user?.role === 'admin' || user?.is_tutor === true;
  return SECTIONS.find(s => (!s.staffOnly || isStaff) && s.tabs.some(([p]) => p === pageName)) || null;
}

// Wireframes L7 and L8: Community and My account use a menu on the left on wider screens.
export function SectionSideNav({ section, current }) {
  return (
    <Card component="nav" aria-label={section.name}
      sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 0.25, flex: '0 0 220px', alignSelf: 'flex-start', position: 'sticky', top: 88, p: 1.5, mt: 3, ml: 3 }}>
      {section.tabs.map(([page, label]) => {
        const on = current === page;
        return (
          <Button key={page} component={Link} to={createPageUrl(page)} fullWidth aria-current={on ? 'page' : undefined}
            sx={{ justifyContent: 'flex-start', minHeight: 44, px: 1.5, fontWeight: on ? 700 : 400,
              color: on ? 'primary.main' : 'text.primary', bgcolor: on ? 'rgba(79,70,229,0.10)' : 'transparent' }}>
            {label}
          </Button>
        );
      })}
    </Card>
  );
}

export default function SectionTabs({ section, current }) {
  if (!section) return null;
  return (
    <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', display: section.side ? { xs: 'block', md: 'none' } : 'block' }}>
      <Container maxWidth="lg">
        <Tabs value={current} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile aria-label={section.name}>
          {section.tabs.map(([page, label]) => (
            <Tab key={page} value={page} label={label} component={Link} to={createPageUrl(page)} />
          ))}
        </Tabs>
      </Container>
    </Box>
  );
}
