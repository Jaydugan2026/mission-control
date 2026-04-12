// src/types/sales-report.ts

export interface SalesReportKPIs {
  totalRevenue: number;
  totalProfit: number;
  avgProfitMargin: number;
  closedThisMonthCount: number;
  closedThisMonthValue: number;
}

export interface RepDeal {
  jobName: string;
  status: string;
  contractValue: number | null;
  salePrice: number | null;
  totalJobCosts: number | null;
  totalProfit: number | null;
  profitMargin: number | null;
  // Temporary diagnostics for financial matching audit — remove once matching is stable
  matchConfidence?: 'high' | 'medium' | 'low' | 'none';
  matchScore?: number;
  matchedRowIndex?: number;
  matchDebug?: {
    repScore: number;
    addressScore: number;
    cityScore: number;
    repMatched: boolean;
    addressMatched: boolean;
    cityMatched: boolean;
  };
}

export interface RepLeaderboardRow {
  repName: string;
  dealCount: number;      // active pipeline deals from JN
  pipelineValue: number;  // sum of approved_estimate_total from JN
  revenue: number;        // sum of sheetData['Sale Price'] from matched jobs
  profit: number;         // sum of sheetData['Total Profit'] from matched jobs
  margin: number;         // avg of sheetData['Profit Margin'] from matched jobs
  deals: RepDeal[];       // individual matched deals for the expandable row
}

export interface SalesReportPayload {
  kpis: SalesReportKPIs;
  repLeaderboard: RepLeaderboardRow[];
  generatedAt: string;
}
