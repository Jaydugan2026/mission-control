'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

interface PipelineDeal {
  id: string;
  name: string;
  stage: string;
  value: number;
  lastContact: string;
  daysInStage: number;
  leadAge: number;
  owner?: string;
  contractValue?: number;
}

interface PipelineStage {
  name: string;
  count: number;
  totalValue: number;
  deals: PipelineDeal[];
}

interface PipelineOverviewProps {
  stages?: PipelineStage[];
  onRefresh?: () => void;
  isLoading?: boolean;
  lastFetched?: Date | null;
}

export function PipelineOverview({ stages = [], onRefresh, isLoading = false, lastFetched }: PipelineOverviewProps) {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  const totalDeals = stages.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="bg-[#050505] border border-[#ffffff30] border-l-[3px] border-l-[#ffffff] rounded-xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#f0f4fc]">Pipeline Overview</h3>
          <p className="text-xs text-[#8895b0] mt-0.5">
            {totalDeals} active deals
            {lastFetched && ` · updated ${lastFetched.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
          </p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-[#3b82f6] transition-colors disabled:opacity-40 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        )}
      </div>

      {/* Stages */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10 text-sm text-[#475569]">Loading pipeline...</div>
      ) : stages.length === 0 ? (
        <div className="flex items-center justify-center py-10 text-sm text-[#475569]">No pipeline data</div>
      ) : (
        <div className="space-y-1.5">
          {stages.map((stage) => (
            <div key={stage.name}>
              <button
                onClick={() => setExpandedStage(expandedStage === stage.name ? null : stage.name)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#0a0a0a] hover:bg-[#141414] border border-[#ffffff20] hover:border-[#ffffff]/60 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono text-[#ffffff] bg-[#ffffff]/10 px-1.5 py-0.5 rounded">
                    {stage.count}
                  </span>
                  <span className="text-sm text-[#f0f4fc] font-medium">{stage.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {expandedStage === stage.name
                    ? <ChevronUp className="w-3.5 h-3.5 text-[#475569]" />
                    : <ChevronDown className="w-3.5 h-3.5 text-[#475569]" />
                  }
                </div>
              </button>

              {expandedStage === stage.name && stage.deals.length > 0 && (
                <div className="mt-1 ml-2 space-y-1 pb-1">
                  {stage.deals.map((deal) => (
                    <div key={deal.id} className="px-3 py-2 rounded-lg bg-[#000000] border border-[#ffffff20] hover:border-[#ffffff]/40 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#f0f4fc]">{deal.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#3d4860]">{deal.daysInStage}d in stage</span>
                        {deal.owner && (
                          <span className="text-xs text-[#8895b0]">· {deal.owner}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Total row */}
          <div className="flex items-center justify-between px-3 py-2 mt-2 border-t border-[#ffffff30] pt-3">
            <span className="text-xs font-semibold text-[#8895b0] uppercase tracking-wide">Total Active</span>
            <span className="text-base font-bold text-[#10b981]">{totalDeals} deals</span>
          </div>
        </div>
      )}
    </div>
  );
}
