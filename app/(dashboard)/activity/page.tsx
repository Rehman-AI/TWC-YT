import { requirePermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { WORK_ACTIONS } from "@/lib/activity";
import { ActivityClient } from "./client";

export default async function ActivityPage() {
  await requirePermission("view_all_progress");

  const [logs, rawUsers] = await Promise.all([
    db.activityLog.findMany({
      where: { action: { in: [...WORK_ACTIONS] } },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 150,
    }),
    db.user.findMany({
      select: { id: true, name: true, isBoss: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const users = rawUsers.map((u) => ({
    id: u.id,
    name: u.isBoss ? "Sami" : u.name,
    isBoss: u.isBoss,
  }));

  return <ActivityClient logs={logs} users={users} />;
}
