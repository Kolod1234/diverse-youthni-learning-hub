import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Generic real-time chat window given a room_id.
 * Used by TutorChat, SessionLiveChat, and CommunityChat.
 */
export default function ChatWindow({ roomId, currentUser, height = 400 }) {
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat-messages', roomId],
    queryFn: () => base44.entities.ChatMessage.filter({ room_id: roomId }, 'created_date', 500),
    enabled: !!roomId,
    refetchInterval: 5000,
  });

  // Real-time subscription
  useEffect(() => {
    if (!roomId) return;
    const unsub = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data?.room_id === roomId) {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', roomId] });
      }
    });
    return unsub;
  }, [roomId, queryClient]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendMutation = useMutation({
    mutationFn: async (content) => {
      // The access rule lets only the room's members read a message, so copy the member list onto it.
      const room = await base44.entities.ChatRoom.get(roomId);
      return base44.entities.ChatMessage.create({
        room_id: roomId,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name,
        sender_avatar: currentUser.avatar,
        content,
        type: 'text',
        participant_emails: room?.participant_emails || [currentUser.email],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', roomId] });
      // Update room's last_message preview
      base44.entities.ChatRoom.update(roomId, {
        last_message: text.trim().substring(0, 80),
        last_message_at: new Date().toISOString(),
      }).catch(() => {});
      setText('');
    },
  });

  const handleSend = () => {
    if (!text.trim() || sendMutation.isPending) return;
    sendMutation.mutate(text.trim());
  };

  return (
    <div className="flex flex-col" style={{ height }}>
      {/* Messages */}
      <ScrollArea className="flex-1 px-3 py-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm gap-2">
            <Send className="w-8 h-8 opacity-30" />
            <span>No messages yet. Start the conversation!</span>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isOwn = msg.sender_email === currentUser?.email;
                return (
                  <motion.div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isOwn && (
                      <Avatar className="w-6 h-6 shrink-0">
                        <AvatarImage src={msg.sender_avatar} />
                        <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">
                          {msg.sender_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[75%]`}>
                      {!isOwn && (
                        <p className="text-xs text-gray-500 mb-0.5 ml-1">{msg.sender_name}</p>
                      )}
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                          isOwn
                            ? 'bg-indigo-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <p className={`text-xs text-gray-400 mt-0.5 ${isOwn ? 'text-right' : 'text-left'} ml-1`}>
                        {format(new Date(msg.created_date), 'h:mm a')}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-2 flex gap-2 items-end shrink-0">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message… (Enter to send)"
          rows={1}
          className="resize-none flex-1 min-h-[36px] max-h-[100px] text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button
          onClick={handleSend}
          disabled={!text.trim() || sendMutation.isPending}
          size="icon"
          className="bg-indigo-600 hover:bg-indigo-700 shrink-0"
        >
          {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}