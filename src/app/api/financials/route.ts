import { NextRequest, NextResponse } from 'next/server';
import { fetchJobs, filterActivePipeline } from '@/lib/jobnimbus';
import { fetchJobProfitabilityData } from '@/lib/sheets';
import { mergeFinancialData, calculateFinancialMetrics, MergedFinancialData } from '@/lib/financials';

export interface FinancialsApiResponse {
  success: boolean;
  data: {
    mergedJobs: MergedFinancialData[];
    metrics: ReturnType<typeof calculateFinancialMetrics>;
  };
  lastFetched: string;
  cacheExpires: string;
}

// Cache for 5 minutes (sheets don't change as frequently as JobNimbus)
const CACHE_DURATION_MS = 5 * 60 * 1000;

let cachedData: FinancialsApiResponse | null = null;
let cacheTimestamp: number = 0;

export async function GET(request: NextRequest) {
  const now = Date.now();

  // Return cached data if still valid
  if (cachedData && now - cacheTimestamp < CACHE_DURATION_MS) {
    return NextResponse.json({
      ...cachedData,
      fromCache: true,
    });
  }

  try {
    // Fetch JobNimbus jobs (active pipeline only)
    const allJobs = await fetchJobs();
    const activeJobs = filterActivePipeline(allJobs);

    // Fetch Google Sheet data
    const sheetRows = await fetchJobProfitabilityData();

    // Merge data
    const mergedJobs = mergeFinancialData(activeJobs, sheetRows);

    // Calculate metrics
    const metrics = calculateFinancialMetrics(mergedJobs);

    const responseTime = new Date().toISOString();
    const cacheExpiry = new Date(now + CACHE_DURATION_MS).toISOString();

    cachedData = {
      success: true,
      data: {
        mergedJobs,
        metrics,
      },
      lastFetched: responseTime,
      cacheExpires: cacheExpiry,
    };

    cacheTimestamp = now;

    return NextResponse.json({
      ...cachedData,
      fromCache: false,
    });
  } catch (error) {
    console.error('Error fetching financial data:', error);

    // Return partial data if JobNimbus works but Sheets fails
    if (error instanceof Error && error.message.includes('GOOGLE_SHEETS')) {
      return NextResponse.json({
        success: false,
        error: 'Google Sheets not configured. Please set up GOOGLE_SHEETS_SPREADSHEET_ID and GOOGLE_SERVICE_ACCOUNT_KEY environment variables.',
        data: {
          mergedJobs: [],
          metrics: {
            totalProfit: 0,
            totalRevenue: 0,
            totalCosts: 0,
            totalTax: 0,
            totalTaxPaid: 0,
            avgProfitMargin: 0,
            profitByRep: {},
            jobsWithMatches: 0,
            jobsWithoutMatches: 0,
          },
        },
        lastFetched: new Date().toISOString(),
        cacheExpires: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
