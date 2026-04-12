'use client';

import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'glow';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', padding = 'md', children, ...props }, ref) => {
    const baseStyles = `
      rounded-xl
      transition-all duration-200
    `;

    const variants = {
      default: `
        bg-[#0d1424]
      `,
      bordered: `
        bg-[#0d1424]
        border border-[#1e2d4a]
        hover:border-[#2563eb]
        hover:shadow-[0_0_0_1px_rgba(59,130,246,0.2),0_4px_16px_rgba(59,130,246,0.08)]
      `,
      glow: `
        bg-[#0d1424]
        border-l-[3px] border-l-[#3b82f6] border border-[#1e2d4a]
        shadow-[0_2px_8px_rgba(0,0,0,0.4)]
        hover:border-[#2563eb]
        hover:shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_4px_16px_rgba(59,130,246,0.15)]
        hover:-translate-y-px
      `,
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
