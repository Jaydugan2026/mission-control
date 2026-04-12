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
  date_status_change: number | string | null; // Unix timestamp or ISO string
  date_updated: number | string | null;
  date_created: number | string | null;
  approved_estimate_total: number | null;
  address_line1: string | null;
  city: string | null;
  is_active: boolean;
  is_closed: boolean;
  // New fields for contact & tracking (JobNimbus structure)
  primary: {
    name: string | null;
    email: string | null;
    number: string | null;
  } | null;
  source_name: string | null;
  created_by_name: string | null;
  sales_rep_name: string | null; // Sales rep assigned to job
  probability: number | null;
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
  leadAge: number; // days since date_created
  contractValue?: number; // From Google Sheets column I
  contactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  owner?: string; // sales rep name
  leadSource?: string;
  probability?: number;
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
    'date_created',
    'approved_estimate_total',
    'address_line1',
    'city',
    'is_active',
    'is_closed',
    // New fields for contact & tracking
    'primary',
    'source_name',
    'created_by_name',
    'sales_rep_name',
    'probability',
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
  return data.results || data.jobs || [];
}

/**
 * Parse date from JobNimbus API (handles Unix timestamp in seconds or milliseconds, or ISO string)
 * Detects format by checking magnitude: timestamps > 10^12 are treated as milliseconds
 */
export function parseDate(value: number | string | null): number | null {
  if (value === null) return null;

  let timestamp: number;
  if (typeof value === 'string') {
    timestamp = new Date(value).getTime();
  } else {
    // Detect if timestamp is in seconds (< 10^12) or milliseconds (>= 10^12)
    // Year 2001 = 978307200000ms, so anything > 10^12 is likely milliseconds
    timestamp = value > 1e12 ? value : value * 1000;
  }

  return isNaN(timestamp) ? null : timestamp;
}

/**
 * Filter to active pipeline records (excludes Lost, Paid & Closed)
 * Only includes jobs created on/after 01/01/2025
 */
export function filterActivePipeline(jobs: JobnimbusJob[]): JobnimbusJob[] {
  const excludedStatuses = ['Lost', 'Paid & Closed'];
  const minDate = new Date('2025-01-01').getTime();

  return jobs.filter(job => {
    // Filter by date_created >= 01/01/2025
    const createdDate = parseDate(job.date_created);
    if (createdDate === null || createdDate < minDate) return false;

    return (
      job.is_active &&
      !job.is_closed &&
      !excludedStatuses.includes(job.status_name)
    );
  });
}

/**
 * Group jobs by status_name and calculate totals
 * Deals within each stage are sorted by date_status_change descending (most recent first)
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

  // Convert to PipelineStage format, sorting deals by most recent first
  return Array.from(stages.entries()).map(([name, data]) => ({
    name,
    count: data.count,
    totalValue: data.totalValue,
    deals: data.deals
      .sort((a, b) => {
        const aDate = parseDate(a.date_status_change) || 0;
        const bDate = parseDate(b.date_status_change) || 0;
        return bDate - aDate; // Descending order (most recent first)
      })
      .map(job => jobToPipelineDeal(job)),
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

    const statusChangeDate = parseDate(job.date_status_change);
    if (statusChangeDate === null) return true;
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
  const now = Date.now();
  const statusChangeTs = parseDate(job.date_status_change);
  const createdTs = parseDate(job.date_created);
  const updatedTs = parseDate(job.date_updated);

  const daysInStage = statusChangeTs
    ? Math.floor((now - statusChangeTs) / (1000 * 60 * 60 * 24))
    : 0;

  const leadAge = createdTs
    ? Math.floor((now - createdTs) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    id: job.jnid,
    name: job.name,
    stage: job.status_name,
    value: job.approved_estimate_total || 0,
    lastContact: updatedTs
      ? new Date(updatedTs).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'Unknown',
    daysInStage,
    leadAge,
    contactInfo: {
      name: job.primary?.name || undefined,
      email: job.primary?.email || undefined,
      phone: job.primary?.number || undefined,
    },
    owner: job.sales_rep_name || job.created_by_name || undefined,
    leadSource: job.source_name || undefined,
    probability: job.probability || undefined,
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
