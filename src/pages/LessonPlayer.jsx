import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Presentation, Layout, Sparkles, Zap, BookOpen, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function LessonPlayer() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const lessonId = params.get('lesson');
  const courseId = params.get('course');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Check lesson for content
        const lessons = await base44.entities.Lesson.filter({ id: lessonId });
        const lesson = lessons[0];
        
        // Priority: User preference > Lesson default > Auto-detect based on content
        
        // If user has a preference, use it
        if (userData.player_preference) {
          navigate(`/${userData.player_preference}?lesson=${lessonId}&course=${courseId}`, { replace: true });
          return;
        }
        
        // Check lesson for default player set by tutor/admin
        if (lesson?.default_player) {
          navigate(`/${lesson.default_player}?lesson=${lessonId}&course=${courseId}`, { replace: true });
          return;
        }
        
        // Auto-route based on content type - always default to PowerPoint for Google Slides
        navigate(`/LessonPlayerPowerPoint?lesson=${lessonId}&course=${courseId}`, { replace: true });
        return;
      } catch (error) {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handlePlayerSelect = (playerType) => {
    const url = `/${playerType}?lesson=${lessonId}&course=${courseId}`;
    navigate(url);
  };

  const savePreference = async (playerType) => {
    if (user) {
      await base44.auth.updateMe({ player_preference: playerType });
    }
    handlePlayerSelect(playerType);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-orange-500 border-r-purple-500 border-b-indigo-500 border-l-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading your experience...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-orange-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-5xl w-full relative z-10">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="w-24 h-24 bg-gradient-to-br from-orange-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
          >
            <Sparkles className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-purple-400 to-indigo-400">
            Choose Your Learning Experience
          </h1>
          <p className="text-gray-300 text-xl">Select the lesson player that works best for you</p>
          
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>Premium Experience</span>
            </div>
            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Zap className="w-4 h-4 text-orange-400" />
              <span>Instant Switch</span>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* PowerPoint Style */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 hover:border-orange-400/50 transition-all group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="aspect-video bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center relative overflow-hidden">
              <motion.div
                animate={{ rotate: [0, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Presentation className="w-32 h-32 text-white drop-shadow-2xl" />
              </motion.div>
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white font-semibold">
                POPULAR
              </div>
            </div>
            
            <div className="p-8 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-3xl font-bold text-white">PowerPoint Style</h3>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                Professional presentation mode with ribbon toolbar, filmstrip navigation, and immersive fullscreen experience.
              </p>
              
              <ul className="space-y-3 mb-8">
                {[
                  { icon: Presentation, text: "Ribbon-style toolbar" },
                  { icon: Zap, text: "Presentation mode" },
                  { icon: Layout, text: "Filmstrip navigation" },
                  { icon: Star, text: "Keyboard shortcuts" }
                ].map((item, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="flex items-center gap-3 text-gray-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-lg flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-orange-400" />
                    </div>
                    <span>{item.text}</span>
                  </motion.li>
                ))}
              </ul>
              
              <Button
                onClick={() => savePreference('LessonPlayerPowerPoint')}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-orange-500/50 transition-all group/btn"
                size="lg"
              >
                <span>Use PowerPoint Style</span>
                <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>

          {/* Classic Style */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 hover:border-purple-400/50 transition-all group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Layout className="w-32 h-32 text-white drop-shadow-2xl" />
              </motion.div>
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white font-semibold">
                CLASSIC
              </div>
            </div>
            
            <div className="p-8 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-3xl font-bold text-white">Classic Style</h3>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                Clean and simple interface focused on content. Perfect for distraction-free learning with easy navigation.
              </p>
              
              <ul className="space-y-3 mb-8">
                {[
                  { icon: Layout, text: "Clean, minimal interface" },
                  { icon: BookOpen, text: "Sidebar navigation" },
                  { icon: Zap, text: "Distraction-free view" },
                  { icon: Star, text: "Easy to use" }
                ].map((item, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="flex items-center gap-3 text-gray-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-purple-400" />
                    </div>
                    <span>{item.text}</span>
                  </motion.li>
                ))}
              </ul>
              
              <Button
                onClick={() => savePreference('LessonPlayerClassic')}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all group/btn"
                size="lg"
              >
                <span>Use Classic Style</span>
                <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-gray-400 mt-12 text-sm flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Don't worry, you can always change your preference later in settings
        </motion.p>
      </div>
    </div>
  );
}