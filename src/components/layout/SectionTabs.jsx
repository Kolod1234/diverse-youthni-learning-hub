import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Tab, Tabs } from '@mui/material';
import { createPageUrl } from '@/utils';

// Redesign (wireframes L4, L6, L7, L8): related pages shown as tabs of one section.
// Each tab is its own page, so nothing about how those pages work changes.
export const SECTIONS = [
  { name: 'Live sessions', staffOnly: false, tabs: [['Sessions', 'Upcoming'], ['Tutors', 'Tutors'], ['Events', 'Events'], ['SessionRecordings', 'Recordings']] },
  { name: 'Community', staffOnly: false, tabs: [['Community', 'Feed'], ['Challenges', 'Challenges'], ['ArtGallery', 'Art gallery'], ['MessageCenter', 'Messages'], ['NotificationCenter', 'Notifications']] },
  { name: 'My account', staffOnly: false, tabs: [['Profile', 'Profile'], ['Achievements', 'Achievements'], ['Settings', 'Settings']] },
  { name: 'Tutor', staffOnly: true, tabs: [['TutorDashboardOverview', 'Overview'], ['TutorSessionsDashboard', 'Sessions'], ['TutorCourseManager', 'Courses'], ['TutorBookingManager', 'Bookings'], ['GradeAssignments', 'Marking'], ['StudentAnalytics', 'Analytics']] },
];

export function sectionFor(pageName, user) {
  const isStaff = user?.role === 'admin' || user?.is_tutor === true;
  return SECTIONS.find(s => (!s.staffOnly || isStaff) && s.tabs.some(([p]) => p === pageName)) || null;
}

export default function SectionTabs({ section, current }) {
  if (!section) return null;
  return (
    <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
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
