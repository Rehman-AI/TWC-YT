"use client";

import { useEffect, useState } from "react";
import { getMemberDailySummary } from "@/app/actions/members";
import { X, CheckCircle, Clock, FileText, Video as VideoIcon, Share2, Activity, ExternalLink } from "lucide-react";

type MemberSummary = Awaited<ReturnType<typeof getMemberDailySummary>>;

export function MemberDetailModal({
  memberId,
  memberName,
  onClose,
}: {
  memberId: string;
  memberName: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<MemberSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"done" | "pending" | "activity">("done");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    getMemberDailySummary(memberId)
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err?.message || "Failed to load member daily data");
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [memberId]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#0f0f13] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between bg-[#141419]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#8c0f60] to-[#e8227a] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-pink-500/20">
              {memberName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{data?.member.name || memberName}</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  {data?.member.roleName || "Team Member"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{data?.member.email || "Loading member..."}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-zinc-400">Loading today&apos;s activity...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          ) : data ? (
            <>
              {/* Daily Stat Cards */}
              <div className="grid grid-cols-4 gap-2.5">
                <div className="p-3 bg-[#16161d] border border-white/[0.05] rounded-xl text-center">
                  <div className="text-[11px] font-medium text-zinc-400">Done Today</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">{data.todayStats.totalDoneToday}</div>
                </div>
                <div className="p-3 bg-[#16161d] border border-white/[0.05] rounded-xl text-center">
                  <div className="text-[11px] font-medium text-zinc-400">Scripts Today</div>
                  <div className="text-xl font-bold text-purple-400 mt-1">{data.todayStats.scriptsWrittenCount}</div>
                </div>
                <div className="p-3 bg-[#16161d] border border-white/[0.05] rounded-xl text-center">
                  <div className="text-[11px] font-medium text-zinc-400">Videos Today</div>
                  <div className="text-xl font-bold text-blue-400 mt-1">{data.todayStats.videosDoneCount}</div>
                </div>
                <div className="p-3 bg-[#16161d] border border-white/[0.05] rounded-xl text-center">
                  <div className="text-[11px] font-medium text-zinc-400">Tasks Pending</div>
                  <div className="text-xl font-bold text-amber-400 mt-1">{data.todayStats.pendingTasksCount}</div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-white/[0.06] pb-2 text-xs">
                <button
                  onClick={() => setActiveTab("done")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    activeTab === "done"
                      ? "bg-white/[0.08] text-white"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]"
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Completed Today ({data.todayStats.totalDoneToday})
                </button>
                <button
                  onClick={() => setActiveTab("pending")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    activeTab === "pending"
                      ? "bg-white/[0.08] text-white"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Assigned & Pending ({data.todayStats.pendingTasksCount})
                </button>
                <button
                  onClick={() => setActiveTab("activity")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    activeTab === "activity"
                      ? "bg-white/[0.08] text-white"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-pink-400" />
                  Today&apos;s Log ({data.activityToday.length})
                </button>
              </div>

              {/* Tab 1: Completed Today */}
              {activeTab === "done" && (
                <div className="space-y-4">
                  {/* Scripts Done */}
                  <div>
                    <div className="text-[11px] font-semibold tracking-wider uppercase text-zinc-500 mb-2 flex items-center gap-1.5">
                      <FileText className="w-3 h-3 text-purple-400" />
                      Scripts Written Today ({data.scriptsWrittenToday.length})
                    </div>
                    {data.scriptsWrittenToday.length === 0 ? (
                      <div className="p-3 rounded-lg bg-[#141419] border border-white/[0.03] text-xs text-zinc-500">
                        No scripts written today.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {data.scriptsWrittenToday.map((s) => (
                          <div
                            key={s.id}
                            className="p-3 rounded-lg bg-[#141419] border border-white/[0.04] flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-medium text-white">{s.title}</div>
                              <div className="text-[11px] text-zinc-500 mt-0.5">Channel: {s.channelName}</div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              {s.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Videos Done */}
                  <div>
                    <div className="text-[11px] font-semibold tracking-wider uppercase text-zinc-500 mb-2 flex items-center gap-1.5">
                      <VideoIcon className="w-3 h-3 text-blue-400" />
                      Videos Produced Today ({data.videosDoneToday.length})
                    </div>
                    {data.videosDoneToday.length === 0 ? (
                      <div className="p-3 rounded-lg bg-[#141419] border border-white/[0.03] text-xs text-zinc-500">
                        No videos produced today.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {data.videosDoneToday.map((v) => (
                          <div
                            key={v.id}
                            className="p-3 rounded-lg bg-[#141419] border border-white/[0.04] flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-medium text-white">{v.title}</div>
                              <div className="text-[11px] text-zinc-500 mt-0.5">Channel: {v.channelName}</div>
                            </div>
                            {v.capCutLink && (
                              <a
                                href={v.capCutLink}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20"
                              >
                                CapCut Link
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tasks Posted */}
                  <div>
                    <div className="text-[11px] font-semibold tracking-wider uppercase text-zinc-500 mb-2 flex items-center gap-1.5">
                      <Share2 className="w-3 h-3 text-emerald-400" />
                      Platforms Posted Today ({data.platformTasksPostedToday.length})
                    </div>
                    {data.platformTasksPostedToday.length === 0 ? (
                      <div className="p-3 rounded-lg bg-[#141419] border border-white/[0.03] text-xs text-zinc-500">
                        No platform posts today.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {data.platformTasksPostedToday.map((pt) => (
                          <div
                            key={pt.id}
                            className="p-3 rounded-lg bg-[#141419] border border-white/[0.04] flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-medium text-white">{pt.title}</div>
                              <div className="text-[11px] text-zinc-500 mt-0.5">
                                Channel: {pt.channelName} • Platform: <span className="text-emerald-400 uppercase font-semibold">{pt.platform}</span>
                              </div>
                            </div>
                            {pt.postedUrl && (
                              <a
                                href={pt.postedUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20"
                              >
                                View Post
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Assigned & Pending */}
              {activeTab === "pending" && (
                <div className="space-y-4">
                  <div>
                    <div className="text-[11px] font-semibold tracking-wider uppercase text-zinc-500 mb-2 flex items-center gap-1.5">
                      <VideoIcon className="w-3 h-3 text-amber-400" />
                      Scripts Assigned for Video Making ({data.pendingScripts.length})
                    </div>
                    {data.pendingScripts.length === 0 ? (
                      <div className="p-3 rounded-lg bg-[#141419] border border-white/[0.03] text-xs text-zinc-500">
                        No pending scripts assigned.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {data.pendingScripts.map((s) => (
                          <div
                            key={s.id}
                            className="p-3 rounded-lg bg-[#141419] border border-white/[0.04] flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-medium text-white">{s.title}</div>
                              <div className="text-[11px] text-zinc-500 mt-0.5">
                                Channel: {s.channelName} • Writer: {s.writerName}
                              </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                              Awaiting Video
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold tracking-wider uppercase text-zinc-500 mb-2 flex items-center gap-1.5">
                      <Share2 className="w-3 h-3 text-amber-400" />
                      Platform Tasks Awaiting Upload ({data.pendingPlatformTasks.length})
                    </div>
                    {data.pendingPlatformTasks.length === 0 ? (
                      <div className="p-3 rounded-lg bg-[#141419] border border-white/[0.03] text-xs text-zinc-500">
                        No pending upload tasks.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {data.pendingPlatformTasks.map((pt) => (
                          <div
                            key={pt.id}
                            className="p-3 rounded-lg bg-[#141419] border border-white/[0.04] flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-medium text-white">{pt.title}</div>
                              <div className="text-[11px] text-zinc-500 mt-0.5">
                                Channel: {pt.channelName} • Platform: <span className="text-pink-400 uppercase font-semibold">{pt.platform}</span>
                              </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                              Pending Post
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Today's Log */}
              {activeTab === "activity" && (
                <div className="space-y-2">
                  {data.activityToday.length === 0 ? (
                    <div className="p-3 rounded-lg bg-[#141419] border border-white/[0.03] text-xs text-zinc-500 text-center py-8">
                      No activity recorded for this member today yet.
                    </div>
                  ) : (
                    data.activityToday.map((act) => (
                      <div
                        key={act.id}
                        className="p-3 rounded-lg bg-[#141419] border border-white/[0.04] flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs text-zinc-200">{act.details || act.action}</div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">
                            {new Date(act.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                          {act.action}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.06] bg-[#141419] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
