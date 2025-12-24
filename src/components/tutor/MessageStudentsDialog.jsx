import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Users } from 'lucide-react';
import { toast } from 'sonner';
import AIMessageAssistant from './AIMessageAssistant';

export default function MessageStudentsDialog({ open, onOpenChange, courseId, courseName }) {
  const [message, setMessage] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const queryClient = useQueryClient();

  const { data: enrollments = [] } = useQuery({
    queryKey: ['course-enrollments', courseId],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: courseId }),
    enabled: !!courseId && open,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
    enabled: open,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
    enabled: open,
  });

  const students = enrollments
    .map(e => users.find(u => u.email === e.created_by))
    .filter(Boolean);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ recipients, content }) => {
      const promises = recipients.map(email =>
        base44.entities.Message.create({
          course_id: courseId,
          sender_email: currentUser?.email,
          sender_name: currentUser?.full_name,
          recipient_email: email,
          content,
          is_read: false,
        })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
      toast.success('Messages sent successfully!');
      setMessage('');
      setSelectedStudents([]);
      setSelectAll(false);
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Failed to send messages');
      console.error(error);
    },
  });

  const handleToggleStudent = (email) => {
    setSelectedStudents(prev =>
      prev.includes(email)
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    setSelectedStudents(checked ? students.map(s => s.email) : []);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    sendMessageMutation.mutate({
      recipients: selectedStudents,
      content: message,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            Message Students
          </DialogTitle>
          <DialogDescription>
            Send a message to students enrolled in {courseName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
          <AIMessageAssistant
            onInsertText={(text) => setMessage(text)}
            courseName={courseName}
            courseId={courseId}
          />

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <Label>Recipients ({selectedStudents.length} selected)</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm text-gray-600 cursor-pointer">
                  Select All
                </label>
              </div>
            </div>

            <ScrollArea className="flex-1 border rounded-lg p-4 bg-gray-50">
              <div className="space-y-2">
                {students.map((student) => (
                  <div
                    key={student.email}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 transition-all"
                  >
                    <Checkbox
                      id={student.email}
                      checked={selectedStudents.includes(student.email)}
                      onCheckedChange={() => handleToggleStudent(student.email)}
                    />
                    <label
                      htmlFor={student.email}
                      className="flex-1 cursor-pointer"
                    >
                      <p className="font-medium text-gray-900">{student.full_name}</p>
                      <p className="text-xs text-gray-500">{student.email}</p>
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sendMessageMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={sendMessageMutation.isPending || selectedStudents.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {sendMessageMutation.isPending ? (
                'Sending...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send to {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}