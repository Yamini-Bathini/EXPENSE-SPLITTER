import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import type { Transaction, User } from '../lib/types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../lib/auth';

function TransactionsPage() {
  const { user: currentUser } = useAuth();
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
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card title="Log a settlement">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 block text-sm text-slate-500 dark:text-slate-400">From</div>
                <div className="w-full rounded-2xl border border-white/50 dark:border-slate-700/80 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm px-4 py-3 text-sm text-slate-800 dark:text-slate-200 font-medium">
                  {currentUser?.username} (You)
                </div>
              </div>
              <div>
                <label htmlFor="to-user" className="mb-2 block text-sm text-slate-500 dark:text-slate-400">To</label>
                <select id="to-user" className="w-full rounded-2xl border border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm px-4 py-3 text-sm text-slate-800 dark:text-slate-200" value={toUserId ?? ''} onChange={(event) => setToUserId(Number(event.target.value))}>
                  <option value="">Select recipient</option>
                  {users.filter(u => u.id !== currentUser?.id).map((user) => (
                    <option key={user.id} value={user.id}>{user.username}</option>
                  ))}
                </select>
              </div>
            </div>
            <Input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount" type="number" />
            <Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Note" />
            {error && <div className="rounded-2xl bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
            <Button onClick={settle} disabled={creating}>{creating ? 'Logging...' : 'Log transaction'}</Button>
          </div>
        </Card>
        <Card title="Filters">
          <div className="flex flex-col gap-3">
            {(['ALL', 'SETTLED', 'PENDING'] as const).map((status) => (
              <button key={status} type="button" onClick={() => setFilter(status)} className={`rounded-2xl border px-4 py-3 text-left text-sm transition-all ${filter === status ? 'border-teal-300 bg-teal-300 dark:bg-teal-600 text-slate-800 dark:text-slate-100 shadow-md shadow-teal-100 dark:shadow-teal-900/50' : 'border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-white/70 dark:hover:border-slate-600 hover:bg-white/70 dark:hover:bg-slate-700'}`}>
                {status}
              </button>
            ))}
          </div>
        </Card>
      </div>
      <Card title="Transaction history">
        <div className="overflow-hidden rounded-3xl border border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm">
          <div className="grid grid-cols-[1.5fr_1.2fr_1.2fr_1fr] gap-4 border-b border-white/40 dark:border-slate-700/80 px-6 py-4 text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
            <span>Note</span>
            <span>From</span>
            <span>To</span>
            <span>Amount</span>
          </div>
          <div className="divide-y divide-white/40 dark:divide-slate-700/80">
            {filtered.map((tx) => (
              <div key={tx.id} className="grid grid-cols-[1.5fr_1.2fr_1.2fr_1fr] gap-4 px-6 py-5 text-sm text-slate-700 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
                <span className="font-medium">{tx.note || 'Settlement'}</span>
                <span>{tx.fromUserName === currentUser?.username ? 'You' : tx.fromUserName}</span>
                <span>{tx.toUserName === currentUser?.username ? 'You' : tx.toUserName}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">${tx.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default TransactionsPage;
