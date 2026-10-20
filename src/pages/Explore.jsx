import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CoursePasswordProtection from '@/components/security/CoursePasswordProtection';
import { base44 } from '@/api/base44Client';
import usePullToRefresh from '@/components/lesson/usePullToRefresh';
import {
  Box, Container, Typography, Card, CardContent, Button, Chip, Checkbox, Slider,
  FormControlLabel, Drawer, TextField, InputAdornment, MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
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
import CourseCardV2 from '@/components/courses/CourseCardV2';

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
          <EmojiEventsIcon sx={{ fontSize: 16, color: 'primary.main' }} /> Qualification
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
            <TrendingUpIcon sx={{ fontSize: 16, color: 'primary.main' }} /> A-Level Stage
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
          <MenuBookIcon sx={{ fontSize: 16, color: 'primary.main' }} /> Category
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
          <TrendingUpIcon sx={{ fontSize: 16, color: 'primary.main' }} /> Level
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
          <EmojiEventsIcon sx={{ fontSize: 16, color: 'primary.main' }} /> Price Range
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

  // Subjects that actually have published courses, for the chip row.
  const subjectChips = useMemo(() => {
    const present = new Set(coursesWithActualData.map(c => c.category).filter(Boolean));
    return categories.filter(cat => present.has(cat.id));
  }, [coursesWithActualData]);

  const advancedFilterCount = selectedLevels.length + (showFreeOnly ? 1 : 0)
    + (selectedQualification.length < 2 ? 1 : 0) + (selectedALevelStage.length < 3 ? 1 : 0);

  return (
    <CoursePasswordProtection user={user}>
      <Box ref={scrollContainerRef} sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {isPulling && (
          <Box sx={{ position: 'fixed', top: 64, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 50, pointerEvents: 'none', transform: `translateY(${Math.min(pullDistance, 80)}px)` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'primary.main', color: 'primary.contrastText', px: 3, py: 1.5, borderRadius: 50, boxShadow: 4 }}>
              {pullDistance > 80
                ? <AutorenewIcon sx={{ fontSize: 16, animation: 'spin 1s linear infinite', '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } } }} />
                : <RefreshIcon sx={{ fontSize: 16 }} />}
              <Typography variant="body2" fontWeight={600}>{pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}</Typography>
            </Box>
          </Box>
        )}

        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box>
            <Typography component="h1" sx={{ fontSize: { xs: '1.75rem', md: '2rem' }, fontWeight: 700 }}>Explore courses</Typography>
            <Typography color="text.secondary">
              {isLoading ? 'Loading courses…' : `${coursesWithActualData.length} courses · free for every learner`}
            </Typography>
          </Box>

          {/* Search, sort and filters */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            <TextField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subject, topic or teacher"
              inputProps={{ 'aria-label': 'Search courses' }}
              sx={{ flex: '1 1 320px', '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', minHeight: 48 } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            />
            <TextField
              select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              inputProps={{ 'aria-label': 'Sort courses' }}
              sx={{ flex: '0 1 200px', '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', minHeight: 48 } }}
            >
              <MenuItem value="popular">Most popular</MenuItem>
              <MenuItem value="rating">Top rated</MenuItem>
              <MenuItem value="teachers">Teacher A–Z</MenuItem>
            </TextField>
            <Button variant="outlined" onClick={() => setFilterDrawerOpen(true)} startIcon={<TuneIcon />} sx={{ minHeight: 48, bgcolor: 'background.paper' }}>
              Filters{advancedFilterCount > 0 ? ` (${advancedFilterCount})` : ''}
            </Button>
            <Drawer anchor="right" open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)} PaperProps={{ sx: { width: 320, maxWidth: '100vw', p: 3, overflowY: 'auto' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Filters</Typography>
                <Button onClick={() => setFilterDrawerOpen(false)} aria-label="Close filters" sx={{ minWidth: 44 }}><CloseIcon /></Button>
              </Box>
              <FilterContent />
            </Drawer>
          </Box>

          {/* Subject chips */}
          <Box role="group" aria-label="Filter by subject" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label="All subjects"
              onClick={() => setSelectedCategories([])}
              color={selectedCategories.length === 0 ? 'primary' : 'default'}
              variant={selectedCategories.length === 0 ? 'filled' : 'outlined'}
              sx={{ height: 40, fontWeight: 500, bgcolor: selectedCategories.length === 0 ? undefined : 'background.paper' }}
            />
            {subjectChips.map(cat => {
              const on = selectedCategories.includes(cat.id);
              return (
                <Chip
                  key={cat.id}
                  label={cat.label}
                  onClick={() => setSelectedCategories(prev => on ? prev.filter(c => c !== cat.id) : [...prev, cat.id])}
                  color={on ? 'primary' : 'default'}
                  variant={on ? 'filled' : 'outlined'}
                  aria-pressed={on}
                  sx={{ height: 40, fontWeight: 500, bgcolor: on ? undefined : 'background.paper' }}
                />
              );
            })}
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Typography color="text.secondary" aria-live="polite">
              {isLoading ? '' : `${sortedCourses.length} ${sortedCourses.length === 1 ? 'course' : 'courses'}`}
            </Typography>
            {hasActiveFilters && <Button variant="text" onClick={clearFilters} startIcon={<CloseIcon />}>Clear filters</Button>}
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 2 }}>
              {[...Array(8)].map((_, i) => (
                <Card key={i} sx={{ overflow: 'hidden' }}>
                  <Box sx={{ aspectRatio: '16/9', bgcolor: 'action.hover' }} />
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ height: 16, bgcolor: 'action.hover', borderRadius: 1, width: '33%' }} />
                    <Box sx={{ height: 20, bgcolor: 'action.hover', borderRadius: 1 }} />
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : sortedCourses.length > 0 ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 2 }}>
              {sortedCourses.map(course => <CourseCardV2 key={course.id} course={course} />)}
            </Box>
          ) : (
            <Card sx={{ textAlign: 'center', py: 8, px: 3 }}>
              <MenuBookIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>No courses match</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>Try another subject or clear your filters.</Typography>
              <Button onClick={clearFilters} variant="contained">Clear filters</Button>
            </Card>
          )}
        </Container>
      </Box>
    </CoursePasswordProtection>
  );
}
