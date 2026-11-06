import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import VideocamIcon from '@mui/icons-material/Videocam';
import ForumIcon from '@mui/icons-material/Forum';
import ChatIcon from '@mui/icons-material/Chat';
import EventIcon from '@mui/icons-material/Event';
import ScienceIcon from '@mui/icons-material/Science';
import DescriptionIcon from '@mui/icons-material/Description';
import PsychologyIcon from '@mui/icons-material/Psychology';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EditNoteIcon from '@mui/icons-material/EditNote';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import GroupsIcon from '@mui/icons-material/Groups';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FlagIcon from '@mui/icons-material/Flag';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { getPathways } from '@/components/pathways/pathways';
import { createPageUrl } from '@/utils';
import { SECTIONS } from '@/components/layout/SectionTabs';
import { ADMIN_NAV_PAGES } from '@/components/admin/AdminSideNav';
import { PARTNER_PAGES } from '@/components/partner/PartnerPreview';

// Redesign: ONE list of links per role. The top bar, the phone bottom bar and the Menu drawer
// all read from this, so they can never disagree again (the old header had five separate lists).

const sectionPages = (name) => SECTIONS.find(s => s.name === name)?.tabs.map(([p]) => p) || [];
const page = (p, label, icon, extra = {}) => ({ to: createPageUrl(p), page: p, label, icon, match: [p], ...extra });
const path = (to, label, icon) => ({ to, label, icon, match: [] });

// Where each kind of user lands when they open "My dashboard".
export function roleHome(user) {
  if (!user) return 'Home';
  if (user.role === 'admin') return 'AdminDashboard';
  if (user.is_tutor === true) return 'TutorDashboardOverview';
  if (user.is_coordinator === true && !user.coordinator_banned) return 'CoordinatorsDashboard';
  return 'Dashboard';
}

/**
 * @param {object} o
 * @param {object|null} o.user
 * @param {(perm: string) => boolean} o.can
 * @param {object} o.PERMISSIONS
 * @param {boolean} o.canAccessPastPaperSolver
 * @param {string[]} o.tutorPages  pages a non-admin tutor is allowed on (others redirect them away)
 */
export function buildNav({ user, can, PERMISSIONS, canAccessPastPaperSolver, tutorPages }) {
  const isAdmin = user?.role === 'admin';
  const isTutor = user?.is_tutor === true || isAdmin;
  const isCoordinator = user?.is_coordinator === true && !user?.coordinator_banned;
  const isStudent = !!user && !isTutor && !isCoordinator;

  // Staff dashboards replace /Dashboard, so their own learning page needs ?as=student.
  const myLearning = page('Dashboard', 'My learning', MenuBookIcon, isStudent ? {} : { to: createPageUrl('Dashboard') + '?as=student' });
  const liveSessions = page('Sessions', 'Live sessions', VideocamIcon, { match: sectionPages('Live sessions') });
  const community = page('Community', 'Community', ForumIcon, { match: sectionPages('Community') });
  const tutorHome = page('TutorDashboardOverview', 'Tutor home', SchoolIcon, { match: sectionPages('Tutor') });
  const coordHome = page('CoordinatorsDashboard', 'My participants', GroupsIcon);
  const adminHome = page('AdminDashboard', 'Admin', AdminPanelSettingsIcon, { match: ['AdminDashboard', ...ADMIN_NAV_PAGES, ...PARTNER_PAGES] });
  const home = page('Home', 'Home', HomeIcon);
  const explore = page('Explore', 'Explore', ExploreIcon);
  const youthWork = page('YouthWork', 'Youth Work', WorkspacesIcon, { match: ['YouthWork', 'YouthWorkWorkbook'] });
  const programmes = page('Programs', 'Programmes', FlagIcon);

  // Stage 1: the learner's chosen pathway decides which links come first. It never hides a page.
  const pathways = getPathways(user);
  const mainPathway = pathways[0] || 'learning';

  // Top bar: at most five links, picked per role (wireframes M1, M6, L4, L5) and, for learners, per pathway.
  let primary;
  if (isAdmin) primary = [home, adminHome, explore, tutorHome, page('Library', 'Library', LocalLibraryIcon)];
  else if (isTutor) primary = [tutorHome, explore, page('TutorSessionsDashboard', 'My sessions', VideocamIcon), page('TutorBookingManager', 'Bookings', EventAvailableIcon)];
  else if (isCoordinator) primary = [home, coordHome, explore, myLearning, community];
  else if (user && mainPathway === 'youth_work') primary = [home, youthWork, page('YouthWorkWorkbook', 'My workbooks', AssignmentIcon), liveSessions, community];
  else if (user && mainPathway === 'leadership') primary = [home, programmes, page('Events', 'Events', EventIcon), community, page('MessageCenter', 'Messages', ChatIcon)];
  else if (user) primary = [home, explore, myLearning, liveSessions, community];
  else primary = [home, explore];

  // One menu group per pathway. Chosen pathways come first; the others follow, still open to everyone.
  const pathwayGroups = {
    learning: { name: 'Study (GCSE & A-Level)', items: [
      myLearning,
      page('Explore', 'Explore courses', ExploreIcon),
      page('CCEAPastPapers', 'CCEA past papers', DescriptionIcon),
      canAccessPastPaperSolver && page('PastPaperSolver', 'Past paper solver', PsychologyIcon),
      path('/laboratory', 'Virtual laboratory', ScienceIcon),
      isAdmin && page('Library', 'Library', LocalLibraryIcon),
    ] },
    youth_work: { name: 'Youth Work (OCN)', items: [
      page('YouthWork', 'Qualifications and courses', WorkspacesIcon),
      page('YouthWorkWorkbook', 'My workbooks', AssignmentIcon),
      page('YouthWorkLanding', 'About Youth Work', InfoOutlinedIcon),
    ] },
    leadership: { name: 'Leadership Programme', items: [
      page('Programs', 'Programmes, rota and logbooks', FlagIcon),
      page('LeadershipLanding', 'About the programme', InfoOutlinedIcon),
    ] },
  };
  const pathwayOrder = [...pathways, ...['learning', 'youth_work', 'leadership'].filter(id => !pathways.includes(id))];

  // Menu drawer: everything else, grouped, same on desktop and phone.
  const groups = [
    ...pathwayOrder.map(id => pathwayGroups[id]),
    { name: 'Live and community', items: [
      liveSessions, page('Tutors', 'Tutors', SchoolIcon), page('Events', 'Events', EventIcon),
      community, page('MessageCenter', 'Messages', ChatIcon),
    ] },
    (isTutor || can?.(PERMISSIONS?.CREATE_LESSON)) && { name: 'Teaching', items: [
      tutorHome,
      can?.(PERMISSIONS?.CREATE_COURSE) && page('TutorBookingManager', 'Bookings', EventAvailableIcon),
      can?.(PERMISSIONS?.CREATE_LESSON) && page('LessonEditor', 'Lesson editor', EditNoteIcon),
      page('Templates', 'Templates', ContentCopyIcon),
      path('/kahoot-host', 'Strands of Ideas', LightbulbIcon),
      !isAdmin && page('AdminReminders', 'Student reminders', NotificationsActiveIcon),
      !isAdmin && page('AdminStudentMessages', 'Message students', ChatIcon),
      path('/tutor-leaderboard', 'Student leaderboard', LeaderboardIcon),
    ] },
    isCoordinator && { name: 'Coordinating', items: [
      coordHome,
      !isTutor && path('/kahoot-host', 'Strands of Ideas', LightbulbIcon),
    ] },
    isAdmin && { name: 'Admin', items: [
      page('AdminDashboard', 'Admin dashboard', DashboardIcon),
      page('PartnerSchools', 'Partner schools (preview)', SchoolIcon, { match: PARTNER_PAGES }),
      { ...page('AdminUsers', 'Users and all admin tools', AdminPanelSettingsIcon), hint: 'The full admin menu sits on the left of every admin page.' },
    ] },
    { name: 'Help', items: [page('ContactUs', 'Contact us', SupportAgentIcon)] },
  ].filter(Boolean).map(g => ({
    ...g,
    // A non-admin tutor is redirected off any page outside TUTOR_PAGES, so never offer them one.
    items: g.items.filter(Boolean).filter(it => !(isTutor && !isAdmin && it.page && tutorPages && !tutorPages.includes(it.page))),
  })).filter(g => g.items.length);

  return { primary, groups, home: roleHome(user), pathways, isStudent, isTutor, isCoordinator, isAdmin };
}

export const isActive = (item, currentPageName) => item.match?.includes(currentPageName);

// The single Menu drawer. Rendered outside the navy header theme so it looks like the rest of the site.
export function NavDrawer({ open, onClose, groups, currentPageName, actions = [] }) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 300, maxWidth: '86vw' } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, bgcolor: '#0b2f5c', color: '#fff' }}>
        <Typography fontWeight={700}>Menu</Typography>
        <IconButton onClick={onClose} aria-label="Close menu" sx={{ color: '#fff' }}><CloseIcon /></IconButton>
      </Box>
      <Box component="nav" aria-label="All pages" sx={{ overflowY: 'auto', pb: 2 }}>
        {groups.map((g, gi) => (
          <Box key={g.name}>
            {gi > 0 && <Divider />}
            <Typography sx={{ px: 2, pt: 1.5, pb: 0.5, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary', textTransform: 'uppercase' }}>{g.name}</Typography>
            <List dense disablePadding>
              {g.items.map(it => {
                const on = isActive(it, currentPageName);
                const Icon = it.icon;
                return (
                  <ListItemButton key={g.name + it.label} component={Link} to={it.to} onClick={onClose} selected={on}
                    aria-current={on ? 'page' : undefined} title={it.hint}
                    sx={{ minHeight: 44, '&.Mui-selected': { bgcolor: 'rgba(79,70,229,0.10)', color: 'primary.main', fontWeight: 700 } }}>
                    <ListItemIcon sx={{ minWidth: 36, color: on ? 'primary.main' : 'text.secondary' }}><Icon fontSize="small" /></ListItemIcon>
                    <ListItemText primary={it.label} primaryTypographyProps={{ fontWeight: on ? 700 : 400 }} />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
        {actions.length > 0 && (
          <>
            <Divider />
            <List dense disablePadding sx={{ pt: 1 }}>
              {actions.map(a => (
                <ListItemButton key={a.label} onClick={() => { onClose(); setTimeout(a.onClick, 50); }} sx={{ minHeight: 44 }}>
                  <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}><HowToRegIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={a.label} />
                </ListItemButton>
              ))}
            </List>
          </>
        )}
      </Box>
    </Drawer>
  );
}
