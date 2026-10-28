import { requirePermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { WORK_ACTIONS } from "@/lib/activity";

export default async function ActivityPage() {
  await requirePermission("view_all_progress");

  const logs = await db.activityLog.findMany({
    where: { action: { in: [...WORK_ACTIONS] } },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900">Activity Log</h1>
        <p className="text-sm text-zinc-500">Complete audit trail of all actions</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        {logs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-zinc-500">No activity recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-zinc-50/80 transition-colors">
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-none ${actionColors[log.action] || "bg-zinc-400"}`} />
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
