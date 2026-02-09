import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Presentation, Layout, Sparkles, Zap, BookOpen, Star, ChevronRight } from 'lucide-react';
import { Button, Box, Typography, Chip } from '@mui/material';
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
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #581c87, #312e81)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', border: '4px solid', borderColor: 'transparent', borderTopColor: '#f97316', borderRightColor: '#a855f7', borderBottomColor: '#6366f1', mx: 'auto', mb: 2 }} className="animate-spin" />
            <Typography sx={{ color: 'white', fontSize: '1.125rem', fontWeight: 500 }}>Loading your experience...</Typography>
          </Box>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #581c87, #312e81)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, position: 'relative', overflow: 'hidden' }}>
      {/* Animated background elements */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        >
          <Box sx={{ position: 'absolute', top: '-25%', left: '-25%', width: '50%', height: '50%', bgcolor: 'rgba(249, 115, 22, 0.1)', borderRadius: '50%', filter: 'blur(80px)' }} />
        </motion.div>
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        >
          <Box sx={{ position: 'absolute', bottom: '-25%', right: '-25%', width: '50%', height: '50%', bgcolor: 'rgba(168, 85, 247, 0.1)', borderRadius: '50%', filter: 'blur(80px)' }} />
        </motion.div>
      </Box>

      <Box sx={{ maxWidth: 1280, width: '100%', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              <Box sx={{ width: 96, height: 96, background: 'linear-gradient(to bottom right, #f97316, #9333ea)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3, boxShadow: 8 }}>
                <Sparkles size={48} color="white" />
              </Box>
            </motion.div>
            <Typography variant="h2" sx={{ fontSize: { xs: '3rem', md: '3.75rem' }, fontWeight: 700, color: 'white', mb: 2, background: 'linear-gradient(to right, #fb923c, #a78bfa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Choose Your Learning Experience
            </Typography>
            <Typography sx={{ color: '#d1d5db', fontSize: '1.25rem' }}>Select the lesson player that works best for you</Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.875rem', color: '#9ca3af' }}>
                <Star size={16} color="#fbbf24" />
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>Premium Experience</Typography>
              </Box>
              <Box sx={{ width: 4, height: 4, bgcolor: '#4b5563', borderRadius: '50%' }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.875rem', color: '#9ca3af' }}>
                <Zap size={16} color="#fb923c" />
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>Instant Switch</Typography>
              </Box>
            </Box>
          </Box>
        </motion.div>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 4 }}>
          {/* PowerPoint Style */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
          >
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(24px)', borderRadius: 6, boxShadow: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)', '&:hover': { borderColor: 'rgba(251, 146, 60, 0.5)' }, transition: 'all 0.3s', position: 'relative' }}>
              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom right, rgba(249, 115, 22, 0.05), rgba(220, 38, 38, 0.05))', opacity: 0, '&:hover': { opacity: 1 }, transition: 'opacity 0.3s' }} />
              
              <Box sx={{ aspectRatio: '16/9', background: 'linear-gradient(to bottom right, #f97316, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <motion.div
                  animate={{ rotate: [0, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Presentation size={128} color="white" style={{ filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.5))' }} />
                </motion.div>
                <Chip 
                  label="POPULAR" 
                  size="small"
                  sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', color: 'white', fontSize: '0.75rem', fontWeight: 600 }}
                />
              </Box>
              
              <Box sx={{ p: 4, position: 'relative', zIndex: 10 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>PowerPoint Style</Typography>
                  <Box sx={{ width: 48, height: 48, background: 'linear-gradient(to bottom right, #f97316, #dc2626)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={24} color="white" />
                  </Box>
                </Box>
                
                <Typography sx={{ color: '#d1d5db', mb: 3, lineHeight: 1.75 }}>
                  Professional presentation mode with ribbon toolbar, filmstrip navigation, and immersive fullscreen experience.
                </Typography>
                
                <Box component="ul" sx={{ listStyle: 'none', p: 0, mb: 4, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#e5e7eb' }}>
                        <Box sx={{ width: 32, height: 32, background: 'linear-gradient(to bottom right, rgba(249, 115, 22, 0.2), rgba(220, 38, 38, 0.2))', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <item.icon size={16} color="#fb923c" />
                        </Box>
                        <Typography>{item.text}</Typography>
                      </Box>
                    </motion.li>
                  ))}
                </Box>
                
                <Button
                  onClick={() => savePreference('LessonPlayerPowerPoint')}
                  variant="contained"
                  fullWidth
                  endIcon={<ChevronRight size={20} />}
                  sx={{
                    background: 'linear-gradient(to right, #ea580c, #dc2626)',
                    color: 'white',
                    fontWeight: 600,
                    py: 3,
                    borderRadius: 3,
                    boxShadow: 4,
                    '&:hover': {
                      background: 'linear-gradient(to right, #f97316, #ef4444)',
                      boxShadow: '0 10px 30px rgba(249, 115, 22, 0.5)',
                    },
                  }}
                >
                  Use PowerPoint Style
                </Button>
              </Box>
            </Box>
          </motion.div>

          {/* Classic Style */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
          >
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(24px)', borderRadius: 6, boxShadow: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)', '&:hover': { borderColor: 'rgba(168, 85, 247, 0.5)' }, transition: 'all 0.3s', position: 'relative' }}>
              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom right, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05))', opacity: 0, '&:hover': { opacity: 1 }, transition: 'opacity 0.3s' }} />
              
              <Box sx={{ aspectRatio: '16/9', background: 'linear-gradient(to bottom right, #6366f1, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Layout size={128} color="white" style={{ filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.5))' }} />
                </motion.div>
                <Chip 
                  label="CLASSIC" 
                  size="small"
                  sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', color: 'white', fontSize: '0.75rem', fontWeight: 600 }}
                />
              </Box>
              
              <Box sx={{ p: 4, position: 'relative', zIndex: 10 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>Classic Style</Typography>
                  <Box sx={{ width: 48, height: 48, background: 'linear-gradient(to bottom right, #6366f1, #9333ea)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={24} color="white" />
                  </Box>
                </Box>
                
                <Typography sx={{ color: '#d1d5db', mb: 3, lineHeight: 1.75 }}>
                  Clean and simple interface focused on content. Perfect for distraction-free learning with easy navigation.
                </Typography>
                
                <Box component="ul" sx={{ listStyle: 'none', p: 0, mb: 4, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#e5e7eb' }}>
                        <Box sx={{ width: 32, height: 32, background: 'linear-gradient(to bottom right, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <item.icon size={16} color="#c084fc" />
                        </Box>
                        <Typography>{item.text}</Typography>
                      </Box>
                    </motion.li>
                  ))}
                </Box>
                
                <Button
                  onClick={() => savePreference('LessonPlayerClassic')}
                  variant="contained"
                  fullWidth
                  endIcon={<ChevronRight size={20} />}
                  sx={{
                    background: 'linear-gradient(to right, #6366f1, #9333ea)',
                    color: 'white',
                    fontWeight: 600,
                    py: 3,
                    borderRadius: 3,
                    boxShadow: 4,
                    '&:hover': {
                      background: 'linear-gradient(to right, #818cf8, #a855f7)',
                      boxShadow: '0 10px 30px rgba(168, 85, 247, 0.5)',
                    },
                  }}
                >
                  Use Classic Style
                </Button>
              </Box>
            </Box>
          </motion.div>
        </Box>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Box sx={{ textAlign: 'center', mt: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Sparkles size={16} color="#9ca3af" />
            <Typography sx={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              Don't worry, you can always change your preference later in settings
            </Typography>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}