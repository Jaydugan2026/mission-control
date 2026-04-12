'use client';

import Image from 'next/image';
import { Home, BarChart3, FileBarChart, Settings, Bot, DollarSign } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { href: '/',          label: 'Dashboard', icon: Home },
  { href: '/pipeline',  label: 'Pipeline',  icon: BarChart3 },
  { href: '/finance',   label: 'Finance',   icon: DollarSign },
  { href: '/peter',     label: 'Peter',     icon: Bot },
  { href: '/sales-report', label: 'Sales Report', icon: FileBarChart },
  { href: '/settings',  label: 'Settings',  icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r border-[#ffffff20] bg-[#000000] flex flex-col py-4 shrink-0">
      {/* Fortitude Logo */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 shrink-0">
            <Image
              src="/fortitude-logo.png"
              alt="Fortitude Roofing"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#ffffff] leading-tight">Mission Control</div>
            <div className="text-[10px] text-[#666666] leading-tight">Fortitude Roofing</div>
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
                  ? 'bg-[#ffffff]/10 text-[#ffffff] border border-[#ffffff]/30'
                  : 'text-[#999999] hover:bg-[#0a0a0a] hover:text-[#ffffff] border border-transparent'
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
