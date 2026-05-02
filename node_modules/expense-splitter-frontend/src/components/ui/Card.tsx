import { type ReactNode } from 'react';

interface CardProps {
  title?: string;
  className?: string;
  children: ReactNode;
}

export function Card({ title, className = '', children }: Readonly<CardProps>) {
  return (
    <div className={`rounded-[28px] glass-panel p-6 ${className}`}>
      {title ? <div className="mb-4 text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{title}</div> : null}
      {children}
    </div>
  );
}
