import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, X, Send, Minimize2, Bot, User, PhoneOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [user, setUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Load or create chat session - persist in localStorage so history survives refresh
  useEffect(() => {
    if (!open || !user) return;
    const storageKey = `support_chat_id_${user.email}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      // Verify the chat still exists and is not closed
      base44.entities.SupportChat.filter({ user_email: user.email }, '-created_date', 50)
        .then(results => {
          const chat = results?.find(c => c.id === stored);
          if (chat && chat.status !== 'closed') {
            setChatId(stored);
          } else {
            // Chat closed or not found - create a new one
            localStorage.removeItem(storageKey);
            createNewChat(storageKey);
          }
        })
        .catch(() => createNewChat(storageKey));
      return;
    }
    createNewChat(storageKey);
  }, [open, user]);

  const createNewChat = (storageKey) => {
    base44.entities.SupportChat.create({
      user_email: user.email,
      user_name: user.full_name || user.email,
      status: 'open',
      last_message_at: new Date().toISOString()
    }).then(chat => {
      setChatId(chat.id);
      localStorage.setItem(storageKey, chat.id);
    });
  };

  const { data: messages = [] } = useQuery({
    queryKey: ['support-messages', chatId],
    queryFn: () => base44.entities.SupportMessage.filter({ chat_id: chatId }, 'created_date', 200),
    enabled: !!chatId,
    refetchInterval: 3000,
  });

  const { data: chatRecord } = useQuery({
    queryKey: ['support-chat-record', chatId],
    queryFn: () => base44.entities.SupportChat.filter({ user_email: user?.email }, '-created_date', 10)
      .then(results => results?.find(c => c.id === chatId) || null),
    enabled: !!chatId && !!user?.email,
    refetchInterval: 5000,
  });

  const isChatClosed = chatRecord?.status === 'closed';

  // Real-time subscription
  useEffect(() => {
    if (!chatId) return;
    const unsub = base44.entities.SupportMessage.subscribe((event) => {
      if (event.data?.chat_id === chatId) {
        queryClient.invalidateQueries({ queryKey: ['support-messages', chatId] });
        if (!open || minimized) setUnread(u => u + 1);
      }
    });
    return unsub;
  }, [chatId, open, minimized]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && !minimized) setUnread(0);
  }, [open, minimized, messages.length]);

  const handleEndChat = async () => {
    if (!chatId) return;
    await base44.entities.SupportChat.update(chatId, { status: 'closed' });
    // Clear stored chat so next open starts fresh
    const storageKey = `support_chat_id_${user?.email}`;
    localStorage.removeItem(storageKey);
    setChatId(null);
    setOpen(false);
    queryClient.invalidateQueries({ queryKey: ['support-messages', chatId] });
  };

  const handleSend = async () => {
    if (!input.trim() || !chatId || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);

    // Save user message
    await base44.entities.SupportMessage.create({
      chat_id: chatId,
      sender_role: 'user',
      sender_name: user?.full_name || 'You',
      content: text
    });

    // Update chat
    await base44.entities.SupportChat.update(chatId, {
      last_message: text.substring(0, 100),
      last_message_at: new Date().toISOString(),
      unread_admin: true,
      status: 'open'
    });

    queryClient.invalidateQueries({ queryKey: ['support-messages', chatId] });

    // Get bot response
    await base44.functions.invoke('supportChatBot', { chat_id: chatId, message: text });
    queryClient.invalidateQueries({ queryKey: ['support-messages', chatId] });

    setSending(false);
  };

  if (!user) return null;

  return (
    <div style={{ position: 'fixed', bottom: 80, right: 16, zIndex: 9999, fontFamily: 'inherit' }}>
      <AnimatePresence>
        {open && !minimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            style={{
              width: 340,
              height: 480,
              background: 'var(--chat-bg, white)',
              borderRadius: 16,
              boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.08)',
              marginBottom: 12,
            }}
          >
            {/* Header */}
            <div style={{ background: '#003366', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageCircle size={18} color="white" />
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Support Chat</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80' }} />
                    <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>Online</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setMinimized(true)} title="Minimise" style={{ background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: 'white', borderRadius: 6, padding: '4px 7px', display: 'flex', alignItems: 'center' }}>
                  <Minimize2 size={15} />
                </button>
                <button onClick={handleEndChat} title="End Chat" style={{ background: 'rgba(239,68,68,0.7)', border: 'none', cursor: 'pointer', color: 'white', borderRadius: 6, padding: '4px 7px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600 }}>
                  <PhoneOff size={13} /> End
                </button>
                <button onClick={() => setOpen(false)} title="Close" style={{ background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: 'white', borderRadius: 6, padding: '4px 7px', display: 'flex', alignItems: 'center' }}>
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, background: '#f8fafc' }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, marginTop: 40 }}>
                  Starting your support session...
                </div>
              )}
              {messages.map((msg, i) => {
                const isUser = msg.sender_role === 'user';
                const isBot = msg.sender_role === 'bot';
                return (
                  <div key={msg.id || i} style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8 }}>
                    {!isUser && (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: isBot ? '#6366f1' : '#003366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isBot ? <Bot size={14} color="white" /> : <User size={14} color="white" />}
                      </div>
                    )}
                    <div style={{
                      maxWidth: '75%',
                      padding: '9px 12px',
                      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isUser ? '#003366' : 'white',
                      color: isUser ? 'white' : '#1e293b',
                      fontSize: 13,
                      lineHeight: 1.5,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
                      wordBreak: 'break-word'
                    }}>
                      {isUser ? msg.content : (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <span style={{ display: 'block', margin: 0 }}>{children}</span>,
                            strong: ({ children }) => <strong style={{ color: isUser ? 'white' : '#003366' }}>{children}</strong>
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                );
              })}
              {sending && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={14} color="white" />
                  </div>
                  <div style={{ background: 'white', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0, 1, 2].map(j => (
                      <div key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', animation: `bounce 1s infinite ${j * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '10px 12px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8, background: 'white', flexShrink: 0 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Type a message..."
                style={{
                  flex: 1, border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 12px',
                  fontSize: 13, outline: 'none', background: '#f8fafc', color: '#1e293b'
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                style={{
                  background: input.trim() ? '#003366' : '#e2e8f0', border: 'none', borderRadius: 10,
                  width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: input.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.2s', flexShrink: 0
                }}
              >
                <Send size={16} color={input.trim() ? 'white' : '#94a3b8'} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setOpen(o => !o); setMinimized(false); setUnread(0); }}
        style={{
          width: 52, height: 52, borderRadius: '50%', background: '#003366',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,51,102,0.35)', position: 'relative'
        }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={22} color="white" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={22} color="white" />
            </motion.div>
          )}
        </AnimatePresence>
        {!open && unread > 0 && (
          <div style={{ position: 'absolute', top: -2, right: -2, background: '#ef4444', color: 'white', fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
            {unread > 9 ? '9+' : unread}
          </div>
        )}
      </motion.button>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}