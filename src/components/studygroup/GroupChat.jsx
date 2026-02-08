import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Pin, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';

export default function GroupChat({ groupId }) {
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: messages = [] } = useQuery({
    queryKey: ['group-messages', groupId],
    queryFn: () => base44.entities.StudyGroupMessage.filter({ group_id: groupId }, '-created_date', 100),
    refetchInterval: 3000
  });

  const sendMutation = useMutation({
    mutationFn: (msg) => base44.entities.StudyGroupMessage.create({
      group_id: groupId,
      message: msg,
      sender_name: user.full_name,
      sender_avatar: user.avatar,
      message_type: 'text'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['group-messages', groupId]);
      setMessage('');
      scrollToBottom();
    }
  });

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMutation.mutate(message);
  };

  return (
    <Card className="flex flex-col h-[500px]">
      <div className="p-4 border-b">
        <h3 className="font-bold">Group Chat</h3>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-3">
          {messages.map((msg) => {
            const isOwn = msg.created_by === user?.email;
            
            return (
              <div key={msg.id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                {!isOwn && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={msg.sender_avatar} />
                    <AvatarFallback>{msg.sender_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}

                <div className={`flex-1 ${isOwn ? 'text-right' : ''}`}>
                  {!isOwn && (
                    <p className="text-xs text-gray-600 mb-1">{msg.sender_name}</p>
                  )}
                  
                  <div className={`inline-block max-w-[80%]`}>
                    {msg.message_type === 'achievement' && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                        <Trophy className="w-4 h-4 text-yellow-600 inline mr-2" />
                        <span className="font-semibold">{msg.message}</span>
                      </div>
                    )}
                    
                    {msg.message_type === 'announcement' && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                        <span className="font-semibold">{msg.message}</span>
                      </div>
                    )}
                    
                    {msg.message_type === 'text' && (
                      <div className={`p-3 rounded-lg ${
                        isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100'
                      }`}>
                        {msg.message}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {moment(msg.created_date).fromNow()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={sendMutation.isPending}
        />
        <Button type="submit" disabled={sendMutation.isPending || !message.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </Card>
  );
}