import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Users, Plus, X, UserPlus, LogOut, Trash2, 
  ArrowRight, Grid3x3
} from 'lucide-react';

export default function BreakoutRoomManager({
  participants,
  currentRooms,
  isTutor,
  currentUserRoom,
  onCreateRooms,
  onAssignParticipant,
  onJoinRoom,
  onLeaveRoom,
  onCloseRoom,
  onClose,
}) {
  const [rooms, setRooms] = useState(currentRooms || []);
  const [newRoomName, setNewRoomName] = useState('');
  const [autoAssignCount, setAutoAssignCount] = useState(3);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) return;
    
    const newRoom = {
      name: newRoomName,
      participants: [],
      id: Date.now().toString()
    };
    
    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    onCreateRooms(updatedRooms);
    setNewRoomName('');
  };

  const handleAutoCreate = () => {
    const count = parseInt(autoAssignCount) || 3;
    const newRooms = Array.from({ length: count }, (_, i) => ({
      name: `Room ${i + 1}`,
      participants: [],
      id: Date.now() + i
    }));
    
    // Auto-distribute participants
    const unassignedParticipants = participants.filter(p => !p.breakoutRoom);
    unassignedParticipants.forEach((participant, idx) => {
      const roomIdx = idx % count;
      newRooms[roomIdx].participants.push(participant.email);
      onAssignParticipant(participant.email, newRooms[roomIdx].name);
    });
    
    const updatedRooms = [...rooms, ...newRooms];
    setRooms(updatedRooms);
    onCreateRooms(updatedRooms);
  };

  const handleAssign = (participantEmail, roomName) => {
    setRooms(prev => prev.map(room => {
      // Remove from all rooms first
      const filtered = {
        ...room,
        participants: room.participants.filter(p => p !== participantEmail)
      };
      
      // Add to target room
      if (room.name === roomName) {
        return {
          ...filtered,
          participants: [...filtered.participants, participantEmail]
        };
      }
      return filtered;
    }));
    
    onAssignParticipant(participantEmail, roomName);
  };

  const handleDeleteRoom = (roomName) => {
    const updatedRooms = rooms.filter(r => r.name !== roomName);
    setRooms(updatedRooms);
    onCloseRoom(roomName);
  };

  const getParticipantRoom = (participantEmail) => {
    return rooms.find(r => r.participants.includes(participantEmail))?.name;
  };

  const unassignedParticipants = participants.filter(p => !getParticipantRoom(p.email));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Breakout Rooms Manager
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {isTutor && (
            <>
              {/* Create Room Controls */}
              <Card className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                <h3 className="font-semibold text-gray-900 mb-3">Create Rooms</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Manual Create */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Custom Room Name</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., Discussion Group A"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
                        className="flex-1"
                      />
                      <Button onClick={handleCreateRoom} className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create
                      </Button>
                    </div>
                  </div>

                  {/* Auto Create */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Auto-Create & Distribute</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="2"
                        max="10"
                        value={autoAssignCount}
                        onChange={(e) => setAutoAssignCount(e.target.value)}
                        className="w-20"
                      />
                      <Button onClick={handleAutoCreate} variant="outline" className="flex-1">
                        <Grid3x3 className="w-4 h-4 mr-2" />
                        Create {autoAssignCount} Rooms
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Unassigned Participants */}
              {unassignedParticipants.length > 0 && (
                <Card className="p-4 bg-amber-50 border-amber-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-600" />
                    Unassigned Participants ({unassignedParticipants.length})
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {unassignedParticipants.map(participant => (
                      <div
                        key={participant.email}
                        className="flex items-center justify-between p-2 bg-white rounded border border-amber-200"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {participant.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {participant.name}
                          </span>
                        </div>
                        {rooms.length > 0 && (
                          <select
                            onChange={(e) => handleAssign(participant.email, e.target.value)}
                            className="text-xs px-2 py-1 rounded border border-gray-300"
                            defaultValue=""
                          >
                            <option value="" disabled>Assign to...</option>
                            {rooms.map(room => (
                              <option key={room.id} value={room.name}>
                                {room.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Existing Rooms */}
          {rooms.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {rooms.map((room) => {
                const roomParticipants = participants.filter(p => 
                  room.participants.includes(p.email) || getParticipantRoom(p.email) === room.name
                );
                const isInThisRoom = currentUserRoom === room.name;

                return (
                  <Card key={room.id} className={`p-4 ${isInThisRoom ? 'border-2 border-purple-500 bg-purple-50' : ''}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          {room.name}
                          {isInThisRoom && (
                            <Badge className="bg-purple-600">You're here</Badge>
                          )}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {roomParticipants.length} participant{roomParticipants.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {!isTutor && !isInThisRoom && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onJoinRoom(room.name)}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        )}
                        {!isTutor && isInThisRoom && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={onLeaveRoom}
                            className="text-red-600 hover:text-red-700 hover:bg-red-100"
                          >
                            <LogOut className="w-4 h-4" />
                          </Button>
                        )}
                        {isTutor && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteRoom(room.name)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {roomParticipants.length > 0 ? (
                        roomParticipants.map(participant => (
                          <div
                            key={participant.email}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-purple-700">
                                  {participant.name?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <span className="text-sm text-gray-900">{participant.name}</span>
                            </div>
                            {isTutor && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const updatedRooms = rooms.map(r => ({
                                    ...r,
                                    participants: r.participants.filter(p => p !== participant.email)
                                  }));
                                  setRooms(updatedRooms);
                                  onAssignParticipant(participant.email, null);
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 text-center py-3">No participants</p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No breakout rooms created yet</p>
              {isTutor && (
                <p className="text-sm text-gray-400 mt-1">Create rooms using the controls above</p>
              )}
            </Card>
          )}
        </div>

        <div className="border-t pt-4 flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}