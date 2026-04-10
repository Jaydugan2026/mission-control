'use client';

import { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface PipelineDeal {
  id: string;
  name: string;
  stage: string;
  value: number;
  lastContact: string;
  daysInStage: number;
  notes?: string;
  nextAction?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
  };
  history?: Array<{
    date: string;
    action: string;
    notes: string;
  }>;
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const toggleStage = (stageName: string) => {
    setExpandedStage(expandedStage === stageName ? null : stageName);
  };

  const totalPipelineValue = stages.reduce((sum, stage) => sum + stage.totalValue, 0);
  const totalDeals = stages.reduce((sum, stage) => sum + stage.count, 0);

  if (isLoading) {
    return (
      <Card variant="bordered" padding="lg">
        <div className="flex items-center justify-center py-12">
          <div className="text-[#666666]">Loading pipeline data...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="bordered" padding="lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[#ffffff]">Pipeline Overview</h3>
          <p className="text-sm text-[#666666] mt-1">
            {totalDeals} deals · {formatCurrency(totalPipelineValue)} total
          </p>
          {lastFetched && (
            <p className="text-xs text-[#444444] mt-1">
              Updated: {lastFetched.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </p>
          )}
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={`text-xs px-3 py-1.5 rounded border transition-all ${
              isLoading
                ? 'text-[#444444] border-[#222222] cursor-not-allowed'
                : 'text-[#666666] border-[#222222] hover:text-[#ffffff] hover:border-[#444444]'
            }`}
          >
            {isLoading ? '↻ Loading...' : '↻ Refresh'}
          </button>
        )}
      </div>

      {/* Stages */}
      <div className="space-y-2">
        {stages.length === 0 ? (
          <div className="text-center py-8 text-[#666666] text-sm">
            No pipeline data available
          </div>
        ) : (
          stages.map((stage) => (
            <Card
              key={stage.name}
              variant="bordered"
              padding="sm"
              className="cursor-pointer transition-all hover:border-[#333333]"
              onClick={() => toggleStage(stage.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="default" size="sm">{stage.count}</Badge>
                  <span className="text-sm font-semibold text-[#ffffff]">{stage.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[#4a9eff] font-semibold">
                    {formatCurrency(stage.totalValue)}
                  </span>
                  <span className="text-xs text-[#666666]">
                    {expandedStage === stage.name ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Expanded Deals */}
              {expandedStage === stage.name && (
                <div className="mt-3 pt-3 border-t border-[#222222] space-y-2">
                  {stage.deals.map((deal) => (
                    <div
                      key={deal.id}
                      className="p-3 bg-[#0a0a0a] rounded border border-[#222222] space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-semibold text-[#ffffff]">{deal.name}</div>
                          <div className="text-xs text-[#666666] mt-1">
                            {formatCurrency(deal.value)} · {deal.daysInStage}d in stage
                          </div>
                        </div>
                      </div>

                      {/* Next Action */}
                      {deal.nextAction && (
                        <div className="text-xs">
                          <span className="text-[#666666]">Next: </span>
                          <span className="text-[#f59e0b]">{deal.nextAction}</span>
                        </div>
                      )}

                      {/* Notes */}
                      {deal.notes && (
                        <div className="text-xs text-[#a0a0a0]">{deal.notes}</div>
                      )}

                      {/* Contact Info */}
                      {deal.contactInfo && (
                        <div className="flex gap-3 text-xs text-[#666666]">
                          {deal.contactInfo.email && (
                            <span>📧 {deal.contactInfo.email}</span>
                          )}
                          {deal.contactInfo.phone && (
                            <span>📱 {deal.contactInfo.phone}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </Card>
  );
}
