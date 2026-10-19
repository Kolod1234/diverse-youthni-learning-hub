import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Box, Card, CardContent, Grid, Typography, LinearProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AttendanceStatistics({ selectedDate }) {
  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ['attendance', selectedDate],
    queryFn: () => base44.entities.Attendance.filter({ date: selectedDate }, '-created_date', 500),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['all-users-attendance'],
    queryFn: () => base44.asServiceRole.entities.User.list('-created_date', 1000),
  });

  const stats = {
    present: attendanceRecords.filter(r => r.status === 'present').length,
    absent: attendanceRecords.filter(r => r.status === 'absent').length,
    late: attendanceRecords.filter(r => r.status === 'late').length,
  };

  const total = users.length;
  const marked = attendanceRecords.length;
  const unmarked = total - marked;
  const presentPercent = total > 0 ? ((stats.present / total) * 100).toFixed(1) : 0;

  const chartData = [
    { name: 'Present', value: stats.present, fill: '#10b981' },
    { name: 'Late', value: stats.late, fill: '#f59e0b' },
    { name: 'Absent', value: stats.absent, fill: '#ef4444' },
  ];

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">Attendance Rate</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>{presentPercent}%</Typography>
              <LinearProgress variant="determinate" value={presentPercent} sx={{ height: 8, borderRadius: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">Total Students</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">Marked</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{marked}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">Unmarked</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{unmarked}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Attendance Distribution</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Status Breakdown</Typography>
              <Box sx={{ space: 2 }}>
                {chartData.map(item => (
                  <Box key={item.name} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{item.name}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{item.value}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={total > 0 ? (item.value / total) * 100 : 0}
                      sx={{ height: 8, borderRadius: 1, bgcolor: item.fill + '20', '& .MuiLinearProgress-bar': { bgcolor: item.fill } }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}