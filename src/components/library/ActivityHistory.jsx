import React from 'react';
import { History, Eye, Download, Share2, MessageSquare, Upload, Edit } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const activityIcons = {
  uploaded: Upload,
  viewed: Eye,
  downloaded: Download,
  shared: Share2,
  commented: MessageSquare,
  updated: Edit
};

const activityColors = {
  uploaded: 'text-green-600 bg-green-50',
  viewed: 'text-blue-600 bg-blue-50',
  downloaded: 'text-purple-600 bg-purple-50',
  shared: 'text-indigo-600 bg-indigo-50',
  commented: 'text-orange-600 bg-orange-50',
  updated: 'text-yellow-600 bg-yellow-50'
};

export default function ActivityHistory({ resourceId }) {
  const { data: activities = [] } = useQuery({
    queryKey: ['file-activities', resourceId],
    queryFn: () => base44.entities.FileActivity.filter({ resource_id: resourceId }, '-created_date', 50)
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <History className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Activity History</h3>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.action] || History;
          const colorClass = activityColors[activity.action] || 'text-gray-600 bg-gray-50';

          return (
            <div key={activity.id} className="flex gap-3 items-start">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {activity.action}
                  </span>
                  {activity.user_name && (
                    <span className="text-xs text-gray-500">by {activity.user_name}</span>
                  )}
                </div>
                {activity.details && (
                  <p className="text-xs text-gray-600 mt-0.5">{activity.details}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(activity.created_date).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
        {activities.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-4">No activity yet</p>
        )}
      </div>
    </div>
  );
}