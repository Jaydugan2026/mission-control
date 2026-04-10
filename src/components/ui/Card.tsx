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
        bg-[#0a0a0a]
      `,
      bordered: `
        bg-[#0a0a0a]
        border border-[#222222]
        hover:border-[#333333]
      `,
      glow: `
        bg-[#0a0a0a]
        border border-[#222222]
        hover:border-[#ffffff]
        hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]
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
