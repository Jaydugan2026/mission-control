'use client';

import { AlertTriangle, CheckCircle } from 'lucide-react';

interface StaleLead {
  id: string;
  name: string;
  stage: string;
  daysInStage: number;
}

interface StaleLeadsSpotlightProps {
  leads: StaleLead[];
  isLoading?: boolean;
}

function urgencyColor(days: number): { bar: string; text: string; badge: string } {
  if (days >= 7) return { bar: 'bg-[#ef4444]', text: 'text-[#ef4444]', badge: 'bg-[#ef4444]/10 border-[#ef4444]/25 text-[#ef4444]' };
  if (days >= 4) return { bar: 'bg-[#f59e0b]', text: 'text-[#f59e0b]', badge: 'bg-[#f59e0b]/10 border-[#f59e0b]/25 text-[#f59e0b]' };
  return { bar: 'bg-[#3b82f6]', text: 'text-[#3b82f6]', badge: 'bg-[#3b82f6]/10 border-[#3b82f6]/25 text-[#3b82f6]' };
}

export function StaleLeadsSpotlight({ leads, isLoading = false }: StaleLeadsSpotlightProps) {
  return (
    <div className="bg-[#050505] border border-[#ffffff30] border-l-[3px] border-l-[#c88b5a] rounded-xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.5)] fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
          <h2 className="text-sm font-semibold text-[#f0f4fc]">Needs Attention</h2>
          {!isLoading && leads.length > 0 && (
            <span className="text-xs font-mono text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/25 px-1.5 py-0.5 rounded">
              {leads.length}
            </span>
          )}
        </div>
        <span className="text-xs text-[#3d4860]">3+ days stale</span>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-[#1a1a1a] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="flex items-center gap-3 py-6">
          <CheckCircle className="w-5 h-5 text-[#10b981] shrink-0" />
          <span className="text-sm text-[#10b981] font-medium">All leads active — nothing stale</span>
        </div>
      ) : (
        <div className="space-y-2">
          {leads.map((lead) => {
            const colors = urgencyColor(lead.daysInStage);
            const barWidth = Math.min((lead.daysInStage / 14) * 100, 100);
            return (
              <div key={lead.id} className="group px-3 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#ffffff20] hover:border-[#c88b5a]/50 transition-all duration-200">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-[#f0f4fc] truncate">{lead.name}</span>
                    <span className="text-xs text-[#3d4860] shrink-0">·</span>
                    <span className="text-xs text-[#8895b0] truncate shrink-0">{lead.stage}</span>
                  </div>
                  <span className={`text-xs font-mono font-semibold ${colors.text} shrink-0 ml-2`}>
                    {lead.daysInStage}d
                  </span>
                </div>
                {/* Urgency bar */}
                <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
