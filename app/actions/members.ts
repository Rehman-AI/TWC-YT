"use server";

import { db } from "@/lib/db";
import { requirePermission, requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";

export async function getMembers() {
  return db.user.findMany({
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createMember(_prev: unknown, formData: FormData) {
  await requirePermission("manage_members");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const roleId = formData.get("roleId") as string;

  if (!name?.trim() || !email?.trim() || !password) {
    return { error: "Name, email, and password are required" };
  }

  try {
    const hashed = await hash(password, 12);
    await db.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashed,
        roleId: roleId || null,
      },
    });
    await logActivity("CREATED_MEMBER", `Created member: ${name} (${email})`);
    revalidatePath("/members");
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("Unique")) return { error: "Email already exists" };
    return { error: msg };
  }
}

export async function updateMember(_prev: unknown, formData: FormData) {
  await requirePermission("manage_members");

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const roleId = formData.get("roleId") as string;
  const password = formData.get("password") as string;

  if (!name?.trim() || !email?.trim()) {
    return { error: "Name and email are required" };
  }

  const data: Record<string, unknown> = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    roleId: roleId || null,
  };

  if (password) {
    data.password = await hash(password, 12);
  }

  try {
    await db.user.update({ where: { id }, data });
    await logActivity("UPDATED_MEMBER", `Updated member: ${name}`);
    revalidatePath("/members");
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { error: msg };
  }
}

export async function deleteMember(id: string) {
  await requirePermission("manage_members");

  const user = await db.user.findUnique({ where: { id } });
  if (user?.isBoss) throw new Error("Cannot delete Boss account");

  await db.user.delete({ where: { id } });
  await logActivity("DELETED_MEMBER", `Deleted member: ${user?.name}`);
  revalidatePath("/members");
}

export async function getMemberDailySummary(memberId: string) {
  const session = await requireSession();
  // Any team member with permission or boss can view, or viewing own
  if (!session.isBoss && !session.permissions.includes("view_all_progress") && session.id !== memberId) {
    throw new Error("Permission denied");
  }

  const member = await db.user.findUnique({
    where: { id: memberId },
    include: { role: true },
  });

  if (!member) {
    throw new Error("Member not found");
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    scriptsWrittenToday,
    videosDoneToday,
    platformTasksPostedToday,
    pendingScripts,
    pendingPlatformTasks,
    activityToday,
  ] = await Promise.all([
    db.script.findMany({
      where: {
        writerId: memberId,
        createdAt: { gte: todayStart, lte: todayEnd },
      },
      include: { channel: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.video.findMany({
      where: {
        videoMakerId: memberId,
        createdAt: { gte: todayStart, lte: todayEnd },
      },
      include: {
        script: {
          select: {
            title: true,
            channel: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.platformTask.findMany({
      where: {
        assignedToId: memberId,
        status: "POSTED",
        postedAt: { gte: todayStart, lte: todayEnd },
      },
      include: {
        channelPlatform: {
          select: {
            platformName: true,
            channel: { select: { name: true } },
          },
        },
        video: {
          select: {
            script: { select: { title: true } },
          },
        },
      },
      orderBy: { postedAt: "desc" },
    }),
    db.script.findMany({
      where: {
        videoMakerId: memberId,
        status: "ASSIGNED",
      },
      include: {
        channel: { select: { name: true } },
        writer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.platformTask.findMany({
      where: {
        assignedToId: memberId,
        status: "PENDING",
      },
      include: {
        channelPlatform: {
          select: {
            platformName: true,
            channel: { select: { name: true } },
          },
        },
        video: {
          select: {
            capCutLink: true,
            script: { select: { title: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.activityLog.findMany({
      where: {
        userId: memberId,
        createdAt: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const totalDoneToday =
    scriptsWrittenToday.length + videosDoneToday.length + platformTasksPostedToday.length;
  const pendingTasksCount = pendingScripts.length + pendingPlatformTasks.length;

  return {
    member: {
      id: member.id,
      name: member.name,
      email: member.email,
      isBoss: member.isBoss,
      roleName: member.role?.name || (member.isBoss ? "Boss" : "Member"),
    },
    todayStats: {
      scriptsWrittenCount: scriptsWrittenToday.length,
      videosDoneCount: videosDoneToday.length,
      platformTasksPostedCount: platformTasksPostedToday.length,
      totalDoneToday,
      pendingTasksCount,
    },
    scriptsWrittenToday: scriptsWrittenToday.map((s) => ({
      id: s.id,
      title: s.title,
      channelName: s.channel.name,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
    })),
    videosDoneToday: videosDoneToday.map((v) => ({
      id: v.id,
      title: v.script.title,
      channelName: v.script.channel.name,
      capCutLink: v.capCutLink,
      createdAt: v.createdAt.toISOString(),
    })),
    platformTasksPostedToday: platformTasksPostedToday.map((pt) => ({
      id: pt.id,
      title: pt.video.script.title,
      platform: pt.channelPlatform.platformName,
      channelName: pt.channelPlatform.channel.name,
      postedUrl: pt.postedUrl,
      postedAt: pt.postedAt ? pt.postedAt.toISOString() : null,
    })),
    pendingScripts: pendingScripts.map((s) => ({
      id: s.id,
      title: s.title,
      channelName: s.channel.name,
      writerName: s.writer.name,
      createdAt: s.createdAt.toISOString(),
    })),
    pendingPlatformTasks: pendingPlatformTasks.map((pt) => ({
      id: pt.id,
      title: pt.video.script.title,
      platform: pt.channelPlatform.platformName,
      channelName: pt.channelPlatform.channel.name,
      capCutLink: pt.video.capCutLink,
      createdAt: pt.createdAt.toISOString(),
    })),
    activityToday: activityToday.map((a) => ({
      id: a.id,
      action: a.action,
      details: a.details,
      createdAt: a.createdAt.toISOString(),
    })),
  };
}

