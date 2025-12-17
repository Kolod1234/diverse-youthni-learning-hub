import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, ClipboardList, Users, BookOpen,
  Plus, Settings, Clock, MapPin, User
} from 'lucide-react';
import { motion } from 'framer-motion';
import ProgramCalendar from '@/components/programs/ProgramCalendar';
import ActivitySchedule from '@/components/programs/ActivitySchedule';
import RotaManager from '@/components/programs/RotaManager';
import ParticipantManager from '@/components/programs/ParticipantManager';
import LogbookManager from '@/components/programs/LogbookManager';
import ProgramDetailsCard from '@/components/programs/ProgramDetailsCard';

export default function Programs() {
  const [user, setUser] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => base44.entities.Program.list('-created_date', 100),
  });

  const { data: participants = [] } = useQuery({
    queryKey: ['program-participants', selectedProgram?.id],
    queryFn: () => base44.entities.ProgramParticipant.filter({ program_id: selectedProgram.id }),
    enabled: !!selectedProgram,
  });

  const isAdmin = user?.role === 'admin';
  const isMentor = user?.is_tutor || isAdmin;

  // Auto-select first program
  useEffect(() => {
    if (programs.length > 0 && !selectedProgram) {
      setSelectedProgram(programs[0]);
    }
  }, [programs]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Leadership Employment Programmes</h1>
              <p className="text-gray-500 mt-1">Manage programmes, activities, and participant progress</p>
            </div>
            {isAdmin && (
              <Button className="bg-[#FF8C00] hover:bg-[#CC7000]">
                <Plus className="w-4 h-4 mr-2" />
                New Programme
              </Button>
            )}
          </div>

          {/* Program Selector */}
          <div className="flex gap-2 flex-wrap">
            {programs.map(program => (
              <Button
                key={program.id}
                variant={selectedProgram?.id === program.id ? 'default' : 'outline'}
                onClick={() => setSelectedProgram(program)}
                className={selectedProgram?.id === program.id ? 'bg-[#FF8C00]' : ''}
              >
                {program.name}
                <Badge className="ml-2" variant="secondary">{program.status}</Badge>
              </Button>
            ))}
          </div>
        </motion.div>

        {selectedProgram ? (
          <>
            {/* Program Details */}
            <ProgramDetailsCard program={selectedProgram} participants={participants} />

            {/* Main Tabs */}
            <Tabs defaultValue="calendar" className="mt-6">
              <TabsList className="bg-white border border-gray-200 p-1 rounded-xl mb-6">
                <TabsTrigger value="calendar">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="activities">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Activities
                </TabsTrigger>
                <TabsTrigger value="rota">
                  <Clock className="w-4 h-4 mr-2" />
                  Rota
                </TabsTrigger>
                <TabsTrigger value="participants">
                  <Users className="w-4 h-4 mr-2" />
                  Participants
                </TabsTrigger>
                <TabsTrigger value="logbook">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Logbook
                </TabsTrigger>
              </TabsList>

              <TabsContent value="calendar">
                <ProgramCalendar programId={selectedProgram.id} isAdmin={isAdmin} />
              </TabsContent>

              <TabsContent value="activities">
                <ActivitySchedule programId={selectedProgram.id} isAdmin={isAdmin} participants={participants} />
              </TabsContent>

              <TabsContent value="rota">
                <RotaManager programId={selectedProgram.id} isAdmin={isAdmin} participants={participants} />
              </TabsContent>

              <TabsContent value="participants">
                <ParticipantManager programId={selectedProgram.id} isAdmin={isAdmin} isMentor={isMentor} />
              </TabsContent>

              <TabsContent value="logbook">
                <LogbookManager 
                  programId={selectedProgram.id} 
                  isAdmin={isAdmin}
                  isMentor={isMentor}
                  userEmail={user.email}
                />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card className="p-12 text-center">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Programmes Yet</h3>
            <p className="text-gray-500 mb-6">Create your first leadership employment programme to get started</p>
            {isAdmin && (
              <Button className="bg-[#FF8C00] hover:bg-[#CC7000]">
                <Plus className="w-4 h-4 mr-2" />
                Create Programme
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}