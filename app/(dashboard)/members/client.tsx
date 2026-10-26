"use client";

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { createMember, updateMember, deleteMember } from "@/app/actions/members";
import { SubmitButton } from "@/components/submit-button";
import { MemberDetailModal } from "@/components/member-detail-modal";
import { KeyRound, X } from "lucide-react";

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
  const [selectedMember, setSelectedMember] = useState<{ id: string; name: string } | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [state, formAction] = useFormState(createMember, null);
  const [editState, editAction] = useFormState(updateMember, null);

  useEffect(() => {
    if (editState?.success) {
      setEditingMember(null);
    }
  }, [editState]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Team Members</h1>
          <p className="text-sm text-zinc-500">Manage your team and assign roles</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-[#8c0f60] to-[#e8227a] text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-pink-500/25 transition-all"
        >
          + New Member
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-5 mb-6">
          <h3 className="text-sm font-bold text-zinc-900 mb-4">Add New Member</h3>
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">{state.error}</div>
          )}
          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Full Name</label>
                <input name="name" required placeholder="John Doe" className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:bg-white focus:border-pink-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Email</label>
                <input name="email" type="email" required placeholder="john@twc.com" className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:bg-white focus:border-pink-500/50 focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Password</label>
                <input name="password" type="password" required placeholder="••••••••" className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:bg-white focus:border-pink-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Role</label>
                <select name="roleId" className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:bg-white focus:border-pink-500/50 focus:outline-none">
                  <option value="">No role</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <SubmitButton pendingText="Creating...">Create Member</SubmitButton>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-800">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/50">
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Name</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Email</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Role</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr
                key={m.id}
                className="border-b border-zinc-100 hover:bg-zinc-50/80 cursor-pointer transition-colors"
                onClick={() => setSelectedMember({ id: m.id, name: m.name })}
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-[10px] font-semibold text-white">
                      {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <span className="text-sm text-zinc-900 font-semibold hover:text-pink-600 transition-colors">{m.name}</span>
                    {m.isBoss && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-pink-50 text-pink-700 border border-pink-200">BOSS</span>}
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-zinc-600">{m.email}</td>
                <td className="px-5 py-3">
                  <span className="text-xs px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 font-medium">
                    {m.isBoss ? "Boss (all permissions)" : m.role?.name || "No role"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => setSelectedMember({ id: m.id, name: m.name })}
                      className="text-xs text-pink-600 hover:text-pink-700 font-semibold transition-colors"
                    >
                      View Work →
                    </button>
                    {!m.isBoss && (
                      <button
                        onClick={() => setEditingMember(m)}
                        className="text-xs text-zinc-600 hover:text-zinc-900 font-medium transition-colors"
                      >
                        Edit / Password
                      </button>
                    )}
                    {!m.isBoss && (
                      <button onClick={() => deleteMember(m.id)} className="text-xs text-zinc-400 hover:text-red-600 transition-colors">
                        Remove
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedMember && (
        <MemberDetailModal
          memberId={selectedMember.id}
          memberName={selectedMember.name}
          onClose={() => setSelectedMember(null)}
        />
      )}

      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-600">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">Edit Member / Reset Password</h2>
                  <p className="text-[11px] text-zinc-500">{editingMember.name} ({editingMember.email})</p>
                </div>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {editState?.error && (
                <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
                  {editState.error}
                </div>
              )}

              <form action={editAction} className="space-y-4">
                <input type="hidden" name="id" value={editingMember.id} />

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Name</label>
                  <input
                    name="name"
                    required
                    defaultValue={editingMember.name}
                    className="w-full px-3 py-2 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:bg-white focus:border-pink-500/50 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    defaultValue={editingMember.email}
                    className="w-full px-3 py-2 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:bg-white focus:border-pink-500/50 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Role</label>
                  <select
                    name="roleId"
                    defaultValue={editingMember.role?.id || ""}
                    className="w-full px-3 py-2 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:bg-white focus:border-pink-500/50 focus:outline-none transition-colors"
                  >
                    <option value="">No role</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    New Password <span className="text-zinc-500 font-normal">(leave blank to keep current)</span>
                  </label>
                  <input
                    name="password"
                    type="password"
                    placeholder="Set new password..."
                    className="w-full px-3 py-2 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:bg-white focus:border-pink-500/50 focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex gap-2 pt-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <SubmitButton pendingText="Saving...">Save Changes</SubmitButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
