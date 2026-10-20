import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Box, Container, Typography, Card, Chip, TextField, IconButton,
  Avatar, Badge, Button
} from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
const _w = (I) => ({ size, color, style, ...r }) => <I style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const MessageCircle = _w(ChatBubbleOutlineIcon), Send = _w(SendIcon), Bot = _w(SmartToyIcon);
const HeadphonesIcon = _w(HeadsetMicIcon), CheckCircle = _w(CheckCircleIcon), RefreshCw = _w(RefreshIcon);
import { formatDistanceToNow } from 'date-fns';

export default function AdminSupportChats() {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const bottomRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setAdminUser).catch(() => {});
  }, []);

  const { data: chats = [] } = useQuery({
    queryKey: ['support-chats-admin'],
    queryFn: () => base44.entities.SupportChat.list('-last_message_at', 100),
    refetchInterval: 5000,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['support-messages-admin', selectedChatId],
    queryFn: () => base44.entities.SupportMessage.filter({ chat_id: selectedChatId }, 'created_date', 200),
    enabled: !!selectedChatId,
    refetchInterval: 3000,
  });

  // Real-time subscriptions for messages and new chats
  useEffect(() => {
    const unsubMsg = base44.entities.SupportMessage.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['support-messages-admin', selectedChatId] });
      queryClient.invalidateQueries({ queryKey: ['support-chats-admin'] });
    });
    const unsubChat = base44.entities.SupportChat.subscribe((event) => {
      queryClient.invalidateQueries({ queryKey: ['support-chats-admin'] });
      // Browser notification for new live agent requests
      if (event.type === 'update' && event.data?.status === 'live_agent' && event.data?.live_agent_requested) {
        if (Notification.permission === 'granted') {
          new Notification('🔴 Live Agent Requested', {
            body: `${event.data.user_name || 'A user'} needs a live agent. Click to open Support Chats.`,
            icon: '/favicon.ico'
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(perm => {
            if (perm === 'granted') {
              new Notification('🔴 Live Agent Requested', {
                body: `${event.data.user_name || 'A user'} needs a live agent.`,
                icon: '/favicon.ico'
              });
            }
          });
        }
      }
    });
    return () => { unsubMsg(); unsubChat(); };
  }, [selectedChatId, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark as read when opening a chat
  useEffect(() => {
    if (!selectedChatId) return;
    base44.entities.SupportChat.update(selectedChatId, { unread_admin: false });
    queryClient.invalidateQueries({ queryKey: ['support-chats-admin'] });
  }, [selectedChatId]);

  const handleSend = async () => {
    if (!reply.trim() || !selectedChatId || sending) return;
    const text = reply.trim();
    setReply('');
    setSending(true);

    // If this is the first agent reply, notify the user
    const chat = chats.find(c => c.id === selectedChatId);
    const wasLiveAgent = chat?.status === 'live_agent';

    await base44.entities.SupportMessage.create({
      chat_id: selectedChatId,
      sender_role: 'agent',
      sender_name: adminUser?.full_name || 'Support Agent',
      content: text,
      user_email: chat?.user_email
    });

    await base44.entities.SupportChat.update(selectedChatId, {
      last_message: text.substring(0, 100),
      last_message_at: new Date().toISOString(),
      unread_user: true,
      status: 'open'
    });

    // Send user a notification that an agent has joined
    if (wasLiveAgent && chat?.user_email) {
      await base44.entities.Notification.create({
        recipient_email: chat.user_email,
        title: '✅ Support Agent Connected',
        message: `${adminUser?.full_name || 'A support agent'} has joined your chat and replied.`,
        type: 'live_agent',
        is_read: false,
      }).catch(() => {});
    }

    queryClient.invalidateQueries({ queryKey: ['support-messages-admin', selectedChatId] });
    queryClient.invalidateQueries({ queryKey: ['support-chats-admin'] });
    setSending(false);
  };

  const handleClose = async (chatId) => {
    const chat = chats.find(c => c.id === chatId);
    await base44.entities.SupportChat.update(chatId, { status: 'closed' });

    // Notify user their chat was closed by an agent
    if (chat?.user_email) {
      await base44.entities.Notification.create({
        recipient_email: chat.user_email,
        title: '💬 Chat Ended',
        message: 'Your support chat has been closed by an agent. Open a new chat if you need further help.',
        type: 'support',
        is_read: false,
      }).catch(() => {});
    }

    queryClient.invalidateQueries({ queryKey: ['support-chats-admin'] });
  };

  const selectedChat = chats.find(c => c.id === selectedChatId);

  const statusColor = { open: 'warning', closed: 'default', bot: 'info', live_agent: 'error' };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <HeadphonesIcon size={28} color="#0b2f5c" />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" fontWeight={700}>Support Chats</Typography>
            {chats.filter(c => c.status === 'live_agent').length > 0 && (
              <Chip
                label={`🔴 ${chats.filter(c => c.status === 'live_agent').length} Live Agent`}
                color="error"
                size="small"
                sx={{ fontWeight: 700, animation: 'pulse 2s infinite' }}
              />
            )}
            {chats.filter(c => c.unread_admin).length > 0 && (
              <Chip
                label={`${chats.filter(c => c.unread_admin).length} unread`}
                color="warning"
                size="small"
              />
            )}
          </Box>
          <Typography color="text.secondary">Manage live support conversations with users</Typography>
        </Box>
        <Button
          size="small"
          startIcon={<RefreshCw size={14} />}
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['support-chats-admin'] });
            if (selectedChatId) queryClient.invalidateQueries({ queryKey: ['support-messages-admin', selectedChatId] });
          }}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Refresh
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '320px 1fr' }, gap: 2, height: '70vh' }}>
        {/* Chat List */}
        <Card sx={{ overflow: 'auto' }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
              CONVERSATIONS ({chats.length})
            </Typography>
          </Box>
          {chats.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <MessageCircle size={40} color="#d1d5db" style={{ margin: '0 auto 8px' }} />
              <Typography color="text.secondary" variant="body2">No support chats yet</Typography>
            </Box>
          ) : (
            chats.map(chat => (
              <Box
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                sx={{
                  px: 2, py: 1.5, cursor: 'pointer', borderBottom: '1px solid', borderColor: 'divider',
                  bgcolor: selectedChatId === chat.id ? 'primary.main' + '10' : 'transparent',
                  borderLeft: selectedChatId === chat.id ? '3px solid #003366' : '3px solid transparent',
                  '&:hover': { bgcolor: 'action.hover' }, transition: 'all 0.15s'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Badge variant="dot" color="error" invisible={!chat.unread_admin}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#0b2f5c', fontSize: 13 }}>
                        {(chat.user_name || chat.user_email)?.[0]?.toUpperCase()}
                      </Avatar>
                    </Badge>
                    <Box>
                      <Typography variant="body2" fontWeight={chat.unread_admin ? 700 : 500} noWrap sx={{ maxWidth: 150 }}>
                        {chat.user_name || chat.user_email}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip 
                    label={chat.status === 'live_agent' ? '🔴 Live Agent' : chat.status} 
                    size="small" 
                    color={statusColor[chat.status] || 'default'} 
                    sx={{ fontSize: 10, height: 18, fontWeight: chat.status === 'live_agent' ? 700 : 400 }} 
                  />
                </Box>
                {chat.last_message && (
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', pl: 5 }}>
                    {chat.last_message}
                  </Typography>
                )}
                {chat.last_message_at && (
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', pl: 5, fontSize: 10 }}>
                    {formatDistanceToNow(new Date(chat.last_message_at), { addSuffix: true })}
                  </Typography>
                )}
              </Box>
            ))
          )}
        </Card>

        {/* Chat Window */}
        <Card sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selectedChatId ? (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2, opacity: 0.4 }}>
              <MessageCircle size={56} />
              <Typography>Select a conversation to reply</Typography>
            </Box>
          ) : (
            <>
              {/* Chat Header */}
              <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#0b2f5c', width: 36, height: 36 }}>
                    {(selectedChat?.user_name || selectedChat?.user_email)?.[0]?.toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography fontWeight={700}>{selectedChat?.user_name || 'User'}</Typography>
                    <Typography variant="caption" color="text.secondary">{selectedChat?.user_email}</Typography>
                  </Box>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  color={selectedChat?.status === 'closed' ? 'inherit' : 'success'}
                  startIcon={<CheckCircle size={14} />}
                  onClick={() => handleClose(selectedChatId)}
                  disabled={selectedChat?.status === 'closed'}
                >
                  {selectedChat?.status === 'closed' ? 'Closed' : 'Close Chat'}
                </Button>
              </Box>

              {/* Messages */}
              <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: 'action.hover' }}>
                {messages.map((msg, i) => {
                  const isUser = msg.sender_role === 'user';
                  const isBot = msg.sender_role === 'bot';
                  return (
                    <Box key={msg.id || i} sx={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 1 }}>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: isUser ? '#64748b' : isBot ? '#6366f1' : '#0b2f5c', fontSize: 12, flexShrink: 0 }}>
                        {isBot ? <Bot size={14} /> : isUser ? msg.sender_name?.[0] || 'U' : 'A'}
                      </Avatar>
                      <Box sx={{ maxWidth: '65%' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25, textAlign: isUser ? 'right' : 'left' }}>
                          {msg.sender_name || (isBot ? 'Bot' : 'Agent')}
                        </Typography>
                        <Box sx={{
                          px: 1.5, py: 1, borderRadius: isUser ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                          bgcolor: isUser ? '#e2e8f0' : isBot ? '#eef2ff' : '#0b2f5c',
                          color: isUser || isBot ? '#1e293b' : 'white',
                          fontSize: 13, lineHeight: 1.5
                        }}>
                          {msg.content}
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
                <div ref={bottomRef} />
              </Box>

              {/* Reply Box */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1, flexShrink: 0 }}>
                <TextField
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Type your reply as a support agent..."
                  size="small"
                  fullWidth
                  disabled={selectedChat?.status === 'closed'}
                  multiline
                  maxRows={3}
                />
                <IconButton
                  onClick={handleSend}
                  disabled={!reply.trim() || sending || selectedChat?.status === 'closed'}
                  sx={{ bgcolor: '#0b2f5c', color: 'white', '&:hover': { bgcolor: '#12396b' }, '&:disabled': { bgcolor: '#e2e8f0' }, borderRadius: 2, flexShrink: 0 }}
                >
                  <Send size={18} />
                </IconButton>
              </Box>
            </>
          )}
        </Card>
      </Box>
    </Container>
  );
}