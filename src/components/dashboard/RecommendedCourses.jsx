import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, Button, Chip, Box, Typography, Stack } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion';

export default function RecommendedCourses({ userEnrollments }) {
  const { data: allCourses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 100),
    staleTime: 5 * 60 * 1000,
  });

  const enrolledCourseIds = userEnrollments.map(e => e.course_id);
  const enrolledCategories = allCourses
    .filter(c => enrolledCourseIds.includes(c.id))
    .map(c => c.category);

  const recommendedCourses = allCourses
    .filter(course => !enrolledCourseIds.includes(course.id))
    .sort((a, b) => {
      const aMatchesCategory = enrolledCategories.includes(a.category) ? 1 : 0;
      const bMatchesCategory = enrolledCategories.includes(b.category) ? 1 : 0;
      if (aMatchesCategory !== bMatchesCategory) return bMatchesCategory - aMatchesCategory;
      return (b.enrolled_count || 0) - (a.enrolled_count || 0);
    })
    .slice(0, 3);

  if (recommendedCourses.length === 0) return null;

  return (
    <Card sx={{ p: 3, borderRadius: 4, boxShadow: 1, border: 1, borderColor: 'divider' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AutoAwesomeIcon sx={{ fontSize: 20, color: '#4f46e5' }} />
          <Typography variant="subtitle1" fontWeight={600}>Recommended For You</Typography>
        </Stack>
        <Button
          component={Link}
          to={createPageUrl('Explore')}
          size="small"
          endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
        >
          View All
        </Button>
      </Stack>

      <Stack spacing={1.5}>
        {recommendedCourses.map((course, index) => (
          <motion.div
            key={course.id}


          >
            <Card
              component={Link}
              to={createPageUrl('CourseDetails') + `?id=${course.id}`}
              sx={{ p: 2, display: 'block', textDecoration: 'none', color: 'inherit', '&:hover': { boxShadow: 3 }, transition: 'box-shadow 0.2s' }}
            >
              <Stack direction="row" spacing={2}>
                <Box
                  component="img"
                  src={course.thumbnail}
                  alt={course.title}
                  sx={{ width: 80, height: 80, borderRadius: 2, objectFit: 'cover' }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={500} noWrap sx={{ mb: 0.5 }}>
                    {course.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1 }}>
                    {course.description}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Chip label={course.category} size="small" variant="outlined" sx={{ textTransform: 'capitalize', fontSize: '0.7rem', height: 20 }} />
                    {course.duration_hours && (
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary' }}>
                        <AccessTimeIcon sx={{ fontSize: 12 }} />
                        <Typography variant="caption">{course.duration_hours}h</Typography>
                      </Stack>
                    )}
                    {course.enrolled_count > 0 && (
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary' }}>
                        <PeopleIcon sx={{ fontSize: 12 }} />
                        <Typography variant="caption">{course.enrolled_count}</Typography>
                      </Stack>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Card>
          </motion.div>
        ))}
      </Stack>
    </Card>
  );
}