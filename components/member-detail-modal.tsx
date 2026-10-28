"use client";

import { useEffect, useState } from "react";
import { getMemberDailySummary } from "@/app/actions/members";
import {
  X,
  CheckCircle,
  Clock,
  FileText,
  Video as VideoIcon,
  Share2,
  Activity,
  ExternalLink,
  Calendar,
  TrendingUp,
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"breakdown" | "pending" | "done" | "activity">("breakdown");
  const [breakdownDays, setBreakdownDays] = useState<7 | 30>(7);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8c0f60] to-[#e8227a] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-pink-500/20">
              {memberName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-900">{data?.member.name || memberName}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-pink-50 text-pink-700 border border-pink-200">
                  {data?.member.roleName || "Team Member"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">{data?.member.email || "Loading member..."}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-zinc-500">Loading member progress report...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">
              {error}
            </div>
          ) : data ? (
            <>
              {/* Total Completed vs Total Assigned Metric Banner */}
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2.5 bg-zinc-50/80 border border-zinc-200/80 rounded-xl text-center">
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Total Assigned</div>
                  <div className="text-lg font-bold text-zinc-900 mt-0.5">{data.overviewStats.totalAssigned}</div>
                </div>
                <div className="p-2.5 bg-zinc-50/80 border border-zinc-200/80 rounded-xl text-center">
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Total Completed</div>
                  <div className="text-lg font-bold text-emerald-600 mt-0.5">{data.overviewStats.totalCompleted}</div>
                </div>
                <div className="p-2.5 bg-zinc-50/80 border border-zinc-200/80 rounded-xl text-center">
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Remaining Pending</div>
                  <div className="text-lg font-bold text-amber-600 mt-0.5">{data.overviewStats.pendingRemaining}</div>
                </div>
                <div className="p-2.5 bg-zinc-50/80 border border-zinc-200/80 rounded-xl text-center">
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Completion Rate</div>
                  <div className="text-lg font-bold text-purple-600 mt-0.5">{data.overviewStats.completionRate}%</div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center justify-between border-b border-zinc-200 pb-2 text-xs">
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    onClick={() => setActiveTab("breakdown")}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                      activeTab === "breakdown"
                        ? "bg-zinc-900 text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-pink-500" />
                    Daily Breakdown
                  </button>
                  <button
                    onClick={() => setActiveTab("pending")}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                      activeTab === "pending"
                        ? "bg-zinc-900 text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    Pending ({data.overviewStats.pendingRemaining})
                  </button>
                  <button
                    onClick={() => setActiveTab("done")}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                      activeTab === "done"
                        ? "bg-zinc-900 text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    Today Done ({data.todayStats.totalDoneToday})
                  </button>
                  <button
                    onClick={() => setActiveTab("activity")}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                      activeTab === "activity"
                        ? "bg-zinc-900 text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 text-blue-500" />
                    Log ({data.activityToday.length})
                  </button>
                </div>

                {activeTab === "breakdown" && (
                  <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
                    <button
                      onClick={() => setBreakdownDays(7)}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                        breakdownDays === 7 ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      Last 7 Days
                    </button>
                    <button
                      onClick={() => setBreakdownDays(30)}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                        breakdownDays === 30 ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      Last 30 Days
                    </button>
                  </div>
                )}
              </div>

              {/* Tab 1: Daily Breakdown (7/30 days) */}
              {activeTab === "breakdown" && (
                <div className="space-y-2">
                  <div className="text-[11px] text-zinc-500 flex items-center justify-between">
                    <span>Day-by-day work breakdown (last {breakdownDays} days)</span>
                    <span className="font-semibold text-zinc-800">
                      Total in range: {data.dailyBreakdown.slice(-breakdownDays).reduce((acc, d) => acc + d.total, 0)} completed
                    </span>
                  </div>
                  <div className="border border-zinc-200 rounded-xl overflow-hidden max-h-[320px] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-[10px] uppercase tracking-wider sticky top-0">
                        <tr>
                          <th className="px-3 py-2 font-semibold">Date</th>
                          <th className="px-3 py-2 font-semibold text-center">Scripts</th>
                          <th className="px-3 py-2 font-semibold text-center">Videos</th>
                          <th className="px-3 py-2 font-semibold text-center">Posts</th>
                          <th className="px-3 py-2 font-semibold text-right">Total Done</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {data.dailyBreakdown
                          .slice(-breakdownDays)
                          .reverse()
                          .map((day) => (
                            <tr key={day.date} className="hover:bg-zinc-50/80 transition-colors">
                              <td className="px-3 py-2 font-medium text-zinc-800 flex items-center gap-1.5">
                                <Calendar className="w-3 h-3 text-zinc-400" />
                                {day.label}
                              </td>
                              <td className="px-3 py-2 text-center text-purple-700 font-semibold">{day.scripts || "—"}</td>
                              <td className="px-3 py-2 text-center text-blue-700 font-semibold">{day.videos || "—"}</td>
                              <td className="px-3 py-2 text-center text-emerald-700 font-semibold">{day.posts || "—"}</td>
                              <td className="px-3 py-2 text-right">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    day.total > 0
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "text-zinc-400"
                                  }`}
                                >
                                  {day.total}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 2: Assigned & Remaining Pending */}
              {activeTab === "pending" && (
                <div className="space-y-3">
                  {/* Pending Scripts */}
                  <div>
                    <div className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                      <VideoIcon className="w-3 h-3 text-amber-600" />
                      Pending Scripts Assigned ({data.pendingScripts.length})
                    </div>
                    {data.pendingScripts.length === 0 ? (
                      <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-500 text-center">
                        No pending scripts assigned to make.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {data.pendingScripts.map((s) => (
                          <div
                            key={s.id}
                            className="p-2.5 rounded-lg bg-zinc-50/70 border border-zinc-200/80 flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-semibold text-zinc-900">{s.title}</div>
                              <div className="text-[10px] text-zinc-500">
                                Channel: {s.channelName} • Writer: {s.writerName}
                              </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                              Awaiting Video
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pending Platform Upload Tasks */}
                  <div>
                    <div className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                      <Share2 className="w-3 h-3 text-amber-600" />
                      Pending Platform Posts Awaiting Upload ({data.pendingPlatformTasks.length})
                    </div>
                    {data.pendingPlatformTasks.length === 0 ? (
                      <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-500 text-center">
                        No pending platform upload tasks.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {data.pendingPlatformTasks.map((pt) => (
                          <div
                            key={pt.id}
                            className="p-2.5 rounded-lg bg-zinc-50/70 border border-zinc-200/80 flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-semibold text-zinc-900">{pt.title}</div>
                              <div className="text-[10px] text-zinc-500">
                                Channel: {pt.channelName} • Platform: <span className="text-pink-600 uppercase font-semibold">{pt.platform}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {pt.capCutLink && (
                                <a
                                  href={pt.capCutLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                                >
                                  CapCut Video <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                                Pending Post
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Completed Today */}
              {activeTab === "done" && (
                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-3 h-3 text-purple-600" />
                      Scripts Written Today ({data.scriptsWrittenToday.length})
                    </div>
                    {data.scriptsWrittenToday.length === 0 ? (
                      <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-500 text-center">
                        No scripts written today.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {data.scriptsWrittenToday.map((s) => (
                          <div
                            key={s.id}
                            className="p-2.5 rounded-lg bg-zinc-50/70 border border-zinc-200/80 flex items-center justify-between"
                          >
                            <div className="text-xs font-semibold text-zinc-900">{s.title}</div>
                            <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-purple-50 text-purple-700 border border-purple-200">
                              {s.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                      <VideoIcon className="w-3 h-3 text-blue-600" />
                      Videos Produced Today ({data.videosDoneToday.length})
                    </div>
                    {data.videosDoneToday.length === 0 ? (
                      <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-500 text-center">
                        No videos produced today.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {data.videosDoneToday.map((v) => (
                          <div
                            key={v.id}
                            className="p-2.5 rounded-lg bg-zinc-50/70 border border-zinc-200/80 flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-semibold text-zinc-900">{v.title}</div>
                              <div className="text-[10px] text-zinc-500">Channel: {v.channelName}</div>
                            </div>
                            {v.capCutLink && (
                              <a
                                href={v.capCutLink}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded bg-blue-50 border border-blue-200"
                              >
                                CapCut <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                      <Share2 className="w-3 h-3 text-emerald-600" />
                      Platforms Posted Today ({data.platformTasksPostedToday.length})
                    </div>
                    {data.platformTasksPostedToday.length === 0 ? (
                      <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-500 text-center">
                        No platform posts today.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {data.platformTasksPostedToday.map((pt) => (
                          <div
                            key={pt.id}
                            className="p-2.5 rounded-lg bg-zinc-50/70 border border-zinc-200/80 flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-semibold text-zinc-900">{pt.title}</div>
                              <div className="text-[10px] text-zinc-500">
                                {pt.channelName} • <span className="text-emerald-700 uppercase font-semibold">{pt.platform}</span>
                              </div>
                            </div>
                            {pt.postedUrl && (
                              <a
                                href={pt.postedUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-[10px] text-emerald-700 hover:text-emerald-800 font-medium px-2 py-1 rounded bg-emerald-50 border border-emerald-200"
                              >
                                View Post <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 4: Today's Log */}
              {activeTab === "activity" && (
                <div className="space-y-1.5">
                  {data.activityToday.length === 0 ? (
                    <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-500 text-center">
                      No activity recorded for this member today yet.
                    </div>
                  ) : (
                    data.activityToday.map((act) => (
                      <div
                        key={act.id}
                        className="p-2 rounded-lg bg-zinc-50/70 border border-zinc-200/80 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-medium text-zinc-800">{act.details || act.action}</div>
                          <div className="text-[10px] text-zinc-400 mt-0.5">
                            {new Date(act.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 font-mono border border-zinc-200">
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
        <div className="p-3 border-t border-zinc-100 bg-zinc-50/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
