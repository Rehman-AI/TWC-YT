"use server";

import { login, logout, requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { compare, hash } from "bcryptjs";
import { redirect } from "next/navigation";

export async function loginAction(_prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const user = await login(email, password);
  if (!user) {
    return { error: "Invalid email or password" };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await logout();
  redirect("/login");
}

export async function changeMyPassword(_prevState: unknown, formData: FormData) {
  const session = await requireSession();
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword) {
    return { error: "Current password is required" };
  }

  if (!newPassword || newPassword.length < 6) {
    return { error: "New password must be at least 6 characters long" };
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match" };
  }

  const user = await db.user.findUnique({ where: { id: session.id } });
  if (!user) {
    return { error: "User not found" };
  }

  const valid = await compare(currentPassword, user.password);
  if (!valid) {
    return { error: "Current password is incorrect" };
  }

  const hashedPassword = await hash(newPassword, 12);
  await db.user.update({
    where: { id: session.id },
    data: { password: hashedPassword },
  });

  await logActivity("CHANGED_PASSWORD", `${session.name} updated their account password`);
  return { success: true };
}

