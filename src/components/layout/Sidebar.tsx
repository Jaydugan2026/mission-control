'use client';

import { Home, Clipboard, BarChart3, Calendar, Settings, MonitorPlay } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/tasks', label: 'Tasks', icon: Clipboard },
  { href: '/pipeline', label: 'Pipeline', icon: BarChart3 },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/office', label: 'Office', icon: MonitorPlay },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-16 border-r border-[#222222] bg-[#000000] flex flex-col items-center py-4 gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center
              transition-all duration-200
              ${
                isActive
                  ? 'bg-[#ffffff] text-[#000000]'
                  : 'text-[#666666] hover:bg-[#111111] hover:text-[#ffffff]'
              }
            `}
            title={item.label}
          >
            <Icon className="w-5 h-5" />
          </Link>
        );
      })}
    </aside>
  );
}
