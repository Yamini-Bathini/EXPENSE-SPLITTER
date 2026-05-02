import { Link, NavLink } from 'react-router-dom';
import { Home, Users2, CreditCard, Wallet, ListChecks, BarChart3 } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/groups', label: 'Groups', icon: Users2 },
  { path: '/expenses', label: 'Expenses', icon: CreditCard },
  { path: '/balances', label: 'Balances', icon: Wallet },
  { path: '/transactions', label: 'Transactions', icon: ListChecks },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
];

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/50 dark:border-slate-700/80 bg-white/40 dark:bg-slate-900/60 backdrop-blur-xl px-6 py-8 lg:flex flex-col">
      <Link to="/" className="mb-10 inline-flex items-center gap-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
        <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-100 to-teal-100 text-rose-700 font-bold border border-white shadow-sm">E</div>
        Expense Splitter
      </Link>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive ? 'bg-white dark:bg-slate-800 shadow-sm text-rose-600 dark:text-rose-400 scale-[1.02]' : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="mt-auto rounded-3xl glass-panel p-5 text-sm text-slate-600 dark:text-slate-300">
        <div className="font-semibold text-slate-900 dark:text-slate-100">Premium insights</div>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Monitor shared budgets across groups and settle smarter.</p>
      </div>
    </aside>
  );
}
