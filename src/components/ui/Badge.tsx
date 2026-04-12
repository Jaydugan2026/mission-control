'use client';

import { HTMLAttributes, forwardRef } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center
      font-medium rounded-full
      transition-all duration-200
    `;

    const variants = {
      default: `
        bg-[#111d35] text-[#94a3b8] border border-[#1e2d4a]
      `,
      success: `
        bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/25
      `,
      error: `
        bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/25
      `,
      warning: `
        bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/25
      `,
      info: `
        bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/25
      `,
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-xs',
    };

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
