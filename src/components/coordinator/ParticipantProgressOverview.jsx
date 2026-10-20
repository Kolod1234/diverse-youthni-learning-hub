import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, TrendingDown, Minus, CheckCircle, Clock } from 'lucide-react';

export default function ParticipantProgressOverview({ user }) {
  const { data: participants = [] } = useQuery({
    queryKey: ['assigned-participants', user?.email],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminListUsers', {
        filter: { assigned_coordinator_email: user?.email },
      });
      return res.data.users;
    },
    enabled: !!user?.email,
  });

  const { data: allLogbooks = [] } = useQuery({
    queryKey: ['all-logbooks'],
    queryFn: () => base44.entities.Logbook.list('-created_date', 1000),
  });

  const participantStats = participants.map(participant => {
    const logbooks = allLogbooks.filter(l => l.participant_email === participant.email);
    const approvedCount = logbooks.filter(l => l.is_approved).length;
    const pendingCount = logbooks.filter(l => !l.is_approved).length;
    const totalHours = logbooks.reduce((sum, l) => sum + (l.hours_per_week || 0), 0);
    
    // Calculate trend (compare recent vs older logbooks)
    const recentLogbooks = logbooks.slice(0, 3);
    const olderLogbooks = logbooks.slice(3, 6);
    const recentAvgHours = recentLogbooks.reduce((sum, l) => sum + (l.hours_per_week || 0), 0) / recentLogbooks.length || 0;
    const olderAvgHours = olderLogbooks.reduce((sum, l) => sum + (l.hours_per_week || 0), 0) / olderLogbooks.length || 0;
    
    let trend = 'stable';
    if (recentAvgHours > olderAvgHours * 1.1) trend = 'up';
    if (recentAvgHours < olderAvgHours * 0.9) trend = 'down';

    return {
      ...participant,
      totalLogbooks: logbooks.length,
      approvedLogbooks: approvedCount,
      pendingLogbooks: pendingCount,
      totalHours,
      trend,
      approvalRate: logbooks.length > 0 ? (approvedCount / logbooks.length) * 100 : 0
    };
  });

  if (participants.length === 0) {
    return (
      <Card className="p-12 text-center">
        <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Participants Assigned</h3>
        <p className="text-muted-foreground">Participants will appear here once assigned to you</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Participant Progress Overview</h3>
      
      <div className="space-y-4">
        {participantStats.map((participant) => {
          const TrendIcon = participant.trend === 'up' ? TrendingUp : participant.trend === 'down' ? TrendingDown : Minus;
          const trendColor = participant.trend === 'up' ? 'text-green-600' : participant.trend === 'down' ? 'text-red-600' : 'text-gray-400';
          
          return (
            <Card key={participant.email} className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback className="bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
                    {participant.full_name?.charAt(0) || 'P'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground truncate">
                      {participant.full_name}
                    </p>
                    <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                  </div>
                  <p className="text-xs text-muted-foreground">{participant.email}</p>
                </div>
                {participant.pendingLogbooks > 0 && (
                  <Badge className="bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300">
                    {participant.pendingLogbooks} pending
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Logbooks</p>
                  <p className="text-lg font-semibold text-foreground">{participant.totalLogbooks}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Hours</p>
                  <p className="text-lg font-semibold text-foreground">{participant.totalHours}h</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Approval Rate</p>
                  <p className="text-lg font-semibold text-foreground">{Math.round(participant.approvalRate)}%</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">
                    {participant.approvedLogbooks} / {participant.totalLogbooks} approved
                  </span>
                </div>
                <Progress value={participant.approvalRate} className="h-2" />
              </div>

              {participant.pendingLogbooks > 0 && (
                <div className="mt-3 flex items-center gap-2 text-xs text-orange-600">
                  <Clock className="w-3 h-3" />
                  <span>{participant.pendingLogbooks} logbook(s) awaiting review</span>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </Card>
  );
}