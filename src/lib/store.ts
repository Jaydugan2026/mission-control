import { create } from 'zustand';

export interface Duty {
  id: string;
  name: string;
  description: string;
  icon: string;
  schedule: string | null;
  lastRun: Date | null;
  lastRunStatus: 'success' | 'error' | 'idle' | null;
}

export interface Activity {
  id: string;
  type: 'duty_executed' | 'email_sent' | 'api_call' | 'error' | 'warning';
  title: string;
  timestamp: Date;
  details?: string;
}

import { PipelineStage } from './jobnimbus';
import { MergedFinancialData } from './financials';
import type { SalesReportPayload } from '@/types/sales-report';

interface FinancialMetrics {
  totalProfit: number;
  totalRevenue: number;
  totalCosts: number;
  avgProfitMargin: number;
  profitByRep: Record<string, number>;
  jobsWithMatches: number;
  jobsWithoutMatches: number;
}

interface AppState {
  // Duties
  duties: Duty[];
  setDutyLastRun: (id: string, date: Date, status: 'success' | 'error') => void;

  // Activity
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;

  // Agent
  agentStatus: 'online' | 'offline' | 'busy';
  currentTask: string | null;
  setAgentStatus: (status: 'online' | 'offline' | 'busy') => void;
  setCurrentTask: (task: string | null) => void;

  // Pipeline (JOBnimbus)
  pipeline: {
    stages: PipelineStage[];
    stalled: Array<{ id: string; name: string; stage: string; daysInStage: number }>;
    isLoading: boolean;
    lastFetched: Date | null;
    error: string | null;
  };
  fetchPipeline: () => Promise<void>;

  // Financials (Google Sheets + JobNimbus)
  financials: {
    mergedJobs: MergedFinancialData[];
    metrics: FinancialMetrics | null;
    isLoading: boolean;
    lastFetched: Date | null;
    error: string | null;
  };
  fetchFinancials: () => Promise<void>;

  // Sales Report
  salesReport: {
    data: SalesReportPayload | null;
    isLoading: boolean;
    lastFetched: Date | null;
    error: string | null;
  };
  fetchSalesReport: () => Promise<void>;

  // Stats
  stats: {
    dutiesRun: number;
    emailsSent: number;
  };
  incrementStat: (key: keyof AppState['stats']) => void;
}

const initialDuties: Duty[] = [
  {
    id: 'morning-brief',
    name: 'Morning Brief',
    description: 'Daily pipeline + schedule overview',
    icon: 'Sun',
    schedule: null,
    lastRun: null,
    lastRunStatus: null,
  },
  {
    id: 'wrap-up',
    name: 'End-of-Day Wrap-up',
    description: 'Recap of day\'s activity + tomorrow preview',
    icon: 'Moon',
    schedule: '0 17 * * *',
    lastRun: null,
    lastRunStatus: null,
  },
  {
    id: 'stale-nudge',
    name: 'Stale Lead Nudge',
    description: 'Alert on leads without recent activity',
    icon: 'AlertTriangle',
    schedule: '0 9 * * *',
    lastRun: null,
    lastRunStatus: null,
  },
  {
    id: 'weekly-summary',
    name: 'Weekly Pipeline Summary',
    description: 'Weekly pipeline overview',
    icon: 'BarChart3',
    schedule: '0 7 * * 1',
    lastRun: null,
    lastRunStatus: null,
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  duties: initialDuties,
  activities: [],
  agentStatus: 'online',
  currentTask: null,
  pipeline: {
    stages: [],
    stalled: [],
    isLoading: false,
    lastFetched: null,
    error: null,
  },
  financials: {
    mergedJobs: [],
    metrics: null,
    isLoading: false,
    lastFetched: null,
    error: null,
  },
  salesReport: {
    data: null,
    isLoading: false,
    lastFetched: null,
    error: null,
  },
  stats: {
    dutiesRun: 0,
    emailsSent: 0,
  },

  // Pipeline fetch action
  fetchPipeline: async () => {
    set({ pipeline: { ...get().pipeline, isLoading: true, error: null } });

    try {
      const response = await fetch('/api/pipeline');
      const data = await response.json();

      if (data.success) {
        set({
          pipeline: {
            stages: data.data.stages,
            stalled: data.data.stalled ?? [],
            isLoading: false,
            lastFetched: new Date(),
            error: null,
          },
        });
      } else {
        set({
          pipeline: {
            stages: [],
            stalled: [],
            isLoading: false,
            lastFetched: null,
            error: data.error || 'Failed to fetch pipeline',
          },
        });
      }
    } catch (error) {
      set({
        pipeline: {
          stages: [],
          stalled: [],
          isLoading: false,
          lastFetched: null,
          error: error instanceof Error ? error.message : 'Failed to fetch pipeline',
        },
      });
    }
  },

  // Financials fetch action
  fetchFinancials: async () => {
    set({ financials: { ...get().financials, isLoading: true, error: null } });

    try {
      const response = await fetch('/api/financials');
      const data = await response.json();

      if (data.success) {
        set({
          financials: {
            mergedJobs: data.data.mergedJobs || [],
            metrics: data.data.metrics || null,
            isLoading: false,
            lastFetched: new Date(),
            error: null,
          },
        });
      } else {
        set({
          financials: {
            mergedJobs: [],
            metrics: null,
            isLoading: false,
            lastFetched: null,
            error: data.error || 'Failed to fetch financials',
          },
        });
      }
    } catch (error) {
      set({
        financials: {
          mergedJobs: [],
          metrics: null,
          isLoading: false,
          lastFetched: null,
          error: error instanceof Error ? error.message : 'Failed to fetch financials',
        },
      });
    }
  },

  fetchSalesReport: async () => {
    set({ salesReport: { ...get().salesReport, isLoading: true, error: null } });
    try {
      const response = await fetch('/api/sales-report');
      const json = await response.json();
      if (json.success) {
        set({
          salesReport: {
            data: json.data,
            isLoading: false,
            lastFetched: new Date(),
            error: null,
          },
        });
      } else {
        set({
          salesReport: {
            data: null,
            isLoading: false,
            lastFetched: null,
            error: json.error ?? 'Failed to fetch sales report',
          },
        });
      }
    } catch (error) {
      set({
        salesReport: {
          data: null,
          isLoading: false,
          lastFetched: null,
          error: error instanceof Error ? error.message : 'Failed to fetch sales report',
        },
      });
    }
  },

  // Duty actions
  setDutyLastRun: (id, date, status) => {
    set((state) => ({
      duties: state.duties.map((d) =>
        d.id === id ? { ...d, lastRun: date, lastRunStatus: status } : d
      ),
    }));
  },

  // Activity actions
  addActivity: (activity) => {
    set((state) => ({
      activities: [
        {
          ...activity,
          id: `act_${Date.now()}`,
          timestamp: new Date(),
        },
        ...state.activities,
      ].slice(0, 50), // Keep last 50 activities
    }));
  },

  // Agent actions
  setAgentStatus: (status) => set({ agentStatus: status }),
  setCurrentTask: (task) => set({ currentTask: task }),

  // Stats actions
  incrementStat: (key) => {
    set((state) => ({
      stats: {
        ...state.stats,
        [key]: state.stats[key] + 1,
      },
    }));
  },
}));
