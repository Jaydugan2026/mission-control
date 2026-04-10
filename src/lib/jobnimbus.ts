/**
 * JOBnimbus API Client
 *
 * READ ONLY - Never modifies data
 * Base URL: https://app.jobnimbus.com/api1
 */

const JOBnimbus_API_URL = process.env.JOBnimbus_API_URL || 'https://app.jobnimbus.com/api1';
const JOBnimbus_API_TOKEN = process.env.JOBnimbus_API_TOKEN || 'mnq46909lsjqbvyx';

export interface JobnimbusJob {
  jnid: string;
  name: string;
  status_name: string;
  record_type_name: string;
  date_status_change: string | null;
  date_updated: string | null;
  approved_estimate_total: number | null;
  address_line1: string | null;
  city: string | null;
  is_active: boolean;
  is_closed: boolean;
}

export interface PipelineStage {
  name: string;
  count: number;
  totalValue: number;
  deals: PipelineDeal[];
}

export interface PipelineDeal {
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

/**
 * Fetch all jobs from JOBnimbus API
 */
export async function fetchJobs(): Promise<JobnimbusJob[]> {
  const fields = [
    'jnid',
    'name',
    'status_name',
    'record_type_name',
    'date_status_change',
    'date_updated',
    'approved_estimate_total',
    'address_line1',
    'city',
    'is_active',
    'is_closed',
  ].join(',');

  const url = `${JOBnimbus_API_URL}/jobs?size=500&fields=${fields}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `token ${JOBnimbus_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`JOBnimbus API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.jobs || [];
}

/**
 * Filter to active pipeline records (excludes Lost, Paid & Closed)
 */
export function filterActivePipeline(jobs: JobnimbusJob[]): JobnimbusJob[] {
  const excludedStatuses = ['Lost', 'Paid & Closed'];

  return jobs.filter(job =>
    job.is_active &&
    !job.is_closed &&
    !excludedStatuses.includes(job.status_name)
  );
}

/**
 * Group jobs by status_name and calculate totals
 */
export function groupByStage(jobs: JobnimbusJob[]): PipelineStage[] {
  const stages = new Map<string, { count: number; totalValue: number; deals: JobnimbusJob[] }>();

  jobs.forEach(job => {
    const stage = job.status_name || 'Unknown';

    if (!stages.has(stage)) {
      stages.set(stage, { count: 0, totalValue: 0, deals: [] });
    }

    const stageData = stages.get(stage)!;
    stageData.count++;
    stageData.totalValue += job.approved_estimate_total || 0;
    stageData.deals.push(job);
  });

  // Convert to PipelineStage format
  return Array.from(stages.entries()).map(([name, data]) => ({
    name,
    count: data.count,
    totalValue: data.totalValue,
    deals: data.deals.map(job => jobToPipelineDeal(job)),
  }));
}

/**
 * Find stalled records (no status change in N days)
 */
export function findStalledRecords(jobs: JobnimbusJob[], daysThreshold: number = 3): JobnimbusJob[] {
  const thresholdMs = daysThreshold * 24 * 60 * 60 * 1000;
  const now = Date.now();

  return jobs.filter(job => {
    if (!job.date_status_change) return true; // No date = potentially stalled

    const statusChangeDate = new Date(job.date_status_change).getTime();
    return (now - statusChangeDate) > thresholdMs;
  });
}

/**
 * Sort stalled records by urgency
 */
export function sortStalledByUrgency(jobs: JobnimbusJob[]): JobnimbusJob[] {
  const urgencyOrder: Record<string, number> = {
    'Signed Contract': 1,
    'Deposit Collected': 2,
    'Verbal Agreement': 3,
    'Estimate Presented': 4,
    'ILS Needed': 5,
  };

  return jobs.sort((a, b) => {
    const aUrgency = urgencyOrder[a.status_name] || 99;
    const bUrgency = urgencyOrder[b.status_name] || 99;
    return aUrgency - bUrgency;
  });
}

/**
 * Convert JOBnimbus job to PipelineDeal format for UI
 */
export function jobToPipelineDeal(job: JobnimbusJob): PipelineDeal {
  const daysInStage = job.date_status_change
    ? Math.floor((Date.now() - new Date(job.date_status_change).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    id: job.jnid,
    name: job.name,
    stage: job.status_name,
    value: job.approved_estimate_total || 0,
    lastContact: job.date_updated
      ? new Date(job.date_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'Unknown',
    daysInStage,
    contactInfo: {
      // These would need additional API calls to populate fully
      email: undefined,
      phone: undefined,
    },
  };
}

/**
 * Get pipeline summary stats
 */
export function getPipelineSummary(jobs: JobnimbusJob[]) {
  const active = filterActivePipeline(jobs);
  const totalValue = active.reduce((sum, job) => sum + (job.approved_estimate_total || 0), 0);
  const avgDealValue = active.length > 0 ? totalValue / active.length : 0;

  return {
    totalDeals: active.length,
    pipelineValue: totalValue,
    avgDealValue,
  };
}
