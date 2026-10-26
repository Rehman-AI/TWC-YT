"use client";

import type { SessionUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";

export function Topbar({ session }: { session: SessionUser }) {
  return (
    <header className="h-[54px] flex-none border-b border-white/[0.06] flex items-center px-6 gap-4 bg-[#09090b]/80 backdrop-blur-xl">
      <div className="flex items-center gap-1.5 text-[13px] text-zinc-500">
        <span>TWC Studio</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 opacity-40">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <span className="text-white font-semibold">Control Center</span>
      </div>

      <div className="flex-1" />

      <div className="text-xs text-zinc-500">
        {session.name} · {session.isBoss ? "Boss" : "Member"}
      </div>

      <form action={logoutAction}>
        <button
          type="submit"
          className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
        >
          Sign out
        </button>
      </form>
    </header>
  );
}
