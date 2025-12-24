import React, { useState, useEffect } from 'react';
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
  MessageSquare, Send, Search, Mail, MailOpen, 
  ArrowLeft, Sparkles, Loader2, FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function MessageCenter() {
  const [user, setUser] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', user?.email],
    queryFn: () => base44.entities.Message.filter({ recipient_email: user?.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  const { data: sentMessages = [] } = useQuery({
    queryKey: ['sent-messages', user?.email],
    queryFn: () => base44.entities.Message.filter({ sender_email: user?.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 100),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (messageId) => base44.entities.Message.update(messageId, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
    },
  });

  const sendReplyMutation = useMutation({
    mutationFn: (messageData) => base44.entities.Message.create(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries(['sent-messages']);
      toast.success('Reply sent!');
      setReplyText('');
    },
    onError: () => {
      toast.error('Failed to send reply');
    },
  });

  const summarizeThreadMutation = useMutation({
    mutationFn: async (messages) => {
      const threadContent = messages
        .map(m => `${m.sender_name}: ${m.content}`)
        .join('\n\n');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize this message thread between a tutor and student. Provide a concise summary of:
1. Main topics discussed
2. Any questions or issues raised
3. Key action items or next steps

Message Thread:
${threadContent}

Provide a brief, bullet-point summary:`,
      });
      return response;
    },
  });

  const suggestReplyMutation = useMutation({
    mutationFn: async ({ message, courseName }) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful tutor assistant. A student sent this message about the course "${courseName}":

"${message}"

Generate a helpful, professional, and encouraging reply that:
- Addresses their question or concern
- Provides guidance
- Maintains a supportive tone
- Is 2-3 sentences long

Reply:`,
      });
      return response;
    },
    onSuccess: (data) => {
      setReplyText(data);
      toast.success('Reply suggestion generated!');
    },
  });

  // Group messages by thread (course + sender)
  const allMessages = [...messages, ...sentMessages];
  const threads = allMessages.reduce((acc, msg) => {
    const key = `${msg.course_id || 'general'}-${msg.sender_email === user?.email ? msg.recipient_email : msg.sender_email}`;
    if (!acc[key]) {
      acc[key] = {
        id: key,
        courseId: msg.course_id,
        otherPartyEmail: msg.sender_email === user?.email ? msg.recipient_email : msg.sender_email,
        otherPartyName: msg.sender_email === user?.email ? 'Student' : msg.sender_name,
        messages: [],
        lastMessage: msg,
        hasUnread: false,
      };
    }
    acc[key].messages.push(msg);
    if (!msg.is_read && msg.recipient_email === user?.email) {
      acc[key].hasUnread = true;
    }
    if (new Date(msg.created_date) > new Date(acc[key].lastMessage.created_date)) {
      acc[key].lastMessage = msg;
    }
    return acc;
  }, {});

  const threadList = Object.values(threads)
    .sort((a, b) => new Date(b.lastMessage.created_date) - new Date(a.lastMessage.created_date))
    .filter(thread => 
      !searchQuery || 
      thread.otherPartyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const unreadCount = messages.filter(m => !m.is_read).length;

  const handleSelectThread = (thread) => {
    setSelectedThread(thread);
    // Mark messages as read
    thread.messages
      .filter(m => m.recipient_email === user?.email && !m.is_read)
      .forEach(m => markAsReadMutation.mutate(m.id));
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedThread) return;

    sendReplyMutation.mutate({
      course_id: selectedThread.courseId,
      sender_email: user?.email,
      sender_name: user?.full_name,
      recipient_email: selectedThread.otherPartyEmail,
      content: replyText,
      is_read: false,
    });
  };

  const courseName = courses.find(c => c.id === selectedThread?.courseId)?.title || 'General';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Message Center</h1>
          <p className="text-gray-500">Communicate with tutors and students</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Thread List */}
          <Card className="lg:col-span-1">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <h2 className="font-semibold text-gray-900">Conversations</h2>
                {unreadCount > 0 && (
                  <Badge className="bg-red-500">{unreadCount}</Badge>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="pl-9"
                />
              </div>
            </div>

            <ScrollArea className="h-[600px]">
              <div className="divide-y">
                {threadList.map((thread) => (
                  <motion.div
                    key={thread.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => handleSelectThread(thread)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedThread?.id === thread.id
                        ? 'bg-indigo-50 border-l-4 border-indigo-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-indigo-100 text-indigo-600">
                          {thread.otherPartyName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-gray-900 truncate">
                            {thread.otherPartyName}
                          </p>
                          {thread.hasUnread && (
                            <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-1">{courseName}</p>
                        <p className="text-sm text-gray-600 truncate">
                          {thread.lastMessage.content}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {format(new Date(thread.lastMessage.created_date), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Message Thread */}
          <Card className="lg:col-span-2">
            {selectedThread ? (
              <div className="flex flex-col h-[700px]">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedThread(null)}
                      className="lg:hidden"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <Avatar>
                      <AvatarFallback className="bg-indigo-100 text-indigo-600">
                        {selectedThread.otherPartyName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedThread.otherPartyName}</p>
                      <p className="text-xs text-gray-500">{courseName}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => summarizeThreadMutation.mutate(selectedThread.messages)}
                    disabled={summarizeThreadMutation.isPending}
                  >
                    {summarizeThreadMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Summarize
                      </>
                    )}
                  </Button>
                </div>

                {/* Summary */}
                {summarizeThreadMutation.data && (
                  <div className="p-4 bg-blue-50 border-b">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-blue-900 mb-1">Thread Summary</p>
                        <p className="text-sm text-blue-800 whitespace-pre-wrap">
                          {summarizeThreadMutation.data}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedThread.messages
                      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
                      .map((msg) => {
                        const isOwn = msg.sender_email === user?.email;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                              <div
                                className={`rounded-2xl px-4 py-3 ${
                                  isOwn
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              </div>
                              <p className="text-xs text-gray-400 mt-1 px-2">
                                {format(new Date(msg.created_date), 'MMM d, h:mm a')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>

                {/* Reply Box */}
                <div className="p-4 border-t space-y-3">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => suggestReplyMutation.mutate({
                        message: selectedThread.messages[selectedThread.messages.length - 1].content,
                        courseName,
                      })}
                      disabled={suggestReplyMutation.isPending}
                    >
                      {suggestReplyMutation.isPending ? (
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 mr-2" />
                      )}
                      Suggest Reply
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your message..."
                      rows={3}
                      className="resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || sendReplyMutation.isPending}
                      className="bg-indigo-600 hover:bg-indigo-700 shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[700px] flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}