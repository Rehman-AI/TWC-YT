"use server";

import { db } from "@/lib/db";
import { requirePermission, requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";

export async function getAssignedScripts() {
  const session = await requireSession();
  const where = session.isBoss
    ? { status: "ASSIGNED", video: null }
    : { videoMakerId: session.id, status: "ASSIGNED", video: null };

  return db.script.findMany({
    where,
    include: {
      channel: { include: { platforms: true } },
      writer: { select: { name: true } },
      videoMaker: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" }, // Oldest first (overdue first)
  });
}

export async function getCompletedVideos() {
  const session = await requireSession();
  const where = session.isBoss ? {} : { videoMakerId: session.id };

  return db.video.findMany({
    where,
    include: {
      script: { include: { channel: true } },
      videoMaker: { select: { id: true, name: true } },
      platformTasks: { include: { channelPlatform: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllVideoMakers() {
  const session = await requireSession();
  if (!session.isBoss) return [];
  return db.user.findMany({
    where: {
      OR: [
        { isBoss: false },
        { videosAssigned: { some: {} } },
        { videosCreated: { some: {} } },
      ],
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function submitVideo(_prev: unknown, formData: FormData) {
  await requirePermission("make_videos");
  const session = await requireSession();

  const scriptId = formData.get("scriptId") as string;
  const capCutLink = formData.get("capCutLink") as string;

  if (!scriptId) return { error: "Script ID is required" };
  if (!capCutLink?.trim()) return { error: "CapCut link is required" };

  // Verify script is assigned to this user
  const script = await db.script.findUnique({
    where: { id: scriptId },
    include: { channel: { include: { platforms: true } } },
  });

  if (!script) return { error: "Script not found" };
  if (script.videoMakerId !== session.id && !session.isBoss) {
    return { error: "This script is not assigned to you" };
  }
  if (script.status === "VIDEO_DONE") {
    return { error: "Video already submitted for this script" };
  }

  try {
    // Create video AND auto-create platform tasks in one transaction
    await db.$transaction(async (tx) => {
      // 1. Create the video
      const video = await tx.video.create({
        data: {
          scriptId,
          capCutLink: capCutLink.trim(),
          videoMakerId: session.id,
        },
      });

      // 2. Auto-create one platform task per enabled channel platform
      if (script.channel.platforms.length > 0) {
        await tx.platformTask.createMany({
          data: script.channel.platforms.map((platform) => ({
            videoId: video.id,
            channelPlatformId: platform.id,
            status: "PENDING",
          })),
        });
      }

      // 3. Update script status
      await tx.script.update({
        where: { id: scriptId },
        data: { status: "VIDEO_DONE" },
      });
    });

    await logActivity(
      "SUBMITTED_VIDEO",
      `Submitted video for: ${script.title} (${script.channel.platforms.length} platform tasks created)`
    );
    revalidatePath("/videos");
    revalidatePath("/platform-tasks");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function updateVideoLink(_prev: unknown, formData: FormData) {
  await requirePermission("make_videos");
  const session = await requireSession();

  const videoId = formData.get("videoId") as string;
  const capCutLink = formData.get("capCutLink") as string;

  if (!videoId) return { error: "Video ID is required" };
  if (!capCutLink?.trim()) return { error: "CapCut link is required" };

  try {
    const video = await db.video.findUnique({
      where: { id: videoId },
      include: { script: true },
    });

    if (!video) return { error: "Video not found" };
    if (video.videoMakerId !== session.id && !session.isBoss) {
      return { error: "You cannot edit this video" };
    }

    await db.video.update({
      where: { id: videoId },
      data: { capCutLink: capCutLink.trim() },
    });

    await logActivity("UPDATED_VIDEO", `Updated CapCut link for: ${video.script.title}`);
    revalidatePath("/videos");
    revalidatePath("/platform-tasks");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

