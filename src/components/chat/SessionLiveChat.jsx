import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import ChatWindow from './ChatWindow';
import { Loader2 } from 'lucide-react';

/**
 * Live chat panel for a video session.
 * Finds or creates a session-type ChatRoom keyed on session_id.
 *
 * Props:
 *  - sessionId: string
 *  - sessionTitle: string
 *  - currentUser: user object
 *  - height: optional number
 */
export default function SessionLiveChat({ sessionId, sessionTitle, currentUser, height = 500 }) {
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
    if (!sessionId || !currentUser?.email) return;

    const findOrCreate = async () => {
      const rooms = await base44.entities.ChatRoom.filter({ type: 'session', session_id: sessionId }, '-created_date', 5);
      if (rooms.length > 0) {
        setRoomId(rooms[0].id);
      } else {
        const created = await base44.entities.ChatRoom.create({
          type: 'session',
          session_id: sessionId,
          title: sessionTitle || 'Session Chat',
          participant_emails: [currentUser.email],
        });
        setRoomId(created.id);
      }
    };

    findOrCreate();
  }, [sessionId, currentUser?.email]);

  if (!roomId) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      <div className="px-4 py-2 bg-gray-50 border-b text-sm font-semibold text-gray-700">
        Session Chat
      </div>
      <ChatWindow roomId={roomId} currentUser={currentUser} height={height} />
    </div>
  );
}