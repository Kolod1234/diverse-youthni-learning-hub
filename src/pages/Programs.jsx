import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Briefcase, Calendar, Users, MapPin, Search, 
  ArrowRight, Clock, CheckCircle, Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function Programs() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['programs'],
    queryFn: () => base44.entities.Program.list('-created_date', 100),
  });

  const { data: participants = [] } = useQuery({
    queryKey: ['all-participants'],
    queryFn: () => base44.entities.ProgramParticipant.list('-created_date', 500),
  });

  const filteredPrograms = programs.filter(p => 
    !searchQuery || 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColors = {
    planning: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Leadership Employment Programmes</h1>
              <p className="text-gray-500">Professional development and mentorship opportunities</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search programmes..."
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Programs Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
                <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 rounded w-4/5" />
              </Card>
            ))}
          </div>
        ) : filteredPrograms.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program, index) => {
              const programParticipants = participants.filter(p => p.program_id === program.id);
              
              return (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={createPageUrl('ProgramDetails') + `?id=${program.id}`}>
                    <Card className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-white h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                            {program.title}
                          </h3>
                          <Badge className={statusColors[program.status]}>
                            {program.status}
                          </Badge>
                        </div>
                        <Target className="w-8 h-8 text-indigo-600" />
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {program.description}
                      </p>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(new Date(program.start_date), 'MMM d, yyyy')} - {format(new Date(program.end_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        
                        {program.location && (
                          <div className="flex items-center gap-2 text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span>{program.location}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-gray-500">
                          <Users className="w-4 h-4" />
                          <span>
                            {programParticipants.length} participants
                            {program.max_participants && ` / ${program.max_participants}`}
                          </span>
                        </div>
                      </div>

                      <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700">
                        View Programme
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No programmes found</h3>
            <p className="text-gray-500">Check back later for new opportunities</p>
          </div>
        )}
      </div>
    </div>
  );
}