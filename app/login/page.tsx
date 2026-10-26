"use client";

import { useFormState } from "react-dom";
import { loginAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8c0f60] to-[#e8227a] flex items-center justify-center font-bold text-white text-lg shadow-md shadow-pink-500/20">
            T
          </div>
          <div>
            <div className="font-bold text-lg text-zinc-900">TWC Studio</div>
            <div className="text-xs text-zinc-500">Content Control Center</div>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-7 shadow-xl shadow-zinc-900/5">
          <h1 className="text-xl font-bold text-zinc-900 mb-1">Welcome back</h1>
          <p className="text-sm text-zinc-500 mb-6">Sign in to your account</p>

          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-3 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-sm placeholder:text-zinc-400 focus:bg-white focus:border-[#e8227a]/50 focus:outline-none focus:ring-1 focus:ring-[#e8227a]/20 transition-colors"
                placeholder="boss@twc.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                required
                className="w-full px-3 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-sm placeholder:text-zinc-400 focus:bg-white focus:border-[#e8227a]/50 focus:outline-none focus:ring-1 focus:ring-[#e8227a]/20 transition-colors"
                placeholder="••••••••"
              />
            </div>
            <SubmitButton
              pendingText="Signing in..."
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#8c0f60] to-[#e8227a] text-white font-semibold text-sm rounded-lg hover:shadow-lg hover:shadow-[#e8227a]/25 transition-all disabled:opacity-50"
            >
              Sign In
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}
