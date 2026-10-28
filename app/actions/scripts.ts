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

export async function updateScript(_prev: unknown, formData: FormData) {
  await requirePermission("write_scripts");
  const session = await requireSession();

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const channelId = formData.get("channelId") as string;
  const videoMakerId = formData.get("videoMakerId") as string;

  const extraFieldsJson = formData.get("extraFields") as string;
  let extraFields = null;
  if (extraFieldsJson) {
    try { extraFields = JSON.parse(extraFieldsJson); } catch { /* ignore */ }
  }

  if (!id) return { error: "Script ID is required" };
  if (!title?.trim()) return { error: "Title is required" };
  if (!content?.trim()) return { error: "Script content is required" };

  try {
    const existing = await db.script.findUnique({ where: { id } });
    if (!existing) return { error: "Script not found" };

    const requestedStatus = formData.get("status") as string;
    const capCutLink = (formData.get("capCutLink") as string)?.trim();

    let finalStatus = existing.status;
    if (requestedStatus && ["DRAFT", "ASSIGNED", "VIDEO_DONE"].includes(requestedStatus)) {
      finalStatus = requestedStatus;
    } else if (existing.status === "DRAFT" && videoMakerId) {
      finalStatus = "ASSIGNED";
    }

    // If moving to VIDEO_DONE and CapCut link is provided without an existing video, create video + platform tasks
    if (finalStatus === "VIDEO_DONE" && capCutLink) {
      const existingVideo = await db.video.findUnique({ where: { scriptId: id } });
      if (!existingVideo) {
        const scriptChannel = await db.channel.findUnique({
          where: { id: channelId || existing.channelId },
          include: { platforms: true },
        });

        await db.$transaction(async (tx) => {
          const video = await tx.video.create({
            data: {
              scriptId: id,
              capCutLink,
              videoMakerId: videoMakerId || existing.videoMakerId || session.id,
            },
          });

          if (scriptChannel && scriptChannel.platforms.length > 0) {
            await tx.platformTask.createMany({
              data: scriptChannel.platforms.map((platform) => ({
                videoId: video.id,
                channelPlatformId: platform.id,
                status: "PENDING",
              })),
            });
          }
        });
      }
    }

    await db.script.update({
      where: { id },
      data: {
        title: title.trim(),
        content: content.trim(),
        channelId: channelId || existing.channelId,
        videoMakerId: videoMakerId || null,
        extraFields,
        status: finalStatus,
      },
    });

    const statusNote = finalStatus !== existing.status ? ` (Status: ${existing.status} -> ${finalStatus})` : "";
    await logActivity("UPDATED_SCRIPT", `Updated script: ${title.trim()}${statusNote}`);
    revalidatePath("/scripts");
    revalidatePath("/videos");
    revalidatePath("/dashboard");
    revalidatePath("/platform-tasks");
    return { success: true };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

