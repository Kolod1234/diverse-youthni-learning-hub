import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, Users, MapPin, Clock, BookOpen, FileText,
  UserPlus, Activity, ChevronLeft, Target, UserCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';

export default function ProgramDetails() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  
  const urlParams = new URLSearchParams(window.location.search);
  const programId = urlParams.get('id');

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: programs = [] } = useQuery({
    queryKey: ['program', programId],
    queryFn: () => base44.entities.Program.filter({ id: programId }),
    enabled: !!programId,
  });

  const program = programs[0];

  const { data: participants = [] } = useQuery({
    queryKey: ['participants', programId],
    queryFn: () => base44.entities.ProgramParticipant.filter({ program_id: programId }, '-created_date', 100),
    enabled: !!programId,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities', programId],
    queryFn: () => base44.entities.ProgramActivity.filter({ program_id: programId }, 'scheduled_date', 100),
    enabled: !!programId,
  });

  const { data: logbookEntries = [] } = useQuery({
    queryKey: ['logbook', programId],
    queryFn: () => base44.entities.LogbookEntry.filter({ program_id: programId }, '-created_date', 500),
    enabled: !!programId,
  });

  const isAdmin = user?.role === 'admin';
  const isParticipant = participants.some(p => p.participant_email === user?.email);
  const myParticipantRecord = participants.find(p => p.participant_email === user?.email);

  // Group activities by date
  const upcomingActivities = activities.filter(a => 
    new Date(a.scheduled_date) >= new Date() && a.status !== 'cancelled'
  );
  const pastActivities = activities.filter(a => 
    new Date(a.scheduled_date) < new Date() || a.status === 'completed'
  );

  const activityTypeColors = {
    workshop: 'bg-purple-100 text-purple-700',
    mentoring: 'bg-blue-100 text-blue-700',
    fieldwork: 'bg-green-100 text-green-700',
    training: 'bg-orange-100 text-orange-700',
    meeting: 'bg-pink-100 text-pink-700',
    other: 'bg-gray-100 text-gray-700'
  };

  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Programme not found</h2>
          <Link to={createPageUrl('Programs')}>
            <Button variant="outline">Back to Programmes</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Programs')}>
            <Button variant="ghost" className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Programmes
            </Button>
          </Link>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-3">{program.title}</h1>
                <p className="text-indigo-100 text-lg mb-4">{program.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>
                      {format(new Date(program.start_date), 'MMM d, yyyy')} - {format(new Date(program.end_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  
                  {program.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span>{program.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>{participants.length} participants</span>
                  </div>
                </div>
              </div>

              <Badge className="bg-white/20 text-white border-white/30">
                {program.status}
              </Badge>
            </div>

            {isParticipant && (
              <Link to={createPageUrl('ParticipantDashboard') + `?programId=${program.id}`}>
                <Button className="bg-white text-indigo-600 hover:bg-indigo-50">
                  <BookOpen className="w-4 h-4 mr-2" />
                  My Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-xl mb-6">
            <TabsTrigger value="schedule" className="rounded-lg">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="participants" className="rounded-lg">
              <Users className="w-4 h-4 mr-2" />
              Participants
            </TabsTrigger>
            <TabsTrigger value="activities" className="rounded-lg">
              <Activity className="w-4 h-4 mr-2" />
              Activities
            </TabsTrigger>
            {(isParticipant || isAdmin) && (
              <TabsTrigger value="logbook" className="rounded-lg">
                <FileText className="w-4 h-4 mr-2" />
                Logbook
              </TabsTrigger>
            )}
          </TabsList>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Upcoming Activities */}
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Upcoming Activities
                </h3>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {upcomingActivities.map((activity) => (
                      <Card key={activity.id} className="p-4 bg-indigo-50 border-indigo-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{activity.title}</h4>
                            <Badge className={activityTypeColors[activity.activity_type]}>
                              {activity.activity_type}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(parseISO(activity.scheduled_date), 'MMM d, yyyy h:mm a')}
                          </span>
                          {activity.duration_hours && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {activity.duration_hours}h
                            </span>
                          )}
                        </div>
                        {activity.location && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {activity.location}
                          </p>
                        )}
                      </Card>
                    ))}
                    {upcomingActivities.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No upcoming activities</p>
                    )}
                  </div>
                </ScrollArea>
              </Card>

              {/* Past Activities */}
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-gray-600" />
                  Past Activities
                </h3>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {pastActivities.map((activity) => (
                      <Card key={activity.id} className="p-4 bg-gray-50 border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-700 mb-1">{activity.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {activity.activity_type}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(parseISO(activity.scheduled_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </Card>
                    ))}
                    {pastActivities.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No past activities</p>
                    )}
                  </div>
                </ScrollArea>
              </Card>
            </div>
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Programme Participants</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {participants.map((participant) => (
                  <Card key={participant.id} className="p-4 border-gray-200">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-indigo-100 text-indigo-600">
                          {participant.participant_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{participant.participant_name}</p>
                        <p className="text-sm text-gray-500 truncate">{participant.participant_email}</p>
                        {participant.role && (
                          <Badge variant="outline" className="mt-1 text-xs">{participant.role}</Badge>
                        )}
                        {participant.mentor_name && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-gray-600">
                            <UserCheck className="w-3 h-3" />
                            <span>Mentor: {participant.mentor_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">All Activities</h3>
              <div className="space-y-3">
                {activities.map((activity) => (
                  <Card key={activity.id} className="p-4 border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{activity.title}</h4>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                      <Badge className={activityTypeColors[activity.activity_type]}>
                        {activity.activity_type}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(parseISO(activity.scheduled_date), 'MMM d, yyyy h:mm a')}
                      </span>
                      {activity.duration_hours && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {activity.duration_hours} hours
                        </span>
                      )}
                      {activity.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {activity.location}
                        </span>
                      )}
                    </div>
                    {activity.facilitator && (
                      <p className="text-sm text-gray-600 mt-2">
                        Facilitator: <span className="font-medium">{activity.facilitator}</span>
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Logbook Tab */}
          {(isParticipant || isAdmin) && (
            <TabsContent value="logbook">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Logbook Entries</h3>
                  {isParticipant && (
                    <Link to={createPageUrl('ParticipantDashboard') + `?programId=${program.id}`}>
                      <Button>
                        <FileText className="w-4 h-4 mr-2" />
                        Submit Entry
                      </Button>
                    </Link>
                  )}
                </div>
                <div className="space-y-3">
                  {logbookEntries
                    .filter(entry => isAdmin || entry.participant_email === user?.email)
                    .map((entry) => (
                      <Card key={entry.id} className="p-4 border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900">{entry.activity_type}</p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(entry.entry_date), 'MMM d, yyyy')} • {entry.hours_spent}h
                            </p>
                          </div>
                          <Badge className={
                            entry.status === 'approved' ? 'bg-green-100 text-green-700' :
                            entry.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {entry.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{entry.description}</p>
                        {entry.learning_outcomes && (
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Learning:</strong> {entry.learning_outcomes}
                          </p>
                        )}
                        {entry.mentor_feedback && (
                          <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Mentor Feedback:</p>
                            <p className="text-sm text-gray-700">{entry.mentor_feedback}</p>
                          </div>
                        )}
                      </Card>
                    ))}
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}