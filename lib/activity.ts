"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

type LogAction = string;

export async function logActivity(action: LogAction, details?: string) {
  const session = await getSession();
  if (!session) return;

  await db.activityLog.create({
    data: {
      userId: session.id,
      action,
      details,
    },
  });
}
