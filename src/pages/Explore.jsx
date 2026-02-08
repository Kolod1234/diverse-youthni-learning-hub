import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, X, BookOpen, Sparkles, TrendingUp, Award, Star, Clock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CourseCard from '@/components/courses/CourseCard';
import SearchBar from '@/components/courses/SearchBar';
import CoursePasswordProtection from '@/components/security/CoursePasswordProtection';
import { Badge } from '@/components/ui/badge';

const categories = [
  { id: 'mathematics', label: 'Mathematics', icon: '🔢', color: 'from-blue-500 to-cyan-500' },
  { id: 'english', label: 'English', icon: '📚', color: 'from-purple-500 to-pink-500' },
  { id: 'biology', label: 'Biology', icon: '🧬', color: 'from-green-500 to-emerald-500' },
  { id: 'chemistry', label: 'Chemistry', icon: '⚗️', color: 'from-orange-500 to-amber-500' },
  { id: 'physics', label: 'Physics', icon: '⚛️', color: 'from-indigo-500 to-blue-500' },
  { id: 'science', label: 'Science', icon: '🔬', color: 'from-teal-500 to-cyan-500' },
  { id: 'history', label: 'History', icon: '📜', color: 'from-amber-500 to-orange-500' },
  { id: 'geography', label: 'Geography', icon: '🌍', color: 'from-emerald-500 to-teal-500' },
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
  }, []);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const courses = await base44.entities.Course.list('-created_date', 100);
      // Fetch lesson counts for all courses
      const coursesWithCounts = await Promise.all(
        courses.map(async (course) => {
          const lessons = await base44.entities.Lesson.filter({ course_id: course.id });
          return { ...course, lesson_count: lessons.length };
        })
      );
      return coursesWithCounts;
    },
  });

  const { data: allReviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: () => base44.entities.Review.list('-created_date', 1000),
  });

  const { data: allEnrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: () => base44.entities.Enrollment.list('-created_date', 1000),
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
      enrolled_count: enrollmentCount
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
    
    return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
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
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedLevels.length > 0 || showFreeOnly || searchQuery;

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          Category
        </h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <motion.div 
              key={category.id} 
              className={`flex items-center p-3 rounded-xl transition-all cursor-pointer ${
                selectedCategories.includes(category.id) 
                  ? `bg-gradient-to-r ${category.color} text-white shadow-md` 
                  : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-border'
              }`}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedCategories(prev => 
                  prev.includes(category.id)
                    ? prev.filter(c => c !== category.id)
                    : [...prev, category.id]
                );
              }}
            >
              <Checkbox
                id={`cat-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={(checked) => {
                  setSelectedCategories(prev => 
                    checked 
                      ? [...prev, category.id]
                      : prev.filter(c => c !== category.id)
                  );
                }}
                className={selectedCategories.includes(category.id) ? 'border-white' : ''}
              />
              <Label htmlFor={`cat-${category.id}`} className={`ml-3 cursor-pointer font-medium flex items-center gap-2 ${
                selectedCategories.includes(category.id) ? 'text-white' : 'text-foreground'
              }`}>
                <span className="text-lg">{category.icon}</span>
                {category.label}
              </Label>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Level */}
      <div>
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Level
        </h3>
        <div className="space-y-2">
          {levels.map((level) => (
            <motion.div 
              key={level.id} 
              className={`flex items-center p-3 rounded-xl transition-all cursor-pointer ${
                selectedLevels.includes(level.id)
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-border'
              }`}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedLevels(prev => 
                  prev.includes(level.id)
                    ? prev.filter(l => l !== level.id)
                    : [...prev, level.id]
                );
              }}
            >
              <Checkbox
                id={`level-${level.id}`}
                checked={selectedLevels.includes(level.id)}
                onCheckedChange={(checked) => {
                  setSelectedLevels(prev => 
                    checked 
                      ? [...prev, level.id]
                      : prev.filter(l => l !== level.id)
                  );
                }}
                className={selectedLevels.includes(level.id) ? 'border-white' : ''}
              />
              <Label htmlFor={`level-${level.id}`} className={`ml-3 cursor-pointer font-medium ${
                selectedLevels.includes(level.id) ? 'text-white' : 'text-foreground'
              }`}>
                {level.label}
              </Label>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          Price Range
        </h3>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-border">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={200}
            step={10}
            className="mb-4"
            disabled={showFreeOnly}
          />
          <div className="flex justify-between text-sm font-semibold text-foreground mb-4">
            <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full">£{priceRange[0]}</span>
            <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full">£{priceRange[1]}</span>
          </div>
        </div>
        <motion.div 
          className={`flex items-center mt-4 p-3 rounded-xl cursor-pointer transition-all ${
            showFreeOnly 
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
              : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-border'
          }`}
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowFreeOnly(!showFreeOnly)}
        >
          <Checkbox
            id="free-only"
            checked={showFreeOnly}
            onCheckedChange={setShowFreeOnly}
            className={showFreeOnly ? 'border-white' : ''}
          />
          <Label htmlFor="free-only" className={`ml-3 cursor-pointer font-medium flex items-center gap-2 ${
            showFreeOnly ? 'text-white' : 'text-foreground'
          }`}>
            <Sparkles className="w-4 h-4" />
            Free courses only
          </Label>
        </motion.div>
      </div>

      {hasActiveFilters && (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            variant="outline" 
            onClick={clearFilters}
            className="w-full bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-2 border-red-200 dark:border-red-800 hover:border-red-400 text-red-700 dark:text-red-300 font-semibold rounded-xl h-11 shadow-lg hover:shadow-xl transition-all"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All Filters
          </Button>
        </motion.div>
      )}
    </div>
  );

  const stats = [
    { icon: BookOpen, label: 'Total Courses', value: coursesWithActualData.length, color: 'from-blue-500 to-cyan-500' },
    { icon: Users, label: 'Active Learners', value: allEnrollments.length, color: 'from-purple-500 to-pink-500' },
    { icon: Star, label: 'Avg Rating', value: (coursesWithActualData.reduce((sum, c) => sum + (c.rating || 0), 0) / coursesWithActualData.length).toFixed(1), color: 'from-yellow-500 to-orange-500' },
    { icon: TrendingUp, label: 'Success Rate', value: '96%', color: 'from-green-500 to-emerald-500' }
  ];

  const featuredCourses = coursesWithActualData.filter(c => c.rating && c.rating >= 4.5).slice(0, 3);

  return (
    <CoursePasswordProtection user={user}>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-white dark:from-slate-950 dark:via-blue-950/30 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with Stats */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <motion.span 
            className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-2 border-blue-500/30 text-sm font-bold mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Discover Learning
            </span>
          </motion.span>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
            Explore Courses
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover courses tailored to your interests and start your learning journey today
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-950/30 rounded-2xl p-5 border border-border shadow-md hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Featured Courses Section */}
        {featuredCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-14"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                Featured Courses
              </h2>
              <Badge className="bg-yellow-100 text-yellow-800">Top Rated</Badge>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <AnimatePresence>
                {featuredCourses.map((course, i) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative group"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all" />
                    <CourseCard course={course} index={i} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Category Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14"
        >
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                onClick={() => setSelectedCategories([cat.id])}
                className={`p-3 rounded-xl transition-all ${
                  selectedCategories.includes(cat.id)
                    ? `bg-gradient-to-br ${cat.color} text-white shadow-lg`
                    : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-border shadow-sm hover:shadow-md'
                }`}
              >
                <div className="text-2xl mb-1">{cat.icon}</div>
                <div className="text-xs font-semibold line-clamp-2">{cat.label}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Search and Mobile Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 mb-12"
        >
          <div className="flex-1">
            <SearchBar 
              value={searchQuery} 
              onChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>
          
          {/* Mobile Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden h-12 px-5 rounded-xl border-2 border-primary/20 bg-gradient-to-r from-white to-blue-50 dark:from-slate-800 dark:to-blue-950 hover:border-primary/40 shadow-lg hover:shadow-xl transition-all">
                <Filter className="w-5 h-5 text-primary" />
                {hasActiveFilters && (
                  <Badge className="ml-2 bg-primary">{selectedCategories.length + selectedLevels.length + (showFreeOnly ? 1 : 0)}</Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </motion.div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-slate-800 dark:via-blue-950/30 dark:to-purple-950/30 rounded-2xl p-6 shadow-xl border-2 border-primary/10 backdrop-blur-sm"
            >
              <h2 className="font-bold text-lg mb-6 flex items-center gap-2 bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
                <Filter className="w-5 h-5 text-primary" />
                Filters
              </h2>
              <FilterContent />
            </motion.div>
          </aside>

          {/* Course Grid */}
          <div className="flex-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-8 bg-gradient-to-r from-white via-blue-50/50 to-purple-50/50 dark:from-slate-800 dark:via-blue-950/50 dark:to-purple-950/50 p-4 rounded-2xl border border-border shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available Courses</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {sortedCourses.length}
                  </p>
                </div>
              </div>
              
              {/* Active Filters Pills */}
              {hasActiveFilters && (
                <div className="hidden md:flex items-center gap-2 flex-wrap">
                  {selectedCategories.map(cat => {
                    const category = categories.find(c => c.id === cat);
                    return (
                      <motion.span 
                        key={cat}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        whileHover={{ scale: 1.05 }}
                        className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${category.color} text-white rounded-full text-sm font-semibold shadow-lg`}
                      >
                        <span>{category.icon}</span>
                        {category.label}
                        <button onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategories(prev => prev.filter(c => c !== cat));
                        }} className="hover:bg-white/20 rounded-full p-0.5 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    );
                  })}
                  {selectedLevels.map(lev => (
                    <motion.span 
                      key={lev}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      whileHover={{ scale: 1.05 }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm font-semibold shadow-lg"
                    >
                      {levels.find(l => l.id === lev)?.label}
                      <button onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLevels(prev => prev.filter(l => l !== lev));
                      }} className="hover:bg-white/20 rounded-full p-0.5 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              )}
            </motion.div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-video bg-gray-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-5 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedCourses.length > 0 ? (
              <motion.div 
                className="grid md:grid-cols-2 xl:grid-cols-3 gap-8"
                layout
              >
                <AnimatePresence>
                  {sortedCourses.map((course, index) => (
                    <CourseCard key={course.id} course={course} index={index} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-slate-800 dark:via-blue-950 dark:to-purple-950 rounded-3xl border-2 border-dashed border-border shadow-xl"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <BookOpen className="w-20 h-20 text-primary/50 mx-auto mb-6" />
                </motion.div>
                <h3 className="text-2xl font-bold text-foreground mb-3">No courses found</h3>
                <p className="text-muted-foreground mb-8 text-lg">Try adjusting your search or filter criteria</p>
                <Button onClick={clearFilters} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-8 h-12 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                  <X className="w-4 h-4 mr-2" />
                  Clear all filters
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      </div>
    </CoursePasswordProtection>
  );
}