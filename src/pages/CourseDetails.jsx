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
  Lock, ChevronRight, Download, Globe, Trophy, ArrowLeft, MessageSquare, Brain
} from 'lucide-react';
import ModuleProgress from '@/components/interactive/ModuleProgress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

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

  const { data: allQuizzes = [] } = useQuery({
    queryKey: ['quizzes', courseId],
    queryFn: () => base44.entities.Quiz.filter({ course_id: courseId }),
    enabled: !!courseId,
  });

  // Show all quizzes to enrolled students, only published to non-enrolled
  const quizzes = isEnrolled ? allQuizzes : allQuizzes.filter(q => q.is_published);

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', courseId],
    queryFn: () => base44.entities.Review.filter({ course_id: courseId }, '-created_date', 20),
    enabled: !!courseId,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollment', courseId, user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: courseId, created_by: user?.email }),
    enabled: !!courseId && !!user?.email,
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 100),
  });

  const { data: allEnrollments = [] } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: () => base44.entities.Enrollment.list('-created_date', 1000),
  });

  const { data: instructorReviews = [] } = useQuery({
    queryKey: ['instructor-reviews', course?.instructor],
    queryFn: () => base44.entities.Review.filter({ instructor_name: course?.instructor || '', rating_type: 'tutor' }),
    enabled: !!courseId && !!course?.instructor,
  });

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

  // Calculate data after all hooks
  const enrollment = enrollments[0];
  const isEnrolled = !!enrollment;

  // Group lessons by section
  const sections = lessons.reduce((acc, lesson) => {
    const section = lesson.section || 'Getting Started';
    if (!acc[section]) acc[section] = [];
    acc[section].push(lesson);
    return acc;
  }, {});

  // Calculate actual course rating from reviews
  const courseReviews = reviews.filter(r => r.rating_type === 'course' || !r.rating_type);
  const actualCourseRating = courseReviews.length > 0
    ? (courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length).toFixed(1)
    : null;

  // Calculate actual student count from enrollments
  const actualStudentCount = allEnrollments.filter(e => e.course_id === courseId).length;

  // Calculate real instructor statistics from enrollment data
  const instructorCourses = allCourses.filter(c => c.instructor === course?.instructor);
  const instructorCourseIds = instructorCourses.map(c => c.id);
  const instructorStudents = new Set(
    allEnrollments.filter(e => instructorCourseIds.includes(e.course_id)).map(e => e.created_by)
  ).size;
  const instructorRating = instructorReviews.length > 0
    ? (instructorReviews.reduce((sum, r) => sum + r.rating, 0) / instructorReviews.length).toFixed(1)
    : null;

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
                  {actualCourseRating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-white">{actualCourseRating}</span>
                      <span>({actualStudentCount.toLocaleString()} students)</span>
                    </div>
                  )}
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
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80'}
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
                    <Button 
                      className="w-full h-14 text-lg bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                      onClick={() => {
                        const targetLessonId = enrollment.current_lesson_id || lessons[0]?.id;
                        if (targetLessonId) {
                          window.location.href = createPageUrl('LessonPlayer') + `?courseId=${courseId}&lessonId=${targetLessonId}`;
                        }
                      }}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Continue Learning
                    </Button>
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
                <TabsTrigger value="reviews" className="rounded-lg px-6 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  Reviews ({reviews.length})
                </TabsTrigger>
                <TabsTrigger value="discussion" className="rounded-lg px-6 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  Discussion
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
                             const lessonQuizCount = quizzes.filter(q => q.lesson_id === lesson.id).length;

                             return (
                               <div
                                 key={lesson.id}
                                 onClick={() => {
                                   if (canAccess) {
                                     window.location.href = createPageUrl('LessonPlayer') + `?courseId=${courseId}&lessonId=${lesson.id}`;
                                   }
                                 }}
                                 className={`px-6 py-3 ${canAccess ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-60'}`}
                               >
                                 <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                     {isCompleted ? (
                                       <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                         <CheckCircle className="w-4 h-4 text-emerald-600" />
                                       </div>
                                     ) : canAccess ? (
                                       <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                                         <Play className="w-3 h-3 text-indigo-600 ml-0.5" />
                                       </div>
                                     ) : (
                                       <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                                         <Lock className="w-3 h-3 text-gray-400" />
                                       </div>
                                     )}
                                     <div className="flex-1">
                                       <p className="font-medium text-gray-900 text-sm">{lesson.title}</p>
                                       <div className="flex items-center gap-2 mt-1">
                                         {lesson.is_preview && !isEnrolled && (
                                           <Badge variant="outline" className="text-xs">Preview</Badge>
                                         )}
                                         {lessonQuizCount > 0 && (
                                           <span className="inline-flex items-center gap-1 text-xs text-violet-600">
                                             <Brain className="w-3 h-3" />
                                             {lessonQuizCount} quiz{lessonQuizCount > 1 ? 'zes' : ''}
                                           </span>
                                         )}
                                       </div>
                                     </div>
                                   </div>
                                   <span className="text-sm text-gray-500 shrink-0 ml-2">
                                     {lesson.duration_minutes || 10} min
                                   </span>
                                 </div>
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
                  
                  <div className="mb-6">
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

                  {quizzes.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Quizzes</h4>
                      <div className="space-y-2">
                        {quizzes.map((quiz) => (
                          <Link key={quiz.id} to={createPageUrl('Quiz') + `?id=${quiz.id}`}>
                            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                              <div>
                                <p className="font-medium text-gray-900">{quiz.title}</p>
                                <div className="flex gap-2 text-sm text-gray-500">
                                  <span>{quiz.questions?.length} questions</span>
                                  {quiz.topic && <span>• {quiz.topic}</span>}
                                  {quiz.subtopic && <span>• {quiz.subtopic}</span>}
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-indigo-600" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Student Reviews</h3>
                    {actualCourseRating && (
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                          <span className="text-2xl font-bold text-gray-900">{actualCourseRating}</span>
                        </div>
                        <p className="text-sm text-gray-500">{courseReviews.length} reviews</p>
                      </div>
                    )}
                  </div>

                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarImage src={review.user_avatar} />
                              <AvatarFallback className="bg-indigo-100 text-indigo-600">
                                {review.user_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-gray-900">{review.user_name}</span>
                                {review.is_verified_purchase && (
                                  <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700">
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <p className="text-gray-600 text-sm">{review.comment}</p>
                              <p className="text-xs text-gray-400 mt-2">
                                {format(new Date(review.created_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No reviews yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="discussion">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
                  <MessageSquare className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Join the Discussion</h3>
                  <p className="text-gray-500 mb-4">Connect with other students and instructors</p>
                  <Link to={createPageUrl('CourseDiscussion') + `?courseId=${courseId}`}>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      Go to Discussion Forum
                    </Button>
                  </Link>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Module Progress */}
            {isEnrolled && (
              <ModuleProgress 
                sections={sections}
                completedLessons={enrollment?.completed_lessons || []}
                isEnrolled={isEnrolled}
              />
            )}

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
                {instructorRating && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {instructorRating} Rating
                  </span>
                )}
                {instructorStudents > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {instructorStudents.toLocaleString()} Students
                  </span>
                )}
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

            {/* GCSE Syllabus */}
            {course.syllabus_url && (
              <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">GCSE Syllabus</h3>
                    {course.exam_board && (
                      <p className="text-xs text-gray-500">{course.exam_board}</p>
                    )}
                  </div>
                </div>
                <a
                  href={course.syllabus_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full justify-between hover:bg-white">
                    <span className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download Syllabus PDF
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </a>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}