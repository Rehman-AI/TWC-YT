"use server";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";

export async function getChannelVideoMatrix() {
  const session = await requireSession();

  const platformPerms: Record<string, string> = {
    post_youtube: "youtube",
    post_tiktok: "tiktok",
    post_facebook: "facebook",
    post_snapchat: "snapchat",
    post_instagram: "instagram",
  };

  const userAllowedPlatforms = session.isBoss
    ? Object.values(platformPerms)
    : Object.entries(platformPerms)
        .filter(([perm]) => session.permissions.includes(perm))
        .map(([, plat]) => plat);

  const channels = await db.channel.findMany({
    include: {
      platforms: true,
      scripts: {
        where: { video: { isNot: null } },
        include: {
          video: {
            include: {
              platformTasks: {
                include: {
                  channelPlatform: true,
                  assignedTo: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return {
    isBoss: session.isBoss,
    userAllowedPlatforms,
    channels: channels.map((ch) => ({
      id: ch.id,
      name: ch.name,
      idea: ch.idea,
      enabledPlatforms: ch.platforms.map((p) => p.platformName),
      videos: ch.scripts
        .filter((s) => s.video !== null)
        .map((s) => ({
          videoId: s.video!.id,
          scriptId: s.id,
          title: s.title,
          capCutLink: s.video!.capCutLink,
          createdAt: s.video!.createdAt.toISOString(),
          tasks: s.video!.platformTasks.map((t) => ({
            id: t.id,
            platformName: t.channelPlatform.platformName,
            status: t.status,
            postedUrl: t.postedUrl,
            postedAt: t.postedAt ? t.postedAt.toISOString() : null,
            assignedToName: t.assignedTo?.name || null,
          })),
        })),
    })),
  };
}

export async function getPlatformTasks() {
  const session = await requireSession();

  // Determine which platforms this user can post to
  const platformPerms: Record<string, string> = {
    post_youtube: "youtube",
    post_tiktok: "tiktok",
    post_facebook: "facebook",
    post_snapchat: "snapchat",
    post_instagram: "instagram",
  };

  let platformFilter: string[] = [];

  if (session.isBoss) {
    // Boss sees all platforms
    platformFilter = Object.values(platformPerms);
  } else {
    // Filter by user's permissions
    for (const [perm, platform] of Object.entries(platformPerms)) {
      if (session.permissions.includes(perm)) {
        platformFilter.push(platform);
      }
    }
  }

  if (platformFilter.length === 0) return [];

  return db.platformTask.findMany({
    where: {
      channelPlatform: { platformName: { in: platformFilter } },
    },
    include: {
      video: {
        include: {
          script: { include: { channel: true } },
        },
      },
      channelPlatform: true,
      assignedTo: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function markAsPosted(_prev: unknown, formData: FormData) {
  const session = await requireSession();

  const taskId = formData.get("taskId") as string;
  const postedUrl = formData.get("postedUrl") as string;

  if (!taskId) return { error: "Task ID is required" };
  if (!postedUrl?.trim()) return { error: "Posted URL is required" };

  // Verify the task exists and user has permission for this platform
  const task = await db.platformTask.findUnique({
    where: { id: taskId },
    include: {
      channelPlatform: true,
      video: { include: { script: true } },
    },
  });

  if (!task) return { error: "Task not found" };

  const platformPerm = `post_${task.channelPlatform.platformName}`;
  if (!session.isBoss && !session.permissions.includes(platformPerm)) {
    return { error: "You don't have permission for this platform" };
  }

  try {
    await db.platformTask.update({
      where: { id: taskId },
      data: {
        status: "POSTED",
        postedUrl: postedUrl.trim(),
        postedAt: new Date(),
        assignedToId: session.id,
      },
    });

    await logActivity(
      "POSTED_VIDEO",
      `Posted "${task.video.script.title}" to ${task.channelPlatform.platformName}: ${postedUrl}`
    );
    revalidatePath("/platform-tasks");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function updatePostedLink(_prev: unknown, formData: FormData) {
  const session = await requireSession();

  const taskId = formData.get("taskId") as string;
  const postedUrl = formData.get("postedUrl") as string;

  if (!taskId) return { error: "Task ID is required" };
  if (!postedUrl?.trim()) return { error: "Posted URL is required" };

  const task = await db.platformTask.findUnique({
    where: { id: taskId },
    include: {
      channelPlatform: true,
      video: { include: { script: true } },
    },
  });

  if (!task) return { error: "Task not found" };

  const platformPerm = `post_${task.channelPlatform.platformName}`;
  if (!session.isBoss && !session.permissions.includes(platformPerm)) {
    return { error: "You don't have permission for this platform" };
  }

  try {
    await db.platformTask.update({
      where: { id: taskId },
      data: {
        postedUrl: postedUrl.trim(),
      },
    });

    await logActivity(
      "UPDATED_POST",
      `Updated link for "${task.video.script.title}" on ${task.channelPlatform.platformName}: ${postedUrl.trim()}`
    );
    revalidatePath("/platform-tasks");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

