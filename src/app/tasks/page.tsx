'use client';

import { Sun, Moon, AlertTriangle, BarChart3 } from 'lucide-react';
import Layout from '@/components/layout';
import { DutyCard } from '@/components/dashboard/DutyCard';
import { useAppStore } from '@/lib/store';

const iconMap = {
  Sun,
  Moon,
  AlertTriangle,
  BarChart3,
};

export default function TasksPage() {
  const { duties } = useAppStore();

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-[#ffffff]">Tasks</h2>
          <p className="text-sm text-[#666666] mt-1">
            Peter's executive assistant duties
          </p>
        </div>

        {/* All duties in a larger grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {duties.map((duty) => {
            const Icon = iconMap[duty.icon as keyof typeof iconMap];
            return (
              <div key={duty.id} className="min-h-[220px]">
                <DutyCard
                  {...duty}
                  icon={Icon}
                />
              </div>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="bg-[#0a0a0a] border border-[#222222] rounded-xl p-6">
          <h3 className="text-sm font-semibold text-[#ffffff] mb-3">How to Run Duties</h3>
          <ol className="space-y-2 text-sm text-[#a0a0a0]">
            <li>1. Open Claude Code and run the slash command:</li>
            <li className="pl-4 text-[#ffffff]">
              <code>/peter-morning-brief</code>, <code>/peter-wrap-up</code>, etc.
            </li>
            <li>2. The duty status will update here after execution</li>
            <li>3. Peter sends an email to JD@fortituderoofing.co</li>
          </ol>
        </div>
      </div>
    </Layout>
  );
}
