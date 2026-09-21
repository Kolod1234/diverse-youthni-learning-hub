import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Alert, Box, Card, Chip, CircularProgress, FormControl, InputLabel, MenuItem, Select,
  Stack, ToggleButton, ToggleButtonGroup, Typography
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const prettify = (value) => (value || '')
  .replace(/_/g, ' ')
  .replace(/\b\w/g, (char) => char.toUpperCase());

const RANK_COLORS = ['#f59e0b', '#94a3b8', '#b45309'];

export default function TutorLeaderboard() {
  const [qualification, setQualification] = useState('gcse');
  const [subject, setSubject] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['auth-me'],
    queryFn: () => base44.auth.me(),
    staleTime: 30000,
    retry: false
  });

  const canView = !!(user && (user.is_tutor === true || user.role === 'admin'));

  const { data, isLoading, error } = useQuery({
    queryKey: ['tutor-leaderboard'],
    queryFn: async () => (await base44.functions.invoke('tutorLeaderboard', {})).data,
    enabled: canView
  });

  const courseMap = useMemo(
    () => new Map((data?.courses || []).map((course) => [course.id, course])),
    [data]
  );

  const subjects = useMemo(() => {
    const categories = new Set();
    for (const course of data?.courses || []) {
      if (course.qualification_type === qualification && course.category) categories.add(course.category);
    }
    return [...categories].sort();
  }, [data, qualification]);

  const rows = useMemo(() => {
    if (!data) return [];
    return data.students
      .map((student) => {
        let total = 0;
        for (const [courseId, points] of Object.entries(student.course_points || {})) {
          const course = courseMap.get(courseId);
          if (!course || course.qualification_type !== qualification) continue;
          if (subject !== 'all' && course.category !== subject) continue;
          total += points;
        }
        return { ...student, total: Math.round(total * 100) / 100 };
      })
      .filter((student) => student.total > 0)
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
      .map((student, index) => ({ ...student, rank: index + 1 }));
  }, [data, courseMap, qualification, subject]);

  if (user && !canView) {
    return (
      <Box sx={{ maxWidth: 720, mx: 'auto', px: 2, py: 8 }}>
        <Alert severity="warning">Only tutors and admins can view the student leaderboard.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 880, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 3, sm: 5 } }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
        <EmojiEventsIcon sx={{ color: '#ca8a04' }} />
        <Typography variant="h5" fontWeight={700}>Student Leaderboard</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Top-performing students by best-score topic-check points.
        {data ? ` ${data.scoring}${data.scope === 'assigned' ? ' Totals cover the courses you are assigned to.' : ''}` : ''}
      </Typography>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error?.response?.data?.error || error?.message}</Alert>}
      {isLoading && (
        <Stack alignItems="center" sx={{ py: 8 }}>
          <CircularProgress size={28} />
        </Stack>
      )}

      {data && (
        <>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <ToggleButtonGroup
              exclusive
              value={qualification}
              onChange={(event, value) => {
                if (!value) return;
                setQualification(value);
                setSubject('all');
              }}
              size="small"
            >
              <ToggleButton value="gcse">GCSE</ToggleButton>
              <ToggleButton value="alevel">A-Level</ToggleButton>
            </ToggleButtonGroup>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="leaderboard-subject-label">Subject</InputLabel>
              <Select
                labelId="leaderboard-subject-label"
                label="Subject"
                value={subjects.includes(subject) ? subject : 'all'}
                onChange={(event) => setSubject(event.target.value)}
              >
                <MenuItem value="all">All subjects</MenuItem>
                {subjects.map((category) => (
                  <MenuItem key={category} value={category}>{prettify(category)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {rows.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No students have points yet for this selection.</Typography>
            </Card>
          ) : (
            <Stack spacing={1.5}>
              {rows.map((student) => (
                <Card key={student.id} sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
                    <Box
                      sx={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: student.rank <= 3 ? RANK_COLORS[student.rank - 1] : 'grey.100',
                        color: student.rank <= 3 ? '#fff' : 'text.secondary',
                        fontWeight: 700, fontSize: '0.9rem'
                      }}
                    >
                      {student.rank}
                    </Box>
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography fontWeight={600} noWrap>{student.name}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                        {student.email}
                      </Typography>
                    </Box>
                    <Chip
                      icon={<BoltIcon />}
                      label={`${student.total} pts`}
                      sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 600, flexShrink: 0 }}
                    />
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </>
      )}
    </Box>
  );
}