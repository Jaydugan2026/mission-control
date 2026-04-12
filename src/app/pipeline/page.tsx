'use client';

import { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronUp, ChevronDown, RefreshCw, Search } from 'lucide-react';
import Layout from '@/components/layout';
import { useAppStore } from '@/lib/store';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

type SortKey = 'name' | 'stage' | 'daysInStage' | 'value' | 'leadAge' | 'owner' | 'contractValue';
type SortDir = 'asc' | 'desc';

export default function PipelinePage() {
  const { pipeline, fetchPipeline } = useAppStore();
  const [sortKey, setSortKey] = useState<SortKey>('daysInStage');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [stageFilter, setStageFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [leadSourceFilter, setLeadSourceFilter] = useState('All');
  const [staleOnly, setStaleOnly] = useState(false);

  useEffect(() => {
    // Initial fetch
    fetchPipeline();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPipeline, 30000);

    return () => clearInterval(interval);
  }, [fetchPipeline]);

  const stages = pipeline.stages;
  const stalled = pipeline.stalled ?? [];

  const totalValue = stages.reduce((s, st) => s + st.totalValue, 0);
  const totalDeals = stages.reduce((s, st) => s + st.count, 0);
  const nearCloseStages = ['Verbal Agreement', 'Signed Contract', 'Deposit Collected'];
  const nearCloseValue = stages
    .filter(s => nearCloseStages.includes(s.name))
    .reduce((s, st) => s + st.totalValue, 0);

  // Flatten all deals for the table
  const allDeals = useMemo(() =>
    stages.flatMap(stage => stage.deals.map(d => ({ ...d, stage: stage.name }))),
    [stages]
  );

  const stageNames = ['All', ...stages.map(s => s.name)];
  const ownerNames = ['All', ...new Set(allDeals.map(d => d.owner).filter(Boolean))];
  const leadSources = ['All', ...new Set(allDeals.map(d => d.leadSource).filter(Boolean))];

  const filtered = useMemo(() => {
    let rows = allDeals;
    if (stageFilter !== 'All') rows = rows.filter(d => d.stage === stageFilter);
    if (ownerFilter !== 'All') rows = rows.filter(d => d.owner === ownerFilter);
    if (leadSourceFilter !== 'All') rows = rows.filter(d => d.leadSource === leadSourceFilter);
    if (staleOnly) rows = rows.filter(d => d.daysInStage >= 3);
    if (search.trim()) rows = rows.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
    return [...rows].sort((a, b) => {
      let av = 0, bv = 0;
      if (sortKey === 'name')        { return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name); }
      if (sortKey === 'stage')       { return sortDir === 'asc' ? a.stage.localeCompare(b.stage) : b.stage.localeCompare(a.stage); }
      if (sortKey === 'owner')       { return sortDir === 'asc' ? (a.owner || '').localeCompare(b.owner || '') : (b.owner || '').localeCompare(a.owner || ''); }
      if (sortKey === 'daysInStage') { av = a.daysInStage; bv = b.daysInStage; }
      if (sortKey === 'leadAge')     { av = a.leadAge; bv = b.leadAge; }
      if (sortKey === 'value')       { av = a.value; bv = b.value; }
      if (sortKey === 'contractValue') { av = a.contractValue || 0; bv = b.contractValue || 0; }
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [allDeals, stageFilter, ownerFilter, leadSourceFilter, staleOnly, search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronDown className="w-3 h-3 text-[#475569]" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-[#3b82f6]" />
      : <ChevronDown className="w-3 h-3 text-[#3b82f6]" />;
  };

  const chartData = stages.map(s => ({ stage: s.name.length > 10 ? s.name.slice(0, 10) + '…' : s.name, count: s.count, value: s.totalValue }));

  return (
    <Layout>
      <div className="p-6 space-y-5 fade-in">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[#f1f5f9]">Pipeline</h1>
            <p className="text-xs text-[#475569] mt-0.5">Live JOBnimbus data</p>
          </div>
          <button
            onClick={fetchPipeline}
            disabled={pipeline.isLoading}
            className="flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-[#3b82f6] transition-colors disabled:opacity-40 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${pipeline.isLoading ? 'animate-spin' : ''}`} />
            {pipeline.isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* KPI bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Pipeline Value', value: formatCurrency(totalValue), color: 'text-[#10b981]' },
            { label: 'Active Deals',   value: totalDeals.toString(),       color: 'text-[#f1f5f9]' },
            { label: 'Stale Leads',    value: stalled.length.toString(),   color: stalled.length > 0 ? 'text-[#f59e0b]' : 'text-[#10b981]' },
            { label: 'Near Close',     value: formatCurrency(nearCloseValue), color: 'text-[#3b82f6]' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-[#0d1424] border border-[#1e2d4a] border-l-[3px] border-l-[#3b82f6] rounded-xl px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
              <div className={`text-xl font-bold font-mono ${kpi.color}`}>{kpi.value}</div>
              <div className="text-xs text-[#475569] mt-0.5">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        {stages.length > 0 && (
          <div className="bg-[#0d1424] border border-[#1e2d4a] border-l-[3px] border-l-[#3b82f6] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
            <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4">Deals by Stage</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
                  <XAxis dataKey="stage" stroke="#475569" fontSize={10} tick={{ fill: '#94a3b8' }} />
                  <YAxis stroke="#475569" fontSize={10} tick={{ fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0d1424', border: '1px solid #1e2d4a', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#f1f5f9' }}
                    itemStyle={{ color: '#94a3b8' }}
                    formatter={(value) => [String(value), 'Deals']}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Deal table */}
        <div className="bg-[#0d1424] border border-[#1e2d4a] border-l-[3px] border-l-[#3b82f6] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.4)] overflow-hidden">
          {/* Table controls */}
          <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-[#1e2d4a]">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#475569]" />
              <input
                type="text"
                placeholder="Search deals..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0a0f1e] border border-[#1e2d4a] rounded-lg text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#3b82f6] transition-colors"
              />
            </div>
            <select
              value={stageFilter}
              onChange={e => setStageFilter(e.target.value)}
              className="text-xs bg-[#0a0f1e] border border-[#1e2d4a] rounded-lg px-2.5 py-1.5 text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6] transition-colors cursor-pointer"
              title="Filter by stage"
            >
              {stageNames.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {ownerNames.length > 1 && (
              <select
                value={ownerFilter}
                onChange={e => setOwnerFilter(e.target.value)}
                className="text-xs bg-[#0a0f1e] border border-[#1e2d4a] rounded-lg px-2.5 py-1.5 text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6] transition-colors cursor-pointer"
                title="Filter by sales rep"
              >
                {ownerNames.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
            {leadSources.length > 1 && (
              <select
                value={leadSourceFilter}
                onChange={e => setLeadSourceFilter(e.target.value)}
                className="text-xs bg-[#0a0f1e] border border-[#1e2d4a] rounded-lg px-2.5 py-1.5 text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6] transition-colors cursor-pointer"
                title="Filter by lead source"
              >
                {leadSources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
            <label className="flex items-center gap-1.5 text-xs text-[#94a3b8] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={staleOnly}
                onChange={e => setStaleOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-[#1e2d4a] bg-[#0a0f1e] text-[#3b82f6] focus:ring-0 focus:ring-offset-0"
              />
              Stale only
            </label>
            <span className="text-xs text-[#475569] ml-auto">{filtered.length} deals</span>
          </div>

          {/* Table */}
          {pipeline.isLoading ? (
            <div className="flex items-center justify-center py-16 text-sm text-[#475569]">Loading deals...</div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-[#475569]">No deals match filters</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e2d4a]">
                    {([
                      { key: 'name',        label: 'Name' },
                      { key: 'owner',       label: 'Owner' },
                      { key: 'stage',       label: 'Stage' },
                      { key: 'leadAge',     label: 'Lead Age' },
                      { key: 'daysInStage', label: 'Days' },
                      { key: 'value',       label: 'Estimate' },
                      { key: 'contractValue', label: 'Contract' },
                    ] as { key: SortKey | 'contractValue'; label: string }[]).map(col => (
                      <th
                        key={col.key}
                        onClick={() => toggleSort(col.key)}
                        className="text-left text-xs text-[#94a3b8] font-medium px-5 py-3 cursor-pointer hover:text-[#f1f5f9] transition-colors select-none"
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          <SortIcon k={col.key} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((deal, i) => {
                    const isStale = deal.daysInStage >= 3;
                    const isUrgent = deal.daysInStage >= 7;
                    return (
                      <tr
                        key={`${deal.id}-${i}`}
                        className={`border-b border-[#1e2d4a] last:border-0 hover:bg-[#111d35] transition-colors ${
                          isUrgent ? 'border-l-2 border-l-[#ef4444]' : isStale ? 'border-l-2 border-l-[#f59e0b]' : ''
                        }`}
                      >
                        <td className="px-5 py-3 text-sm text-[#f1f5f9] font-medium">{deal.name}</td>
                        <td className="px-5 py-3 text-xs text-[#94a3b8]">{deal.owner || '—'}</td>
                        <td className="px-5 py-3">
                          <span className="text-xs text-[#94a3b8]" title={`Created ${deal.leadAge} days ago`}>
                            {deal.leadAge}d
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-mono font-medium ${
                            isUrgent ? 'text-[#ef4444]' : isStale ? 'text-[#f59e0b]' : 'text-[#94a3b8]'
                          }`}>
                            {deal.daysInStage}d
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm font-semibold text-[#3b82f6] font-mono">{formatCurrency(deal.value)}</td>
                        <td className="px-5 py-3 text-sm font-semibold text-[#10b981] font-mono">{deal.contractValue !== undefined && deal.contractValue !== null ? formatCurrency(deal.contractValue) : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
