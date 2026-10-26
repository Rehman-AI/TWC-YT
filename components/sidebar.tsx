"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@/lib/auth";
import { hasPermission, hasAnyPermission } from "@/lib/permissions";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "grid", permission: null },
  { label: "Channels", href: "/channels", icon: "tv", permission: "manage_channels" as const },
  { label: "Scripts", href: "/scripts", icon: "file", permission: "write_scripts" as const },
  { label: "Video Tasks", href: "/videos", icon: "video", permission: "make_videos" as const },
  { label: "Platform Tasks", href: "/platform-tasks", icon: "upload", permission: null }, // filtered by platform perms
  { label: "Members", href: "/members", icon: "users", permission: "manage_members" as const },
  { label: "Roles", href: "/roles", icon: "shield", permission: "manage_roles" as const },
  { label: "Activity Log", href: "/activity", icon: "list", permission: "view_all_progress" as const },
];

const icons: Record<string, React.ReactNode> = {
  grid: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  tv: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>,
  file: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  video: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  upload: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  list: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>,
};

export function Sidebar({ session }: { session: SessionUser }) {
  const pathname = usePathname();

  const platformPerms = ["post_youtube", "post_tiktok", "post_facebook", "post_snapchat", "post_instagram"] as const;

  const visibleItems = navItems.filter((item) => {
    // Boss sees everything
    if (session.isBoss) return true;
    // Dashboard visible to all
    if (item.permission === null && item.href === "/dashboard") return true;
    // Platform tasks visible if user has any platform permission
    if (item.href === "/platform-tasks") {
      return hasAnyPermission(session.permissions, session.isBoss, [...platformPerms]);
    }
    // Check specific permission
    if (item.permission) {
      return hasPermission(session.permissions, session.isBoss, item.permission);
    }
    return false;
  });

  return (
    <aside className="w-[248px] flex-none bg-[#0c0c0f] border-r border-white/[0.06] flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="p-4 pb-3 flex items-center gap-2.5 border-b border-white/[0.06]">
        <div className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-[#8c0f60] to-[#e8227a] flex items-center justify-center font-bold text-[13px] text-white flex-none">
          T
        </div>
        <div>
          <div className="text-[13px] font-semibold text-white">TWC Studio</div>
          <div className="text-[11px] text-zinc-500">Content Control Center</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="px-2 pt-3 pb-1 text-[10px] font-semibold tracking-wider uppercase text-zinc-700">
          Main
        </div>
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-2.5 py-[7px] rounded-lg text-[13px] font-medium transition-all relative ${
                isActive
                  ? "bg-[#e8227a]/8 text-white"
                  : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300"
              }`}
            >
              {isActive && (
                <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r bg-[#e8227a]" />
              )}
              <span className={isActive ? "opacity-100" : "opacity-55"}>
                {icons[item.icon]}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/[0.06] flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#e8227a] to-[#8b5cf6] flex items-center justify-center text-[11px] font-semibold text-white flex-none">
          {session.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium text-white truncate">{session.name}</div>
          <div className="text-[11px] text-zinc-500">{session.isBoss ? "Boss" : "Member"}</div>
        </div>
      </div>
    </aside>
  );
}
