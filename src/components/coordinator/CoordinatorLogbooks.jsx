import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import LogbookManager from '@/components/programs/LogbookManager';
import { Card } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export default function CoordinatorLogbooks({ coordinatorEmail }) {
  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => base44.entities.Program.list('-created_date', 100),
  });

  return (
    <div className="space-y-6">
      {programs.map(program => (
        <div key={program.id}>
          <h3 className="text-lg font-semibold text-foreground mb-4">{program.name}</h3>
          <LogbookManager
            programId={program.id}
            isAdmin={false}
            isMentor={true}
            userEmail={coordinatorEmail}
          />
        </div>
      ))}

      {programs.length === 0 && (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-muted-foreground">No programmes available</p>
        </Card>
      )}
    </div>
  );
}