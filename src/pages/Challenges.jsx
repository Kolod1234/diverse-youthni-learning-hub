import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ChallengeCard from '@/components/challenges/ChallengeCard';
import ChallengeCreator from '@/components/challenges/ChallengeCreator';
import GlobalLeaderboard from '@/components/challenges/GlobalLeaderboard';
import { Plus, Search, Trophy, Zap, Users, Target } from 'lucide-react';

export default function Challenges() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreator, setShowCreator] = useState(false);

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.filter({ is_active: true }, '-created_date', 100)
  });

  const { data: myChallenges = [] } = useQuery({
    queryKey: ['my-challenges'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.ChallengeParticipant.filter({ created_by: user.email }, '-created_date', 50);
    }
  });

  const filteredChallenges = challenges.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-600" />
            Challenges Arena
          </h1>
          <p className="text-gray-600">Compete, learn, and earn rewards!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold">{challenges.length}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{myChallenges.filter(c => c.status === 'completed').length}</p>
              </div>
              <Zap className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{myChallenges.filter(c => c.status === 'in_progress').length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-yellow-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total XP</p>
                <p className="text-2xl font-bold">
                  {myChallenges.reduce((sum, c) => sum + (c.score || 0), 0)}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Search & Create */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search challenges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={showCreator} onOpenChange={setShowCreator}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-5 h-5" />
                Create Challenge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Challenge</DialogTitle>
              </DialogHeader>
              <ChallengeCreator onSuccess={() => setShowCreator(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Challenges</TabsTrigger>
            <TabsTrigger value="my">My Challenges</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChallenges.map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
            {filteredChallenges.length === 0 && (
              <div className="text-center py-16 bg-white rounded-lg">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No challenges found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="my">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myChallenges.map(participant => {
                const challenge = challenges.find(c => c.id === participant.challenge_id);
                return challenge ? <ChallengeCard key={challenge.id} challenge={challenge} /> : null;
              })}
            </div>
            {myChallenges.length === 0 && (
              <div className="text-center py-16 bg-white rounded-lg">
                <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">You haven't joined any challenges yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="leaderboard">
            <GlobalLeaderboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}