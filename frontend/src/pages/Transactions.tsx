import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import type { Transaction, User } from '../lib/types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/ui/Toast';
import { motion } from 'framer-motion';
import { ArrowRight, Plus, ListChecks, Loader2 } from 'lucide-react';

function TransactionsPage() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [toUserId, setToUserId] = useState<number | undefined>(undefined);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'SETTLED' | 'PENDING'>('ALL');
  const [error, setError] = useState<string>('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    void Promise.all([api.get<Transaction[]>('/transactions'), api.get<User[]>('/users')])
      .then(([transactionsRes, usersRes]) => {
        setTransactions(transactionsRes.data);
        setUsers(usersRes.data);
        setError('');
      })
      .catch(() => setError('Failed to load transactions and users'));
  }, []);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => filter === 'ALL' || tx.status === filter);
  }, [filter, transactions]);

  const settle = async () => {
    if (!currentUser || !toUserId || !amount) {
      setError('Please fill all fields');
      return;
    }
    setCreating(true);
    setError('');
    try {
      const response = await api.post<Transaction>('/transactions', {
        fromUserId: currentUser.id,
        toUserId,
        amount: Number(amount),
        note,
      });
      setTransactions((prev) => [response.data, ...prev]);
      addToast({
        type: 'success',
        title: 'Transaction logged!',
        description: `$${Number(amount).toFixed(2)} recorded successfully.`
      });
      setAmount('');
      setNote('');
      setToUserId(undefined);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to log transaction');
    } finally {
      setCreating(false);
    }
  };

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
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Transactions</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-800 dark:text-slate-100">Record of payments.</h2>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Log and track all your settlements</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Log Settlement */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card title="Log a settlement">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">From</div>
                  <div className="w-full rounded-2xl border border-white/50 dark:border-slate-700/80 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm px-4 py-3 text-sm text-slate-800 dark:text-slate-200 font-medium flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-xs font-bold text-teal-600 dark:text-teal-400">
                      {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    {currentUser?.username} (You)
                  </div>
                </div>
                <div>
                  <label htmlFor="to-user" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">To</label>
                  <select
                    id="to-user"
                    className="w-full rounded-2xl border border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm px-4 py-3 text-sm text-slate-800 dark:text-slate-200 focus:border-teal-300 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                    value={toUserId ?? ''}
                    onChange={(event) => setToUserId(Number(event.target.value))}
                  >
                    <option value="">Select recipient</option>
                    {users.filter(u => u.id !== currentUser?.id).map((user) => (
                      <option key={user.id} value={user.id}>{user.username}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Amount"
                type="number"
                step="0.01"
              />
              <Input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Note (e.g., Dinner payment)"
              />
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                >
                  {error}
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button onClick={settle} disabled={creating} className="w-full">
                  {creating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Logging...</> : <><Plus className="w-4 h-4 mr-2" /> Log transaction</>}
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card title="Filters">
            <div className="flex flex-col gap-3">
              {(['ALL', 'SETTLED', 'PENDING'] as const).map((status) => (
                <motion.button
                  key={status}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilter(status)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all flex items-center gap-3 ${
                    filter === status
                      ? 'border-teal-300 bg-teal-300 dark:bg-teal-600 text-slate-800 dark:text-slate-100 shadow-md shadow-teal-100 dark:shadow-teal-900/50'
                      : 'border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-white/70 dark:hover:border-slate-600 hover:bg-white/70 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'ALL' ? 'bg-blue-500' :
                    status === 'SETTLED' ? 'bg-green-500' : 'bg-amber-500'
                  }`} />
                  {status}
                </motion.button>
              ))}
            </div>
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-600 dark:text-slate-400">
              <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Summary</p>
              <p>Total: {transactions.length} transactions</p>
              <p>Showing: {filtered.length} of {transactions.length}</p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card title="Transaction history">
          <div className="overflow-hidden rounded-3xl border border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm">
            <div className="grid grid-cols-[1.5fr_1.2fr_1.2fr_1fr] gap-4 border-b border-white/40 dark:border-slate-700/80 px-6 py-4 text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              <span>Note</span>
              <span>From</span>
              <span>To</span>
              <span className="text-right">Amount</span>
            </div>
            <div className="divide-y divide-white/40 dark:divide-slate-700/80">
              {filtered.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="grid grid-cols-[1.5fr_1.2fr_1.2fr_1fr] gap-4 px-6 py-5 text-sm text-slate-700 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors items-center"
                >
                  <span className="font-medium truncate">{tx.note || 'Settlement'}</span>
                  <span className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-xs font-bold text-rose-500 dark:text-rose-400">
                      {tx.fromUserName.charAt(0).toUpperCase()}
                    </div>
                    {tx.fromUserName === currentUser?.username ? 'You' : tx.fromUserName}
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-xs font-bold text-teal-500 dark:text-teal-400">
                      {tx.toUserName.charAt(0).toUpperCase()}
                    </div>
                    {tx.toUserName === currentUser?.username ? 'You' : tx.toUserName}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100 text-right">
                    ${tx.amount.toFixed(2)}
                    <span className={`ml-2 inline-block w-1.5 h-1.5 rounded-full ${
                      tx.status === 'SETTLED' ? 'bg-green-500' : 'bg-amber-500'
                    }`} />
                  </span>
                </motion.div>
              ))}
              {filtered.length === 0 && (
                <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                  <ListChecks className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No transactions found</p>
                  <p className="text-sm">Log your first settlement to get started</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default TransactionsPage;
