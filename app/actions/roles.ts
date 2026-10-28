"use server";

import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";

export async function getRoles() {
  return db.role.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createRole(_prev: unknown, formData: FormData) {
  await requirePermission("manage_roles");

  const name = formData.get("name") as string;
  const permissions = formData.getAll("permissions") as string[];

  if (!name?.trim()) {
    return { error: "Role name is required" };
  }

  try {
    await db.role.create({
      data: { name: name.trim(), permissions },
    });
    revalidatePath("/roles");
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("Unique")) return { error: "Role name already exists" };
    return { error: msg };
  }
}

export async function updateRole(_prev: unknown, formData: FormData) {
  await requirePermission("manage_roles");

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const permissions = formData.getAll("permissions") as string[];

  if (!name?.trim()) return { error: "Role name is required" };

  try {
    await db.role.update({
      where: { id },
      data: { name: name.trim(), permissions },
    });
    revalidatePath("/roles");
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { error: msg };
  }
}

export async function deleteRole(id: string) {
  await requirePermission("manage_roles");

  await db.role.delete({ where: { id } });
  revalidatePath("/roles");
}
