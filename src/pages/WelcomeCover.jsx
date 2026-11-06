import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getPathways, savePathways, PENDING_KEY } from '@/components/pathways/pathways';
import { Button, Card } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const GraduationCap = _w(SchoolIcon), Users = _w(PeopleIcon), Award = _w(EmojiEventsIcon), Eye = _w(VisibilityIcon), ArrowRight = _w(ArrowForwardIcon);
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';

export default function WelcomeCover() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const forceShow = location.state?.forceShow;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);

        // Admins can always access the cover page
        if (userData?.role === 'admin') {
          setLoading(false);
          return;
        }

        // If user already has an interest, redirect them (unless forced to show)
        if (getPathways(userData).length && !forceShow) {
          navigate(createPageUrl('Home'));
        }
      } catch (error) {

        // Not logged in - that's fine
      } finally {setLoading(false);
      }
    };
    loadUser();
  }, [navigate]);

  const handleSelectInterest = async (interestType) => {
    if (user) {
      if (interestType === 'guest') { navigate(createPageUrl('Home') + '?view=public'); return; }
      // Logged-in user: save their own choice, refresh it everywhere, then go to their hub.
      await savePathways([interestType]);
      await queryClient.invalidateQueries({ queryKey: ['auth-me'] });
      // First time on Youth Work or Leadership: the About page explains the pathway first.
      if (!forceShow && interestType === 'leadership') navigate(createPageUrl('LeadershipLanding'));
      else if (!forceShow && interestType === 'youth_work') navigate(createPageUrl('YouthWorkLanding'));
      else navigate(createPageUrl('Home'));
    } else {
      // Guest: save to localStorage or redirect to login
      if (interestType === 'guest') {
        localStorage.setItem('interest_type', 'guest');
        navigate(createPageUrl('Home'));
      } else {
        // Sign in first; the hub on Home saves this choice when they come back.
        try { localStorage.setItem(PENDING_KEY, interestType); } catch { /* choose again after signing in */ }
        base44.auth.redirectToLogin(window.location.origin + createPageUrl('Home'));
      }
    }
  };

  const pathways = [
  {
    id: 'leadership',
    title: 'Leadership Programme',
    description: 'Mentoring, activities, logbooks, and personal development',
    icon: Users,
    gradient: 'from-purple-500 to-indigo-600',
    features: ['Track Progress', 'Weekly Activities', 'Mentor Support', 'Digital Logbooks'],
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69418fc30769c7d951368216/bba9d6785_DSC00124.jpg'
  },
  {
    id: 'learning',
    title: 'GCSE & A-Level',
    description: 'Comprehensive courses, lessons, quizzes, and resources',
    icon: GraduationCap,
    gradient: 'from-blue-500 to-cyan-600',
    features: ['Interactive Lessons', 'Past Papers', 'Live Sessions', 'Study Library'],
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69418fc30769c7d951368216/73bf1b641_PXL_20250405_120925148.jpg'
  },
  {
    id: 'youth_work',
    title: 'Youth Work (OCN)',
    description: 'OCN qualifications, workbooks, and certification',
    icon: Award,
    gradient: 'from-green-500 to-emerald-600',
    features: ['OCN Courses', 'Workbook Tasks', 'Attendance Tracking', 'Certification'],
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69418fc30769c7d951368216/adfaefdeb_PXL_20240718_134233296PORTRAIT.jpg'
  }];


  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b2f5c] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-[#0b2f5c] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/4 left-1/3 w-96 h-96 bg-green-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-16">

          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69418fc30769c7d951368216/2c84fe800_Picsart_25-09-17_19-15-27-477.jpg"
            alt="Diverse Youth NI"
            className="h-20 w-20 mx-auto mb-8 rounded-full object-contain" />

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Welcome to Diverse Youth NI Learning Hub

          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose your pathway to get a personalized experience tailored to your goals
          </p>
        </motion.div>

        {/* Pathways Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {pathways.map((pathway, index) => {
            const Icon = pathway.icon;
            return (
              <motion.div
                key={pathway.id}

>

                <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 h-full overflow-hidden flex flex-col">
                  {pathway.image &&
                  <div className="relative h-48 w-full overflow-hidden flex-shrink-0">
                      <img
                      src={pathway.image}
                      alt={pathway.title}
                      className="w-full h-full object-cover" />

                      <div className="absolute inset-0 bg-indigo-600" />
                    </div>
                  }
                  <div className="p-6 flex flex-col flex-grow">
                    <div className={`w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 ${pathway.image ? '-mt-14 relative z-10 border-4 border-white/20' : ''}`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">{pathway.title}</h3>
                    <p className="text-gray-300 mb-4 flex-grow">{pathway.description}</p>
                    
                    <ul className="space-y-2 mb-6">
                      {pathway.features.map((feature) =>
                      <li key={feature} className="flex items-center text-sm text-gray-300">
                          <ArrowRight className="w-4 h-4 mr-2 text-green-400" />
                          {feature}
                        </li>
                      )}
                    </ul>
                    
                    <Button variant="contained"
                      onClick={() => handleSelectInterest(pathway.id)}
                      className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0`}>

                      {user ? 'Get Started' : 'Sign In & Continue'}
                    </Button>
                  </div>
                </Card>
              </motion.div>);

          })}
        </div>

        {/* Guest Option */}
        <motion.div
          className="text-center">

          <Card className="bg-white/5 backdrop-blur-lg border-white/10 inline-block">
            <div className="p-6">
              <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-white mb-2">Just Browsing?</h3>
              <p className="text-gray-300 mb-4">
                Explore our platform without signing in (limited access)
              </p>
              <Button
                onClick={() => handleSelectInterest('guest')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10">

                Continue as Guest
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Skip to Full Homepage */}
        <motion.div
          className="text-center mt-8">

          <button
            onClick={() => {
              sessionStorage.setItem('skip_home_redirect', 'true');
              navigate(createPageUrl('Home'));
            }}
            className="text-gray-400 hover:text-white transition-colors text-sm underline">

            Skip and view full homepage
          </button>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-gray-400 mt-6 text-sm">
          You can change your pathway at any time from your account menu
        </p>
      </div>
    </div>);

}