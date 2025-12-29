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
  Calendar, FileText, Award, Settings, MessageSquare, Bell,
  AlertCircle, TrendingUp, BarChart3, Send
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AdminYouthWork() {
  const [user, setUser] = useState(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [messageContent, setMessageContent] = useState('');
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

  const sendMessageMutation = useMutation({
    mutationFn: async ({ recipientEmail, message }) => {
      await base44.entities.Notification.create({
        user_email: recipientEmail,
        title: 'Message from Coordinator',
        message: message,
        type: 'message',
      });
      
      await base44.integrations.Core.SendEmail({
        to: recipientEmail,
        subject: 'Youth Work - Message from Your Coordinator',
        body: message,
      });
    },
    onSuccess: () => {
      toast.success('Message sent successfully!');
      setShowMessageDialog(false);
      setMessageContent('');
      setSelectedParticipant(null);
    },
  });

  const downloadWorkbook = async (progress) => {
    try {
      const response = await base44.functions.invoke('exportWorkbookPDF', { progressId: progress.id });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workbook-${progress.participant_name}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Workbook downloaded as PDF');
    } catch (error) {
      toast.error('Failed to download workbook');
    }
  };

  const coordinators = allUsers.filter(u => u.is_coordinator || u.role === 'admin');
  const participants = allUsers.filter(u => !u.role || u.role === 'user');

  // Calculate insights
  const pendingApprovals = allProgress.filter(p => p.is_submitted && !p.is_approved).length;
  const atRiskParticipants = allProgress.filter(p => 
    p.progress_percent < 30 && 
    !p.is_approved &&
    new Date() - new Date(p.updated_date || p.created_date) > 7 * 24 * 60 * 60 * 1000 // 7 days
  );
  const avgProgress = allProgress.length > 0 
    ? Math.round(allProgress.reduce((sum, p) => sum + (p.progress_percent || 0), 0) / allProgress.length)
    : 0;

  const needsAttention = allProgress.filter(p => {
    const daysSinceUpdate = (new Date() - new Date(p.updated_date || p.created_date)) / (1000 * 60 * 60 * 24);
    return (p.progress_percent < 50 && daysSinceUpdate > 14) || 
           (p.is_submitted && !p.is_approved && daysSinceUpdate > 7);
  });

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

        {/* Visual Overview Dashboard */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-purple-600" />
              <span className="text-3xl font-bold text-purple-900">{participants.length}</span>
            </div>
            <p className="text-sm font-medium text-purple-700">Total Participants</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <Bell className="w-8 h-8 text-yellow-600" />
              <span className="text-3xl font-bold text-yellow-900">{pendingApprovals}</span>
            </div>
            <p className="text-sm font-medium text-yellow-700">Pending Approvals</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <span className="text-3xl font-bold text-red-900">{needsAttention.length}</span>
            </div>
            <p className="text-sm font-medium text-red-700">Needs Attention</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-green-900">{avgProgress}%</span>
            </div>
            <p className="text-sm font-medium text-green-700">Average Progress</p>
          </Card>
        </div>

        {/* Alerts & Reminders */}
        {(needsAttention.length > 0 || pendingApprovals > 0) && (
          <Card className="p-6 mb-8 border-l-4 border-yellow-500 bg-yellow-50">
            <div className="flex items-start gap-3">
              <Bell className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-yellow-900 mb-2">Action Required</h3>
                <ul className="space-y-1 text-sm text-yellow-800">
                  {pendingApprovals > 0 && (
                    <li>• {pendingApprovals} submission{pendingApprovals > 1 ? 's' : ''} pending approval</li>
                  )}
                  {needsAttention.length > 0 && (
                    <li>• {needsAttention.length} participant{needsAttention.length > 1 ? 's' : ''} need{needsAttention.length === 1 ? 's' : ''} immediate attention</li>
                  )}
                </ul>
              </div>
            </div>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Needs Attention Section */}
              {needsAttention.length > 0 && (
                <Card className="p-6 border-red-200 bg-red-50">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h3 className="font-bold text-red-900">Participants Needing Attention</h3>
                  </div>
                  <div className="space-y-3">
                    {needsAttention.map(progress => {
                      const qual = qualifications.find(q => q.id === progress.qualification_id);
                      const participant = allUsers.find(u => u.email === progress.participant_email);
                      return (
                        <div key={progress.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={participant?.avatar} />
                              <AvatarFallback>{progress.participant_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-gray-900">{progress.participant_name}</p>
                              <p className="text-sm text-gray-600">{qual?.title} - Unit {progress.unit_index + 1}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-red-500" 
                                    style={{ width: `${progress.progress_percent}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-600">{progress.progress_percent}%</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedParticipant({ 
                                email: progress.participant_email, 
                                name: progress.participant_name 
                              });
                              setShowMessageDialog(true);
                            }}
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Send Message
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Progress Overview by Qualification */}
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Progress Overview by Qualification
                </h3>
                <div className="space-y-4">
                  {qualifications.map(qual => {
                    const qualProgress = allProgress.filter(p => p.qualification_id === qual.id);
                    const avgQualProgress = qualProgress.length > 0
                      ? Math.round(qualProgress.reduce((sum, p) => sum + (p.progress_percent || 0), 0) / qualProgress.length)
                      : 0;
                    const completed = qualProgress.filter(p => p.is_approved).length;
                    
                    return (
                      <div key={qual.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{qual.title}</p>
                            <p className="text-sm text-gray-600">
                              {qualProgress.length} enrolled • {completed} completed
                            </p>
                          </div>
                          <Badge variant="outline">{avgQualProgress}% avg</Badge>
                        </div>
                        <Progress value={avgQualProgress} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </TabsContent>

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
                         onClick={() => {
                           setSelectedParticipant({ 
                             email: progress.participant_email, 
                             name: progress.participant_name 
                           });
                           setShowMessageDialog(true);
                         }}
                       >
                         <MessageSquare className="w-4 h-4 mr-1" />
                         Message
                       </Button>
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
                       <Button
                         size="sm"
                         variant="outline"
                         onClick={() => {
                           setSelectedParticipant({ 
                             email: participant.email, 
                             name: participant.full_name 
                           });
                           setShowMessageDialog(true);
                         }}
                       >
                         <MessageSquare className="w-4 h-4 mr-1" />
                         Message
                       </Button>
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

        {/* Message Dialog */}
        <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Send Message to {selectedParticipant?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <Textarea
                  placeholder="Type your message here..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMessageDialog(false);
                    setMessageContent('');
                    setSelectedParticipant(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (messageContent.trim() && selectedParticipant) {
                      sendMessageMutation.mutate({
                        recipientEmail: selectedParticipant.email,
                        message: messageContent,
                      });
                    }
                  }}
                  disabled={!messageContent.trim() || sendMessageMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}