import type { HomepagePayload } from '@/types/dashboard';

export const mockHomeData: HomepagePayload = {
  generatedAt: new Date().toISOString(),
  systemState: 'healthy',
  peter: {
    status: 'idle',
    currentDuty: null,
    lastCompletedDuty: 'morning-brief',
    lastResult: 'success',
    lastRunAt: null,
  },
  duties: [
    {
      key: 'morning-brief',
      label: 'Morning Brief',
      status: 'not_run_yet',
      lastRunAt: null,
      lastResult: null,
      canRun: true,
    },
    {
      key: 'end-of-day',
      label: 'End-of-Day Wrap-up',
      status: 'not_run_yet',
      lastRunAt: null,
      lastResult: null,
      canRun: true,
    },
    {
      key: 'stale-nudge',
      label: 'Stale Lead Nudge',
      status: 'not_run_yet',
      lastRunAt: null,
      lastResult: null,
      canRun: true,
    },
    {
      key: 'weekly-summary',
      label: 'Weekly Pipeline Summary',
      status: 'not_run_yet',
      lastRunAt: null,
      lastResult: null,
      canRun: true,
    },
  ],
  morningBrief: {
    rolloutState: 'manual_test_running',
    triggerMode: 'manual_only',
    recipientMode: 'one_brief_per_salesperson',
    justinGetsOwnBrief: true,
    lastRunAt: null,
    lastResult: null,
    filteringConfidence: 'unknown',
    sendStatus: null,
  },
  failures: [],
  recentRuns: [],
};
