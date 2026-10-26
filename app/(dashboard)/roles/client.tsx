"use client";

import { useState, useActionState } from "react";
import { createRole, deleteRole } from "@/app/actions/roles";
import { ALL_PERMISSIONS } from "@/lib/permissions";

type RoleWithCount = {
  id: string;
  name: string;
  permissions: string[];
  createdAt: Date;
  _count: { users: number };
};

export function RolesClient({ roles }: { roles: RoleWithCount[] }) {
  const [showForm, setShowForm] = useState(false);
  const [state, formAction, pending] = useActionState(createRole, null);

  // Group permissions by category
  const grouped = ALL_PERMISSIONS.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, typeof ALL_PERMISSIONS[number][]>);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Roles</h1>
          <p className="text-sm text-zinc-500">Create roles with specific permissions</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-[#8c0f60] to-[#e8227a] text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-pink-500/25 transition-all"
        >
          + New Role
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-white mb-4">Create New Role</h3>
          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 mb-4">{state.error}</div>
          )}
          <form action={async (formData) => {
            await formAction(formData);
            if (!state?.error) setShowForm(false);
          }} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Role Name</label>
              <input
                name="name"
                required
                placeholder="e.g. YouTube Head, Script Writer"
                className="w-full px-3 py-2 bg-[#1a1a1f] border border-white/[0.06] rounded-lg text-white text-sm focus:border-pink-500/50 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-3">Permissions</label>
              <div className="space-y-4">
                {Object.entries(grouped).map(([category, perms]) => (
                  <div key={category}>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-2">{category}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {perms.map((p) => (
                        <label key={p.key} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/[0.02] cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            name="permissions"
                            value={p.key}
                            className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-pink-500 focus:ring-pink-500/20"
                          />
                          <span className="text-xs text-zinc-300">{p.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={pending}
                className="px-4 py-2 bg-pink-600 text-white text-sm font-semibold rounded-lg hover:bg-pink-500 transition-colors disabled:opacity-50"
              >
                {pending ? "Creating..." : "Create Role"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Roles List */}
      <div className="space-y-3">
        {roles.length === 0 ? (
          <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-8 text-center">
            <p className="text-sm text-zinc-500">No roles yet. Create your first role to get started.</p>
          </div>
        ) : (
          roles.map((role) => (
            <div key={role.id} className="bg-[#111114] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.1] transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">{role.name}</h3>
                  <p className="text-[11px] text-zinc-500">{role._count.users} member{role._count.users !== 1 ? "s" : ""}</p>
                </div>
                <button
                  onClick={() => deleteRole(role.id)}
                  className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {role.permissions.map((p) => {
                  const perm = ALL_PERMISSIONS.find((ap) => ap.key === p);
                  return (
                    <span key={p} className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.04] text-zinc-400">
                      {perm?.label || p}
                    </span>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
