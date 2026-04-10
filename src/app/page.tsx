'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon, AlertTriangle, BarChart3 } from 'lucide-react';
import Layout from '@/components/layout';
import { DutyCard } from '@/components/dashboard/DutyCard';
import { AgentProfile } from '@/components/dashboard/AgentProfile';
import { PipelineOverview } from '@/components/dashboard/PipelineOverview';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { LayoutPresetSwitcher } from '@/components/layout/LayoutPresetSwitcher';
import { useAppStore } from '@/lib/store';

const iconMap = {
  Sun,
  Moon,
  AlertTriangle,
  BarChart3,
};

type LayoutPreset = 'balanced' | 'agent-focused';

export default function Dashboard() {
  const { duties, activities, stats, pipeline, fetchPipeline } = useAppStore();
  const [layoutPreset, setLayoutPreset] = useState<LayoutPreset>('balanced');

  // Fetch pipeline data on mount
  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Page header with preset switcher */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#ffffff]">Dashboard</h2>
            <p className="text-sm text-[#666666] mt-1">
              Monitor Peter's executive assistant duties
            </p>
          </div>
          <LayoutPresetSwitcher
            currentPreset={layoutPreset}
            onPresetChange={setLayoutPreset}
          />
        </div>

        {/* Duties grid */}
        <div>
          <h3 className="text-sm font-semibold text-[#ffffff] mb-4">Peter's Duties</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {duties.map((duty) => {
              const Icon = iconMap[duty.icon as keyof typeof iconMap];
              return (
                <DutyCard
                  key={duty.id}
                  {...duty}
                  icon={Icon}
                />
              );
            })}
          </div>
        </div>

        {/* Main content - layout varies by preset */}
        <div className={layoutPreset === 'agent-focused'
          ? "grid grid-cols-1 lg:grid-cols-2 gap-6"
          : "grid grid-cols-1 lg:grid-cols-3 gap-6"
        }>
          {/* Agent Profile - larger in agent-focused mode */}
          <div className={layoutPreset === 'agent-focused' ? "lg:col-span-1" : "lg:col-span-1"}>
            <AgentProfile
              name="Peter"
              role="Executive Assistant"
              status="online"
              clients={pipeline.stages.flatMap(s => s.deals.slice(0, 3))}
              stats={{
                totalDeals: pipeline.stages.reduce((sum, s) => sum + s.count, 0),
                pipelineValue: pipeline.stages.reduce((sum, s) => sum + s.totalValue, 0),
                avgDealValue: 0,
                dealsWon: 0,
                dealsLost: 0,
              }}
            />
          </div>

          {/* Pipeline Overview */}
          <div className={layoutPreset === 'agent-focused' ? "lg:col-span-1" : "lg:col-span-2"}>
            <PipelineOverview
              stages={pipeline.stages}
              onRefresh={fetchPipeline}
              isLoading={pipeline.isLoading}
              lastFetched={pipeline.lastFetched}
            />
          </div>
        </div>

        {/* Activity Feed - full width in agent-focused mode */}
        <div>
          <ActivityFeed activities={activities.slice(0, 5)} />
        </div>

        {/* Last fetched timestamp */}
        {pipeline.lastFetched && (
          <div className="text-xs text-[#666666] text-center">
            Pipeline data last updated: {pipeline.lastFetched.toLocaleString()}
          </div>
        )}
      </div>
    </Layout>
  );
}
