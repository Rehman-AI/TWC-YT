"use client";

import { useState, useMemo } from "react";
import { Filter } from "lucide-react";
import { useLiveSync } from "@/hooks/use-live-sync";

type LogItem = {
  id: string;
  action: string;
  details: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
  };
};

type UserOption = {
  id: string;
  name: string;
  isBoss: boolean;
};

const actionColors: Record<string, string> = {
  CREATED_CHANNEL: "bg-blue-500",
  UPDATED_CHANNEL: "bg-sky-500",
  CREATED_SCRIPT: "bg-purple-500",
  ASSIGNED_SCRIPT: "bg-amber-500",
  UPDATED_SCRIPT: "bg-indigo-500",
  SUBMITTED_VIDEO: "bg-emerald-500",
  UPDATED_VIDEO: "bg-teal-500",
  POSTED_VIDEO: "bg-pink-500",
  UPDATED_POST: "bg-rose-500",
};

export function ActivityClient({
  logs,
  users,
}: {
  logs: LogItem[];
  users: UserOption[];
}) {
  const [selectedMember, setSelectedMember] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<"ALL" | "TODAY" | "7D" | "30D">("ALL");

  // Auto-sync every 4.5 seconds
  useLiveSync(4500);

  const filteredLogs = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

    return logs.filter((log) => {
      // 1. Member filter
      if (selectedMember !== "ALL") {
        if (log.user.id !== selectedMember) return false;
      }

      // 2. Date filter
      const logTime = new Date(log.createdAt).getTime();
      if (dateFilter === "TODAY" && logTime < todayStart) return false;
      if (dateFilter === "7D" && logTime < sevenDaysAgo) return false;
      if (dateFilter === "30D" && logTime < thirtyDaysAgo) return false;

      return true;
    });
  }, [logs, selectedMember, dateFilter]);

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-lg font-bold text-zinc-900">Activity Log</h1>
        <p className="text-xs text-zinc-500">Live audit trail of genuine content production events</p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-2.5 mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-zinc-400" /> Filter:
          </span>

          {/* Member Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="px-2.5 py-1 bg-zinc-50 border border-zinc-200 rounded-md text-[11px] text-zinc-700 font-medium focus:outline-none focus:border-pink-500/50"
            >
              <option value="ALL">All Members</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.isBoss ? "(Boss)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter Pills */}
          <div className="flex items-center gap-1">
            {(
              [
                { key: "ALL", label: "All Time" },
                { key: "TODAY", label: "Today" },
                { key: "7D", label: "Last 7 Days" },
                { key: "30D", label: "Last 30 Days" },
              ] as const
            ).map((df) => (
              <button
                key={df.key}
                type="button"
                onClick={() => setDateFilter(df.key)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  dateFilter === df.key
                    ? "bg-zinc-900 text-white shadow-xs"
                    : "bg-zinc-50 text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                {df.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Filters & Count */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-400">
            Showing {filteredLogs.length} of {logs.length}
          </span>
          {(selectedMember !== "ALL" || dateFilter !== "ALL") && (
            <button
              onClick={() => {
                setSelectedMember("ALL");
                setDateFilter("ALL");
              }}
              className="text-[11px] text-pink-600 hover:text-pink-700 font-semibold"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Log Feed List */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xs text-zinc-400">No activity recorded matching these filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-50/80 transition-colors"
              >
                <span
                  className={`w-2 h-2 rounded-full mt-1.5 flex-none ${
                    actionColors[log.action] || "bg-zinc-400"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-zinc-600 leading-relaxed">
                    <strong className="text-zinc-900 font-semibold">{log.user.name}</strong>{" "}
                    {log.details || log.action.toLowerCase().replace(/_/g, " ")}
                  </div>
                </div>
                <div className="text-[11px] text-zinc-400 font-medium flex-none">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
