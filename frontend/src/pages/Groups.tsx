import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Group, User } from '../lib/types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

function GroupsPage() {
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
    } catch (err: any) {
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
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card title="Create group">
          <div className="space-y-4">
            <div>
              <label htmlFor="group-name" className="mb-2 block text-sm text-slate-500 dark:text-slate-400">Group name</label>
              <Input id="group-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Weekend trip" />
            </div>
            <div>
              <label htmlFor="group-description" className="mb-2 block text-sm text-slate-500 dark:text-slate-400">Description</label>
              <Input id="group-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Shared travel and dining" />
            </div>
            <div>
              <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Members</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => toggleUserSelection(user.id)}
                    className={`rounded-2xl border px-4 py-3 text-left transition-all ${selected.includes(user.id) ? 'border-teal-300 bg-teal-300 dark:bg-teal-600 text-slate-800 dark:text-slate-100 shadow-md shadow-teal-100 dark:shadow-teal-900/50' : 'border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-700 hover:border-white/70 dark:hover:border-slate-600'}`}
                  >
                    {user.username}
                  </button>
                ))}
              </div>
            </div>
            {error && <div className="mt-4 rounded-2xl bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
            <Button className="mt-2" onClick={createGroup} disabled={creating}>{creating ? 'Creating...' : 'Create group'}</Button>
          </div>
        </Card>
        <Card title="Group overview">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, idx) => (
                <div key={`skeleton-${idx}`} className="h-16 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group.id} className="rounded-3xl border border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-5 shadow-sm">
                  {editing === group.id ? (
                    <div className="space-y-4">
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Group name" />
                      <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Description" />
                      <div>
                        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Members</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {users.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => toggleEditUserSelection(user.id)}
                              className={`rounded-2xl border px-4 py-3 text-left transition-all ${editSelected.includes(user.id) ? 'border-teal-300 bg-teal-300 dark:bg-teal-600 text-slate-800 dark:text-slate-100 shadow-md shadow-teal-100 dark:shadow-teal-900/50' : 'border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-700'}`}
                            >
                              {user.username}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => updateGroup(group.id)}>Save</Button>
                        <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{group.name}</h2>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{group.description}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs text-slate-600 dark:text-slate-400">{group.members.length} members</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {group.members.map((member) => (
                          <span key={member.id} className="rounded-2xl bg-white/70 dark:bg-slate-800/70 px-3 py-1 text-sm text-slate-800 dark:text-slate-200 shadow-sm border border-white/50 dark:border-slate-700/80">
                            {member.username}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" onClick={() => { setEditing(group.id); setEditName(group.name); setEditDescription(group.description); setEditSelected(group.members.map(m => m.id)); }}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteGroup(group.id)}>Delete</Button>
                        <Button size="sm" onClick={() => settleUp(group.id)} disabled={settling === group.id}>{settling === group.id ? 'Loading...' : 'Settle Up'}</Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
      {settlements.length > 0 && (
        <Card title="Suggested Settlements">
          <div className="space-y-3">
            {settlements.map((settlement, index) => (
              <div key={`${settlement.fromUserId}-${settlement.toUserId}-${settlement.amount}`} className="rounded-3xl border border-white/50 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 shadow-sm">
                <p className="text-sm text-slate-500 dark:text-slate-400">User {settlement.fromUserId} pays User {settlement.toUserId} ${settlement.amount}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default GroupsPage;
