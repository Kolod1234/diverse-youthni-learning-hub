import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CoursePasswordProtection from '@/components/security/CoursePasswordProtection';
import { base44 } from '@/api/base44Client';
import usePullToRefresh from '@/components/lesson/usePullToRefresh';
import { RefreshCw } from 'lucide-react';
import { 
  Slider, Checkbox, FormControlLabel, Button, Drawer, Box, Typography, Chip, Card, IconButton
} from '@mui/material';
import { Filter, X, BookOpen, Sparkles, TrendingUp, Award, Star, Clock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CourseCard from '@/components/courses/CourseCard';
import SearchBar from '@/components/courses/SearchBar';

const categories = [
  { id: 'mathematics', label: 'Mathematics', icon: '🔢', color: 'from-blue-500 to-cyan-500' },
  { id: 'further_mathematics', label: 'Further Mathematics', icon: '🧮', color: 'from-blue-600 to-indigo-600' },
  { id: 'english_language', label: 'English Language', icon: '📚', color: 'from-purple-500 to-pink-500' },
  { id: 'english_literature', label: 'English Literature', icon: '📖', color: 'from-purple-600 to-pink-600' },
  { id: 'biology', label: 'Biology', icon: '🧬', color: 'from-green-500 to-emerald-500' },
  { id: 'chemistry', label: 'Chemistry', icon: '⚗️', color: 'from-orange-500 to-amber-500' },
  { id: 'physics', label: 'Physics', icon: '⚛️', color: 'from-indigo-500 to-blue-500' },
  { id: 'science', label: 'Science', icon: '🔬', color: 'from-teal-500 to-cyan-500' },
  { id: 'computer_science', label: 'Computer Science', icon: '💻', color: 'from-gray-700 to-gray-900' },
  { id: 'software_systems_development', label: 'Software Systems Development', icon: '⚙️', color: 'from-gray-600 to-black' },
  { id: 'digital_technology', label: 'Digital Technology', icon: '📱', color: 'from-blue-400 to-blue-600' },
  { id: 'technology_design', label: 'Technology & Design', icon: '🎨', color: 'from-red-400 to-pink-500' },
  { id: 'history', label: 'History', icon: '📜', color: 'from-amber-500 to-orange-500' },
  { id: 'geography', label: 'Geography', icon: '🌍', color: 'from-emerald-500 to-teal-500' },
  { id: 'economics', label: 'Economics', icon: '💰', color: 'from-green-600 to-green-800' },
  { id: 'government_politics', label: 'Government & Politics', icon: '🏛️', color: 'from-slate-600 to-slate-800' },
  { id: 'religious_studies', label: 'Religious Studies', icon: '🕯️', color: 'from-yellow-600 to-amber-700' },
  { id: 'life_health_sciences', label: 'Life & Health Sciences', icon: '🫀', color: 'from-red-500 to-pink-500' },
  { id: 'environmental_technology', label: 'Environmental Technology', icon: '🌱', color: 'from-green-400 to-teal-500' },
];

const levels = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

export default function Explore() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [selectedQualification, setSelectedQualification] = useState(['gcse', 'alevel']);
  const [selectedALevelStage, setSelectedALevelStage] = useState(['as', 'a2', 'full']);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const queryClient = useQueryClient();
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.log('User not logged in');
      }
    };
    loadUser();

    const urlParams = new URLSearchParams(window.location.search);
    const instructorParam = urlParams.get('instructor');
    if (instructorParam) {
      setSearchQuery(instructorParam);
    }
  }, []);

  // ✅ FIX: Single API call — no lesson fetching, uses total_lessons already stored on course
  const { data: courses = [], isLoading, refetch: refetchCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 500),
    staleTime: 5 * 60 * 1000,
  });

  // Pull to refresh
  const { isPulling, pullDistance } = usePullToRefresh(async () => {
    await Promise.all([
      refetchCourses(),
      queryClient.invalidateQueries(['all-reviews']),
      queryClient.invalidateQueries(['all-enrollments'])
    ]);
  });

  // ✅ FIX: staleTime added so reviews don't refetch on every visit
  const { data: allReviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: () => base44.entities.Review.list('-created_date', 1000),
    staleTime: 5 * 60 * 1000,
  });

  // ✅ FIX: staleTime added so enrollments don't refetch on every visit
  const { data: allEnrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: () => base44.entities.Enrollment.list('-created_date', 1000),
    staleTime: 5 * 60 * 1000,
  });

  // Calculate actual ratings and enrollments for each course
  const coursesWithActualData = courses.map(course => {
    const courseReviews = allReviews.filter(r => 
      r.course_id === course.id && (r.rating_type === 'course' || !r.rating_type)
    );
    const actualRating = courseReviews.length > 0
      ? courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length
      : null;
    
    const enrollmentCount = allEnrollments.filter(e => e.course_id === course.id).length;
    
    return {
      ...course,
      rating: actualRating,
      enrolled_count: enrollmentCount,
      // ✅ FIX: use stored total_lessons instead of fetching lessons
      lesson_count: course.total_lessons || 0,
    };
  });

  const filteredCourses = coursesWithActualData.filter(course => {
    const matchesSearch = !searchQuery || 
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(course.category);
    const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(course.level);
    const matchesPrice = showFreeOnly 
      ? course.price === 0 
      : (course.price || 0) >= priceRange[0] && (course.price || 0) <= priceRange[1];
    const matchesQualification = selectedQualification.includes(course.qualification_type || 'gcse');
    const matchesALevelStage = course.qualification_type !== 'alevel' || !course.alevel_stage || selectedALevelStage.includes(course.alevel_stage);
    
    return matchesSearch && matchesCategory && matchesLevel && matchesPrice && matchesQualification && matchesALevelStage;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      case 'teachers': return (a.instructor || '').localeCompare(b.instructor || '');
      default: return (b.enrolled_count || 0) - (a.enrolled_count || 0);
    }
  });

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedLevels([]);
    setPriceRange([0, 200]);
    setShowFreeOnly(false);
    setSearchQuery('');
    setSelectedQualification(['gcse', 'alevel']);
    setSelectedALevelStage(['as', 'a2', 'full']);
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedLevels.length > 0 || showFreeOnly || searchQuery || selectedQualification.length < 2 || selectedALevelStage.length < 3;

  const FilterContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Qualification Type */}
      <Box>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Award size={16} color="#FF8C00" />
          Qualification
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[
            { id: 'gcse', label: 'GCSE' },
            { id: 'alevel', label: 'A-Level' }
          ].map((qual) => (
            <motion.div 
              key={qual.id}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedQualification.includes(qual.id)}
                    onChange={(e) => {
                      setSelectedQualification(prev => 
                        e.target.checked
                          ? [...prev, qual.id]
                          : prev.filter(q => q !== qual.id)
                      );
                    }}
                  />
                }
                label={qual.label}
                sx={{
                  width: '100%',
                  m: 0,
                  p: 1.5,
                  borderRadius: 3,
                  cursor: 'pointer',
                  background: selectedQualification.includes(qual.id) 
                    ? 'linear-gradient(to right, #10b981, #34d399)' 
                    : 'background.paper',
                  color: selectedQualification.includes(qual.id) ? 'white' : 'text.primary',
                  border: selectedQualification.includes(qual.id) ? 0 : 1,
                  borderColor: 'divider',
                  '&:hover': { bgcolor: selectedQualification.includes(qual.id) ? undefined : 'action.hover' }
                }}
              />
            </motion.div>
          ))}
        </Box>
      </Box>

      {/* A-Level Stage */}
      {selectedQualification.includes('alevel') && (
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp size={16} color="#FF8C00" />
            A-Level Stage
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[
              { id: 'as', label: 'AS-Level' },
              { id: 'a2', label: 'A2-Level' },
              { id: 'full', label: 'Full A-Level' }
            ].map((stage) => (
              <motion.div 
                key={stage.id}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedALevelStage.includes(stage.id)}
                      onChange={(e) => {
                        setSelectedALevelStage(prev => 
                          e.target.checked
                            ? [...prev, stage.id]
                            : prev.filter(s => s !== stage.id)
                        );
                      }}
                    />
                  }
                  label={stage.label}
                  sx={{
                    width: '100%',
                    m: 0,
                    p: 1.5,
                    borderRadius: 3,
                    cursor: 'pointer',
                    background: selectedALevelStage.includes(stage.id) 
                      ? 'linear-gradient(to right, #6366f1, #8b5cf6)' 
                      : 'background.paper',
                    color: selectedALevelStage.includes(stage.id) ? 'white' : 'text.primary',
                    border: selectedALevelStage.includes(stage.id) ? 0 : 1,
                    borderColor: 'divider',
                    '&:hover': { bgcolor: selectedALevelStage.includes(stage.id) ? undefined : 'action.hover' }
                  }}
                />
              </motion.div>
            ))}
          </Box>
        </Box>
      )}

      {/* Categories */}
      <Box>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <BookOpen size={16} color="#FF8C00" />
          Category
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {categories.map((category) => (
            <motion.div 
              key={category.id}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedCategories.includes(category.id)}
                    onChange={(e) => {
                      setSelectedCategories(prev => 
                        e.target.checked
                          ? [...prev, category.id]
                          : prev.filter(c => c !== category.id)
                      );
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ fontSize: '1.125rem' }}>{category.icon}</span>
                    <span>{category.label}</span>
                  </Box>
                }
                sx={{
                  width: '100%',
                  m: 0,
                  p: 1.5,
                  borderRadius: 3,
                  cursor: 'pointer',
                  background: selectedCategories.includes(category.id) 
                    ? 'linear-gradient(to right, #2563eb, #3b82f6)' 
                    : 'background.paper',
                  color: selectedCategories.includes(category.id) ? 'white' : 'text.primary',
                  border: selectedCategories.includes(category.id) ? 0 : 1,
                  borderColor: 'divider',
                  '&:hover': { bgcolor: selectedCategories.includes(category.id) ? undefined : 'action.hover' },
                  transition: 'all 0.2s'
                }}
              />
            </motion.div>
          ))}
        </Box>
      </Box>

      {/* Level */}
      <Box>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp size={16} color="#FF8C00" />
          Level
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {levels.map((level) => (
            <motion.div 
              key={level.id}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedLevels.includes(level.id)}
                    onChange={(e) => {
                      setSelectedLevels(prev => 
                        e.target.checked
                          ? [...prev, level.id]
                          : prev.filter(l => l !== level.id)
                      );
                    }}
                  />
                }
                label={level.label}
                sx={{
                  width: '100%',
                  m: 0,
                  p: 1.5,
                  borderRadius: 3,
                  cursor: 'pointer',
                  background: selectedLevels.includes(level.id) 
                    ? 'linear-gradient(to right, #4f46e5, #7c3aed)' 
                    : 'background.paper',
                  color: selectedLevels.includes(level.id) ? 'white' : 'text.primary',
                  border: selectedLevels.includes(level.id) ? 0 : 1,
                  borderColor: 'divider',
                  '&:hover': { bgcolor: selectedLevels.includes(level.id) ? undefined : 'action.hover' }
                }}
              />
            </motion.div>
          ))}
        </Box>
      </Box>

      {/* Price Range */}
      <Box>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Award size={16} color="#FF8C00" />
          Price Range
        </Typography>
        <Card sx={{ p: 2, border: 1, borderColor: 'divider' }}>
          <Slider
            value={priceRange}
            onChange={(e, newValue) => setPriceRange(newValue)}
            max={200}
            step={10}
            disabled={showFreeOnly}
            valueLabelDisplay="auto"
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Chip label={`£${priceRange[0]}`} sx={{ bgcolor: '#d1fae5', color: '#059669', fontWeight: 600 }} />
            <Chip label={`£${priceRange[1]}`} sx={{ bgcolor: '#dbeafe', color: '#1e40af', fontWeight: 600 }} />
          </Box>
        </Card>
        <motion.div
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={showFreeOnly}
                onChange={(e) => setShowFreeOnly(e.target.checked)}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Sparkles size={16} />
                <span>Free courses only</span>
              </Box>
            }
            sx={{
              width: '100%',
              m: 0,
              mt: 2,
              p: 1.5,
              borderRadius: 3,
              cursor: 'pointer',
              background: showFreeOnly 
                ? 'linear-gradient(to right, #059669, #10b981)' 
                : 'background.paper',
              color: showFreeOnly ? 'white' : 'text.primary',
              border: showFreeOnly ? 0 : 1,
              borderColor: 'divider',
              boxShadow: showFreeOnly ? 3 : 0
            }}
          />
        </motion.div>
      </Box>

      {hasActiveFilters && (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            variant="outlined" 
            onClick={clearFilters}
            startIcon={<X size={16} />}
            fullWidth
            sx={{
              background: 'linear-gradient(to right, #fef2f2, #ffedd5)',
              border: 2,
              borderColor: '#fecaca',
              color: '#b91c1c',
              fontWeight: 600,
              borderRadius: 3,
              py: 1.5,
              boxShadow: 2,
              '&:hover': {
                borderColor: '#fca5a5',
                boxShadow: 3
              }
            }}
          >
            Clear All Filters
          </Button>
        </motion.div>
      )}
    </Box>
  );

  // ✅ FIX: Show '...' while loading instead of 0
  const stats = [
    { 
      icon: BookOpen, 
      label: 'Total Courses', 
      value: isLoading ? '...' : coursesWithActualData.length, 
      color: 'from-blue-500 to-cyan-500' 
    },
    { 
      icon: Users, 
      label: 'Active Learners', 
      value: enrollmentsLoading ? '...' : allEnrollments.length, 
      color: 'from-purple-500 to-pink-500' 
    },
    { 
      icon: Star, 
      label: 'Avg Rating', 
      value: isLoading ? '...' : coursesWithActualData.length > 0 
        ? (coursesWithActualData.filter(c => c.rating).reduce((sum, c) => sum + c.rating, 0) / (coursesWithActualData.filter(c => c.rating).length || 1)).toFixed(1) 
        : '—', 
      color: 'from-yellow-500 to-orange-500' 
    },
    { 
      icon: TrendingUp, 
      label: 'Success Rate', 
      value: '96%', 
      color: 'from-green-500 to-emerald-500' 
    }
  ];

  const featuredCourses = coursesWithActualData.filter(c => c.rating && c.rating >= 4.5).slice(0, 3);

  return (
    <CoursePasswordProtection user={user}>
      <Box ref={scrollContainerRef} sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Pull to Refresh Indicator */}
        {isPulling && (
          <Box
            sx={{
              position: 'fixed',
              top: 64,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              zIndex: 9999,
              transition: 'transform 0.2s',
              transform: `translateY(${Math.min(pullDistance, 80)}px)`,
              pointerEvents: 'none'
            }}
          >
            <Box sx={{ bgcolor: '#2563eb', color: 'white', px: 3, py: 1.5, borderRadius: 50, boxShadow: 6, display: 'flex', alignItems: 'center', gap: 1 }}>
              <RefreshCw className={`w-4 h-4 ${pullDistance > 80 ? 'animate-spin' : ''}`} />
              <Typography variant="body2" fontWeight={600}>
                {pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
              </Typography>
            </Box>
          </Box>
        )}
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3, lg: 4 }, py: 6 }}>
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Chip 
                  icon={<Sparkles size={16} color="#2563eb" />}
                  label="Discover Learning" 
                  sx={{ px: 3, py: 2.5, borderRadius: 50, bgcolor: 'primary.main', color: 'white', border: 2, borderColor: 'primary.main', fontWeight: 700, mb: 3 }}
                />
              </motion.div>
              <Typography variant="h2" fontWeight={700} sx={{ mb: 2, fontSize: { xs: '2.5rem', md: '3.75rem' }, color: 'text.primary' }}>
                Explore Courses
              </Typography>
              <Typography variant="h6" sx={{ maxWidth: 600, mx: 'auto', color: 'text.secondary' }}>
                Discover courses tailored to your interests and start your learning journey today
              </Typography>
            </Box>
          </motion.div>

          {/* Stats Grid */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2, mb: 6 }}>
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}>
                    <Card sx={{ p: 2.5, border: 1, borderColor: 'divider', boxShadow: 2, '&:hover': { boxShadow: 4 }, transition: 'all 0.3s', borderRadius: 4, bgcolor: 'background.paper' }}>
                      <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5, boxShadow: 3 }}>
                        <Icon className="w-6 h-6" style={{ color: 'white' }} />
                      </Box>
                      <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.875rem', color: 'text.secondary' }}>{stat.label}</Typography>
                      <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', sm: '1.875rem' }, color: 'text.primary' }}>{stat.value}</Typography>
                    </Card>
                  </motion.div>
                );
              })}
            </Box>
          </motion.div>

          {/* Featured Courses */}
          {featuredCourses.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Box sx={{ mb: 7 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h4" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Star size={24} color="#eab308" />
                    Featured Courses
                  </Typography>
                  <Chip label="Top Rated" sx={{ bgcolor: '#fef3c7', color: '#a16207' }} />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                  <AnimatePresence>
                    {featuredCourses.map((course, i) => (
                      <motion.div key={course.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.1 }}>
                        <CourseCard course={course} index={i} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </Box>
              </Box>
            </motion.div>
          )}

          {/* Category Showcase */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ mb: 7 }}>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>Browse by Category</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(8, 1fr)' }, gap: 1.5 }}>
                {categories.map((cat, i) => (
                  <motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.05, y: -2 }}>
                    <Button
                      onClick={() => setSelectedCategories([cat.id])}
                      sx={{
                        p: 1.5, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0, width: '100%',
                        background: selectedCategories.includes(cat.id) ? 'linear-gradient(to bottom right, #2563eb, #3b82f6)' : 'background.paper',
                        color: selectedCategories.includes(cat.id) ? 'white' : 'text.primary',
                        border: selectedCategories.includes(cat.id) ? 0 : 1, borderColor: 'divider',
                        boxShadow: selectedCategories.includes(cat.id) ? 3 : 1,
                        '&:hover': { boxShadow: selectedCategories.includes(cat.id) ? 4 : 2, bgcolor: selectedCategories.includes(cat.id) ? undefined : 'action.hover' }
                      }}
                    >
                      <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>{cat.icon}</Typography>
                      <Typography variant="caption" fontWeight={600} sx={{ textAlign: 'center', lineHeight: 1.2 }}>{cat.label}</Typography>
                    </Button>
                  </motion.div>
                ))}
              </Box>
            </Box>
          </motion.div>

          {/* Search and Mobile Filter */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 6 }}>
              <Box sx={{ flex: 1 }}>
                <SearchBar value={searchQuery} onChange={setSearchQuery} sortBy={sortBy} onSortChange={setSortBy} />
              </Box>
              <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
                <Button 
                  variant="outlined"
                  onClick={() => setMobileFilterOpen(true)}
                  startIcon={<Filter size={20} color="#FF8C00" />}
                  sx={{ height: 48, px: 2.5, borderRadius: 3, border: 2, borderColor: 'rgba(255,140,0,0.2)', background: 'linear-gradient(to right, white, #eff6ff)', boxShadow: 3, '&:hover': { borderColor: 'rgba(255,140,0,0.4)', boxShadow: 4 } }}
                >
                  {hasActiveFilters && (
                    <Chip label={selectedCategories.length + selectedLevels.length + (showFreeOnly ? 1 : 0)} size="small" sx={{ ml: 1, bgcolor: 'primary.main', color: 'white', height: 20 }} />
                  )}
                </Button>
              </Box>
              <Drawer anchor="left" open={mobileFilterOpen} onClose={() => setMobileFilterOpen(false)} PaperProps={{ sx: { width: 320, p: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Filter size={20} />
                  <Typography variant="h6" fontWeight={600}>Filters</Typography>
                </Box>
                <FilterContent />
              </Drawer>
            </Box>
          </motion.div>

          <Box sx={{ display: 'flex', gap: 4 }}>
            {/* Desktop Sidebar */}
            <Box sx={{ display: { xs: 'none', lg: 'block' }, width: 288, flexShrink: 0 }}>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Card sx={{ position: 'sticky', top: 96, bgcolor: 'background.paper', p: 3, boxShadow: 4, border: 2, borderColor: 'divider', borderRadius: 4 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Filter size={20} color="#FF8C00" />
                    Filters
                  </Typography>
                  <FilterContent />
                </Card>
              </motion.div>
            </Box>

            {/* Course Grid */}
            <Box sx={{ flex: 1 }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card sx={{ mb: 4, p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', boxShadow: 2, borderRadius: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 3 }}>
                        <BookOpen size={24} style={{ color: 'white' }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Available Courses</Typography>
                        <Typography variant="h5" fontWeight={700} color="primary">
                          {isLoading ? '...' : sortedCourses.length}
                        </Typography>
                      </Box>
                    </Box>
                    {hasActiveFilters && (
                      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        {selectedCategories.map(cat => {
                          const category = categories.find(c => c.id === cat);
                          return (
                            <motion.div key={cat} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} whileHover={{ scale: 1.05 }}>
                              <Chip
                                label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><span>{category.icon}</span><span>{category.label}</span></Box>}
                                onDelete={() => setSelectedCategories(prev => prev.filter(c => c !== cat))}
                                sx={{ background: 'linear-gradient(to right, #2563eb, #3b82f6)', color: 'white', fontWeight: 600, boxShadow: 3, '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.8)', '&:hover': { color: 'white' } } }}
                              />
                            </motion.div>
                          );
                        })}
                        {selectedLevels.map(lev => (
                          <motion.div key={lev} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} whileHover={{ scale: 1.05 }}>
                            <Chip
                              label={levels.find(l => l.id === lev)?.label}
                              onDelete={() => setSelectedLevels(prev => prev.filter(l => l !== lev))}
                              sx={{ background: 'linear-gradient(to right, #4f46e5, #7c3aed)', color: 'white', fontWeight: 600, boxShadow: 3, '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.8)', '&:hover': { color: 'white' } } }}
                            />
                          </motion.div>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Card>
              </motion.div>

              {isLoading ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 3 }}>
                  {[...Array(9)].map((_, i) => (
                    <Card key={i} sx={{ borderRadius: 4, overflow: 'hidden' }}>
                      <Box sx={{ aspectRatio: '16/9', bgcolor: 'grey.200' }} className="animate-pulse" />
                      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box sx={{ height: 16, bgcolor: 'grey.200', borderRadius: 1, width: '33%' }} className="animate-pulse" />
                        <Box sx={{ height: 20, bgcolor: 'grey.200', borderRadius: 1 }} className="animate-pulse" />
                        <Box sx={{ height: 16, bgcolor: 'grey.200', borderRadius: 1, width: '66%' }} className="animate-pulse" />
                      </Box>
                    </Card>
                  ))}
                </Box>
              ) : sortedCourses.length > 0 ? (
                <motion.div layout>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 4 }}>
                    <AnimatePresence>
                      {sortedCourses.map((course, index) => (
                        <CourseCard key={course.id} course={course} index={index} />
                      ))}
                    </AnimatePresence>
                  </Box>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <Card sx={{ textAlign: 'center', py: 10, bgcolor: 'background.paper', borderRadius: 6, border: 2, borderStyle: 'dashed', borderColor: 'divider', boxShadow: 4 }}>
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                      <BookOpen size={80} color="rgba(255,140,0,0.5)" style={{ margin: '0 auto 24px' }} />
                    </motion.div>
                    <Typography variant="h4" fontWeight={700} sx={{ mb: 1.5 }}>No courses found</Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>Try adjusting your search or filter criteria</Typography>
                    <Button 
                      onClick={clearFilters}
                      variant="contained"
                      startIcon={<X size={16} />}
                      sx={{ background: 'linear-gradient(to right, #2563eb, #7c3aed)', color: 'white', borderRadius: 50, px: 4, py: 1.5, fontWeight: 600, boxShadow: 3, '&:hover': { background: 'linear-gradient(to right, #1d4ed8, #6d28d9)', boxShadow: 4, transform: 'scale(1.05)' } }}
                    >
                      Clear all filters
                    </Button>
                  </Card>
                </motion.div>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </CoursePasswordProtection>
  );
}
