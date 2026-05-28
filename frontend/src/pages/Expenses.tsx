import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import type { Expense, Group, User } from '../lib/types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { CategorySelector, CategoryBadge } from '../components/ui/CategorySelector';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../lib/auth';
import { motion } from 'framer-motion';
import { Plus, Receipt, Users, DollarSign } from 'lucide-react';

function ExpensesPage() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [paidById, setPaidById] = useState<number | undefined>(undefined);
  const [groupId, setGroupId] = useState<number | undefined>(undefined);
  const [splitType, setSplitType] = useState<'EQUAL' | 'CUSTOM' | 'PERCENTAGE'>('EQUAL');
  const [splits, setSplits] = useState<Record<number, string>>({});
  const [error, setError] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const [settling, setSettling] = useState<number | null>(null);

  const fetchData = async () => {
    setError('');
    try {
      const [groupRes, userRes, expenseRes] = await Promise.all([
        api.get<Group[]>('/groups'),
        api.get<User[]>('/users'),
        api.get<Expense[]>('/expenses')
      ]);
      setGroups(groupRes.data);
      setUsers(userRes.data);
      setExpenses(expenseRes.data);
    } catch (err: any) {
      console.error('ExpensesPage: Failed to load data', err);
      setError(`Failed to load data: ${err.response?.data?.message || err.message}`);
      addToast({
        type: 'error',
        title: 'Failed to load data',
        description: err.response?.data?.message || err.message
      });
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const selectedGroup = useMemo(() => groups.find(g => g.id === groupId), [groups, groupId]);

  const handleSettleExpense = async (expense: Expense, amountOwed: number) => {
    if (!currentUser) return;
    setSettling(expense.id);
    try {
      await api.post('/transactions', {
        fromUserId: currentUser.id,
        toUserId: expense.paidById,
        amount: amountOwed,
        note: `Settled expense: ${expense.description}`,
      });
      addToast({
        type: 'success',
        title: 'Expense settled!',
        description: `You paid $${amountOwed.toFixed(2)} to settle this expense.`
      });
      // Refresh data
      await fetchData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to settle expense',
        description: err.response?.data?.message || err.message
      });
    } finally {
      setSettling(null);
    }
  };

  const getButtonClass = (option: 'EQUAL' | 'CUSTOM' | 'PERCENTAGE') => {
    return splitType === option ? 'border-teal-300 bg-teal-300 dark:bg-teal-600 text-slate-800 dark:text-slate-100 shadow-sm shadow-teal-100 dark:shadow-teal-900/50' : 'border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-700';
  };

  const createExpense = async () => {
    if (!description || !amount || !paidById || !groupId) {
      setError('All fields are required');
      return;
    }
    setCreating(true);
    setError('');
    try {
      const payload: any = {
        description,
        category,
        amount: Number(amount),
        currency,
        paidById,
        groupId,
        splitType,
        splits: [],
      };
      if (splitType === 'EQUAL') {
        payload.splits = selectedGroup?.members.map((member) => ({ userId: member.id, amount: 0 })) ?? [];
      } else {
        payload.splits = selectedGroup?.members.map((member) => ({ userId: member.id, amount: Number(splits[member.id] || 0) })) ?? [];
      }
      const response = await api.post<Expense>('/expenses', payload);
      setExpenses((prev) => [response.data, ...prev]);
      setOpen(false);
      setDescription('');
      setCategory('');
      setAmount('');
      setCurrency('USD');
      setSplits({});
      addToast({
        type: 'success',
        title: 'Expense created!',
        description: `${description} has been added to ${selectedGroup?.name}.`
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create expense');
      addToast({
        type: 'error',
        title: 'Failed to create expense',
        description: err.response?.data?.message || err.message
      });
    } finally {
      setCreating(false);
    }
  };

  const sortedExpenses = useMemo(() =>
    [...expenses].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // newest first
    }),
    [expenses]
  );

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const myTotalOwed = expenses.reduce((sum, exp) => {
    const mySplit = exp.splits.find(s => s.userId === currentUser?.id);
    return sum + (mySplit ? mySplit.amount : 0);
  }, 0);

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
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Expenses</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-800 dark:text-slate-100">Split costs clearly.</h2>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Track and split expenses with your groups</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={() => setOpen(true)} className="inline-flex items-center gap-2">
            <Plus size={18} />
            Add expense
          </Button>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Expenses</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  ${totalExpenses.toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Receipt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-blue-600 dark:text-blue-400">{expenses.length} expenses recorded</span>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">You Owe</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  ${myTotalOwed.toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400">Across {groups.length} groups</span>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Active Groups</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {groups.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-purple-600 dark:text-purple-400">{users.length} total members</span>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Expenses List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Expenses</h3>
          <div className="space-y-4">
            {expenses.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No expenses yet</p>
                <p className="text-sm">Create your first expense to get started</p>
              </div>
            ) : (
              sortedExpenses.map((expense, index) => {
                const mySplit = expense.splits.find(s => s.userId === currentUser?.id);
                const amountOwed = mySplit ? mySplit.amount : 0;
                const canSettle = amountOwed > 0 && expense.paidById !== currentUser?.id;

                return (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <Receipt className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{expense.description}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Paid by {expense.paidByName === currentUser?.username ? 'You' : expense.paidByName} • {expense.splitType.toLowerCase()} split
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <CategoryBadge categoryId={expense.category.toLowerCase().replace(' & ', '-').replace(' ', '-')} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{expense.currency} ${expense.amount.toFixed(2)}</p>
                      {canSettle && (
                        <Button
                          size="sm"
                          className="h-8 rounded-lg text-xs"
                          onClick={() => handleSettleExpense(expense, amountOwed)}
                          disabled={settling === expense.id}
                        >
                          {settling === expense.id ? 'Settling...' : `Settle $${amountOwed.toFixed(2)}`}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </Card>
      </motion.div>

      {/* Add Expense Modal */}
      <Modal open={open} onOpenChange={setOpen} title="Add new expense">
        <div className="space-y-6">
          <div>
            <label htmlFor="expense-description" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <Input
              id="expense-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Dinner at Italian restaurant"
              className="w-full"
            />
          </div>

          <div>
            <p className="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300">Category</p>
            <CategorySelector
              selectedCategory={category}
              onCategoryChange={setCategory}
            />
          </div>

          <div>
            <label htmlFor="expense-amount" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
            <Input
              id="expense-amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="120.00"
              type="number"
              step="0.01"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="expense-currency" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Currency</label>
            <select
              id="expense-currency"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="AUD">AUD (A$)</option>
              <option value="CHF">CHF (Fr)</option>
              <option value="CNY">CNY (¥)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="expense-group" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Group</label>
              <select
                id="expense-group"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={groupId ?? ''}
                onChange={(event) => setGroupId(Number(event.target.value))}
              >
                <option value="">Choose group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="expense-paid-by" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Paid by</label>
              <select
                id="expense-paid-by"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={paidById ?? ''}
                onChange={(event) => setPaidById(Number(event.target.value))}
              >
                <option value="">Select payer</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.username}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <p className="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300">Split type</p>
            <div className="flex flex-wrap gap-2">
              {(['EQUAL', 'CUSTOM', 'PERCENTAGE'] as const).map((option) => (
                <motion.button
                  key={option}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setSplitType(option)}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${getButtonClass(option)}`}
                >
                  {option === 'EQUAL' ? 'Equal' : option === 'CUSTOM' ? 'Custom' : 'Percentage'}
                </motion.button>
              ))}
            </div>
          </div>

          {splitType === 'CUSTOM' && selectedGroup && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4"
            >
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Specify amount per member</p>
              <div className="space-y-3">
                {selectedGroup.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{member.username}</span>
                    <Input
                      value={splits[member.id] ?? ''}
                      onChange={(event) => setSplits((prev) => ({ ...prev, [member.id]: event.target.value }))}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      className="w-24"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
            >
              {error}
            </motion.div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={createExpense}
              disabled={creating}
              className="min-w-[100px]"
            >
              {creating ? 'Creating...' : 'Create Expense'}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}

export default ExpensesPage;
