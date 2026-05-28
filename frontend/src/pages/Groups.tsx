import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Group, User } from '../lib/types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { motion } from 'framer-motion';
import { Users, Plus, Edit3, Trash2, DollarSign, UserPlus, Loader2, AlertCircle } from 'lucide-react';

function GroupsPage() {
  const { addToast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [editSelected, setEditSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [settlements, setSettlements] = useState<any[]>([]);
  const [settling, setSettling] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const toggleUserSelection = (userId: number) => {
    setSelected((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const toggleEditUserSelection = (userId: number) => {
    setEditSelected((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [groupRes, userRes] = await Promise.all([
        api.get<Group[]>('/groups'),
        api.get<User[]>('/users')
      ]);
      setGroups(groupRes.data);
      setUsers(userRes.data);
    } catch (err: any) {
      console.error('GroupsPage: Failed to load data', err);
      setError(`Failed to load groups and users: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const createGroup = async () => {
    if (!name || selected.length === 0) {
      setError('Group name and at least one member are required');
      return;
    }
    setCreating(true);
    setError('');
    try {
      const response = await api.post<Group>('/groups', { name, description, memberIds: selected });
      setGroups((prev) => [response.data, ...prev]);
      addToast({
        type: 'success',
        title: 'Group created!',
        description: `${name} has been created successfully.`
      });
      setName('');
      setDescription('');
      setSelected([]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const updateGroup = async (id: number) => {
    setCreating(true);
    setError('');
    try {
      const response = await api.put<Group>(`/groups/${id}`, { name: editName, description: editDescription, memberIds: editSelected });
      setGroups((prev) => prev.map(g => g.id === id ? response.data : g));
      addToast({
        type: 'success',
        title: 'Group updated!',
        description: `${editName} has been updated.`
      });
      setEditing(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update group');
    } finally {
      setCreating(false);
    }
  };

  const deleteGroup = async (id: number) => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    try {
      await api.delete(`/groups/${id}`);
      setGroups((prev) => prev.filter(g => g.id !== id));
      addToast({
        type: 'success',
        title: 'Group deleted',
        description: 'The group has been removed.'
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to delete group',
        description: err.response?.data?.message || err.message
      });
      setError(err.response?.data?.message || 'Failed to delete group');
    }
  };

  const settleUp = async (id: number) => {
    setSettling(id);
    try {
      const response = await api.get(`/groups/${id}/settlements`);
      setSettlements(response.data);
    } finally {
      setSettling(null);
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
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Groups</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-800 dark:text-slate-100">Manage your circles.</h2>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Create and manage expense-sharing groups</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Create Group */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card title="Create group">
            <div className="space-y-4">
              <div>
                <label htmlFor="group-name" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Group name</label>
                <Input id="group-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Weekend trip" />
              </div>
              <div>
                <label htmlFor="group-description" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <Input id="group-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Shared travel and dining" />
              </div>
              <div>
                <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Members <span className="text-slate-400 font-normal">({selected.length} selected)</span>
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {users.map((user) => (
                    <motion.button
                      key={user.id}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleUserSelection(user.id)}
                      className={`rounded-2xl border px-4 py-3 text-left transition-all flex items-center gap-3 ${
                        selected.includes(user.id)
                          ? 'border-teal-300 bg-teal-300 dark:bg-teal-600 text-slate-800 dark:text-slate-100 shadow-md shadow-teal-100 dark:shadow-teal-900/50'
                          : 'border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-700 hover:border-white/70 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        selected.includes(user.id) ? 'bg-white/30 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span>{user.username}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
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
                <Button className="mt-2 w-full" onClick={createGroup} disabled={creating}>
                  {creating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : <><UserPlus className="w-4 h-4 mr-2" /> Create group</>}
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Group Overview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card title="Group overview">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }, (_, idx) => (
                  <motion.div
                    key={`skeleton-${idx}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="h-16 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {groups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <div className="rounded-3xl border border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-all">
                      {editing === group.id ? (
                        <div className="space-y-4">
                          <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Group name" />
                          <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Description" />
                          <div>
                            <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                              Members <span className="text-slate-400 font-normal">({editSelected.length} selected)</span>
                            </p>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {users.map((user) => (
                                <motion.button
                                  key={user.id}
                                  type="button"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => toggleEditUserSelection(user.id)}
                                  className={`rounded-2xl border px-4 py-2 text-left transition-all flex items-center gap-2 ${
                                    editSelected.includes(user.id)
                                      ? 'border-teal-300 bg-teal-300 dark:bg-teal-600 text-slate-800 dark:text-slate-100 shadow-md shadow-teal-100 dark:shadow-teal-900/50'
                                      : 'border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-700'
                                  }`}
                                >
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    editSelected.includes(user.id) ? 'bg-white/30 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                  }`}>
                                    {user.username.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-sm">{user.username}</span>
                                </motion.button>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => updateGroup(group.id)} disabled={creating}>Save</Button>
                            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-100 to-sky-100 dark:from-teal-900/30 dark:to-sky-900/30 flex items-center justify-center">
                                <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                              </div>
                              <div>
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{group.name}</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{group.description || 'No description'}</p>
                              </div>
                            </div>
                            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 border border-white/50 dark:border-slate-700/80">
                              {group.members.length} members
                            </span>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {group.members.map((member) => (
                              <span
                                key={member.id}
                                className="inline-flex items-center gap-1.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 px-3 py-1 text-sm text-slate-800 dark:text-slate-200 shadow-sm border border-white/50 dark:border-slate-700/80"
                              >
                                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-rose-100 to-teal-100 dark:from-rose-900/30 dark:to-teal-900/30 flex items-center justify-center text-xs font-bold text-rose-600 dark:text-rose-400">
                                  {member.username.charAt(0).toUpperCase()}
                                </span>
                                {member.username}
                              </span>
                            ))}
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => { setEditing(group.id); setEditName(group.name); setEditDescription(group.description || ''); setEditSelected(group.members.map(m => m.id)); }}>
                              <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteGroup(group.id)}>
                              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                            </Button>
                            <Button size="sm" onClick={() => settleUp(group.id)} disabled={settling === group.id}>
                              {settling === group.id ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Loading...</> : <><DollarSign className="w-3.5 h-3.5 mr-1.5" /> Settle Up</>}
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
                {groups.length === 0 && !loading && (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No groups yet</p>
                    <p className="text-sm">Create your first group to start splitting expenses</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Settlements */}
      {settlements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card title="Suggested Settlements">
            <div className="space-y-3">
              {settlements.map((settlement, index) => (
                <motion.div
                  key={`${settlement.fromUserId}-${settlement.toUserId}-${settlement.amount}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-3xl border border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-sm font-bold text-rose-600 dark:text-rose-400">
                      {settlement.fromUserName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-slate-400">pays</span>
                    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-sm font-bold text-teal-600 dark:text-teal-400">
                      {settlement.toUserName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    ${Number(settlement.amount).toFixed(2)}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

export default GroupsPage;
