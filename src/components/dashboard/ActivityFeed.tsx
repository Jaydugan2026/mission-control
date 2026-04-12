'use client';

import { CheckCircle, Mail, Radio, XCircle, AlertTriangle, Circle } from 'lucide-react';

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

const typeConfig: Record<Activity['type'], { icon: React.ElementType; color: string; bg: string }> = {
  duty_executed: { icon: CheckCircle,    color: 'text-[#10b981]', bg: 'bg-[#10b981]/10' },
  email_sent:    { icon: Mail,           color: 'text-[#3b82f6]', bg: 'bg-[#3b82f6]/10' },
  api_call:      { icon: Radio,          color: 'text-[#94a3b8]', bg: 'bg-[#94a3b8]/10' },
  error:         { icon: XCircle,        color: 'text-[#ef4444]', bg: 'bg-[#ef4444]/10' },
  warning:       { icon: AlertTriangle,  color: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/10' },
};

const formatTime = (date: Date) =>
  date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-[#0a0a0a] border border-[#ffffff30] border-l-[3px] border-l-[#ffffff] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#f1f5f9]">Recent Activity</h3>
        <Circle className="w-1.5 h-1.5 fill-[#10b981] text-[#10b981]" />
      </div>

      <div className="space-y-2">
        {activities.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-sm text-[#475569]">
            No recent activity
          </div>
        ) : (
          activities.map((activity) => {
            const cfg = typeConfig[activity.type];
            const Icon = cfg.icon;
            return (
              <div key={activity.id} className="flex items-start gap-3 py-2 border-b border-[#ffffff20] last:border-0">
                <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#f1f5f9] truncate">{activity.title}</p>
                  {activity.details && (
                    <p className="text-xs text-[#475569] mt-0.5 truncate">{activity.details}</p>
                  )}
                </div>
                <span className="text-xs text-[#475569] font-mono shrink-0">{formatTime(activity.timestamp)}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
