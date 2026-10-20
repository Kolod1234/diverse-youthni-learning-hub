import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Box, Container, Card, CardContent, Chip, Tabs, Tab, LinearProgress, Button, Typography, Grid, Avatar, CardMedia } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import StarIcon from '@mui/icons-material/Star';
import BoltIcon from '@mui/icons-material/Bolt';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LockIcon from '@mui/icons-material/Lock';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const Trophy = _w(EmojiEventsIcon), Award = _w(MilitaryTechIcon), Star = _w(StarIcon), Zap = _w(BoltIcon);
const Target = _w(GpsFixedIcon), Crown = _w(WorkspacePremiumIcon), Flame = _w(LocalFireDepartmentIcon), Sparkles = _w(AutoAwesomeIcon);
const Lock = _w(LockIcon), ChevronLeft = _w(ChevronLeftIcon), ChevronRight = _w(ChevronRightIcon);
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';

const ACHIEVEMENT_CONFIGS = {
  first_lesson: { icon: Sparkles, color: 'from-blue-400 to-blue-600', title: 'First Steps', description: 'Complete your first lesson', points: 10 },
  five_lessons: { icon: Star, color: 'from-purple-400 to-purple-600', title: 'Rising Star', description: 'Complete 5 lessons', points: 25 },
  ten_lessons: { icon: Zap, color: 'from-yellow-400 to-yellow-600', title: 'Power Learner', description: 'Complete 10 lessons', points: 50 },
  first_quiz: { icon: Target, color: 'from-green-400 to-green-600', title: 'Quiz Master', description: 'Pass your first quiz', points: 15 },
  perfect_quiz: { icon: Trophy, color: 'from-amber-400 to-amber-600', title: 'Perfect Score', description: 'Get 100% on a quiz', points: 50 },
  week_streak: { icon: Flame, color: 'from-orange-400 to-red-500', title: 'Week Warrior', description: '7-day learning streak', points: 30 },
  month_streak: { icon: Crown, color: 'from-red-500 to-pink-600', title: 'Dedicated Scholar', description: '30-day learning streak', points: 100 },
  course_complete: { icon: Award, color: 'from-indigo-400 to-indigo-600', title: 'Course Champion', description: 'Complete your first course', points: 100 },
  five_courses: { icon: Trophy, color: 'from-emerald-400 to-emerald-600', title: 'Knowledge Seeker', description: 'Complete 5 courses', points: 250 },
  level_5: { icon: Star, color: 'from-violet-400 to-violet-600', title: 'Rising Expert', description: 'Reach Level 5', points: 0 },
  level_10: { icon: Crown, color: 'from-amber-400 to-yellow-500', title: 'Master Learner', description: 'Reach Level 10', points: 0 },
  top_ten: { icon: Trophy, color: 'from-yellow-400 to-orange-500', title: 'Top 10', description: 'Enter the top 10 leaderboard', points: 50 },
  instructor_bonus: { icon: Award, color: 'from-pink-400 to-rose-600', title: 'Instructor Recognition', description: 'Recognized for outstanding contribution', points: 0 },
};

export default function Achievements() {
  const [user, setUser] = useState(null);
  const [tabValue, setTabValue] = useState('all');

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: () => base44.entities.Achievement.filter({ created_by: user?.email }, '-earned_date', 100),
    enabled: !!user?.email,
  });

  const { data: userProgress } = useQuery({
    queryKey: ['user-progress', user?.email],
    queryFn: async () => {
      const progressList = await base44.entities.UserProgress.filter({ created_by: user?.email });
      return progressList[0] || { points: 0, level: 1, streak_days: 0, total_lessons_completed: 0, total_quizzes_completed: 0 };
    },
    enabled: !!user?.email,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ created_by: user?.email, is_completed: true }),
    enabled: !!user?.email,
  });

  const allAchievements = Object.entries(ACHIEVEMENT_CONFIGS).map(([key, config]) => ({
    key,
    ...config,
    earned: achievements.some(a => a.icon === key),
    earnedDate: achievements.find(a => a.icon === key)?.earned_date,
  }));

  const earnedCount = allAchievements.filter(a => a.earned).length;
  const totalCount = allAchievements.length;
  const completionPercent = (earnedCount / totalCount) * 100;

  const milestones = [
    { name: 'Lessons Completed', current: userProgress?.total_lessons_completed || 0, target: 50, icon: Sparkles },
    { name: 'Quizzes Passed', current: userProgress?.total_quizzes_completed || 0, target: 20, icon: Target },
    { name: 'Courses Finished', current: enrollments.length, target: 5, icon: Trophy },
    { name: 'Current Streak', current: userProgress?.streak_days || 0, target: 30, icon: Flame },
  ];

  const filteredAchievements = tabValue === 'earned' 
    ? allAchievements.filter(a => a.earned)
    : tabValue === 'locked'
    ? allAchievements.filter(a => !a.earned)
    : allAchievements;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Banner */}
      <Box sx={{ position: 'relative', mb: 4, bgcolor: '#0b2f5c', py: { xs: 5, md: 7 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Container maxWidth="lg" sx={{ width: '100%' }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>Your Achievements</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.125rem' }}>Track your learning milestones and unlock badges</Typography>
            </motion.div>
          </Container>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 4 }}>
        {/* Overall Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card sx={{ bgcolor: 'action.hover', borderColor: '#fed7aa', border: 1, mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {earnedCount} / {totalCount} Achievements
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Keep learning to unlock more!</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" sx={{ bgcolor: '#4f46e5', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>
                    {userProgress?.points || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Total Points</Typography>
                </Box>
              </Box>
              <LinearProgress variant="determinate" value={completionPercent} sx={{ height: 12, borderRadius: 1 }} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Success Stories Section */}
        {/* Success stories removed: it showed another company's case studies (placeholder content). */}

        {/* Milestones */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {milestones.map((milestone, idx) => {
            const Icon = milestone.icon;
            const progress = Math.min((milestone.current / milestone.target) * 100, 100);
            
            return (
              <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={milestone.name}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                >
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Box sx={{ width: 40, height: 40, bgcolor: 'action.hover', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon style={{ width: 20, height: 20, color: '#b45309' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{milestone.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {milestone.current} / {milestone.target}
                          </Typography>
                        </Box>
                      </Box>
                      <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1 }} />
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>

        {/* Achievements Grid */}
        <Box>
          <Tabs 
            value={tabValue} 
            onChange={(e, val) => setTabValue(val)} 
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label={`All (${totalCount})`} value="all" />
            <Tab label={`Earned (${earnedCount})`} value="earned" />
            <Tab label={`Locked (${totalCount - earnedCount})`} value="locked" />
          </Tabs>

          <Grid container spacing={2}>
            {filteredAchievements.map((achievement, idx) => (
              <Grid size={{ xs: 6, sm: 4, lg: 3 }} key={achievement.key}>
                <AchievementCard achievement={achievement} index={idx} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

function SuccessStoriesCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const stories = [
    {
      category: 'Instructure',
      tag: 'Research',
      tagColor: '#dc2626',
      title: 'The Lifelong Learning Report',
      description: 'Explore the latest research on continuous education and lifelong learning strategies.',
      bgColor: 'linear-gradient(to bottom right, #111827, #7f1d1d, #111827)'
    },
    {
      category: 'Lifelong Learning Report',
      tag: 'Case Study',
      tagColor: '#2563eb',
      title: 'Trends and Insights from K-12 to Career',
      description: 'Learning today is a continuous journey. Explore what\'s needed to create an environment where every learner can flourish—no matter where they are in their educational path.',
      bgColor: 'linear-gradient(to bottom right, #0f172a, #1e3a8a, #0f172a)'
    },
    {
      category: 'Instructure',
      tag: 'Case Study',
      tagColor: '#ea580c',
      title: 'Passaic County Technical Vocational Schools',
      description: 'Discover how technical schools are transforming education and preparing students for real-world careers.',
      bgColor: 'linear-gradient(to bottom right, #111827, #7c2d12, #111827)'
    }
  ];

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    
    emblaApi.on('select', onSelect);
    onSelect();
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 4 }}>
        Success stories and resources
      </Typography>
      
      <Box sx={{ position: 'relative', mb: 3 }}>
        <Box ref={emblaRef} sx={{ overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {stories.map((story, idx) => (
              <Box key={idx} sx={{ flex: { xs: '0 0 100%', md: '0 0 45%', lg: '0 0 30%' }, minWidth: 0 }}>
                <motion.div whileHover={{ y: -8 }}>
                  <Box
                    sx={{
                      position: 'relative',
                      height: 320,
                      borderRadius: 4,
                      overflow: 'hidden',
                      background: story.bgColor,
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: 6,
                      color: 'white'
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>
                          {story.category}
                        </Typography>
                        <Chip
                          label={story.tag}
                          size="small"
                          sx={{ bgcolor: story.tagColor, color: 'white', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}
                        />
                      </Box>
                      
                      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, lineHeight: 1.2 }}>
                        {story.title}
                      </Typography>
                      
                      {story.description && (
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                          {story.description}
                        </Typography>
                      )}
                    </Box>
                    
                    <Button
                      variant="outlined"
                      sx={{
                        width: 'fit-content',
                        bgcolor: 'transparent',
                        borderColor: 'white',
                        borderWidth: 2,
                        color: 'white',
                        '&:hover': { bgcolor: 'background.paper', color: '#111827', borderColor: 'white' },
                        borderRadius: 50,
                        px: 3,
                        textTransform: 'none'
                      }}
                    >
                      Learn more
                    </Button>
                  </Box>
                </motion.div>
              </Box>
            ))}
          </Box>
        </Box>
        
        <Box
          component="button"
          onClick={() => emblaApi?.scrollPrev()}
          sx={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 48,
            height: 48,
            bgcolor: '#2563eb',
            border: 'none',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 3,
            zIndex: 10,
            '&:hover': { bgcolor: '#1d4ed8', transform: 'translateY(-50%) scale(1.1)' },
            transition: 'all 0.3s'
          }}
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </Box>
        
        <Box
          component="button"
          onClick={() => emblaApi?.scrollNext()}
          sx={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 48,
            height: 48,
            bgcolor: '#2563eb',
            border: 'none',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 3,
            zIndex: 10,
            '&:hover': { bgcolor: '#1d4ed8', transform: 'translateY(-50%) scale(1.1)' },
            transition: 'all 0.3s'
          }}
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 3 }}>
          {stories.map((_, idx) => (
            <Box
              key={idx}
              component="button"
              onClick={() => emblaApi?.scrollTo(idx)}
              sx={{
                height: 8,
                borderRadius: 50,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s',
                bgcolor: selectedIndex === idx ? '#4f46e5' : '#d1d5db',
                width: selectedIndex === idx ? 32 : 8
              }}
            />
          ))}
        </Box>
      </Box>
    </motion.div>
  );
}

function AchievementCard({ achievement, index }) {
  const Icon = achievement.icon;
  const isEarned = achievement.earned;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        sx={{
          p: 2,
          textAlign: 'center',
          transition: 'all 0.3s',
          opacity: isEarned ? 1 : 0.6,
          border: isEarned ? 2 : 1,
          borderColor: isEarned ? '#fed7aa' : '#e5e7eb',
          '&:hover': isEarned ? { boxShadow: 4, transform: 'scale(1.05)' } : {},
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isEarned ? achievement.color : 'linear-gradient(to bottom right, #e5e7eb, #d1d5db)',
              boxShadow: isEarned ? 3 : 0
            }}
          >
            {isEarned ? (
              <Icon style={{ width: 40, height: 40, color: 'white' }} />
            ) : (
              <Lock style={{ width: 40, height: 40, color: '#9ca3af' }} />
            )}
          </Box>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5, color: isEarned ? '#111827' : '#6b7280' }}>
          {achievement.title}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1.5, color: isEarned ? '#4b5563' : '#9ca3af' }}>
          {achievement.description}
        </Typography>

        {isEarned && achievement.earnedDate && (
          <Chip
            label={`Earned ${new Date(achievement.earnedDate).toLocaleDateString()}`}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
        )}

        {!isEarned && achievement.points > 0 && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, fontSize: '0.875rem', color: '#6b7280' }}>
            <Zap style={{ width: 12, height: 12 }} />
            <span>{achievement.points} points</span>
          </Box>
        )}
      </Card>
    </motion.div>
  );
}