"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { createRole, deleteRole } from "@/app/actions/roles";
import { ALL_PERMISSIONS } from "@/lib/permissions";
import { SubmitButton } from "@/components/submit-button";

type RoleWithCount = {
  id: string;
  name: string;
  permissions: string[];
  createdAt: Date;
  _count: { users: number };
};

export function RolesClient({ roles }: { roles: RoleWithCount[] }) {
  const [showForm, setShowForm] = useState(false);
  const [state, formAction] = useFormState(createRole, null);

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
          <h1 className="text-xl font-bold text-zinc-900">Roles</h1>
          <p className="text-sm text-zinc-500">Create roles with specific permissions</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-[#8c0f60] to-[#e8227a] text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-pink-500/20 transition-all"
        >
          + New Role
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-zinc-200 rounded-xl p-5 mb-6 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Create New Role</h3>
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">{state.error}</div>
          )}
          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Role Name</label>
              <input
                name="name"
                required
                placeholder="e.g. YouTube Head, Script Writer"
                className="w-full px-3 py-2 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:bg-white focus:border-pink-500/50 focus:outline-none placeholder:text-zinc-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-3">Permissions</label>
              <div className="space-y-4">
                {Object.entries(grouped).map(([category, perms]) => (
                  <div key={category}>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">{category}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {perms.map((p) => (
                        <label key={p.key} className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-50 border border-transparent hover:border-zinc-200 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            name="permissions"
                            value={p.key}
                            className="w-4 h-4 rounded border-zinc-300 bg-white text-pink-600 focus:ring-pink-500/30"
                          />
                          <span className="text-xs text-zinc-700 font-medium">{p.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <SubmitButton pendingText="Creating...">Create Role</SubmitButton>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {roles.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center shadow-sm">
            <p className="text-sm text-zinc-500">No roles yet. Create your first role to get started.</p>
          </div>
        ) : (
          roles.map((role) => (
            <div key={role.id} className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 shadow-sm transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">{role.name}</h3>
                  <p className="text-[11px] text-zinc-500">{role._count.users} member{role._count.users !== 1 ? "s" : ""}</p>
                </div>
                <button
                  onClick={() => deleteRole(role.id)}
                  className="text-xs text-zinc-400 hover:text-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {role.permissions.map((p) => {
                  const perm = ALL_PERMISSIONS.find((ap) => ap.key === p);
                  return (
                    <span key={p} className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 border border-zinc-200/80 text-zinc-700">
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
