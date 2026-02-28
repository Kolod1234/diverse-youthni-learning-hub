import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import ChatWindow from './ChatWindow';
import { MessageCircle, Loader2 } from 'lucide-react';

/**
 * Real-time comment/chat thread under a community post.
 * Finds or creates a community-type ChatRoom keyed on post_id.
 *
 * Props:
 *  - post: CommunityPost record
 *  - currentUser: user object
 */
export default function CommunityPostChat({ post, currentUser }) {
  const [roomId, setRoomId] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!post?.id || !open || !currentUser?.email) return;

    const findOrCreate = async () => {
      const rooms = await base44.entities.ChatRoom.filter({ type: 'community', post_id: post.id }, '-created_date', 5);
      if (rooms.length > 0) {
        setRoomId(rooms[0].id);
      } else {
        const created = await base44.entities.ChatRoom.create({
          type: 'community',
          post_id: post.id,
          title: post.title,
          participant_emails: [],
        });
        setRoomId(created.id);
      }
    };

    findOrCreate();
  }, [post?.id, open, currentUser?.email]);

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        {open ? 'Hide' : 'Show'} Comments
      </button>

      {open && (
        <div className="mt-3 border rounded-xl overflow-hidden bg-gray-50">
          {!roomId ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          ) : (
            <ChatWindow roomId={roomId} currentUser={currentUser} height={300} />
          )}
        </div>
      )}
    </div>
  );
}