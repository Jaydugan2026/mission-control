/**
 * Financial Data Matching & Merging
 *
 * Matches JobNimbus jobs to Google Sheet rows using name + address matching
 */

import { JobnimbusJob } from './jobnimbus';
import { SheetRow } from './sheets';

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

  const normalized = normalize(fullName);

  // Handle "Last, First" format
  if (normalized.includes(',')) {
    const [last, first] = normalized.split(',').map(s => s.trim());
    return { firstName: first, lastName: last };
  }

  // Handle "First Last" format
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
function calculateMatchScore(job: JobnimbusJob, row: SheetRow): { score: number; confidence: 'high' | 'medium' | 'low' | 'none' } {
  let score = 0;

  // Parse names
  const jobRep = parseSalesRepName(job.created_by_name);
  const sheetCustomer = parseCustomerName(row.Customer);

  // Sales Rep matching (40 points max)
  // Use exact matching for known reps, fallback to first name matching
  if (matchSalesRep(job.created_by_name, row['Sales Rep'])) {
    score += 40; // Full points for exact rep match
  } else {
    // Fallback: partial name matching for unknown reps
    const repFirstMatch = jobRep.firstName && normalize(row['Sales Rep']).includes(jobRep.firstName) ? 20 : 0;
    const repLastMatch = jobRep.lastName && normalize(row['Sales Rep']).includes(jobRep.lastName) ? 20 : 0;
    score += Math.max(repFirstMatch, repLastMatch);
  }

  // Address matching (40 points max)
  const jobAddress = normalize(job.address_line1);
  const sheetAddress = normalize(row.Address);

  // Exact address match
  if (jobAddress && sheetAddress && jobAddress === sheetAddress) {
    score += 25;
  } else if (jobAddress && sheetAddress) {
    // Partial address match (one contains the other)
    if (jobAddress.includes(sheetAddress) || sheetAddress.includes(jobAddress)) {
      score += 15;
    } else {
      // Check for street number match
      const jobNumber = jobAddress.match(/^\d+/)?.[0];
      const sheetNumber = sheetAddress.match(/^\d+/)?.[0];
      if (jobNumber && sheetNumber && jobNumber === sheetNumber) {
        score += 10;
      }
    }
  }

  // City matching (20 points)
  const jobCity = normalize(job.city);
  const sheetCity = normalize(row.City);

  if (jobCity && sheetCity) {
    if (jobCity === sheetCity) {
      score += 20;
    } else if (jobCity.includes(sheetCity) || sheetCity.includes(jobCity)) {
      score += 10;
    }
  }

  // Determine confidence level
  let confidence: 'high' | 'medium' | 'low' | 'none';
  if (score >= 70) confidence = 'high';
  else if (score >= 40) confidence = 'medium';
  else if (score >= 20) confidence = 'low';
  else confidence = 'none';

  return { score, confidence };
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
 * Merge JobNimbus jobs with Google Sheet data
 */
export function mergeFinancialData(jobs: JobnimbusJob[], sheetRows: SheetRow[]): MergedFinancialData[] {
  return jobs.map(job => {
    const { row: sheetData, confidence } = matchJobToSheet(job, sheetRows);

    return {
      jnid: job.jnid,
      jobName: job.name,
      status: job.status_name,
      approvedEstimate: job.approved_estimate_total || 0,
      salesRep: job.created_by_name || 'Unknown',
      address: job.address_line1 || '',
      city: job.city || '',
      contactName: job.primary?.name || null,
      contactEmail: job.primary?.email || null,
      contactPhone: job.primary?.number || null,
      sheetData: sheetData || null,
      contractValue: sheetData?.['Contract Value'] ?? null,
      hasSheetMatch: !!sheetData,
      matchConfidence: confidence,
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

  const avgProfitMargin = withSheetData.length > 0
    ? withSheetData.reduce((sum, d) => sum + (d.sheetData?.['Profit Margin'] || 0), 0) / withSheetData.length
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
