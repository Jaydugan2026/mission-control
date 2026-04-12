/**
 * Google Sheets API Client
 *
 * Reads financial data from "Master Spreadsheet" → "Job Profitability" tab
 */

import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

export interface SheetRow {
  // Customer & Sales Rep
  Customer: string;
  'Sales Rep': string;

  // Address
  Address: string;
  City: string;
  'Postal Code': string;

  // Job details
  'Square Count': number;
  'Price Per SQ': number;
  'Final Invoice': number;
  'Sale Price': number;
  'Contract Value': number; // Column I

  // Costs
  Material: number;
  Labor: number;
  Commission: number;
  'ISR Commission': number;
  'Additional Material': number;
  'Dump Costs': number;
  'PM Fee': number;

  // Financials
  'Total Job Costs': number;
  'Total Profit': number;
  'Profit Margin': number;
  '20% Tax': number;
  'Tax Paid': number;

  // Metrics
  'Commission %': number;
  'Markup Margin': number;
  EPM: number;
  'Margin Difference': number;
  'Profit Difference': number;
}

/**
 * Initialize Google Sheets auth
 */
function getAuth() {
  if (!GOOGLE_SERVICE_ACCOUNT_KEY) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }

  try {
    const credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT_KEY);
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
  } catch (error) {
    throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_KEY format: ' + error);
  }
}

/**
 * Fetch all rows from Job Profitability sheet
 */
export async function fetchJobProfitabilityData(): Promise<SheetRow[]> {
  if (!SPREADSHEET_ID) {
    throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID environment variable is not set');
  }

  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  // Fetch all data from Job Profitability tab
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Job Profitability!A1:AZ1000', // Adjust range as needed
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    return [];
  }

  // Parse header row
  const headers = rows[0].map(h => h.trim());

  // Convert remaining rows to objects
  const dataRows: SheetRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0 || (row[0] && row[0].trim() === '')) continue; // Skip empty rows

    const obj: Record<string, string | number> = {};
    headers.forEach((header, index) => {
      let value: string | number = row[index] || '';

      // Try to parse numbers - handle currency format like "$8,969.98"
      if (typeof value === 'string' && value !== '') {
        // Remove currency symbols, commas, and percentage signs
        const cleaned = value.replace(/[$,]/g, '').replace(/%$/, '');
        const numValue = Number(cleaned);
        if (!isNaN(numValue)) {
          value = numValue;
        }
      }
      obj[header] = value;
    });

    dataRows.push(obj as unknown as SheetRow);
  }

  return dataRows;
}

/**
 * Get spreadsheet info (sheet names, etc.)
 */
export async function getSpreadsheetInfo() {
  if (!SPREADSHEET_ID) {
    throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID environment variable is not set');
  }

  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  return {
    title: response.data.properties?.title,
    sheets: response.data.sheets?.map(s => ({
      name: s.properties?.title,
      index: s.properties?.index,
    })),
  };
}
