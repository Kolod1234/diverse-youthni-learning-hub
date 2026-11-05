import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Card, Button, TextField, Chip, Tabs, Tab, Avatar, LinearProgress,
  Dialog, DialogContent, DialogTitle, DialogActions,
  Box, Container, Typography, Stack
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DownloadIcon from '@mui/icons-material/Download';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SettingsIcon from '@mui/icons-material/Settings';
import ChatIcon from '@mui/icons-material/Chat';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import SendIcon from '@mui/icons-material/Send';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const Users = _w(PeopleIcon), BookOpen = _w(MenuBookIcon), CheckCircle = _w(CheckCircleIcon), XCircle = _w(CancelIcon);
const Download = _w(DownloadIcon), UserX = _w(PersonOffIcon), Calendar = _w(CalendarTodayIcon), FileText = _w(DescriptionIcon);
const Award = _w(EmojiEventsIcon), Settings = _w(SettingsIcon), MessageSquare = _w(ChatIcon), Bell = _w(NotificationsIcon);
const AlertCircle = _w(ErrorOutlineIcon), TrendingUp = _w(TrendingUpIcon), BarChart3 = _w(BarChartIcon), Send = _w(SendIcon);
// Compatibility shims so existing JSX (Card, Button, Input, Textarea, Badge, Tabs, Avatar, Progress) continues working with MUI
const Input = (props) => <TextField fullWidth size="small" {...props} />;
const Textarea = ({ className, ...props }) => <TextField fullWidth multiline rows={4} {...props} />;
const Badge = ({ children, className, variant, ...props }) => <Chip label={children} size="small" variant={variant === 'outline' ? 'outlined' : 'filled'} className={className} {...props} />;
const TabsList = ({ children }) => <Stack direction="row" spacing={1} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>{children}</Stack>;
const TabsTrigger = ({ children, value, ...props }) => <Button size="small" variant="text" {...props}>{children}</Button>;
const TabsContent = ({ children, value }) => <Box>{children}</Box>;
const AvatarImage = () => null;
const AvatarFallback = ({ children }) => <>{children}</>;
const DialogHeader = ({ children }) => <>{children}</>;
const DialogTrigger = ({ children }) => <>{children}</>;
const Progress = ({ value, className }) => <LinearProgress variant="determinate" value={value || 0} className={className} sx={{ height: 8, borderRadius: 1 }} />;
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AdminYouthWork() {
  const [user, setUser] = useState(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const [editingQualification, setEditingQualification] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
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
    queryFn: async () => (await base44.functions.invoke('adminListRecords', { entity: 'WorkbookProgress', sort: '-created_date', limit: 1000 })).data.records,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => (await base44.functions.invoke('adminListUsers', { sort: 'full_name', limit: 1000 })).data.users,
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
      base44.functions.invoke('adminUpdateUser', { userId, data: { youth_work_blocked: true } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-users']);
      toast.success('User blocked from youth work');
    },
  });

  const assignCoordinatorMutation = useMutation({
    mutationFn: ({ userId, coordinatorEmail }) =>
      base44.functions.invoke('adminUpdateUser', { userId, data: {
        assigned_coordinator_email: coordinatorEmail
      } }),
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

  const updateQualificationMutation = useMutation({
    mutationFn: ({ qualId, data }) =>
      base44.entities.YouthWorkQualification.update(qualId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['youth-work-qualifications']);
      toast.success('Qualification updated successfully!');
      setShowEditDialog(false);
      setEditingQualification(null);
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
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-foreground">Admin Access Only</h2>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Youth Work Management</h1>
          <p className="text-muted-foreground">Manage qualifications, participants, and assessments</p>
        </motion.div>

        {/* Visual Overview Dashboard */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-indigo-600" />
              <span className="text-3xl font-bold text-indigo-900 dark:text-indigo-300">{participants.length}</span>
            </div>
            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Total Participants</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Bell className="w-8 h-8 text-yellow-600" />
              <span className="text-3xl font-bold text-yellow-900 dark:text-yellow-300">{pendingApprovals}</span>
            </div>
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pending Approvals</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <span className="text-3xl font-bold text-red-900 dark:text-red-300">{needsAttention.length}</span>
            </div>
            <p className="text-sm font-medium text-red-700 dark:text-red-300">Needs Attention</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-green-900 dark:text-green-300">{avgProgress}%</span>
            </div>
            <p className="text-sm font-medium text-green-700 dark:text-green-300">Average Progress</p>
          </Card>
        </div>

        {/* Alerts & Reminders */}
        {(needsAttention.length > 0 || pendingApprovals > 0) && (
          <Card className="p-6 mb-8 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-500/15">
            <div className="flex items-start gap-3">
              <Bell className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-yellow-900 dark:text-yellow-300 mb-2">Action Required</h3>
                <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-300">
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
                <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-500/15">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h3 className="font-bold text-red-900 dark:text-red-300">Participants Needing Attention</h3>
                  </div>
                  <div className="space-y-3">
                    {needsAttention.map(progress => {
                      const qual = qualifications.find(q => q.id === progress.qualification_id);
                      const participant = allUsers.find(u => u.email === progress.participant_email);
                      return (
                        <div key={progress.id} className="bg-card rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={participant?.avatar} />
                              <AvatarFallback>{progress.participant_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-foreground">{progress.participant_name}</p>
                              <p className="text-sm text-muted-foreground">{qual?.title} - Unit {progress.unit_index + 1}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-red-500" 
                                    style={{ width: `${progress.progress_percent}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">{progress.progress_percent}%</span>
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
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
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
                            <p className="font-semibold text-foreground">{qual.title}</p>
                            <p className="text-sm text-muted-foreground">
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
                          <h3 className="font-bold text-foreground">{progress.participant_name}</h3>
                          <Badge variant="outline">{qual?.title}</Badge>
                          <Badge variant="outline">Unit {progress.unit_index + 1}</Badge>
                          {progress.is_approved ? (
                            <Badge className="bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-300">Approved</Badge>
                          ) : progress.is_submitted ? (
                            <Badge className="bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-300">Pending</Badge>
                          ) : (
                            <Badge variant="outline">In Progress</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{progress.participant_email}</p>
                        <p className="text-sm text-muted-foreground">Progress: {progress.progress_percent}%</p>
                        {progress.coordinator_feedback && (
                          <p className="text-sm text-foreground mt-2 bg-muted p-2 rounded">
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
                         <Button variant="contained"
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
                          <h3 className="font-bold text-foreground">{participant.full_name}</h3>
                          <p className="text-sm text-muted-foreground">{participant.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
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
                      <p className="text-sm text-muted-foreground">{record.session_title} - {record.session_date}</p>
                    </div>
                    <Badge className={
                      record.status === 'present' ? 'bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-300' :
                      record.status === 'absent' ? 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300' :
                      'bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-300'
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
                      <p className="text-sm text-muted-foreground mb-2">{qual.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {qual.curriculum?.length || 0} Units • {qual.credit_value} Credits
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingQualification(qual);
                        setShowEditDialog(true);
                      }}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Qualification Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Qualification</DialogTitle>
            </DialogHeader>
            {editingQualification && (
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Level
                    </label>
                    <select
                      value={editingQualification.level}
                      onChange={(e) => setEditingQualification({
                        ...editingQualification,
                        level: e.target.value
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="Level 1">Level 1</option>
                      <option value="Level 2">Level 2</option>
                      <option value="Level 3">Level 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Title
                    </label>
                    <Input
                      value={editingQualification.title}
                      onChange={(e) => setEditingQualification({
                        ...editingQualification,
                        title: e.target.value
                      })}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <Textarea
                    value={editingQualification.description}
                    onChange={(e) => setEditingQualification({
                      ...editingQualification,
                      description: e.target.value
                    })}
                    className="min-h-[80px]"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Credit Value
                    </label>
                    <Input
                      type="number"
                      value={editingQualification.credit_value || ''}
                      onChange={(e) => setEditingQualification({
                        ...editingQualification,
                        credit_value: Number(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Guided Learning Hours
                    </label>
                    <Input
                      type="number"
                      value={editingQualification.guided_learning_hours || ''}
                      onChange={(e) => setEditingQualification({
                        ...editingQualification,
                        guided_learning_hours: Number(e.target.value)
                      })}
                    />
                  </div>
                </div>

                {/* Curriculum Units */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-foreground">Curriculum Units</h4>
                    <Button
                      size="sm"
                      onClick={() => {
                        const newCurriculum = [...(editingQualification.curriculum || [])];
                        newCurriculum.push({
                          unit_title: 'New Unit',
                          unit_code: '',
                          credits: 0,
                          level: editingQualification.level,
                          learning_outcomes: ['']
                        });
                        setEditingQualification({
                          ...editingQualification,
                          curriculum: newCurriculum
                        });
                      }}
                    >
                      Add Unit
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {(editingQualification.curriculum || []).map((unit, unitIdx) => (
                      <Card key={unitIdx} className="p-4 bg-muted">
                        <div className="flex items-start justify-between mb-3">
                          <h5 className="font-semibold text-sm text-foreground">Unit {unitIdx + 1}</h5>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              const newCurriculum = editingQualification.curriculum.filter((_, i) => i !== unitIdx);
                              setEditingQualification({
                                ...editingQualification,
                                curriculum: newCurriculum
                              });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-foreground mb-1">
                                Unit Title
                              </label>
                              <Input
                                value={unit.unit_title}
                                onChange={(e) => {
                                  const newCurriculum = [...editingQualification.curriculum];
                                  newCurriculum[unitIdx].unit_title = e.target.value;
                                  setEditingQualification({
                                    ...editingQualification,
                                    curriculum: newCurriculum
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-foreground mb-1">
                                Unit Code
                              </label>
                              <Input
                                value={unit.unit_code}
                                onChange={(e) => {
                                  const newCurriculum = [...editingQualification.curriculum];
                                  newCurriculum[unitIdx].unit_code = e.target.value;
                                  setEditingQualification({
                                    ...editingQualification,
                                    curriculum: newCurriculum
                                  });
                                }}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-foreground mb-1">
                                Credits
                              </label>
                              <Input
                                type="number"
                                value={unit.credits}
                                onChange={(e) => {
                                  const newCurriculum = [...editingQualification.curriculum];
                                  newCurriculum[unitIdx].credits = Number(e.target.value);
                                  setEditingQualification({
                                    ...editingQualification,
                                    curriculum: newCurriculum
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-foreground mb-1">
                                Level
                              </label>
                              <Input
                                value={unit.level}
                                onChange={(e) => {
                                  const newCurriculum = [...editingQualification.curriculum];
                                  newCurriculum[unitIdx].level = e.target.value;
                                  setEditingQualification({
                                    ...editingQualification,
                                    curriculum: newCurriculum
                                  });
                                }}
                              />
                            </div>
                          </div>

                          {/* Learning Outcomes */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-xs font-medium text-foreground">
                                Learning Outcomes / Assessment Criteria
                              </label>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const newCurriculum = [...editingQualification.curriculum];
                                  newCurriculum[unitIdx].learning_outcomes = [
                                    ...(newCurriculum[unitIdx].learning_outcomes || []),
                                    ''
                                  ];
                                  setEditingQualification({
                                    ...editingQualification,
                                    curriculum: newCurriculum
                                  });
                                }}
                              >
                                Add Outcome
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {(unit.learning_outcomes || []).map((outcome, outcomeIdx) => (
                                <div key={outcomeIdx} className="flex gap-2">
                                  <Textarea
                                    value={outcome}
                                    onChange={(e) => {
                                      const newCurriculum = [...editingQualification.curriculum];
                                      newCurriculum[unitIdx].learning_outcomes[outcomeIdx] = e.target.value;
                                      setEditingQualification({
                                        ...editingQualification,
                                        curriculum: newCurriculum
                                      });
                                    }}
                                    placeholder="Enter learning outcome..."
                                    className="min-h-[60px] text-sm"
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      const newCurriculum = [...editingQualification.curriculum];
                                      newCurriculum[unitIdx].learning_outcomes = 
                                        newCurriculum[unitIdx].learning_outcomes.filter((_, i) => i !== outcomeIdx);
                                      setEditingQualification({
                                        ...editingQualification,
                                        curriculum: newCurriculum
                                      });
                                    }}
                                  >
                                    ×
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditDialog(false);
                      setEditingQualification(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button variant="contained"
                    onClick={() => {
                      updateQualificationMutation.mutate({
                        qualId: editingQualification.id,
                        data: editingQualification
                      });
                    }}
                    disabled={updateQualificationMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Message Dialog */}
        <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Send Message to {selectedParticipant?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
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
                <Button variant="contained"
                  onClick={() => {
                    if (messageContent.trim() && selectedParticipant) {
                      sendMessageMutation.mutate({
                        recipientEmail: selectedParticipant.email,
                        message: messageContent,
                      });
                    }
                  }}
                  disabled={!messageContent.trim() || sendMessageMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700"
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