import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PendingMembersList } from "@/components/pending-members-list";

export default async function DashboardPage() {
  const session = await requireSession();

  // Get today's date range
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Stats
  const [
    totalChannels,
    totalScripts,
    totalVideos,
    pendingPlatformTasks,
    postedToday,
    recentActivity,
    memberProgress,
  ] = await Promise.all([
    db.channel.count(),
    db.script.count(),
    db.video.count(),
    db.platformTask.count({ where: { status: "PENDING" } }),
    db.platformTask.count({
      where: { status: "POSTED", postedAt: { gte: todayStart, lte: todayEnd } },
    }),
    db.activityLog.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    // Per-member progress
    db.user.findMany({
      where: { isBoss: false },
      select: {
        id: true,
        name: true,
        role: { select: { name: true } },
        scriptsWritten: {
          where: { createdAt: { gte: todayStart } },
          select: { id: true },
        },
        videosAssigned: {
          where: { status: "ASSIGNED", video: null },
          select: { id: true },
        },
        videosCreated: {
          where: { createdAt: { gte: todayStart } },
          select: { id: true },
        },
        platformTasks: {
          where: { status: "POSTED", postedAt: { gte: todayStart } },
          select: { id: true },
        },
      },
    }),
  ]);

  const actionColors: Record<string, string> = {
    CREATED_CHANNEL: "bg-blue-500",
    CREATED_SCRIPT: "bg-purple-500",
    ASSIGNED_SCRIPT: "bg-yellow-500",
    SUBMITTED_VIDEO: "bg-green-500",
    POSTED_VIDEO: "bg-pink-500",
    CREATED_MEMBER: "bg-cyan-500",
    CREATED_ROLE: "bg-indigo-500",
    DELETED_CHANNEL: "bg-red-500",
    default: "bg-zinc-500",
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-zinc-900 mb-0.5">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {session.name.split(" ")[0]}
          </h1>
          <p className="text-[13px] text-zinc-500">Here&apos;s what&apos;s happening across your channels today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Channels" value={totalChannels} color="pink" />
        <StatCard label="Total Scripts" value={totalScripts} color="purple" />
        <StatCard label="Videos Made" value={totalVideos} color="blue" />
        <StatCard label="Posted Today" value={postedToday} color="green" />
      </div>

      <div className="grid grid-cols-[1fr_380px] gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Pending Overview */}
          <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-zinc-900">Pending Work</h3>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                {pendingPlatformTasks} platform tasks pending
              </span>
            </div>
            <div className="px-5 py-4">
              <PendingMembersList members={memberProgress} />
            </div>
          </div>
        </div>

        {/* Right Column — Activity */}
        <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100">
            <h3 className="text-[13px] font-bold text-zinc-900">Recent Activity</h3>
          </div>
          <div className="px-5 py-2 max-h-[500px] overflow-y-auto">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-zinc-500 py-4">No activity yet.</p>
            ) : (
              recentActivity.map((log) => (
                <div key={log.id} className="flex gap-2.5 py-2.5 border-b border-zinc-100 last:border-0">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-none ${actionColors[log.action] || actionColors.default}`} />
                  <div>
                    <div className="text-xs text-zinc-700">
                      <strong className="text-zinc-900 font-semibold">{log.user.name}</strong>{" "}
                      {log.details || log.action.toLowerCase().replace(/_/g, " ")}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      {timeAgo(log.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    pink: "from-pink-500/10 to-transparent",
    purple: "from-purple-500/10 to-transparent",
    blue: "from-blue-500/10 to-transparent",
    green: "from-green-500/10 to-transparent",
  };
  const textColors: Record<string, string> = {
    pink: "text-pink-600",
    purple: "text-purple-600",
    blue: "text-blue-600",
    green: "text-emerald-600",
  };

  return (
    <div className="relative p-5 rounded-xl bg-white border border-zinc-200 shadow-sm overflow-hidden hover:border-zinc-300 hover:shadow transition-all">
      <div className={`absolute inset-0 bg-gradient-to-br ${colors[color]} pointer-events-none`} />
      <div className="relative">
        <div className="text-xs font-medium text-zinc-500 mb-2">{label}</div>
        <div className={`text-[28px] font-bold ${textColors[color]}`}>{value}</div>
      </div>
    </div>
  );
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
