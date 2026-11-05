import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ThemeProvider as MuiSubTheme, createTheme, useTheme as useMuiTheme } from '@mui/material/styles';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  AppBar, Toolbar, Button, IconButton, Avatar, Menu as MuiMenu, MenuItem, 
  Divider, List, ListItem, ListItemIcon, ListItemText,
  Box, Typography, Container, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VideocamIcon from '@mui/icons-material/Videocam';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
// Aliases preserve existing JSX usage (size + color props supported)
const iconWrap = (IconCmp) => ({ size, color, ...rest }) => <IconCmp sx={{ fontSize: size || 20, color: color || 'inherit' }} {...rest} />;
const GraduationCap = iconWrap(SchoolIcon);
const Home = iconWrap(HomeIcon);
const Compass = iconWrap(ExploreIcon);
const BookOpen = iconWrap(MenuBookIcon);
const Award = iconWrap(EmojiEventsIcon);
const Calendar = iconWrap(CalendarTodayIcon);
const Search = iconWrap(SearchIcon);
const Settings = iconWrap(SettingsIcon);
const LogOut = iconWrap(LogoutIcon);
const Menu = iconWrap(MenuIcon);
const User = iconWrap(PersonIcon);
const ClipboardList = iconWrap(AssignmentIcon);
const BarChart3 = iconWrap(BarChartIcon);
const MessageSquare = iconWrap(ChatIcon);
const MoreVertical = iconWrap(MoreVertIcon);
const Video = iconWrap(VideocamIcon);
const LayoutIcon = iconWrap(DashboardIcon);
const Users = iconWrap(GroupIcon);
const Bell = iconWrap(NotificationsIcon);
const ArrowLeft = iconWrap(ArrowBackIcon);
const CheckCircle = iconWrap(CheckCircleIcon);
const Shield = iconWrap(ShieldIcon);
const UserCheck = iconWrap(HowToRegIcon);
const Sparkles = iconWrap(AutoAwesomeIcon);
import NotificationBell from '@/components/notifications/NotificationBell';
import BecomeCoordinatorButton from '@/components/coordinator/BecomeCoordinatorButton';
import BecomeTutorButton from '@/components/tutor/BecomeTutorButton';
import ThemeToggle from '@/components/theme/ThemeToggle';
import ThemeProvider from '@/components/theme/ThemeProvider';
import MUIThemeProvider from '@/components/theme/MUIThemeProvider';
import AdminSideNav, { ADMIN_NAV_PAGES } from '@/components/admin/AdminSideNav';
import SectionTabs, { SectionSideNav, sectionFor } from '@/components/layout/SectionTabs';
import { buildNav, roleHome, isActive as isNavActive, NavDrawer } from '@/components/layout/MainNav';
import ComingSoon, { COMING_SOON_PAGES, NEEDS_ITEM } from '@/components/layout/ComingSoon';
import { PARTNER_PAGES, PARTNER_ADMIN_PAGES } from '@/components/partner/PartnerPreview';
import { MotionConfig } from 'framer-motion';
import { MathJaxContext } from 'better-react-mathjax';
import { usePermissions } from '@/components/permissions/usePermissions';
import { PERMISSIONS } from '@/components/permissions/permissions';
import AppUpdateBanner from '@/components/app/AppUpdateBanner';
import SupportChatWidget from '@/components/support/SupportChatWidget';
import GlobalSearch from '@/components/search/GlobalSearch';
import usePastPaperSolverAccess from '@/components/solver/usePastPaperSolverAccess';

// Pages where tutors should NOT be auto-redirected (i.e., tutor-specific pages)
const TUTOR_PAGES = [
  'Explore', 'Library', 'BookDetails', 'CourseDetails',
  'TutorDashboard', 'TutorDashboardOverview', 'TutorCourseManager', 'LessonPlayer', 'LessonPlayerClassic', 'LessonPlayerPowerPoint', 'LessonPlayerRise', 'ModernLessonPlayer',
  'TutorSetup', 'TutorBookingManager', 'LessonEditor', 'ScheduleSession',
  'GradeAssignments', 'QuizGenerator', 'StudentAnalytics', 'CreateAssignment',
  'SessionRecordings', 'AdminDashboard', 'AdminUsers', 'AdminCourseBuilder',
  'AdminPageBuilder', 'AdminCoordinators', 'AdminRolesPermissions',
  'AdminLibraryDashboard', 'AdminDailyFacts', 'AdminDiscover', 'AdminReviews',
  'AdminReminders', 'AdminStudentMessages', 'AdminStudentOfMonth', 'AdminQuotes',
  'AdminRSSFeed', 'AdminAttendance', 'AdminYouthWork', 'AdminLibrary',
  'PathwayManager', 'DataPresentation', 'Templates', 'SimulationAuthor',
  'VideoSession', 'CourseAnalytics', 'TutorDashboardCanvas', 'TutorSessionsDashboard',
  'TutorLeaderboard',
];

// Pages that handle people's personal data, accounts, roles or integration settings.
// Only admins may open these; everyone else is sent back to their dashboard.
// (The real protection is the access rules on the data and the admin checks in server functions;
// this keeps the screens themselves out of reach.)
const ADMIN_ONLY_PAGES = new Set([
  'AdminDashboard', 'AdminUsers', 'AdminUserProfile', 'AdminRolesPermissions', 'AdminCoordinators',
  'AdminStudentMessages', 'AdminSupportChats', 'AdminAttendance', 'AdminYouthWork', 'AdminParentLinks',
  'AdminNotifications', 'AdminTutorMonitor', 'AdminTeachingRequests', 'AdminAppVersion',
  'AdminProjectSubmissions', 'LMSIntegrationConfig', 'EnterpriseIntegrations', 'Analytics',
  'AdminLearningObjectives', 'AdminMathSolutionAudit',
  // Library books are for in-house lesson preparation only.
  'Library', 'BookDetails', 'AdminLibrary', 'AdminLibraryDashboard',
  // Partner Schools is a preview of the next phase (sample data only): every one of its pages.
  ...PARTNER_PAGES,
]);

// Pull-to-refresh hook (mobile only)
function usePullToRefresh(onRefresh) {
  const startY = useRef(0);
  const [pulling, setPulling] = useState(false);
  const [pullY, setPullY] = useState(0);
  const THRESHOLD = 80;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 900;

  const onTouchStart = useCallback((e) => {
    if (!isMobile || window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
  }, [isMobile]);

  const onTouchMove = useCallback((e) => {
    if (!isMobile || window.scrollY > 0) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      setPulling(true);
      setPullY(Math.min(delta, THRESHOLD + 20));
    }
  }, [isMobile]);

  const onTouchEnd = useCallback(() => {
    if (pullY >= THRESHOLD) {
      onRefresh();
    }
    setPulling(false);
    setPullY(0);
  }, [pullY, onRefresh]);

  return { pulling, pullY, THRESHOLD, onTouchStart, onTouchMove, onTouchEnd };
}

function LayoutContent({ children, currentPageName }) {
  const [scrolled, setScrolled] = useState(false);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [showTutorDialog, setShowTutorDialog] = useState(false);
  const [showCoordinatorDialog, setShowCoordinatorDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  // Redesign: the header is a navy band. It gets its own sub-theme so every nav item,
  // icon and dropdown inside it switches to light text without editing each one.
  const outerTheme = useMuiTheme();
  const headerTheme = useMemo(() => createTheme(outerTheme, {
    palette: {
      mode: 'dark',
      primary: { main: '#fbbf24', contrastText: '#1a1a1a' },
      text: { primary: '#ffffff', secondary: 'rgba(255,255,255,0.85)' },
      background: { paper: '#123a6b', default: '#0b2f5c' },
      action: { hover: 'rgba(255,255,255,0.10)', active: '#ffffff' },
      divider: 'rgba(255,255,255,0.15)',
    },
  }), [outerTheme]);
  const navigate = useNavigate();
  // Persist scroll positions per tab path
  const tabScrollPositions = useRef({});
  const queryClient = useQueryClient();
  const { can, isAdmin, isInstructor, isContentCreator } = usePermissions();

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  const { pulling, pullY, THRESHOLD, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(handleRefresh);

  // Use React Query to manage user data so it can be invalidated by other components
  const { data: user = null } = useQuery({
    queryKey: ['auth-me'],
    queryFn: () => base44.auth.me(),
    staleTime: 30000, // 30 seconds
    retry: false,
  });
  const { canAccess: canAccessPastPaperSolver } = usePastPaperSolverAccess(user);

  const { data: siteContent = [] } = useQuery({
    queryKey: ['site-content'],
    queryFn: () => base44.entities.SiteContent.list('key', 1000),
  });

  const getContent = (key, defaultValue) => {
    const item = siteContent.find(c => c.key === key);
    return item?.value || defaultValue;
  };

  // Auto-redirect approved tutors to their dashboard when on student-facing pages
  useEffect(() => {
    if (!user) return;
    const isTutor = user.is_tutor === true || user.role === 'admin';
    if (!isTutor) return;
    if (user.role === 'admin') return; // Admins can go anywhere

    const isOnTutorPage = TUTOR_PAGES.some(page => currentPageName === page);
    if (!isOnTutorPage) {
      navigate(createPageUrl('TutorDashboardOverview'), { replace: true });
    }
  }, [user, currentPageName]);

  // Redesign sitemap merges: duplicate pages send visitors to the page that replaces them.
  // (TutorDashboard is not here: it still has views of its own.)
  useEffect(() => {
    const MERGED_INTO = {
      HomeGuest: 'Home', HomeLearning: 'Home', HomeLeadership: 'LeadershipLanding', HomeYouthWork: 'YouthWorkLanding',
      PersonalDashboard: 'Dashboard', SocialHub: 'Community', CollaborationHub: 'Community',
    };
    const target = MERGED_INTO[currentPageName];
    if (target) navigate(createPageUrl(target) + location.search, { replace: true });
  }, [currentPageName]);

  // Each role has its own dashboard (wireframes M5 student, M6 admin, L4 tutor, L5 coordinator).
  // Staff still reach their own learning page through "My learning" (?as=student).
  useEffect(() => {
    if (!user || currentPageName !== 'Dashboard') return;
    if (new URLSearchParams(location.search).get('as') === 'student') return;
    const home = roleHome(user);
    if (home !== 'Dashboard') navigate(createPageUrl(home), { replace: true });
  }, [user, currentPageName, location.search]);

  // Keep non-admins out of admin-only pages.
  useEffect(() => {
    if (!user) return;
    // Tutor tools and analytics: tutors and admins only (coordinators and students are sent home).
    const TUTOR_ONLY_PAGES = new Set(['CourseAnalytics', 'DetailedCourseAnalytics', 'StudentAnalytics', 'GradeAssignments',
      'QuizGenerator', 'CreateAssignment', 'TutorCourseManager', 'TutorBookingManager', 'TutorSessionsDashboard',
      'TutorDashboard', 'TutorDashboardOverview', 'TutorDashboardCanvas', 'KahootAnalytics']);
    const isStaffOnlyPage = (currentPageName?.startsWith('Admin') || TUTOR_ONLY_PAGES.has(currentPageName)) && user.is_tutor !== true;
    if ((ADMIN_ONLY_PAGES.has(currentPageName) || isStaffOnlyPage) && user.role !== 'admin') {
      navigate(createPageUrl(roleHome(user)), { replace: true });
    }
  }, [user, currentPageName]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(open => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Preserve scroll position when navigating tabs
  useEffect(() => {
    const restore = tabScrollPositions.current[location.pathname];
    if (restore !== undefined) {
      // Defer to let the page render first
      requestAnimationFrame(() => window.scrollTo(0, restore));
    } else {
      window.scrollTo(0, 0);
    }
    return () => {
      tabScrollPositions.current[location.pathname] = window.scrollY;
    };
  }, [location.pathname]);

  // Pages that own the full viewport (no public site header/footer/mobile nav/chat).
  // LessonEditor and any LessonPlayer variant render an immersive authoring or
  // reading workspace; the public chrome would steal vertical space and clash
  // with their own toolbars.
  const IMMERSIVE_PAGES = new Set([
    'LessonPlayer',
    'LessonPlayerClassic',
    'LessonPlayerPowerPoint',
    'LessonPlayerRise',
    'ModernLessonPlayer',
    'LessonEditor',
  ]);
  if (IMMERSIVE_PAGES.has(currentPageName)) {
    return <>{children}</>;
  }

  // Role checks
  const isTutorOrAdmin = user && (user.is_tutor === true || user.role === 'admin');
  const isCoordinator = user && user.is_coordinator === true && !user.coordinator_banned;

  const navigation = [
    { name: 'Home', href: createPageUrl('Home'), icon: Home },
    { name: 'Explore', href: createPageUrl('Explore'), icon: Compass },
    { name: 'Tutors', href: createPageUrl('Tutors'), icon: GraduationCap },
    { name: 'My Learning', href: createPageUrl('Dashboard'), icon: BookOpen },
    { name: 'Live Sessions', href: createPageUrl('Sessions'), icon: Video },
    { name: 'Youth Work', href: createPageUrl('YouthWork'), icon: GraduationCap },
    { name: 'Library', href: createPageUrl('Library'), icon: BookOpen },
    { name: 'Academies', href: createPageUrl('AcademyManager'), icon: Award },
    { name: 'Learning Pathways', href: createPageUrl('StudentPathways'), icon: Award },
    { name: 'Community', href: createPageUrl('Community'), icon: MessageSquare },
    { name: 'Event Slides', href: createPageUrl('CommunityEventSlides'), icon: GraduationCap },
    { name: 'Art Gallery', href: createPageUrl('ArtGallery'), icon: Award },
    { name: 'Messages', href: createPageUrl('MessageCenter'), icon: MessageSquare },
    { name: 'Analytics', href: createPageUrl('Analytics'), icon: BarChart3 },
    { name: 'Achievements', href: createPageUrl('Achievements'), icon: Award },
    { name: 'Learning Paths', href: createPageUrl('LearningPaths'), icon: Award },
    { name: 'Programmes', href: createPageUrl('Programs'), icon: ClipboardList },
    { name: 'Profile', href: createPageUrl('Profile'), icon: User },
    { name: 'Contact Us', href: createPageUrl('ContactUs'), icon: MessageSquare },
  ];

  const NavLinks = ({ mobile = false, onItemClick }) => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href || 
          (item.href.includes('Home') && location.pathname === '/');
        
        if (item.onClick) {
          return (
            <button
              key={item.name}
              onClick={() => {
                item.onClick();
                onItemClick?.();
              }}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                ${mobile ? 'w-full' : ''}
                text-foreground/70 hover:bg-accent hover:text-accent-foreground
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </button>
          );
        }
        
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onItemClick}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-all
              ${mobile ? 'w-full' : ''}
              ${isActive 
                ? 'bg-primary/10 text-primary font-medium' 
                : 'text-foreground/70 hover:bg-accent hover:text-accent-foreground'
              }
            `}
          >
            <Icon className="w-5 h-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </>
  );

  const pageSection = sectionFor(currentPageName, user);
  const nav = buildNav({ user, can, PERMISSIONS, canAccessPastPaperSolver, tutorPages: TUTOR_PAGES });

  // Unfinished features show a Coming soon card; detail pages opened without an item point back to their list.
  const soon = COMING_SOON_PAGES[currentPageName];
  const needsItem = NEEDS_ITEM[currentPageName];
  const pageBody = soon
    ? <ComingSoon title={soon.title} text={`${soon.text} We're still building this part of the Learning Hub.`} />
    : needsItem && !new URLSearchParams(location.search).get('id')
      ? <ComingSoon badge={null} title={`Choose ${needsItem.what} first`} text={`This page shows one ${needsItem.what.replace(/^an? /, '')} at a time.`} actionLabel={needsItem.backLabel} actionTo={createPageUrl(needsItem.back)} />
      : children;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* In-app APK update banner (mobile users) */}
      <AppUpdateBanner />
      {/* Header */}
      <MuiSubTheme theme={headerTheme}>
      <AppBar 
        position="sticky" 
        elevation={scrolled ? 2 : 0}
        role="banner"
        sx={{ 
          bgcolor: '#0b2f5c',
          backgroundImage: 'none',
          borderBottom: 1,
          borderColor: 'divider',
          color: 'text.primary',
          paddingTop: 'env(safe-area-inset-top)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
          userSelect: 'none'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 64 }}>
            {/* Logo or Back Button */}
            {location.pathname === '/' || location.pathname === createPageUrl('Home') ? (
              <Link to={createPageUrl('Home')} style={{ display: 'flex', alignItems: 'center', marginRight: 'auto' }}>
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69418fc30769c7d951368216/2c84fe800_Picsart_25-09-17_19-15-27-477.jpg"
                  alt="Diverse Youth NI"
                  style={{ height: '52px', width: '52px', objectFit: 'contain', borderRadius: '50%', overflow: 'hidden', background: '#ffffff', padding: '2px' }}
                />
              </Link>
            ) : (
              <IconButton aria-label="Back" onClick={() => window.history.back()} sx={{ mr: 'auto', display: { xs: 'flex', md: 'flex' } }}>
                <ArrowLeft size={24} />
              </IconButton>
            )}

            {/* Desktop navigation: the role's top links, then one Menu button for everything else. */}
            <Box component="nav" aria-label="Main" sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, mr: 2 }}>
              {nav.primary.map(item => {
                const on = isNavActive(item, currentPageName);
                const Icon = item.icon;
                return (
                  <Button key={item.label} component={Link} to={item.to} startIcon={<Icon sx={{ fontSize: 20 }} />}
                    aria-current={on ? 'page' : undefined}
                    sx={{ color: on ? 'primary.main' : 'text.secondary', bgcolor: on ? 'rgba(251,191,36,0.12)' : 'transparent',
                      '&:hover': { bgcolor: 'action.hover' }, px: 2, py: 1, borderRadius: 2 }}>
                    {item.label}
                  </Button>
                );
              })}
              <Button onClick={() => setMobileMenuOpen(true)} startIcon={<Menu size={20} />}
                sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' }, px: 2, py: 1, borderRadius: 2 }}>
                Menu
              </Button>
            </Box>

            {/* Right Side */}
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              {/* Global Search Button */}
              <IconButton aria-label="Search (Ctrl+K)"
                onClick={() => setSearchOpen(true)}
                title="Search (Ctrl+K)"
                sx={{ color: 'text.secondary', display: { xs: 'none', md: 'flex' } }}
              >
                <Search size={20} />
              </IconButton>

              {/* Theme Toggle */}
                <Box sx={{ color: 'white' }}>
                  <ThemeToggle />
                </Box>

              {/* Notifications */}
                <Box sx={{ color: 'white' }}>
                  <NotificationBell />
                </Box>

              {/* User Menu */}
              <IconButton onClick={(e) => setUserMenuAnchor(e.currentTarget)} sx={{ p: 0 }}>
                <Avatar src={user?.avatar} sx={{ width: 40, height: 40, bgcolor: 'primary.main' + '20', color: 'primary.main' }}>
                  {user?.full_name?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
              <MuiMenu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={() => setUserMenuAnchor(null)}
                PaperProps={{ sx: { width: 240, borderRadius: 2, mt: 1 } }}
              >
                <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="body2" fontWeight={600}>{user?.full_name || 'User'}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>{user?.email}</Typography>
                </Box>
                <MenuItem component={Link} to={createPageUrl(nav.home)} onClick={() => setUserMenuAnchor(null)}>
                  <ListItemIcon><LayoutIcon size={18} /></ListItemIcon>
                  <ListItemText primary="My dashboard" />
                </MenuItem>
                <MenuItem component={Link} to={createPageUrl('Profile')} onClick={() => setUserMenuAnchor(null)}>
                  <ListItemIcon><User size={18} /></ListItemIcon>
                  <ListItemText primary="Profile" />
                </MenuItem>
                <MenuItem component={Link} to={createPageUrl('Settings')} onClick={() => setUserMenuAnchor(null)}>
                  <ListItemIcon><Settings size={18} /></ListItemIcon>
                  <ListItemText primary="Settings" />
                </MenuItem>
                <MenuItem component={Link} to="/parent-dashboard" onClick={() => setUserMenuAnchor(null)}>
                  <ListItemIcon><Users size={18} /></ListItemIcon>
                  <ListItemText primary="Parent dashboard" />
                </MenuItem>
                <MenuItem onClick={() => { navigate(createPageUrl('WelcomeCover'), { state: { forceShow: true } }); setUserMenuAnchor(null); }}>
                  <ListItemIcon><Home size={18} /></ListItemIcon>
                  <ListItemText primary="Change pathway" />
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { setLogoutDialogOpen(true); setUserMenuAnchor(null); }} sx={{ color: 'error.main' }}>
                  <ListItemIcon><LogOut size={18} color="#dc2626" /></ListItemIcon>
                  <ListItemText primary="Log out" />
                </MenuItem>
              </MuiMenu>

              {/* Phones open the same Menu drawer from the bottom bar (wireframe M7), so no second button here. */}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      </MuiSubTheme>

      {/* Main Content with Route Transitions + Pull-to-Refresh */}
      <Box
        component="main"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        sx={{ flexGrow: 1, pb: { xs: 8, md: 0 }, position: 'relative' }}
      >
        {/* Pull-to-refresh indicator (mobile only) */}
        {pulling && (
          <Box sx={{
            display: { xs: 'flex', md: 'none' },
            justifyContent: 'center',
            alignItems: 'center',
            height: `${pullY}px`,
            overflow: 'hidden',
            transition: 'height 0.1s',
          }}>
            <Box sx={{
              width: 36, height: 36,
              border: 3,
              borderColor: pullY >= THRESHOLD ? 'primary.main' : 'divider',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: pullY >= THRESHOLD ? 'spin 0.6s linear infinite' : 'none',
              transition: 'border-color 0.2s',
              '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
            }} />
          </Box>
        )}
        {/* No page-change animation: people change pages many times a visit, and the old
            fade-out-then-slide-in (mode="wait") added about 400ms before every new page appeared. */}
        <Box sx={{ width: '100%' }}>
            <SectionTabs section={pageSection} current={currentPageName} />
            {user?.role === 'admin' && (ADMIN_NAV_PAGES.has(currentPageName) || PARTNER_ADMIN_PAGES.includes(currentPageName)) ? (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', maxWidth: 1440, mx: 'auto' }}>
                {/* The Partner Schools admin screens all highlight their one menu entry. */}
                <AdminSideNav current={PARTNER_ADMIN_PAGES.includes(currentPageName) ? 'PartnerSchools' : currentPageName} />
                <Box sx={{ flex: 1, minWidth: 0 }}>{pageBody}</Box>
              </Box>
            ) : pageSection?.side ? (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', maxWidth: 1440, mx: 'auto' }}>
                <SectionSideNav section={pageSection} current={currentPageName} />
                <Box sx={{ flex: 1, minWidth: 0 }}>{pageBody}</Box>
              </Box>
            ) : pageBody}
        </Box>
      </Box>

      {/* Mobile Bottom Navigation */}
      <Box
        component="nav"
        aria-label="Mobile bottom navigation"
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          zIndex: 50,
          boxShadow: 3,
          minHeight: 64,
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
          userSelect: 'none'
        }}
      >
        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-around', alignItems: 'center' }}>
          {nav.primary.slice(0, 3).map((item) => {
            const on = isNavActive(item, currentPageName);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.to}
                aria-current={on ? 'page' : undefined}
                onClick={() => {
                  // Save current scroll before navigating away
                  tabScrollPositions.current[location.pathname] = window.scrollY;
                }}
                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 12px', minHeight: 64, minWidth: 64, justifyContent: 'center' }}
              >
                <Icon sx={{ fontSize: 24, color: on ? '#4f46e5' : 'text.secondary' }} />
                <Typography variant="caption" sx={{ color: on ? 'primary.main' : 'text.secondary', fontWeight: on ? 600 : 400, fontSize: '0.7rem' }}>
                  {item.label}
                </Typography>
              </Link>
            );
          })}
          <Box component="button" type="button" onClick={() => setMobileMenuOpen(true)}
            sx={{ border: 0, bgcolor: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', p: '8px 12px', minHeight: 64, minWidth: 64, justifyContent: 'center', color: 'text.secondary' }}>
            <Menu size={24} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>Menu</Typography>
          </Box>
        </Box>
      </Box>

      <NavDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} groups={nav.groups} currentPageName={currentPageName}
        actions={[
          ...(user && !user.is_coordinator && user.role !== 'admin' ? [{ label: user.coordinator_request_status === 'rejected' ? 'Reapply as a coordinator' : 'Become a coordinator', onClick: () => setShowCoordinatorDialog(true) }] : []),
          ...(user && !user.is_tutor && user.role !== 'admin' ? [{ label: user.tutor_request_status === 'rejected' ? 'Reapply as a tutor' : 'Become a tutor', onClick: () => setShowTutorDialog(true) }] : []),
        ]} />

      {/* Become Tutor / Coordinator Dialogs - rendered outside MuiMenu to avoid focus trapping issues */}
      <BecomeTutorButton user={user} externalOpen={showTutorDialog} onExternalOpenChange={setShowTutorDialog} />
      <BecomeCoordinatorButton user={user} externalOpen={showCoordinatorDialog} onExternalOpenChange={setShowCoordinatorDialog} />

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to log out?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => { base44.auth.logout(); setLogoutDialogOpen(false); }} color="error" variant="contained">
            Log Out
          </Button>
        </DialogActions>
      </Dialog>

      {/* Support Chat Widget */}
      <SupportChatWidget />

      {/* Global Search Overlay */}
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}

      {/* Footer */}
      <Box component="footer" sx={{ bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', mt: 10 }}>
        <Container maxWidth="xl" sx={{ py: 6 }}>
          <Box sx={{ mb: 4, pb: 4, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Join Our Team</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
              <BecomeCoordinatorButton user={user} />
              <BecomeTutorButton user={user} />
            </Box>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 4 }}>
            <Box sx={{ gridColumn: { xs: 'span 2', md: 'span 1' } }}>
              <Link to={createPageUrl('Home')} style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69418fc30769c7d951368216/2c84fe800_Picsart_25-09-17_19-15-27-477.jpg"
                  alt="Diverse Youth NI"
                  style={{ height: 48, width: 48, objectFit: 'contain', borderRadius: '50%', overflow: 'hidden' }}
                />
              </Link>
              <Typography variant="body2" color="text.secondary">
                Empowering learners worldwide with expert-led courses and cutting-edge content.
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>Platform</Typography>
              <List dense disablePadding>
                <ListItem disablePadding>
                  <Link to={createPageUrl('Explore')} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                      Browse Courses
                    </Typography>
                  </Link>
                </ListItem>
                <ListItem disablePadding>
                 <Link to={createPageUrl(isTutorOrAdmin ? 'TutorDashboardOverview' : 'Dashboard')} style={{ textDecoration: 'none', color: 'inherit' }}>
                   <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                     {isTutorOrAdmin ? 'My Courses' : 'My Learning'}
                   </Typography>
                 </Link>
                </ListItem>
                {user?.role === 'admin' && (
                <ListItem disablePadding>
                 <Link to={createPageUrl('Library')} style={{ textDecoration: 'none', color: 'inherit' }}>
                   <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                     Library
                   </Typography>
                 </Link>
                </ListItem>
                )}
              </List>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>Support</Typography>
              <List dense disablePadding>
                <ListItem disablePadding>
                  <Link to={createPageUrl('ContactUs')} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                      Contact Us
                    </Typography>
                  </Link>
                </ListItem>
              </List>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>Legal</Typography>
              <List dense disablePadding>
                <ListItem disablePadding>
                  <Typography variant="body2" color="text.secondary">Privacy Policy</Typography>
                </ListItem>
                <ListItem disablePadding>
                  <Typography variant="body2" color="text.secondary">Terms of Service</Typography>
                </ListItem>
              </List>
            </Box>
          </Box>
          
          <Divider sx={{ my: 4 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            {getContent('footer_copyright', `© ${new Date().getFullYear()} Diverse Youth NI. All rights reserved.`)}
          </Typography>
        </Container>
      </Box>
    </Box>
    );
    }

const mathJaxConfig = {
  loader: { load: ['[tex]/mhchem'] },
  tex: {
    packages: { '[+]': ['mhchem'] },
    inlineMath: [['$', '$']],
    displayMath: [['$$', '$$']]
  }
};

export default function Layout({ children, currentPageName }) {
  return (
    <MathJaxContext config={mathJaxConfig}>
      <ThemeProvider>
        <MUIThemeProvider>
          {/* Honour the device's "reduce motion" setting in every framer-motion animation on the site:
              movement is skipped, opacity and colour changes stay so state changes are still visible. */}
          <MotionConfig reducedMotion="user">
            <LayoutContent children={children} currentPageName={currentPageName} />
          </MotionConfig>
        </MUIThemeProvider>
      </ThemeProvider>
    </MathJaxContext>
  );
}