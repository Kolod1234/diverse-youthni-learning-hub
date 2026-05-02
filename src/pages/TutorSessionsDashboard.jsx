import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button, Card, Chip, Tabs as MuiTabs, Tab as MuiTab, Box } from '@mui/material';
const Badge = ({ children, className, variant, ...props }) => <Chip label={children} size="small" variant={variant === 'outline' ? 'outlined' : 'filled'} className={className} {...props} />;
const TabsContext = React.createContext({ value: '', setValue: () => {} });
const Tabs = ({ children, defaultValue, className, ...props }) => {
  const [value, setValue] = React.useState(defaultValue);
  return <TabsContext.Provider value={{ value, setValue }}><div className={className} {...props}>{children}</div></TabsContext.Provider>;
};
const TabsList = ({ children, className }) => {
  const { value, setValue } = React.useContext(TabsContext);
  return <MuiTabs value={value} onChange={(_, v) => setValue(v)} className={className} sx={{ borderBottom: 1, borderColor: 'divider' }}>{React.Children.map(children, (child) => child && React.cloneElement(child))}</MuiTabs>;
};
const TabsTrigger = ({ children, value, className, ...props }) => <MuiTab value={value} label={children} className={className} {...props} />;
const TabsContent = ({ children, value, className }) => {
  const ctx = React.useContext(TabsContext);
  if (ctx.value !== value) return null;
  return <Box className={className} sx={{ pt: 2 }}>{children}</Box>;
};
import VideocamIcon from '@mui/icons-material/Videocam';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const Video = _w(VideocamIcon), Calendar = _w(CalendarTodayIcon), Users = _w(PeopleIcon), Clock = _w(AccessTimeIcon);
const Plus = _w(AddIcon), Edit = _w(EditIcon), Trash2 = _w(DeleteIcon), CheckCircle = _w(CheckCircleIcon);
const XCircle = _w(CancelIcon), ArrowLeft = _w(ArrowBackIcon), TrendingUp = _w(TrendingUpIcon), Eye = _w(VisibilityIcon);
import { format } from 'date-fns';
import SessionScheduler from '@/components/tutor/SessionScheduler';
import SessionParticipantsManager from '@/components/tutor/SessionParticipantsManager';
import SessionAttendance from '@/components/tutor/SessionAttendance';

export default function TutorSessionsDashboard() {
  const [user, setUser] = useState(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['tutor-sessions', user?.email],
    queryFn: () => base44.entities.VideoSession.filter({ tutor_email: user?.email }, '-scheduled_date', 100),
    enabled: !!user?.email,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['tutor-courses', user?.email],
    queryFn: () => base44.entities.Course.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId) => base44.entities.VideoSession.delete(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries(['tutor-sessions']);
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ sessionId, data }) => base44.entities.VideoSession.update(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tutor-sessions']);
    },
  });

  const upcomingSessions = sessions.filter(s => 
    s.status === 'scheduled' || s.status === 'live'
  );
  const pastSessions = sessions.filter(s => 
    s.status === 'completed' || s.status === 'cancelled'
  );

  const stats = {
    total: sessions.length,
    upcoming: upcomingSessions.length,
    completed: pastSessions.filter(s => s.status === 'completed').length,
    cancelled: pastSessions.filter(s => s.status === 'cancelled').length,
  };

  const handleCancelSession = (sessionId) => {
    if (confirm('Are you sure you want to cancel this session?')) {
      updateSessionMutation.mutate({
        sessionId,
        data: { status: 'cancelled' }
      });
    }
  };

  const handleDeleteSession = (sessionId) => {
    if (confirm('Are you sure you want to delete this session? This cannot be undone.')) {
      deleteSessionMutation.mutate(sessionId);
    }
  };

  const SessionCard = ({ session, isPast = false }) => {
    const course = courses.find(c => c.id === session.course_id);
    const sessionDateTime = session.scheduled_date && session.scheduled_time
      ? new Date(`${session.scheduled_date}T${session.scheduled_time}`)
      : null;

    return (
      <Card className="p-5 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={
                session.status === 'live' ? 'bg-red-500' :
                session.status === 'completed' ? 'bg-green-500' :
                session.status === 'cancelled' ? 'bg-gray-500' :
                'bg-blue-500'
              }>
                {session.status === 'live' ? '🔴 Live' : session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </Badge>
              {session.is_recorded && (
                <Badge variant="outline" className="text-purple-600 border-purple-300">
                  Recorded
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-1">{session.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{course?.title}</p>
            
            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {sessionDateTime && format(sessionDateTime, 'MMM d, yyyy')}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {session.scheduled_time} ({session.duration_minutes} min)
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {session.invited_students?.length || 0} students
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {session.status === 'scheduled' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedSession(session);
                    setShowParticipants(true);
                  }}
                >
                  <Users className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCancelSession(session.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </>
            )}
            {(session.status === 'completed' || session.status === 'cancelled') && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedSession(session);
                  setShowAttendance(true);
                }}
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Link to={createPageUrl('VideoSession') + `?id=${session.id}`} className="flex-1">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600">
              <Video className="w-4 h-4 mr-2" />
              {session.status === 'scheduled' ? 'Join Session' : 'View Details'}
            </Button>
          </Link>
          {isPast && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteSession(session.id)}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to={createPageUrl('TutorDashboard')}>
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Live Sessions</h1>
            <p className="text-gray-600 mt-1">Manage your video sessions and track attendance</p>
          </div>
          <Button
            onClick={() => setShowScheduler(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Session
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Upcoming</p>
                <p className="text-3xl font-bold text-gray-900">{stats.upcoming}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">Cancelled</p>
                <p className="text-3xl font-bold text-gray-900">{stats.cancelled}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Sessions Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming Sessions ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Sessions ({pastSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingSessions.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {upcomingSessions.map(session => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Sessions</h3>
                <p className="text-gray-600 mb-6">Schedule your first live session to get started</p>
                <Button onClick={() => setShowScheduler(true)} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Session
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastSessions.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {pastSessions.map(session => (
                  <SessionCard key={session.id} session={session} isPast />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Past Sessions</h3>
                <p className="text-gray-600">Your completed sessions will appear here</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Session Scheduler Dialog */}
      {showScheduler && (
        <SessionScheduler
          courses={courses}
          onClose={() => setShowScheduler(false)}
          onSuccess={() => {
            setShowScheduler(false);
            queryClient.invalidateQueries(['tutor-sessions']);
          }}
        />
      )}

      {/* Participants Manager Dialog */}
      {showParticipants && selectedSession && (
        <SessionParticipantsManager
          session={selectedSession}
          onClose={() => {
            setShowParticipants(false);
            setSelectedSession(null);
          }}
          onUpdate={() => {
            queryClient.invalidateQueries(['tutor-sessions']);
          }}
        />
      )}

      {/* Attendance Tracker Dialog */}
      {showAttendance && selectedSession && (
        <SessionAttendance
          session={selectedSession}
          onClose={() => {
            setShowAttendance(false);
            setSelectedSession(null);
          }}
        />
      )}
    </div>
  );
}