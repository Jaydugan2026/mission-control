'use client';

import { TrendingUp, DollarSign, Percent } from 'lucide-react';

interface FinancialMetrics {
  totalProfit: number;
  totalRevenue: number;
  totalCosts: number;
  avgProfitMargin: number;
  profitByRep: Record<string, number>;
  jobsWithMatches: number;
  jobsWithoutMatches: number;
}

interface FinancialKPIsProps {
  metrics: FinancialMetrics | null;
  isLoading: boolean;
  lastFetched?: Date | null;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

const formatPercent = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(v / 100);

export function FinancialKPIs({ metrics, isLoading, lastFetched }: FinancialKPIsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#0a0a0a] border border-[#ffffff30] rounded-xl px-4 py-3 animate-pulse">
            <div className="h-8 bg-[#1a1a1a] rounded w-24 mb-2" />
            <div className="h-3 bg-[#1a1a1a] rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-[#0a0a0a] border border-[#ffffff30] border-l-[3px] border-l-[#f59e0b] rounded-xl p-4">
        <p className="text-sm text-[#f59e0b]">
          Financial data not configured. Please set up Google Sheets integration.
        </p>
      </div>
    );
  }

  const kpiCards = [
    {
      label: 'Total Profit',
      value: formatCurrency(metrics.totalProfit),
      icon: TrendingUp,
      color: 'text-[#10b981]',
      bgColor: 'bg-[#10b981]/10',
    },
    {
      label: 'Avg Profit Margin',
      value: formatPercent(metrics.avgProfitMargin),
      icon: Percent,
      color: 'text-[#3b82f6]',
      bgColor: 'bg-[#3b82f6]/10',
    },
    {
      label: 'Total Costs',
      value: formatCurrency(metrics.totalCosts),
      icon: DollarSign,
      color: 'text-[#f59e0b]',
      bgColor: 'bg-[#f59e0b]/10',
    },
  ];

  return (
    <div className="space-y-3">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-[#0a0a0a] border border-[#ffffff30] border-l-[3px] border-l-[#ffffff] rounded-xl px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-6 h-6 rounded-lg ${kpi.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                </div>
                <span className="text-xs text-[#475569]">{kpi.label}</span>
              </div>
              <div className={`text-lg font-bold font-mono ${kpi.color}`}>{kpi.value}</div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#475569]">
          {metrics.jobsWithMatches} jobs matched · {metrics.jobsWithoutMatches} unmatched
        </span>
        {lastFetched && (
          <span className="text-[#475569]">
            updated {lastFetched.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}
