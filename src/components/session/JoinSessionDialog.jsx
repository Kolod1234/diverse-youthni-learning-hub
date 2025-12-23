import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X, Users } from 'lucide-react';


export default function JoinSessionDialog({ user, onJoinSession, onClose }) {
  const [sessionCode, setSessionCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleJoinSession = async () => {
    if (!sessionCode.trim()) {
      alert('Please enter a session code');
      return;
    }

    setIsLoading(true);
    try {
      // Find the session
      const sessions = await base44.entities.LiveSession.filter({ 
        session_code: sessionCode.toUpperCase(),
        is_active: true 
      });

      if (sessions.length === 0) {
        alert('Session not found or has ended');
        setIsLoading(false);
        return;
      }

      const session = sessions[0];

      // Add participant
      await base44.entities.SessionParticipant.create({
        session_id: session.id,
        participant_email: user.email,
        participant_name: user.full_name,
        joined_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
      });

      // Update participant count
      await base44.entities.LiveSession.update(session.id, {
        participant_count: session.participant_count + 1,
      });

      // Fetch lesson data
      const lessons = await base44.entities.Lesson.filter({ id: session.lesson_id });
      const lesson = lessons[0];

      alert('Joined session!');
      onJoinSession(session, lesson, false);
    } catch (error) {
      console.error('Failed to join session:', error);
      alert('Failed to join session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Join Live Session</h2>
              <p className="text-sm text-gray-500">Enter the session code to join</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Session Code
            </label>
            <Input
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-digit code"
              className="text-center text-2xl font-mono tracking-widest"
              maxLength={6}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinSession()}
            />
          </div>

          <Button
            onClick={handleJoinSession}
            disabled={isLoading || sessionCode.length !== 6}
            className="w-full bg-indigo-600 hover:bg-indigo-700 h-12"
          >
            {isLoading ? 'Joining...' : 'Join Session'}
          </Button>
        </div>
      </Card>
    </div>
  );
}