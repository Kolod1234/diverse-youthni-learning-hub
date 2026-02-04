import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, X, BookOpen, Users, FileText, ClipboardList, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function GlobalSearch({ onClose }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return null;
      
      setIsSearching(true);
      const results = {
        courses: [],
        lessons: [],
        students: [],
        assignments: []
      };

      try {
        // Search courses
        const courses = await base44.entities.Course.list('-created_date', 50);
        results.courses = courses.filter(c => 
          c.title?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          c.description?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          c.category?.toLowerCase().includes(debouncedQuery.toLowerCase())
        ).slice(0, 5);

        // Search lessons
        const lessons = await base44.entities.Lesson.list('-created_date', 100);
        results.lessons = lessons.filter(l => 
          l.title?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          l.description?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          l.section?.toLowerCase().includes(debouncedQuery.toLowerCase())
        ).slice(0, 5);

        // Search enrollments (students)
        const enrollments = await base44.entities.Enrollment.list('-created_date', 100);
        results.students = enrollments.filter(e => 
          e.created_by?.toLowerCase().includes(debouncedQuery.toLowerCase())
        ).slice(0, 5);

        // Search assignments
        const assignments = await base44.entities.Assignment.list('-created_date', 50);
        results.assignments = assignments.filter(a => 
          a.title?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          a.description?.toLowerCase().includes(debouncedQuery.toLowerCase())
        ).slice(0, 5);
      } catch (error) {
        console.error('Search error:', error);
      }

      setIsSearching(false);
      return results;
    },
    enabled: debouncedQuery.length >= 2
  });

  const totalResults = searchResults 
    ? searchResults.courses.length + searchResults.lessons.length + 
      searchResults.students.length + searchResults.assignments.length
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20" onClick={onClose}>
      <Card className="w-full max-w-2xl mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-5 h-5 text-gray-400" />
          <Input
            autoFocus
            placeholder="Search courses, lessons, students, assignments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border-none focus-visible:ring-0 text-lg"
          />
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {isLoading || isSearching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : !debouncedQuery ? (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Type to search across all content...</p>
          </div>
        ) : totalResults === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No results found for "{debouncedQuery}"</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Courses */}
            {searchResults.courses.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-gray-500 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Courses ({searchResults.courses.length})
                </h3>
                <div className="space-y-2">
                  {searchResults.courses.map(course => (
                    <Link key={course.id} to={createPageUrl('CourseDetails') + `?id=${course.id}`} onClick={onClose}>
                      <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <div className="font-medium text-gray-900">{course.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{course.description}</div>
                        <Badge variant="secondary" className="mt-1">{course.category}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Lessons */}
            {searchResults.lessons.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-gray-500 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Lessons ({searchResults.lessons.length})
                </h3>
                <div className="space-y-2">
                  {searchResults.lessons.map(lesson => (
                    <Link key={lesson.id} to={createPageUrl('LessonEditor') + `?id=${lesson.id}`} onClick={onClose}>
                      <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <div className="font-medium text-gray-900">{lesson.title}</div>
                        <div className="text-sm text-gray-500">{lesson.section}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Students */}
            {searchResults.students.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-gray-500 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Students ({searchResults.students.length})
                </h3>
                <div className="space-y-2">
                  {searchResults.students.map(enrollment => (
                    <div key={enrollment.id} className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <div className="font-medium text-gray-900">{enrollment.created_by}</div>
                      <div className="text-sm text-gray-500">{enrollment.progress_percent || 0}% complete</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assignments */}
            {searchResults.assignments.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-gray-500 mb-2 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Assignments ({searchResults.assignments.length})
                </h3>
                <div className="space-y-2">
                  {searchResults.assignments.map(assignment => (
                    <div key={assignment.id} className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <div className="font-medium text-gray-900">{assignment.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{assignment.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}