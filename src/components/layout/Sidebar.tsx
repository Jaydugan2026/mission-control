'use client';

import { Home, BarChart3, Calendar, Settings, Bot, DollarSign } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { href: '/',          label: 'Dashboard', icon: Home },
  { href: '/pipeline',  label: 'Pipeline',  icon: BarChart3 },
  { href: '/finance',   label: 'Finance',   icon: DollarSign },
  { href: '/peter',     label: 'Peter',     icon: Bot },
  { href: '/calendar',  label: 'Calendar',  icon: Calendar },
  { href: '/settings',  label: 'Settings',  icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r border-[#1e2d4a] bg-[#0a0f1e] flex flex-col py-4 shrink-0">
      {/* Logo */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#3b82f6] flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">MC</span>
          </div>
          <div>
            <div className="text-xs font-semibold text-[#f1f5f9] leading-tight">Mission Control</div>
            <div className="text-[10px] text-[#475569] leading-tight">Fortitude Roofing</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg
                text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/25'
                  : 'text-[#94a3b8] hover:bg-[#0d1424] hover:text-[#f1f5f9] border border-transparent'
                }
              `}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
