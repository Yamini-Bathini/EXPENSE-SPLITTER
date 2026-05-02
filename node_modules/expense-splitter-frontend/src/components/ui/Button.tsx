import { Slot } from '@radix-ui/react-slot';
import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'destructive' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  asChild, 
  className = '', 
  variant = 'primary', 
  size = 'md',
  ...props 
}: Readonly<ButtonProps>) {
  const Comp = asChild ? Slot : 'button';
  
  const variants = {
    primary: 'bg-gradient-to-r from-teal-200 to-sky-200 text-slate-800 hover:from-teal-300 hover:to-sky-300 shadow-teal-100/50',
    secondary: 'bg-gradient-to-r from-rose-200 to-pink-200 text-slate-800 hover:from-rose-300 hover:to-pink-300 shadow-rose-100/50',
    outline: 'border-2 border-white/60 bg-white/40 text-slate-700 hover:bg-white/70 shadow-sm',
    destructive: 'bg-rose-300 text-rose-900 hover:bg-rose-400 shadow-rose-200/50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-xl',
    md: 'px-4 py-3 text-sm rounded-2xl',
    lg: 'px-6 py-4 text-base rounded-[20px]',
  };

  return (
    <Comp
      className={`inline-flex items-center justify-center font-semibold shadow-soft transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
