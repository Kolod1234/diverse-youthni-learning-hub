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

  // Wireframe L5: three summary tiles, then one row per participant.
  const totals = {
    hours: participantStats.reduce((sum, p) => sum + p.totalHours, 0),
    pending: participantStats.reduce((sum, p) => sum + p.pendingLogbooks, 0),
  };
  const tiles = [
    ['Participants', participantStats.length],
    ['Hours logged', `${totals.hours}h`],
    ['Logbooks to check', totals.pending],
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tiles.map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-x-auto">
        <h3 className="text-lg font-semibold text-foreground px-5 pt-5 pb-3">Participant progress</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="px-5 py-2 font-medium">Participant</th>
              <th className="px-3 py-2 font-medium">Logbooks approved</th>
              <th className="px-3 py-2 font-medium">Hours</th>
              <th className="px-5 py-2 font-medium">To check</th>
            </tr>
          </thead>
          <tbody>
            {participantStats.map((participant) => {
              const TrendIcon = participant.trend === 'up' ? TrendingUp : participant.trend === 'down' ? TrendingDown : Minus;
              const trendColor = participant.trend === 'up' ? 'text-green-600' : participant.trend === 'down' ? 'text-red-600' : 'text-muted-foreground';
              return (
                <tr key={participant.email} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback className="bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
                          {participant.full_name?.charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate flex items-center gap-1.5">
                          {participant.full_name}
                          <TrendIcon className={`w-4 h-4 ${trendColor}`} aria-label={`Hours trend: ${participant.trend}`} />
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{participant.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 min-w-[160px]">
                    <div className="flex items-center gap-2">
                      <Progress value={participant.approvalRate} className="h-2 flex-1" />
                      <span className="text-foreground whitespace-nowrap">{participant.approvedLogbooks} / {participant.totalLogbooks}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-foreground">{participant.totalHours}h</td>
                  <td className="px-5 py-3">
                    {participant.pendingLogbooks > 0 ? (
                      <Badge className="bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300">
                        <Clock className="w-3 h-3 mr-1 inline" />{participant.pendingLogbooks} pending
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-600" />Up to date</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}