import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CoursePasswordProtection from '@/components/security/CoursePasswordProtection';
import { base44 } from '@/api/base44Client';
import usePullToRefresh from '@/components/lesson/usePullToRefresh';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  RefreshCw, SlidersHorizontal, X, BookOpen, Sparkles, TrendingUp,
  Award, Star, Users, Loader2
} from 'lucide-react';
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

  // ✅ PERF: Build review aggregation maps once per allReviews change
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

  // ✅ PERF: Build enrollment count map once per allEnrollments change
  const enrollmentCountByCourse = useMemo(() => {
    const map = new Map();
    for (const e of allEnrollments) {
      map.set(e.course_id, (map.get(e.course_id) || 0) + 1);
    }
    return map;
  }, [allEnrollments]);

  // ✅ PERF: Memoize the enriched courses list
  const coursesWithActualData = useMemo(() => {
    return courses.map(course => {
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

  // ✅ PERF: Memoize filtering
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

  // ✅ PERF: Memoize sorting
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
    <div className="space-y-6">
      {/* Qualification Type */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-orange-500" /> Qualification
        </h3>
        <div className="space-y-2">
          {[{ id: 'gcse', label: 'GCSE' }, { id: 'alevel', label: 'A-Level' }].map((qual) => (
            <label key={qual.id} className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-accent">
              <Checkbox
                checked={selectedQualification.includes(qual.id)}
                onCheckedChange={(checked) => {
                  setSelectedQualification(prev =>
                    checked ? [...prev, qual.id] : prev.filter(q => q !== qual.id)
                  );
                }}
              />
              <span>{qual.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* A-Level Stage */}
      {selectedQualification.includes('alevel') && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-500" /> A-Level Stage
          </h3>
          <div className="space-y-2">
            {[
              { id: 'as', label: 'AS-Level' },
              { id: 'a2', label: 'A2-Level' },
              { id: 'full', label: 'Full A-Level' }
            ].map((stage) => (
              <label key={stage.id} className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-accent">
                <Checkbox
                  checked={selectedALevelStage.includes(stage.id)}
                  onCheckedChange={(checked) => {
                    setSelectedALevelStage(prev =>
                      checked ? [...prev, stage.id] : prev.filter(s => s !== stage.id)
                    );
                  }}
                />
                <span>{stage.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-orange-500" /> Category
        </h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-accent">
              <Checkbox
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={(checked) => {
                  setSelectedCategories(prev =>
                    checked ? [...prev, category.id] : prev.filter(c => c !== category.id)
                  );
                }}
              />
              <span className="flex items-center gap-2">
                <span className="text-lg">{category.icon}</span>
                <span>{category.label}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Level */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-500" /> Level
        </h3>
        <div className="space-y-2">
          {levels.map((level) => (
            <label key={level.id} className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-accent">
              <Checkbox
                checked={selectedLevels.includes(level.id)}
                onCheckedChange={(checked) => {
                  setSelectedLevels(prev =>
                    checked ? [...prev, level.id] : prev.filter(l => l !== level.id)
                  );
                }}
              />
              <span>{level.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-orange-500" /> Price Range
        </h3>
        <Card className="p-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={200}
            step={10}
            disabled={showFreeOnly}
            className="mb-3"
          />
          <div className="flex justify-between mb-3">
            <Badge className="bg-emerald-100 text-emerald-700 font-semibold">£{priceRange[0]}</Badge>
            <Badge className="bg-blue-100 text-blue-700 font-semibold">£{priceRange[1]}</Badge>
          </div>
        </Card>
        <label className="flex items-center gap-2 mt-3 p-2 rounded-lg cursor-pointer hover:bg-accent">
          <Checkbox
            checked={showFreeOnly}
            onCheckedChange={setShowFreeOnly}
          />
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Free courses only
          </span>
        </label>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full gap-2">
          <X className="w-4 h-4" /> Clear All Filters
        </Button>
      )}
    </div>
  );

  // ✅ FIX: Show '...' while loading instead of 0
  const stats = [
    {
      icon: BookOpen,
      label: 'Total Courses',
      value: isLoading ? '...' : coursesWithActualData.length,
    },
    {
      icon: Users,
      label: 'Active Learners',
      value: enrollmentsLoading ? '...' : allEnrollments.length,
    },
    {
      icon: Star,
      label: 'Avg Rating',
      value: isLoading ? '...' : coursesWithActualData.length > 0
        ? (coursesWithActualData.filter(c => c.rating).reduce((sum, c) => sum + c.rating, 0) / (coursesWithActualData.filter(c => c.rating).length || 1)).toFixed(1)
        : '—',
    },
    {
      icon: TrendingUp,
      label: 'Success Rate',
      value: '96%',
    }
  ];

  const featuredCourses = useMemo(
    () => coursesWithActualData.filter(c => c.rating && c.rating >= 4.5).slice(0, 3),
    [coursesWithActualData]
  );

  return (
    <CoursePasswordProtection user={user}>
      <div ref={scrollContainerRef} className="min-h-screen bg-background">
        {/* Pull to Refresh Indicator */}
        {isPulling && (
          <div
            className="fixed top-16 left-0 right-0 flex justify-center z-50 pointer-events-none transition-transform"
            style={{ transform: `translateY(${Math.min(pullDistance, 80)}px)` }}
          >
            <div className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg">
              {pullDistance > 80
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <RefreshCw className="w-4 h-4" />}
              <span className="text-sm font-semibold">
                {pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-12">
              <Badge className="px-6 py-2 rounded-full bg-primary text-white border-2 border-primary font-bold mb-4">
                <Sparkles className="w-4 h-4 mr-2 inline" /> Discover Learning
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Explore Courses</h1>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Discover courses tailored to your interests and start your learning journey today
              </p>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card key={i} className="p-5 rounded-2xl border hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-3 shadow-md">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                </Card>
              );
            })}
          </div>

          {/* Featured Courses */}
          {featuredCourses.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500" /> Featured Courses
                </h2>
                <Badge className="bg-amber-100 text-amber-700">Top Rated</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredCourses.map((course, i) => (
                  <CourseCard key={course.id} course={course} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Category Showcase */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategories.includes(cat.id) ? 'default' : 'outline'}
                  onClick={() => setSelectedCategories([cat.id])}
                  className="flex-col h-auto py-3 px-2 rounded-2xl gap-1"
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs font-semibold text-center leading-tight">{cat.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Search and Mobile Filter */}
          <div className="flex gap-3 mb-8">
            <div className="flex-1">
              <SearchBar value={searchQuery} onChange={setSearchQuery} sortBy={sortBy} onSortChange={setSortBy} />
            </div>
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="h-12 px-4 rounded-2xl gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-orange-500" />
                    {hasActiveFilters && (
                      <Badge className="ml-1 bg-primary text-white h-5">
                        {selectedCategories.length + selectedLevels.length + (showFreeOnly ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <div className="flex items-center gap-2 mb-6">
                    <SlidersHorizontal className="w-5 h-5" />
                    <h2 className="text-lg font-semibold">Filters</h2>
                  </div>
                  <FilterContent />
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-72 flex-shrink-0">
              <Card className="sticky top-24 p-6 shadow-md border-2 rounded-2xl">
                <h2 className="font-bold mb-6 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-orange-500" /> Filters
                </h2>
                <FilterContent />
              </Card>
            </div>

            {/* Course Grid */}
            <div className="flex-1">
              <Card className="mb-8 p-4 border rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-md">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Available Courses</p>
                      <p className="text-2xl font-bold text-primary">
                        {isLoading ? '...' : sortedCourses.length}
                      </p>
                    </div>
                  </div>
                  {hasActiveFilters && (
                    <div className="hidden md:flex items-center gap-2 flex-wrap">
                      {selectedCategories.map(cat => {
                        const category = categories.find(c => c.id === cat);
                        return (
                          <Badge
                            key={cat}
                            className="bg-blue-600 text-white font-semibold gap-2 cursor-pointer"
                            onClick={() => setSelectedCategories(prev => prev.filter(c => c !== cat))}
                          >
                            <span>{category.icon}</span>
                            <span>{category.label}</span>
                            <X className="w-3 h-3" />
                          </Badge>
                        );
                      })}
                      {selectedLevels.map(lev => (
                        <Badge
                          key={lev}
                          className="bg-indigo-600 text-white font-semibold gap-2 cursor-pointer"
                          onClick={() => setSelectedLevels(prev => prev.filter(l => l !== lev))}
                        >
                          {levels.find(l => l.id === lev)?.label}
                          <X className="w-3 h-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(9)].map((_, i) => (
                    <Card key={i} className="rounded-2xl overflow-hidden">
                      <div className="aspect-video bg-gray-200 animate-pulse" />
                      <div className="p-5 space-y-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
                        <div className="h-5 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : sortedCourses.length > 0 ? (
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  <AnimatePresence>
                    {sortedCourses.map((course, index) => (
                      <CourseCard key={course.id} course={course} index={index} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <Card className="text-center py-20 rounded-3xl border-2 border-dashed shadow-md">
                  <BookOpen className="w-20 h-20 text-orange-300 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold mb-2">No courses found</h2>
                  <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
                  <Button
                    onClick={clearFilters}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-6 py-3 font-semibold gap-2"
                  >
                    <X className="w-4 h-4" /> Clear all filters
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </CoursePasswordProtection>
  );
}