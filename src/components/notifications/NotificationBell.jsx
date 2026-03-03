import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Bell, X, Check, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';

export default function NotificationBell() {
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const prevUnreadRef = useRef(0);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
        // User not authenticated, that's okay
      }
    };
    loadUser();
  }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ recipient_email: user?.email }, '-created_date', 50),
    refetchOnWindowFocus: true,
    enabled: !!user?.email,
    refetchInterval: 10000, // Poll every 10 seconds
  });

  // Real-time subscription for instant notifications (e.g. live agent alerts)
  useEffect(() => {
    if (!user?.email) return;
    const unsub = base44.entities.Notification.subscribe((event) => {
      if (event.data?.recipient_email === user.email) {
        queryClient.invalidateQueries({ queryKey: ['notifications', user.email] });
      }
    });
    return unsub;
  }, [user?.email, queryClient]);

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => base44.entities.Notification.update(notificationId, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId) => base44.entities.Notification.delete(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
    setShowNotifications(false);
  };

  const markAllAsRead = () => {
    notifications.filter(n => !n.is_read).forEach(n => {
      markAsReadMutation.mutate(n.id);
    });
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative text-white hover:text-white"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowNotifications(false)}
          />
          <Card className="absolute right-0 top-12 w-96 max-h-[500px] overflow-hidden flex flex-col z-50 shadow-2xl">
           <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
             <h3 className="font-semibold text-gray-900">Notifications</h3>
             <div className="flex items-center gap-2">
               {unreadCount > 0 && (
                 <Button
                   size="sm"
                   variant="ghost"
                   onClick={markAllAsRead}
                   className="text-xs"
                 >
                   Mark all read
                 </Button>
               )}
               <Button
                 size="sm"
                 variant="ghost"
                 onClick={() => {
                   setShowNotifications(false);
                   navigate(createPageUrl('NotificationCenter'));
                 }}
                 className="h-6 w-6 p-0"
               >
                 <Settings className="w-4 h-4" />
               </Button>
             </div>
           </div>

            <div className="flex-1 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer group ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        !notification.is_read ? 'bg-blue-600' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                        {notification.type && notification.type !== 'general' && (
                          <span className="inline-block text-xs bg-blue-100 text-blue-700 rounded px-1.5 py-0.5 mr-1 mt-1">{notification.type}</span>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {format(new Date(notification.created_date), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotificationMutation.mutate(notification.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No notifications</p>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}