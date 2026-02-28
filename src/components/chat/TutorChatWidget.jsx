import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, X, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatWindow from './ChatWindow';

/**
 * Floating chat widget for student ↔ tutor pre-booking conversations.
 * Rendered on tutor profile pages or booking pages.
 *
 * Props:
 *  - tutor: { email, full_name, avatar }
 *  - currentUser: the logged-in user object
 */
export default function TutorChatWidget({ tutor, currentUser }) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const queryClient = useQueryClient();

  // Find or create a direct chat room between currentUser and tutor
  useEffect(() => {
    if (!currentUser?.email || !tutor?.email) return;

    const findOrCreateRoom = async () => {
      // Look for an existing direct room between these two participants
      const rooms = await base44.entities.ChatRoom.filter({ type: 'direct' }, '-created_date', 200);
      const existing = rooms.find(
        (r) =>
          r.participant_emails?.includes(currentUser.email) &&
          r.participant_emails?.includes(tutor.email)
      );

      if (existing) {
        setRoomId(existing.id);
      } else {
        const created = await base44.entities.ChatRoom.create({
          type: 'direct',
          participant_emails: [currentUser.email, tutor.email],
          title: `${currentUser.full_name} ↔ ${tutor.full_name}`,
        });
        setRoomId(created.id);
      }
    };

    if (open) findOrCreateRoom();
  }, [open, currentUser?.email, tutor?.email]);

  // Unread count for this room
  const { data: unreadMessages = [] } = useQuery({
    queryKey: ['chat-unread', roomId, currentUser?.email],
    queryFn: () => base44.entities.ChatMessage.filter({ room_id: roomId }, '-created_date', 50),
    enabled: !!roomId && !!currentUser?.email,
    refetchInterval: 10000,
    select: (msgs) => msgs.filter((m) => m.sender_email !== currentUser.email),
  });

  if (!currentUser || currentUser.email === tutor?.email) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-indigo-600 text-white px-4 py-3 flex items-center gap-3">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarImage src={tutor.avatar} />
                <AvatarFallback className="bg-indigo-400 text-white text-xs">
                  {tutor.full_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{tutor.full_name}</p>
                <p className="text-xs text-indigo-200">Tutor</p>
              </div>
              <button onClick={() => setMinimized((p) => !p)} className="hover:bg-indigo-500 p-1 rounded">
                <Minus className="w-4 h-4" />
              </button>
              <button onClick={() => setOpen(false)} className="hover:bg-indigo-500 p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat body */}
            {!minimized && (
              roomId ? (
                <ChatWindow roomId={roomId} currentUser={currentUser} height={340} />
              ) : (
                <div className="flex items-center justify-center h-40 text-sm text-gray-400">
                  Starting chat…
                </div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger button */}
      <button
        onClick={() => { setOpen((p) => !p); setMinimized(false); }}
        className="relative bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors"
      >
        {open ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!open && unreadMessages.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadMessages.length}
          </span>
        )}
      </button>
    </div>
  );
}