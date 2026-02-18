import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AdminStudentMessages() {
  const [user, setUser] = useState(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState({
    subject: '',
    body: ''
  });

  React.useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const queryClient = useQueryClient();

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!user && (user.role === 'admin' || user.is_tutor)
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: () => base44.asServiceRole.entities.Enrollment.list('-created_date', 1000),
    enabled: !!user && (user.role === 'admin' || user.is_tutor)
  });

  const sendMutation = useMutation({
    mutationFn: async (data) => {
      return base44.functions.invoke('sendDirectMessage', {
        studentEmail: data.studentEmail,
        subject: data.subject,
        body: data.body
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
      queryClient.invalidateQueries(['sent-messages']);
      toast.success('Message sent successfully');
      setMessage({ subject: '', body: '' });
      setSelectedStudent(null);
      setShowMessageDialog(false);
    },
    onError: (error) => toast.error('Failed to send message')
  });

  if (!user || (user.role !== 'admin' && !user.is_tutor)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Only administrators and teachers can access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get students (filter by role 'user') or those enrolled in courses
  const students = allUsers
    .filter(u => u.role === 'user')
    .filter(u => searchQuery === '' || u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSendMessage = () => {
    if (!selectedStudent || !message.subject || !message.body) {
      toast.error('Please fill in all fields');
      return;
    }

    sendMutation.mutate({
      studentEmail: selectedStudent.email,
      subject: message.subject,
      body: message.body
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-primary" />
              Send Student Messages
            </h1>
            <p className="text-muted-foreground mt-2">Send individual messages to students directly</p>
          </div>
        </div>

        {/* Message Dialog */}
        <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Send Message to {selectedStudent?.full_name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">To</label>
                <input
                  type="text"
                  disabled
                  value={selectedStudent?.email || ''}
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Subject *</label>
                <Input
                  value={message.subject}
                  onChange={(e) => setMessage({ ...message, subject: e.target.value })}
                  placeholder="Message subject..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Message *</label>
                <textarea
                  value={message.body}
                  onChange={(e) => setMessage({ ...message, body: e.target.value })}
                  placeholder="Write your message here..."
                  rows={8}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendMessage}
                disabled={sendMutation.isPending}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Send Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students by name or email..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Students List */}
        <div className="grid gap-4">
          {students.length > 0 ? (
            students.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <p className="font-semibold text-foreground">{student.full_name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedStudent(student);
                        setMessage({ subject: '', body: '' });
                        setShowMessageDialog(true);
                      }}
                      className="gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Send Message
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Students Found</CardTitle>
                <CardDescription>Try adjusting your search</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}