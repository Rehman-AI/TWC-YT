"use client";

import { useState } from "react";
import { MemberDetailModal } from "@/components/member-detail-modal";
import { ChevronRight } from "lucide-react";

type MemberProgressItem = {
  id: string;
  name: string;
  role: { name: string } | null;
  scriptsWritten: { id: string }[];
  videosAssigned: { id: string }[];
  videosCreated: { id: string }[];
  platformTasks: { id: string }[];
};

export function PendingMembersList({ members }: { members: MemberProgressItem[] }) {
  const [selectedMember, setSelectedMember] = useState<{ id: string; name: string } | null>(null);

  if (members.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No members yet. Create roles and members in Team Members to get started.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {members.map((member) => {
          const pendingScripts = member.videosAssigned.length;
          const scriptsToday = member.scriptsWritten.length;
          const videosToday = member.videosCreated.length;
          const postedToday = member.platformTasks.length;
          const totalDone = scriptsToday + videosToday + postedToday;

          return (
            <div
              key={member.id}
              onClick={() => setSelectedMember({ id: member.id, name: member.name })}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:border-zinc-200 hover:bg-zinc-50/80 cursor-pointer transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-[10px] font-semibold text-white flex-none shadow-sm shadow-pink-500/20 group-hover:scale-105 transition-transform">
                {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-zinc-900 group-hover:text-pink-600 transition-colors flex items-center gap-1.5">
                  {member.name}
                  <span className="text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity font-normal">
                    (click to view today)
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500">{member.role?.name || "No role"}</div>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <div className="text-center">
                  <div className="font-semibold text-amber-600">{pendingScripts}</div>
                  <div className="text-zinc-400">Pending</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-emerald-600">{totalDone}</div>
                  <div className="text-zinc-400">Done Today</div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-pink-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          );
        })}
      </div>

      {selectedMember && (
        <MemberDetailModal
          memberId={selectedMember.id}
          memberName={selectedMember.name}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </>
  );
}
