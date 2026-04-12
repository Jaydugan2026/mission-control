import { NextResponse } from 'next/server';
import {
  fetchJobs,
  filterActivePipeline,
  groupByStage,
  findStalledRecords,
  sortStalledByUrgency,
  getPipelineSummary,
  parseDate,
} from '@/lib/jobnimbus';
import { mergeFinancialData } from '@/lib/financials';
import { fetchJobProfitabilityData } from '@/lib/sheets';

/**
 * GET /api/pipeline
 *
 * Returns processed pipeline data from JOBnimbus + Google Sheets:
 * - stages: Pipeline grouped by status with deal counts and values
 * - stalled: Records without status change in 3+ days (top 6 by urgency)
 * - summary: Total deals, pipeline value, avg deal value
 */
export async function GET() {
  try {
    // Fetch all jobs from JOBnimbus
    const allJobs = await fetchJobs();

    // Filter to active pipeline
    const activeJobs = filterActivePipeline(allJobs);

    // Fetch Google Sheets data for contract values
    let sheetRows: any[] = [];
    try {
      sheetRows = await fetchJobProfitabilityData();
    } catch (sheetError) {
      console.warn('Could not fetch sheet data for contract values:', sheetError);
    }

    // Merge financial data to get contract values
    const mergedData = sheetRows.length > 0 ? mergeFinancialData(activeJobs, sheetRows) : [];
    const contractValueMap = new Map(mergedData.map(d => [d.jnid, d.contractValue]));

    // Group by stage
    const stages = groupByStage(activeJobs);

    // Add contract values to stages
    stages.forEach(stage => {
      stage.deals.forEach(deal => {
        const contractValue = contractValueMap.get(deal.id);
        if (contractValue !== undefined && contractValue !== null) {
          deal.contractValue = contractValue;
        }
      });
    });

    // Find and sort stalled records
    const stalled = sortStalledByUrgency(findStalledRecords(activeJobs)).slice(0, 6);

    // Get summary stats
    const summary = getPipelineSummary(allJobs);

    return NextResponse.json({
      success: true,
      data: {
        stages,
        stalled: stalled.map(job => ({
          id: job.jnid,
          name: job.name,
          stage: job.status_name,
          daysInStage: job.date_status_change
            ? Math.floor((Date.now() - (parseDate(job.date_status_change) ?? 0)) / (1000 * 60 * 60 * 24))
            : 0,
        })),
        summary,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Pipeline API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch pipeline',
        data: null,
      },
      { status: 500 }
    );
  }
}
