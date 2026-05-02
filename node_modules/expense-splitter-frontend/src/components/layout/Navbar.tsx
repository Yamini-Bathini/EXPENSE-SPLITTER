import { Bell, LogOut, SunMoon, Moon } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export function Navbar() {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate('/login', { replace: true });
  };

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!('theme' in localStorage) && globalThis.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <header className="mb-6 flex flex-col gap-4 glass-panel px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Expense Splitter</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Welcome back, {auth.user?.username}.</h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={toggleTheme} className="rounded-2xl border border-white/60 dark:border-slate-700/80 bg-white/50 dark:bg-slate-800/50 px-4 py-2 text-slate-700 dark:text-slate-200 transition-all hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm">
          {isDark ? <Moon size={16} className="mr-2 inline-block text-indigo-400" /> : <SunMoon size={16} className="mr-2 inline-block text-teal-600" />} 
          Theme
        </button>
        <button className="rounded-2xl border border-white/60 dark:border-slate-700/80 bg-white/50 dark:bg-slate-800/50 px-4 py-2 text-slate-700 dark:text-slate-200 transition-all hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm">
          <Bell size={16} className="mr-2 inline-block text-indigo-500 dark:text-indigo-400" /> Notifications
        </button>
        <button onClick={handleLogout} className="rounded-2xl pastel-button px-4 py-2 transition-all">
          <LogOut size={16} className="mr-2 inline-block text-rose-500" /> Logout
        </button>
      </div>
    </header>
  );
}
