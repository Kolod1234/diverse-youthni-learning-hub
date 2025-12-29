import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lock, Users, BookOpen, MessageSquare, UserCheck, UserX, Star } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import CoordinatorParticipants from '@/components/coordinator/CoordinatorParticipants';
import CoordinatorLogbooks from '@/components/coordinator/CoordinatorLogbooks';
import CoordinatorMessages from '@/components/coordinator/CoordinatorMessages';

export default function CoordinatorsDashboard() {
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const { data: siteContent = [] } = useQuery({
    queryKey: ['site-content'],
    queryFn: () => base44.entities.SiteContent.list('key', 1000),
  });

  const getCoordinatorPassword = () => {
    const item = siteContent.find(c => c.key === 'coordinator_password');
    return item?.value || 'YELP26';
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Check if user is coordinator and not banned
        if (userData.is_coordinator && !userData.coordinator_banned) {
          // Check session storage for password
          const savedAccess = sessionStorage.getItem('coordinator_access');
          if (savedAccess === 'true') {
            setHasAccess(true);
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const correctPassword = getCoordinatorPassword();
    
    if (password === correctPassword) {
      sessionStorage.setItem('coordinator_access', 'true');
      setHasAccess(true);
      toast.success('Access granted!');
    } else {
      toast.error('Incorrect password');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user?.is_coordinator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <UserX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You need coordinator privileges to access this page.</p>
          </div>
        </Card>
      </div>
    );
  }

  if (user.coordinator_banned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <UserX className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Suspended</h2>
            <p className="text-gray-600">Your coordinator access has been suspended. Please contact an administrator.</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <Card className="w-full max-w-md p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Coordinators Dashboard</h2>
            <p className="text-gray-600">Enter your password to access the dashboard</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter coordinator password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center text-lg"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
              Access Dashboard
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Coordinators Dashboard</h1>
              <p className="text-gray-500 mt-1">Manage programme participants and logbooks</p>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-purple-200">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-purple-100 text-purple-700 font-bold">
                  {user?.full_name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">{user?.full_name}</p>
                <Badge className="bg-purple-100 text-purple-700">Coordinator</Badge>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="participants" className="space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-xl">
            <TabsTrigger value="participants">
              <Users className="w-4 h-4 mr-2" />
              My Participants
            </TabsTrigger>
            <TabsTrigger value="logbooks">
              <BookOpen className="w-4 h-4 mr-2" />
              Logbooks
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="participants">
            <CoordinatorParticipants coordinatorEmail={user.email} />
          </TabsContent>

          <TabsContent value="logbooks">
            <CoordinatorLogbooks coordinatorEmail={user.email} />
          </TabsContent>

          <TabsContent value="messages">
            <CoordinatorMessages coordinatorEmail={user.email} coordinatorName={user.full_name} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}