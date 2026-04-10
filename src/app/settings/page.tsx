'use client';

import { useState } from 'react';
import Layout from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function SettingsPage() {
  const [config, setConfig] = useState({
    email: 'JD@fortituderoofing.co',
    schedules: {
      'wrap-up': '0 17 * * *',
      'stale-nudge': '0 9 * * *',
      'weekly-summary': '0 7 * * 1',
    },
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In production, this would call the API
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-[#ffffff]">Settings</h2>
          <p className="text-sm text-[#666666] mt-1">
            Configure Peter's duties and preferences
          </p>
        </div>

        {/* Email Settings */}
        <Card variant="bordered" padding="lg">
          <h3 className="text-sm font-semibold text-[#ffffff] mb-4">Email Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[#666666] mb-2">Recipient Email</label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#222222] rounded-lg px-3 py-2 text-sm text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success">Verified</Badge>
              <span className="text-xs text-[#666666]">Email address is active</span>
            </div>
          </div>
        </Card>

        {/* Schedule Settings */}
        <Card variant="bordered" padding="lg">
          <h3 className="text-sm font-semibold text-[#ffffff] mb-4">Duty Schedules</h3>
          <div className="space-y-4">
            {Object.entries(config.schedules).map(([duty, cron]) => (
              <div key={duty}>
                <label className="block text-xs text-[#666666] mb-2 capitalize">
                  {duty.replace('-', ' ')} Schedule
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={cron}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        schedules: { ...config.schedules, [duty]: e.target.value },
                      })
                    }
                    className="flex-1 bg-[#0a0a0a] border border-[#222222] rounded-lg px-3 py-2 text-sm text-[#ffffff] font-mono focus:outline-none focus:border-[#ffffff]"
                  />
                  <span className="text-xs text-[#666666] whitespace-nowrap">
                    {duty === 'wrap-up' && 'Daily at 5:00 PM'}
                    {duty === 'stale-nudge' && 'Daily at 9:00 AM'}
                    {duty === 'weekly-summary' && 'Mondays at 7:00 AM'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* API Keys */}
        <Card variant="bordered" padding="lg">
          <h3 className="text-sm font-semibold text-[#ffffff] mb-4">API Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[#666666] mb-2">JOBnimbus API Token</label>
              <div className="flex items-center gap-3">
                <input
                  type="password"
                  value="mnq•••••••••••vyx"
                  readOnly
                  className="flex-1 bg-[#0a0a0a] border border-[#222222] rounded-lg px-3 py-2 text-sm text-[#ffffff] font-mono"
                />
                <Badge variant="success">Connected</Badge>
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#666666] mb-2">Google Calendar</label>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#a0a0a0]">Primary calendar connected</span>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card variant="bordered" padding="lg">
          <h3 className="text-sm font-semibold text-[#ffffff] mb-4">Notifications</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-[#a0a0a0]">Email notifications for duty completion</span>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-[#a0a0a0]">Alert on errors</span>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-[#a0a0a0]">Daily summary digest</span>
              <input type="checkbox" className="w-4 h-4" />
            </label>
          </div>
        </Card>

        {/* Save button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} variant={saved ? 'primary' : 'primary'}>
            {saved ? '✓ Saved!' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
