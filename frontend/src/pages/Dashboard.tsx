import { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { api } from '../lib/api';
import type { BalanceSummary, Transaction } from '../lib/types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, CreditCard, DollarSign, Target, Bell, Plus, Activity, PieChart as PieChartIcon } from 'lucide-react';

const categoryColors = {
  'Food & Dining': '#FF6B6B',
  'Transportation': '#4ECDC4',
  'Entertainment': '#45B7D1',
  'Shopping': '#96CEB4',
  'Bills & Utilities': '#FFEAA7',
  'Healthcare': '#DDA0DD',
  'Other': '#A8A8A8'
};

function DashboardPage() {
  const [summary, setSummary] = useState<BalanceSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([
      api.get<BalanceSummary>('/balances'),
      api.get<Transaction[]>('/transactions'),
      api.get('/expenses'),
      api.get('/groups')
    ])
      .then(([balanceRes, transactionsRes, expensesRes, groupsRes]) => {
        setSummary(balanceRes.data);
        setTransactions(transactionsRes.data);
        setExpenses(expensesRes.data);
        setGroups(groupsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    if (!summary) return { youOwe: 0, youAreOwed: 0, netBalance: 0 };
    const youOwe = summary.balances.reduce((sum, item) => sum + Number(item.amount), 0);
    const youAreOwed = summary.suggestedSettlements.reduce((sum, item) => sum + Number(item.amount), 0);
    return { youOwe, youAreOwed, netBalance: youAreOwed - youOwe };
  }, [summary]);

  const chartData = useMemo(() => {
    const monthMap = new Map<string, number>();
    transactions.forEach((tx) => {
      const month = new Date(tx.occurredAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthMap.set(month, (monthMap.get(month) ?? 0) + Number(tx.amount));
    });
    return Array.from(monthMap.entries()).map(([month, amount]) => ({ month, amount }));
  }, [transactions]);

  const categoryBreakdown = useMemo(() => {
    const categoryMap = new Map<string, number>();
    expenses.forEach((expense) => {
      const category = expense.category || 'Other';
      categoryMap.set(category, (categoryMap.get(category) ?? 0) + Number(expense.amount));
    });
    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      color: categoryColors[category as keyof typeof categoryColors] || categoryColors.Other
    }));
  }, [expenses]);

  const recentActivity = useMemo(() => {
    const combined = [
      ...transactions.slice(0, 3).map(tx => ({ ...tx, type: 'transaction' })),
      ...expenses.slice(0, 2).map(exp => ({ ...exp, type: 'expense', occurredAt: exp.createdAt }))
    ].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

    return combined.map(item => ({
      id: item.id,
      type: item.type,
      description: item.note || item.title || 'Transaction',
      amount: Number(item.amount),
      date: new Date(item.occurredAt).toLocaleDateString(),
      groupName: item.group?.name
    }));
  }, [transactions, expenses]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4'].map((item) => (
            <Card key={item} className="animate-pulse">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's your expense overview.</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <Plus size={18} />
            Quick Add Expense
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:shadow-md transition-all"
          >
            <Bell size={18} />
            Notifications
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Net Balance</p>
                <p className={`text-2xl font-bold ${totals.netBalance >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                  ${Math.abs(totals.netBalance).toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {totals.netBalance >= 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 dark:text-green-400">You're owed money</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-red-600 dark:text-red-400">You owe money</span>
                </>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Expenses</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  ${expenses.reduce((sum, exp) => sum + Number(exp.amount), 0).toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Activity className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-red-600 dark:text-red-400">{expenses.length} expenses this month</span>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Active Groups</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {groups.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-blue-600 dark:text-blue-400">Growing community</span>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Transactions</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {transactions.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-purple-500 mr-1" />
              <span className="text-purple-600 dark:text-purple-400">{summary?.balances.length || 0} pending settlements</span>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Monthly Spending Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#3B82F6"
                  fill="url(#colorGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Spending by Category
            </h3>
            {categoryBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="amount"
                    >
                      {categoryBreakdown.map((entry) => (
                        <Cell key={entry.category} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-4">
                  {categoryBreakdown.slice(0, 4).map((category) => (
                    <div key={category.category} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{category.category}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                No expense data available
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    activity.type === 'expense' ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'
                  }`}>
                    {activity.type === 'expense' ? (
                      <CreditCard className="h-5 w-5 text-red-600 dark:text-red-400" />
                    ) : (
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{activity.description}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.date} {activity.groupName && `• ${activity.groupName}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    activity.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                  }`}>
                    {activity.type === 'expense' ? '-' : '+'}${activity.amount.toFixed(2)}
                  </p>
                  <Badge variant={activity.type === 'expense' ? 'destructive' : 'default'} className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              </motion.div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No recent activity to show
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default DashboardPage;
