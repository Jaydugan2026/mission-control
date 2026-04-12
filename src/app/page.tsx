'use client';

import { useEffect } from 'react';
import Layout from '@/components/layout';
import { StaleLeadsSpotlight } from '@/components/dashboard/StaleLeadsSpotlight';
import { PipelineOverview } from '@/components/dashboard/PipelineOverview';
import { FinancialKPIs } from '@/components/dashboard/FinancialKPIs';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { useAppStore } from '@/lib/store';

export default function Dashboard() {
  const { activities, pipeline, financials, fetchPipeline, fetchFinancials } = useAppStore();

  useEffect(() => {
    // Initial fetch
    fetchPipeline();
    fetchFinancials();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPipeline, 30000);
    const financialInterval = setInterval(fetchFinancials, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(financialInterval);
    };
  }, [fetchPipeline, fetchFinancials]);

  const staleLeads = pipeline.stalled ?? [];

  return (
    <Layout>
      <div className="p-6 space-y-5 fade-in">
        {/* Page title */}
        <div>
          <h1 className="text-xl font-semibold text-[#f0f4fc]">Dashboard</h1>
          <p className="text-xs text-[#8895b0] mt-0.5">Live pipeline status</p>
        </div>

        {/* Hero: Stale Leads Spotlight */}
        <StaleLeadsSpotlight leads={staleLeads} isLoading={pipeline.isLoading} />

        {/* Financial KPIs */}
        <FinancialKPIs
          metrics={financials.metrics}
          isLoading={financials.isLoading}
          lastFetched={financials.lastFetched}
        />

        {/* Pipeline Overview */}
        <PipelineOverview
          stages={pipeline.stages}
          onRefresh={fetchPipeline}
          isLoading={pipeline.isLoading}
          lastFetched={pipeline.lastFetched}
        />

        {/* Activity Feed */}
        <ActivityFeed activities={activities.slice(0, 8)} />
      </div>
    </Layout>
  );
}
