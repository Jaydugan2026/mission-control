'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import Layout from '@/components/layout';

interface CalEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  allDay?: boolean;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch { return ''; }
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export default function CalendarPage() {
  const [monday, setMonday] = useState(() => getMondayOf(new Date()));
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const timeMin = monday.toISOString();
      const end = new Date(monday);
      end.setDate(monday.getDate() + 7);
      const timeMax = end.toISOString();
      const res = await fetch(`/api/calendar?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`);
      const data = await res.json();
      if (data.success) setEvents(data.events ?? []);
      else setError(data.error ?? 'Failed to load calendar');
    } catch {
      setError('Could not reach calendar API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [monday]);

  const prevWeek = () => { const d = new Date(monday); d.setDate(d.getDate() - 7); setMonday(d); };
  const nextWeek = () => { const d = new Date(monday); d.setDate(d.getDate() + 7); setMonday(d); };
  const goToday  = () => setMonday(getMondayOf(new Date()));

  const endOfWeek = new Date(monday);
  endOfWeek.setDate(monday.getDate() + 6);
  const today = new Date();

  const weekLabel =
    monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' — ' +
    endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Layout>
      <div className="p-6 space-y-5 fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[#f1f5f9]">Calendar</h1>
            <p className="text-xs text-[#475569] mt-0.5">{weekLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToday}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#1e2d4a] text-[#94a3b8] hover:border-[#3b82f6] hover:text-[#3b82f6] transition-all cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={prevWeek}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#1e2d4a] text-[#94a3b8] hover:border-[#3b82f6] hover:text-[#3b82f6] transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextWeek}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#1e2d4a] text-[#94a3b8] hover:border-[#3b82f6] hover:text-[#3b82f6] transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={fetchEvents}
              disabled={loading}
              className="flex items-center gap-1 text-xs text-[#94a3b8] hover:text-[#3b82f6] transition-colors disabled:opacity-40 cursor-pointer ml-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 bg-[#ef4444]/10 border border-[#ef4444]/25 rounded-xl text-sm text-[#ef4444]">
            {error} — Google Calendar may need to be reconnected via MCP.
          </div>
        )}

        {/* Week grid */}
        <div className="bg-[#0d1424] border border-[#1e2d4a] border-l-[3px] border-l-[#3b82f6] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.4)] overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-[#1e2d4a]">
            {weekDays.map((day, i) => {
              const isToday = isSameDay(day, today);
              return (
                <div
                  key={i}
                  className={`px-3 py-3 text-center border-r border-[#1e2d4a] last:border-r-0 ${
                    isToday ? 'bg-[#3b82f6]/8' : ''
                  }`}
                >
                  <div className="text-xs text-[#475569] font-medium">{DAYS[i]}</div>
                  <div className={`text-xl font-semibold mt-0.5 ${isToday ? 'text-[#3b82f6]' : 'text-[#f1f5f9]'}`}>
                    {day.getDate()}
                  </div>
                  {isToday && <div className="w-1 h-1 rounded-full bg-[#3b82f6] mx-auto mt-1" />}
                </div>
              );
            })}
          </div>

          {/* Event columns */}
          <div className="grid grid-cols-7 min-h-[280px]">
            {weekDays.map((day, i) => {
              const isToday = isSameDay(day, today);
              const dayEvents = events.filter(ev => {
                try { return isSameDay(new Date(ev.start), day); }
                catch { return false; }
              });

              return (
                <div
                  key={i}
                  className={`px-2 py-3 border-r border-[#1e2d4a] last:border-r-0 space-y-1.5 ${
                    isToday ? 'bg-[#3b82f6]/4' : ''
                  }`}
                >
                  {loading ? (
                    <div className="h-6 bg-[#111d35] rounded animate-pulse" />
                  ) : dayEvents.length === 0 ? (
                    <div className="text-[10px] text-[#1e2d4a] text-center mt-6">—</div>
                  ) : (
                    dayEvents.map(ev => (
                      <div
                        key={ev.id}
                        title={ev.summary}
                        className="px-2 py-1.5 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20 hover:bg-[#3b82f6]/15 transition-colors"
                      >
                        {!ev.allDay && (
                          <div className="text-[9px] text-[#3b82f6] font-mono mb-0.5 leading-none">
                            {formatTime(ev.start)}
                          </div>
                        )}
                        <div className="text-[10px] text-[#f1f5f9] font-medium leading-tight line-clamp-2">
                          {ev.summary}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
