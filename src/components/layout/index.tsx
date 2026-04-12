'use client';

import { Header } from './Header';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const navItems = [
  { href: '/',          label: 'Dashboard', icon: 'Home' },
  { href: '/pipeline',  label: 'Pipeline',  icon: 'Pipeline' },
  { href: '/finance',   label: 'Finance',   icon: 'Finance' },
  { href: '/peter',     label: 'Peter',     icon: 'Peter' },
  { href: '/sales-report', label: 'Sales Report', icon: 'Sales' },
  { href: '/settings',  label: 'Settings',  icon: 'Settings' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-white/20 flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
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
              <div className="text-xs font-semibold text-white leading-tight">Mission Control</div>
              <div className="text-[10px] text-white/40 leading-tight">Fortitude Roofing</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="w-4 h-4">{item.icon.charAt(0)}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
