import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, BookOpen, CheckCircle, XCircle, Download, UserX,
  Calendar, FileText, Award, Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AdminYouthWork() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: qualifications = [] } = useQuery({
    queryKey: ['youth-work-qualifications'],
    queryFn: () => base44.entities.YouthWorkQualification.list('order', 100),
  });

  const { data: allProgress = [] } = useQuery({
    queryKey: ['all-workbook-progress'],
    queryFn: () => base44.asServiceRole.entities.WorkbookProgress.list('-created_date', 1000),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.asServiceRole.entities.User.list('full_name', 1000),
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['youth-work-attendance'],
    queryFn: () => base44.entities.YouthWorkAttendance.list('-session_date', 1000),
  });

  const approveWorkbookMutation = useMutation({
    mutationFn: ({ progressId, feedback }) => 
      base44.entities.WorkbookProgress.update(progressId, {
        is_approved: true,
        approved_by: user?.email,
        approved_date: new Date().toISOString(),
        coordinator_feedback: feedback,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-workbook-progress']);
      toast.success('Workbook approved!');
    },
  });

  const blockUserMutation = useMutation({
    mutationFn: (userId) => 
      base44.asServiceRole.entities.User.update(userId, { youth_work_blocked: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-users']);
      toast.success('User blocked from youth work');
    },
  });

  const assignCoordinatorMutation = useMutation({
    mutationFn: ({ userId, coordinatorEmail }) =>
      base44.asServiceRole.entities.User.update(userId, { 
        assigned_coordinator_email: coordinatorEmail 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-users']);
      toast.success('Coordinator assigned');
    },
  });

  const downloadWorkbook = (progress) => {
    const content = JSON.stringify(progress, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workbook-${progress.participant_name}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const coordinators = allUsers.filter(u => u.is_coordinator || u.role === 'admin');
  const participants = allUsers.filter(u => !u.role || u.role === 'user');

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900">Admin Access Only</h2>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Youth Work Management</h1>
          <p className="text-gray-600">Manage qualifications, participants, and assessments</p>
        </motion.div>

        <Tabs defaultValue="submissions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
          </TabsList>

          {/* Submissions Tab */}
          <TabsContent value="submissions">
            <div className="grid gap-4">
              {allProgress.map(progress => {
                const qual = qualifications.find(q => q.id === progress.qualification_id);
                return (
                  <Card key={progress.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900">{progress.participant_name}</h3>
                          <Badge variant="outline">{qual?.title}</Badge>
                          <Badge variant="outline">Unit {progress.unit_index + 1}</Badge>
                          {progress.is_approved ? (
                            <Badge className="bg-green-100 text-green-700">Approved</Badge>
                          ) : progress.is_submitted ? (
                            <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
                          ) : (
                            <Badge variant="outline">In Progress</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{progress.participant_email}</p>
                        <p className="text-sm text-gray-500">Progress: {progress.progress_percent}%</p>
                        {progress.coordinator_feedback && (
                          <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                            <strong>Feedback:</strong> {progress.coordinator_feedback}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadWorkbook(progress)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        {!progress.is_approved && (
                          <Button
                            size="sm"
                            onClick={() => {
                              const feedback = prompt('Enter feedback:');
                              if (feedback !== null) {
                                approveWorkbookMutation.mutate({ 
                                  progressId: progress.id, 
                                  feedback 
                                });
                              }
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants">
            <div className="grid gap-4">
              {participants.map(participant => {
                const userProgress = allProgress.filter(p => p.participant_email === participant.email);
                const targetUser = allUsers.find(u => u.id === participant.id);
                
                return (
                  <Card key={participant.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback>{participant.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-gray-900">{participant.full_name}</h3>
                          <p className="text-sm text-gray-600">{participant.email}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {userProgress.length} workbook(s) in progress
                          </p>
                          {participant.assigned_coordinator_email && (
                            <Badge variant="outline" className="mt-1">
                              Coordinator: {participant.assigned_coordinator_email}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={participant.assigned_coordinator_email || ''}
                          onChange={(e) => assignCoordinatorMutation.mutate({
                            userId: participant.id,
                            coordinatorEmail: e.target.value,
                          })}
                          className="px-3 py-2 border rounded-lg text-sm"
                        >
                          <option value="">Assign Coordinator</option>
                          {coordinators.map(coord => (
                            <option key={coord.email} value={coord.email}>
                              {coord.full_name}
                            </option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => blockUserMutation.mutate(participant.id)}
                          disabled={participant.youth_work_blocked}
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          {participant.youth_work_blocked ? 'Blocked' : 'Block'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Attendance Records</h3>
              <div className="space-y-2">
                {attendance.map(record => (
                  <div key={record.id} className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">{record.participant_name}</p>
                      <p className="text-sm text-gray-600">{record.session_title} - {record.session_date}</p>
                    </div>
                    <Badge className={
                      record.status === 'present' ? 'bg-green-100 text-green-700' :
                      record.status === 'absent' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }>
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Qualifications Tab */}
          <TabsContent value="qualifications">
            <div className="grid gap-4">
              {qualifications.map(qual => (
                <Card key={qual.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="mb-2">{qual.level}</Badge>
                      <h3 className="font-bold text-lg mb-2">{qual.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{qual.description}</p>
                      <p className="text-sm text-gray-500">
                        {qual.curriculum?.length || 0} Units • {qual.credit_value} Credits
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}