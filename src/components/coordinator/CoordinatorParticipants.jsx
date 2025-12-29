import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, Star, Ban, CheckCircle, MessageSquare, FileText, Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function CoordinatorParticipants({ coordinatorEmail }) {
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('full_name', 1000),
  });

  const assignedParticipants = allUsers.filter(u => 
    u.assigned_coordinator_email === coordinatorEmail && 
    !u.is_coordinator && 
    !u.is_tutor &&
    u.role !== 'admin'
  );

  const updateParticipantMutation = useMutation({
    mutationFn: ({ userId, data }) => base44.entities.User.update(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-users']);
      toast.success('Participant updated');
    },
  });

  const handleBanToggle = async (participant) => {
    await updateParticipantMutation.mutateAsync({
      userId: participant.id,
      data: { participant_banned: !participant.participant_banned }
    });
    
    // Send notification
    try {
      await base44.functions.invoke('sendNotification', {
        recipient_email: participant.email,
        title: participant.participant_banned ? 'Account Unbanned' : 'Account Suspended',
        message: participant.participant_banned 
          ? 'Your programme access has been restored.'
          : 'Your programme access has been suspended. Please contact your coordinator.',
        type: 'program',
        send_email: true,
      });
    } catch (err) {
      console.error('Failed to send notification:', err);
    }
  };

  const handleSaveRating = async () => {
    if (!selectedParticipant) return;
    
    await updateParticipantMutation.mutateAsync({
      userId: selectedParticipant.id,
      data: { 
        coordinator_rating: rating,
        coordinator_notes: notes
      }
    });
    
    setSelectedParticipant(null);
    setRating(0);
    setNotes('');
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Participants List */}
      <div className="md:col-span-1 space-y-3">
        <h3 className="font-semibold text-gray-900 mb-4">
          Assigned Participants ({assignedParticipants.length})
        </h3>
        {assignedParticipants.map((participant) => (
          <Card 
            key={participant.email}
            className={`p-4 cursor-pointer transition-all ${
              selectedParticipant?.email === participant.email
                ? 'ring-2 ring-purple-500 bg-purple-50'
                : 'hover:shadow-md'
            }`}
            onClick={() => {
              setSelectedParticipant(participant);
              setRating(participant.coordinator_rating || 0);
              setNotes(participant.coordinator_notes || '');
            }}
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={participant.avatar} />
                <AvatarFallback className="bg-indigo-100 text-indigo-700">
                  {participant.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {participant.full_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{participant.email}</p>
                {participant.coordinator_rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">
                      {participant.coordinator_rating}/5
                    </span>
                  </div>
                )}
              </div>
              {participant.participant_banned && (
                <Badge variant="destructive">Banned</Badge>
              )}
            </div>
          </Card>
        ))}

        {assignedParticipants.length === 0 && (
          <Card className="p-8 text-center">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No participants assigned yet</p>
          </Card>
        )}
      </div>

      {/* Participant Details */}
      <div className="md:col-span-2">
        {selectedParticipant ? (
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 border-4 border-gray-200">
                  <AvatarImage src={selectedParticipant.avatar} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 text-2xl">
                    {selectedParticipant.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedParticipant.full_name}
                  </h3>
                  <p className="text-gray-500 flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" />
                    {selectedParticipant.email}
                  </p>
                  {selectedParticipant.participant_banned && (
                    <Badge variant="destructive" className="mt-2">
                      Account Suspended
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {selectedParticipant.bio && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Bio</h4>
                <p className="text-gray-600">{selectedParticipant.bio}</p>
              </div>
            )}

            {/* Rating Section */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Coordinator Notes
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this participant..."
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSaveRating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Rating & Notes
              </Button>
            </div>

            {/* Actions */}
            <div className="border-t pt-6 space-y-3">
              <h4 className="font-semibold text-gray-900 mb-3">Actions</h4>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.location.href = `/message-center`}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.location.href = `/programs?view=logbook`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Logbooks
                </Button>
                
                <Button
                  variant={selectedParticipant.participant_banned ? "default" : "destructive"}
                  onClick={() => handleBanToggle(selectedParticipant)}
                >
                  {selectedParticipant.participant_banned ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Unban User
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4 mr-2" />
                      Ban User
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Select a participant to view details</p>
          </Card>
        )}
      </div>
    </div>
  );
}