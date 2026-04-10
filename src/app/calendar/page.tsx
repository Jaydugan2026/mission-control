'use client';

import { useState } from 'react';
import Layout from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type DutyType = 'weekly-summary' | 'stale-nudge' | 'wrap-up';

interface ScheduledDuty {
  type: DutyType;
  label: string;
  cron: string;
  color: 'info' | 'warning' | 'default';
}

const DUTIES: Record<DutyType, ScheduledDuty> = {
  'weekly-summary': {
    type: 'weekly-summary',
    label: 'Weekly Summary',
    cron: '0 7 * * 1', // Mondays at 7 AM
    color: 'info',
  },
  'stale-nudge': {
    type: 'stale-nudge',
    label: 'Stale Nudge',
    cron: '0 9 * * *', // Daily at 9 AM
    color: 'warning',
  },
  'wrap-up': {
    type: 'wrap-up',
    label: 'Wrap-up',
    cron: '0 17 * * *', // Daily at 5 PM
    color: 'default',
  },
};

export default function CalendarPage() {
  const [currentDate] = useState(new Date());

  // Generate calendar grid
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Get duties for a specific day
  const getDutiesForDay = (date: Date | null) => {
    if (!date) return [];
    const dayOfWeek = date.getDay();
    const dutiesForDay: ScheduledDuty[] = [];

    // Daily duties
    dutiesForDay.push(DUTIES['stale-nudge']);
    dutiesForDay.push(DUTIES['wrap-up']);

    // Monday only
    if (dayOfWeek === 1) {
      dutiesForDay.push(DUTIES['weekly-summary']);
    }

    return dutiesForDay;
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#ffffff]">Scheduled Duties</h2>
            <p className="text-sm text-[#666666] mt-1">
              Calendar view of automated duty schedules
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-[#666666] hover:text-[#ffffff] transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-[#ffffff] min-w-[200px] text-center">
              {monthName}
            </span>
            <button className="p-2 text-[#666666] hover:text-[#ffffff] transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <Card variant="bordered" padding="sm">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Badge variant="info" size="sm">Weekly</Badge>
              <span className="text-[#666666]">Mondays at 7:00 AM</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="warning" size="sm">Nudge</Badge>
              <span className="text-[#666666]">Daily at 9:00 AM</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" size="sm">Wrap-up</Badge>
              <span className="text-[#666666]">Daily at 5:00 PM</span>
            </div>
          </div>
        </Card>

        {/* Calendar Grid */}
        <Card variant="bordered" padding="none">
          <div className="grid grid-cols-7 border-b border-[#222222]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="p-3 text-center text-xs font-medium text-[#666666] border-r border-[#222222] last:border-0"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const duties = getDutiesForDay(day);
              const isToday = day && day.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`
                    min-h-[100px] p-2 border-r border-b border-[#222222]
                    ${!day ? 'bg-[#050505]' : ''}
                    ${isToday ? 'bg-[#111111]' : ''}
                  `}
                >
                  {day && (
                    <div className="space-y-1">
                      <div className={`text-xs ${isToday ? 'text-[#ffffff] font-semibold' : 'text-[#666666]'}`}>
                        {day.getDate()}
                      </div>
                      <div className="flex flex-col gap-1">
                        {duties.map((duty) => (
                          <Badge key={duty.type} variant={duty.color} size="sm">
                            {duty.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Schedule List */}
        <Card variant="bordered" padding="md">
          <h3 className="text-sm font-semibold text-[#ffffff] mb-4">Schedule Summary</h3>
          <div className="space-y-3">
            {Object.values(DUTIES).map((duty) => (
              <div key={duty.type} className="flex items-center justify-between py-2 border-b border-[#222222] last:border-0">
                <div className="flex items-center gap-3">
                  <Badge variant={duty.color} size="sm">{duty.label}</Badge>
                  <span className="text-sm text-[#a0a0a0]">{duty.cron}</span>
                </div>
                <span className="text-xs text-[#666666]">
                  {duty.type === 'weekly-summary' ? 'Every Monday' : 'Daily'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
