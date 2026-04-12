'use client';

import { useState } from 'react';
import { Sun, Moon, AlertTriangle, BarChart3, Copy, Check, ChevronDown, ChevronUp, Bot } from 'lucide-react';
import Layout from '@/components/layout';
import { useAppStore } from '@/lib/store';

const duties = [
  {
    id: 'morning-brief',
    name: 'Morning Brief',
    description: 'Daily pipeline snapshot + today\'s calendar + action items.',
    icon: Sun,
    command: '/peter-morning-brief',
    schedule: 'On-demand',
    color: 'text-[#f59e0b]',
    bg: 'bg-[#f59e0b]/10',
  },
  {
    id: 'wrap-up',
    name: 'End-of-Day Wrap-up',
    description: 'What moved today + tomorrow\'s schedule + stall flags.',
    icon: Moon,
    command: '/peter-wrap-up',
    schedule: 'Daily 5:00 PM',
    color: 'text-[#3b82f6]',
    bg: 'bg-[#3b82f6]/10',
  },
  {
    id: 'stale-nudge',
    name: 'Stale Lead Nudge',
    description: 'Emails a list of leads stale 3+ days. Only sends if stale leads exist.',
    icon: AlertTriangle,
    command: '/peter-stale-nudge',
    schedule: 'Daily 9:00 AM',
    color: 'text-[#ef4444]',
    bg: 'bg-[#ef4444]/10',
  },
  {
    id: 'weekly-summary',
    name: 'Weekly Pipeline Summary',
    description: 'Full pipeline by stage + near-close + new leads from past 7 days.',
    icon: BarChart3,
    command: '/peter-weekly-summary',
    schedule: 'Mondays 7:00 AM',
    color: 'text-[#10b981]',
    bg: 'bg-[#10b981]/10',
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/25 text-[#3b82f6] hover:bg-[#3b82f6]/20 transition-all duration-200 cursor-pointer"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : 'Copy command'}
    </button>
  );
}

export default function PeterPage() {
  const { duties: dutyStore } = useAppStore();
  const [showConstraints, setShowConstraints] = useState(false);
  const [showCommands, setShowCommands] = useState(false);

  const getLastRun = (id: string) => {
    const d = dutyStore.find((d) => d.id === id);
    if (!d?.lastRun) return null;
    return { time: d.lastRun, status: d.lastRunStatus };
  };

  const formatRelative = (date: Date) => {
    const diffMs = Date.now() - date.getTime();
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffH < 1) return 'Just now';
    if (diffH < 24) return `${diffH}h ago`;
    return `${Math.floor(diffH / 24)}d ago`;
  };

  return (
    <Layout>
      <div className="p-6 space-y-5 fade-in">
        {/* Page header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/15 border border-[#3b82f6]/25 flex items-center justify-center">
            <Bot className="w-5 h-5 text-[#3b82f6]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#f1f5f9]">Peter</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] inline-block" />
              <span className="text-xs text-[#10b981]">Online</span>
              <span className="text-xs text-[#475569]">· Executive Assistant · JD@fortituderoofing.co</span>
            </div>
          </div>
        </div>

        {/* Duty Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {duties.map((duty) => {
            const Icon = duty.icon;
            const lastRun = getLastRun(duty.id);
            return (
              <div
                key={duty.id}
                className="bg-[#0d1424] border border-[#1e2d4a] border-l-[3px] border-l-[#3b82f6] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.4)] hover:border-[#2563eb] hover:shadow-[0_0_0_1px_rgba(59,130,246,0.2),0_4px_16px_rgba(59,130,246,0.08)] hover:-translate-y-px transition-all duration-200"
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${duty.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4.5 h-4.5 ${duty.color}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#f1f5f9]">{duty.name}</h3>
                      <span className="text-xs text-[#475569]">{duty.schedule}</span>
                    </div>
                  </div>
                  {lastRun ? (
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                      lastRun.status === 'success'
                        ? 'bg-[#10b981]/10 border-[#10b981]/25 text-[#10b981]'
                        : 'bg-[#ef4444]/10 border-[#ef4444]/25 text-[#ef4444]'
                    }`}>
                      {lastRun.status === 'success' ? '✓' : '✗'} {formatRelative(lastRun.time)}
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full border border-[#1e2d4a] text-[#475569]">Never run</span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-[#94a3b8] mb-4 leading-relaxed">{duty.description}</p>

                {/* Command + copy */}
                <div className="flex items-center justify-between">
                  <code className="text-xs font-mono text-[#3b82f6] bg-[#3b82f6]/8 px-2 py-1 rounded">
                    {duty.command}
                  </code>
                  <CopyButton text={duty.command} />
                </div>
              </div>
            );
          })}
        </div>

        {/* All Commands Reference */}
        <div className="bg-[#0d1424] border border-[#1e2d4a] rounded-xl overflow-hidden">
          <button
            onClick={() => setShowCommands(!showCommands)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#111d35] transition-colors cursor-pointer"
          >
            <span className="text-sm font-semibold text-[#f1f5f9]">Slash Command Reference</span>
            {showCommands ? <ChevronUp className="w-4 h-4 text-[#475569]" /> : <ChevronDown className="w-4 h-4 text-[#475569]" />}
          </button>
          {showCommands && (
            <div className="px-5 pb-5 border-t border-[#1e2d4a]">
              <p className="text-xs text-[#475569] mt-4 mb-3">
                Run these in Claude Code. Peter will fetch data, generate the brief, and send an HTML email to JD@fortituderoofing.co.
              </p>
              <div className="space-y-2">
                {duties.map((d) => (
                  <div key={d.id} className="flex items-center justify-between px-3 py-2 bg-[#0a0f1e] rounded-lg border border-[#1e2d4a]">
                    <div>
                      <code className="text-xs font-mono text-[#3b82f6]">{d.command}</code>
                      <span className="text-xs text-[#475569] ml-3">{d.name}</span>
                    </div>
                    <CopyButton text={d.command} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Constraints */}
        <div className="bg-[#0d1424] border border-[#1e2d4a] rounded-xl overflow-hidden">
          <button
            onClick={() => setShowConstraints(!showConstraints)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#111d35] transition-colors cursor-pointer"
          >
            <span className="text-sm font-semibold text-[#f1f5f9]">Peter's Operating Rules</span>
            {showConstraints ? <ChevronUp className="w-4 h-4 text-[#475569]" /> : <ChevronDown className="w-4 h-4 text-[#475569]" />}
          </button>
          {showConstraints && (
            <div className="px-5 pb-5 border-t border-[#1e2d4a]">
              <ul className="mt-4 space-y-2">
                {[
                  'Only emails JD@fortituderoofing.co — no other address ever',
                  'Read-only access to JOBnimbus — never creates, updates, or deletes records',
                  'Read-only access to Google Calendar',
                  'Stale Lead Nudge only sends if stale leads exist (no noise when clean)',
                  'Never omits sections — if data is missing, notes it explicitly',
                  'All emails are HTML with inline CSS (Gmail-compatible)',
                ].map((rule, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-[#94a3b8]">
                    <span className="text-[#3b82f6] shrink-0 mt-0.5">·</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
