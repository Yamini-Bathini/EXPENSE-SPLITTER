import { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { api } from '../lib/api';
import type { Transaction, Group, Expense } from '../lib/types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    void Promise.all([api.get<Transaction[]>('/transactions'), api.get<Group[]>('/groups'), api.get<Expense[]>('/expenses')])
      .then(([txRes, groupRes, expenseRes]) => {
        setTransactions(txRes.data);
        setGroups(groupRes.data);
        setExpenses(expenseRes.data);
        setError('');
      })
      .catch(() => setError('Failed to load reports'));
  }, []);

  const pieData = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((exp) => {
      const cat = exp.category || 'Other';
      map.set(cat, (map.get(cat) ?? 0) + Number(exp.amount));
    });
    return Array.from(map.entries()).map(([category, amount]) => ({ category, amount }));
  }, [expenses]);

  const totals = useMemo(() => ({
    settled: transactions.filter((tx) => tx.status === 'SETTLED').length,
    pending: transactions.filter((tx) => tx.status !== 'SETTLED').length,
    groups: groups.length,
  }), [transactions, groups]);

  return (
    <div className="space-y-6">
      {error && <div className="rounded-3xl bg-red-50 dark:bg-red-900/30 p-4 text-sm text-red-600 dark:text-red-400">{error}</div>}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Total settled</p>
          <p className="mt-3 text-3xl font-semibold text-slate-800 dark:text-slate-100">{totals.settled}</p>
        </Card>
        <Card>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Pending transactions</p>
          <p className="mt-3 text-3xl font-semibold text-rose-400">{totals.pending}</p>
        </Card>
        <Card>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Active groups</p>
          <p className="mt-3 text-3xl font-semibold text-slate-800 dark:text-slate-100">{totals.groups}</p>
        </Card>
      </div>

      <Card title="Spending by category">
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${entry.category}-${entry.amount}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Insights">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-5 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">Group performance</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-3xl font-semibold text-slate-800 dark:text-slate-100">{groups.length}</span>
              <Badge>Live</Badge>
            </div>
          </div>
          <div className="rounded-3xl border border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-5 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">Transaction volume</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-3xl font-semibold text-slate-800 dark:text-slate-100">${transactions.reduce((sum, tx) => sum + Number(tx.amount), 0).toFixed(2)}</span>
              <Badge>All time</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ReportsPage;
