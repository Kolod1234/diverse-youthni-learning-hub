import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Calendar, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UpcomingSessionsWidget({ user }) {
  const { data: upcomingSessions = [] } = useQuery({
    queryKey: ['upcoming-sessions', user?.email],
    queryFn: async () => {
      const allSessions = await base44.entities.VideoSession.filter({ status: 'scheduled' }, 'scheduled_date', 50);
      return allSessions.filter(s => 
        s.invited_students?.includes(user?.email) || s.tutor_email === user?.email
      );
    },
    enabled: !!user?.email,
    refetchInterval: 60000, // Refetch every minute
  });

  if (upcomingSessions.length === 0) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Video className="w-5 h-5 text-purple-600" />
          Upcoming Live Sessions
        </h3>
        <Badge className="bg-purple-600 text-white">
          {upcomingSessions.length} Scheduled
        </Badge>
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {upcomingSessions.map((session, idx) => (
          <motion.div
            key={session.id}


          >
            <Link to={createPageUrl('VideoSession') + `?id=${session.id}`}>
              <Card className="p-4 hover:shadow-lg transition-all bg-white border-purple-200 hover:border-purple-400">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Video className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{session.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-1 mt-1">{session.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Calendar className="w-3 h-3" />
                        {new Date(session.scheduled_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        {session.scheduled_time}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <User className="w-3 h-3" />
                        {session.tutor_name || 'Tutor'}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 flex-shrink-0">
                    Join
                  </Button>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}