import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function CoordinatorMessages({ coordinatorEmail, coordinatorName }) {
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [messageText, setMessageText] = useState('');
  const queryClient = useQueryClient();

  const { data: assignedParticipants = [] } = useQuery({
    queryKey: ['assigned-participants', coordinatorEmail],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list('full_name', 1000);
      return allUsers.filter(u => 
        u.assigned_coordinator_email === coordinatorEmail && 
        !u.is_coordinator && 
        !u.is_tutor &&
        u.role !== 'admin'
      );
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data) => {
      const message = await base44.entities.Message.create(data);
      
      // Send notification
      try {
        await base44.functions.invoke('sendNotification', {
          recipient_email: data.recipient_email,
          title: 'New Message from Coordinator',
          message: `Your coordinator has sent you a message`,
          type: 'message',
          link: `/message-center`,
          send_email: true,
        });
      } catch (err) {
        console.error('Failed to send notification:', err);
      }
      
      return message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
      setMessageText('');
      toast.success('Message sent successfully');
    },
  });

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedParticipant) return;

    sendMessageMutation.mutate({
      sender_email: coordinatorEmail,
      sender_name: coordinatorName,
      recipient_email: selectedParticipant.email,
      content: messageText,
      is_read: false,
    });
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Participants List */}
      <div className="md:col-span-1">
        <h3 className="font-semibold text-gray-900 mb-4">Send Message To</h3>
        <div className="space-y-2">
          {assignedParticipants.map((participant) => (
            <Card
              key={participant.email}
              className={`p-3 cursor-pointer transition-all ${
                selectedParticipant?.email === participant.email
                  ? 'ring-2 ring-purple-500 bg-purple-50'
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedParticipant(participant)}
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700">
                    {participant.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate text-sm">
                    {participant.full_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{participant.email}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Message Composer */}
      <div className="md:col-span-2">
        {selectedParticipant ? (
          <Card className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedParticipant.avatar} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700">
                    {selectedParticipant.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedParticipant.full_name}
                  </p>
                  <p className="text-sm text-gray-500">{selectedParticipant.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                rows={8}
                className="resize-none"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || sendMessageMutation.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Select a participant to send a message</p>
          </Card>
        )}
      </div>
    </div>
  );
}