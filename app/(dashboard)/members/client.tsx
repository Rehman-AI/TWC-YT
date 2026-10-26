"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { createMember, deleteMember } from "@/app/actions/members";
import { SubmitButton } from "@/components/submit-button";

type Member = {
  id: string;
  name: string;
  email: string;
  isBoss: boolean;
  role: { id: string; name: string; permissions: string[] } | null;
};

type Role = {
  id: string;
  name: string;
  permissions: string[];
  _count: { users: number };
};

export function MembersClient({ members, roles }: { members: Member[]; roles: Role[] }) {
  const [showForm, setShowForm] = useState(false);
  const [state, formAction] = useFormState(createMember, null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Team Members</h1>
          <p className="text-sm text-zinc-500">Manage your team</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-[#8c0f60] to-[#e8227a] text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-pink-500/25 transition-all"
        >
          + New Member
        </button>
      </div>

      {showForm && (
        <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-white mb-4">Add New Member</h3>
          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 mb-4">{state.error}</div>
          )}
          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Full Name</label>
                <input name="name" required placeholder="John Doe" className="w-full px-3 py-2 bg-[#1a1a1f] border border-white/[0.06] rounded-lg text-white text-sm focus:border-pink-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Email</label>
                <input name="email" type="email" required placeholder="john@twc.com" className="w-full px-3 py-2 bg-[#1a1a1f] border border-white/[0.06] rounded-lg text-white text-sm focus:border-pink-500/50 focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Password</label>
                <input name="password" type="password" required placeholder="••••••••" className="w-full px-3 py-2 bg-[#1a1a1f] border border-white/[0.06] rounded-lg text-white text-sm focus:border-pink-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Role</label>
                <select name="roleId" className="w-full px-3 py-2 bg-[#1a1a1f] border border-white/[0.06] rounded-lg text-white text-sm focus:border-pink-500/50 focus:outline-none">
                  <option value="">No role</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <SubmitButton pendingText="Creating...">Create Member</SubmitButton>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#111114] border border-white/[0.06] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Name</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Email</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Role</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-[10px] font-semibold text-white">
                      {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <span className="text-sm text-white font-medium">{m.name}</span>
                    {m.isBoss && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-pink-500/10 text-pink-400">BOSS</span>}
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-zinc-400">{m.email}</td>
                <td className="px-5 py-3">
                  <span className="text-xs px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400">
                    {m.isBoss ? "Boss (all permissions)" : m.role?.name || "No role"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  {!m.isBoss && (
                    <button onClick={() => deleteMember(m.id)} className="text-xs text-zinc-600 hover:text-red-400 transition-colors">
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
