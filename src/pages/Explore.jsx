import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, X, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CourseCard from '@/components/courses/CourseCard';
import SearchBar from '@/components/courses/SearchBar';
import CoursePasswordProtection from '@/components/security/CoursePasswordProtection';

const categories = [
  { id: 'mathematics', label: 'Mathematics' },
  { id: 'english', label: 'English' },
  { id: 'biology', label: 'Biology' },
  { id: 'chemistry', label: 'Chemistry' },
  { id: 'physics', label: 'Physics' },
  { id: 'history', label: 'History' },
  { id: 'geography', label: 'Geography' },
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
    queryFn: () => base44.entities.Course.list('-created_date', 100),
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
        <h3 className="font-semibold text-gray-900 mb-4">Category</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center">
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
              />
              <Label htmlFor={`cat-${category.id}`} className="ml-3 text-gray-700 cursor-pointer">
                {category.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Level */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Level</h3>
        <div className="space-y-3">
          {levels.map((level) => (
            <div key={level.id} className="flex items-center">
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
              />
              <Label htmlFor={`level-${level.id}`} className="ml-3 text-gray-700 cursor-pointer">
                {level.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={200}
            step={10}
            className="mb-4"
            disabled={showFreeOnly}
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
        <div className="flex items-center mt-4">
          <Checkbox
            id="free-only"
            checked={showFreeOnly}
            onCheckedChange={setShowFreeOnly}
          />
          <Label htmlFor="free-only" className="ml-3 text-gray-700 cursor-pointer">
            Free courses only
          </Label>
        </div>
      </div>

      {hasActiveFilters && (
        <Button 
          variant="outline" 
          onClick={clearFilters}
          className="w-full"
        >
          <X className="w-4 h-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <CoursePasswordProtection user={user}>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Courses</h1>
          <p className="text-gray-500">Discover courses tailored to your interests</p>
        </div>

        {/* Search and Mobile Filter */}
        <div className="flex gap-3 mb-8">
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
              <Button variant="outline" className="lg:hidden h-12 px-4 rounded-xl border-gray-200 bg-white">
                <Filter className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-6 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </h2>
              <FilterContent />
            </div>
          </aside>

          {/* Course Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">{sortedCourses.length}</span> courses found
              </p>
              
              {/* Active Filters Pills */}
              {hasActiveFilters && (
                <div className="hidden md:flex items-center gap-2">
                  {selectedCategories.map(cat => (
                    <span 
                      key={cat}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                    >
                      {categories.find(c => c.id === cat)?.label}
                      <button onClick={() => setSelectedCategories(prev => prev.filter(c => c !== cat))}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

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
                className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
                layout
              >
                <AnimatePresence>
                  {sortedCourses.map((course, index) => (
                    <CourseCard key={course.id} course={course} index={index} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
                <Button onClick={clearFilters} variant="outline">
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </CoursePasswordProtection>
  );
}