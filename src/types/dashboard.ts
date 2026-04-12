/**
 * Dashboard Homepage Payload Types
 * Matches the API shape defined in Dashboard/Homepage.md
 */

export type SystemState = 'healthy' | 'warning' | 'failed';

export type PeterStatus = 'idle' | 'running' | 'success' | 'failed';

export type DutyKey = 'morning-brief' | 'end-of-day' | 'stale-nudge' | 'weekly-summary';

export type DutyStatus = 'not_run_yet' | 'queued' | 'running' | 'success' | 'failed';

export type RolloutState =
  | 'planning'
  | 'test_ready'
  | 'manual_test_running'
  | 'trusted_manual'
  | 'ready_for_broader_rollout';

export type FailureStatus = 'open' | 'resolved';

export interface PeterState {
  status: PeterStatus;
  currentDuty: DutyKey | null;
  lastCompletedDuty: DutyKey | null;
  lastResult: 'success' | 'failed' | null;
  lastRunAt: string | null;
}

export interface DutyState {
  key: DutyKey;
  label: string;
  status: DutyStatus;
  lastRunAt: string | null;
  lastResult: 'success' | 'failed' | null;
  canRun: boolean;
}

export interface MorningBriefState {
  rolloutState: RolloutState;
  triggerMode: 'manual_only' | 'scheduled';
  recipientMode: 'one_brief_per_salesperson' | 'single_combined';
  justinGetsOwnBrief: boolean;
  lastRunAt: string | null;
  lastResult: 'success' | 'failed' | null;
  filteringConfidence: 'unknown' | 'low' | 'medium' | 'high';
  sendStatus: 'not_sent' | 'sending' | 'sent' | 'failed' | null;
}

export interface Failure {
  id: string;
  workflow: string;
  cause: string;
  status: FailureStatus;
  timestamp: string;
}

export interface RecentRun {
  id: string;
  duty: DutyKey;
  triggeredBy: string;
  result: 'success' | 'failed';
  timestamp: string;
  durationSeconds: number;
}

export interface HomepagePayload {
  generatedAt: string;
  systemState: SystemState;
  peter: PeterState;
  duties: DutyState[];
  morningBrief: MorningBriefState;
  failures: Failure[];
  recentRuns: RecentRun[];
}
