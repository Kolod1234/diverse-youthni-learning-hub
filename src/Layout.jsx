import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  AppBar, Toolbar, Button, IconButton, Avatar, Menu as MuiMenu, MenuItem, 
  Divider, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton,
  Box, Typography, Container, Dialog, DialogTitle, DialogContent, DialogActions, TextField
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
import { AnimatePresence, motion } from 'framer-motion';
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

  // Keep non-admins out of admin-only pages.
  useEffect(() => {
    if (!user) return;
    if (ADMIN_ONLY_PAGES.has(currentPageName) && user.role !== 'admin') {
      navigate(createPageUrl(user.is_tutor ? 'TutorDashboardOverview' : 'Dashboard'), { replace: true });
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* In-app APK update banner (mobile users) */}
      <AppUpdateBanner />
      {/* Header */}
      <AppBar 
        position="sticky" 
        elevation={scrolled ? 2 : 0}
        role="banner"
        sx={{ 
          bgcolor: scrolled ? 'background.paper' : 'background.paper/80',
          backdropFilter: 'blur(10px)',
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
                  style={{ height: '56px', width: '56px', objectFit: 'contain', borderRadius: '50%', overflow: 'hidden' }}
                />
              </Link>
            ) : (
              <IconButton onClick={() => window.history.back()} sx={{ mr: 'auto', display: { xs: 'flex', md: 'flex' } }}>
                <ArrowLeft size={24} />
              </IconButton>
            )}

            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, mr: 2 }}>
              <Button
                component={Link}
                to={createPageUrl('Home')}
                startIcon={<Home size={20} />}
                sx={{
                  color: location.pathname === createPageUrl('Home') || location.pathname === '/' ? 'primary.main' : 'text.secondary',
                  bgcolor: location.pathname === createPageUrl('Home') || location.pathname === '/' ? 'primary.main' + '15' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                  px: 2, py: 1, borderRadius: 2
                }}
              >
                Home
              </Button>
              <Button
                component={Link}
                to={createPageUrl('Explore')}
                startIcon={<Compass size={20} />}
                sx={{
                  color: location.pathname.includes('Explore') ? 'primary.main' : 'text.secondary',
                  bgcolor: location.pathname.includes('Explore') ? 'primary.main' + '15' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                  px: 2, py: 1, borderRadius: 2
                }}
              >
                Explore
              </Button>
              {(user?.is_tutor || user?.role === 'admin') && (
              <Button
                component={Link}
                to={createPageUrl('Library')}
                startIcon={<BookOpen size={20} />}
                sx={{
                  color: location.pathname.includes('Library') ? 'primary.main' : 'text.secondary',
                  bgcolor: location.pathname.includes('Library') ? 'primary.main' + '15' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                  px: 2, py: 1, borderRadius: 2
                }}
              >
                Library
              </Button>
              )}
              {isTutorOrAdmin ? (
                <Button
                  component={Link}
                  to={createPageUrl('TutorDashboardOverview')}
                  startIcon={<BookOpen size={20} />}
                  sx={{
                    color: location.pathname.includes('TutorDashboard') ? 'primary.main' : 'text.secondary',
                    bgcolor: location.pathname.includes('TutorDashboard') ? 'primary.main' + '15' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' },
                    px: 2, py: 1, borderRadius: 2
                  }}
                >
                  My Courses
                </Button>
              ) : (
                <Button
                  component={Link}
                  to={createPageUrl('Dashboard')}
                  startIcon={<BookOpen size={20} />}
                  sx={{
                    color: location.pathname.includes('Dashboard') ? 'primary.main' : 'text.secondary',
                    bgcolor: location.pathname.includes('Dashboard') ? 'primary.main' + '15' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' },
                    px: 2, py: 1, borderRadius: 2
                  }}
                >
                  My Learning
                </Button>
              )}

              {/* More Menu */}
              <Button
                onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
                startIcon={<MoreVertical size={20} />}
                sx={{
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'action.hover' },
                  px: 2, py: 1, borderRadius: 2
                }}
              >
                More
              </Button>
              <MuiMenu
                anchorEl={moreMenuAnchor}
                open={Boolean(moreMenuAnchor)}
                onClose={() => setMoreMenuAnchor(null)}
                disableEnforceFocus
                disableRestoreFocus
                disableAutoFocusItem
                PaperProps={{
                  sx: { width: 280, maxHeight: 600, borderRadius: 3, mt: 1 }
                }}
              >
                <MenuItem component={Link} to={createPageUrl('Tutors')} onClick={() => setMoreMenuAnchor(null)}>
                  <ListItemIcon><GraduationCap size={20} color="#2563eb" /></ListItemIcon>
                  <ListItemText primary="Tutors" />
                </MenuItem>
                <MenuItem component={Link} to={createPageUrl('YouthWork')} onClick={() => setMoreMenuAnchor(null)}>
                  <ListItemIcon><GraduationCap size={20} color="#16a34a" /></ListItemIcon>
                  <ListItemText primary="Youth Work (OCN)" />
                </MenuItem>
                <MenuItem component={Link} to="/laboratory" onClick={() => setMoreMenuAnchor(null)}>
                  <ListItemIcon><Sparkles size={20} color="#7c3aed" /></ListItemIcon>
                  <ListItemText primary="Virtual Laboratory 🧪" />
                </MenuItem>
                <MenuItem component={Link} to={createPageUrl('CCEAPastPapers')} onClick={() => setMoreMenuAnchor(null)}>
                  <ListItemIcon><BookOpen size={20} color="#9333ea" /></ListItemIcon>
                  <ListItemText primary="CCEA Past Papers" />
                </MenuItem>
                {canAccessPastPaperSolver && (
                  <MenuItem component={Link} to={createPageUrl('PastPaperSolver')} onClick={() => setMoreMenuAnchor(null)}>
                    <ListItemIcon><BookOpen size={20} color="#4f46e5" /></ListItemIcon>
                    <ListItemText primary="DYNI Past Paper Solver 🧠" />
                  </MenuItem>
                )}
                <MenuItem component={Link} to={createPageUrl('Sessions')} onClick={() => setMoreMenuAnchor(null)}>
                  <ListItemIcon><Video size={20} color="#dc2626" /></ListItemIcon>
                  <ListItemText primary="Live Sessions" />
                </MenuItem>
                {(user?.is_tutor || user?.is_coordinator || user?.role === 'admin') && (
                  <MenuItem component={Link} to="/kahoot-host" onClick={() => setMoreMenuAnchor(null)}>
                    <ListItemIcon><Sparkles size={20} color="#f59e0b" /></ListItemIcon>
                    <ListItemText primary="Strands of Ideas" />
                  </MenuItem>
                )}
                <Divider />
                <MenuItem component={Link} to={createPageUrl('MessageCenter')} onClick={() => setMoreMenuAnchor(null)}>
                  <ListItemIcon><MessageSquare size={20} color="#6366f1" /></ListItemIcon>
                  <ListItemText primary="Messages" />
                </MenuItem>
                <MenuItem component={Link} to={createPageUrl('Achievements')} onClick={() => setMoreMenuAnchor(null)}>
                  <ListItemIcon><Award size={20} color="#ca8a04" /></ListItemIcon>
                  <ListItemText primary="Achievements" />
                </MenuItem>
                <Divider />
                <MenuItem component={Link} to={createPageUrl('ContactUs')} onClick={() => setMoreMenuAnchor(null)}>
                  <ListItemIcon><MessageSquare size={20} color="#06b6d4" /></ListItemIcon>
                  <ListItemText primary="Contact Us" />
                </MenuItem>
                <MenuItem component={Link} to={createPageUrl('Events')} onClick={() => setMoreMenuAnchor(null)}>
                  <ListItemIcon><Calendar size={20} color="#16a34a" /></ListItemIcon>
                  <ListItemText primary="Events" />
                </MenuItem>
                <Divider />
                {user && !user.is_coordinator && user.role !== 'admin' && (
                  <>
                    <MenuItem onClick={() => { setMoreMenuAnchor(null); setTimeout(() => setShowCoordinatorDialog(true), 50); }}>
                      <ListItemIcon><UserCheck size={20} color="#7c3aed" /></ListItemIcon>
                      <ListItemText primary={user?.coordinator_request_status === 'rejected' ? 'Reapply as Coordinator' : 'Become a Coordinator'} />
                    </MenuItem>
                    <Divider />
                  </>
                )}
                {user && !user.is_tutor && user.role !== 'admin' && (
                  <>
                    <MenuItem onClick={() => { setMoreMenuAnchor(null); setTimeout(() => setShowTutorDialog(true), 50); }}>
                      <ListItemIcon><GraduationCap size={20} color="#4f46e5" /></ListItemIcon>
                      <ListItemText primary={user?.tutor_request_status === 'rejected' ? 'Reapply as Tutor' : 'Become a Tutor'} />
                    </MenuItem>
                    <Divider />
                  </>
                )}
                {isCoordinator && !isTutorOrAdmin && (
                  <>
                    <Divider />
                    <MenuItem component={Link} to={createPageUrl('CoordinatorsDashboard')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><User size={20} color="#10b981" /></ListItemIcon>
                      <ListItemText primary="Coordinators Dashboard" />
                    </MenuItem>
                  </>
                )}
                {(isTutorOrAdmin || can(PERMISSIONS.CREATE_LESSON)) && (
                  <>
                    <Divider />
                    <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary', fontWeight: 600 }}>
                      CONTENT CREATOR TOOLS
                    </Typography>
                    {can(PERMISSIONS.CREATE_COURSE) && (
                      <MenuItem component={Link} to={createPageUrl('TutorDashboardOverview')} onClick={() => setMoreMenuAnchor(null)}>
                        <ListItemIcon><Settings size={20} color="#2563eb" /></ListItemIcon>
                        <ListItemText primary="Tutor Overview" />
                      </MenuItem>
                    )}
                    {can(PERMISSIONS.CREATE_COURSE) && (
                      <MenuItem component={Link} to={createPageUrl('TutorBookingManager')} onClick={() => setMoreMenuAnchor(null)}>
                        <ListItemIcon><GraduationCap size={20} color="#7c3aed" /></ListItemIcon>
                        <ListItemText primary="Manage Bookings" />
                      </MenuItem>
                    )}
                    {can(PERMISSIONS.CREATE_LESSON) && (
                      <MenuItem component={Link} to={createPageUrl('LessonEditor')} onClick={() => setMoreMenuAnchor(null)}>
                        <ListItemIcon><BookOpen size={20} color="#9333ea" /></ListItemIcon>
                        <ListItemText primary="Lesson Editor" />
                      </MenuItem>
                    )}
                    <MenuItem component={Link} to={createPageUrl('Templates')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><ClipboardList size={20} color="#ec4899" /></ListItemIcon>
                      <ListItemText primary="Templates" />
                    </MenuItem>
                  </>
                )}
                {can(PERMISSIONS.ACCESS_ADMIN_PANEL) && (
                  <>
                    <Divider />
                    <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary', fontWeight: 600 }}>
                      ADMIN PANEL
                    </Typography>
                    <MenuItem component={Link} to={createPageUrl('AdminDashboard')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><Settings size={20} color="#dc2626" /></ListItemIcon>
                      <ListItemText primary="Admin Panel" />
                    </MenuItem>
                    <Typography variant="caption" sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'block', color: 'text.disabled', fontSize: '0.7rem', letterSpacing: 0.5 }}>
                      PEOPLE
                    </Typography>
                    {can(PERMISSIONS.MANAGE_ROLES) && (
                      <MenuItem component={Link} to={createPageUrl('AdminRolesPermissions')} onClick={() => setMoreMenuAnchor(null)}>
                        <ListItemIcon><Shield size={20} color="#f59e0b" /></ListItemIcon>
                        <ListItemText primary="Roles & Permissions" />
                      </MenuItem>
                    )}
                    <MenuItem component={Link} to={createPageUrl('AdminCoordinators')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><User size={20} color="#10b981" /></ListItemIcon>
                      <ListItemText primary="Manage Coordinators" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminTeachingRequests')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><GraduationCap size={20} color="#16a34a" /></ListItemIcon>
                      <ListItemText primary="Teaching Requests" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminTutorMonitor')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><GraduationCap size={20} color="#7c3aed" /></ListItemIcon>
                      <ListItemText primary="Tutor Monitor" />
                    </MenuItem>
                    <MenuItem component={Link} to="/admin-parent-links" onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><UserCheck size={20} color="#0d9488" /></ListItemIcon>
                      <ListItemText primary="Parent Verification" />
                    </MenuItem>
                    <Typography variant="caption" sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'block', color: 'text.disabled', fontSize: '0.7rem', letterSpacing: 0.5 }}>
                      CONTENT
                    </Typography>
                    <MenuItem component={Link} to={createPageUrl('AdminPageBuilder')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><LayoutIcon size={20} color="#8b5cf6" /></ListItemIcon>
                      <ListItemText primary="Page Builder" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('CourseIntegrityValidator')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><CheckCircle size={20} color="#10b981" /></ListItemIcon>
                      <ListItemText primary="Course Validator" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminLibrary')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><BookOpen size={20} color="#9333ea" /></ListItemIcon>
                      <ListItemText primary="Manage Library" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminEvents')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><Calendar size={20} color="#16a34a" /></ListItemIcon>
                      <ListItemText primary="Event Manager" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminDiscover')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><MessageSquare size={20} color="#06b6d4" /></ListItemIcon>
                      <ListItemText primary="Manage Discover" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminReviews')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><Award size={20} color="#ea580c" /></ListItemIcon>
                      <ListItemText primary="Manage Reviews" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminQuotes')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><MessageSquare size={20} color="#ec4899" /></ListItemIcon>
                      <ListItemText primary="Manage Quotes" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminDailyFacts')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><MessageSquare size={20} color="#0d9488" /></ListItemIcon>
                      <ListItemText primary="Manage Facts" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminStudentOfMonth')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><Award size={20} color="#ca8a04" /></ListItemIcon>
                      <ListItemText primary="Student of Month" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminRSSFeed')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><MessageSquare size={20} color="#2563eb" /></ListItemIcon>
                      <ListItemText primary="Manage RSS Feed" />
                    </MenuItem>
                    <MenuItem component={Link} to="/admin-project-submissions" onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><Sparkles size={20} color="#7c3aed" /></ListItemIcon>
                      <ListItemText primary="Project Submissions" />
                    </MenuItem>
                    <MenuItem component={Link} to="/tutor-leaderboard" onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><Award size={20} color="#ca8a04" /></ListItemIcon>
                      <ListItemText primary="Student Leaderboard" />
                    </MenuItem>
                    <Typography variant="caption" sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'block', color: 'text.disabled', fontSize: '0.7rem', letterSpacing: 0.5 }}>
                      COMMUNICATION
                    </Typography>
                    <MenuItem component={Link} to={createPageUrl('AdminSupportChats')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><MessageSquare size={20} color="#0ea5e9" /></ListItemIcon>
                      <ListItemText primary="Support Chats" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminStudentMessages')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><MessageSquare size={20} color="#6366f1" /></ListItemIcon>
                      <ListItemText primary="Send Student Messages" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminReminders')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><Bell size={20} color="#06b6d4" /></ListItemIcon>
                      <ListItemText primary="Student Reminders" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminNotifications')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><Bell size={20} color="#7c3aed" /></ListItemIcon>
                      <ListItemText primary="Notification Centre" />
                    </MenuItem>
                    <Typography variant="caption" sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'block', color: 'text.disabled', fontSize: '0.7rem', letterSpacing: 0.5 }}>
                      SYSTEM
                    </Typography>
                    <MenuItem component={Link} to={createPageUrl('AdminAppVersion')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><Bell size={20} color="#16a34a" /></ListItemIcon>
                      <ListItemText primary="App Version Manager" />
                    </MenuItem>
                  </>
                )}

                {isTutorOrAdmin && !isAdmin && (
                  <>
                    <Divider />
                    <MenuItem component={Link} to={createPageUrl('AdminReminders')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><Bell size={20} color="#06b6d4" /></ListItemIcon>
                      <ListItemText primary="Student Reminders" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminStudentMessages')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><MessageSquare size={20} color="#6366f1" /></ListItemIcon>
                      <ListItemText primary="Send Student Messages" />
                    </MenuItem>
                    <MenuItem component={Link} to="/tutor-leaderboard" onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><Award size={20} color="#ca8a04" /></ListItemIcon>
                      <ListItemText primary="Student Leaderboard" />
                    </MenuItem>
                  </>
                )}
              </MuiMenu>
            </Box>

            {/* Right Side */}
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              {/* Global Search Button */}
              <IconButton
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
                <MenuItem component={Link} to={createPageUrl('Dashboard')} onClick={() => setUserMenuAnchor(null)}>
                  <ListItemIcon><User size={18} /></ListItemIcon>
                  <ListItemText primary="My Dashboard" />
                </MenuItem>
                <MenuItem component={Link} to="/parent-dashboard" onClick={() => setUserMenuAnchor(null)}>
                  <ListItemIcon><Users size={18} /></ListItemIcon>
                  <ListItemText primary="Parent Dashboard" />
                </MenuItem>
                <MenuItem onClick={() => { navigate(createPageUrl('WelcomeCover'), { state: { forceShow: true } }); setUserMenuAnchor(null); }}>
                  <ListItemIcon><Home size={18} /></ListItemIcon>
                  <ListItemText primary="Change Pathway" />
                </MenuItem>
                <MenuItem component={Link} to={createPageUrl('Settings')} onClick={() => setUserMenuAnchor(null)}>
                  <ListItemIcon><Settings size={18} /></ListItemIcon>
                  <ListItemText primary="Settings" />
                </MenuItem>
                <MenuItem component={Link} to={createPageUrl('Dashboard')} onClick={() => setUserMenuAnchor(null)}>
                  <ListItemIcon><Award size={18} /></ListItemIcon>
                  <ListItemText primary="Achievements" />
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { setLogoutDialogOpen(true); setUserMenuAnchor(null); }} sx={{ color: 'error.main' }}>
                  <ListItemIcon><LogOut size={18} color="#dc2626" /></ListItemIcon>
                  <ListItemText primary="Log out" />
                </MenuItem>
              </MuiMenu>

              {/* Mobile Menu */}
              <IconButton onClick={() => setMobileMenuOpen(true)} sx={{ display: { xs: 'flex', md: 'none' } }}>
                <Menu size={24} />
              </IconButton>
              <Drawer
                anchor="right"
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                PaperProps={{ sx: { width: 280 } }}
              >
                <Box sx={{ pt: 3, pb: 2 }}>
                  <List>
                    <ListItemButton component={Link} to={createPageUrl('Home')} onClick={() => setMobileMenuOpen(false)}>
                      <ListItemIcon><Home size={20} /></ListItemIcon>
                      <ListItemText primary="Home" />
                    </ListItemButton>
                    <ListItemButton component={Link} to={createPageUrl('Explore')} onClick={() => setMobileMenuOpen(false)}>
                      <ListItemIcon><Compass size={20} /></ListItemIcon>
                      <ListItemText primary="Explore" />
                    </ListItemButton>
                    {isTutorOrAdmin && (
                    <ListItemButton component={Link} to={createPageUrl('Library')} onClick={() => setMobileMenuOpen(false)}>
                      <ListItemIcon><BookOpen size={20} /></ListItemIcon>
                      <ListItemText primary="Library" />
                    </ListItemButton>
                    )}
                    {isTutorOrAdmin ? (
                      <ListItemButton component={Link} to={createPageUrl('TutorDashboardOverview')} onClick={() => setMobileMenuOpen(false)}>
                        <ListItemIcon><BookOpen size={20} /></ListItemIcon>
                        <ListItemText primary="My Courses" />
                      </ListItemButton>
                    ) : (
                      <ListItemButton component={Link} to={createPageUrl('Dashboard')} onClick={() => setMobileMenuOpen(false)}>
                        <ListItemIcon><BookOpen size={20} /></ListItemIcon>
                        <ListItemText primary="My Learning" />
                      </ListItemButton>
                    )}
                    {(user?.is_tutor || user?.is_coordinator || user?.role === 'admin') && (
                      <ListItemButton component={Link} to="/kahoot-host" onClick={() => setMobileMenuOpen(false)}>
                        <ListItemIcon><Sparkles size={20} /></ListItemIcon>
                        <ListItemText primary="Strands of Ideas" />
                      </ListItemButton>
                    )}
                    <ListItemButton component={Link} to="/laboratory" onClick={() => setMobileMenuOpen(false)}>
                      <ListItemIcon><Sparkles size={20} /></ListItemIcon>
                      <ListItemText primary="Virtual Laboratory 🧪" />
                    </ListItemButton>
                    {canAccessPastPaperSolver && (
                      <ListItemButton component={Link} to={createPageUrl('PastPaperSolver')} onClick={() => setMobileMenuOpen(false)}>
                        <ListItemIcon><BookOpen size={20} /></ListItemIcon>
                        <ListItemText primary="DYNI Past Paper Solver" />
                      </ListItemButton>
                    )}

                    {isCoordinator && !isTutorOrAdmin && (
                      <ListItemButton component={Link} to={createPageUrl('CoordinatorsDashboard')} onClick={() => setMobileMenuOpen(false)}>
                        <ListItemIcon><User size={20} /></ListItemIcon>
                        <ListItemText primary="Coordinators Dashboard" />
                      </ListItemButton>
                    )}

                    {isTutorOrAdmin && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <ListItemButton component={Link} to={createPageUrl('TutorDashboardOverview')} onClick={() => setMobileMenuOpen(false)}>
                          <ListItemIcon><Settings size={20} /></ListItemIcon>
                          <ListItemText primary="Tutor Overview" />
                        </ListItemButton>
                        <ListItemButton component={Link} to={createPageUrl('Templates')} onClick={() => setMobileMenuOpen(false)}>
                          <ListItemIcon><ClipboardList size={20} /></ListItemIcon>
                          <ListItemText primary="Templates" />
                        </ListItemButton>
                      </>
                    )}

                    {isAdmin && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <ListItemButton component={Link} to={createPageUrl('AdminDashboard')} onClick={() => setMobileMenuOpen(false)}>
                          <ListItemIcon><Settings size={20} /></ListItemIcon>
                          <ListItemText primary="Admin Panel" />
                        </ListItemButton>
                      </>
                    )}
                  </List>
                </Box>
              </Drawer>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

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
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ width: '100%' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
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
          {[
            { label: 'Courses', page: 'Explore', icon: Compass, match: 'Explore' },
            isTutorOrAdmin
              ? { label: 'My Courses', page: 'TutorDashboardOverview', icon: BookOpen, match: 'TutorDashboard' }
              : { label: 'Progress', page: 'Dashboard', icon: BarChart3, match: 'Dashboard' },
            ...(isTutorOrAdmin ? [{ label: 'Library', page: 'Library', icon: BookOpen, match: 'Library' }] : []),
            { label: 'Profile', page: 'Profile', icon: User, match: 'Profile' },
          ].map(({ label, page, icon: Icon, match }) => {
            const isActive = location.pathname.includes(match);
            const href = createPageUrl(page);
            return (
              <Link
                key={page}
                to={href}
                onClick={() => {
                  // Save current scroll before navigating away
                  tabScrollPositions.current[location.pathname] = window.scrollY;
                }}
                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 12px', minHeight: 64, minWidth: 64, justifyContent: 'center' }}
              >
                <Icon size={24} color={isActive ? '#003366' : '#999'} />
                <Typography variant="caption" sx={{ color: isActive ? 'primary.main' : 'text.secondary', fontWeight: isActive ? 600 : 400, fontSize: '0.7rem' }}>
                  {label}
                </Typography>
              </Link>
            );
          })}
        </Box>
      </Box>

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
                Expert-led learning for young people across Northern Ireland.
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
                {isTutorOrAdmin && (
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
          <LayoutContent children={children} currentPageName={currentPageName} />
        </MUIThemeProvider>
      </ThemeProvider>
    </MathJaxContext>
  );
}