import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Container, Card, CardContent, Button, Typography, Box, List, ListItem,
  ListItemButton, ListItemText, Chip, LinearProgress, Stepper, Step, StepLabel, StepContent
} from '@mui/material';
import { Award, CheckCircle, Lock, PlayCircle, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function AcademyPlayer() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = new URLSearchParams(location.search);
  const academyId = params.get('id');
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: academy, isLoading: academyLoading } = useQuery({
    queryKey: ['academy', academyId],
    queryFn: () => base44.entities.Academy.get(academyId),
    enabled: !!academyId
  });

  const { data: enrollment } = useQuery({
    queryKey: ['academy-enrollment', academyId],
    queryFn: async () => {
      if (!user) return null;
      const enrollments = await base44.entities.AcademyEnrollment.filter({
        academy_id: academyId,
        student_email: user.email
      });
      return enrollments[0];
    },
    enabled: !!academyId && !!user
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.list('title', 500),
  });

  const validateCompletionMutation = useMutation({
    mutationFn: () => base44.functions.invoke('validateAcademyCompletion', { academyId }),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['academy-enrollment', academyId]);
      if (response.data.eligible) {
        toast.success('You are eligible for certification!');
      } else {
        toast.info(response.data.message);
      }
    }
  });

  const requestCertificateMutation = useMutation({
    mutationFn: () => base44.functions.invoke('generateAcademyCertificate', { academyEnrollmentId: enrollment.id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['academy-enrollment', academyId]);
      toast.success('Certificate issued! Check your achievements.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate certificate');
    }
  });

  const getCourse = (courseId) => {
    return allCourses.find(c => c.id === courseId);
  };

  const isCourseCompleted = (courseId) => {
    return enrollment?.completed_courses?.includes(courseId);
  };

  if (academyLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading academy...</Typography>
      </Container>
    );
  }

  if (!academy) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Academy not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Award className="w-8 h-8 text-blue-600" />
          <Typography variant="h4" fontWeight="bold">{academy.title}</Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">{academy.description}</Typography>
      </Box>

      {enrollment && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Your Progress</Typography>
              <Chip
                label={enrollment.is_certified ? 'Certified' : `${enrollment.overall_progress || 0}% Complete`}
                color={enrollment.is_certified ? 'success' : 'primary'}
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={enrollment.overall_progress || 0}
              sx={{ height: 12, borderRadius: 6, mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => validateCompletionMutation.mutate()}
                disabled={validateCompletionMutation.isPending}
              >
                Check Eligibility
              </Button>
              {enrollment.is_certified ? (
                <Chip icon={<Award className="w-4 h-4" />} label="Certificate Earned" color="success" />
              ) : (
                <Button
                  variant="contained"
                  onClick={() => requestCertificateMutation.mutate()}
                  disabled={requestCertificateMutation.isPending || !enrollment.overall_progress || enrollment.overall_progress < 80}
                >
                  Request Certificate
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>Program Structure</Typography>
          <Stepper orientation="vertical">
            {academy.program_structure?.map((module, index) => {
              const moduleCompleted = module.course_ids?.every(id => isCourseCompleted(id));
              const moduleLocked = index > (enrollment?.current_module_index || 0);

              return (
                <Step key={index} active expanded>
                  <StepLabel
                    icon={
                      moduleCompleted ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : moduleLocked ? (
                        <Lock className="w-6 h-6 text-gray-400" />
                      ) : (
                        <PlayCircle className="w-6 h-6 text-blue-600" />
                      )
                    }
                  >
                    <Typography variant="h6">{module.module_title}</Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {module.module_description}
                    </Typography>
                    <List>
                      {module.course_ids?.map((courseId) => {
                        const course = getCourse(courseId);
                        const completed = isCourseCompleted(courseId);
                        if (!course) return null;

                        return (
                          <ListItem key={courseId} disablePadding>
                            <ListItemButton
                              onClick={() => navigate(`/CourseDetails?id=${courseId}`)}
                              disabled={moduleLocked}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                {completed ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : moduleLocked ? (
                                  <Lock className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <BookOpen className="w-5 h-5 text-blue-600" />
                                )}
                                <ListItemText
                                  primary={course.title}
                                  secondary={course.description}
                                />
                              </Box>
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>
        </CardContent>
      </Card>
    </Container>
  );
}