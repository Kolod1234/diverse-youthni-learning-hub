import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  MessageSquare, Send, Search, Mail, ArrowLeft, Sparkles, 
  Loader2, FileText, PlusCircle, Smile, Bell, AlertCircle, 
  Calendar, GraduationCap, CheckCheck, Circle
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

function formatMessageTime(date) {
  const d = new Date(date);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
}

function getParticipantLabel(u) {
  if (u.role === 'admin') return 'Admin';
  if (u.is_coordinator) return 'Coordinator';
  if (u.is_tutor) return 'Tutor';
  return 'Student';
}

export default function MessageCenter() {
  const [user, setUser] = useState(null);
  const [selectedContactEmail, setSelectedContactEmail] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [newMessageRecipient, setNewMessageRecipient] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [viewMode, setViewMode] = useState('messages');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const emojis = ['😊', '👍', '❤️', '😂', '🎉', '👏', '🔥', '💯', '✅', '🙏', '💪', '🎯', '📚', '✨', '🌟', '💡'];

  // Load user
  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  // Parse URL params for deep-linking from tutor profiles
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const recipient = params.get('recipient');
    if (recipient) {
      setSelectedContactEmail(recipient);
    }
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    if (!user?.email) return;
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.recipient_email === user.email || event.data?.sender_email === user.email) {
        queryClient.invalidateQueries({ queryKey: ['messages', user.email] });
        if (event.type === 'create' && event.data.recipient_email === user.email) {
          toast.info(`New message from ${event.data.sender_name}`);
        }
      }
    });
    const unsubN = base44.entities.Notification.subscribe((event) => {
      if (event.data?.user_email === user.email) {
        queryClient.invalidateQueries({ queryKey: ['notifications', user.email] });
      }
    });
    return () => { unsub(); unsubN(); };
  }, [user?.email, queryClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedContactEmail]);

  const { data: receivedMessages = [] } = useQuery({
    queryKey: ['messages', user?.email, 'received'],
    queryFn: () => base44.entities.Message.filter({ recipient_email: user.email }, '-created_date', 200),
    enabled: !!user?.email,
    refetchInterval: 10000,
  });

  const { data: sentMessages = [] } = useQuery({
    queryKey: ['messages', user?.email, 'sent'],
    queryFn: () => base44.entities.Message.filter({ sender_email: user.email }, '-created_date', 200),
    enabled: !!user?.email,
    refetchInterval: 10000,
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['messageable-users', user?.email],
    queryFn: async () => {
      const res = await base44.functions.invoke('getMessageableUsers', {});
      return res.data || [];
    },
    enabled: !!user,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email }, '-created_date', 100),
    enabled: !!user?.email,
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Message.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages', user?.email] }),
  });

  const markNotifReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', user?.email] }),
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ recipientEmail, content }) => {
      const recipient = allUsers.find(u => u.email === recipientEmail);
      const msg = await base44.entities.Message.create({
        sender_email: user.email,
        sender_name: user.full_name,
        sender_avatar: user.avatar,
        recipient_email: recipientEmail,
        content,
        is_read: false,
      });
      // Notification (fire and forget)
      base44.entities.Notification.create({
        user_email: recipientEmail,
        title: 'New Message',
        message: `You have a new message from ${user.full_name}`,
        type: 'message',
        link: '/MessageCenter',
      }).catch(() => {});
      return msg;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', user?.email] });
      setReplyText('');
      setNewMessageContent('');
      setShowNewMessageDialog(false);
      setNewMessageRecipient('');
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    },
    onError: () => toast.error('Failed to send message'),
  });

  const suggestReplyMutation = useMutation({
    mutationFn: async (lastMsg) => {
      return base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful assistant. Generate a short, professional, friendly reply (2-3 sentences) to this message:\n\n"${lastMsg}"\n\nReply:`,
      });
    },
    onSuccess: (data) => {
      setReplyText(data);
      toast.success('Reply suggestion generated!');
    },
  });

  // Build conversation threads from all messages
  const allMessages = [...receivedMessages, ...sentMessages];

  const conversations = allMessages.reduce((acc, msg) => {
    const contactEmail = msg.sender_email === user?.email ? msg.recipient_email : msg.sender_email;
    if (!acc[contactEmail]) {
      acc[contactEmail] = { contactEmail, messages: [], unread: 0 };
    }
    acc[contactEmail].messages.push(msg);
    if (!msg.is_read && msg.recipient_email === user?.email) {
      acc[contactEmail].unread++;
    }
    return acc;
  }, {});

  // For any contact from URL params that has no messages yet, create an empty thread
  if (selectedContactEmail && !conversations[selectedContactEmail]) {
    const contactUser = allUsers.find(u => u.email === selectedContactEmail);
    if (contactUser) {
      conversations[selectedContactEmail] = { contactEmail: selectedContactEmail, messages: [], unread: 0 };
    }
  }

  const sortedConversations = Object.values(conversations)
    .map(conv => {
      const sorted = [...conv.messages].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      const lastMsg = sorted[sorted.length - 1];
      const contactUser = allUsers.find(u => u.email === conv.contactEmail);
      return { ...conv, messages: sorted, lastMsg, contactUser };
    })
    .sort((a, b) => {
      if (!a.lastMsg) return 1;
      if (!b.lastMsg) return -1;
      return new Date(b.lastMsg.created_date) - new Date(a.lastMsg.created_date);
    })
    .filter(conv => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const name = conv.contactUser?.full_name || conv.contactEmail;
      return name.toLowerCase().includes(q) || conv.lastMsg?.content?.toLowerCase().includes(q);
    });

  const selectedConv = sortedConversations.find(c => c.contactEmail === selectedContactEmail)
    || (selectedContactEmail
      ? { contactEmail: selectedContactEmail, messages: [], unread: 0, contactUser: allUsers.find(u => u.email === selectedContactEmail) }
      : null);

  const handleSelectConv = (conv) => {
    setSelectedContactEmail(conv.contactEmail);
    // Mark unread as read
    conv.messages
      .filter(m => m.recipient_email === user?.email && !m.is_read)
      .forEach(m => markAsReadMutation.mutate(m.id));
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedContactEmail) return;
    sendMessageMutation.mutate({ recipientEmail: selectedContactEmail, content: replyText });
  };

  const handleSendNew = () => {
    if (!newMessageContent.trim() || !newMessageRecipient) {
      toast.error('Please select a recipient and enter a message');
      return;
    }
    sendMessageMutation.mutate({ recipientEmail: newMessageRecipient, content: newMessageContent });
    setSelectedContactEmail(newMessageRecipient);
  };

  const unreadCount = receivedMessages.filter(m => !m.is_read).length;
  const unreadNotifCount = notifications.filter(n => !n.is_read).length;

  const notificationIcons = {
    session_reminder: Calendar,
    session_started: Calendar,
    session_cancelled: AlertCircle,
    quiz: FileText,
    logbook: FileText,
    program: GraduationCap,
    message: MessageSquare,
    general: Bell,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-1">Message Center</h1>
          <p className="text-muted-foreground mb-4">Direct messaging with tutors, coordinators and students</p>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'messages' ? 'default' : 'outline'}
              onClick={() => setViewMode('messages')}
              className={viewMode === 'messages' ? 'bg-indigo-600' : ''}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
              {unreadCount > 0 && <Badge className="ml-2 bg-red-500 text-white">{unreadCount}</Badge>}
            </Button>
            <Button
              variant={viewMode === 'notifications' ? 'default' : 'outline'}
              onClick={() => setViewMode('notifications')}
              className={viewMode === 'notifications' ? 'bg-indigo-600' : ''}
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
              {unreadNotifCount > 0 && <Badge className="ml-2 bg-red-500 text-white">{unreadNotifCount}</Badge>}
            </Button>
          </div>
        </div>

        {viewMode === 'messages' ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Conversation List */}
            <Card className="lg:col-span-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                    <h2 className="font-semibold text-foreground">Conversations</h2>
                    {unreadCount > 0 && <Badge className="bg-red-500 text-white">{unreadCount}</Badge>}
                  </div>
                  <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        <PlusCircle className="w-4 h-4 mr-1" /> New
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>New Message</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">To:</label>
                          <select
                            value={newMessageRecipient}
                            onChange={(e) => setNewMessageRecipient(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg bg-background"
                            disabled={usersLoading}
                          >
                            <option value="">{usersLoading ? 'Loading...' : 'Select recipient...'}</option>
                            {allUsers.map(u => (
                              <option key={u.email} value={u.email}>
                                {u.full_name} — {getParticipantLabel(u)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Message:</label>
                          <Textarea
                            value={newMessageContent}
                            onChange={(e) => setNewMessageContent(e.target.value)}
                            placeholder="Type your message..."
                            className="min-h-[120px]"
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendNew(); }}}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowNewMessageDialog(false)}>Cancel</Button>
                          <Button onClick={handleSendNew} disabled={sendMessageMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
                            {sendMessageMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                            Send
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="pl-9"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1 h-[580px]">
                {sortedConversations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No conversations yet.<br />Start one by clicking <strong>New</strong>.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {sortedConversations.map((conv) => {
                      const name = conv.contactUser?.full_name || conv.contactEmail;
                      const role = conv.contactUser ? getParticipantLabel(conv.contactUser) : '';
                      const isSelected = selectedContactEmail === conv.contactEmail;
                      return (
                        <motion.div
                          key={conv.contactEmail}
                          onClick={() => handleSelectConv(conv)}
                          className={`p-4 cursor-pointer transition-colors ${
                            isSelected ? 'bg-indigo-50 dark:bg-indigo-500/15 border-l-4 border-indigo-600' : 'hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative shrink-0">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={conv.contactUser?.avatar} />
                                <AvatarFallback className="bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold">
                                  {name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              {conv.unread > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                  {conv.unread}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className={`font-medium text-sm truncate ${conv.unread > 0 ? 'text-foreground' : 'text-foreground'}`}>
                                  {name}
                                </p>
                                {conv.lastMsg && (
                                  <span className="text-xs text-gray-400 shrink-0 ml-1">
                                    {formatMessageTime(conv.lastMsg.created_date)}
                                  </span>
                                )}
                              </div>
                              {role && <p className="text-xs text-indigo-500 mb-0.5">{role}</p>}
                              {conv.lastMsg && (
                                <p className={`text-xs truncate ${conv.unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                  {conv.lastMsg.sender_email === user?.email ? 'You: ' : ''}{conv.lastMsg.content}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </Card>

            {/* Chat Window */}
            <Card className="lg:col-span-2 flex flex-col overflow-hidden" style={{ height: '680px' }}>
              {selectedConv ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b flex items-center gap-3 shrink-0 bg-card">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedContactEmail(null)}
                      className="lg:hidden shrink-0"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarImage src={selectedConv.contactUser?.avatar} />
                      <AvatarFallback className="bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold">
                        {(selectedConv.contactUser?.full_name || selectedConv.contactEmail).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">
                        {selectedConv.contactUser?.full_name || selectedConv.contactEmail}
                      </p>
                      {selectedConv.contactUser && (
                        <p className="text-xs text-indigo-500">{getParticipantLabel(selectedConv.contactUser)}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const lastMsg = selectedConv.messages[selectedConv.messages.length - 1];
                        if (lastMsg) suggestReplyMutation.mutate(lastMsg.content);
                      }}
                      disabled={suggestReplyMutation.isPending || selectedConv.messages.length === 0}
                    >
                      {suggestReplyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
                      Suggest Reply
                    </Button>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {selectedConv.messages.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                          <p className="text-sm">No messages yet. Say hello!</p>
                        </div>
                      )}
                      {selectedConv.messages.map((msg) => {
                        const isOwn = msg.sender_email === user?.email;
                        return (
                          <motion.div
                            key={msg.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isOwn && (
                              <Avatar className="w-7 h-7 mr-2 shrink-0 self-end">
                                <AvatarImage src={msg.sender_avatar} />
                                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                  {msg.sender_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className="max-w-[70%]">
                              <div className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm whitespace-pre-wrap leading-relaxed ${
                                isOwn
                                  ? 'bg-indigo-600 text-white rounded-br-sm'
                                  : 'bg-muted text-foreground rounded-bl-sm'
                              }`}>
                                {msg.content}
                              </div>
                              <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-xs text-gray-400">
                                  {format(new Date(msg.created_date), 'h:mm a')}
                                </span>
                                {isOwn && (
                                  <CheckCheck className={`w-3 h-3 ${msg.is_read ? 'text-indigo-400' : 'text-gray-300'}`} />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <div className="p-3 border-t bg-card shrink-0">
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="flex flex-wrap gap-1.5 p-3 bg-muted rounded-lg border mb-2"
                        >
                          {emojis.map(e => (
                            <button key={e} onClick={() => { setReplyText(prev => prev + e); setShowEmojiPicker(false); }} className="text-xl hover:scale-125 transition-transform">
                              {e}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="flex gap-2 items-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowEmojiPicker(p => !p)}
                        className="shrink-0 text-gray-400 hover:text-gray-600"
                      >
                        <Smile className="w-5 h-5" />
                      </Button>
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type a message… (Enter to send)"
                        rows={1}
                        className="resize-none flex-1 min-h-[40px] max-h-[120px]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendReply();
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || sendMessageMutation.isPending}
                        size="icon"
                        className="bg-indigo-600 hover:bg-indigo-700 shrink-0"
                      >
                        {sendMessageMutation.isPending
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Send className="w-4 h-4" />
                        }
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <div>
                    <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-1">Select a conversation</h3>
                    <p className="text-sm text-gray-400">Choose from the list or start a new message</p>
                    <Button
                      className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => setShowNewMessageDialog(true)}
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      New Message
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        ) : (
          /* Notifications */
          <Card className="lg:col-span-3">
            <div className="p-4 border-b flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-foreground">Notifications</h2>
              {unreadNotifCount > 0 && <Badge className="bg-red-500 text-white">{unreadNotifCount}</Badge>}
              {unreadNotifCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-muted-foreground hover:text-gray-700"
                  onClick={() => notifications.filter(n => !n.is_read).forEach(n => markNotifReadMutation.mutate(n.id))}
                >
                  Mark all read
                </Button>
              )}
            </div>
            <ScrollArea className="h-[650px]">
              <div className="p-4 space-y-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const Icon = notificationIcons[notif.type] || Bell;
                    return (
                      <motion.div
                        key={notif.id}
                        onClick={() => {
                          if (!notif.is_read) markNotifReadMutation.mutate(notif.id);
                          if (notif.link) window.location.href = notif.link;
                        }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm flex items-start gap-3 ${
                          notif.is_read ? 'bg-card opacity-70 border-border' : 'bg-indigo-50 dark:bg-indigo-500/15 border-indigo-100'
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${notif.is_read ? 'bg-muted' : 'bg-indigo-100 dark:bg-indigo-500/15'}`}>
                          <Icon className={`w-4 h-4 ${notif.is_read ? 'text-gray-400' : 'text-indigo-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className={`font-medium text-sm ${notif.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>{notif.title}</p>
                              <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                            </div>
                            {!notif.is_read && <Circle className="w-2 h-2 fill-indigo-600 text-indigo-600 shrink-0 mt-1.5" />}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {format(new Date(notif.created_date), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </Card>
        )}
      </div>
    </div>
  );
}