import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CoursePasswordProtection from '@/components/security/CoursePasswordProtection';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Button, Card, CardContent, CardMedia, Chip, Box, Typography, Container,
  Accordion, AccordionSummary, AccordionDetails, Tabs, Tab, Avatar, Breadcrumbs
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { 
  Play, Clock, Users, Star, BookOpen, Award, CheckCircle, 
  Lock, ChevronRight, Download, Globe, Trophy, ArrowLeft, MessageSquare, Brain, Settings
} from 'lucide-react';
import ModuleProgress from '@/components/interactive/ModuleProgress';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import CourseLeaderboard from '@/components/gamification/CourseLeaderboard';
import CourseSEO from '@/components/seo/CourseSEO';
import DynamicCourseLanding from '@/components/course/DynamicCourseLanding';

const levelColors = {
  beginner: { bgcolor: '#dcfce7', color: '#15803d' },
  intermediate: { bgcolor: '#fef3c7', color: '#a16207' },
  advanced: { bgcolor: '#fee2e2', color: '#b91c1c' },
};

export default function CourseDetails() {
  const [user, setUser] = useState(null);
  const [tabValue, setTabValue] = useState('curriculum');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
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
      return await base44.entities.Course.get(courseId);
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }, 'order', 500),
    enabled: !!courseId && !!course,
    staleTime: 5 * 60 * 1000,
  });

  const { data: allQuizzes = [] } = useQuery({
    queryKey: ['quizzes', courseId],
    queryFn: () => base44.entities.Quiz.filter({ course_id: courseId }),
    enabled: !!courseId && !!course,
    staleTime: 5 * 60 * 1000,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', courseId],
    queryFn: () => base44.entities.Review.filter({ course_id: courseId }, '-created_date', 20),
    enabled: !!courseId && !!course,
    staleTime: 2 * 60 * 1000,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollment', courseId, user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: courseId, created_by: user?.email }),
    enabled: !!courseId && !!user?.email && !!course,
    staleTime: 1 * 60 * 1000,
  });

  const { data: courseEnrollments = [] } = useQuery({
    queryKey: ['course-enrollments', courseId],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: courseId }),
    enabled: !!courseId && !!course,
    staleTime: 5 * 60 * 1000,
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ['instructor-courses', course?.instructor],
    queryFn: () => base44.entities.Course.filter({ instructor: course?.instructor }),
    enabled: !!course?.instructor,
    staleTime: 10 * 60 * 1000,
  });

  const { data: instructorEnrollments = [] } = useQuery({
    queryKey: ['instructor-enrollments', course?.instructor],
    queryFn: async () => {
      if (!course?.instructor) return [];
      const courses = await base44.entities.Course.filter({ instructor: course.instructor });
      const courseIds = courses.map(c => c.id);
      const enrollments = [];
      for (const id of courseIds) {
        const e = await base44.entities.Enrollment.filter({ course_id: id });
        enrollments.push(...e);
      }
      return enrollments;
    },
    enabled: !!course?.instructor,
    staleTime: 10 * 60 * 1000,
  });

  const { data: instructorReviews = [] } = useQuery({
    queryKey: ['instructor-reviews', course?.instructor],
    queryFn: () => base44.entities.Review.filter({ instructor_name: course?.instructor || '', rating_type: 'tutor' }),
    enabled: !!course?.instructor,
    staleTime: 5 * 60 * 1000,
  });

  const { data: lessonKeys = [] } = useQuery({
    queryKey: ['lesson-keys', courseId],
    queryFn: () => base44.entities.LessonUnlockKey.filter({ course_id: courseId }),
    enabled: !!courseId && !!course && !!user,
    staleTime: 2 * 60 * 1000,
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

  // Calculate enrollment status - move after all hooks
  const enrollment = enrollments[0];
  const isEnrolled = !!enrollment;

  // Show all quizzes to enrolled students, only published to non-enrolled
  const quizzes = isEnrolled ? allQuizzes : allQuizzes.filter(q => q.is_published);

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
  const actualStudentCount = courseEnrollments.length;

  // Calculate real instructor statistics from enrollment data
  const instructorCourses = allCourses;
  const instructorStudents = new Set(instructorEnrollments.map(e => e.created_by)).size;
  const instructorRating = instructorReviews.length > 0
    ? (instructorReviews.reduce((sum, r) => sum + r.rating, 0) / instructorReviews.length).toFixed(1)
    : null;

  if (loadingCourse) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f8fafc, white)' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ '& > *': { bgcolor: 'grey.200', borderRadius: 4, mb: 2 } }}>
            <Box sx={{ height: 256 }} />
            <Box sx={{ height: 32, width: '66%' }} />
            <Box sx={{ height: 16, width: '50%' }} />
          </Box>
        </Container>
      </Box>
    );
  }

  if (!course) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f8fafc, white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" style={{ color: '#d1d5db' }} />
          <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>Course not found</Typography>
          <Link to={createPageUrl('Explore')} style={{ textDecoration: 'none' }}>
            <Button variant="contained">Browse Courses</Button>
          </Link>
        </Box>
      </Box>
    );
  }

  return (
    <CoursePasswordProtection user={user}>
      <CourseSEO course={course} />
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f8fafc, white)' }}>
      {/* Hero Section */}
      <Box sx={{ position: 'relative', background: 'linear-gradient(to bottom right, #4f46e5, #7c3aed, #9333ea)', color: 'white' }}>
        {user?.role === 'admin' && (
            <Link to={createPageUrl('AdminCourseBuilder') + `?course=${courseId}`} style={{ textDecoration: 'none' }}>
              <Button 
                startIcon={<Settings size={16} />}
                variant="contained"
                size="small"
                sx={{ 
                  position: 'absolute', 
                  top: 16, 
                  right: 16, 
                  zIndex: 20, 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  color: 'white'
                }}
              >
                Customize Page
              </Button>
            </Link>
          )}
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.2)' }} />
        <Container maxWidth="xl" sx={{ position: 'relative', py: 6 }}>
          <Breadcrumbs separator={<ChevronRight size={16} />} sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, '& a': { color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } } }}>
            <Link to={createPageUrl('Dashboard')} style={{ textDecoration: 'none', color: 'inherit' }}>Dashboard</Link>
            <Link to={createPageUrl('Explore')} style={{ textDecoration: 'none', color: 'inherit' }}>Courses</Link>
            <Typography sx={{ color: 'white', fontWeight: 500 }}>{course.title}</Typography>
          </Breadcrumbs>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4, alignItems: 'start' }}>
            <Box>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Chip 
                  label={course.level} 
                  sx={{ ...levelColors[course.level] || levelColors.beginner, border: 0, mb: 2, textTransform: 'capitalize' }}
                />
                
                <Typography variant="h3" fontWeight={700} sx={{ mb: 2 }}>{course.title}</Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }}>{course.description}</Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3, color: 'rgba(255,255,255,0.9)', mb: 3 }}>
                  {course.instructor && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={course.instructor_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor)}&background=6366f1&color=fff`}
                        alt={course.instructor}
                        sx={{ width: 40, height: 40, border: '2px solid rgba(255,255,255,0.3)' }}
                      />
                      <Typography>{course.instructor}</Typography>
                    </Box>
                  )}
                  {actualCourseRating && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      <Typography fontWeight={600} sx={{ color: 'white' }}>{actualCourseRating}</Typography>
                      <Typography>({actualStudentCount.toLocaleString()} students)</Typography>
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Chip icon={<Clock size={16} />} label={`${course.duration_hours || 0} hours`} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }} />
                  <Chip icon={<BookOpen size={16} />} label={`${lessons.length} lessons`} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }} />
                  <Chip icon={<Globe size={16} />} label="English" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }} />
                  <Chip icon={<Award size={16} />} label="Certificate" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }} />
                </Box>
                </motion.div>
                </Box>
            
            {/* Enrollment Card */}
            <Box>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card sx={{ overflow: 'hidden', border: 0, boxShadow: 6 }}>
                  <CardMedia
                    component="div"
                    sx={{ position: 'relative', paddingTop: '56.25%' }}
                  >
                    <img
                      src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80'}
                      alt={course.title}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Box sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { transform: 'scale(1.1)' }, transition: 'transform 0.2s' }}>
                        <Play className="w-6 h-6 text-indigo-600 ml-1" style={{ color: '#4f46e5' }} />
                      </Box>
                    </Box>
                  </CardMedia>
                  
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 3 }}>
                      <Typography variant="h4" fontWeight={700}>
                        {course.price === 0 ? 'Free' : `£${course.price}`}
                      </Typography>
                      {course.price > 0 && (
                        <Typography variant="h6" sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
                          £{Math.round(course.price * 1.5)}
                        </Typography>
                      )}
                    </Box>
                  
                    {isEnrolled ? (
                      <Button 
                        variant="contained"
                        fullWidth
                        size="large"
                        startIcon={<Play size={20} />}
                        onClick={() => {
                          const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
                          const targetLessonId = enrollment.current_lesson_id || sortedLessons[0]?.id;
                          if (targetLessonId) {
                            navigate(`${createPageUrl('LessonPlayer')}?course=${courseId}&lesson=${targetLessonId}`);
                          }
                        }}
                        sx={{ py: 2, fontSize: '1.125rem', borderRadius: 3 }}
                      >
                        Continue Learning
                      </Button>
                    ) : (
                      <Button 
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={() => enrollMutation.mutate()}
                        disabled={enrollMutation.isPending}
                        sx={{ py: 2, fontSize: '1.125rem', borderRadius: 3 }}
                      >
                        {enrollMutation.isPending ? 'Enrolling...' : (course.price === 0 ? 'Enroll for Free' : 'Buy Now')}
                      </Button>
                    )}
                  
                    <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle size={16} color="#10b981" />
                        <Typography variant="body2">Lifetime access</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle size={16} color="#10b981" />
                        <Typography variant="body2">Certificate of completion</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle size={16} color="#10b981" />
                        <Typography variant="body2">Downloadable resources</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Course Content */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4 }}>
          <Box>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
              <Tab label="Curriculum" value="curriculum" />
              <Tab label="Overview" value="overview" />
              <Tab label={`Reviews (${reviews.length})`} value="reviews" />
              <Tab label="Discussion" value="discussion" />
            </Tabs>

              {tabValue === 'curriculum' && (
                <Card sx={{ borderRadius: 4, boxShadow: 1, border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography fontWeight={500}>
                      {Object.keys(sections).length} sections • {lessons.length} lessons
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {course.duration_hours || 0}h total
                    </Typography>
                  </Box>
                  
                  {Object.entries(sections).map(([sectionName, sectionLessons]) => (
                    <Accordion key={sectionName} defaultExpanded>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3, py: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main' + '15', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen size={16} color="#4f46e5" />
                          </Box>
                          <Box>
                            <Typography fontWeight={600}>{sectionName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {sectionLessons.length} lessons
                            </Typography>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
                          {sectionLessons.map((lesson, index) => {
                            const isCompleted = enrollment?.completed_lessons?.includes(lesson.id);
                            const hasActiveKey = lessonKeys.some(k => k.lesson_id === lesson.id && k.is_active);
                            const isFirstLesson = index === 0 && sectionLessons === Object.values(sections)[0];
                            const canAccess = (user?.role === 'admin' || user?.is_tutor) || isFirstLesson || hasActiveKey || lesson.is_preview;
                            const lessonQuizCount = quizzes.filter(q => q.lesson_id === lesson.id).length;

                             return (
                               <Box
                                 key={lesson.id}
                                 onClick={() => {
                                   if (canAccess) {
                                     navigate(`${createPageUrl('LessonPlayer')}?course=${courseId}&lesson=${lesson.id}`);
                                   }
                                 }}
                                 sx={{ px: 3, py: 1.5, cursor: canAccess ? 'pointer' : 'default', opacity: canAccess ? 1 : 0.6, '&:hover': canAccess ? { bgcolor: 'action.hover' } : {} }}
                               >
                                 <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                     {isCompleted ? (
                                       <Box sx={{ width: 24, height: 24, bgcolor: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                         <CheckCircle size={16} color="#059669" />
                                       </Box>
                                     ) : canAccess ? (
                                       <Box sx={{ width: 24, height: 24, bgcolor: '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                         <Play size={12} color="#4f46e5" style={{ marginLeft: 2 }} />
                                       </Box>
                                     ) : (
                                       <Box sx={{ width: 24, height: 24, bgcolor: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                         <Lock size={12} color="#9ca3af" />
                                       </Box>
                                     )}
                                     <Box sx={{ flex: 1 }}>
                                       <Typography variant="body2" fontWeight={500}>{lesson.title}</Typography>
                                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                         {lesson.is_preview && !isEnrolled && (
                                           <Chip label="Preview" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                                         )}
                                         {lessonQuizCount > 0 && (
                                           <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                             <Brain size={12} color="#7c3aed" />
                                             <Typography variant="caption" sx={{ color: '#7c3aed' }}>
                                               {lessonQuizCount} quiz{lessonQuizCount > 1 ? 'zes' : ''}
                                             </Typography>
                                           </Box>
                                         )}
                                       </Box>
                                     </Box>
                                   </Box>
                                   <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                     {lesson.duration_minutes || 10} min
                                   </Typography>
                                 </Box>
                               </Box>
                             );
                           })}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Card>
              )}

              {tabValue === 'overview' && (
                <Card sx={{ borderRadius: 4, boxShadow: 1, border: '1px solid', borderColor: 'divider', p: 3 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>About This Course</Typography>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.7, mb: 3 }}>{course.description}</Typography>
                  
                  {course.tags?.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography fontWeight={600} sx={{ mb: 1.5 }}>Topics Covered</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {course.tags.map((tag, i) => (
                          <Chip key={i} label={tag} sx={{ bgcolor: '#eef2ff', color: '#4338ca' }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                  


                  {quizzes.length > 0 && (
                    <Box>
                      <Typography fontWeight={600} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Award size={20} color="#4f46e5" />
                        Course Quizzes
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {quizzes.map((quiz) => (
                          <Link key={quiz.id} to={createPageUrl('Quiz') + `?id=${quiz.id}`} style={{ textDecoration: 'none' }}>
                            <Card sx={{ p: 2, background: 'linear-gradient(to right, #eef2ff, #faf5ff)', border: '1px solid #c7d2fe', cursor: 'pointer', '&:hover': { boxShadow: 2 }, transition: 'all 0.2s' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                  <Typography fontWeight={500}>{quiz.title}</Typography>
                                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <Award size={12} />
                                      <Typography variant="caption">{quiz.questions?.length} questions</Typography>
                                    </Box>
                                    {quiz.time_limit_minutes && (
                                      <>
                                        <Typography variant="caption">•</Typography>
                                        <Typography variant="caption">{quiz.time_limit_minutes} min</Typography>
                                      </>
                                    )}
                                    {quiz.difficulty && (
                                      <>
                                        <Typography variant="caption">•</Typography>
                                        <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{quiz.difficulty}</Typography>
                                      </>
                                    )}
                                  </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" color="primary" fontWeight={500}>Take Quiz</Typography>
                                  <ChevronRight size={20} color="#4f46e5" />
                                </Box>
                              </Box>
                            </Card>
                          </Link>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Card>
              )}

              {tabValue === 'reviews' && (
                <Card sx={{ borderRadius: 4, boxShadow: 1, border: '1px solid', borderColor: 'divider', p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" fontWeight={600}>Student Reviews</Typography>
                    {actualCourseRating && (
                      <Box sx={{ textAlign: 'right' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                          <Typography variant="h5" fontWeight={700}>{actualCourseRating}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">{courseReviews.length} reviews</Typography>
                      </Box>
                    )}
                  </Box>

                  {reviews.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {reviews.map((review) => (
                        <Box key={review.id} sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2, '&:last-child': { border: 0 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5 }}>
                            <Avatar src={review.user_avatar} sx={{ bgcolor: '#eef2ff', color: '#4f46e5' }}>
                              {review.user_name?.charAt(0) || 'U'}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography fontWeight={500}>{review.user_name}</Typography>
                                {review.is_verified_purchase && (
                                  <Chip label="Verified" size="small" sx={{ bgcolor: '#d1fae5', color: '#059669', height: 20, fontSize: '0.65rem' }} />
                                )}
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i}
                                    size={16}
                                    className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                                  />
                                ))}
                              </Box>
                              <Typography variant="body2" color="text.secondary">{review.comment}</Typography>
                              <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                                {format(new Date(review.created_date), 'MMM d, yyyy')}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Star size={48} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
                      <Typography color="text.secondary">No reviews yet</Typography>
                    </Box>
                  )}
                </Card>
              )}

              {tabValue === 'discussion' && (
                <Card sx={{ borderRadius: 4, boxShadow: 1, border: '1px solid', borderColor: 'divider', p: 3, textAlign: 'center' }}>
                  <MessageSquare size={48} color="#4f46e5" style={{ margin: '0 auto 16px' }} />
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Join the Discussion</Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>Connect with other students and instructors</Typography>
                  <Link to={createPageUrl('CourseDiscussion') + `?courseId=${courseId}`} style={{ textDecoration: 'none' }}>
                    <Button variant="contained">
                      Go to Discussion Forum
                    </Button>
                  </Link>
                </Card>
              )}
          </Box>

          {/* Sidebar */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Module Progress */}
            {isEnrolled && (
              <ModuleProgress 
                sections={sections}
                completedLessons={enrollment?.completed_lessons || []}
                isEnrolled={isEnrolled}
              />
            )}

            {/* Instructor Card */}
            {course.instructor && (
              <Card sx={{ p: 3, border: 0, boxShadow: 1 }}>
                <Typography fontWeight={600} sx={{ mb: 2 }}>Your Instructor</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar
                    src={course.instructor_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor)}&background=6366f1&color=fff&size=80`}
                    alt={course.instructor}
                    sx={{ width: 64, height: 64 }}
                  />
                  <Box>
                    <Typography fontWeight={600}>{course.instructor}</Typography>
                  </Box>
                </Box>
                {(instructorRating || instructorStudents > 0) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  {instructorRating && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <Typography variant="body2">{instructorRating} Rating</Typography>
                    </Box>
                  )}
                  {instructorStudents > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Users size={16} />
                      <Typography variant="body2">{instructorStudents.toLocaleString()} Students</Typography>
                    </Box>
                  )}
                </Box>
                )}
              </Card>
            )}

            {/* Course Stats */}
            <Card sx={{ p: 3, border: 0, boxShadow: 1 }}>
              <Typography fontWeight={600} sx={{ mb: 2 }}>Course Includes</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    <Clock size={16} />
                    <Typography variant="body2">Duration</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={500}>{course.duration_hours || 0} hours</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    <BookOpen size={16} />
                    <Typography variant="body2">Lessons</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={500}>{lessons.length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    <Download size={16} />
                    <Typography variant="body2">Resources</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={500}>Downloadable</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    <Trophy size={16} />
                    <Typography variant="body2">Certificate</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={500}>Included</Typography>
                </Box>
              </Box>
            </Card>

            {/* GCSE Syllabus */}
            {course.syllabus_url && (
              <Card sx={{ p: 3, border: 0, boxShadow: 1, background: 'linear-gradient(to bottom right, #fef3c7, #fed7aa)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box sx={{ width: 40, height: 40, bgcolor: '#fef3c7', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={20} color="#d97706" />
                  </Box>
                  <Box>
                    <Typography fontWeight={600}>GCSE Syllabus</Typography>
                    {course.exam_board && (
                      <Typography variant="caption" color="text.secondary">{course.exam_board}</Typography>
                    )}
                  </Box>
                </Box>
                <a
                  href={course.syllabus_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    endIcon={<ChevronRight size={16} />}
                    startIcon={<Download size={16} />}
                    sx={{ justifyContent: 'space-between', '&:hover': { bgcolor: 'white' } }}
                  >
                    Download Syllabus PDF
                  </Button>
                </a>
              </Card>
            )}

            {/* Course Leaderboard */}
            {isEnrolled && actualStudentCount > 1 && (
              <CourseLeaderboard courseId={courseId} />
            )}
          </Box>
        </Box>

        {/* Dynamic Landing Page Sections */}
        <DynamicCourseLanding course={course} enrollment={enrollment} />
      </Container>
      </Box>
    </CoursePasswordProtection>
  );
}