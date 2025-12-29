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
import { 
  GraduationCap, Home, Compass, BookOpen, Award, 
  Settings, LogOut, Menu, User, ClipboardList, BarChart3, MessageSquare, MoreVertical
} from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';
import BecomeCoordinatorButton from '@/components/coordinator/BecomeCoordinatorButton';
import { motion } from 'framer-motion';

export default function Layout({ children, currentPageName }) {
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
    { name: 'Messages', href: createPageUrl('MessageCenter'), icon: MessageSquare },
    { name: 'Analytics', href: createPageUrl('Analytics'), icon: BarChart3 },
    { name: 'Achievements', href: createPageUrl('Achievements'), icon: Award },
    { name: 'Learning Paths', href: createPageUrl('LearningPaths'), icon: Award },
    { name: 'Programmes', href: createPageUrl('Programs'), icon: ClipboardList },
    { name: 'Profile', href: createPageUrl('Profile'), icon: User },
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
                text-gray-600 hover:bg-gray-50 hover:text-gray-900
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
                ? 'bg-orange-50 text-[#FF8C00] font-medium' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
    <div className="relative w-full bg-gray-50">
      <style>
        {`
          :root {
            --color-primary: #EA580C;
            --color-primary-light: #FB923C;
            --color-primary-dark: #C2410C;
          }
        `}
      </style>
      {/* Header */}
      <header 
        className={`
          sticky top-0 z-50 transition-all duration-300
          ${scrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' 
            : 'bg-transparent'
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
                  ? 'bg-orange-50 text-[#FF8C00] font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>
              <Link to={createPageUrl('Explore')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                location.pathname.includes('Explore')
                  ? 'bg-orange-50 text-[#FF8C00] font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
                <Compass className="w-5 h-5" />
                <span>Explore</span>
              </Link>
              <Link to={createPageUrl('Dashboard')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                location.pathname.includes('Dashboard')
                  ? 'bg-orange-50 text-[#FF8C00] font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
                <BookOpen className="w-5 h-5" />
                <span>My Learning</span>
              </Link>

              {/* More Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                    <MoreVertical className="w-5 h-5" />
                    <span>More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('Tutors')} className="flex items-center cursor-pointer">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Tutors
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('MessageCenter')} className="flex items-center cursor-pointer">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Messages
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('Analytics')} className="flex items-center cursor-pointer">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('Achievements')} className="flex items-center cursor-pointer">
                      <Award className="w-4 h-4 mr-2" />
                      Achievements
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('LearningPaths')} className="flex items-center cursor-pointer">
                      <Award className="w-4 h-4 mr-2" />
                      Learning Paths
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('Programs')} className="flex items-center cursor-pointer">
                      <ClipboardList className="w-4 h-4 mr-2" />
                      Programmes
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('ContactUs')} className="flex items-center cursor-pointer">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact Us
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {isCoordinator && !isTutorOrAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('CoordinatorsDashboard')} className="flex items-center cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        Coordinators Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isTutorOrAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('Templates')} className="flex items-center cursor-pointer">
                          <ClipboardList className="w-4 h-4 mr-2" />
                          Templates
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('DataPresentation')} className="flex items-center cursor-pointer">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Data to Slides
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('QuizGenerator')} className="flex items-center cursor-pointer">
                          <Award className="w-4 h-4 mr-2" />
                          Quiz Generator
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('TutorSetup')} className="flex items-center cursor-pointer">
                          <User className="w-4 h-4 mr-2" />
                          Tutor Setup
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('TutorDashboard')} className="flex items-center cursor-pointer">
                          <Settings className="w-4 h-4 mr-2" />
                          Tutor Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => setShowAdminPassword(true)} className="cursor-pointer">
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('AdminCoordinators')} className="flex items-center cursor-pointer">
                          <User className="w-4 h-4 mr-2" />
                          Manage Coordinators
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Become Coordinator Button */}
              <BecomeCoordinatorButton user={user} />

              {/* Notifications */}
              <NotificationBell />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-orange-100 text-[#FF8C00] font-medium">
                        {user?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{user?.full_name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('Dashboard')} className="flex items-center cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      My Dashboard
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
                <SheetContent side="right" className="w-72 overflow-y-auto">
                  <div className="flex flex-col gap-4 mt-8 pb-8">
                    <NavLinks mobile onItemClick={() => {}} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full">{children}</main>

      {/* Admin Password Modal */}
      {showAdminPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAdminPassword(false)}>
          <div className="bg-white rounded-2xl p-6 w-96 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Admin Access</h3>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-2 border rounded-lg mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleAdminAccess()}
            />
            <div className="flex gap-3">
              <button onClick={handleAdminAccess} className="flex-1 bg-[#FF8C00] text-white py-2 rounded-lg hover:bg-[#CC7000]">
                Access
              </button>
              <button onClick={() => setShowAdminPassword(false)} className="flex-1 border py-2 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-20">
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
              <p className="text-gray-500 text-sm">
                Empowering learners worldwide with expert-led courses and cutting-edge content.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl('Explore')} className="text-gray-500 hover:text-[#FF8C00]">Browse Courses</Link></li>
                <li><Link to={createPageUrl('Dashboard')} className="text-gray-500 hover:text-[#FF8C00]">My Learning</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl('ContactUs')} className="text-gray-500 hover:text-[#FF8C00]">Contact Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="text-gray-500">Privacy Policy</span></li>
                <li><span className="text-gray-500">Terms of Service</span></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-100 mt-12 pt-8 text-center text-sm text-gray-500">
            <p>{getContent('footer_copyright', '© 2024 LearnHub. All rights reserved.')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}