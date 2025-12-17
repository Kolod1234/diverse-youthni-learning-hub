import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

export default function ProgramCalendar({ programId, isAdmin }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: activities = [] } = useQuery({
    queryKey: ['activities', programId],
    queryFn: () => base44.entities.Activity.filter({ program_id: programId }),
  });

  const { data: rotas = [] } = useQuery({
    queryKey: ['rotas', programId],
    queryFn: () => base44.entities.Rota.filter({ program_id: programId }),
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayActivities = activities.filter(a => a.activity_date === dateStr);
    const dayRotas = rotas.filter(r => r.shift_date === dateStr);
    return { activities: dayActivities, rotas: dayRotas };
  };

  return (
    <Card className="p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-500 py-2">
            {day}
          </div>
        ))}
        
        {daysInMonth.map(day => {
          const events = getEventsForDay(day);
          const isToday = isSameDay(day, new Date());
          const hasEvents = events.activities.length > 0 || events.rotas.length > 0;
          
          return (
            <div
              key={day.toString()}
              className={`min-h-24 p-2 border rounded-lg ${
                isToday ? 'bg-orange-50 border-[#FF8C00]' : 'bg-white border-gray-200'
              } ${!isSameMonth(day, currentDate) ? 'opacity-50' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${isToday ? 'text-[#FF8C00]' : 'text-gray-900'}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {events.activities.slice(0, 2).map(activity => (
                  <div key={activity.id} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded truncate">
                    {activity.title}
                  </div>
                ))}
                {events.rotas.length > 0 && (
                  <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {events.rotas.length} shift{events.rotas.length > 1 ? 's' : ''}
                  </div>
                )}
                {(events.activities.length + events.rotas.length > 2) && (
                  <div className="text-xs text-gray-500">+{events.activities.length + events.rotas.length - 2} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-6 pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 rounded"></div>
          <span className="text-sm text-gray-600">Activities</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-100 rounded"></div>
          <span className="text-sm text-gray-600">Rota Shifts</span>
        </div>
      </div>
    </Card>
  );
}