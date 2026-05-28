import { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { api } from '../lib/api';
import type { Transaction, Group, Expense } from '../lib/types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, DollarSign, Activity, PieChart as PieChartIcon } from 'lucide-react';

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
    expenses: expenses.length,
    totalSpent: expenses.reduce((sum, exp) => sum + Number(exp.amount), 0),
  }), [transactions, groups, expenses]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Reports</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-800 dark:text-slate-100">Analyze your spending.</h2>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Gain insights into your expense patterns</p>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-red-50 dark:bg-red-900/30 p-4 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
        >
          {error}
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="xl:col-span-2"
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Spent</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                  ${totals.totalSpent.toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 text-sm text-green-600 dark:text-green-400">
              <Activity className="h-4 w-4 mr-1 inline-block" />
              {totals.expenses} expenses across {totals.groups} groups
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Settled
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-800 dark:text-slate-100">{totals.settled}</p>
            <Badge variant="default" className="mt-2">Completed</Badge>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Pending
            </p>
            <p className="mt-3 text-3xl font-semibold text-rose-400">{totals.pending}</p>
            <Badge variant="destructive" className="mt-2">Needs action</Badge>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Groups
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-800 dark:text-slate-100">{totals.groups}</p>
            <Badge variant="default" className="mt-2">Active</Badge>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Spending by Category */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card title="Spending by category" className="p-6">
            <div className="h-[360px]">
              {pieData.length > 0 ? (
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
                      label={({ category, percent }: { category: string; percent: number }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${entry.category}-${entry.amount}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <PieChartIcon className="w-12 h-12 mb-2 opacity-50" />
                  <p>No expense data available</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card title="Insights" className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="rounded-3xl border border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Group performance</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-semibold text-slate-800 dark:text-slate-100">{totals.groups}</span>
                  <Badge variant="default">Active</Badge>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="rounded-3xl border border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Transaction volume</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-semibold text-slate-800 dark:text-slate-100">
                    ${transactions.reduce((sum, tx) => sum + Number(tx.amount), 0).toFixed(2)}
                  </span>
                  <Badge variant="default">All time</Badge>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="rounded-3xl border border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-all sm:col-span-2"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Settlement Rate</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-semibold text-slate-800 dark:text-slate-100">
                    {totals.settled + totals.pending > 0
                      ? `${Math.round((totals.settled / (totals.settled + totals.pending)) * 100)}%`
                      : '0%'}
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${totals.settled + totals.pending > 0 ? (totals.settled / (totals.settled + totals.pending)) * 100 : 0}%` }}
                      transition={{ duration: 1, delay: 1 }}
                      className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-500"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default ReportsPage;
