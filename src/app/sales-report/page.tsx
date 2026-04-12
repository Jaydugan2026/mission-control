'use client';

import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import Layout from '@/components/layout';
import { useAppStore } from '@/lib/store';
import { KpiCards } from '@/components/sales-report/KpiCards';
import { RepLeaderboard } from '@/components/sales-report/RepLeaderboard';

export default function SalesReportPage() {
  const { salesReport, fetchSalesReport } = useAppStore();
  const { data, isLoading, lastFetched, error } = salesReport;

  useEffect(() => {
    fetchSalesReport();
    const interval = setInterval(fetchSalesReport, 30_000);
    return () => clearInterval(interval);
  }, [fetchSalesReport]);

  return (
    <Layout>
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#f1f5f9]">Sales Report</h1>
          <p className="text-xs text-[#475569] mt-0.5">
            {lastFetched
              ? `Updated ${lastFetched.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
              : 'Revenue · Profit · Rep Performance'}
          </p>
        </div>
        <button
          onClick={() => fetchSalesReport()}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-[#3b82f6] transition-colors disabled:opacity-40 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-[#1a0a0a] border border-[#ef4444]/30 border-l-[3px] border-l-[#ef4444] rounded-xl p-4">
          <p className="text-sm text-[#ef4444]">{error}</p>
        </div>
      )}

      <KpiCards kpis={data?.kpis ?? null} isLoading={isLoading} />

      <div className="bg-[#0d1424] border border-[#1e2d4a] border-l-[3px] border-l-[#3b82f6] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.4)] overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1e2d4a] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#f1f5f9]">Rep Leaderboard</h3>
          {data && (
            <span className="text-xs text-[#475569]">{data.repLeaderboard.length} reps</span>
          )}
        </div>
        <RepLeaderboard rows={data?.repLeaderboard ?? []} isLoading={isLoading} />
      </div>
    </div>
    </Layout>
  );
}
