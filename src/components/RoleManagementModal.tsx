// src/components/RoleManagementModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Shield, 
  Crown, 
  UserCheck, 
  PhoneCall, 
  Compass, 
  Check, 
  AlertCircle, 
  Plus, 
  RefreshCw, 
  ExternalLink, 
  Database,
  Lock,
  Sparkles
} from 'lucide-react';
import { 
  PBUser, 
  UserRole, 
  fetchAllUsers, 
  assignUserRole, 
  createNewUser, 
  checkServerHealth,
  getPocketBaseUrl,
  getCurrentUser
} from '../lib/pocketbase';

interface RoleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoleView: 'all' | 'admin' | 'designer' | 'agent' | 'superagent';
  onSelectRoleView: (roleView: 'all' | 'admin' | 'designer' | 'agent' | 'superagent') => void;
  onUserRoleChanged?: (updatedUser: PBUser) => void;
}

export function RoleManagementModal({
  isOpen,
  onClose,
  activeRoleView,
  onSelectRoleView,
  onUserRoleChanged
}: RoleManagementModalProps) {
  const [users, setUsers] = useState<PBUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [serverHealth, setServerHealth] = useState<{ online: boolean; latencyMs: number; version?: string }>({ online: false, latencyMs: 0 });
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New user form state
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('designer');
  const [newPassword, setNewPassword] = useState('Goto hell 555');

  const currentUser = getCurrentUser();

  const loadData = async () => {
    setLoading(true);
    try {
      const [uList, health] = await Promise.all([
        fetchAllUsers(),
        checkServerHealth()
      ]);
      setUsers(uList);
      setServerHealth(health);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleRoleChange = async (userId: string, targetRole: UserRole) => {
    setUpdatingUserId(userId);
    setStatusMessage(null);
    const success = await assignUserRole(userId, targetRole);
    if (success) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: targetRole } : u));
      setStatusMessage({ type: 'success', text: `Assigned role '${targetRole}' successfully.` });
      const changed = users.find(u => u.id === userId);
      if (changed && onUserRoleChanged) {
        onUserRoleChanged({ ...changed, role: targetRole });
      }
    } else {
      setStatusMessage({ type: 'error', text: 'Failed to update role in PocketBase.' });
    }
    setUpdatingUserId(null);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newEmail) return;
    setLoading(true);
    setStatusMessage(null);
    const created = await createNewUser({
      username: newUsername.trim(),
      email: newEmail.trim(),
      name: newName.trim() || newUsername.trim(),
      role: newRole,
      password: newPassword
    });

    if (created) {
      setUsers(prev => [...prev, created]);
      setStatusMessage({ type: 'success', text: `User ${created.username} created with role '${created.role}'.` });
      setShowAddUser(false);
      setNewUsername('');
      setNewName('');
      setNewEmail('');
    } else {
      setStatusMessage({ type: 'error', text: 'Failed to create user in PocketBase.' });
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <Crown size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">PocketBase Superuser Console</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/30">
                  God Mode
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Logged in as <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">dev</span> (dev@auracad.local) — Manage team roles & test UI views
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh PocketBase Data"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Server Status Strip */}
        <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${serverHealth.online ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-500'}`} />
            <span className="font-medium text-slate-700 dark:text-slate-300">PocketBase REST API:</span>
            <code className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              {getPocketBaseUrl()}
            </code>
            {serverHealth.online && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                {serverHealth.latencyMs}ms latency (v{serverHealth.version})
              </span>
            )}
          </div>

          <a 
            href={`${getPocketBaseUrl()}/_/`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            <span>Open PocketBase Dashboard</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800' 
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
            }`}>
              {statusMessage.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Quick UI Role Impersonator / Preview Switcher */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-500" />
                <span>Test Run: Active UI Role Preview</span>
              </h3>
              <span className="text-[11px] text-slate-400">Switch perspectives instantly</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <button
                onClick={() => onSelectRoleView('all')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  activeRoleView === 'all'
                    ? 'bg-amber-500/10 border-amber-500/60 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-700 dark:text-amber-300 mb-1">
                  <Crown size={14} />
                  <span>Owner / All</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Full studio suite with unrestricted CAD & CRM tools
                </p>
              </button>

              <button
                onClick={() => onSelectRoleView('superagent')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  activeRoleView === 'superagent'
                    ? 'bg-indigo-500/10 border-indigo-500/60 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-700 dark:text-indigo-300 mb-1">
                  <Shield size={14} />
                  <span>Manager UI</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Superagent manager: pipeline oversight & approvals
                </p>
              </button>

              <button
                onClick={() => onSelectRoleView('admin')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  activeRoleView === 'admin'
                    ? 'bg-blue-500/10 border-blue-500/60 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-blue-700 dark:text-blue-300 mb-1">
                  <Shield size={14} />
                  <span>Admin UI</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Studio oversight, all orders, team workload & financials
                </p>
              </button>

              <button
                onClick={() => onSelectRoleView('designer')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  activeRoleView === 'designer'
                    ? 'bg-purple-500/10 border-purple-500/60 ring-2 ring-purple-500/20 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-purple-700 dark:text-purple-300 mb-1">
                  <Compass size={14} />
                  <span>Designer UI</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  3D CAD WebGL inspection, assigned orders & alloy specs
                </p>
              </button>

              <button
                onClick={() => onSelectRoleView('agent')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  activeRoleView === 'agent'
                    ? 'bg-emerald-500/10 border-emerald-500/60 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700 dark:text-emerald-300 mb-1">
                  <PhoneCall size={14} />
                  <span>Agent CRM</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  High-functionality CRM, powerdialler lead queue & logs
                </p>
              </button>
            </div>
          </div>

          {/* User Role Assignment Table */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <UserCheck size={13} className="text-amber-500" />
                <span>PocketBase Team & Role Assignment</span>
              </h3>

              <button
                onClick={() => setShowAddUser(!showAddUser)}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 flex items-center gap-1 cursor-pointer transition-all"
              >
                <Plus size={13} />
                <span>{showAddUser ? 'Cancel' : 'New User'}</span>
              </button>
            </div>

            {/* Add User Form */}
            {showAddUser && (
              <form onSubmit={handleCreateUser} className="mb-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Register New Team Member in PocketBase</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Username</label>
                    <input 
                      type="text" 
                      required 
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                      placeholder="e.g. jessica_cad"
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder="e.g. Jessica Sterling"
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Email</label>
                    <input 
                      type="email" 
                      required 
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      placeholder="e.g. jessica@auracad.local"
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Assigned Role</label>
                    <select
                      value={newRole}
                      onChange={e => setNewRole(e.target.value as UserRole)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      <option value="admin">Admin</option>
                      <option value="designer">Designer</option>
                      <option value="agent">Agent (CRM / Dialler)</option>
                      <option value="superagent">Superagent</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="text-xs px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold cursor-pointer"
                  >
                    Save User to PocketBase
                  </button>
                </div>
              </form>
            )}

            {/* Users Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3.5 font-semibold">User</th>
                    <th className="py-2.5 px-3 font-semibold">Email</th>
                    <th className="py-2.5 px-3 font-semibold">Current Role</th>
                    <th className="py-2.5 px-3.5 text-right font-semibold">Assign Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map(u => {
                    const isGod = u.username === 'dev';
                    const isUpdating = updatingUserId === u.id;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] ${
                              isGod 
                                ? 'bg-amber-500/20 text-amber-700 border border-amber-400/50' 
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                            }`}>
                              {u.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {isGod && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 font-bold">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-mono text-slate-400">@{u.username}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                          {u.email}
                        </td>

                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            u.role === 'owner'
                              ? 'bg-amber-500/10 text-amber-700 border-amber-300 dark:border-amber-700 dark:text-amber-300'
                              : u.role === 'superagent'
                              ? 'bg-indigo-500/10 text-indigo-700 border-indigo-300 dark:border-indigo-700 dark:text-indigo-300'
                              : u.role === 'admin'
                              ? 'bg-blue-500/10 text-blue-700 border-blue-300 dark:border-blue-700 dark:text-blue-300'
                              : u.role === 'designer'
                              ? 'bg-purple-500/10 text-purple-700 border-purple-300 dark:border-purple-700 dark:text-purple-300'
                              : 'bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:border-emerald-700 dark:text-emerald-300'
                          }`}>
                            {u.role === 'owner' ? 'OWNER (GOD)' : u.role === 'superagent' ? 'MANAGER' : u.role.toUpperCase()}
                          </span>
                        </td>

                        <td className="py-2.5 px-3.5 text-right">
                          <select
                            value={u.role}
                            disabled={isUpdating}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                            className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          >
                            <option value="admin">Admin</option>
                            <option value="designer">Designer</option>
                            <option value="agent">Agent</option>
                            <option value="superagent">Superagent (Manager)</option>
                            <option value="owner">Owner (God User)</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Database size={13} className="text-amber-500" />
            <span>Changes persist immediately into PocketBase SQLite WAL database</span>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-semibold px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
