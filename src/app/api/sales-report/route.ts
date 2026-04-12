// src/app/api/sales-report/route.ts

import { NextResponse } from 'next/server';
import { fetchJobs, filterSalesJobs, parseDate } from '@/lib/jobnimbus';
import { fetchJobProfitabilityData } from '@/lib/sheets';
import { mergeFinancialData } from '@/lib/financials';
import type { SalesReportPayload, RepLeaderboardRow, RepDeal } from '@/types/sales-report';

const CACHE_MS = 0;
let cachedPayload: SalesReportPayload | null = null;
let cacheTimestamp = -CACHE_MS; // bust on first request after deploy

export async function GET() {
  const now = Date.now();

  if (cachedPayload && now - cacheTimestamp < CACHE_MS) {
    return NextResponse.json({ success: true, data: cachedPayload, fromCache: true });
  }

  try {
    const allJobs = await fetchJobs();
    const salesJobs = filterSalesJobs(allJobs);

    // Closed this month — jobs with is_closed and status change in current calendar month
    const monthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).getTime();
    const closedThisMonth = allJobs.filter(job => {
      if (!job.is_closed) return false;
      const changed = parseDate(job.date_status_change);
      return changed !== null && changed >= monthStart;
    });

    // Google Sheets — required for KPIs and leaderboard
    const sheetRows = await fetchJobProfitabilityData();
    const mergedJobs = mergeFinancialData(salesJobs, sheetRows);

    // KPIs — aggregate from sheetData directly (mirrors calculateFinancialMetrics logic)
    const withSheetData = mergedJobs.filter(d => d.sheetData);
    const totalRevenue = withSheetData.reduce((sum, d) => sum + (d.sheetData?.['Sale Price'] ?? 0), 0);
    const totalProfit = withSheetData.reduce((sum, d) => sum + (d.sheetData?.['Total Profit'] ?? 0), 0);
    const avgProfitMargin = totalRevenue > 0
      ? totalProfit / totalRevenue
      : 0;

    // Rep leaderboard — only reps with Sheets matches
    // Note: mergeFinancialData sets salesRep from job.created_by_name, so we must use the same
    // field for the pipeline aggregation to ensure keys match
    const repPipelineMap = new Map<string, { dealCount: number; pipelineValue: number }>();
    for (const job of salesJobs) {
      const rep = job.sales_rep_name || job.created_by_name || 'Unknown';
      const existing = repPipelineMap.get(rep) ?? { dealCount: 0, pipelineValue: 0 };
      repPipelineMap.set(rep, {
        dealCount: existing.dealCount + 1,
        pipelineValue: existing.pipelineValue + (job.approved_estimate_total ?? 0),
      });
    }

    // Aggregate financials per rep from Sheets-matched jobs only
    const repFinMap = new Map<string, {
      revenue: number;
      profit: number;
      deals: RepDeal[];
    }>();
    for (const mj of withSheetData) {
      const rep = mj.salesRep;
      const existing = repFinMap.get(rep) ?? { revenue: 0, profit: 0, deals: [] };
      const deal: RepDeal = {
        jobName: mj.jobName,
        status: mj.status,
        contractValue: mj.sheetData?.['Contract Value'] ?? null,
        salePrice: mj.sheetData?.['Sale Price'] ?? null,
        totalJobCosts: mj.sheetData?.['Total Job Costs'] ?? null,
        totalProfit: mj.sheetData?.['Total Profit'] ?? null,
        profitMargin: mj.sheetData?.['Profit Margin'] ?? null,
        // Temporary diagnostics for financial matching audit — remove once matching is stable
        matchConfidence: mj.matchConfidence,
        matchScore: mj.matchScore,
        matchedRowIndex: mj.matchedRowIndex,
        matchDebug: mj.matchDebug,
      };
      repFinMap.set(rep, {
        revenue: existing.revenue + (mj.sheetData?.['Sale Price'] ?? 0),
        profit: existing.profit + (mj.sheetData?.['Total Profit'] ?? 0),
        deals: [...existing.deals, deal],
      });
    }

    const repLeaderboard: RepLeaderboardRow[] = [];
    for (const [repName, fin] of repFinMap.entries()) {
      const pipeline = repPipelineMap.get(repName) ?? { dealCount: 0, pipelineValue: 0 };
      repLeaderboard.push({
        repName,
        dealCount: pipeline.dealCount,
        pipelineValue: pipeline.pipelineValue,
        revenue: fin.revenue,
        profit: fin.profit,
        margin: fin.revenue > 0 ? fin.profit / fin.revenue : 0,
        deals: fin.deals,
      });
    }
    repLeaderboard.sort((a, b) => b.revenue - a.revenue);

    const payload: SalesReportPayload = {
      kpis: {
        totalRevenue,
        totalProfit,
        avgProfitMargin,
        closedThisMonthCount: closedThisMonth.length,
        closedThisMonthValue: closedThisMonth.reduce(
          (sum, j) => sum + (j.approved_estimate_total ?? 0),
          0
        ),
      },
      repLeaderboard,
      generatedAt: new Date().toISOString(),
    };

    cachedPayload = payload;
    cacheTimestamp = now;

    return NextResponse.json({ success: true, data: payload, fromCache: false });
  } catch (error) {
    console.error('[sales-report] API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch sales report',
        data: null,
      },
      { status: 500 }
    );
  }
}
