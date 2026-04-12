'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { RepLeaderboardRow } from '@/types/sales-report';

interface RepLeaderboardProps {
  rows: RepLeaderboardRow[];
  isLoading: boolean;
}

function fmt(v: number | null) {
  if (v === null || v === 0) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(v);
}

function fmtPct(v: number | null) {
  if (v === null || v === 0) return '—';
  return `${v.toFixed(1)}%`;
}

function marginColor(m: number) {
  if (m >= 20) return '#10b981';
  if (m >= 10) return '#f59e0b';
  return '#ef4444';
}

export function RepLeaderboard({ rows, isLoading }: RepLeaderboardProps) {
  const [expandedReps, setExpandedReps] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<keyof RepLeaderboardRow>('revenue');
  const [sortAsc, setSortAsc] = useState(false);

  function toggleRep(repName: string) {
    setExpandedReps(prev => {
      const next = new Set(prev);
      next.has(repName) ? next.delete(repName) : next.add(repName);
      return next;
    });
  }

  function toggleSort(key: keyof RepLeaderboardRow) {
    if (sortKey === key) setSortAsc(v => !v);
    else { setSortKey(key); setSortAsc(false); }
  }

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    if (typeof av === 'string' && typeof bv === 'string') {
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  const cols: { key: keyof RepLeaderboardRow; label: string }[] = [
    { key: 'repName', label: 'Rep' },
    { key: 'dealCount', label: 'Deals' },
    { key: 'pipelineValue', label: 'Pipeline' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'profit', label: 'Profit' },
    { key: 'margin', label: 'Margin' },
  ];

  if (isLoading && rows.length === 0) {
    return (
      <div className="p-4 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 bg-[#1e2d4a]/40 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="p-4 text-xs text-[#475569]">
        No reps with matched financial data. Check that Google Sheets is synced.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#1e2d4a]">
            {/* expand toggle column */}
            <th className="w-8" />
            {cols.map(col => (
              <th
                key={col.key as string}
                onClick={() => toggleSort(col.key)}
                className="px-4 py-2.5 text-left text-[#475569] uppercase tracking-wider cursor-pointer hover:text-[#94a3b8] select-none whitespace-nowrap"
              >
                {col.label}{sortKey === col.key ? (sortAsc ? ' ↑' : ' ↓') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const isExpanded = expandedReps.has(row.repName);
            return (
              <>
                {/* Rep summary row */}
                <tr
                  key={row.repName}
                  onClick={() => toggleRep(row.repName)}
                  className="border-b border-[#1e2d4a]/40 hover:bg-[#1e2d4a]/20 cursor-pointer"
                >
                  <td className="pl-3 pr-1 py-2.5 text-[#475569]">
                    {isExpanded
                      ? <ChevronDown className="w-3.5 h-3.5" />
                      : <ChevronRight className="w-3.5 h-3.5" />
                    }
                  </td>
                  <td className="px-4 py-2.5 text-[#f1f5f9] font-medium">
                    {i === 0 && <span className="mr-1.5 text-[#f59e0b]">★</span>}
                    {row.repName}
                  </td>
                  <td className="px-4 py-2.5 text-[#94a3b8]">{row.dealCount}</td>
                  <td className="px-4 py-2.5 text-[#94a3b8]">{fmt(row.pipelineValue)}</td>
                  <td className="px-4 py-2.5 text-[#10b981]">{fmt(row.revenue)}</td>
                  <td className="px-4 py-2.5 text-[#3b82f6]">{fmt(row.profit)}</td>
                  <td
                    className="px-4 py-2.5 font-semibold"
                    style={{ color: marginColor(row.margin) }}
                  >
                    {fmtPct(row.margin)}
                  </td>
                </tr>

                {/* Expanded deal rows */}
                {isExpanded && row.deals.map((deal, di) => (
                  <tr
                    key={`${row.repName}-deal-${di}`}
                    className="border-b border-[#1e2d4a]/20 bg-[#080e1a]"
                  >
                    {/* indent */}
                    <td className="pl-3" />
                    <td className="px-4 py-2 text-[#94a3b8] max-w-[180px]">
                      <span className="truncate block">{deal.jobName}</span>
                      <span className="text-[#334155] text-[10px]">{deal.status}</span>
                    </td>
                    <td className="px-4 py-2 text-[#334155]">—</td>
                    <td className="px-4 py-2 text-[#475569]">{fmt(deal.contractValue)}</td>
                    <td className="px-4 py-2 text-[#10b981]">{fmt(deal.salePrice)}</td>
                    <td className="px-4 py-2 text-[#3b82f6]">{fmt(deal.totalProfit)}</td>
                    <td
                      className="px-4 py-2"
                      style={{ color: deal.profitMargin ? marginColor(deal.profitMargin) : '#334155' }}
                    >
                      {fmtPct(deal.profitMargin)}
                    </td>
                  </tr>
                ))}

                {/* Subtotal row when expanded */}
                {isExpanded && (
                  <tr key={`${row.repName}-subtotal`} className="border-b border-[#1e2d4a] bg-[#080e1a]">
                    <td />
                    <td className="px-4 py-2 text-[#475569] text-[10px] uppercase tracking-wider">
                      {row.deals.length} matched deals
                    </td>
                    <td />
                    <td className="px-4 py-2 text-[#475569] text-[10px]">Contract</td>
                    <td className="px-4 py-2 text-[#10b981] text-[10px] font-semibold">{fmt(row.revenue)} total</td>
                    <td className="px-4 py-2 text-[#3b82f6] text-[10px] font-semibold">{fmt(row.profit)} total</td>
                    <td className="px-4 py-2 text-[#475569] text-[10px]">{fmtPct(row.margin)} avg</td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
