import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button, Card, Chip, Tabs as MuiTabs, Tab as MuiTab, Box } from '@mui/material';
const Badge = ({ children, className, variant, ...props }) => <Chip label={children} size="small" variant={variant === 'outline' ? 'outlined' : 'filled'} className={className} {...props} />;
const TabsContext = React.createContext({ value: '', setValue: () => {} });
const Tabs = ({ children, defaultValue, className }) => {
  const [value, setValue] = React.useState(defaultValue);
  return <TabsContext.Provider value={{ value, setValue }}><div className={className}>{children}</div></TabsContext.Provider>;
};
const TabsList = ({ children, className }) => {
  const { value, setValue } = React.useContext(TabsContext);
  return <MuiTabs value={value} onChange={(_, v) => setValue(v)} className={className} sx={{ borderBottom: 1, borderColor: 'divider' }}>{React.Children.map(children, c => c && React.cloneElement(c))}</MuiTabs>;
};
const TabsTrigger = ({ children, value, className, ...props }) => <MuiTab value={value} label={children} className={className} {...props} />;
const TabsContent = ({ children, value, className }) => {
  const ctx = React.useContext(TabsContext);
  if (ctx.value !== value) return null;
  return <Box className={className} sx={{ pt: 2 }}>{children}</Box>;
};
import VideocamIcon from '@mui/icons-material/Videocam';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const Video = _w(VideocamIcon), Calendar = _w(CalendarTodayIcon), Clock = _w(AccessTimeIcon), Users = _w(PeopleIcon);
const Plus = _w(AddIcon), PlayCircle = _w(PlayCircleOutlineIcon), CheckCircle = _w(CheckCircleIcon);
const XCircle = _w(CancelIcon), ArrowRight = _w(ArrowForwardIcon);
import { format, isPast, isFuture, isToday } from 'date-fns';
import { motion } from 'framer-motion';

export default function Sessions() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: allSessions = [] } = useQuery({
    queryKey: ['video-sessions'],
    queryFn: () => base44.entities.VideoSession.list('-scheduled_date', 500),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 500),
  });

  const isTutorOrCoordinator = user?.is_tutor || user?.is_coordinator || user?.role === 'admin';

  // Filter sessions based on user role
  const mySessions = allSessions.filter(session => {
    if (isTutorOrCoordinator && session.tutor_email === user?.email) {
      return true; // All sessions they're hosting
    }
    return session.invited_students?.includes(user?.email); // Sessions they're invited to
  });

  const upcomingSessions = mySessions.filter(s => {
    const sessionDate = new Date(`${s.scheduled_date}T${s.scheduled_time}`);
    return s.status === 'scheduled' && isFuture(sessionDate);
  });

  const liveSessions = mySessions.filter(s => s.status === 'live');

  const pastSessions = mySessions.filter(s => {
    const sessionDate = new Date(`${s.scheduled_date}T${s.scheduled_time}`);
    return s.status === 'completed' || (s.status === 'scheduled' && isPast(sessionDate));
  });

  const getCourse = (courseId) => courses.find(c => c.id === courseId);

  const SessionCard = ({ session }) => {
    const sessionDate = new Date(`${session.scheduled_date}T${session.scheduled_time}`);
    const course = getCourse(session.course_id);
    const isHost = session.tutor_email === user?.email;
    const canJoin = session.status === 'live' || (session.status === 'scheduled' && isToday(sessionDate));

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group"
      >
        <Card className="p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{session.title}</h3>
                  {course && (
                    <p className="text-sm text-gray-500">{course.title}</p>
                  )}
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-3">{session.description}</p>

              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{format(sessionDate, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{session.scheduled_time} ({session.duration_minutes} min)</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{session.invited_students?.length || 0} participants</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                {session.status === 'live' && (
                  <Badge className="bg-red-500">🔴 Live Now</Badge>
                )}
                {session.status === 'completed' && (
                  <Badge className="bg-gray-500">Completed</Badge>
                )}
                {session.status === 'cancelled' && (
                  <Badge className="bg-gray-600">Cancelled</Badge>
                )}
                {isHost && (
                  <Badge variant="outline" className="border-purple-300 text-purple-700">Host</Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link to={createPageUrl('VideoSession') + `?id=${session.id}`}>
                <Button 
                  size="sm"
                  className={
                    session.status === 'live' 
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                  }
                >
                  {session.status === 'live' ? (
                    <>
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Join Now
                    </>
                  ) : (
                    <>
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Sessions</h1>
            <p className="text-gray-500">Join live video sessions with tutors and peers</p>
          </div>
          {isTutorOrCoordinator && (
            <Link to={createPageUrl('ScheduleSession')}>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Session
              </Button>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Live Now</p>
                <p className="text-3xl font-bold text-gray-900">{liveSessions.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <PlayCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Upcoming</p>
                <p className="text-3xl font-bold text-gray-900">{upcomingSessions.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{pastSessions.length}</p>
              </div>
              <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Sessions Tabs */}
        <Tabs defaultValue="live" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="live" className="gap-2">
              <PlayCircle className="w-4 h-4" />
              Live ({liveSessions.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-2">
              <Calendar className="w-4 h-4" />
              Upcoming ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Past ({pastSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-4">
            {liveSessions.length > 0 ? (
              liveSessions.map(session => (
                <SessionCard key={session.id} session={session} />
              ))
            ) : (
              <Card className="p-12 text-center">
                <PlayCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Live Sessions</h3>
                <p className="text-gray-500">There are no active live sessions at the moment</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map(session => (
                <SessionCard key={session.id} session={session} />
              ))
            ) : (
              <Card className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Upcoming Sessions</h3>
                <p className="text-gray-500 mb-6">You don't have any scheduled sessions yet</p>
                {isTutorOrCoordinator && (
                  <Link to={createPageUrl('ScheduleSession')}>
                    <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule Your First Session
                    </Button>
                  </Link>
                )}
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastSessions.length > 0 ? (
              pastSessions.map(session => (
                <SessionCard key={session.id} session={session} />
              ))
            ) : (
              <Card className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Past Sessions</h3>
                <p className="text-gray-500">Your completed sessions will appear here</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}