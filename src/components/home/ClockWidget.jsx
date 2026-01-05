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
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">Current Time</p>
          <p className="text-3xl font-bold text-gray-900">{format(time, 'HH:mm')}</p>
          <p className="text-xs text-gray-500 mt-1">{format(time, 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Clock className="w-12 h-12 text-purple-600" />
      </div>
    </Card>
  );
}