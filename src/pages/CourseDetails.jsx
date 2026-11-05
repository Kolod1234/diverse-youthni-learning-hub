import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CoursePasswordProtection from '@/components/security/CoursePasswordProtection';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { displayCurriculumSection } from '@/lib/curriculumSections';
import { 
  Button, Card, CardContent, CardMedia, Chip, Box, Typography, Container,
  Accordion, AccordionSummary, AccordionDetails, Tabs, Tab, Avatar, Breadcrumbs,
  FormControl, InputLabel, Select, MenuItem, Alert, Rating, TextField
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DownloadIcon from '@mui/icons-material/Download';
import LanguageIcon from '@mui/icons-material/Language';
import EmojiEvents2Icon from '@mui/icons-material/EmojiEvents';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatIcon from '@mui/icons-material/Chat';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SettingsIcon from '@mui/icons-material/Settings';
const iconWrap = (IconCmp) => ({ size, color, className, ...rest }) => <IconCmp className={className} sx={{ fontSize: size || 16, color: color || 'inherit' }} {...rest} />;
const Play = iconWrap(PlayArrowIcon);
const Clock = iconWrap(AccessTimeIcon);
const Users = iconWrap(PeopleIcon);
const Star = iconWrap(StarIcon);
const BookOpen = iconWrap(MenuBookIcon);
const Award = iconWrap(EmojiEventsIcon);
const CheckCircle = iconWrap(CheckCircleIcon);
const Lock = iconWrap(LockIcon);
const ChevronRight = iconWrap(ChevronRightIcon);
const Download = iconWrap(DownloadIcon);
const Globe = iconWrap(LanguageIcon);
const Trophy = iconWrap(EmojiEvents2Icon);
const ArrowLeft = iconWrap(ArrowBackIcon);
const MessageSquare = iconWrap(ChatIcon);
const Brain = iconWrap(PsychologyIcon);
const Settings = iconWrap(SettingsIcon);
import ModuleProgress from '@/components/interactive/ModuleProgress';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import CourseLeaderboard from '@/components/gamification/CourseLeaderboard';
import CourseSEO from '@/components/seo/CourseSEO';
import DynamicCourseLanding from '@/components/course/DynamicCourseLanding';
import RequestToTeachButton from '@/components/tutor/RequestToTeachButton';
import { isCourseExplicitlyAssignedToTutor } from '@/components/tutor/tutorAccess';

const levelColors = {
  beginner: { bgcolor: '#dcfce7', color: '#15803d' },
  intermediate: { bgcolor: '#fef3c7', color: '#a16207' },
  advanced: { bgcolor: '#fee2e2', color: '#b91c1c' },
};

const DEFAULT_MATH_PATHWAYS = [
  { code: 'm1_m5', label: 'Foundation Pathway 1', tier: 'Foundation', first_unit: 'M1', completion_unit: 'M5', grade_range: 'D-G', first_weighting: 45, completion_weighting: 55 },
  { code: 'm2_m6', label: 'Foundation Pathway 2', tier: 'Foundation', first_unit: 'M2', completion_unit: 'M6', grade_range: 'C*-G', first_weighting: 45, completion_weighting: 55 },
  { code: 'm3_m7', label: 'Higher Pathway 1', tier: 'Higher', first_unit: 'M3', completion_unit: 'M7', grade_range: 'B-E', first_weighting: 45, completion_weighting: 55 },
  { code: 'm4_m8', label: 'Higher Pathway 2', tier: 'Higher', first_unit: 'M4', completion_unit: 'M8', grade_range: 'A*-D', first_weighting: 45, completion_weighting: 55 },
];

export default function CourseDetails() {
  const [user, setUser] = useState(null);
  const [tabValue, setTabValue] = useState('curriculum');
  const [selectedMathPathway, setSelectedMathPathway] = useState('');
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

  // Tier dashboards (Foundation/Higher Mathematics) draw their curriculum from
  // the shared lesson pool of their content source course, so each tier course
  // only ever lists the units relevant to its pathways.
  const contentSourceCourseId = course?.content_source_course_id || courseId;
  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', courseId, contentSourceCourseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: contentSourceCourseId }, 'order', 500),
    enabled: !!courseId && !!course,
    staleTime: 5 * 60 * 1000,
  });

  const { data: allQuizzes = [] } = useQuery({
    queryKey: ['quizzes', courseId, contentSourceCourseId],
    queryFn: () => base44.entities.Quiz.filter({ course_id: contentSourceCourseId }),
    enabled: !!courseId && !!course,
    staleTime: 5 * 60 * 1000,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', courseId],
    queryFn: () => base44.entities.Review.filter({ course_id: courseId }, '-created_date', 20),
    enabled: !!courseId && !!course,
    staleTime: 2 * 60 * 1000,
  });

  // Tutors are teachers, not learners — don't query for their personal
  // enrollment in this course. Admins still get the learner view if they want it.
  const isTutor = user?.is_tutor === true && user?.role !== 'admin';
  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollment', courseId, user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: courseId, created_by: user?.email }),
    enabled: !!courseId && !!user?.email && !!course && !isTutor,
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
    queryFn: () => base44.entities.LessonUnlockKey.filter({ course_id: contentSourceCourseId }),
    enabled: !!courseId && !!course && !!user,
    staleTime: 2 * 60 * 1000,
  });

  const enrollMutation = useMutation({
    mutationFn: () => base44.entities.Enrollment.create({
      course_id: courseId,
      progress_percent: 0,
      completed_lessons: [],
      is_completed: false,
      ...(isMathPathwayCourse ? { math_pathway: selectedMathPathway } : {}),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment', courseId, user?.email] });
      queryClient.invalidateQueries({ queryKey: ['course-enrollments', courseId] });
    },
  });

  const saveMathPathwayMutation = useMutation({
    mutationFn: (mathPathway) => base44.entities.Enrollment.update(enrollment.id, {
      math_pathway: mathPathway,
      current_lesson_id: null,
      progress_percent: 0,
    }),
    onSuccess: (_, mathPathway) => {
      setSelectedMathPathway(mathPathway);
      queryClient.invalidateQueries({ queryKey: ['enrollment', courseId, user?.email] });
    },
  });

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const submitReviewMutation = useMutation({
    mutationFn: () => base44.entities.Review.create({
      course_id: courseId,
      rating: reviewRating,
      comment: reviewComment.trim(),
      rating_type: 'course',
      user_name: user?.full_name || 'Student',
      user_avatar: user?.avatar || '',
      is_verified_purchase: true,
    }),
    onSuccess: () => {
      setReviewRating(0);
      setReviewComment('');
      queryClient.invalidateQueries({ queryKey: ['reviews', courseId] });
    },
  });

  // Calculate enrollment status - move after all hooks.
  // Tutors are never treated as enrolled — they get the "request to teach" flow.
  const enrollment = isTutor ? null : enrollments[0];
  const isEnrolled = !isTutor && !!enrollment;
  const isAvailableForEnrollment = course?.is_published !== false;
  const isAssignedTutor = !!user && course ? isCourseExplicitlyAssignedToTutor(course, user) : false;
  const isMathPathwayCourse = course?.requires_math_pathway === true || (
    course?.qualification_type === 'gcse' &&
    course?.category === 'mathematics' &&
    course?.exam_board?.toUpperCase() === 'CCEA'
  );
  const mathPathways = course?.math_pathways?.length ? course.math_pathways : DEFAULT_MATH_PATHWAYS;
  const activeMathPathway = isEnrolled ? enrollment?.math_pathway : selectedMathPathway;
  const activeMathPathwayConfig = mathPathways.find(pathway => pathway.code === activeMathPathway);
  const canChangeMathPathway = !isEnrolled || (enrollment?.completed_lessons?.length || 0) === 0;
  const pathwayUnitCodes = activeMathPathwayConfig
    ? [activeMathPathwayConfig.first_unit, activeMathPathwayConfig.completion_unit]
    : [];
  const hasMappedMathLessons = lessons.some(lesson => lesson.ccea_units?.length > 0);
  // A tier dashboard (Foundation/Higher Mathematics) first restricts the shared
  // curriculum to the units of its own tier, then narrows it to the learner's
  // chosen pathway pair.
  const tierUnitCodes = [...new Set(mathPathways.flatMap(pathway => [pathway.first_unit, pathway.completion_unit]))];
  const tierLessons = isMathPathwayCourse && hasMappedMathLessons
    ? lessons.filter(lesson => !lesson.ccea_units?.length || lesson.ccea_units.some(unitCode => tierUnitCodes.includes(unitCode)))
    : lessons;
  const visibleLessons = isMathPathwayCourse && activeMathPathway && hasMappedMathLessons
    ? tierLessons.filter(lesson => !lesson.ccea_units?.length || lesson.ccea_units.some(unitCode => pathwayUnitCodes.includes(unitCode)))
    : tierLessons;

  useEffect(() => {
    if (enrollment?.math_pathway) {
      setSelectedMathPathway(enrollment.math_pathway);
    }
  }, [enrollment?.math_pathway]);

  // Show all quizzes to enrolled students, only published to non-enrolled
  const quizzes = isEnrolled ? allQuizzes : allQuizzes.filter(q => q.is_published);

  // Group pathway-visible lessons by section
  const sections = visibleLessons.reduce((acc, lesson) => {
    const section = displayCurriculumSection(lesson.section, course) || 'Getting Started';
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
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ '& > *': { bgcolor: 'grey.200', borderRadius: '14px', mb: 2 } }}>
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
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box sx={{ position: 'relative', bgcolor: '#0b2f5c', color: 'white' }}>
        {user?.role === 'admin' && (
            <Link to={createPageUrl('AdminCourseBuilder') + `?course=${courseId}`} style={{ textDecoration: 'none' }}>
              <Button 
                startIcon={<Settings size={16} />}
                variant="contained"
                size="small"
                sx={{ 
                  position: { xs: 'static', md: 'absolute' },
                  m: { xs: 2, md: 0 },
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
        <Container maxWidth="xl" sx={{ position: 'relative', py: 6 }}>
          <Breadcrumbs separator={<ChevronRight size={16} />} sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, '& a': { color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } } }}>
            <Link to={createPageUrl('Dashboard')} style={{ textDecoration: 'none', color: 'inherit' }}>Dashboard</Link>
            <Link to={createPageUrl('Explore')} style={{ textDecoration: 'none', color: 'inherit' }}>Courses</Link>
            <Typography sx={{ color: 'white', fontWeight: 500 }}>{course.title}</Typography>
          </Breadcrumbs>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4, alignItems: 'start' }}>
            <Box>
              <motion.div

              >
                <Chip 
                  label={course.level} 
                  sx={{ ...(levelColors[course.level] || levelColors.beginner), border: 0, mb: 2, textTransform: 'capitalize' }}
                />
                
                <Typography variant="h3" fontWeight={700} sx={{ mb: 2 }}>{course.title}</Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }}>{course.description}</Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3, color: 'rgba(255,255,255,0.9)', mb: 3 }}>
                  {course.instructor && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={course.instructor_avatar || undefined}
                        alt={course.instructor}
                        sx={{ width: 40, height: 40, border: '2px solid rgba(255,255,255,0.3)', bgcolor: '#6366f1' }}
                      >
                        {(course.instructor || '?').charAt(0).toUpperCase()}
                      </Avatar>
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
                  <Chip icon={<BookOpen size={16} />} label={`${visibleLessons.length} lessons`} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }} />
                  <Chip icon={<Globe size={16} />} label="English" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }} />
                </Box>
                </motion.div>
                </Box>
            
            {/* Enrollment Card */}
            <Box>
              <motion.div


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
                  </CardMedia>
                  
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 3 }}>
                      <Typography variant="h4" fontWeight={700}>
                        {course.price === 0 ? 'Free' : `£${course.price}`}
                      </Typography>
                    </Box>
                    {isEnrolled && visibleLessons.length > 0 && (() => {
                      const done = enrollment?.completed_lessons?.length || 0;
                      const pct = Math.min(100, Math.round((done / visibleLessons.length) * 100));
                      return (
                        <Box sx={{ mb: 2.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                            <Typography variant="body2">Your progress</Typography>
                            <Typography variant="body2" fontWeight={700}>{pct}%</Typography>
                          </Box>
                          <Box role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress"
                            sx={{ height: 10, borderRadius: 5, bgcolor: 'action.hover', overflow: 'hidden' }}>
                            <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: 'success.main' }} />
                          </Box>
                          <Typography variant="caption" color="text.secondary">{done} of {visibleLessons.length} lessons done</Typography>
                        </Box>
                      );
                    })()}
                  
                    {isMathPathwayCourse && (
                      <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'action.hover' }}>
                        <Typography fontWeight={700} sx={{ mb: 0.5 }}>Choose your CCEA Mathematics pathway</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Select one valid unit pair. Your first unit is worth 45% and the completion unit is worth 55%.
                        </Typography>
                        <FormControl fullWidth size="small" disabled={!canChangeMathPathway}>
                          <InputLabel id="math-pathway-label">Mathematics pathway</InputLabel>
                          <Select
                            labelId="math-pathway-label"
                            value={selectedMathPathway || enrollment?.math_pathway || ''}
                            label="Mathematics pathway"
                            onChange={(event) => setSelectedMathPathway(event.target.value)}
                          >
                            {mathPathways.map((pathway) => (
                              <MenuItem key={pathway.code} value={pathway.code}>
                                {pathway.label}: {pathway.first_unit} + {pathway.completion_unit} ({pathway.grade_range})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {isEnrolled && selectedMathPathway && selectedMathPathway !== enrollment?.math_pathway && (
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() => saveMathPathwayMutation.mutate(selectedMathPathway)}
                            disabled={saveMathPathwayMutation.isPending}
                            sx={{ mt: 1.5 }}
                          >
                            {saveMathPathwayMutation.isPending ? 'Saving pathway...' : 'Save pathway'}
                          </Button>
                        )}
                        {isEnrolled && enrollment?.math_pathway && (
                          <Alert severity="success" sx={{ mt: 1.5 }}>
                            Pathway saved. It becomes locked after you complete your first lesson.
                          </Alert>
                        )}
                      </Box>
                    )}

                    {isTutor ? (
                      // Tutors are teachers, not learners. They see "Request to Teach"
                      // (or assigned/pending status) and never see Enroll or Continue Learning.
                      <RequestToTeachButton course={course} user={user} />
                    ) : user?.role === 'admin' && isAssignedTutor ? (
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        component={Link}
                        to={createPageUrl('TutorCourseManager') + `?courseId=${courseId}`}
                        sx={{ py: 2, fontSize: '1.125rem', borderRadius: '10px' }}
                      >
                        Manage Course
                      </Button>
                    ) : isEnrolled ? (
                      <Button 
                        variant="contained"
                        fullWidth
                        size="large"
                        startIcon={<Play size={20} />}
                        disabled={isMathPathwayCourse && !enrollment?.math_pathway}
                        onClick={() => {
                          const sortedLessons = [...visibleLessons].sort((a, b) => a.order - b.order);
                          const targetLessonId = enrollment.current_lesson_id || sortedLessons[0]?.id;
                          if (targetLessonId) {
                            console.log('Continue Learning clicked:', { targetLessonId, courseId });
                            navigate(`${createPageUrl('LessonPlayerClassic')}?course=${courseId}&lesson=${targetLessonId}`);
                          }
                        }}
                        sx={{ py: 2, fontSize: '1.125rem', borderRadius: '10px' }}
                      >
                        {isMathPathwayCourse && !enrollment?.math_pathway ? 'Save pathway to continue' : 'Continue Learning'}
                      </Button>
                    ) : !isAvailableForEnrollment ? (
                      <Button
                        variant="outlined"
                        fullWidth
                        size="large"
                        disabled
                        sx={{ py: 2, fontSize: '1rem', borderRadius: '10px' }}
                      >
                        Curriculum review in progress
                      </Button>
                    ) : (
                      <Button 
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={() => enrollMutation.mutate()}
                        disabled={enrollMutation.isPending || (isMathPathwayCourse && !selectedMathPathway)}
                        sx={{ py: 2, fontSize: '1.125rem', borderRadius: '10px' }}
                      >
                        {isMathPathwayCourse && !selectedMathPathway
                          ? 'Choose a pathway first'
                          : enrollMutation.isPending
                            ? 'Enrolling...'
                            : (course.price === 0 ? 'Enroll for Free' : 'Buy Now')}
                      </Button>
                    )}
                  
                    <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle size={16} color="#16a34a" />
                        <Typography variant="body2">Self-paced: learn any time</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle size={16} color="#16a34a" />
                        <Typography variant="body2">Quizzes and worked solutions</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle size={16} color="#16a34a" />
                        <Typography variant="body2">Track your progress lesson by lesson</Typography>
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
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 2fr) minmax(0, 1fr)' }, gap: 4 }}>
          <Box sx={{ minWidth: 0 }}>
            {isMathPathwayCourse && (
              activeMathPathwayConfig ? (
                <Card sx={{ mb: 3, p: 3, borderRadius: '14px', border: '1px solid #bfdbfe', bgcolor: '#eff6ff' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>{activeMathPathwayConfig.label}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activeMathPathwayConfig.tier} Tier - Available grades {activeMathPathwayConfig.grade_range}
                      </Typography>
                    </Box>
                    <Chip label={`${activeMathPathwayConfig.first_unit} + ${activeMathPathwayConfig.completion_unit}`} color="primary" />
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                      <Typography fontWeight={700}>{activeMathPathwayConfig.first_unit}: First assessment unit</Typography>
                      <Typography variant="body2" color="text.secondary">Calculator examination - {activeMathPathwayConfig.first_weighting}%</Typography>
                    </Box>
                    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                      <Typography fontWeight={700}>{activeMathPathwayConfig.completion_unit}: Completion unit</Typography>
                      <Typography variant="body2" color="text.secondary">Non-calculator and calculator papers - {activeMathPathwayConfig.completion_weighting}%</Typography>
                    </Box>
                  </Box>
                </Card>
              ) : (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Choose a Mathematics pathway to see your official CCEA unit combination.
                </Alert>
              )
            )}
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ mb: 3, maxWidth: '100%' }}
            >
              <Tab label="Curriculum" value="curriculum" />
              <Tab label="Overview" value="overview" />
              <Tab label={`Reviews (${reviews.length})`} value="reviews" />
              <Tab label="Discussion" value="discussion" />
            </Tabs>

              {tabValue === 'curriculum' && (
                <Card sx={{ borderRadius: '14px', boxShadow: 1, border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography fontWeight={500}>
                      {Object.keys(sections).length} sections • {visibleLessons.length} lessons
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {course.duration_hours || 0}h total
                    </Typography>
                  </Box>
                  
                  {Object.entries(sections).map(([sectionName, sectionLessons], sectionIndex) => {
                    // Wireframe M3: open only the unit you're working on (or the first one).
                    const currentId = enrollment?.current_lesson_id;
                    const openIndex = Math.max(0, Object.values(sections).findIndex(ls => ls.some(l => l.id === currentId)));
                    const doneHere = sectionLessons.filter(l => enrollment?.completed_lessons?.includes(l.id)).length;
                    return (
                    <Accordion key={sectionName} defaultExpanded={sectionIndex === openIndex} disableGutters>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3, py: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main' + '15', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen size={16} color="#4f46e5" />
                          </Box>
                          <Box>
                            <Typography fontWeight={600}>{sectionName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {isEnrolled ? `${doneHere} of ${sectionLessons.length} lessons done` : `${sectionLessons.length} lessons`}
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
                            const hasRequiredMathPathway = !isMathPathwayCourse || !isEnrolled || !!enrollment?.math_pathway || user?.role === 'admin' || user?.is_tutor;
                            const canAccess = hasRequiredMathPathway && (isEnrolled || (user?.role === 'admin' || user?.is_tutor) || isFirstLesson || hasActiveKey || lesson.is_preview);
                            const lessonQuizCount = quizzes.filter(q => q.lesson_id === lesson.id).length;

                             return (
                               <Box
                                 key={lesson.id}
                                 onClick={() => {
                                   if (canAccess) {
                                     console.log('Navigating to lesson:', { lessonId: lesson.id, courseId, fullLesson: lesson });
                                     navigate(`${createPageUrl('LessonPlayerClassic')}?course=${courseId}&lesson=${lesson.id}`);
                                   }
                                 }}
                                 sx={{ px: 3, py: 1.5, cursor: canAccess ? 'pointer' : 'default', opacity: canAccess ? 1 : 0.6, '&:hover': canAccess ? { bgcolor: 'action.hover' } : {} }}
                               >
                                 <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                     {isCompleted ? (
                                       <Box sx={{ width: 24, height: 24, bgcolor: 'rgba(22,163,74,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                         <CheckCircle size={16} color="#059669" />
                                       </Box>
                                     ) : canAccess ? (
                                       <Box sx={{ width: 24, height: 24, bgcolor: 'rgba(79,70,229,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                         <Play size={12} color="#4f46e5" style={{ marginLeft: 2 }} />
                                       </Box>
                                     ) : (
                                       <Box sx={{ width: 24, height: 24, bgcolor: 'action.hover', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                                             <Brain size={12} color="#4f46e5" />
                                             <Typography variant="caption" sx={{ color: '#4f46e5' }}>
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
                    );
                  })}
                </Card>
              )}

              {tabValue === 'overview' && (
                <Card sx={{ borderRadius: '14px', boxShadow: 1, border: '1px solid', borderColor: 'divider', p: 3 }}>
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
                            <Card sx={{ p: 2, bgcolor: 'action.hover', border: '1px solid #c7d2fe', cursor: 'pointer', '&:hover': { boxShadow: 2 }, transition: 'all 0.2s' }}>
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
                <Card sx={{ borderRadius: '14px', boxShadow: 1, border: '1px solid', borderColor: 'divider', p: 3 }}>
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

                  {isEnrolled && !reviews.some(r => r.created_by === user?.email) && (
                    <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                      <Typography fontWeight={600} sx={{ mb: 1 }}>Write a review</Typography>
                      <Rating value={reviewRating} onChange={(_, v) => setReviewRating(v || 0)} />
                      <TextField
                        fullWidth multiline minRows={2} size="small" sx={{ mt: 1 }}
                        placeholder="What did you think of this course?"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        inputProps={{ maxLength: 1000 }}
                      />
                      {submitReviewMutation.isError && (
                        <Alert severity="error" sx={{ mt: 1 }}>Couldn't save your review. Please try again.</Alert>
                      )}
                      <Button
                        variant="contained" sx={{ mt: 1 }}
                        disabled={reviewRating < 1 || submitReviewMutation.isPending}
                        onClick={() => submitReviewMutation.mutate()}
                      >
                        {submitReviewMutation.isPending ? 'Posting...' : 'Post review'}
                      </Button>
                    </Box>
                  )}

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
                <Card sx={{ borderRadius: '14px', boxShadow: 1, border: '1px solid', borderColor: 'divider', p: 3, textAlign: 'center' }}>
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
                    src={course.instructor_avatar || undefined}
                    alt={course.instructor}
                    sx={{ width: 64, height: 64, bgcolor: '#6366f1' }}
                  >
                    {(course.instructor || '?').charAt(0).toUpperCase()}
                  </Avatar>
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
                  <Typography variant="body2" fontWeight={500}>{visibleLessons.length}</Typography>
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

            {/* Official course specification */}
            {course.syllabus_url && (
              <Card sx={{ p: 3, border: 0, boxShadow: 1, bgcolor: 'action.hover' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box sx={{ width: 40, height: 40, bgcolor: '#fef3c7', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={20} color="#d97706" />
                  </Box>
                  <Box>
                    <Typography fontWeight={600}>Official Specification</Typography>
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
                    sx={{ justifyContent: 'space-between', '&:hover': { bgcolor: 'background.paper' } }}
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