import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function ClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-1">Current Time</p>
          <p className="text-3xl font-bold text-white">{format(time, 'HH:mm')}</p>
          <p className="text-xs text-slate-500 mt-1">{format(time, 'EEEE, MMM d')}</p>
        </div>
        <Clock className="w-12 h-12 text-purple-400" />
      </div>
    </Card>
  );
}