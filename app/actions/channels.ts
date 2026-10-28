"use server";

import { db } from "@/lib/db";
import { requirePermission, requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";

export async function getChannels() {
  return db.channel.findMany({
    include: {
      platforms: {
        include: {
          platformTasks: {
            select: { id: true, status: true },
          },
        },
      },
      createdBy: { select: { name: true } },
      _count: { select: { scripts: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getChannel(id: string) {
  return db.channel.findUnique({
    where: { id },
    include: { platforms: true },
  });
}

export async function createChannel(_prev: unknown, formData: FormData) {
  await requirePermission("manage_channels");
  const session = await requireSession();

  const name = formData.get("name") as string;
  const idea = formData.get("idea") as string;
  const videoLength = formData.get("videoLength") as string;
  const platforms = formData.getAll("platforms") as string[];
  const uploadsStr = formData.get("uploads") as string;
  const uploads = parseInt(uploadsStr) || 1;

  if (!name?.trim()) return { error: "Channel name is required" };
  if (platforms.length === 0) return { error: "Select at least one platform" };

  try {
    await db.channel.create({
      data: {
        name: name.trim(),
        idea: idea?.trim() || null,
        videoLength: videoLength || "1 min",
        createdById: session.id,
        platforms: {
          create: platforms.map((p) => ({
            platformName: p,
            uploadsPerDay: uploads,
          })),
        },
      },
    });
    await logActivity("CREATED_CHANNEL", `Created channel: ${name}`);
    revalidatePath("/channels");
    return { success: true };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function updateChannel(_prev: unknown, formData: FormData) {
  await requirePermission("manage_channels");

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const idea = formData.get("idea") as string;
  const videoLength = formData.get("videoLength") as string;
  const platforms = formData.getAll("platforms") as string[];
  const uploadsStr = formData.get("uploads") as string;
  const uploads = parseInt(uploadsStr) || 1;

  if (!name?.trim()) return { error: "Channel name is required" };

  try {
    // Update channel
    await db.channel.update({
      where: { id },
      data: {
        name: name.trim(),
        idea: idea?.trim() || null,
        videoLength: videoLength || "1 min",
      },
    });

    // Replace platforms
    await db.channelPlatform.deleteMany({ where: { channelId: id } });
    if (platforms.length > 0) {
      await db.channelPlatform.createMany({
        data: platforms.map((p) => ({
          channelId: id,
          platformName: p,
          uploadsPerDay: uploads,
        })),
      });
    }

    await logActivity("UPDATED_CHANNEL", `Updated channel: ${name}`);
    revalidatePath("/channels");
    return { success: true };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function deleteChannel(id: string) {
  // Boss-only — this is enforced server-side
  const session = await requireSession();
  if (!session.isBoss) {
    throw new Error("Only Boss can delete channels");
  }

  const channel = await db.channel.findUnique({ where: { id } });
  await db.channel.delete({ where: { id } });
  await logActivity("DELETED_CHANNEL", `Deleted channel: ${channel?.name}`);
  revalidatePath("/channels");
}
