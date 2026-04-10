'use client';

import { LucideIcon } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface DutyCardProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  schedule: string | null;
  lastRun: Date | null;
  lastRunStatus: 'success' | 'error' | 'idle' | null;
}

export function DutyCard({
  id,
  name,
  description,
  icon: Icon,
  schedule,
  lastRun,
  lastRunStatus,
}: DutyCardProps) {
  const formatLastRun = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const statusIcon = () => {
    if (lastRunStatus === 'success') return '✓';
    if (lastRunStatus === 'error') return '✗';
    return '•';
  };

  const statusColor = () => {
    if (lastRunStatus === 'success') return 'text-[#10b981]';
    if (lastRunStatus === 'error') return 'text-[#ef4444]';
    return 'text-[#666666]';
  };

  return (
    <Card variant="bordered" padding="lg" className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#111111] border border-[#222222] flex items-center justify-center">
            <Icon className="w-5 h-5 text-[#ffffff]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#ffffff]">{name}</h3>
            <p className="text-xs text-[#666666]">{description}</p>
          </div>
        </div>
      </div>

      {/* Schedule badge */}
      <div className="flex items-center gap-2">
        <Badge variant={schedule ? 'info' : 'default'} size="sm">
          {schedule || 'On-Demand'}
        </Badge>
      </div>

      {/* Last run status */}
      <div className="text-xs text-[#666666] flex items-center gap-2">
        <span>Last run:</span>
        <span className="text-[#a0a0a0]">{formatLastRun(lastRun)}</span>
        <span className={statusColor()}>{statusIcon()}</span>
      </div>
    </Card>
  );
}
