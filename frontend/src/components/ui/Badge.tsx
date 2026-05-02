import { type ReactNode } from 'react';

interface BadgeProps {
  readonly children: ReactNode;
  readonly variant?: 'default' | 'destructive';
  readonly className?: string;
}

const badgeVariants: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-white/60 dark:bg-slate-800/60 border border-white/50 dark:border-slate-700/80 text-slate-600 dark:text-slate-300',
  destructive: 'bg-rose-100 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`rounded-full ${badgeVariants[variant]} backdrop-blur-sm px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] shadow-sm ${className}`}>
      {children}
    </span>
  );
}
