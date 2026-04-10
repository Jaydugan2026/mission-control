import { NextRequest, NextResponse } from 'next/server';

// Slash commands mapping
const DUTY_COMMANDS: Record<string, string> = {
  'morning-brief': '/peter-morning-brief',
  'wrap-up': '/peter-wrap-up',
  'stale-nudge': '/peter-stale-nudge',
  'weekly-summary': '/peter-weekly-summary',
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!DUTY_COMMANDS[id]) {
    return NextResponse.json(
      { error: 'Unknown duty ID' },
      { status: 404 }
    );
  }

  // Return the slash command for the user to run
  // In a future version, this could trigger an actual webhook or API call
  return NextResponse.json({
    success: true,
    dutyId: id,
    slashCommand: DUTY_COMMANDS[id],
    message: `Run this command in Claude Code: ${DUTY_COMMANDS[id]}`,
    startedAt: new Date().toISOString(),
  });
}

export async function GET() {
  return NextResponse.json({
    duties: Object.keys(DUTY_COMMANDS).map((id) => ({
      id,
      slashCommand: DUTY_COMMANDS[id],
    })),
  });
}
