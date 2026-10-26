import { requirePermission } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function ActivityPage() {
  await requirePermission("view_all_progress");

  const logs = await db.activityLog.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const actionColors: Record<string, string> = {
    CREATED_CHANNEL: "bg-blue-500",
    UPDATED_CHANNEL: "bg-blue-400",
    DELETED_CHANNEL: "bg-red-500",
    CREATED_SCRIPT: "bg-purple-500",
    ASSIGNED_SCRIPT: "bg-yellow-500",
    SUBMITTED_VIDEO: "bg-green-500",
    POSTED_VIDEO: "bg-pink-500",
    CREATED_MEMBER: "bg-cyan-500",
    UPDATED_MEMBER: "bg-cyan-400",
    DELETED_MEMBER: "bg-red-400",
    CREATED_ROLE: "bg-indigo-500",
    UPDATED_ROLE: "bg-indigo-400",
    DELETED_ROLE: "bg-red-400",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Activity Log</h1>
        <p className="text-sm text-zinc-500">Complete audit trail of all actions</p>
      </div>

      <div className="bg-[#111114] border border-white/[0.06] rounded-xl overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-zinc-500">No activity recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 px-5 py-3 hover:bg-white/[0.01] transition-colors">
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-none ${actionColors[log.action] || "bg-zinc-500"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-zinc-300">
                    <strong className="text-white font-medium">{log.user.name}</strong>{" "}
                    {log.details || log.action.toLowerCase().replace(/_/g, " ")}
                  </div>
                </div>
                <div className="text-[10px] text-zinc-600 flex-none">
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
