'use client';

import { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface ClientRecord {
  id: string;
  name: string;
  stage: string;
  value: number;
  lastContact: string;
  daysInStage: number;
  notes?: string;
  nextAction?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
  };
  history?: Array<{
    date: string;
    action: string;
    notes: string;
  }>;
}

interface AgentProfileProps {
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
  clients?: ClientRecord[];
  stats: {
    totalDeals: number;
    pipelineValue: number;
    avgDealValue: number;
    dealsWon: number;
    dealsLost: number;
  };
}

export function AgentProfile({ name, role, status, clients = [], stats }: AgentProfileProps) {
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const statusColors = {
    online: 'bg-[#10b981]',
    offline: 'bg-[#444444]',
    busy: 'bg-[#f59e0b]',
  };

  const toggleExpand = (clientId: string) => {
    setExpandedClientId(expandedClientId === clientId ? null : clientId);
  };

  return (
    <div className="space-y-4">
      {/* Agent Header Card */}
      <Card variant="bordered" padding="lg" className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center">
            <span className="text-3xl">🕷️</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-[#ffffff]">{name}</h3>
              <div className={`w-3 h-3 ${statusColors[status]} rounded-full pulse-glow`} />
            </div>
            <p className="text-sm text-[#666666]">{role}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#222222]">
          <div>
            <div className="text-2xl font-bold text-[#ffffff]">{stats.totalDeals}</div>
            <div className="text-xs text-[#666666]">Total Deals</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#4a9eff]">{formatCurrency(stats.pipelineValue)}</div>
            <div className="text-xs text-[#666666]">Pipeline Value</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#ffffff]">{formatCurrency(stats.avgDealValue)}</div>
            <div className="text-xs text-[#666666]">Avg Deal</div>
          </div>
        </div>
      </Card>

      {/* Client Records */}
      {clients.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-[#ffffff]">Active Clients</h4>
          {clients.map((client) => (
            <Card
              key={client.id}
              variant="bordered"
              padding="md"
              className="cursor-pointer transition-all hover:border-[#333333]"
              onClick={() => toggleExpand(client.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#ffffff]">{client.name}</span>
                    <Badge variant="info" size="sm">{client.stage}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-[#666666]">
                    <span>{formatCurrency(client.value)}</span>
                    <span>{client.daysInStage}d in stage</span>
                    <span>Last: {client.lastContact}</span>
                  </div>
                </div>
                <div className="text-xs text-[#666666]">
                  {expandedClientId === client.id ? '▲' : '▼'}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedClientId === client.id && (
                <div className="mt-4 pt-4 border-t border-[#222222] space-y-3">
                  {/* Next Action */}
                  {client.nextAction && (
                    <div>
                      <div className="text-xs text-[#666666] mb-1">Next Action</div>
                      <div className="text-sm text-[#f59e0b]">{client.nextAction}</div>
                    </div>
                  )}

                  {/* Notes */}
                  {client.notes && (
                    <div>
                      <div className="text-xs text-[#666666] mb-1">Notes</div>
                      <div className="text-sm text-[#a0a0a0]">{client.notes}</div>
                    </div>
                  )}

                  {/* Contact Info */}
                  {client.contactInfo && (
                    <div className="flex gap-4 text-xs">
                      {client.contactInfo.email && (
                        <span className="text-[#666666]">📧 {client.contactInfo.email}</span>
                      )}
                      {client.contactInfo.phone && (
                        <span className="text-[#666666]">📱 {client.contactInfo.phone}</span>
                      )}
                    </div>
                  )}

                  {/* History */}
                  {client.history && client.history.length > 0 && (
                    <div>
                      <div className="text-xs text-[#666666] mb-2">History</div>
                      <div className="space-y-1">
                        {client.history.map((h, idx) => (
                          <div key={idx} className="text-xs text-[#a0a0a0] flex gap-2">
                            <span className="text-[#666666]">{h.date}</span>
                            <span>{h.action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
