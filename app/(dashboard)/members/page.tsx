import { requirePermission } from "@/lib/auth";
import { getMembers } from "@/app/actions/members";
import { getRoles } from "@/app/actions/roles";
import { MembersClient } from "./client";

export default async function MembersPage() {
  await requirePermission("manage_members");
  const [members, roles] = await Promise.all([getMembers(), getRoles()]);

  return <MembersClient members={members} roles={roles} />;
}
