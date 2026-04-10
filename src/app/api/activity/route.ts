import { NextResponse } from 'next/server';

// Mock activity data - in production this would come from a database
const MOCK_ACTIVITIES = [
  {
    id: 'act_1',
    type: 'duty_executed' as const,
    title: 'Morning Brief completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    details: 'Email sent to JD@fortituderoofing.co',
  },
  {
    id: 'act_2',
    type: 'email_sent' as const,
    title: 'Stale Lead Nudge sent',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    details: '3 stale leads found and reported',
  },
  {
    id: 'act_3',
    type: 'duty_executed' as const,
    title: 'End-of-Day Wrap-up completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 hours ago
    details: 'Email sent to JD@fortituderoofing.co',
  },
];

export async function GET() {
  return NextResponse.json({
    activities: MOCK_ACTIVITIES,
  });
}
