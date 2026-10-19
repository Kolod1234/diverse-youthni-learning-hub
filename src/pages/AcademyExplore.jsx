import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Container, Card, CardContent, CardHeader, Button, Typography,
  Box, Grid, Chip, LinearProgress
} from '@mui/material';
import { Award, Users, Clock, CheckCircle, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AcademyExplore() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: academies = [], isLoading } = useQuery({
    queryKey: ['published-academies'],
    queryFn: async () => {
      const all = await base44.entities.Academy.list('-created_date', 100);
      return all.filter(a => a.is_published);
    },
  });

  const { data: myEnrollments = [] } = useQuery({
    queryKey: ['my-academy-enrollments'],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.AcademyEnrollment.filter({ student_email: user.email });
    },
    enabled: !!user
  });

  const enrollMutation = useMutation({
    mutationFn: async (academyId) => {
      const enrollment = await base44.entities.AcademyEnrollment.create({
        academy_id: academyId,
        student_email: user.email,
        student_name: user.full_name,
        current_module_index: 0,
        completed_courses: [],
        overall_progress: 0
      });
      // The enrolled count is recalculated on the server (students can't edit Academy records).
      await base44.functions.invoke('recordStat', { type: 'academyEnrolment', id: academyId });
      return enrollment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-academy-enrollments']);
      queryClient.invalidateQueries(['published-academies']);
      toast.success('Enrolled in academy!');
    }
  });

  const isEnrolled = (academyId) => {
    return myEnrollments.some(e => e.academy_id === academyId);
  };

  const getEnrollment = (academyId) => {
    return myEnrollments.find(e => e.academy_id === academyId);
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Loading academies...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Award className="w-8 h-8 text-blue-600" />
          <Typography variant="h4" fontWeight="bold">Learning Academies</Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Structured certification programs designed by experts
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {academies.map((academy) => {
          const enrolled = isEnrolled(academy.id);
          const enrollment = getEnrollment(academy.id);

          return (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={academy.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {academy.thumbnail && (
                  <Box
                    component="img"
                    src={academy.thumbnail}
                    alt={academy.title}
                    sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                  />
                )}
                <CardHeader
                  title={academy.title}
                  subheader={academy.category}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {academy.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                      icon={<Users className="w-4 h-4" />}
                      label={`${academy.enrolled_count || 0} students`}
                      size="small"
                    />
                    <Chip
                      icon={<Clock className="w-4 h-4" />}
                      label={`${academy.estimated_duration_weeks || 8} weeks`}
                      size="small"
                    />
                    <Chip
                      icon={<CheckCircle className="w-4 h-4" />}
                      label={`${academy.completion_count || 0} certified`}
                      size="small"
                    />
                  </Box>

                  {enrolled && enrollment && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption">Your Progress</Typography>
                        <Typography variant="caption">{enrollment.overall_progress || 0}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={enrollment.overall_progress || 0}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  )}

                  {enrolled ? (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate(`/AcademyPlayer?id=${academy.id}`)}
                      startIcon={<PlayCircle className="w-4 h-4" />}
                    >
                      Continue Learning
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => enrollMutation.mutate(academy.id)}
                    >
                      Enroll Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}