import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { BarChart3, Plus, Send, X, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function LivePolling({ sessionId, isTutor, onClose }) {
  const [polls, setPolls] = useState([]);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''] });
  const [userVotes, setUserVotes] = useState({});

  useEffect(() => {
    fetchPolls();
    const interval = setInterval(fetchPolls, 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const fetchPolls = async () => {
    try {
      const response = await base44.functions.invoke('videoSignaling', {
        action: 'get-polls',
        sessionId
      });
      if (response.data.polls) {
        setPolls(response.data.polls);
      }
    } catch (error) {
      console.error('Error fetching polls:', error);
    }
  };

  const createPoll = async () => {
    if (!newPoll.question || newPoll.options.filter(o => o.trim()).length < 2) return;

    try {
      await base44.functions.invoke('videoSignaling', {
        action: 'create-poll',
        sessionId,
        question: newPoll.question,
        options: newPoll.options.filter(o => o.trim())
      });
      setNewPoll({ question: '', options: ['', ''] });
      setShowCreatePoll(false);
      fetchPolls();
    } catch (error) {
      console.error('Error creating poll:', error);
    }
  };

  const submitVote = async (pollId, optionIndex) => {
    try {
      await base44.functions.invoke('videoSignaling', {
        action: 'vote-poll',
        sessionId,
        pollId,
        optionIndex
      });
      setUserVotes(prev => ({ ...prev, [pollId]: optionIndex }));
      fetchPolls();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const closePoll = async (pollId) => {
    try {
      await base44.functions.invoke('videoSignaling', {
        action: 'close-poll',
        sessionId,
        pollId
      });
      fetchPolls();
    } catch (error) {
      console.error('Error closing poll:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col bg-white">
        <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-500">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Live Polling
          </h3>
          <Button size="sm" variant="ghost" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {polls.length === 0 && !showCreatePoll && (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No active polls</p>
            </div>
          )}

          {polls.map((poll) => {
            const totalVotes = poll.votes?.reduce((sum, v) => sum + v, 0) || 0;
            const hasVoted = userVotes[poll.id] !== undefined;
            const showResults = poll.closed || hasVoted;

            return (
              <Card key={poll.id} className="p-4 border-2">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{poll.question}</h4>
                  {poll.closed && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Closed</span>
                  )}
                </div>

                {!showResults ? (
                  <RadioGroup onValueChange={(value) => submitVote(poll.id, parseInt(value))}>
                    <div className="space-y-2">
                      {poll.options.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg">
                          <RadioGroupItem value={idx.toString()} id={`${poll.id}-${idx}`} />
                          <Label htmlFor={`${poll.id}-${idx}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                ) : (
                  <div className="space-y-3">
                    {poll.options.map((option, idx) => {
                      const votes = poll.votes?.[idx] || 0;
                      const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                      const isUserVote = userVotes[poll.id] === idx;

                      return (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              {option}
                              {isUserVote && <Check className="w-4 h-4 text-green-600" />}
                            </span>
                            <span className="text-sm text-gray-500">{votes} votes ({percentage}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                    <p className="text-xs text-gray-500 text-right mt-2">Total: {totalVotes} votes</p>
                  </div>
                )}

                {isTutor && !poll.closed && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => closePoll(poll.id)}
                    className="mt-3 w-full"
                  >
                    Close Poll
                  </Button>
                )}
              </Card>
            );
          })}

          {showCreatePoll && (
            <Card className="p-4 border-2 border-blue-200 bg-blue-50">
              <h4 className="font-semibold text-gray-900 mb-3">Create New Poll</h4>
              <Input
                placeholder="Poll question..."
                value={newPoll.question}
                onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                className="mb-3"
              />
              <div className="space-y-2 mb-3">
                {newPoll.options.map((option, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      placeholder={`Option ${idx + 1}`}
                      value={option}
                      onChange={(e) => {
                        const updated = [...newPoll.options];
                        updated[idx] = e.target.value;
                        setNewPoll({ ...newPoll, options: updated });
                      }}
                    />
                    {newPoll.options.length > 2 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const updated = newPoll.options.filter((_, i) => i !== idx);
                          setNewPoll({ ...newPoll, options: updated });
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setNewPoll({ ...newPoll, options: [...newPoll.options, ''] })}
                  disabled={newPoll.options.length >= 6}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Option
                </Button>
                <Button size="sm" onClick={createPoll} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4 mr-1" />
                  Create Poll
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowCreatePoll(false)}>
                  Cancel
                </Button>
              </div>
            </Card>
          )}
        </div>

        {isTutor && !showCreatePoll && (
          <div className="p-4 border-t">
            <Button onClick={() => setShowCreatePoll(true)} className="w-full bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New Poll
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}