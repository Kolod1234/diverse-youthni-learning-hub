import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
        GraduationCap, Home, Compass, BookOpen, Award, 
        Settings, LogOut, Menu, User, ClipboardList, BarChart3, MessageSquare, MoreVertical, Video, Layout as LayoutIcon, Users, Bell
      } from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';
import BecomeCoordinatorButton from '@/components/coordinator/BecomeCoordinatorButton';
import BecomeTutorButton from '@/components/tutor/BecomeTutorButton';
import ThemeToggle from '@/components/theme/ThemeToggle';
import ThemeProvider from '@/components/theme/ThemeProvider';
import { motion } from 'framer-motion';

function LayoutContent({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const location = useLocation();

  const { data: siteContent = [] } = useQuery({
    queryKey: ['site-content'],
    queryFn: () => base44.entities.SiteContent.list('key', 1000),
  });

  const getContent = (key, defaultValue) => {
    const item = siteContent.find(c => c.key === key);
    return item?.value || defaultValue;
  };

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
  const isAdmin = user && user.role === 'admin';
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
    <div className="relative w-full bg-background text-foreground min-h-screen">
      <style>
              {`
                /* Apply custom primary color if saved */
                :root {
                  --custom-primary: var(--color-primary, #FF8C00);
                }
              `}
            </style>
      {/* Header */}
      <header 
        className={`
          sticky top-0 z-50 transition-all duration-300
          ${scrolled 
            ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border' 
            : 'bg-background/80 backdrop-blur-sm'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69418fc30769c7d951368216/2c84fe800_Picsart_25-09-17_19-15-27-477.jpg"
                alt="Diverse Youth NI"
                className="h-12 lg:h-14 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link to={createPageUrl('Home')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                location.pathname === createPageUrl('Home') || location.pathname === '/'
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-foreground/70 hover:bg-accent hover:text-accent-foreground'
              }`}>
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>
              <Link to={createPageUrl('Explore')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                location.pathname.includes('Explore')
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-foreground/70 hover:bg-accent hover:text-accent-foreground'
              }`}>
                <Compass className="w-5 h-5" />
                <span>Explore</span>
              </Link>
              <Link to={createPageUrl('Library')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                location.pathname.includes('Library')
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-foreground/70 hover:bg-accent hover:text-accent-foreground'
              }`}>
                <BookOpen className="w-5 h-5" />
                <span>Library</span>
              </Link>
              <Link to={createPageUrl('Dashboard')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                location.pathname.includes('Dashboard')
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-foreground/70 hover:bg-accent hover:text-accent-foreground'
              }`}>
                <BookOpen className="w-5 h-5" />
                <span>My Learning</span>
              </Link>

              {/* More Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-4 py-2 rounded-lg text-foreground/70 hover:bg-accent hover:text-accent-foreground">
                    <MoreVertical className="w-5 h-5" />
                    <span>More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-64 max-h-[600px] overflow-y-auto bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-600 shadow-2xl rounded-xl p-2" 
                  sideOffset={8}
                  style={{ 
                    zIndex: 9999,
                    position: 'relative',
                    opacity: 1
                  }}
                >
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Tutors')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                        <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium">Tutors</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('YouthWork')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-green-50 dark:hover:bg-slate-700 transition-colors">
                        <GraduationCap className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="font-medium">Youth Work (OCN)</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('CCEAPastPapers')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors">
                        <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <span className="font-medium">CCEA Past Papers</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Sessions')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-red-50 dark:hover:bg-slate-700 transition-colors">
                        <Video className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <span className="font-medium">Live Sessions</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-slate-600" />
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('MessageCenter')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors">
                        <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <span className="font-medium">Messages</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Analytics')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors">
                        <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        <span className="font-medium">Analytics</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Achievements')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-yellow-50 dark:hover:bg-slate-700 transition-colors">
                        <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <span className="font-medium">Achievements</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('LearningPaths')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-teal-50 dark:hover:bg-slate-700 transition-colors">
                        <Award className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <span className="font-medium">Learning Paths</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Programs')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-pink-50 dark:hover:bg-slate-700 transition-colors">
                        <ClipboardList className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                        <span className="font-medium">Programmes</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-slate-600" />
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('CommunityEventSlides')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-lime-50 dark:hover:bg-slate-700 transition-colors">
                        <GraduationCap className="w-5 h-5 text-lime-600 dark:text-lime-400" />
                        <span className="font-medium">Event Slides</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('ContactUs')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-cyan-50 dark:hover:bg-slate-700 transition-colors">
                        <MessageSquare className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                        <span className="font-medium">Contact Us</span>
                      </Link>
                    </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {user && !user.is_coordinator && user.role !== 'admin' && (
                    <>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <BecomeCoordinatorButton user={user} />
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {user && !user.is_tutor && user.role !== 'admin' && (
                    <>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <BecomeTutorButton user={user} />
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {isCoordinator && !isTutorOrAdmin && (
                    <>
                      <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-slate-600" />
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('CoordinatorsDashboard')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors">
                          <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-medium">Coordinators Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {isTutorOrAdmin && (
                    <>
                      <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-slate-600" />
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tutor Tools
                      </div>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('TutorDashboardOverview')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                          <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium">Tutor Overview</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('LessonEditor')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors">
                          <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <span className="font-medium">Lesson Editor</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('Templates')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-pink-50 dark:hover:bg-slate-700 transition-colors">
                          <ClipboardList className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                          <span className="font-medium">Templates</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('DataPresentation')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors">
                          <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          <span className="font-medium">Data to Slides</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('PathwayManager')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors">
                          <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          <span className="font-medium">Pathway Manager</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('QuizGenerator')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-yellow-50 dark:hover:bg-slate-700 transition-colors">
                          <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                          <span className="font-medium">Quiz Generator</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('TutorSetup')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-teal-50 dark:hover:bg-slate-700 transition-colors">
                          <User className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                          <span className="font-medium">Tutor Setup</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('TutorDashboard')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors">
                          <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          <span className="font-medium">Full Tutor Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-slate-600" />
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Admin Panel
                      </div>
                      <DropdownMenuItem onClick={() => setShowAdminPassword(true)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-red-50 dark:hover:bg-slate-700 transition-colors">
                        <Settings className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <span className="font-medium">Admin Panel</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('AdminPageBuilder')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-violet-50 dark:hover:bg-slate-700 transition-colors">
                          <LayoutIcon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                          <span className="font-medium">Page Builder</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('AdminCoordinators')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors">
                          <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-medium">Manage Coordinators</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('AdminRSSFeed')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                          <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium">Manage RSS Feed</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('AdminLibrary')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors">
                          <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <span className="font-medium">Manage Library</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('AdminQuotes')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-pink-50 dark:hover:bg-slate-700 transition-colors">
                          <MessageSquare className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                          <span className="font-medium">Manage Quotes</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('AdminStudentOfMonth')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-yellow-50 dark:hover:bg-slate-700 transition-colors">
                          <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                          <span className="font-medium">Student of Month</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('AdminDailyFacts')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-teal-50 dark:hover:bg-slate-700 transition-colors">
                          <MessageSquare className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                          <span className="font-medium">Manage Facts</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('AdminDiscover')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-cyan-50 dark:hover:bg-slate-700 transition-colors">
                          <MessageSquare className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                          <span className="font-medium">Manage Discover</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('AdminReviews')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors">
                          <Award className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          <span className="font-medium">Manage Reviews</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('AdminReminders')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-cyan-50 dark:hover:bg-slate-700 transition-colors">
                          <Bell className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                          <span className="font-medium">Student Reminders</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('AdminStudentMessages')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors">
                          <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          <span className="font-medium">Send Student Messages</span>
                        </Link>
                      </DropdownMenuItem>
                      </>
                      )}

                      {isTutorOrAdmin && !isAdmin && (
                      <>
                      <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-slate-600" />
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('AdminReminders')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-cyan-50 dark:hover:bg-slate-700 transition-colors">
                          <Bell className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                          <span className="font-medium">Student Reminders</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('AdminStudentMessages')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-900 dark:text-white hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors">
                          <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          <span className="font-medium">Send Student Messages</span>
                        </Link>
                      </DropdownMenuItem>
                      </>
                      )}
                      </DropdownMenuContent>
                      </DropdownMenu>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notifications */}
              <NotificationBell />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {user?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{user?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('Dashboard')} className="flex items-center cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      My Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('Settings')} className="flex items-center cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('Dashboard')} className="flex items-center cursor-pointer">
                      <Award className="w-4 h-4 mr-2" />
                      Achievements
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => base44.auth.logout()}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 overflow-y-auto p-0">
                  <ScrollArea className="h-full w-full">
                  <div className="flex flex-col gap-4 mt-8 pb-8 px-6">
                    <NavLinks mobile onItemClick={() => {}} />
                    
                    {/* Become Coordinator - Mobile */}
                    {user && !user.is_coordinator && user.role !== 'admin' && (
                      <div className="px-2 py-1">
                        <BecomeCoordinatorButton user={user} />
                      </div>
                    )}

                    {/* Become Tutor - Mobile */}
                    {user && !user.is_tutor && user.role !== 'admin' && (
                      <div className="px-2 py-1">
                        <BecomeTutorButton user={user} />
                      </div>
                    )}

                    {isCoordinator && !isTutorOrAdmin && (
                      <Link to={createPageUrl('CoordinatorsDashboard')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-foreground/70 hover:bg-accent hover:text-accent-foreground">
                        <User className="w-5 h-5" />
                        <span>Coordinators Dashboard</span>
                      </Link>
                    )}

                    {isTutorOrAdmin && (
                      <>
                        <div className="border-t border-border my-2" />
                        <Link to={createPageUrl('TutorDashboardOverview')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-foreground/70 hover:bg-accent hover:text-accent-foreground">
                          <Settings className="w-5 h-5" />
                          <span>Tutor Overview</span>
                        </Link>
                        <Link to={createPageUrl('Templates')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-foreground/70 hover:bg-accent hover:text-accent-foreground">
                          <ClipboardList className="w-5 h-5" />
                          <span>Templates</span>
                        </Link>
                        <Link to={createPageUrl('TutorDashboard')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-foreground/70 hover:bg-accent hover:text-accent-foreground">
                          <Settings className="w-5 h-5" />
                          <span>Full Tutor Dashboard</span>
                        </Link>
                      </>
                    )}

                    {isAdmin && (
                      <>
                        <div className="border-t border-border my-2" />
                        <button onClick={() => setShowAdminPassword(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-foreground/70 hover:bg-accent hover:text-accent-foreground w-full text-left">
                          <Settings className="w-5 h-5" />
                          <span>Admin Panel</span>
                        </button>
                        <Link to={createPageUrl('AdminCoordinators')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-foreground/70 hover:bg-accent hover:text-accent-foreground">
                          <User className="w-5 h-5" />
                          <span>Manage Coordinators</span>
                        </Link>
                        <Link to={createPageUrl('AdminRSSFeed')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-foreground/70 hover:bg-accent hover:text-accent-foreground">
                          <MessageSquare className="w-5 h-5" />
                          <span>Manage RSS Feed</span>
                        </Link>
                        <Link to={createPageUrl('AdminLibrary')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-foreground/70 hover:bg-accent hover:text-accent-foreground">
                          <BookOpen className="w-5 h-5" />
                          <span>Manage Library</span>
                        </Link>
                        <Link to={createPageUrl('CCEAPastPapers')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-foreground/70 hover:bg-accent hover:text-accent-foreground">
                          <BookOpen className="w-5 h-5" />
                          <span>CCEA Past Papers</span>
                        </Link>
                        <Link to={createPageUrl('AdminQuotes')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-foreground/70 hover:bg-accent hover:text-accent-foreground">
                          <MessageSquare className="w-5 h-5" />
                          <span>Manage Quotes</span>
                        </Link>
                        <Link to={createPageUrl('AdminStudentOfMonth')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-foreground/70 hover:bg-accent hover:text-accent-foreground">
                          <Award className="w-5 h-5" />
                          <span>Student of Month</span>
                        </Link>
                        <Link to={createPageUrl('AdminDailyFacts')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-foreground/70 hover:bg-accent hover:text-accent-foreground">
                          <MessageSquare className="w-5 h-5" />
                          <span>Manage Facts</span>
                        </Link>
                        <Link to={createPageUrl('AdminDiscover')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-foreground/70 hover:bg-accent hover:text-accent-foreground">
                          <MessageSquare className="w-5 h-5" />
                          <span>Manage Discover</span>
                        </Link>
                      </>
                      )}
                      </div>
                      </ScrollArea>
                      </SheetContent>
                      </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full pb-20 md:pb-0">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 shadow-lg">
        <div className="flex items-center justify-around h-16">
          <Link to={createPageUrl('Explore')} className="flex flex-col items-center gap-1 px-3 py-2">
            <Compass className={`w-5 h-5 ${location.pathname.includes('Explore') ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-xs ${location.pathname.includes('Explore') ? 'text-primary font-medium' : 'text-muted-foreground'}`}>Courses</span>
          </Link>
          <Link to={createPageUrl('Dashboard')} className="flex flex-col items-center gap-1 px-3 py-2">
            <BarChart3 className={`w-5 h-5 ${location.pathname.includes('Dashboard') ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-xs ${location.pathname.includes('Dashboard') ? 'text-primary font-medium' : 'text-muted-foreground'}`}>Progress</span>
          </Link>
          <Link to={createPageUrl('Library')} className="flex flex-col items-center gap-1 px-3 py-2">
            <BookOpen className={`w-5 h-5 ${location.pathname.includes('Library') ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-xs ${location.pathname.includes('Library') ? 'text-primary font-medium' : 'text-muted-foreground'}`}>Library</span>
          </Link>
          <Link to={createPageUrl('Profile')} className="flex flex-col items-center gap-1 px-3 py-2">
            <User className={`w-5 h-5 ${location.pathname.includes('Profile') ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-xs ${location.pathname.includes('Profile') ? 'text-primary font-medium' : 'text-muted-foreground'}`}>Profile</span>
          </Link>
        </div>
      </nav>

      {/* Admin Password Modal */}
      {showAdminPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAdminPassword(false)}>
          <div className="bg-card rounded-2xl p-6 w-96 shadow-xl border border-border" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-foreground">Admin Access</h3>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-2 bg-background border border-input rounded-lg mb-4 text-foreground"
              onKeyPress={(e) => e.key === 'Enter' && handleAdminAccess()}
            />
            <div className="flex gap-3">
              <button onClick={handleAdminAccess} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition">
                Access
              </button>
              <button onClick={() => setShowAdminPassword(false)} className="flex-1 border border-border py-2 rounded-lg hover:bg-accent transition text-foreground">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link to={createPageUrl('Home')} className="flex items-center gap-2 mb-4">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69418fc30769c7d951368216/2c84fe800_Picsart_25-09-17_19-15-27-477.jpg"
                  alt="Diverse Youth NI"
                  className="h-12 w-auto object-contain"
                />
              </Link>
              <p className="text-muted-foreground text-sm">
                Empowering learners worldwide with expert-led courses and cutting-edge content.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl('Explore')} className="text-muted-foreground hover:text-primary transition">Browse Courses</Link></li>
                <li><Link to={createPageUrl('Dashboard')} className="text-muted-foreground hover:text-primary transition">My Learning</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl('ContactUs')} className="text-muted-foreground hover:text-primary transition">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="text-muted-foreground">Privacy Policy</span></li>
                <li><span className="text-muted-foreground">Terms of Service</span></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>{getContent('footer_copyright', '© 2024 LearnHub. All rights reserved.')}</p>
          </div>
        </div>
      </footer>
    </div>
    );
    }

    export default function Layout({ children, currentPageName }) {
    return (
    <ThemeProvider>
    <LayoutContent children={children} currentPageName={currentPageName} />
    </ThemeProvider>
    );
    }