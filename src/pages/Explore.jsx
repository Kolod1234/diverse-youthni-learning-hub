import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CoursePasswordProtection from '@/components/security/CoursePasswordProtection';
import { base44 } from '@/api/base44Client';
import usePullToRefresh from '@/components/lesson/usePullToRefresh';
import {
  Box, Container, Typography, Card, CardContent, Button, Chip, Checkbox, Slider,
  FormControlLabel, Drawer
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import PeopleIcon from '@mui/icons-material/People';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { motion, AnimatePresence } from 'framer-motion';
import CourseCard from '@/components/courses/CourseCard';
import SearchBar from '@/components/courses/SearchBar';

const categories = [
  { id: 'mathematics', label: 'Mathematics', icon: '🔢' },
  { id: 'further_mathematics', label: 'Further Mathematics', icon: '🧮' },
  { id: 'english_language', label: 'English Language', icon: '📚' },
  { id: 'english_literature', label: 'English Literature', icon: '📖' },
  { id: 'biology', label: 'Biology', icon: '🧬' },
  { id: 'chemistry', label: 'Chemistry', icon: '⚗️' },
  { id: 'physics', label: 'Physics', icon: '⚛️' },
  { id: 'science', label: 'Science', icon: '🔬' },
  { id: 'computer_science', label: 'Computer Science', icon: '💻' },
  { id: 'software_systems_development', label: 'Software Systems Development', icon: '⚙️' },
  { id: 'digital_technology', label: 'Digital Technology', icon: '📱' },
  { id: 'technology_design', label: 'Technology & Design', icon: '🎨' },
  { id: 'history', label: 'History', icon: '📜' },
  { id: 'geography', label: 'Geography', icon: '🌍' },
  { id: 'economics', label: 'Economics', icon: '💰' },
  { id: 'government_politics', label: 'Government & Politics', icon: '🏛️' },
  { id: 'religious_studies', label: 'Religious Studies', icon: '🕯️' },
  { id: 'life_health_sciences', label: 'Life & Health Sciences', icon: '🫀' },
  { id: 'environmental_technology', label: 'Environmental Technology', icon: '🌱' },
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
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
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

  const { data: courses = [], isLoading, refetch: refetchCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 500),
    staleTime: 5 * 60 * 1000,
  });

  const { isPulling, pullDistance } = usePullToRefresh(async () => {
    await Promise.all([
      refetchCourses(),
      queryClient.invalidateQueries(['all-reviews']),
      queryClient.invalidateQueries(['all-enrollments'])
    ]);
  });

  const { data: allReviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: () => base44.entities.Review.list('-created_date', 1000),
    staleTime: 5 * 60 * 1000,
  });

  const { data: allEnrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: () => base44.entities.Enrollment.list('-created_date', 1000),
    staleTime: 5 * 60 * 1000,
  });

  const reviewStatsByCourse = useMemo(() => {
    const map = new Map();
    for (const r of allReviews) {
      if (r.rating_type && r.rating_type !== 'course') continue;
      const entry = map.get(r.course_id) || { sum: 0, count: 0 };
      entry.sum += r.rating || 0;
      entry.count += 1;
      map.set(r.course_id, entry);
    }
    return map;
  }, [allReviews]);

  const enrollmentCountByCourse = useMemo(() => {
    const map = new Map();
    for (const e of allEnrollments) {
      map.set(e.course_id, (map.get(e.course_id) || 0) + 1);
    }
    return map;
  }, [allEnrollments]);

  const coursesWithActualData = useMemo(() => {
    return courses.filter(course => course.is_published !== false).map(course => {
      const stats = reviewStatsByCourse.get(course.id);
      const actualRating = stats && stats.count > 0 ? stats.sum / stats.count : null;
      const enrollmentCount = enrollmentCountByCourse.get(course.id) || 0;
      return {
        ...course,
        rating: actualRating,
        enrolled_count: enrollmentCount,
        lesson_count: course.total_lessons || 0,
      };
    });
  }, [courses, reviewStatsByCourse, enrollmentCountByCourse]);

  const filteredCourses = useMemo(() => {
    const q = searchQuery ? searchQuery.toLowerCase() : '';
    return coursesWithActualData.filter(course => {
      const matchesSearch = !q ||
        course.title?.toLowerCase().includes(q) ||
        course.description?.toLowerCase().includes(q) ||
        course.instructor?.toLowerCase().includes(q);

      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(course.category);
      const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(course.level);
      const matchesPrice = showFreeOnly
        ? course.price === 0
        : (course.price || 0) >= priceRange[0] && (course.price || 0) <= priceRange[1];
      const matchesQualification = selectedQualification.includes(course.qualification_type || 'gcse');
      const matchesALevelStage = course.qualification_type !== 'alevel' || !course.alevel_stage || selectedALevelStage.includes(course.alevel_stage);

      return matchesSearch && matchesCategory && matchesLevel && matchesPrice && matchesQualification && matchesALevelStage;
    });
  }, [coursesWithActualData, searchQuery, selectedCategories, selectedLevels, showFreeOnly, priceRange, selectedQualification, selectedALevelStage]);

  const sortedCourses = useMemo(() => {
    const arr = [...filteredCourses];
    arr.sort((a, b) => {
      switch (sortBy) {
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        case 'teachers': return (a.instructor || '').localeCompare(b.instructor || '');
        default: return (b.enrolled_count || 0) - (a.enrolled_count || 0);
      }
    });
    return arr;
  }, [filteredCourses, sortBy]);

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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Qualification Type */}
      <Box>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEventsIcon sx={{ fontSize: 16, color: '#f97316' }} /> Qualification
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {[{ id: 'gcse', label: 'GCSE' }, { id: 'alevel', label: 'A-Level' }].map((qual) => (
            <FormControlLabel
              key={qual.id}
              sx={{ borderRadius: 2, p: 0.5, m: 0, '&:hover': { bgcolor: 'action.hover' } }}
              control={
                <Checkbox
                  size="small"
                  checked={selectedQualification.includes(qual.id)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSelectedQualification(prev =>
                      checked ? [...prev, qual.id] : prev.filter(q => q !== qual.id)
                    );
                  }}
                />
              }
              label={qual.label}
            />
          ))}
        </Box>
      </Box>

      {/* A-Level Stage */}
      {selectedQualification.includes('alevel') && (
        <Box>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon sx={{ fontSize: 16, color: '#f97316' }} /> A-Level Stage
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {[
              { id: 'as', label: 'AS-Level' },
              { id: 'a2', label: 'A2-Level' },
              { id: 'full', label: 'Full A-Level' }
            ].map((stage) => (
              <FormControlLabel
                key={stage.id}
                sx={{ borderRadius: 2, p: 0.5, m: 0, '&:hover': { bgcolor: 'action.hover' } }}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedALevelStage.includes(stage.id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectedALevelStage(prev =>
                        checked ? [...prev, stage.id] : prev.filter(s => s !== stage.id)
                      );
                    }}
                  />
                }
                label={stage.label}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Categories */}
      <Box>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MenuBookIcon sx={{ fontSize: 16, color: '#f97316' }} /> Category
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {categories.map((category) => (
            <FormControlLabel
              key={category.id}
              sx={{ borderRadius: 2, p: 0.5, m: 0, '&:hover': { bgcolor: 'action.hover' } }}
              control={
                <Checkbox
                  size="small"
                  checked={selectedCategories.includes(category.id)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSelectedCategories(prev =>
                      checked ? [...prev, category.id] : prev.filter(c => c !== category.id)
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
            />
          ))}
        </Box>
      </Box>

      {/* Level */}
      <Box>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon sx={{ fontSize: 16, color: '#f97316' }} /> Level
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {levels.map((level) => (
            <FormControlLabel
              key={level.id}
              sx={{ borderRadius: 2, p: 0.5, m: 0, '&:hover': { bgcolor: 'action.hover' } }}
              control={
                <Checkbox
                  size="small"
                  checked={selectedLevels.includes(level.id)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSelectedLevels(prev =>
                      checked ? [...prev, level.id] : prev.filter(l => l !== level.id)
                    );
                  }}
                />
              }
              label={level.label}
            />
          ))}
        </Box>
      </Box>

      {/* Price Range */}
      <Box>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEventsIcon sx={{ fontSize: 16, color: '#f97316' }} /> Price Range
        </Typography>
        <Card sx={{ p: 2 }}>
          <Slider
            value={priceRange}
            onChange={(_, val) => setPriceRange(val)}
            max={200}
            step={10}
            disabled={showFreeOnly}
            sx={{ mb: 1.5 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
            <Chip label={`£${priceRange[0]}`} size="small" sx={{ bgcolor: '#d1fae5', color: '#047857', fontWeight: 600 }} />
            <Chip label={`£${priceRange[1]}`} size="small" sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 600 }} />
          </Box>
        </Card>
        <FormControlLabel
          sx={{ borderRadius: 2, p: 0.5, m: 0, mt: 1.5, '&:hover': { bgcolor: 'action.hover' } }}
          control={
            <Checkbox
              size="small"
              checked={showFreeOnly}
              onChange={(e) => setShowFreeOnly(e.target.checked)}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeIcon sx={{ fontSize: 16 }} /> Free courses only
            </Box>
          }
        />
      </Box>

      {hasActiveFilters && (
        <Button
          variant="outlined"
          fullWidth
          startIcon={<CloseIcon sx={{ fontSize: 16 }} />}
          onClick={clearFilters}
        >
          Clear All Filters
        </Button>
      )}
    </Box>
  );

  const stats = [
    {
      icon: MenuBookIcon,
      label: 'Total Courses',
      value: isLoading ? '...' : coursesWithActualData.length,
    },
    {
      icon: PeopleIcon,
      label: 'Active Learners',
      value: enrollmentsLoading ? '...' : new Set(allEnrollments.map(e => e.created_by_id)).size,
    },
    {
      icon: StarIcon,
      label: 'Avg Rating',
      value: isLoading ? '...' : coursesWithActualData.some(c => c.rating)
        ? (coursesWithActualData.filter(c => c.rating).reduce((sum, c) => sum + c.rating, 0) / (coursesWithActualData.filter(c => c.rating).length || 1)).toFixed(1)
        : '—',
    },
    {
      icon: TrendingUpIcon,
      label: 'Subjects',
      value: isLoading ? '...' : new Set(coursesWithActualData.map(c => c.category).filter(Boolean)).size,
    }
  ];

  const featuredCourses = useMemo(
    () => coursesWithActualData.filter(c => c.rating && c.rating >= 4.5).slice(0, 3),
    [coursesWithActualData]
  );

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
              zIndex: 50,
              pointerEvents: 'none',
              transition: 'transform 0.1s',
              transform: `translateY(${Math.min(pullDistance, 80)}px)`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#2563eb', color: 'white', px: 3, py: 1.5, borderRadius: 50, boxShadow: 4 }}>
              {pullDistance > 80
                ? <AutorenewIcon sx={{ fontSize: 16, animation: 'spin 1s linear infinite', '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } } }} />
                : <RefreshIcon sx={{ fontSize: 16 }} />}
              <Typography variant="body2" fontWeight={600}>
                {pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
              </Typography>
            </Box>
          </Box>
        )}

        <Container maxWidth="xl" sx={{ py: 6 }}>
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Chip
                icon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
                label="Discover Learning"
                sx={{ px: 3, py: 1, borderRadius: 50, bgcolor: 'primary.main', color: 'white', border: '2px solid', borderColor: 'primary.main', fontWeight: 700, mb: 2, '& .MuiChip-icon': { color: 'white' } }}
              />
              <Typography variant="h2" sx={{ fontSize: { xs: '2.5rem', md: '3.75rem' }, fontWeight: 700, mb: 2 }}>
                Explore Courses
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                Discover courses tailored to your interests and start your learning journey today
              </Typography>
            </Box>
          </motion.div>

          {/* Stats Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2, mb: 6 }}>
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card key={i} sx={{ p: 2.5, borderRadius: 4, border: 1, borderColor: 'divider', transition: 'all 0.2s', '&:hover': { boxShadow: 4 } }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5, boxShadow: 2 }}>
                    <Icon sx={{ fontSize: 24, color: 'white' }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>{stat.label}</Typography>
                  <Typography variant="h5" fontWeight={700}>{stat.value}</Typography>
                </Card>
              );
            })}
          </Box>

          {/* Featured Courses */}
          {featuredCourses.length > 0 && (
            <Box sx={{ mb: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon sx={{ fontSize: 24, color: '#eab308' }} /> Featured Courses
                </Typography>
                <Chip label="Top Rated" sx={{ bgcolor: '#fef3c7', color: '#a16207' }} />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                {featuredCourses.map((course, i) => (
                  <CourseCard key={course.id} course={course} index={i} user={user} />
                ))}
              </Box>
            </Box>
          )}

          {/* Category Showcase */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Browse by Category</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(8, 1fr)' }, gap: 1.5 }}>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategories.includes(cat.id) ? 'contained' : 'outlined'}
                  onClick={() => setSelectedCategories([cat.id])}
                  sx={{ flexDirection: 'column', height: 'auto', py: 1.5, px: 1, borderRadius: 4, gap: 0.5 }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                  <Typography variant="caption" sx={{ fontWeight: 600, textAlign: 'center', lineHeight: 1.2, textTransform: 'none' }}>{cat.label}</Typography>
                </Button>
              ))}
            </Box>
          </Box>

          {/* Search and Mobile Filter */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 4 }}>
            <Box sx={{ flex: 1 }}>
              <SearchBar value={searchQuery} onChange={setSearchQuery} sortBy={sortBy} onSortChange={setSortBy} />
            </Box>
            <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
              <Button
                variant="outlined"
                onClick={() => setFilterDrawerOpen(true)}
                startIcon={<TuneIcon sx={{ color: '#f97316' }} />}
                sx={{ height: 48, px: 2, borderRadius: 4 }}
              >
                {hasActiveFilters && (
                  <Chip
                    size="small"
                    label={selectedCategories.length + selectedLevels.length + (showFreeOnly ? 1 : 0)}
                    sx={{ ml: 0.5, bgcolor: 'primary.main', color: 'white', height: 20 }}
                  />
                )}
              </Button>
              <Drawer
                anchor="left"
                open={filterDrawerOpen}
                onClose={() => setFilterDrawerOpen(false)}
                PaperProps={{ sx: { width: 320, p: 3, overflowY: 'auto' } }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <TuneIcon sx={{ fontSize: 20 }} />
                  <Typography variant="h6">Filters</Typography>
                </Box>
                <FilterContent />
              </Drawer>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 4 }}>
            {/* Desktop Sidebar */}
            <Box sx={{ display: { xs: 'none', lg: 'block' }, width: 288, flexShrink: 0 }}>
              <Card sx={{ position: 'sticky', top: 96, p: 3, boxShadow: 2, border: '2px solid', borderColor: 'divider', borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TuneIcon sx={{ fontSize: 20, color: '#f97316' }} /> Filters
                </Typography>
                <FilterContent />
              </Card>
            </Box>

            {/* Course Grid */}
            <Box sx={{ flex: 1 }}>
              <Card sx={{ mb: 4, p: 2, borderRadius: 4, boxShadow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 2 }}>
                      <MenuBookIcon sx={{ fontSize: 24, color: 'white' }} />
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
                          <Chip
                            key={cat}
                            onDelete={() => setSelectedCategories(prev => prev.filter(c => c !== cat))}
                            deleteIcon={<CloseIcon sx={{ fontSize: 12 }} />}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <span>{category.icon}</span>
                                <span>{category.label}</span>
                              </Box>
                            }
                            sx={{ bgcolor: '#2563eb', color: 'white', fontWeight: 600, '& .MuiChip-deleteIcon': { color: 'white' } }}
                          />
                        );
                      })}
                      {selectedLevels.map(lev => (
                        <Chip
                          key={lev}
                          onDelete={() => setSelectedLevels(prev => prev.filter(l => l !== lev))}
                          deleteIcon={<CloseIcon sx={{ fontSize: 12 }} />}
                          label={levels.find(l => l.id === lev)?.label}
                          sx={{ bgcolor: '#4f46e5', color: 'white', fontWeight: 600, '& .MuiChip-deleteIcon': { color: 'white' } }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Card>

              {isLoading ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 3 }}>
                  {[...Array(9)].map((_, i) => (
                    <Card key={i} sx={{ borderRadius: 4, overflow: 'hidden' }}>
                      <Box sx={{ aspectRatio: '16/9', bgcolor: 'action.hover' }} />
                      <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box sx={{ height: 16, bgcolor: 'action.hover', borderRadius: 1, width: '33%' }} />
                        <Box sx={{ height: 20, bgcolor: 'action.hover', borderRadius: 1 }} />
                        <Box sx={{ height: 16, bgcolor: 'action.hover', borderRadius: 1, width: '66%' }} />
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : sortedCourses.length > 0 ? (
                <Box component={motion.div} layout sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 4 }}>
                  <AnimatePresence>
                    {sortedCourses.map((course, index) => (
                      <CourseCard key={course.id} course={course} index={index} user={user} />
                    ))}
                  </AnimatePresence>
                </Box>
              ) : (
                <Card sx={{ textAlign: 'center', py: 10, borderRadius: 6, border: '2px dashed', borderColor: 'divider', boxShadow: 2 }}>
                  <MenuBookIcon sx={{ fontSize: 80, color: '#fdba74', mb: 3 }} />
                  <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>No courses found</Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>Try adjusting your search or filter criteria</Typography>
                  <Button
                    onClick={clearFilters}
                    variant="contained"
                    startIcon={<CloseIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      background: 'linear-gradient(to right, #2563eb, #9333ea)',
                      color: 'white',
                      borderRadius: 50,
                      px: 3,
                      py: 1.5,
                      fontWeight: 600,
                      '&:hover': { background: 'linear-gradient(to right, #1d4ed8, #7e22ce)' },
                    }}
                  >
                    Clear all filters
                  </Button>
                </Card>
              )}
            </Box>
          </Box>
        </Container>
      </Box>
    </CoursePasswordProtection>
  );
}