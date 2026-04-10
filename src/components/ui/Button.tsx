'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center
      font-medium rounded-lg
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#000000]
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variants = {
      primary: `
        bg-[#ffffff] text-[#000000]
        border border-[#ffffff]
        hover:bg-[#e0e0e0] hover:border-[#e0e0e0]
        focus:ring-[#ffffff]
      `,
      secondary: `
        bg-[#111111] text-[#ffffff]
        border border-[#222222]
        hover:bg-[#1a1a1a] hover:border-[#333333]
        focus:ring-[#333333]
      `,
      ghost: `
        bg-transparent text-[#a0a0a0]
        border border-transparent
        hover:bg-[#111111] hover:text-[#ffffff]
        focus:ring-[#333333]
      `,
      danger: `
        bg-[#ef4444] text-[#ffffff]
        border border-[#ef4444]
        hover:bg-[#dc2626]
        focus:ring-[#ef4444]
      `,
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
