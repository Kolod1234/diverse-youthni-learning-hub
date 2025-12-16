import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, BookOpen, Users, Search, GraduationCap, 
  Award, TrendingUp, ChevronRight, Plus, Sparkles, LogOut 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Tutors() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(() => localStorage.getItem('tutorsUnlocked') === 'true');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setCurrentUser(userData);
    };
    loadUser();
  }, []);

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 500),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: () => base44.entities.Enrollment.list('-created_date', 1000),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: () => base44.entities.Review.list('-created_date', 1000),
  });

  const tutors = allUsers.filter(user => user.is_tutor || user.role === 'admin');

  const getTutorStats = (tutorEmail, tutorName) => {
    const tutorCourses = courses.filter(c => c.created_by === tutorEmail);
    const tutorEnrollments = enrollments.filter(e => 
      tutorCourses.some(c => c.id === e.course_id)
    );
    const totalStudents = new Set(tutorEnrollments.map(e => e.created_by)).size;
    
    // Get tutor ratings from reviews
    const tutorReviews = reviews.filter(r => 
      r.rating_type === 'tutor' && 
      tutorCourses.some(c => c.id === r.course_id)
    );
    
    const avgRating = tutorReviews.length > 0
      ? tutorReviews.reduce((sum, r) => sum + r.rating, 0) / tutorReviews.length
      : 0;

    return {
      courseCount: tutorCourses.length,
      studentCount: totalStudents,
      rating: avgRating,
      reviewCount: tutorReviews.length,
      courses: tutorCourses
    };
  };

  const filteredTutors = tutors.filter(tutor => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return tutor.full_name?.toLowerCase().includes(query) ||
           tutor.email?.toLowerCase().includes(query) ||
           tutor.bio?.toLowerCase().includes(query);
  });

  const handleUnlock = (e) => {
    e.preventDefault();
    if (accessCode === 'DYNI26') {
      setIsUnlocked(true);
      localStorage.setItem('tutorsUnlocked', 'true');
      setError('');
    } else {
      setError('Invalid access code');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tutorsUnlocked');
    setIsUnlocked(false);
    setAccessCode('');
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Tutors Access</h2>
            <p className="text-gray-500 text-center mb-6">Enter the access code to view tutors</p>
            
            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <Input
                  type="text"
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter access code"
                  className="h-12 text-center text-lg"
                  autoFocus
                />
                {error && (
                  <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
                )}
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-12">
                Unlock
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Logout Button */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout from Tutors Area
          </Button>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Meet Our Expert Tutors</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-6">
            Learn from experienced educators and industry professionals
          </p>
          {(currentUser?.is_tutor || currentUser?.role === 'admin') && (
           <div className="flex justify-center gap-3">
             <Link to={createPageUrl('TutorSetup')}>
               <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                 Set Up Profile
               </Button>
             </Link>
             <Link to={createPageUrl('TutorDashboard')}>
               <Button size="lg" variant="outline">
                 My Tutor Dashboard
               </Button>
             </Link>
           </div>
          )}
          {!currentUser?.is_tutor && currentUser?.role !== 'admin' && (
            <div className="mt-6">
              <Card className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Become a Tutor</h3>
                    <p className="text-sm text-gray-600">Share your expertise and earn by teaching on our platform</p>
                  </div>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    Apply Now
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tutors by name, email, or expertise..."
              className="pl-12 h-14 text-lg rounded-2xl border-gray-200 focus:border-indigo-300"
            />
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
          {[
            { label: 'Expert Tutors', value: tutors.length, icon: Users },
            { label: 'Total Courses', value: courses.length, icon: BookOpen },
            { label: 'Active Students', value: new Set(enrollments.map(e => e.created_by)).size, icon: TrendingUp }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
              >
                <Card className="p-6 text-center">
                  <Icon className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Tutors Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredTutors.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutors.map((tutor, index) => {
              const stats = getTutorStats(tutor.email, tutor.full_name);
              
              return (
                <motion.div
                  key={tutor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-6 hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="w-16 h-16 border-2 border-indigo-100">
                        <AvatarImage src={tutor.avatar} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xl font-semibold">
                          {tutor.full_name?.charAt(0) || 'T'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
                          {tutor.full_name || 'Expert Tutor'}
                        </h3>
                        <div className="flex items-center gap-1 mb-2">
                          {stats.rating > 0 ? (
                            <>
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              <span className="text-sm font-semibold text-gray-900">
                                {stats.rating.toFixed(1)}
                              </span>
                              <span className="text-xs text-gray-500 ml-1">
                                ({stats.reviewCount} {stats.reviewCount === 1 ? 'review' : 'reviews'})
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-gray-500">No reviews yet</span>
                          )}
                        </div>
                        {tutor.role === 'admin' && (
                          <Badge className="bg-indigo-100 text-indigo-700 border-0">
                            <Award className="w-3 h-3 mr-1" />
                            Platform Admin
                          </Badge>
                        )}
                      </div>
                    </div>

                    {tutor.bio && (
                     <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                       {tutor.bio}
                     </p>
                    )}

                    {tutor.expertise_subjects && tutor.expertise_subjects.length > 0 && (
                     <div className="mb-4">
                       <p className="text-xs font-medium text-gray-500 mb-2">SUBJECTS</p>
                       <div className="flex flex-wrap gap-2">
                         {tutor.expertise_subjects.map(subject => (
                           <span key={subject} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs capitalize">
                             {subject}
                           </span>
                         ))}
                       </div>
                     </div>
                    )}

                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 pb-4 border-b">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {stats.courseCount} courses
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {stats.studentCount} students
                      </span>
                    </div>

                    {stats.courses.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 mb-2">POPULAR COURSES</p>
                        <div className="space-y-1">
                          {stats.courses.slice(0, 2).map(course => (
                            <Link 
                              key={course.id}
                              to={createPageUrl('CourseDetails') + `?id=${course.id}`}
                              className="text-sm text-indigo-600 hover:text-indigo-700 block truncate"
                            >
                              • {course.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-auto">
                      <Link to={createPageUrl('Explore')} className="flex-1">
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 group-hover:shadow-md transition-all">
                          View Courses
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tutors found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search query</p>
            <Button onClick={() => setSearchQuery('')} variant="outline">
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}