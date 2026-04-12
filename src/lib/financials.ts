/**
 * Financial Data Matching & Merging
 *
 * Matches JobNimbus jobs to Google Sheet rows using name + address matching
 */

import { JobnimbusJob } from './jobnimbus';
import { SheetRow } from './sheets';

interface MatchDebug {
  repScore: number;
  addressScore: number;
  cityScore: number;
  repMatched: boolean;
  addressMatched: boolean;
  cityMatched: boolean;
}

export interface MergedFinancialData {
  // From JobNimbus
  jnid: string;
  jobName: string;
  status: string;
  approvedEstimate: number;
  salesRep: string;
  address: string;
  city: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;

  // From Google Sheet
  sheetData: SheetRow | null;
  contractValue: number | null;

  // Computed
  hasSheetMatch: boolean;
  matchConfidence: 'high' | 'medium' | 'low' | 'none';
  matchScore?: number;
  matchedRowIndex?: number;
  matchDebug?: MatchDebug;
}

/**
 * Normalize string for comparison (lowercase, remove special chars, trim)
 */
function normalize(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalize a street address for comparison.
 * Strips unit info, standardizes suffixes and directionals so formatting
 * differences between JobNimbus and Google Sheets don't block true matches.
 */
function normalizeAddress(str: string | null | undefined): string {
  if (!str) return '';
  // Lowercase, strip punctuation, collapse whitespace
  let s = str.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  // Strip unit/apartment/suite markers and anything trailing them on the same token
  s = s.replace(/\b(apartment|apt|suite|ste|unit|lot)\s*\S*/g, '').replace(/#\S*/g, '').trim();
  // Standardize street suffixes
  const suffixes: Record<string, string> = {
    street: 'st', road: 'rd', avenue: 'ave', boulevard: 'blvd',
    drive: 'dr', lane: 'ln', court: 'ct', circle: 'cir',
    place: 'pl', terrace: 'ter', parkway: 'pkwy', highway: 'hwy',
  };
  // Standardize directionals
  const directions: Record<string, string> = {
    north: 'n', south: 's', east: 'e', west: 'w',
  };
  s = s.split(' ').map(w => suffixes[w] ?? directions[w] ?? w).join(' ');
  return s.replace(/\s+/g, ' ').trim();
}

/**
 * Known sales rep names for exact matching
 * These are the exact names as they appear in JobNimbus and Google Sheets
 */
const KNOWN_SALES_REPS = [
  'Cameron Cooke',
  'Michael Kirkland',
  'Jacob Plunkett',
  'Dominick Tessorio',
  'Justin Dugan',
];

/**
 * Check if a sales rep name matches exactly or by first name
 */
function matchSalesRep(jobRepName: string | null, sheetSalesRep: string): boolean {
  if (!jobRepName) return false;

  const jobNorm = normalize(jobRepName);
  const sheetNorm = normalize(sheetSalesRep);

  // Exact match
  if (jobNorm === sheetNorm) return true;

  // Check against known reps - match by first name
  for (const knownRep of KNOWN_SALES_REPS) {
    const knownNorm = normalize(knownRep);
    const [firstName] = knownNorm.split(' ');

    // If job rep matches this known rep, check if sheet also matches
    if (jobNorm === knownNorm) {
      return sheetNorm === knownNorm || normalize(sheetNorm).includes(firstName);
    }
  }

  // First name match for unknown reps
  const jobFirst = jobNorm.split(' ')[0];
  const sheetFirst = sheetNorm.split(' ')[0];
  return jobFirst === sheetFirst && jobFirst.length > 2;
}

/**
 * Extract first + last name from JobNimbus created_by_name
 * Handles formats like "John Doe", "Doe, John", "John"
 */
function parseSalesRepName(fullName: string | null): { firstName: string; lastName: string } {
  if (!fullName) return { firstName: '', lastName: '' };

  // Check raw string for comma BEFORE normalize() strips punctuation
  const trimmed = fullName.trim();
  if (trimmed.includes(',')) {
    const [rawLast, rawFirst] = trimmed.split(',').map(s => s.trim());
    return { firstName: normalize(rawFirst), lastName: normalize(rawLast) };
  }

  // Handle "First Last" format
  const normalized = normalize(fullName);
  const parts = normalized.split(' ');
  if (parts.length >= 2) {
    return { firstName: parts[0], lastName: parts[parts.length - 1] };
  }

  return { firstName: parts[0] || '', lastName: '' };
}

/**
 * Extract customer name from sheet (might be "First Last" or company name)
 */
function parseCustomerName(customerName: string): { firstName: string; lastName: string } {
  const normalized = normalize(customerName);
  const parts = normalized.split(' ');

  if (parts.length >= 2) {
    return { firstName: parts[0], lastName: parts[parts.length - 1] };
  }

  return { firstName: parts[0] || '', lastName: '' };
}

/**
 * Calculate match score between JobNimbus job and sheet row
 * Returns score 0-100 and confidence level
 */
function calculateMatchScore(job: JobnimbusJob, row: SheetRow): { score: number; confidence: 'high' | 'medium' | 'low' | 'none'; debug: MatchDebug } {
  let repScore = 0;
  let addressScore = 0;
  let cityScore = 0;

  // Parse names
  const jobRep = parseSalesRepName(job.created_by_name);
  const sheetCustomer = parseCustomerName(row.Customer);

  // Sales Rep matching (25 points max)
  if (matchSalesRep(job.created_by_name, row['Sales Rep'])) {
    repScore = 25;
  } else {
    const repFirstMatch = jobRep.firstName && normalize(row['Sales Rep']).includes(jobRep.firstName) ? 12 : 0;
    const repLastMatch = jobRep.lastName && normalize(row['Sales Rep']).includes(jobRep.lastName) ? 12 : 0;
    repScore = Math.max(repFirstMatch, repLastMatch);
  }

  // Address matching (45 points max)
  const jobAddress = normalizeAddress(job.address_line1);
  const sheetAddress = normalizeAddress(row.Address);

  if (jobAddress && sheetAddress && jobAddress === sheetAddress) {
    addressScore = 45;
  } else if (jobAddress && sheetAddress) {
    if (jobAddress.includes(sheetAddress) || sheetAddress.includes(jobAddress)) {
      addressScore = 25;
    } else {
      const jobNumber = jobAddress.match(/^\d+/)?.[0];
      const sheetNumber = sheetAddress.match(/^\d+/)?.[0];
      if (jobNumber && sheetNumber && jobNumber === sheetNumber) {
        addressScore = 10;
      }
    }
  }

  // City matching (10 points max)
  const jobCity = normalize(job.city);
  const sheetCity = normalize(row.City);

  if (jobCity && sheetCity) {
    if (jobCity === sheetCity) {
      cityScore = 10;
    } else if (jobCity.includes(sheetCity) || sheetCity.includes(jobCity)) {
      cityScore = 5;
    }
  }

  const score = repScore + addressScore + cityScore;

  let confidence: 'high' | 'medium' | 'low' | 'none';
  if (score >= 70) confidence = 'high';
  else if (score >= 55) confidence = 'medium';
  else if (score >= 35) confidence = 'low';
  else confidence = 'none';

  const debug: MatchDebug = {
    repScore,
    addressScore,
    cityScore,
    repMatched: repScore === 25,
    addressMatched: addressScore >= 25,
    cityMatched: cityScore > 0,
  };

  // suppress unused variable warning — sheetCustomer retained for future use
  void sheetCustomer;

  return { score, confidence, debug };
}

/**
 * Match a single JobNimbus job to a sheet row
 */
export function matchJobToSheet(job: JobnimbusJob, sheetRows: SheetRow[]): { row: SheetRow | null; confidence: 'high' | 'medium' | 'low' | 'none' } {
  let bestMatch: { row: SheetRow; score: number; confidence: 'high' | 'medium' | 'low' | 'none' } | null = null;

  for (const row of sheetRows) {
    const { score, confidence } = calculateMatchScore(job, row);

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { row, score, confidence };
    }
  }

  // Only return match if confidence is at least medium
  if (bestMatch && bestMatch.confidence !== 'none') {
    return { row: bestMatch.row, confidence: bestMatch.confidence };
  }

  return { row: null, confidence: 'none' };
}

/**
 * Merge JobNimbus jobs with Google Sheet data using greedy one-to-one matching.
 * Each sheet row is assigned to at most one job — the highest-scoring pair wins.
 * This prevents the same sheet row from appearing across multiple jobs.
 */
export function mergeFinancialData(jobs: JobnimbusJob[], sheetRows: SheetRow[]): MergedFinancialData[] {
  type Candidate = { jobIdx: number; rowIdx: number; score: number; confidence: 'high' | 'medium' | 'low' | 'none'; debug: MatchDebug };
  const candidates: Candidate[] = [];

  for (let ji = 0; ji < jobs.length; ji++) {
    for (let ri = 0; ri < sheetRows.length; ri++) {
      const { score, confidence, debug } = calculateMatchScore(jobs[ji], sheetRows[ri]);
      if (confidence === 'medium' || confidence === 'high') {
        candidates.push({ jobIdx: ji, rowIdx: ri, score, confidence, debug });
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  const assignedJobs = new Set<number>();
  const assignedRows = new Set<number>();
  const matches = new Map<number, { row: SheetRow; confidence: 'high' | 'medium' | 'low' | 'none'; score: number; rowIdx: number; debug: MatchDebug }>();

  for (const c of candidates) {
    if (!assignedJobs.has(c.jobIdx) && !assignedRows.has(c.rowIdx)) {
      assignedJobs.add(c.jobIdx);
      assignedRows.add(c.rowIdx);
      matches.set(c.jobIdx, { row: sheetRows[c.rowIdx], confidence: c.confidence, score: c.score, rowIdx: c.rowIdx, debug: c.debug });
    }
  }

  return jobs.map((job, ji) => {
    const match = matches.get(ji) ?? null;
    return {
      jnid: job.jnid,
      jobName: job.name,
      status: job.status_name,
      approvedEstimate: job.approved_estimate_total || 0,
      salesRep: job.sales_rep_name || job.created_by_name || 'Unknown',
      address: job.address_line1 || '',
      city: job.city || '',
      contactName: job.primary?.name || null,
      contactEmail: job.primary?.email || null,
      contactPhone: job.primary?.number || null,
      sheetData: match?.row ?? null,
      contractValue: match?.row?.['Contract Value'] ?? null,
      hasSheetMatch: !!match,
      matchConfidence: match?.confidence ?? 'none',
      matchScore: match?.score,
      matchedRowIndex: match?.rowIdx,
      matchDebug: match?.debug,
    };
  });
}

/**
 * Calculate aggregate financial metrics
 */
export function calculateFinancialMetrics(mergedData: MergedFinancialData[]) {
  const withSheetData = mergedData.filter(d => d.sheetData);

  const totalProfit = withSheetData.reduce((sum, d) => sum + (d.sheetData?.['Total Profit'] || 0), 0);
  const totalRevenue = withSheetData.reduce((sum, d) => sum + (d.sheetData?.['Sale Price'] || 0), 0);
  const totalCosts = withSheetData.reduce((sum, d) => sum + (d.sheetData?.['Total Job Costs'] || 0), 0);

  const avgProfitMargin = totalRevenue > 0
    ? totalProfit / totalRevenue
    : 0;

  // Profit by Sales Rep
  const profitByRep = new Map<string, number>();
  withSheetData.forEach(d => {
    const rep = d.salesRep || 'Unknown';
    const currentProfit = profitByRep.get(rep) || 0;
    profitByRep.set(rep, currentProfit + (d.sheetData?.['Total Profit'] || 0));
  });

  return {
    totalProfit,
    totalRevenue,
    totalCosts,
    avgProfitMargin,
    profitByRep: Object.fromEntries(profitByRep),
    jobsWithMatches: withSheetData.length,
    jobsWithoutMatches: mergedData.length - withSheetData.length,
  };
}
