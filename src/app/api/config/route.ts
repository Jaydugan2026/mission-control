import { NextResponse } from 'next/server';

// Configuration - in production this would come from environment variables or a database
const CONFIG = {
  email: 'JD@fortituderoofing.co',
  schedules: {
    'wrap-up': '0 17 * * *',
    'stale-nudge': '0 9 * * *',
    'weekly-summary': '0 7 * * 1',
  },
  apiKeys: {
    jobnimbus: 'mnq46909lsjqbvyx',
  },
};

export async function GET() {
  return NextResponse.json(CONFIG);
}

export async function PUT(request: Request) {
  const body = await request.json();

  // In production, you would validate and save the config
  // For now, just echo back the received config
  return NextResponse.json({
    ...CONFIG,
    ...body,
    message: 'Config updated (mock)',
  });
}
