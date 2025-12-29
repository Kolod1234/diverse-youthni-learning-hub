import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, User } from 'lucide-react';
import { format } from 'date-fns';

export default function ProgramDetailsCard({ program, participants }) {
  return (
    <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-orange-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{program.name}</h2>
          <p className="text-gray-600">{program.description}</p>
        </div>
        <Badge className={
          program.status === 'active' ? 'bg-green-100 text-green-700' :
          program.status === 'completed' ? 'bg-gray-100 text-gray-700' :
          'bg-blue-100 text-blue-700'
        }>
          {program.status}
        </Badge>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#FF8C00]" />
          <div>
            <p className="text-xs text-gray-500">Duration</p>
            <p className="font-medium text-gray-900">
              {format(new Date(program.start_date), 'MMM d')} - {program.end_date ? format(new Date(program.end_date), 'MMM d, yyyy') : 'Ongoing'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#FF8C00]" />
          <div>
            <p className="text-xs text-gray-500">Participants</p>
            <p className="font-medium text-gray-900">{participants.length}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-[#FF8C00]" />
          <div>
            <p className="text-xs text-gray-500">Coordinator</p>
            <p className="font-medium text-gray-900">
              {program.coordinator || program.coordinator_email || 'Not assigned'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}