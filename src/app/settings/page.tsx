'use client';

import { useState } from 'react';
import { Copy, Check, Mail, Key, Terminal } from 'lucide-react';
import Layout from '@/components/layout';

const commands = [
  { cmd: '/peter-morning-brief',  desc: 'Daily pipeline + schedule overview' },
  { cmd: '/peter-wrap-up',        desc: "Recap of day's activity + tomorrow preview" },
  { cmd: '/peter-stale-nudge',    desc: 'Alert on leads without recent activity (3+ days)' },
  { cmd: '/peter-weekly-summary', desc: 'Weekly pipeline overview' },
];

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/25 text-[#3b82f6] hover:bg-[#3b82f6]/20 transition-all duration-200 cursor-pointer shrink-0"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {label ?? (copied ? 'Copied' : 'Copy')}
    </button>
  );
}

export default function SettingsPage() {
  return (
    <Layout>
      <div className="p-6 space-y-5 fade-in max-w-2xl">
        <div>
          <h1 className="text-lg font-semibold text-[#f1f5f9]">Settings</h1>
          <p className="text-xs text-[#475569] mt-0.5">Configuration reference</p>
        </div>

        {/* Email */}
        <div className="bg-[#0d1424] border border-[#1e2d4a] border-l-[3px] border-l-[#3b82f6] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-4 h-4 text-[#3b82f6]" />
            <h3 className="text-sm font-semibold text-[#f1f5f9]">Email Recipient</h3>
          </div>
          <div className="flex items-center justify-between px-3 py-2.5 bg-[#0a0f1e] rounded-lg border border-[#1e2d4a]">
            <span className="text-sm text-[#f1f5f9] font-mono">JD@fortituderoofing.co</span>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/25 text-[#10b981]">Active</span>
              <CopyButton text="JD@fortituderoofing.co" />
            </div>
          </div>
          <p className="text-xs text-[#475569] mt-2">All Peter emails are sent exclusively to this address.</p>
        </div>

        {/* API Key */}
        <div className="bg-[#0d1424] border border-[#1e2d4a] border-l-[3px] border-l-[#3b82f6] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-4 h-4 text-[#3b82f6]" />
            <h3 className="text-sm font-semibold text-[#f1f5f9]">JOBnimbus API</h3>
          </div>
          <div className="flex items-center justify-between px-3 py-2.5 bg-[#0a0f1e] rounded-lg border border-[#1e2d4a]">
            <span className="text-sm text-[#94a3b8] font-mono">mnq•••••••••••vyx</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/25 text-[#10b981]">Connected</span>
          </div>
          <p className="text-xs text-[#475569] mt-2">Read-only access. Peter never modifies JOBnimbus records.</p>
        </div>

        {/* Slash Commands */}
        <div className="bg-[#0d1424] border border-[#1e2d4a] border-l-[3px] border-l-[#3b82f6] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-4 h-4 text-[#3b82f6]" />
            <h3 className="text-sm font-semibold text-[#f1f5f9]">Peter's Slash Commands</h3>
          </div>
          <p className="text-xs text-[#475569] mb-4">Run in Claude Code. Peter will fetch data and email JD@fortituderoofing.co.</p>
          <div className="space-y-2">
            {commands.map(({ cmd, desc }) => (
              <div key={cmd} className="flex items-center gap-3 px-3 py-2.5 bg-[#0a0f1e] rounded-lg border border-[#1e2d4a]">
                <code className="text-sm font-mono text-[#3b82f6] min-w-0 flex-1">{cmd}</code>
                <span className="text-xs text-[#475569] hidden md:block shrink-0 max-w-[200px] truncate">{desc}</span>
                <CopyButton text={cmd} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
