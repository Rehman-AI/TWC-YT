import { requirePermission } from "@/lib/auth";
import { getRoles } from "@/app/actions/roles";
import { RolesClient } from "./client";

export default async function RolesPage() {
  await requirePermission("manage_roles");
  const roles = await getRoles();

  return <RolesClient roles={roles} />;
}
