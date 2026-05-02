import { type InputHTMLAttributes } from 'react';

export function Input({ className = '', ...props }: Readonly<InputHTMLAttributes<HTMLInputElement>>) {
  return (
    <input
      className={`w-full rounded-2xl border border-white/60 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none transition focus:border-teal-300 dark:focus:border-teal-600 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-900 shadow-sm ${className}`}
      {...props}
    />
  );
}
