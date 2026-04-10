'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Layout from '@/components/layout';
import { Card } from '@/components/ui/Card';

// Mock pipeline data - in production this would come from JOBnimbus API
const PIPELINE_DATA = [
  { stage: 'Lead', count: 45, value: 225000 },
  { stage: 'Initial Contact', count: 32, value: 180000 },
  { stage: 'Inspection', count: 18, value: 95000 },
  { stage: 'Estimate', count: 12, value: 72000 },
  { stage: 'Verbal', count: 8, value: 450000 },
  { stage: 'Signed', count: 5, value: 680000 },
  { stage: 'In Progress', count: 7, value: 520000 },
];

const COLORS = ['#ffffff', '#e0e0e0', '#c0c0c0', '#a0a0a0', '#808080', '#606060', '#404040'];

export default function PipelinePage() {
  const totalValue = PIPELINE_DATA.reduce((sum, item) => sum + item.value, 0);
  const totalRecords = PIPELINE_DATA.reduce((sum, item) => sum + item.count, 0);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-[#ffffff]">Pipeline Overview</h2>
          <p className="text-sm text-[#666666] mt-1">
            Visual breakdown of active pipeline by stage
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="bordered" padding="lg">
            <div className="text-3xl font-bold text-[#ffffff]">{totalRecords}</div>
            <div className="text-sm text-[#666666] mt-1">Total Active Records</div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-3xl font-bold text-[#ffffff]">
              ${totalValue.toLocaleString()}
            </div>
            <div className="text-sm text-[#666666] mt-1">Total Pipeline Value</div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-3xl font-bold text-[#ffffff]">
              ${(totalValue / totalRecords).toLocaleString()}
            </div>
            <div className="text-sm text-[#666666] mt-1">Avg. Value per Record</div>
          </Card>
        </div>

        {/* Chart */}
        <Card variant="bordered" padding="lg">
          <h3 className="text-sm font-semibold text-[#ffffff] mb-4">Pipeline by Stage</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PIPELINE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis dataKey="stage" stroke="#666666" fontSize={12} />
                <YAxis stroke="#666666" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a0a0a',
                    border: '1px solid #222222',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#ffffff' }}
                  formatter={(value, name) => {
                    const numValue = typeof value === 'number' ? value : 0;
                    return [
                      name === 'count' ? `${numValue} records` : `$${numValue.toLocaleString()}`,
                      name === 'count' ? 'Count' : 'Value',
                    ];
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {PIPELINE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Detailed table */}
        <Card variant="bordered" padding="none">
          <div className="p-4 border-b border-[#222222]">
            <h3 className="text-sm font-semibold text-[#ffffff]">Detailed Breakdown</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#222222]">
                <th className="text-left text-xs text-[#666666] font-medium p-4">Stage</th>
                <th className="text-right text-xs text-[#666666] font-medium p-4">Records</th>
                <th className="text-right text-xs text-[#666666] font-medium p-4">Value</th>
                <th className="text-right text-xs text-[#666666] font-medium p-4">Avg. Value</th>
              </tr>
            </thead>
            <tbody>
              {PIPELINE_DATA.map((item, index) => (
                <tr key={index} className="border-b border-[#222222] last:border-0">
                  <td className="p-4 text-sm text-[#ffffff]">{item.stage}</td>
                  <td className="p-4 text-sm text-[#a0a0a0] text-right">{item.count}</td>
                  <td className="p-4 text-sm text-[#a0a0a0] text-right">
                    ${item.value.toLocaleString()}
                  </td>
                  <td className="p-4 text-sm text-[#a0a0a0] text-right">
                    ${(item.value / item.count).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </Layout>
  );
}
