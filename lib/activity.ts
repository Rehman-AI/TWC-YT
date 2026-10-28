import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const WORK_ACTIONS = [
  "CREATED_SCRIPT",
  "ASSIGNED_SCRIPT",
  "UPDATED_SCRIPT",
  "SUBMITTED_VIDEO",
  "UPDATED_VIDEO",
  "POSTED_VIDEO",
  "UPDATED_POST",
  "CREATED_CHANNEL",
  "UPDATED_CHANNEL",
] as const;

export type WorkAction = (typeof WORK_ACTIONS)[number];

export async function logActivity(action: string, details?: string) {
  // Only log genuine work-related actions
  if (!WORK_ACTIONS.includes(action as WorkAction)) {
    return;
  }

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

