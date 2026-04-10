'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/lib/store';

export default function OfficePage() {
  const { duties, agentStatus, currentTask } = useAppStore();
  const [isAnimating, setIsAnimating] = useState(true);

  // Find duty with running status
  const runningDuty = duties.find((d) => d.lastRunStatus === 'idle' && d.lastRun && (Date.now() - d.lastRun.getTime()) < 60000);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-[#ffffff]">Peter's Office</h2>
          <p className="text-sm text-[#666666] mt-1">
            Live visualization of Peter at work
          </p>
        </div>

        {/* Pixel Art Office */}
        <Card variant="bordered" padding="none" className="overflow-hidden">
          <div className="bg-[#0a0a0a] p-8">
            <svg
              viewBox="0 0 400 300"
              className="w-full max-w-lg mx-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background wall */}
              <rect x="50" y="50" width="300" height="200" fill="#111111" />

              {/* Window */}
              <rect x="80" y="70" width="80" height="60" fill="#1a1a1a" stroke="#333" strokeWidth="2" />
              <line x1="120" y1="70" x2="120" y2="130" stroke="#333" strokeWidth="2" />
              <line x1="80" y1="100" x2="160" y2="100" stroke="#333" strokeWidth="2" />

              {/* Desk */}
              <rect x="150" y="180" width="120" height="60" fill="#1a1a1a" stroke="#333" strokeWidth="2" />
              <rect x="155" y="185" width="110" height="50" fill="#0a0a0a" />

              {/* Computer monitor */}
              <rect x="180" y="150" width="60" height="40" fill="#1a1a1a" stroke="#333" strokeWidth="2" />
              <rect x="185" y="155" width="50" height="30" fill="#0a0a0a" />
              {/* Screen glow */}
              <rect x="188" y="158" width="44" height="24" fill="#1a2a4a" opacity="0.3">
                <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2s" repeatCount="indefinite" />
              </rect>
              {/* Monitor stand */}
              <rect x="195" y="190" width="30" height="10" fill="#333" />

              {/* Peter (pixel art spider) */}
              <g transform="translate(200, 140)">
                {/* Body */}
                <rect x="-15" y="0" width="30" height="35" fill="#1d4ed8" />
                <rect x="-12" y="5" width="24" height="25" fill="#dc2626" />

                {/* Head */}
                <rect x="-12" y="-20" width="24" height="22" fill="#1d4ed8" />

                {/* Eyes */}
                <ellipse cx="-5" cy="-12" rx="5" ry="7" fill="#ffffff" />
                <ellipse cx="5" cy="-12" rx="5" ry="7" fill="#ffffff" />
                <ellipse cx="-4" cy="-11" rx="2" ry="4" fill="#1d4ed8" />
                <ellipse cx="6" cy="-11" rx="2" ry="4" fill="#1d4ed8" />

                {/* Arms */}
                <rect x="-25" y="5" width="10" height="25" fill="#1d4ed8" />
                <rect x="15" y="5" width="10" height="25" fill="#1d4ed8" />

                {/* Legs (sitting) */}
                <rect x="-12" y="35" width="10" height="20" fill="#1d4ed8" />
                <rect x="2" y="35" width="10" height="20" fill="#1d4ed8" />

                {/* Spider emblem */}
                <path d="M-5 15 L0 20 L5 15 M-3 18 L0 22 L3 18" fill="#000" opacity="0.5" />
              </g>

              {/* Status indicator above Peter */}
              <g transform="translate(200, 90)">
                <circle cx="0" cy="0" r="8" fill={runningDuty ? '#ffffff' : '#444444'}>
                  {runningDuty && (
                    <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
                  )}
                </circle>
              </g>

              {/* Floor */}
              <rect x="50" y="240" width="300" height="10" fill="#222" />

              {/* Decorative plant */}
              <rect x="280" y="200" width="20" height="40" fill="#1a1a1a" />
              <circle cx="290" cy="190" r="15" fill="#1a3a1a" />
              <circle cx="285" cy="185" r="8" fill="#2a5a2a" />
              <circle cx="295" cy="185" r="8" fill="#2a5a2a" />

              {/* Coffee mug on desk */}
              <rect x="250" y="185" width="15" height="18" fill="#333" stroke="#444" strokeWidth="1" />
              <rect x="265" y="190" width="5" height="10" fill="#444" />
              <ellipse cx="257.5" cy="185" rx="7.5" ry="3" fill="#1a1a1a" />

              {/* Status text */}
              <text x="200" y="280" textAnchor="middle" fill="#666" fontSize="12" fontFamily="monospace">
                {runningDuty ? `Running: ${runningDuty.name}` : 'Status: Idle'}
              </text>

              {/* Progress bar if running */}
              {runningDuty && (
                <g transform="translate(150, 260)">
                  <rect x="0" y="0" width="100" height="6" fill="#222" rx="3" />
                  <rect x="2" y="2" width="60" height="2" fill="#ffffff" rx="1">
                    <animate attributeName="width" values="0;96;0" dur="3s" repeatCount="indefinite" />
                  </rect>
                </g>
              )}
            </svg>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="bordered" padding="md" className="text-center">
            <div className="text-2xl font-bold text-[#ffffff]">
              {duties.filter((d) => d.lastRun && (Date.now() - d.lastRun.getTime()) < 60000).length}
            </div>
            <div className="text-xs text-[#666666] mt-1">Active Duties</div>
          </Card>
          <Card variant="bordered" padding="md" className="text-center">
            <div className="text-2xl font-bold text-[#ffffff]">
              {duties.filter((d) => d.lastRun && new Date(d.lastRun).toDateString() === new Date().toDateString()).length}
            </div>
            <div className="text-xs text-[#666666] mt-1">Completed Today</div>
          </Card>
          <Card variant="bordered" padding="md" className="text-center">
            <div className="text-2xl font-bold text-[#10b981]">{agentStatus}</div>
            <div className="text-xs text-[#666666] mt-1">Agent Status</div>
          </Card>
          <Card variant="bordered" padding="md" className="text-center">
            <div className="text-2xl font-bold text-[#ffffff]">
              {isAnimating ? 'On' : 'Off'}
            </div>
            <div className="text-xs text-[#666666] mt-1">Animation</div>
          </Card>
        </div>

        {/* Toggle animation */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className="text-xs text-[#666666] hover:text-[#ffffff] transition-colors"
          >
            {isAnimating ? 'Pause Animation' : 'Resume Animation'}
          </button>
        </div>
      </div>
    </Layout>
  );
}
