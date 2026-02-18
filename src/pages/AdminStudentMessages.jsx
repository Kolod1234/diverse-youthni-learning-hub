import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Search, Send, Mail, Loader2, CheckCircle, X, History, Eye, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function AdminStudentMessages() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('compose');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(null);
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getMessageableUsers', {});
      return response.data;
    },
    enabled: !!user && (user.role === 'admin' || user.is_tutor),
  });

  const { data: sentMessages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['sent-messages', user?.email],
    queryFn: () => base44.entities.Message.filter({ sender_email: user?.email }, '-created_date', 500),
    enabled: !!user?.email && activeTab === 'history',
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ studentEmail }) => {
      return await base44.functions.invoke('sendDirectMessage', {
        studentEmail,
        subject,
        body: message,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
      queryClient.invalidateQueries(['sent-messages']);
    },
  });

  const handleSendToSelected = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Please enter subject and message');
      return;
    }
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    const promises = selectedStudents.map(email =>
      sendMessageMutation.mutateAsync({ studentEmail: email })
    );

    try {
      await Promise.all(promises);
      toast.success(`Message sent to ${selectedStudents.length} student(s)`);
      setSelectedStudents([]);
      setSubject('');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send some messages');
    }
  };

  const toggleStudent = (email) => {
    setSelectedStudents(prev =>
      prev.includes(email)
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const filteredStudents = allUsers.filter(s =>
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user || (user.role !== 'admin' && !user.is_tutor)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6">
          <p className="text-gray-600">Access denied. Only admins and tutors can send student messages.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Send Student Messages</h1>
          <p className="text-gray-500">Send direct messages to students individually or in bulk</p>
          
          <div className="flex gap-2 mt-4">
            <Button
              variant={activeTab === 'compose' ? 'default' : 'outline'}
              onClick={() => setActiveTab('compose')}
              className={activeTab === 'compose' ? 'bg-indigo-600' : ''}
            >
              <Send className="w-4 h-4 mr-2" />
              Compose
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'outline'}
              onClick={() => setActiveTab('history')}
              className={activeTab === 'history' ? 'bg-indigo-600' : ''}
            >
              <History className="w-4 h-4 mr-2" />
              Message History
            </Button>
          </div>
        </div>

        {activeTab === 'compose' ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Student List */}
          <Card className="lg:col-span-1">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  <h2 className="font-semibold text-gray-900">Students</h2>
                </div>
                {selectedStudents.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{selectedStudents.length} selected</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedStudents([])}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students..."
                  className="pl-9"
                />
              </div>
            </div>

            <ScrollArea className="h-[600px]">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="divide-y">
                  {filteredStudents.map((student) => {
                    const isSelected = selectedStudents.includes(student.email);
                    return (
                      <motion.div
                        key={student.email}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => toggleStudent(student.email)}
                        className={`p-4 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-indigo-50 border-l-4 border-indigo-600'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-indigo-100 text-indigo-600">
                              {student.full_name?.charAt(0) || 'S'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 truncate">
                                {student.full_name || 'Student'}
                              </p>
                              {isSelected && (
                                <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">{student.email}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      No students found
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Message Composer */}
          <Card className="lg:col-span-2">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Compose Message</h2>
                <p className="text-sm text-gray-500">
                  {selectedStudents.length === 0
                    ? 'Select students from the list to send a message'
                    : `Sending to ${selectedStudents.length} student(s)`}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter message subject..."
                    className="text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="min-h-[400px] text-base"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    You can use **bold** and basic markdown formatting
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubject('');
                      setMessage('');
                      setSelectedStudents([]);
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleSendToSelected}
                    disabled={
                      !subject.trim() ||
                      !message.trim() ||
                      selectedStudents.length === 0 ||
                      sendMessageMutation.isPending
                    }
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {sendMessageMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Preview */}
              {(subject || message) && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {subject && (
                      <p className="font-semibold text-gray-900 mb-2">{subject}</p>
                    )}
                    {message && (
                      <p className="text-gray-700 whitespace-pre-wrap text-sm">{message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
        ) : (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Message History</h2>
                <p className="text-sm text-gray-500">View all messages you have sent</p>
              </div>
              <div className="text-sm text-gray-500">
                {sentMessages.length} message{sentMessages.length !== 1 ? 's' : ''}
              </div>
            </div>

            {messagesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : sentMessages.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No messages sent yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {sentMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedMessage(msg)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <Avatar className="w-10 h-10 shrink-0">
                            <AvatarFallback className="bg-indigo-100 text-indigo-600">
                              {msg.recipient_email?.charAt(0)?.toUpperCase() || 'R'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-900">To: {msg.recipient_email}</p>
                            </div>
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              Subject: {msg.content.split('\n')[0].substring(0, 60)}
                              {msg.content.split('\n')[0].length > 60 ? '...' : ''}
                            </p>
                            <p className="text-sm text-gray-500 truncate">{msg.content}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {format(new Date(msg.created_date), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </Card>
        )}

        {/* Message Detail Dialog */}
        <Dialog open={!!selectedMessage} onClose={() => setSelectedMessage(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Message Details</DialogTitle>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">To:</label>
                  <p className="text-gray-900">{selectedMessage.recipient_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Sent:</label>
                  <p className="text-gray-900">
                    {format(new Date(selectedMessage.created_date), 'MMMM d, yyyy h:mm a')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Message:</label>
                  <div className="mt-2 bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.content}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setSelectedMessage(null)}>Close</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}