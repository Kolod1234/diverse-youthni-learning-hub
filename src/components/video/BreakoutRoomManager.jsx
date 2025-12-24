import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, ArrowRight, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BreakoutRoomManager({ participants, onCreateRooms, onAssign }) {
  const [numRooms, setNumRooms] = useState(2);
  const [rooms, setRooms] = useState([]);
  const [showManager, setShowManager] = useState(false);

  const autoAssignRooms = () => {
    const newRooms = Array.from({ length: numRooms }, (_, i) => ({
      id: `room-${i + 1}`,
      name: `Room ${i + 1}`,
      participants: []
    }));

    // Distribute participants evenly
    participants.forEach((p, idx) => {
      const roomIdx = idx % numRooms;
      newRooms[roomIdx].participants.push(p);
    });

    setRooms(newRooms);
  };

  const moveParticipant = (participantId, fromRoom, toRoom) => {
    setRooms(prev => {
      const updated = [...prev];
      const from = updated.find(r => r.id === fromRoom);
      const to = updated.find(r => r.id === toRoom);
      
      const participant = from.participants.find(p => p.userId === participantId);
      from.participants = from.participants.filter(p => p.userId !== participantId);
      to.participants.push(participant);
      
      return updated;
    });
  };

  const startBreakoutRooms = () => {
    onCreateRooms(rooms);
    setShowManager(false);
  };

  if (!showManager) {
    return (
      <Button
        onClick={() => setShowManager(true)}
        variant="outline"
        size="sm"
        className="bg-purple-600 text-white hover:bg-purple-700"
      >
        <Users className="w-4 h-4 mr-2" />
        Breakout Rooms
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setShowManager(false)}
    >
      <Card 
        className="w-full max-w-4xl max-h-[80vh] overflow-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Breakout Rooms</h2>
          <Button variant="ghost" size="icon" onClick={() => setShowManager(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {rooms.length === 0 ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Number of Rooms:</label>
              <Input
                type="number"
                min={2}
                max={10}
                value={numRooms}
                onChange={(e) => setNumRooms(parseInt(e.target.value) || 2)}
                className="w-24"
              />
              <Button onClick={autoAssignRooms} className="bg-indigo-600">
                <Plus className="w-4 h-4 mr-2" />
                Create & Auto-Assign
              </Button>
            </div>

            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Configure breakout rooms to split participants into smaller groups</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {rooms.map(room => (
                <Card key={room.id} className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
                  <h3 className="font-semibold text-gray-900 mb-3">{room.name}</h3>
                  <div className="space-y-2">
                    {room.participants.map(p => (
                      <div key={p.userId} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                        <span className="text-sm text-gray-700">{p.name}</span>
                        <select
                          className="text-xs border rounded px-2 py-1"
                          onChange={(e) => moveParticipant(p.userId, room.id, e.target.value)}
                          value={room.id}
                        >
                          {rooms.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                    {room.participants.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">No participants</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <Button variant="outline" onClick={() => setRooms([])}>
                Reset
              </Button>
              <Button onClick={startBreakoutRooms} className="bg-purple-600 hover:bg-purple-700">
                <ArrowRight className="w-4 h-4 mr-2" />
                Start Breakout Rooms
              </Button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}