import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { BalanceSummary, Transaction } from '../lib/types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../lib/auth';

function BalancesPage() {
  const { user: currentUser } = useAuth();
  const [summary, setSummary] = useState<BalanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [settling, setSettling] = useState<string | null>(null);

  const fetchBalances = async () => {
    try {
      const response = await api.get<BalanceSummary>('/balances');
      setSummary(response.data);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchBalances();
  }, []);

  const handleSettle = async (tx: Transaction) => {
    const settleId = `${tx.fromUserId}-${tx.toUserId}-${tx.amount}`;
    setSettling(settleId);
    try {
      await api.post('/transactions', {
        fromUserId: tx.fromUserId,
        toUserId: tx.toUserId,
        amount: tx.amount,
        note: `Settlement: ${tx.fromUserName} to ${tx.toUserName}`,
      });
      // Refresh balances after settlement
      await fetchBalances();
    } finally {
      setSettling(null);
    }
  };

  const handleSettleAll = async () => {
    if (!summary || !currentUser) return;
    const myDebts = summary.suggestedSettlements.filter(s => s.fromUserId === currentUser.id);
    if (myDebts.length === 0) return;

    setSettling('all');
    try {
      for (const debt of myDebts) {
        await api.post('/transactions', {
          fromUserId: debt.fromUserId,
          toUserId: debt.toUserId,
          amount: debt.amount,
          note: `Auto-Settlement: ${debt.fromUserName} to ${debt.toUserName}`,
        });
      }
      await fetchBalances();
    } finally {
      setSettling(null);
    }
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const myTotalDebt = summary?.suggestedSettlements
    .filter(s => s.fromUserId === currentUser?.id)
    .reduce((sum, s) => sum + s.amount, 0) ?? 0;

  return (
    <div className="space-y-6">
      {error && <div className="rounded-3xl bg-red-50 p-4 text-sm text-red-600">{error}</div>}
      
      {myTotalDebt > 0 && (
        <div className="flex items-center justify-between rounded-[32px] bg-sky-600 dark:bg-teal-700 p-8 text-white shadow-xl shadow-sky-100 dark:shadow-teal-900/50">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] opacity-80">Your Total Debt</p>
            <h2 className="mt-2 text-4xl font-bold">${myTotalDebt.toFixed(2)}</h2>
          </div>
          <Button 
            onClick={handleSettleAll} 
            disabled={settling === 'all'}
            className="bg-white/80 text-teal-600 hover:bg-white px-8 py-6 text-lg font-bold rounded-2xl shadow-sm transition-all border border-white/60"
          >
            {settling === 'all' ? 'Settling...' : 'Settle All My Debts'}
          </Button>
        </div>
      )}

      <Card title="Optimized Settlements">
        <p className="mb-4 text-sm text-slate-500">Minimized transactions for easier debt clearance.</p>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, idx) => (
              <div key={`suggested-skeleton-${idx}`} className="h-20 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {summary?.suggestedSettlements.map((suggested, index) => {
              const settleId = `${suggested.fromUserId}-${suggested.toUserId}-${suggested.amount}`;
              return (
                <div key={`suggested-${settleId}`} className="flex items-center justify-between rounded-3xl border border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 p-5 transition-all hover:border-teal-200 hover:shadow-lg hover:shadow-teal-100/50 dark:hover:border-slate-600 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 font-bold">
                      {getInitials(suggested.fromUserName)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-slate-100">{suggested.fromUserName === currentUser?.username ? 'You' : suggested.fromUserName}</span>
                      <span className="text-slate-400">→</span>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 font-bold">
                      {getInitials(suggested.toUserName)}
                    </div>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{suggested.toUserName === currentUser?.username ? 'You' : suggested.toUserName}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100">${suggested.amount.toFixed(2)}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSettle(suggested)}
                      disabled={settling === settleId}
                    >
                      {settling === settleId ? '...' : 'Settle'}
                    </Button>
                  </div>
                </div>
              );
            })}
            {summary?.suggestedSettlements.length === 0 && (
              <div className="py-8 text-center text-slate-500">All settled up! No outstanding debts.</div>
            )}
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Outstanding balances">
          <div className="space-y-3">
            {summary?.balances.map((balance, index) => (
              <div key={`balance-${balance.fromUserId}-${balance.toUserId}-${balance.amount}`} className="rounded-3xl border border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">{balance.fromUserName === currentUser?.username ? 'You' : balance.fromUserName} owes</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{balance.toUserName === currentUser?.username ? 'You' : balance.toUserName}</p>
                  </div>
                  <div className="rounded-2xl border border-white/50 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 px-4 py-2 text-lg font-bold text-slate-800 dark:text-slate-200 shadow-sm">
                    ${balance.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Balance Details">
          <div className="overflow-hidden rounded-3xl border border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm">
            <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 border-b border-white/40 dark:border-slate-700/80 px-6 py-4 text-sm uppercase tracking-[0.24em] text-slate-500">
              <span>Summary</span>
              <span>Amount</span>
              <span>Status</span>
            </div>
            <div className="divide-y divide-slate-200">
              {summary?.balances.map((balance, index) => (
                <div key={`balance-row-${balance.fromUserId}-${balance.toUserId}-${balance.amount}`} className="grid grid-cols-[2fr_1fr_1fr] gap-4 px-6 py-5 text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">{balance.fromUserName} → {balance.toUserName}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">${balance.amount.toFixed(2)}</span>
                  <span className="text-sky-500">Pending</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default BalancesPage;
