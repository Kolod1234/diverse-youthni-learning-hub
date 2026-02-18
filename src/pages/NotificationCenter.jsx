import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bell, Trash2, Check, CheckCircle, AlertCircle, Mail, Zap } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import NotificationPreferences from '@/components/notifications/NotificationPreferences';

const notificationTypeConfig = {
  logbook: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
  program: { color: 'bg-blue-100 text-blue-800', icon: Zap },
  message: { color: 'bg-indigo-100 text-indigo-800', icon: Mail },
  session_reminder: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
  session_started: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  quiz: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
  general: { color: 'bg-gray-100 text-gray-800', icon: Bell },
};

export default function NotificationCenter() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ['all-notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user?.email }, '-created_date', 200),
    enabled: !!user?.email,
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => base44.entities.Notification.update(notificationId, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-notifications']);
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId) => base44.entities.Notification.delete(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-notifications']);
      toast.success('Notification deleted');
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-notifications']);
      toast.success('All notifications marked as read');
    },
  });

  const deleteAllNotificationsMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(notifications.map(n => base44.entities.Notification.delete(n.id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-notifications']);
      toast.success('All notifications deleted');
    },
  });

  const getFilteredNotifications = () => {
    if (activeTab === 'all') return notifications;
    if (activeTab === 'unread') return notifications.filter(n => !n.is_read);
    return notifications.filter(n => n.type === activeTab);
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  const NotificationItem = ({ notification }) => {
    const typeConfig = notificationTypeConfig[notification.type] || notificationTypeConfig.general;
    const Icon = typeConfig.icon;

    return (
      <div
        className={`p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer group ${
          !notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
        }`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-lg flex-shrink-0 ${typeConfig.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!notification.is_read && (
                  <Badge className="bg-blue-600">New</Badge>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotificationMutation.mutate(notification.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Tabs */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-6">
              <TabsTrigger value="all" className="flex items-center gap-1">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">All</span>
              </TabsTrigger>
              <TabsTrigger value="unread" className="relative">
                <span className="hidden sm:inline">Unread</span>
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full text-xs font-bold bg-red-600 text-white">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="logbook">Logbooks</TabsTrigger>
              <TabsTrigger value="program">Programs</TabsTrigger>
              <TabsTrigger value="message">Messages</TabsTrigger>
              <TabsTrigger value="settings" className="col-span-1 md:col-span-1">Settings</TabsTrigger>
            </TabsList>

            {/* All/Unread/Type Notifications */}
            {['all', 'unread', 'logbook', 'program', 'message', 'session_reminder', 'quiz', 'general'].includes(activeTab) && (
              <TabsContent value={activeTab} className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Notification Center</h2>
                  {unreadCount > 0 && activeTab === 'all' && (
                    <Button
                      onClick={() => markAllAsReadMutation.mutate()}
                      disabled={markAllAsReadMutation.isPending}
                      variant="outline"
                      className="gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Mark all read
                    </Button>
                  )}
                </div>

                {filteredNotifications.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {filteredNotifications.map(notification => (
                        <NotificationItem key={notification.id} notification={notification} />
                      ))}
                    </div>
                    {filteredNotifications.length > 0 && (
                      <div className="flex justify-center mt-6">
                        <Button
                          onClick={() => deleteAllNotificationsMutation.mutate()}
                          disabled={deleteAllNotificationsMutation.isPending}
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Clear all notifications
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <Card className="p-12 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No notifications</p>
                    <p className="text-gray-400 text-sm mt-2">You're all caught up!</p>
                  </Card>
                )}
              </TabsContent>
            )}

            {/* Notification Preferences */}
            <TabsContent value="settings" className="space-y-6">
              <NotificationPreferences />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}