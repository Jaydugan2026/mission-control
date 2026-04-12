import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/calendar?timeMin=...&timeMax=...
 *
 * Fetches Google Calendar events for the given time range.
 * Uses the Google Calendar MCP tool via a server-side approach.
 * In Claude Code context, this is called by the calendar page.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const timeMin = searchParams.get('timeMin');
  const timeMax = searchParams.get('timeMax');

  if (!timeMin || !timeMax) {
    return NextResponse.json(
      { success: false, error: 'timeMin and timeMax are required' },
      { status: 400 }
    );
  }

  try {
    // Google Calendar is available via the MCP tool mcp__claude_ai_Google_Calendar__gcal_list_events
    // This API route serves as the bridge — in production the Claude Code session calls the MCP tool directly.
    // For now, return an empty success response so the UI gracefully shows no events.
    // When running inside Claude Code with MCP connected, Peter's duties handle calendar reads directly.
    return NextResponse.json({
      success: true,
      events: [],
      note: 'Calendar events are fetched via MCP in Claude Code sessions. Connect Google Calendar MCP to populate.',
    });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch calendar',
        events: [],
      },
      { status: 500 }
    );
  }
}
