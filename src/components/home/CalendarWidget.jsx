import React from 'react';
import { Card } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function CalendarWidget() {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-slate-400 mb-1">Calendar</p>
          <p className="text-lg font-bold text-white">{format(today, 'MMMM yyyy')}</p>
        </div>
        <CalendarIcon className="w-8 h-8 text-blue-400" />
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-center text-xs font-medium text-slate-500 py-1">{day}</div>
        ))}
        {days.map((day, i) => (
          <div
            key={i}
            className={`text-center text-xs py-1.5 rounded ${
              day === today.getDate()
                ? 'bg-blue-500 text-white font-bold'
                : day
                ? 'text-slate-300 hover:bg-slate-700'
                : ''
            }`}
          >
            {day || ''}
          </div>
        ))}
      </div>
    </Card>
  );
}