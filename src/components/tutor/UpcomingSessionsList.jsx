import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, Button, Chip } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import { format } from 'date-fns';

/**
 * Shows the tutor's upcoming sessions (status scheduled or live, end-time in the future),
 * sorted by soonest first. Used on the Schedule Session page so tutors can see what's
 * already booked before scheduling another.
 */
export default function UpcomingSessionsList({ tutorEmail, isAdmin, limit = 5 }) {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['upcoming-sessions-list', tutorEmail, isAdmin],
    queryFn: async () => {
      if (isAdmin) return base44.entities.VideoSession.list('-scheduled_date', 100);
      return base44.entities.VideoSession.filter({ tutor_email: tutorEmail }, '-scheduled_date', 100);
    },
    enabled: !!tutorEmail,
  });

  const now = new Date();
  const upcoming = sessions
    .filter(s => {
      if (s.status === 'cancelled' || s.status === 'completed') return false;
      if (!s.scheduled_date || !s.scheduled_time) return s.status === 'live';
      const start = new Date(`${s.scheduled_date}T${s.scheduled_time}`);
      const end = new Date(start.getTime() + (s.duration_minutes || 60) * 60000);
      return end >= now;
    })
    .sort((a, b) => {
      const aDt = new Date(`${a.scheduled_date}T${a.scheduled_time}`).getTime() || 0;
      const bDt = new Date(`${b.scheduled_date}T${b.scheduled_time}`).getTime() || 0;
      return aDt - bDt;
    })
    .slice(0, limit);

  if (isLoading) {
    return (
      <Card className="p-4 mb-6">
        <p className="text-sm text-gray-500">Loading upcoming sessions…</p>
      </Card>
    );
  }

  if (upcoming.length === 0) {
    return (
      <Card className="p-4 mb-6 border-dashed">
        <p className="text-sm text-gray-500">
          No upcoming sessions scheduled yet. Fill in the form below to add one.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <CalendarTodayIcon sx={{ fontSize: 18, color: '#7c3aed' }} />
          Your Upcoming Sessions ({upcoming.length})
        </h3>
        <Link to={createPageUrl('TutorSessionsDashboard')}>
          <Button size="small" variant="text">View all</Button>
        </Link>
      </div>
      <div className="space-y-2">
        {upcoming.map(s => {
          const start = s.scheduled_date && s.scheduled_time
            ? new Date(`${s.scheduled_date}T${s.scheduled_time}`)
            : null;
          return (
            <div
              key={s.id}
              className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Chip
                    size="small"
                    label={s.status === 'live' ? '🔴 Live' : 'Scheduled'}
                    className={s.status === 'live' ? 'bg-red-500 text-white' : 'bg-blue-100 text-blue-700'}
                  />
                  <p className="font-medium text-gray-900 truncate">{s.title}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                  {start && (
                    <span className="flex items-center gap-1">
                      <CalendarTodayIcon sx={{ fontSize: 12 }} />
                      {format(start, 'MMM d, yyyy')}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <AccessTimeIcon sx={{ fontSize: 12 }} />
                    {s.scheduled_time} ({s.duration_minutes || 60} min)
                  </span>
                  <span className="flex items-center gap-1">
                    <PeopleIcon sx={{ fontSize: 12 }} />
                    {s.invited_students?.length || 0}
                  </span>
                </div>
              </div>
              <Link to={createPageUrl('VideoSession') + `?id=${s.id}`}>
                <Button size="small" variant="outlined" startIcon={<VideocamIcon sx={{ fontSize: 16 }} />}>
                  Open
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
    </Card>
  );
}