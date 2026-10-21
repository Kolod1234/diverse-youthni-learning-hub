import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Container, Card, CardContent, Button, Typography, Box, Grid, LinearProgress, Chip
} from '@mui/material';
import { BarChart3, TrendingUp, Users, Award, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Redesign palette: indigo, navy, yellow, then lighter tints for extra slices.
const COLORS = ['#4f46e5', '#0b2f5c', '#fbbf24', '#818cf8', '#3b6aa0'];

export default function LearningImpactDashboard() {
  const [user, setUser] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  React.useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: academies = [] } = useQuery({
    queryKey: ['academies'],
    queryFn: () => base44.entities.Academy.list('-created_date', 100),
  });

  const { data: allEnrollments = [] } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: () => base44.entities.AcademyEnrollment.list(),
  });

  const { data: allCourseEnrollments = [] } = useQuery({
    queryKey: ['all-course-enrollments'],
    queryFn: () => base44.entities.Enrollment.list(),
  });

  const calculateImpactMutation = useMutation({
    mutationFn: () => base44.functions.invoke('calculateLearningImpact', {
      entityType: 'organization',
      entityId: 'organization',
      startDate: dateRange.start,
      endDate: dateRange.end
    })
  });

  const { data: impactData } = calculateImpactMutation;

  // Calculate metrics
  const totalAcademies = academies.length;
  const publishedAcademies = academies.filter(a => a.is_published).length;
  const totalEnrollments = allEnrollments.length;
  const certifiedStudents = allEnrollments.filter(e => e.is_certified).length;
  const certificationRate = totalEnrollments > 0 ? Math.round((certifiedStudents / totalEnrollments) * 100) : 0;

  const totalCourseEnrollments = allCourseEnrollments.length;
  const completedCourses = allCourseEnrollments.filter(e => e.is_completed).length;
  const courseCompletionRate = totalCourseEnrollments > 0 ? Math.round((completedCourses / totalCourseEnrollments) * 100) : 0;

  // Academy performance data
  const academyPerformance = academies.map(academy => ({
    name: academy.title.substring(0, 20),
    enrolled: academy.enrolled_count || 0,
    certified: academy.completion_count || 0,
    rate: academy.enrolled_count > 0 ? Math.round((academy.completion_count / academy.enrolled_count) * 100) : 0
  })).slice(0, 5);

  // Engagement by category
  const categoryData = academies.reduce((acc, academy) => {
    const cat = academy.category || 'Other';
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += academy.enrolled_count || 0;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BarChart3 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <Typography variant="h4" fontWeight="bold">Learning Impact Dashboard</Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => calculateImpactMutation.mutate()}
            disabled={calculateImpactMutation.isPending}
          >
            Calculate Impact
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Track ROI, completion rates, and learning outcomes
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Award className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                <Box>
                  <Typography variant="h4" fontWeight="bold">{totalAcademies}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Academies</Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="primary">
                {publishedAcademies} Published
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Users className="w-8 h-8 text-[#0b2f5c] dark:text-indigo-300" />
                <Box>
                  <Typography variant="h4" fontWeight="bold">{totalEnrollments}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Enrollments</Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="success.main">
                {certifiedStudents} Certified
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <CheckCircle className="w-8 h-8 text-indigo-600" />
                <Box>
                  <Typography variant="h4" fontWeight="bold">{certificationRate}%</Typography>
                  <Typography variant="body2" color="text.secondary">Certification Rate</Typography>
                </Box>
              </Box>
              <LinearProgress variant="determinate" value={certificationRate} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TrendingUp className="w-8 h-8 text-[#0b2f5c] dark:text-indigo-300" />
                <Box>
                  <Typography variant="h4" fontWeight="bold">{courseCompletionRate}%</Typography>
                  <Typography variant="body2" color="text.secondary">Course Completion</Typography>
                </Box>
              </Box>
              <LinearProgress variant="determinate" value={courseCompletionRate} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Academy Performance</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={academyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="enrolled" fill="#4f46e5" name="Enrolled" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="certified" fill="#0b2f5c" name="Certified" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Enrollment by Category</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent>
              {/* Wireframe L3: a plain table under the charts instead of repeating the tiles. */}
              <Typography variant="h6" sx={{ mb: 2 }}>Academies</Typography>
              {academyPerformance.length === 0 ? (
                <Typography color="text.secondary">No academies yet.</Typography>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 14,
                    '& th': { textAlign: 'left', color: 'text.secondary', fontWeight: 500, py: 1, px: 1.5, borderBottom: 1, borderColor: 'divider' },
                    '& td': { py: 1.25, px: 1.5, borderBottom: 1, borderColor: 'divider' },
                    '& tr:last-of-type td': { borderBottom: 0 } }}>
                    <thead><tr><th>Academy</th><th>Enrolled</th><th>Certified</th><th>Certification rate</th></tr></thead>
                    <tbody>
                      {academyPerformance.map(a => (
                        <tr key={a.name}>
                          <td>{a.name}</td><td>{a.enrolled}</td><td>{a.certified}</td>
                          <td><Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 140 }}>
                            <LinearProgress variant="determinate" value={a.rate} sx={{ flex: 1, height: 6, borderRadius: 3 }} />{a.rate}%
                          </Box></td>
                        </tr>
                      ))}
                    </tbody>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}