'use client';

import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface Activity {
  id: string;
  type: 'duty_executed' | 'email_sent' | 'api_call' | 'error' | 'warning';
  title: string;
  timestamp: Date;
  details?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getIconForType = (type: Activity['type']) => {
    switch (type) {
      case 'duty_executed':
        return '✅';
      case 'email_sent':
        return '📧';
      case 'api_call':
        return '📡';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return '•';
    }
  };

  const getBadgeVariant = (type: Activity['type']) => {
    switch (type) {
      case 'duty_executed':
        return 'success';
      case 'email_sent':
        return 'info';
      case 'api_call':
        return 'default';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Card variant="bordered" padding="md" className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#ffffff]">Recent Activity</h3>
        <button className="text-xs text-[#666666] hover:text-[#ffffff] transition-colors">
          View All →
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-[#666666] text-sm">
            No recent activity
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 pb-3 border-b border-[#222222] last:border-0 last:pb-0"
            >
              <div className="text-sm">{getIconForType(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#ffffff] truncate">{activity.title}</span>
                  <Badge variant={getBadgeVariant(activity.type)} size="sm">
                    {activity.type.replace('_', ' ')}
                  </Badge>
                </div>
                {activity.details && (
                  <p className="text-xs text-[#666666] mt-1">{activity.details}</p>
                )}
                <p className="text-xs text-[#444444] mt-1">{formatTime(activity.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
