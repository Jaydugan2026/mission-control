'use client';

interface StatusDotProps {
  status?: 'idle' | 'running' | 'success' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusColors = {
  idle: 'bg-[#444444]',
  running: 'bg-[#ffffff] pulse-glow',
  success: 'bg-[#10b981]',
  error: 'bg-[#ef4444]',
};

const sizes = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
};

export function StatusDot({ status = 'idle', size = 'md', className = '' }: StatusDotProps) {
  return (
    <div
      className={`${sizes[size]} ${statusColors[status]} rounded-full ${className}`}
    />
  );
}
