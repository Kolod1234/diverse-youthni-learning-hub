import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, TextField, Button, Avatar, Typography, IconButton, Chip } from '@mui/material';
import { Send, Pin, Reply, Smile, Paperclip } from 'lucide-react';
import { toast } from 'sonner';

export default function RealTimeChatPanel({ sessionId, user }) {
  const queryClient = useQueryClient();
  const chatEndRef = useRef(null);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const { data: messages = [] } = useQuery({
    queryKey: ['session-chat', sessionId],
    queryFn: () => base44.entities.SessionChat.filter({ session_id: sessionId }, 'created_date', 200),
    refetchInterval: 3000 // Poll every 3 seconds for real-time feel
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = base44.entities.SessionChat.subscribe((event) => {
      if (event.data.session_id === sessionId) {
        queryClient.invalidateQueries(['session-chat', sessionId]);
      }
    });

    return unsubscribe;
  }, [sessionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      return await base44.entities.SessionChat.create(messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['session-chat']);
      setNewMessage('');
      setReplyingTo(null);
    }
  });

  const pinMessageMutation = useMutation({
    mutationFn: async (messageId) => {
      const message = messages.find(m => m.id === messageId);
      return await base44.entities.SessionChat.update(messageId, {
        is_pinned: !message.is_pinned
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['session-chat']);
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    sendMessageMutation.mutate({
      session_id: sessionId,
      sender_email: user.email,
      sender_name: user.full_name,
      message: newMessage,
      replied_to: replyingTo?.id,
      message_type: 'text'
    });
  };

  const pinnedMessages = messages.filter(m => m.is_pinned);
  const regularMessages = messages.filter(m => !m.is_pinned);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Pinned Messages */}
      {pinnedMessages.length > 0 && (
        <Box sx={{ p: 2, bgcolor: 'warning.light', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="caption" fontWeight="bold" sx={{ mb: 1, display: 'block' }}>
            📌 Pinned Messages
          </Typography>
          {pinnedMessages.map(msg => (
            <Typography key={msg.id} variant="body2" sx={{ mb: 0.5 }}>
              {msg.sender_name}: {msg.message}
            </Typography>
          ))}
        </Box>
      )}

      {/* Messages Area */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {regularMessages.map((msg) => {
          const repliedMsg = msg.replied_to ? messages.find(m => m.id === msg.replied_to) : null;
          
          return (
            <Box key={msg.id} sx={{ mb: 2 }}>
              {repliedMsg && (
                <Box sx={{ ml: 4, mb: 0.5, pl: 2, borderLeft: 2, borderColor: 'grey.300' }}>
                  <Typography variant="caption" color="text.secondary">
                    Replying to {repliedMsg.sender_name}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {msg.sender_name?.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {msg.sender_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                  <Typography variant="body2">{msg.message}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Button
                      size="small"
                      onClick={() => setReplyingTo(msg)}
                      sx={{ minWidth: 'auto', p: 0.5, fontSize: '0.7rem' }}
                    >
                      <Reply className="w-3 h-3 mr-0.5" />
                      Reply
                    </Button>
                    <Button
                      size="small"
                      onClick={() => pinMessageMutation.mutate(msg.id)}
                      sx={{ minWidth: 'auto', p: 0.5, fontSize: '0.7rem' }}
                    >
                      <Pin className="w-3 h-3 mr-0.5" />
                      {msg.is_pinned ? 'Unpin' : 'Pin'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        })}
        <div ref={chatEndRef} />
      </Box>

      {/* Reply Preview */}
      {replyingTo && (
        <Box sx={{ px: 2, py: 1, bgcolor: 'grey.100', borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption">
              Replying to {replyingTo.sender_name}
            </Typography>
            <Button size="small" onClick={() => setReplyingTo(null)}>Cancel</Button>
          </Box>
        </Box>
      )}

      {/* Input Area */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            fullWidth
            multiline
            maxRows={3}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={sendMessageMutation.isPending}
            sx={{ minWidth: 'auto', px: 2 }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </Box>
      </Box>
    </Box>
  );
}