"use server";

import { db } from "@/lib/db";
import { requirePermission, requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";

export async function getScripts() {
  const session = await requireSession();
  return db.script.findMany({
    include: {
      channel: true,
      writer: { select: { id: true, name: true } },
      videoMaker: { select: { id: true, name: true } },
      video: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getVideoMakers() {
  // Users with "make_videos" permission
  return db.user.findMany({
    where: {
      role: { permissions: { has: "make_videos" } },
    },
    select: { id: true, name: true, email: true },
  });
}

export async function createScript(_prev: unknown, formData: FormData) {
  await requirePermission("write_scripts");
  const session = await requireSession();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const channelId = formData.get("channelId") as string;
  const videoMakerId = formData.get("videoMakerId") as string;

  // Parse extra fields
  const extraFieldsJson = formData.get("extraFields") as string;
  let extraFields = null;
  if (extraFieldsJson) {
    try { extraFields = JSON.parse(extraFieldsJson); } catch { /* ignore */ }
  }

  if (!title?.trim()) return { error: "Title is required" };
  if (!content?.trim()) return { error: "Script content is required" };
  if (!channelId) return { error: "Select a channel" };

  try {
    await db.script.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        extraFields,
        channelId,
        writerId: session.id,
        videoMakerId: videoMakerId || null,
        status: videoMakerId ? "ASSIGNED" : "DRAFT",
      },
    });

    const details = videoMakerId
      ? `Created & assigned script: ${title}`
      : `Created script: ${title}`;
    await logActivity("CREATED_SCRIPT", details);
    revalidatePath("/scripts");
    revalidatePath("/videos");
    return { success: true };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function assignScript(scriptId: string, videoMakerId: string) {
  await requirePermission("write_scripts");

  const script = await db.script.update({
    where: { id: scriptId },
    data: { videoMakerId, status: "ASSIGNED" },
  });
  await logActivity("ASSIGNED_SCRIPT", `Assigned script: ${script.title}`);
  revalidatePath("/scripts");
  revalidatePath("/videos");
}
