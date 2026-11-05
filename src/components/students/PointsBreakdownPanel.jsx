import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Box, Card, Typography, Stack, Chip, CircularProgress, Alert, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BoltIcon from '@mui/icons-material/Bolt';

const formatDate = (value) => (value
  ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  : '—');

function TopicRow({ topic }) {
  return (
    <Card variant="outlined" sx={{ p: 1.5, mb: 1.5 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
        <Typography variant="body2" fontWeight={600} sx={{ maxWidth: { sm: 320 }, wordBreak: 'break-word' }}>
          {topic.title}
        </Typography>
        <Stack direction="row" spacing={0.75} flexWrap="wrap" rowGap={0.75} useFlexGap>
          <Chip
            size="small"
            variant="outlined"
            label={topic.best_percentage === null ? 'No attempt yet' : `Best ${topic.best_percentage}%`}
          />
          <Chip size="small" label={`${topic.points} pts`} sx={{ bgcolor: '#fef3c7', color: '#b45309' }} />
          <Chip
            size="small"
            label={topic.passed ? 'Passed' : 'Not yet passed'}
            sx={topic.passed ? { bgcolor: '#dcfce7', color: '#15803d' } : { bgcolor: '#f1f5f9', color: '#64748b' }}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`Reading ${topic.reading.pages_viewed}/${topic.reading.total_pages} pages`}
          />
          <Chip size="small" variant="outlined" label={`Last activity ${formatDate(topic.last_activity)}`} />
        </Stack>
      </Stack>
    </Card>
  );
}

export default function PointsBreakdownPanel({ userId, email }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['student-points-breakdown', userId || email],
    queryFn: async () => {
      const response = await base44.functions.invoke('studentPointsBreakdown',
        userId ? { user_id: userId } : { email });
      return response.data;
    },
    enabled: !!(userId || email),
  });

  if (isLoading) {
    return (
      <Stack alignItems="center" sx={{ py: 6 }}>
        <CircularProgress size={28} />
      </Stack>
    );
  }
  if (error) {
    const message = error?.response?.data?.error || error?.message || 'Points breakdown is unavailable.';
    return <Alert severity="warning">{message}</Alert>;
  }

  const totals = data?.totals || { gcse: 0, alevel: 0 };
  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        {[
          { label: 'GCSE points', value: totals.gcse },
          { label: 'A-Level points', value: totals.alevel }
        ].map((total) => (
          <Card key={total.label} sx={{ p: 2, flex: 1 }}>
            <Typography variant="caption" color="text.secondary">{total.label}</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <BoltIcon sx={{ fontSize: 20, color: '#ea580c' }} />
              <Typography variant="h5" fontWeight={700}>{total.value}</Typography>
            </Stack>
          </Card>
        ))}
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        One point per best percentage point per topic; retakes add only improvements.
        Reading is tracked separately with no minimum pass score required to progress.
        {data?.scope === 'assigned' ? ' Totals cover the courses you are assigned to.' : ''}
      </Typography>

      {data?.courses?.length ? data.courses.map((course, index) => (
        <Accordion key={course.course_id} defaultExpanded={index === 0}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 0.5, sm: 2 }}
              sx={{ width: '100%', alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
            >
              <Typography fontWeight={600} sx={{ wordBreak: 'break-word' }}>{course.title}</Typography>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" rowGap={0.75} useFlexGap>
                <Chip size="small" label={`${course.points} pts`} sx={{ bgcolor: '#eef2ff', color: '#4338ca' }} />
                <Chip size="small" variant="outlined" label={`${course.topics_passed}/${course.topics_total} passed`} />
                <Chip
                  size="small"
                  variant="outlined"
                  label={course.qualification_type === 'alevel' ? 'A-Level' : 'GCSE'}
                />
              </Stack>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            {course.topics.map((topic) => <TopicRow key={topic.lesson_id} topic={topic} />)}
          </AccordionDetails>
        </Accordion>
      )) : (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No topic-check attempts or reading progress yet.</Typography>
        </Card>
      )}
    </Box>
  );
}