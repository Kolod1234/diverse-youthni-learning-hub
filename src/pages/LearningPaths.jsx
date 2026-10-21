import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button, Card, Chip, LinearProgress } from '@mui/material';
const Badge = ({ children, className, variant, ...props }) => <Chip label={children} size="small" variant={variant === 'outline' ? 'outlined' : 'filled'} className={className} {...props} />;
const Progress = ({ value, className }) => <LinearProgress variant="determinate" value={value || 0} className={className} sx={{ borderRadius: 1 }} />;
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const Clock = _w(AccessTimeIcon), BookOpen = _w(MenuBookIcon), TrendingUp = _w(TrendingUpIcon), CheckCircle = _w(CheckCircleIcon);
const Lock = _w(LockIcon), ArrowRight = _w(ArrowForwardIcon), Target = _w(GpsFixedIcon), Award = _w(EmojiEventsIcon);
import { motion } from 'framer-motion';

export default function LearningPaths() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: paths = [] } = useQuery({
    queryKey: ['learning-paths'],
    queryFn: () => base44.entities.LearningPath.filter({ is_published: true }),
  });

  const { data: myPathEnrollments = [] } = useQuery({
    queryKey: ['my-path-enrollments', user?.email],
    queryFn: () => base44.entities.PathEnrollment.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 200),
  });

  const enrollInPathMutation = useMutation({
    mutationFn: (pathId) => base44.entities.PathEnrollment.create({
      path_id: pathId,
      current_course_index: 0,
      completed_course_ids: [],
      progress_percent: 0,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-path-enrollments']);
    },
  });

  const levelColors = {
    beginner: 'bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-300',
    intermediate: 'bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-300',
    advanced: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300',
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="mb-4 bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
              <Target className="w-3 h-3 mr-1" />
              Structured Learning
            </Badge>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Learning Paths
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Follow curated paths to master complete skill sets through multiple courses
            </p>
          </motion.div>
        </div>

        {/* My Active Paths */}
        {myPathEnrollments.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">My Learning Paths</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPathEnrollments.map((enrollment) => {
                const path = paths.find(p => p.id === enrollment.path_id);
                if (!path) return null;

                const pathCourses = allCourses.filter(c => path.course_ids?.includes(c.id));
                const currentCourse = pathCourses[enrollment.current_course_index];

                return (
                  <Card key={enrollment.id} className="p-6 border-2 border-indigo-200 bg-indigo-50 dark:bg-indigo-500/15">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className={levelColors[path.difficulty_level]}>
                        {path.difficulty_level}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {enrollment.current_course_index + 1}/{pathCourses.length}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-foreground mb-2">{path.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{path.description}</p>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold text-foreground">
                          {Math.round(enrollment.progress_percent)}%
                        </span>
                      </div>
                      <Progress value={enrollment.progress_percent} className="h-2" />
                    </div>

                    {currentCourse && (
                      <div className="mb-4 p-3 bg-card rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Current Course:</p>
                        <p className="text-sm font-medium text-foreground">{currentCourse.title}</p>
                      </div>
                    )}

                    {/* There is no PathDetails page; continue straight into the path's current course. */}
                    <Link to={currentCourse ? createPageUrl('CourseDetails') + `?id=${currentCourse.id}` : createPageUrl('Explore')}>
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                        Continue Path
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* All Paths */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">All Learning Paths</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths.map((path) => {
              const pathCourses = allCourses.filter(c => path.course_ids?.includes(c.id));
              const isEnrolled = myPathEnrollments.some(e => e.path_id === path.id);

              return (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="aspect-video bg-indigo-600 relative">
                      {path.thumbnail ? (
                        <img src={path.thumbnail} alt={path.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Award className="w-16 h-16 text-white/30" />
                        </div>
                      )}
                      <Badge className={`absolute top-4 right-4 ${levelColors[path.difficulty_level]}`}>
                        {path.difficulty_level}
                      </Badge>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-foreground mb-2">{path.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{path.description}</p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {pathCourses.length} courses
                        </span>
                        {path.estimated_duration_weeks && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {path.estimated_duration_weeks} weeks
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        {pathCourses.slice(0, 3).map((course, idx) => (
                          <div key={course.id} className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center shrink-0">
                              <span className="text-xs text-muted-foreground">{idx + 1}</span>
                            </div>
                            <span className="text-foreground truncate">{course.title}</span>
                          </div>
                        ))}
                        {pathCourses.length > 3 && (
                          <p className="text-xs text-muted-foreground ml-8">
                            +{pathCourses.length - 3} more courses
                          </p>
                        )}
                      </div>

                      {isEnrolled ? (
                        <Link to={createPageUrl('Dashboard') + '?as=student'}>
                          <Button variant="outline" className="w-full">
                            View Progress
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          onClick={() => enrollInPathMutation.mutate(path.id)}
                          disabled={enrollInPathMutation.isPending}
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                        >
                          {enrollInPathMutation.isPending ? 'Enrolling...' : 'Start Path'}
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}