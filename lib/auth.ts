import { db } from "@/lib/db";
import { compare } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "dev-secret-change-me";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  isBoss: boolean;
  roleId: string | null;
  permissions: string[];
}

export async function login(email: string, password: string): Promise<SessionUser | null> {
  const user = await db.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user) return null;

  const valid = await compare(password, user.password);
  if (!valid) return null;

  const session: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    isBoss: user.isBoss,
    roleId: user.roleId,
    permissions: user.role?.permissions ?? [],
  };

  const token = sign(session, JWT_SECRET, { expiresIn: "7d" });

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return session;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  try {
    const decoded = verify(token, JWT_SECRET) as SessionUser;
    if (!decoded?.id) return null;

    const user = await db.user.findUnique({
      where: { id: decoded.id },
      include: { role: true },
    });

    if (user) {
      return {
        id: user.id,
        name: user.isBoss ? "Sami" : user.name,
        email: user.email,
        isBoss: user.isBoss,
        roleId: user.roleId,
        permissions: user.role?.permissions ?? [],
      };
    }

    return {
      ...decoded,
      name: decoded.isBoss ? "Sami" : decoded.name,
    };
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requirePermission(permission: string): Promise<SessionUser> {
  const session = await requireSession();
  if (session.isBoss) return session;
  if (!session.permissions.includes(permission)) {
    throw new Error("Permission denied");
  }
  return session;
}
