'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

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
    <header className="h-16 border-b border-[#1a2440] bg-[#0a0f1a]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {/* Fortitude Roofing Logo */}
        <div className="relative w-10 h-10 shrink-0">
          <Image
            src="/fortitude-logo.png"
            alt="Fortitude Roofing"
            fill
            className="object-contain"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#3b82f6] font-bold text-lg">⚡</span>
          <div>
            <span className="text-[#f0f4fc] font-semibold text-sm tracking-wide block">MISSION CONTROL</span>
            <span className="text-[#8895b0] text-xs block">Fortitude Roofing</span>
          </div>
        </div>
      </div>
      <div className="font-mono text-xs text-[#8895b0]">{currentTime}</div>
    </header>
  );
}
