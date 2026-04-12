'use client';

import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { RefreshCw, Search, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import Layout from '@/components/layout';
import { useAppStore } from '@/lib/store';
import { MergedFinancialData } from '@/lib/financials';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

const formatPercent = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(v / 100);

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

type SortKey = 'jobName' | 'salesRep' | 'profit' | 'margin' | 'revenue';
type SortDir = 'asc' | 'desc';

export default function FinancePage() {
  const { financials, fetchFinancials } = useAppStore();
  const [sortKey, setSortKey] = useState<SortKey>('profit');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [search, setSearch] = useState('');
  const [repFilter, setRepFilter] = useState('All');
  const [selectedJob, setSelectedJob] = useState<MergedFinancialData | null>(null);

  useEffect(() => {
    fetchFinancials();
    const interval = setInterval(fetchFinancials, 30000);
    return () => clearInterval(interval);
  }, [fetchFinancials]);

  const mergedJobs = financials.mergedJobs;
  const metrics = financials.metrics;

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let jobs = mergedJobs.filter(j => j.hasSheetMatch);

    if (repFilter !== 'All') {
      jobs = jobs.filter(j => j.salesRep === repFilter);
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      jobs = jobs.filter(j =>
        j.jobName.toLowerCase().includes(searchLower) ||
        j.salesRep.toLowerCase().includes(searchLower)
      );
    }

    return [...jobs].sort((a, b) => {
      let comparison = 0;

      switch (sortKey) {
        case 'jobName':
          comparison = a.jobName.localeCompare(b.jobName);
          break;
        case 'salesRep':
          comparison = a.salesRep.localeCompare(b.salesRep);
          break;
        case 'profit':
          comparison = (a.sheetData?.['Total Profit'] || 0) - (b.sheetData?.['Total Profit'] || 0);
          break;
        case 'margin':
          comparison = (a.sheetData?.['Profit Margin'] || 0) - (b.sheetData?.['Profit Margin'] || 0);
          break;
        case 'revenue':
          comparison = (a.sheetData?.['Sale Price'] || 0) - (b.sheetData?.['Sale Price'] || 0);
          break;
      }

      return sortDir === 'asc' ? comparison : -comparison;
    });
  }, [mergedJobs, repFilter, search, sortKey, sortDir]);

  const repNames = ['All', ...new Set(mergedJobs.map(j => j.salesRep).filter(Boolean))];

  // Profit by Rep data for chart
  const profitByRepData = useMemo(() => {
    if (!metrics?.profitByRep) return [];
    return Object.entries(metrics.profitByRep)
      .map(([rep, profit]) => ({ name: rep, profit }))
      .sort((a, b) => b.profit - a.profit);
  }, [metrics]);

  // Cost breakdown data
  const costBreakdownData = useMemo(() => {
    if (!mergedJobs.some(j => j.hasSheetMatch)) return [];

    const totals = mergedJobs
      .filter(j => j.hasSheetMatch)
      .reduce((acc, j) => {
        const d = j.sheetData!;
        acc.material += d.Material || 0;
        acc.labor += d.Labor || 0;
        acc.commission += d.Commission || 0;
        acc.isrCommission += d['ISR Commission'] || 0;
        acc.additionalMaterial += d['Additional Material'] || 0;
        acc.dumpCosts += d['Dump Costs'] || 0;
        acc.pmFee += d['PM Fee'] || 0;
        return acc;
      }, { material: 0, labor: 0, commission: 0, isrCommission: 0, additionalMaterial: 0, dumpCosts: 0, pmFee: 0 });

    return [
      { name: 'Material', value: totals.material },
      { name: 'Labor', value: totals.labor },
      { name: 'Commission', value: totals.commission },
      { name: 'ISR Commission', value: totals.isrCommission },
      { name: 'Additional Material', value: totals.additionalMaterial },
      { name: 'Dump Costs', value: totals.dumpCosts },
      { name: 'PM Fee', value: totals.pmFee },
    ].filter(d => d.value > 0);
  }, [mergedJobs]);

  // Margin distribution
  const marginDistribution = useMemo(() => {
    const jobsWithMargin = mergedJobs.filter(j => j.hasSheetMatch && j.sheetData?.['Profit Margin'] !== undefined);
    const ranges = [
      { name: '< 10%', count: 0, range: [-Infinity, 10] },
      { name: '10-20%', count: 0, range: [10, 20] },
      { name: '20-30%', count: 0, range: [20, 30] },
      { name: '30-40%', count: 0, range: [30, 40] },
      { name: '40%+', count: 0, range: [40, Infinity] },
    ];

    jobsWithMargin.forEach(j => {
      const margin = j.sheetData!['Profit Margin'] || 0;
      const bucket = ranges.find(r => margin >= r.range[0] && margin < r.range[1]);
      if (bucket) bucket.count++;
    });

    return ranges.filter(r => r.count > 0);
  }, [mergedJobs]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  // Stats
  const totalRevenue = metrics?.totalRevenue || 0;
  const totalProfit = metrics?.totalProfit || 0;
  const totalCosts = metrics?.totalCosts || 0;
  const avgMargin = metrics?.avgProfitMargin || 0;

  return (
    <Layout>
      <div className="p-6 space-y-6 fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[#f1f5f9]">Financial Overview</h1>
            <p className="text-xs text-[#475569] mt-0.5">Job profitability & cost analysis</p>
          </div>
          <button
            onClick={fetchFinancials}
            disabled={financials.isLoading}
            className="flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-[#3b82f6] transition-colors disabled:opacity-40 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${financials.isLoading ? 'animate-spin' : ''}`} />
            {financials.isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#0d1424] border border-[#1e2d4a] border-l-[3px] border-l-[#10b981] rounded-xl px-4 py-3">
            <div className="text-xs text-[#475569] mb-1">Total Revenue</div>
            <div className="text-xl font-bold font-mono text-[#10b981]">{formatCurrency(totalRevenue)}</div>
          </div>
          <div className="bg-[#0d1424] border border-[#1e2d4a] border-l-[3px] border-l-[#3b82f6] rounded-xl px-4 py-3">
            <div className="text-xs text-[#475569] mb-1">Total Profit</div>
            <div className="text-xl font-bold font-mono text-[#3b82f6]">{formatCurrency(totalProfit)}</div>
          </div>
          <div className="bg-[#0d1424] border border-[#1e2d4a] border-l-[3px] border-l-[#f59e0b] rounded-xl px-4 py-3">
            <div className="text-xs text-[#475569] mb-1">Total Costs</div>
            <div className="text-xl font-bold font-mono text-[#f59e0b]">{formatCurrency(totalCosts)}</div>
          </div>
          <div className="bg-[#0d1424] border border-[#1e2d4a] border-l-[3px] border-l-[#8b5cf6] rounded-xl px-4 py-3">
            <div className="text-xs text-[#475569] mb-1">Avg Margin</div>
            <div className="text-xl font-bold font-mono text-[#8b5cf6]">{formatPercent(avgMargin)}</div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Profit by Sales Rep */}
          <div className="bg-[#0d1424] border border-[#1e2d4a] border-l-[3px] border-l-[#3b82f6] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4">Profit by Sales Rep</h3>
            {profitByRepData.length > 0 ? (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profitByRepData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
                    <XAxis dataKey="name" stroke="#475569" fontSize={10} tick={{ fill: '#94a3b8' }} />
                    <YAxis stroke="#475569" fontSize={10} tick={{ fill: '#94a3b8' }} tickFormatter={(v) => `$${v / 1000}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0d1424', border: '1px solid #1e2d4a', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(value) => [formatCurrency(Number(value)), 'Profit']}
                    />
                    <Bar dataKey="profit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-52 text-sm text-[#475569]">No data available</div>
            )}
          </div>

          {/* Cost Breakdown */}
          <div className="bg-[#0d1424] border border-[#1e2d4a] border-l-[3px] border-l-[#f59e0b] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4">Cost Breakdown</h3>
            {costBreakdownData.length > 0 ? (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costBreakdownData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      fontSize={10}
                    >
                      {costBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0d1424', border: '1px solid #1e2d4a', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-52 text-sm text-[#475569]">No cost data available</div>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="bg-[#0d1424] border border-[#1e2d4a] border-l-[3px] border-l-[#8b5cf6] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4">Profit Margin Distribution</h3>
          {marginDistribution.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marginDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} tick={{ fill: '#94a3b8' }} />
                  <YAxis stroke="#475569" fontSize={10} tick={{ fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0d1424', border: '1px solid #1e2d4a', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value) => [String(value), 'Jobs']}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-52 text-sm text-[#475569]">No margin data available</div>
          )}
        </div>

        {/* Job Details Table */}
        <div className="bg-[#0d1424] border border-[#1e2d4a] border-l-[3px] border-l-[#3b82f6] rounded-xl overflow-hidden">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-[#1e2d4a]">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#475569]" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0a0f1e] border border-[#1e2d4a] rounded-lg text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#3b82f6] transition-colors"
              />
            </div>
            <select
              value={repFilter}
              onChange={(e) => setRepFilter(e.target.value)}
              className="text-xs bg-[#0a0f1e] border border-[#1e2d4a] rounded-lg px-2.5 py-1.5 text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6] transition-colors cursor-pointer"
            >
              {repNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <span className="text-xs text-[#475569] ml-auto">{filteredJobs.length} jobs</span>
          </div>

          {/* Table */}
          {financials.isLoading ? (
            <div className="flex items-center justify-center py-16 text-sm text-[#475569]">Loading financial data...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-[#475569]">No jobs match filters</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e2d4a]">
                    {([
                      { key: 'jobName', label: 'Job Name' },
                      { key: 'salesRep', label: 'Sales Rep' },
                      { key: 'revenue', label: 'Sale Price' },
                      { key: 'profit', label: 'Profit' },
                      { key: 'margin', label: 'Margin' },
                    ] as { key: SortKey; label: string }[]).map((col) => (
                      <th
                        key={col.key}
                        onClick={() => toggleSort(col.key)}
                        className="text-left text-xs text-[#94a3b8] font-medium px-4 py-3 cursor-pointer hover:text-[#f1f5f9] transition-colors select-none"
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {sortKey === col.key && (
                            sortDir === 'asc' ? <TrendingUp className="w-3 h-3 text-[#3b82f6]" /> : <TrendingUp className="w-3 h-3 text-[#3b82f6] rotate-180" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job, i) => {
                    const profit = job.sheetData?.['Total Profit'] || 0;
                    const margin = job.sheetData?.['Profit Margin'] || 0;
                    const revenue = job.sheetData?.['Sale Price'] || 0;
                    const isLowMargin = margin < 10;

                    return (
                      <tr
                        key={`${job.jnid}-${i}`}
                        onClick={() => setSelectedJob(selectedJob?.jnid === job.jnid ? null : job)}
                        className={`border-b border-[#1e2d4a] last:border-0 hover:bg-[#111d35] transition-colors cursor-pointer ${
                          isLowMargin ? 'bg-[#ef4444]/5' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-[#f1f5f9] font-medium">{job.jobName}</td>
                        <td className="px-4 py-3 text-xs text-[#94a3b8]">{job.salesRep}</td>
                        <td className="px-4 py-3 text-sm font-mono text-[#f1f5f9]">{formatCurrency(revenue)}</td>
                        <td className={`px-4 py-3 text-sm font-mono font-semibold ${profit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                          {formatCurrency(profit)}
                        </td>
                        <td className={`px-4 py-3 text-sm font-mono font-medium ${
                          margin >= 30 ? 'text-[#10b981]' : margin >= 20 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
                        }`}>
                          {formatPercent(margin)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Job Detail Panel */}
        {selectedJob && selectedJob.sheetData && (
          <div className="bg-[#0d1424] border border-[#1e2d4a] border-l-[3px] border-l-[#3b82f6] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#f1f5f9]">{selectedJob.jobName}</h3>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-xs text-[#475569] hover:text-[#f1f5f9]"
              >
                Close
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Revenue & Profit */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-[#3b82f6] uppercase">Revenue & Profit</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#475569]">Sale Price</span>
                    <span className="text-[#f1f5f9] font-mono">{formatCurrency(selectedJob.sheetData['Sale Price'] || 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#475569]">Total Profit</span>
                    <span className="text-[#f1f5f9] font-mono">{formatCurrency(selectedJob.sheetData['Total Profit'] || 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#475569]">Profit Margin</span>
                    <span className="text-[#f1f5f9] font-mono">{formatPercent(selectedJob.sheetData['Profit Margin'] || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Costs */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-[#f59e0b] uppercase">Costs</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#475569]">Material</span>
                    <span className="text-[#f1f5f9] font-mono">{formatCurrency(selectedJob.sheetData.Material || 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#475569]">Labor</span>
                    <span className="text-[#f1f5f9] font-mono">{formatCurrency(selectedJob.sheetData.Labor || 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#475569]">Total Job Costs</span>
                    <span className="text-[#f1f5f9] font-mono">{formatCurrency(selectedJob.sheetData['Total Job Costs'] || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Commissions */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-[#8b5cf6] uppercase">Commissions</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#475569]">Commission</span>
                    <span className="text-[#f1f5f9] font-mono">{formatCurrency(selectedJob.sheetData.Commission || 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#475569]">ISR Commission</span>
                    <span className="text-[#f1f5f9] font-mono">{formatCurrency(selectedJob.sheetData['ISR Commission'] || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Unmatched Jobs Warning */}
        {metrics && metrics.jobsWithoutMatches > 0 && (
          <div className="bg-[#0d1424] border border-[#1e2d4a] border-l-[3px] border-l-[#f59e0b] rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-[#f59e0b]">{metrics.jobsWithoutMatches} unmatched jobs</h4>
                <p className="text-xs text-[#475569] mt-1">
                  These JobNimbus jobs could not be matched to rows in your Google Sheet. Check that customer names and addresses match exactly.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
