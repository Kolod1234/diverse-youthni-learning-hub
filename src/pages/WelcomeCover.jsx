import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GraduationCap, Users, Award, Eye, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';

export default function WelcomeCover() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
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
        if (userData?.interest_type && userData.interest_type !== 'guest' && !forceShow) {
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
      // Logged-in user: save to database and navigate
      await base44.auth.updateMe({ interest_type: interestType });
      
      // Navigate to specific pages based on interest type
      if (interestType === 'leadership') {
        navigate(createPageUrl('HomeLeadership'));
      } else if (interestType === 'youth_work') {
        navigate(createPageUrl('HomeYouthWork'));
      } else if (interestType === 'learning') {
        navigate(createPageUrl('HomeLearning'));
      } else {
        navigate(createPageUrl('Home'));
      }
    } else {
      // Guest: save to localStorage or redirect to login
      if (interestType === 'guest') {
        localStorage.setItem('interest_type', 'guest');
        navigate(createPageUrl('Home'));
      } else {
        // Redirect to login with pending interest
        localStorage.setItem('pending_interest', interestType);
        base44.auth.redirectToLogin(window.location.origin + createPageUrl('WelcomeCover'));
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/4 left-1/3 w-96 h-96 bg-green-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}>

                <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 h-full overflow-hidden flex flex-col">
                  {pathway.image &&
                  <div className="relative h-48 w-full overflow-hidden flex-shrink-0">
                      <img
                      src={pathway.image}
                      alt={pathway.title}
                      className="w-full h-full object-cover" />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  }
                  <div className="p-6 flex flex-col flex-grow">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pathway.gradient} flex items-center justify-center mb-4 ${pathway.image ? '-mt-14 relative z-10 border-4 border-white/20' : ''}`}>
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
                    
                    <Button
                      onClick={() => handleSelectInterest(pathway.id)}
                      className={`w-full bg-gradient-to-r ${pathway.gradient} hover:opacity-90 text-white border-0`}>

                      {user ? 'Get Started' : 'Sign In & Continue'}
                    </Button>
                  </div>
                </Card>
              </motion.div>);

          })}
        </div>

        {/* Guest Option */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
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
          You can change your pathway anytime from your settings
        </p>
      </div>
    </div>);

}