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
import { 
  GraduationCap, Home, Compass, BookOpen, Award, 
  Settings, LogOut, Menu, User, ClipboardList, BarChart3, MessageSquare, MoreVertical, Video, Layout as LayoutIcon, Users, Bell, ArrowLeft, CheckCircle, Shield, UserCheck
} from 'lucide-react';
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

// Pages where tutors should NOT be auto-redirected (i.e., tutor-specific pages)
const TUTOR_PAGES = [
  'Explore', 'Library', 'BookDetails', 'CourseDetails',
  'TutorDashboard', 'TutorDashboardOverview', 'TutorCourseManager',
  'TutorSetup', 'TutorBookingManager', 'LessonEditor', 'ScheduleSession',
  'GradeAssignments', 'QuizGenerator', 'StudentAnalytics', 'CreateAssignment',
  'SessionRecordings', 'AdminDashboard', 'AdminUsers', 'AdminCourseBuilder',
  'AdminPageBuilder', 'AdminCoordinators', 'AdminRolesPermissions',
  'AdminLibraryDashboard', 'AdminDailyFacts', 'AdminDiscover', 'AdminReviews',
  'AdminReminders', 'AdminStudentMessages', 'AdminStudentOfMonth', 'AdminQuotes',
  'AdminRSSFeed', 'AdminAttendance', 'AdminYouthWork', 'AdminLibrary',
  'PathwayManager', 'DataPresentation', 'Templates', 'SimulationAuthor',
  'VideoSession', 'CourseAnalytics', 'TutorDashboardCanvas', 'TutorSessionsDashboard',
];

function LayoutContent({ children, currentPageName }) {
  const [scrolled, setScrolled] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [showTutorDialog, setShowTutorDialog] = useState(false);
  const [showCoordinatorDialog, setShowCoordinatorDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [tabScrollPositions, setTabScrollPositions] = useState({});
  const { can, isAdmin, isInstructor, isContentCreator } = usePermissions();

  // Use React Query to manage user data so it can be invalidated by other components
  const { data: user = null } = useQuery({
    queryKey: ['auth-me'],
    queryFn: () => base44.auth.me(),
    staleTime: 30000, // 30 seconds
    retry: false,
  });

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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Preserve scroll position when navigating tabs
  useEffect(() => {
    const saveScrollPosition = () => {
      setTabScrollPositions(prev => ({
        ...prev,
        [location.pathname]: window.scrollY
      }));
    };

    const restoreScrollPosition = () => {
      const savedPosition = tabScrollPositions[location.pathname];
      if (savedPosition !== undefined) {
        window.scrollTo(0, savedPosition);
      }
    };

    restoreScrollPosition();

    return () => {
      saveScrollPosition();
    };
  }, [location.pathname]);

  const isLessonPlayer = currentPageName === 'LessonPlayer';

  if (isLessonPlayer) {
    return <>{children}</>;
  }

  const handleAdminAccess = () => {
    const correctPassword = getContent('admin_panel_password', 'Edu24!');
    if (adminPassword === correctPassword) {
      window.location.href = createPageUrl('AdminDashboard');
    } else {
      alert('Incorrect password');
    }
  };

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
                <MenuItem component={Link} to={createPageUrl('CCEAPastPapers')} onClick={() => setMoreMenuAnchor(null)}>
                  <ListItemIcon><BookOpen size={20} color="#9333ea" /></ListItemIcon>
                  <ListItemText primary="CCEA Past Papers" />
                </MenuItem>
                <MenuItem component={Link} to={createPageUrl('Sessions')} onClick={() => setMoreMenuAnchor(null)}>
                  <ListItemIcon><Video size={20} color="#dc2626" /></ListItemIcon>
                  <ListItemText primary="Live Sessions" />
                </MenuItem>
                <Divider />
                <MenuItem component={Link} to={createPageUrl('MessageCenter')} onClick={() => setMoreMenuAnchor(null)}>
                  <ListItemIcon><MessageSquare size={20} color="#6366f1" /></ListItemIcon>
                  <ListItemText primary="Messages" />
                </MenuItem>
                <MenuItem component={Link} to={createPageUrl('Analytics')} onClick={() => setMoreMenuAnchor(null)}>
                  <ListItemIcon><BarChart3 size={20} color="#ea580c" /></ListItemIcon>
                  <ListItemText primary="Analytics" />
                </MenuItem>
                <MenuItem component={Link} to={createPageUrl('Achievements')} onClick={() => setMoreMenuAnchor(null)}>
                  <ListItemIcon><Award size={20} color="#ca8a04" /></ListItemIcon>
                  <ListItemText primary="Achievements" />
                </MenuItem>
                <MenuItem component={Link} to={createPageUrl('LearningPaths')} onClick={() => setMoreMenuAnchor(null)}>
                  <ListItemIcon><Award size={20} color="#0d9488" /></ListItemIcon>
                  <ListItemText primary="Learning Paths" />
                </MenuItem>
                <MenuItem component={Link} to={createPageUrl('Programs')} onClick={() => setMoreMenuAnchor(null)}>
                  <ListItemIcon><ClipboardList size={20} color="#ec4899" /></ListItemIcon>
                  <ListItemText primary="Programmes" />
                </MenuItem>
                <Divider />
                <MenuItem component={Link} to={createPageUrl('CommunityEventSlides')} onClick={() => setMoreMenuAnchor(null)}>
                  <ListItemIcon><GraduationCap size={20} color="#84cc16" /></ListItemIcon>
                  <ListItemText primary="Event Slides" />
                </MenuItem>
                <MenuItem component={Link} to={createPageUrl('ContactUs')} onClick={() => setMoreMenuAnchor(null)}>
                  <ListItemIcon><MessageSquare size={20} color="#06b6d4" /></ListItemIcon>
                  <ListItemText primary="Contact Us" />
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
                    <MenuItem component={Link} to={createPageUrl('DataPresentation')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><BarChart3 size={20} color="#ea580c" /></ListItemIcon>
                      <ListItemText primary="Data to Slides" />
                    </MenuItem>
                    {can(PERMISSIONS.CREATE_QUIZ) && (
                      <MenuItem component={Link} to={createPageUrl('QuizGenerator')} onClick={() => setMoreMenuAnchor(null)}>
                        <ListItemIcon><Award size={20} color="#ca8a04" /></ListItemIcon>
                        <ListItemText primary="Quiz Generator" />
                      </MenuItem>
                    )}
                    {can(PERMISSIONS.CREATE_SIMULATION) && (
                      <MenuItem component={Link} to={createPageUrl('SimulationAuthor')} onClick={() => setMoreMenuAnchor(null)}>
                        <ListItemIcon><Award size={20} color="#8b5cf6" /></ListItemIcon>
                        <ListItemText primary="Simulation Author" />
                      </MenuItem>
                    )}
                    {can(PERMISSIONS.CREATE_COURSE) && (
                      <>
                        <MenuItem component={Link} to={createPageUrl('PathwayManager')} onClick={() => setMoreMenuAnchor(null)}>
                          <ListItemIcon><Award size={20} color="#6366f1" /></ListItemIcon>
                          <ListItemText primary="Pathway Manager" />
                        </MenuItem>
                        <MenuItem component={Link} to={createPageUrl('TutorSetup')} onClick={() => setMoreMenuAnchor(null)}>
                          <ListItemIcon><User size={20} color="#0d9488" /></ListItemIcon>
                          <ListItemText primary="Tutor Setup" />
                        </MenuItem>
                        <MenuItem component={Link} to={createPageUrl('TutorDashboard')} onClick={() => setMoreMenuAnchor(null)}>
                          <ListItemIcon><Settings size={20} color="#6366f1" /></ListItemIcon>
                          <ListItemText primary="Full Tutor Dashboard" />
                        </MenuItem>
                      </>
                    )}
                  </>
                )}
                {can(PERMISSIONS.ACCESS_ADMIN_PANEL) && (
                  <>
                    <Divider />
                    <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary', fontWeight: 600 }}>
                      ADMIN PANEL
                    </Typography>
                    <MenuItem onClick={() => { setShowAdminPassword(true); setMoreMenuAnchor(null); }}>
                      <ListItemIcon><Settings size={20} color="#dc2626" /></ListItemIcon>
                      <ListItemText primary="Admin Panel" />
                    </MenuItem>
                    {can(PERMISSIONS.MANAGE_ROLES) && (
                      <MenuItem component={Link} to={createPageUrl('AdminRolesPermissions')} onClick={() => setMoreMenuAnchor(null)}>
                        <ListItemIcon><Shield size={20} color="#f59e0b" /></ListItemIcon>
                        <ListItemText primary="Roles & Permissions" />
                      </MenuItem>
                    )}
                    <MenuItem component={Link} to={createPageUrl('AdminPageBuilder')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><LayoutIcon size={20} color="#8b5cf6" /></ListItemIcon>
                      <ListItemText primary="Page Builder" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('CourseIntegrityValidator')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><CheckCircle size={20} color="#10b981" /></ListItemIcon>
                      <ListItemText primary="Course Validator" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminTutorMonitor')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><GraduationCap size={20} color="#7c3aed" /></ListItemIcon>
                      <ListItemText primary="Tutor Monitor" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminCoordinators')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><User size={20} color="#10b981" /></ListItemIcon>
                      <ListItemText primary="Manage Coordinators" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminRSSFeed')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><MessageSquare size={20} color="#2563eb" /></ListItemIcon>
                      <ListItemText primary="Manage RSS Feed" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminLibrary')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><BookOpen size={20} color="#9333ea" /></ListItemIcon>
                      <ListItemText primary="Manage Library" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminQuotes')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><MessageSquare size={20} color="#ec4899" /></ListItemIcon>
                      <ListItemText primary="Manage Quotes" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminStudentOfMonth')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><Award size={20} color="#ca8a04" /></ListItemIcon>
                      <ListItemText primary="Student of Month" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminDailyFacts')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><MessageSquare size={20} color="#0d9488" /></ListItemIcon>
                      <ListItemText primary="Manage Facts" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminDiscover')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><MessageSquare size={20} color="#06b6d4" /></ListItemIcon>
                      <ListItemText primary="Manage Discover" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminReviews')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><Award size={20} color="#ea580c" /></ListItemIcon>
                      <ListItemText primary="Manage Reviews" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminReminders')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><Bell size={20} color="#06b6d4" /></ListItemIcon>
                      <ListItemText primary="Student Reminders" />
                    </MenuItem>
                    <MenuItem component={Link} to={createPageUrl('AdminStudentMessages')} onClick={() => setMoreMenuAnchor(null)}>
                      <ListItemIcon><MessageSquare size={20} color="#6366f1" /></ListItemIcon>
                      <ListItemText primary="Send Student Messages" />
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
                  </>
                )}
              </MuiMenu>
            </Box>

            {/* Right Side */}
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
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
                    <ListItemButton component={Link} to={createPageUrl('Library')} onClick={() => setMobileMenuOpen(false)}>
                      <ListItemIcon><BookOpen size={20} /></ListItemIcon>
                      <ListItemText primary="Library" />
                    </ListItemButton>
                    <ListItemButton component={Link} to={createPageUrl('Dashboard')} onClick={() => setMobileMenuOpen(false)}>
                      <ListItemIcon><BookOpen size={20} /></ListItemIcon>
                      <ListItemText primary="My Learning" />
                    </ListItemButton>

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
                        <ListItemButton component={Link} to={createPageUrl('TutorDashboard')} onClick={() => setMobileMenuOpen(false)}>
                          <ListItemIcon><Settings size={20} /></ListItemIcon>
                          <ListItemText primary="Full Tutor Dashboard" />
                        </ListItemButton>
                      </>
                    )}

                    {isAdmin && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <ListItemButton onClick={() => { setShowAdminPassword(true); setMobileMenuOpen(false); }}>
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

      {/* Main Content with Route Transitions */}
      <Box component="main" sx={{ flexGrow: 1, pb: { xs: 8, md: 0 } }}>
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
          <Link 
            to={createPageUrl('Explore')} 
            onClick={() => location.pathname.includes('Explore') && window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 12px', minHeight: 64, minWidth: 64, justifyContent: 'center' }}
          >
            <Compass size={24} color={location.pathname.includes('Explore') ? '#003366' : '#999'} />
            <Typography variant="caption" sx={{ color: location.pathname.includes('Explore') ? 'primary.main' : 'text.secondary', fontWeight: location.pathname.includes('Explore') ? 600 : 400, fontSize: '0.7rem' }}>
              Courses
            </Typography>
          </Link>
          <Link 
            to={createPageUrl('Dashboard')} 
            onClick={() => location.pathname.includes('Dashboard') && window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 12px', minHeight: 64, minWidth: 64, justifyContent: 'center' }}
          >
            <BarChart3 size={24} color={location.pathname.includes('Dashboard') ? '#003366' : '#999'} />
            <Typography variant="caption" sx={{ color: location.pathname.includes('Dashboard') ? 'primary.main' : 'text.secondary', fontWeight: location.pathname.includes('Dashboard') ? 600 : 400, fontSize: '0.7rem' }}>
              Progress
            </Typography>
          </Link>
          <Link 
            to={createPageUrl('Library')} 
            onClick={() => location.pathname.includes('Library') && window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 12px', minHeight: 64, minWidth: 64, justifyContent: 'center' }}
          >
            <BookOpen size={24} color={location.pathname.includes('Library') ? '#003366' : '#999'} />
            <Typography variant="caption" sx={{ color: location.pathname.includes('Library') ? 'primary.main' : 'text.secondary', fontWeight: location.pathname.includes('Library') ? 600 : 400, fontSize: '0.7rem' }}>
              Library
            </Typography>
          </Link>
          <Link 
            to={createPageUrl('Profile')} 
            onClick={() => location.pathname.includes('Profile') && window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 12px', minHeight: 64, minWidth: 64, justifyContent: 'center' }}
          >
            <User size={24} color={location.pathname.includes('Profile') ? '#003366' : '#999'} />
            <Typography variant="caption" sx={{ color: location.pathname.includes('Profile') ? 'primary.main' : 'text.secondary', fontWeight: location.pathname.includes('Profile') ? 600 : 400, fontSize: '0.7rem' }}>
              Profile
            </Typography>
          </Link>
        </Box>
      </Box>

      {/* Become Tutor / Coordinator Dialogs - rendered outside MuiMenu to avoid focus trapping issues */}
      <BecomeTutorButton user={user} externalOpen={showTutorDialog} onExternalOpenChange={setShowTutorDialog} />
      <BecomeCoordinatorButton user={user} externalOpen={showCoordinatorDialog} onExternalOpenChange={setShowCoordinatorDialog} />

      {/* Admin Password Modal */}
      <Dialog open={showAdminPassword} onClose={() => setShowAdminPassword(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Admin Access</DialogTitle>
        <DialogContent>
          <TextField
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="Enter admin password"
            fullWidth
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && handleAdminAccess()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAdminPassword(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleAdminAccess} variant="contained" color="primary">
            Access
          </Button>
        </DialogActions>
      </Dialog>

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
                  <Link to={createPageUrl('Dashboard')} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                      My Learning
                    </Typography>
                  </Link>
                </ListItem>
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
            {getContent('footer_copyright', '© 2024 LearnHub. All rights reserved.')}
          </Typography>
        </Container>
      </Box>
    </Box>
    );
    }

const mathJaxConfig = {
  loader: { load: ['[tex]/mhchem', '[tex]/physics'] },
  tex: {
    packages: { '[+]': ['mhchem', 'physics'] },
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