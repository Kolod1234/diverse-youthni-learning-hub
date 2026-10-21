import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, Button, TextField, Chip, Avatar as MuiAvatar, Tabs as MuiTabs, Tab as MuiTab, Box } from '@mui/material';
const Input = ({ className, ...props }) => <TextField fullWidth size="small" className={className} {...props} />;
const Badge = ({ children, className, variant, ...props }) => <Chip label={children} size="small" variant={variant === 'outline' ? 'outlined' : 'filled'} className={className} {...props} />;
const Avatar = ({ children, className, ...props }) => <MuiAvatar className={className} {...props}>{children}</MuiAvatar>;
const AvatarImage = () => null;
const AvatarFallback = ({ children, className }) => <span className={className}>{children}</span>;
const TabsContext = React.createContext({ value: '', setValue: () => {} });
const Tabs = ({ children, defaultValue, className }) => {
  const [value, setValue] = React.useState(defaultValue);
  return <TabsContext.Provider value={{ value, setValue }}><div className={className}>{children}</div></TabsContext.Provider>;
};
const TabsList = ({ children, className }) => {
  const { value, setValue } = React.useContext(TabsContext);
  return <MuiTabs value={value} onChange={(_, v) => setValue(v)} className={className} sx={{ borderBottom: 1, borderColor: 'divider' }}>{React.Children.map(children, c => c && React.cloneElement(c))}</MuiTabs>;
};
const TabsTrigger = ({ children, value, className, ...props }) => <MuiTab value={value} label={children} className={className} {...props} />;
const TabsContent = ({ children, value, className }) => {
  const ctx = React.useContext(TabsContext);
  if (ctx.value !== value) return null;
  return <Box className={className} sx={{ pt: 2 }}>{children}</Box>;
};
import LockIcon from '@mui/icons-material/Lock';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ChatIcon from '@mui/icons-material/Chat';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import StarIcon from '@mui/icons-material/Star';
import AssignmentIcon from '@mui/icons-material/Assignment';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const Lock = _w(LockIcon), Users = _w(PeopleIcon), BookOpen = _w(MenuBookIcon), MessageSquare = _w(ChatIcon);
const UserCheck = _w(HowToRegIcon), UserX = _w(PersonOffIcon), Star = _w(StarIcon), ClipboardList = _w(AssignmentIcon);
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import CoordinatorParticipants from '@/components/coordinator/CoordinatorParticipants';
import CoordinatorLogbooks from '@/components/coordinator/CoordinatorLogbooks';
import CoordinatorMessages from '@/components/coordinator/CoordinatorMessages';
import ParticipantProgressOverview from '@/components/coordinator/ParticipantProgressOverview';

export default function CoordinatorsDashboard() {
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Access is recorded on the user's account by the verifyAccessCode server function,
        // so it can't be granted by editing browser storage.
        if (userData.is_coordinator && !userData.coordinator_banned && userData.coordinator_access_granted) {
          setHasAccess(true);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await base44.functions.invoke('verifyAccessCode', { type: 'coordinator', code: password });
      if (res.data?.ok) {
        setHasAccess(true);
        toast.success('Access granted!');
      } else {
        toast.error('Incorrect password');
      }
    } catch {
      toast.error('Could not check the password. Please try again.');
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
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <UserX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need coordinator privileges to access this page.</p>
          </div>
        </Card>
      </div>
    );
  }

  if (user.coordinator_banned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <UserX className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Account Suspended</h2>
            <p className="text-muted-foreground">Your coordinator access has been suspended. Please contact an administrator.</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Coordinators Dashboard</h2>
            <p className="text-muted-foreground">Enter your password to access the dashboard</p>
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
            <Button type="submit" variant="contained" fullWidth size="large">
              Access Dashboard
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Coordinators Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage programme participants and logbooks</p>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-indigo-200">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold">
                  {user?.full_name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{user?.full_name}</p>
                <Badge className="bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">Coordinator</Badge>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Overview */}
        <div className="mb-6">
          <ParticipantProgressOverview user={user} />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="participants" className="space-y-6">
          <TabsList>
            <TabsTrigger value="participants">
              <Users className="w-4 h-4 mr-2" />
              My Participants
            </TabsTrigger>
            <TabsTrigger value="logbooks">
              <ClipboardList className="w-4 h-4 mr-2" />
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