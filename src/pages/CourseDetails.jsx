import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, Clock, Users, Star, BookOpen, Award, CheckCircle, 
  Lock, ChevronRight, Download, Globe, Trophy, ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const levelColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

export default function CourseDetails() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: course, isLoading: loadingCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }, 'order', 100),
    enabled: !!courseId,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollment', courseId, user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: courseId, created_by: user?.email }),
    enabled: !!courseId && !!user?.email,
  });

  const enrollment = enrollments[0];
  const isEnrolled = !!enrollment;

  const enrollMutation = useMutation({
    mutationFn: () => base44.entities.Enrollment.create({
      course_id: courseId,
      progress_percent: 0,
      completed_lessons: [],
      is_completed: false,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollment', courseId]);
    },
  });

  // Group lessons by section
  const sections = lessons.reduce((acc, lesson) => {
    const section = lesson.section || 'Getting Started';
    if (!acc[section]) acc[section] = [];
    acc[section].push(lesson);
    return acc;
  }, {});

  if (loadingCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-2xl mb-8" />
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Course not found</h2>
          <Link to={createPageUrl('Explore')}>
            <Button>Browse Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to={createPageUrl('Explore')} className="inline-flex items-center text-indigo-100 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>
          
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Badge className={`${levelColors[course.level] || levelColors.beginner} border-0 mb-4`}>
                  {course.level}
                </Badge>
                
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">{course.title}</h1>
                <p className="text-lg text-indigo-100 mb-6">{course.description}</p>
                
                <div className="flex flex-wrap items-center gap-6 text-indigo-100 mb-6">
                  <div className="flex items-center gap-2">
                    <img
                      src={course.instructor_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor || 'Instructor')}&background=6366f1&color=fff`}
                      alt={course.instructor}
                      className="w-10 h-10 rounded-full border-2 border-white/30"
                    />
                    <span>{course.instructor || 'Expert Instructor'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-white">{course.rating?.toFixed(1) || '4.5'}</span>
                    <span>({(course.enrolled_count || 0).toLocaleString()} students)</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                    <Clock className="w-4 h-4" />
                    {course.duration_hours || 0} hours
                  </span>
                  <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                    <BookOpen className="w-4 h-4" />
                    {course.total_lessons || lessons.length} lessons
                  </span>
                  <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                    <Globe className="w-4 h-4" />
                    English
                  </span>
                  <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                    <Award className="w-4 h-4" />
                    Certificate
                  </span>
                </div>
              </motion.div>
            </div>
            
            {/* Enrollment Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="overflow-hidden border-0 shadow-2xl">
                <div className="aspect-video relative">
                  <img
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-indigo-600 ml-1" />
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {course.price === 0 ? 'Free' : `$${course.price}`}
                    </span>
                    {course.price > 0 && (
                      <span className="text-lg text-gray-400 line-through">
                        ${Math.round(course.price * 1.5)}
                      </span>
                    )}
                  </div>
                  
                  {isEnrolled ? (
                    <Link to={createPageUrl('LessonPlayer') + `?courseId=${courseId}&lessonId=${enrollment.current_lesson_id || lessons[0]?.id || ''}`}>
                      <Button className="w-full h-14 text-lg bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                        <Play className="w-5 h-5 mr-2" />
                        Continue Learning
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      className="w-full h-14 text-lg bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                      onClick={() => enrollMutation.mutate()}
                      disabled={enrollMutation.isPending}
                    >
                      {enrollMutation.isPending ? 'Enrolling...' : (course.price === 0 ? 'Enroll for Free' : 'Buy Now')}
                    </Button>
                  )}
                  
                  <div className="mt-6 space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Downloadable resources</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="curriculum" className="w-full">
              <TabsList className="bg-white border border-gray-200 p-1 rounded-xl mb-6">
                <TabsTrigger value="curriculum" className="rounded-lg px-6 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  Curriculum
                </TabsTrigger>
                <TabsTrigger value="overview" className="rounded-lg px-6 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  Overview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="curriculum">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {Object.keys(sections).length} sections • {lessons.length} lessons
                    </span>
                    <span className="text-sm text-gray-500">
                      {course.duration_hours || 0}h total
                    </span>
                  </div>
                  
                  <Accordion type="multiple" defaultValue={Object.keys(sections)} className="divide-y divide-gray-100">
                    {Object.entries(sections).map(([sectionName, sectionLessons]) => (
                      <AccordionItem key={sectionName} value={sectionName} className="border-0">
                        <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 hover:no-underline">
                          <div className="flex items-center gap-3 text-left">
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{sectionName}</h3>
                              <p className="text-sm text-gray-500">
                                {sectionLessons.length} lessons
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-0">
                          <div className="divide-y divide-gray-50">
                            {sectionLessons.map((lesson, index) => {
                              const isCompleted = enrollment?.completed_lessons?.includes(lesson.id);
                              const canAccess = isEnrolled || lesson.is_preview;
                              
                              return (
                                <div
                                  key={lesson.id}
                                  className={`px-6 py-3 flex items-center justify-between ${canAccess ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-60'}`}
                                >
                                  <div className="flex items-center gap-3">
                                    {isCompleted ? (
                                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                                      </div>
                                    ) : canAccess ? (
                                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <Play className="w-3 h-3 text-indigo-600 ml-0.5" />
                                      </div>
                                    ) : (
                                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Lock className="w-3 h-3 text-gray-400" />
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-medium text-gray-900 text-sm">{lesson.title}</p>
                                      {lesson.is_preview && !isEnrolled && (
                                        <Badge variant="outline" className="mt-1 text-xs">Preview</Badge>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {lesson.duration_minutes || 10} min
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </TabsContent>

              <TabsContent value="overview">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">About This Course</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{course.description}</p>
                  
                  {course.tags?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Topics Covered</h4>
                      <div className="flex flex-wrap gap-2">
                        {course.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="bg-indigo-50 text-indigo-700">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">What You'll Learn</h4>
                    <ul className="grid sm:grid-cols-2 gap-3">
                      {['Master core concepts and fundamentals',
                        'Build real-world projects',
                        'Learn best practices',
                        'Get hands-on experience'].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Instructor Card */}
            <Card className="p-6 border-0 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Your Instructor</h3>
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={course.instructor_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor || 'Instructor')}&background=6366f1&color=fff&size=80`}
                  alt={course.instructor}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{course.instructor || 'Expert Instructor'}</h4>
                  <p className="text-sm text-gray-500">Professional Instructor</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  4.9 Rating
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  10K+ Students
                </span>
              </div>
            </Card>

            {/* Course Stats */}
            <Card className="p-6 border-0 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Course Includes</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    Duration
                  </span>
                  <span className="font-medium text-gray-900">{course.duration_hours || 0} hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    Lessons
                  </span>
                  <span className="font-medium text-gray-900">{course.total_lessons || lessons.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Download className="w-4 h-4" />
                    Resources
                  </span>
                  <span className="font-medium text-gray-900">Downloadable</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Trophy className="w-4 h-4" />
                    Certificate
                  </span>
                  <span className="font-medium text-gray-900">Included</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}