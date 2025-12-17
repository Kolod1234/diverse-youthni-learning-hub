import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Calendar, Clock, Upload, Save, 
  ChevronLeft, BookOpen, UserCheck, Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ParticipantDashboard() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    activity_type: '',
    hours_spent: '',
    description: '',
    learning_outcomes: '',
    challenges: '',
    status: 'draft'
  });
  const queryClient = useQueryClient();
  
  const urlParams = new URLSearchParams(window.location.search);
  const programId = urlParams.get('programId');

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: programs = [] } = useQuery({
    queryKey: ['program', programId],
    queryFn: () => base44.entities.Program.filter({ id: programId }),
    enabled: !!programId,
  });

  const program = programs[0];

  const { data: participants = [] } = useQuery({
    queryKey: ['participant', programId, user?.email],
    queryFn: () => base44.entities.ProgramParticipant.filter({ 
      program_id: programId, 
      participant_email: user?.email 
    }),
    enabled: !!programId && !!user?.email,
  });

  const myRecord = participants[0];

  const { data: myActivities = [] } = useQuery({
    queryKey: ['my-activities', programId, user?.email],
    queryFn: async () => {
      const allActivities = await base44.entities.ProgramActivity.filter({ 
        program_id: programId 
      }, 'scheduled_date', 100);
      return allActivities.filter(a => 
        !a.assigned_participants || 
        a.assigned_participants.length === 0 || 
        a.assigned_participants.includes(user?.email)
      );
    },
    enabled: !!programId && !!user?.email,
  });

  const { data: myLogbook = [] } = useQuery({
    queryKey: ['my-logbook', programId, user?.email],
    queryFn: () => base44.entities.LogbookEntry.filter({ 
      program_id: programId,
      participant_email: user?.email 
    }, '-created_date', 100),
    enabled: !!programId && !!user?.email,
  });

  const createEntryMutation = useMutation({
    mutationFn: (data) => base44.entities.LogbookEntry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-logbook']);
      toast.success('Logbook entry saved');
      setShowForm(false);
      setFormData({
        entry_date: new Date().toISOString().split('T')[0],
        activity_type: '',
        hours_spent: '',
        description: '',
        learning_outcomes: '',
        challenges: '',
        status: 'draft'
      });
    },
  });

  const handleSubmit = (isDraft = false) => {
    if (!formData.activity_type || !formData.description) {
      toast.error('Please fill in required fields');
      return;
    }

    createEntryMutation.mutate({
      program_id: programId,
      participant_email: user?.email,
      ...formData,
      hours_spent: parseFloat(formData.hours_spent) || 0,
      status: isDraft ? 'draft' : 'submitted'
    });
  };

  const upcomingActivities = myActivities.filter(a => 
    new Date(a.scheduled_date) >= new Date() && a.status !== 'cancelled'
  );

  const totalHours = myLogbook.reduce((sum, entry) => sum + (entry.hours_spent || 0), 0);
  const submittedEntries = myLogbook.filter(e => e.status === 'submitted' || e.status === 'approved').length;

  if (!program || !myRecord) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access denied</h2>
          <p className="text-gray-500 mb-4">You are not enrolled in this programme</p>
          <Link to={createPageUrl('Programs')}>
            <Button variant="outline">Browse Programmes</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('ProgramDetails') + `?id=${programId}`}>
            <Button variant="ghost" className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Programme
            </Button>
          </Link>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-6">
            <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
            <p className="text-indigo-100 text-lg mb-4">{program.title}</p>
            
            {myRecord.mentor_name && (
              <div className="flex items-center gap-2 text-sm">
                <UserCheck className="w-5 h-5" />
                <span>Your Mentor: <strong>{myRecord.mentor_name}</strong></span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalHours}</p>
                  <p className="text-sm text-gray-500">Total Hours</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{submittedEntries}</p>
                  <p className="text-sm text-gray-500">Submitted Entries</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{upcomingActivities.length}</p>
                  <p className="text-sm text-gray-500">Upcoming Activities</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Logbook */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">My Logbook</h2>
                <Button onClick={() => setShowForm(!showForm)}>
                  <FileText className="w-4 h-4 mr-2" />
                  New Entry
                </Button>
              </div>

              {showForm && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-6 bg-indigo-50 rounded-xl border border-indigo-200"
                >
                  <h3 className="font-semibold mb-4">New Logbook Entry</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label>Date *</Label>
                      <Input
                        type="date"
                        value={formData.entry_date}
                        onChange={(e) => setFormData({...formData, entry_date: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label>Activity Type *</Label>
                      <Input
                        value={formData.activity_type}
                        onChange={(e) => setFormData({...formData, activity_type: e.target.value})}
                        placeholder="e.g., Workshop, Mentoring Session"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <Label>Hours Spent</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={formData.hours_spent}
                      onChange={(e) => setFormData({...formData, hours_spent: e.target.value})}
                      placeholder="0.0"
                    />
                  </div>

                  <div className="mb-4">
                    <Label>Description *</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="What did you do during this activity?"
                      rows={3}
                    />
                  </div>

                  <div className="mb-4">
                    <Label>Learning Outcomes</Label>
                    <Textarea
                      value={formData.learning_outcomes}
                      onChange={(e) => setFormData({...formData, learning_outcomes: e.target.value})}
                      placeholder="What did you learn?"
                      rows={2}
                    />
                  </div>

                  <div className="mb-4">
                    <Label>Challenges</Label>
                    <Textarea
                      value={formData.challenges}
                      onChange={(e) => setFormData({...formData, challenges: e.target.value})}
                      placeholder="Any challenges you faced?"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={() => handleSubmit(true)} variant="outline">
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button onClick={() => handleSubmit(false)} className="bg-indigo-600">
                      <Upload className="w-4 h-4 mr-2" />
                      Submit for Review
                    </Button>
                    <Button variant="ghost" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}

              <div className="space-y-3">
                {myLogbook.map((entry) => (
                  <Card key={entry.id} className="p-4 border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{entry.activity_type}</h4>
                        <p className="text-sm text-gray-500">
                          {format(new Date(entry.entry_date), 'MMM d, yyyy')} • {entry.hours_spent}h
                        </p>
                      </div>
                      <Badge className={
                        entry.status === 'approved' ? 'bg-green-100 text-green-700' :
                        entry.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                        entry.status === 'reviewed' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {entry.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{entry.description}</p>
                    {entry.learning_outcomes && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Learning:</strong> {entry.learning_outcomes}
                      </p>
                    )}
                    {entry.mentor_feedback && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Mentor Feedback:</p>
                        <p className="text-sm text-gray-700">{entry.mentor_feedback}</p>
                        {entry.mentor_reviewed_date && (
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(entry.mentor_reviewed_date), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
                {myLogbook.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No logbook entries yet</p>
                )}
              </div>
            </Card>
          </div>

          {/* Upcoming Activities */}
          <div>
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Upcoming Activities
              </h3>
              <div className="space-y-3">
                {upcomingActivities.map((activity) => (
                  <Card key={activity.id} className="p-3 bg-indigo-50 border-indigo-200">
                    <h4 className="font-medium text-sm text-gray-900 mb-1">{activity.title}</h4>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{activity.description}</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(activity.scheduled_date), 'MMM d, h:mm a')}
                      </p>
                      {activity.location && (
                        <p className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {activity.location}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
                {upcomingActivities.length === 0 && (
                  <p className="text-center text-gray-500 py-8 text-sm">No upcoming activities</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}