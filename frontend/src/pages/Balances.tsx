import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { BalanceSummary, Transaction } from '../lib/types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/ui/Toast';
import { motion } from 'framer-motion';
import { DollarSign, ArrowRight, Wallet, Loader2, CheckCircle2 } from 'lucide-react';

function BalancesPage() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [summary, setSummary] = useState<BalanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [settling, setSettling] = useState<string | null>(null);

  const fetchBalances = async () => {
    setError('');
    try {
      const response = await api.get<BalanceSummary>('/balances');
      setSummary(response.data);
    } catch (err: any) {
      setError('Failed to load balances. Please try again.');
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
      addToast({
        type: 'success',
        title: 'Settled!',
        description: `$${Number(tx.amount).toFixed(2)} paid successfully.`
      });
      await fetchBalances();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Settlement failed',
        description: err.response?.data?.message || err.message
      });
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
      addToast({
        type: 'success',
        title: 'All debts settled!',
        description: 'All outstanding balances have been cleared.'
      });
      await fetchBalances();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Settlement failed',
        description: err.response?.data?.message || err.message
      });
    } finally {
      setSettling(null);
    }
  };

  const getInitials = (name: string) => name.charAt(0).toUpperCase();

  const myTotalDebt = summary?.suggestedSettlements
    .filter(s => s.fromUserId === currentUser?.id)
    .reduce((sum, s) => sum + s.amount, 0) ?? 0;

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
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Balances</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-800 dark:text-slate-100">Who owes what.</h2>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Track and settle shared expenses</p>
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
      
      {/* Total Debt Banner */}
      {myTotalDebt > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between rounded-[32px] bg-gradient-to-br from-teal-500 to-emerald-600 dark:from-teal-700 dark:to-emerald-800 p-8 text-white shadow-xl shadow-teal-100/50 dark:shadow-teal-900/50"
        >
          <div>
            <p className="text-sm uppercase tracking-[0.3em] opacity-80">Your Total Debt</p>
            <h2 className="mt-2 text-4xl font-bold">${myTotalDebt.toFixed(2)}</h2>
            <p className="mt-1 text-sm text-white/70">{summary?.suggestedSettlements.filter(s => s.fromUserId === currentUser?.id).length} pending settlement(s)</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={handleSettleAll} 
              disabled={settling === 'all'}
              className="bg-white/90 text-teal-700 hover:bg-white px-8 py-6 text-lg font-bold rounded-2xl shadow-lg transition-all border-0"
            >
              {settling === 'all' ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Settling...</> : <><CheckCircle2 className="w-5 h-5 mr-2" /> Settle All</>}
            </Button>
          </motion.div>
        </motion.div>
      )}

      {myTotalDebt === 0 && summary && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between rounded-[32px] bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 p-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-300">All settled up!</h2>
              <p className="text-green-600 dark:text-green-400">No outstanding debts. You're all clear.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Suggested Settlements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card title="Optimized Settlements">
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Minimized transactions for easier debt clearance.</p>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, idx) => (
                <motion.div
                  key={`suggested-skeleton-${idx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="h-20 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {summary?.suggestedSettlements.map((suggested, index) => {
                const settleId = `${suggested.fromUserId}-${suggested.toUserId}-${suggested.amount}`;
                return (
                  <motion.div
                    key={`suggested-${settleId}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center justify-between rounded-3xl border border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 p-5 transition-all hover:border-teal-200 hover:shadow-lg hover:shadow-teal-100/50 dark:hover:border-slate-600 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 font-bold">
                        {getInitials(suggested.fromUserName)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {suggested.fromUserName === currentUser?.username ? 'You' : suggested.fromUserName}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 font-bold">
                        {getInitials(suggested.toUserName)}
                      </div>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {suggested.toUserName === currentUser?.username ? 'You' : suggested.toUserName}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        ${suggested.amount.toFixed(2)}
                      </span>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          size="sm"
                          onClick={() => handleSettle(suggested)}
                          disabled={settling === settleId}
                          className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold shadow-md hover:shadow-lg transition-all rounded-xl border-0"
                        >
                          {settling === settleId ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Settling...</> : 'Settle'}
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
              {(!summary?.suggestedSettlements || summary.suggestedSettlements.length === 0) && (
                <div className="py-8 text-center text-slate-500 dark:text-slate-400">
                  <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">All settled up!</p>
                  <p className="text-sm">No outstanding debts.</p>
                </div>
              )}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Balances Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card title="Outstanding balances">
            <div className="space-y-3">
              {summary?.balances.map((balance, index) => (
                <motion.div
                  key={`balance-${balance.fromUserId}-${balance.toUserId}-${balance.amount}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="rounded-3xl border border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center font-bold text-rose-500 dark:text-rose-400">
                        {balance.fromUserName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {balance.fromUserName === currentUser?.username ? 'You' : balance.fromUserName} owes
                        </p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {balance.toUserName === currentUser?.username ? 'You' : balance.toUserName}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/50 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 px-5 py-3 text-lg font-bold text-slate-800 dark:text-slate-200 shadow-sm">
                      ${balance.amount.toFixed(2)}
                    </div>
                  </div>
                </motion.div>
              ))}
              {(!summary?.balances || summary.balances.length === 0) && (
                <div className="py-6 text-center text-slate-500 dark:text-slate-400">
                  No balances to display
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card title="Balance Details">
            <div className="overflow-hidden rounded-3xl border border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm">
              <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 border-b border-white/40 dark:border-slate-700/80 px-6 py-4 text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                <span>Summary</span>
                <span>Amount</span>
                <span>Status</span>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-700/80">
                {summary?.balances.map((balance, index) => (
                  <motion.div
                    key={`balance-row-${balance.fromUserId}-${balance.toUserId}-${balance.amount}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="grid grid-cols-[2fr_1fr_1fr] gap-4 px-6 py-5 text-sm text-slate-700 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <span className="font-medium flex items-center gap-2">
                      {balance.fromUserName} <ArrowRight className="w-3 h-3 text-slate-400" /> {balance.toUserName}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">${balance.amount.toFixed(2)}</span>
                    <span className="inline-flex items-center gap-1 text-amber-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                      Pending
                    </span>
                  </motion.div>
                ))}
                {(!summary?.balances || summary.balances.length === 0) && (
                  <div className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    No balance details
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default BalancesPage;
