'use client';

import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface AgentStatusProps {
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
  currentTask?: string;
  stats: {
    dutiesRun: number;
    emailsSent: number;
    lastActive: Date;
  };
}

export function AgentStatus({ name, role, status, currentTask, stats }: AgentStatusProps) {
  const statusColors = {
    online: 'bg-[#10b981]',
    offline: 'bg-[#444444]',
    busy: 'bg-[#f59e0b]',
  };

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return 'Now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Card variant="bordered" padding="md" className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center">
          <span className="text-2xl">🕷️</span>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-[#ffffff]">{name}</h3>
          <p className="text-xs text-[#666666]">{role}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 ${statusColors[status]} rounded-full pulse-glow`} />
          <span className="text-xs text-[#a0a0a0] capitalize">{status}</span>
        </div>
      </div>

      {/* Current task */}
      {currentTask && (
        <div className="text-xs">
          <span className="text-[#666666]">Running: </span>
          <span className="text-[#ffffff]">{currentTask}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#222222]">
        <div>
          <div className="text-lg font-semibold text-[#ffffff]">{stats.dutiesRun}</div>
          <div className="text-xs text-[#666666]">Duties Run</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-[#ffffff]">{stats.emailsSent}</div>
          <div className="text-xs text-[#666666]">Emails Sent</div>
        </div>
      </div>

      {/* Last active */}
      <div className="text-xs text-[#666666]">
        Last active: <span className="text-[#a0a0a0]">{formatLastActive(stats.lastActive)}</span>
      </div>
    </Card>
  );
}
