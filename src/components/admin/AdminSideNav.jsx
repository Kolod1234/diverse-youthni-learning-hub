import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Card, Typography } from '@mui/material';
import { createPageUrl } from '@/utils';

// Redesign (wireframe L1): the same grouped admin menu beside every admin list page.
export const ADMIN_NAV_GROUPS = [
  { name: 'PEOPLE', links: [
    ['AdminDashboard', 'Dashboard'], ['AdminUsers', 'Users'], ['AdminRolesPermissions', 'Roles & permissions'],
    ['AdminCoordinators', 'Coordinators'], ['AdminTeachingRequests', 'Teaching requests'], ['AdminTutorMonitor', 'Tutor monitor'],
    ['AdminAttendance', 'Attendance'], ['AdminYouthWork', 'Youth Work'], ['/admin-parent-links', 'Parent verification'],
  ] },
  { name: 'CONTENT', links: [
    ['AdminCourseBuilder', 'Course builder'], ['AdminPageBuilder', 'Page builder'], ['CourseIntegrityValidator', 'Course validator'],
    ['AdminLibrary', 'Library'], ['AdminEvents', 'Events'], ['AdminDiscover', 'Discover'], ['AdminReviews', 'Reviews'],
    ['AdminQuotes', 'Quotes'], ['AdminDailyFacts', 'Daily facts'], ['AdminStudentOfMonth', 'Student of the month'],
    ['AdminRSSFeed', 'News & RSS'], ['AdminLearningObjectives', 'Learning objectives'], ['AdminMathSolutionAudit', 'Maths solution audit'],
    ['/admin-project-submissions', 'Project submissions'], ['/tutor-leaderboard', 'Student leaderboard'],
  ] },
  { name: 'COMMUNICATION', links: [
    ['AdminSupportChats', 'Support chats'], ['AdminStudentMessages', 'Student messages'], ['AdminReminders', 'Reminders'],
    ['AdminNotifications', 'Notifications'],
  ] },
  { name: 'SYSTEM', links: [
    ['AdminAppVersion', 'App versions'], ['LearningImpactDashboard', 'Learning impact'], ['AdminLibraryDashboard', 'Library dashboard'],
  ] },
];

// Pages that get the side menu (full-width editors and the dashboard, which has its own menu, are left out).
const NO_SIDE_NAV = new Set(['AdminDashboard', 'AdminCourseBuilder', 'AdminPageBuilder']);
export const ADMIN_NAV_PAGES = new Set(
  ADMIN_NAV_GROUPS.flatMap(g => g.links.map(([page]) => page)).filter(p => !NO_SIDE_NAV.has(p))
);

export default function AdminSideNav({ current }) {
  return (
    <Card component="nav" aria-label="Admin sections"
      sx={{ display: { xs: 'none', md: 'block' }, flex: '0 0 230px', alignSelf: 'flex-start', position: 'sticky', top: 88, p: 1.5, mt: 3, ml: 3, maxHeight: 'calc(100vh - 110px)', overflowY: 'auto' }}>
      {ADMIN_NAV_GROUPS.map(group => (
        <Box key={group.name} sx={{ mb: 1 }}>
          <Typography sx={{ px: 1.25, pt: 1, pb: 0.5, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary' }}>{group.name}</Typography>
          {group.links.map(([page, label]) => {
            const on = current === page;
            return (
              <Button key={page} component={Link} to={page.startsWith('/') ? page : createPageUrl(page)} fullWidth aria-current={on ? 'page' : undefined}
                sx={{ justifyContent: 'flex-start', minHeight: 38, px: 1.25, fontWeight: on ? 700 : 400,
                  color: on ? 'primary.main' : 'text.primary', bgcolor: on ? 'rgba(79,70,229,0.10)' : 'transparent' }}>
                {label}
              </Button>
            );
          })}
        </Box>
      ))}
    </Card>
  );
}
