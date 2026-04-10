'use client';

import { useState, useEffect } from 'react';
import { Bell, Settings, User } from 'lucide-react';

export function Header() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 border-b border-[#222222] bg-[#000000] flex items-center justify-between px-4 sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffffff] via-[#888888] to-[#222222] flex items-center justify-center">
          <span className="text-[#000000] font-bold text-xs">🎯</span>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-[#ffffff]">Mission Control</h1>
          <p className="text-[10px] text-[#666666]">Peter — Executive Assistant</p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Clock */}
        <div className="text-xs text-[#a0a0a0] font-mono">{currentTime}</div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 text-[#666666] hover:text-[#ffffff] transition-colors">
            <Bell className="w-4 h-4" />
          </button>
          <button className="p-2 text-[#666666] hover:text-[#ffffff] transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-2 text-[#666666] hover:text-[#ffffff] transition-colors">
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
