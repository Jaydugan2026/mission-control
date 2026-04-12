'use client';

import { useEffect } from 'react';
import Layout from '@/components/layout';
import { FallingPattern } from '@/components/ui/falling-pattern';
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
      {/* Subtle falling pattern background effect */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        <FallingPattern
          color="var(--copper)"
          backgroundColor="transparent"
          duration={200}
          blurIntensity="0.5em"
          density={1.2}
        />
      </div>

      <div className="relative p-6 space-y-5 fade-in z-10">
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
