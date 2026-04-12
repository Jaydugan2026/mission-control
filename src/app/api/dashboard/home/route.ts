import { NextResponse } from 'next/server';
import { getHomeData } from '@/lib/dashboard/getHomeData';

export async function GET() {
  try {
    const data = await getHomeData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Dashboard home API error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}
