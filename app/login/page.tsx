"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
      <div className="w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8c0f60] to-[#e8227a] flex items-center justify-center font-bold text-white text-lg">
            T
          </div>
          <div>
            <div className="font-semibold text-lg text-white">TWC Studio</div>
            <div className="text-xs text-zinc-500">Content Control Center</div>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-6">
          <h1 className="text-xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-zinc-500 mb-6">Sign in to your account</p>

          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 mb-4">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-3 py-2.5 bg-[#1a1a1f] border border-white/[0.06] rounded-lg text-white text-sm placeholder:text-zinc-600 focus:border-[#e8227a]/50 focus:outline-none focus:ring-1 focus:ring-[#e8227a]/20 transition-colors"
                placeholder="boss@twc.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                required
                className="w-full px-3 py-2.5 bg-[#1a1a1f] border border-white/[0.06] rounded-lg text-white text-sm placeholder:text-zinc-600 focus:border-[#e8227a]/50 focus:outline-none focus:ring-1 focus:ring-[#e8227a]/20 transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#8c0f60] to-[#e8227a] text-white font-semibold text-sm rounded-lg hover:shadow-lg hover:shadow-[#e8227a]/25 transition-all disabled:opacity-50"
            >
              {pending ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
