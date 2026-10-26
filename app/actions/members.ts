"use server";

import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
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
