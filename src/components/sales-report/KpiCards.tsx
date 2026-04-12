'use client';

import type { SalesReportKPIs } from '@/types/sales-report';

interface KpiCardsProps {
  kpis: SalesReportKPIs | null;
  isLoading: boolean;
}

function fmt(v: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(v);
}

export function KpiCards({ kpis, isLoading }: KpiCardsProps) {
  if (isLoading && !kpis) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#0d1424] border border-[#1e2d4a] rounded-xl px-4 py-3 h-20 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!kpis) return null;

  const cards = [
    { label: 'Total Revenue', value: fmt(kpis.totalRevenue), accent: '#10b981', sub: undefined },
    { label: 'Total Profit', value: fmt(kpis.totalProfit), accent: '#3b82f6', sub: undefined },
    {
      label: 'Avg Margin',
      value: kpis.avgProfitMargin > 0 ? `${kpis.avgProfitMargin.toFixed(1)}%` : '—',
      accent: '#3b82f6',
      sub: undefined,
    },
    {
      label: 'Closed This Month',
      value: `${kpis.closedThisMonthCount} deals`,
      accent: '#10b981',
      sub: kpis.closedThisMonthValue > 0 ? fmt(kpis.closedThisMonthValue) : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map(card => (
        <div
          key={card.label}
          className="bg-[#0d1424] border border-[#1e2d4a] rounded-xl px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
          style={{ borderLeftColor: card.accent, borderLeftWidth: 3 }}
        >
          <p className="text-[10px] text-[#475569] uppercase tracking-wider mb-1">{card.label}</p>
          <p className="text-lg font-semibold" style={{ color: card.accent }}>{card.value}</p>
          {card.sub && <p className="text-[10px] text-[#475569] mt-0.5">{card.sub}</p>}
        </div>
      ))}
    </div>
  );
}
