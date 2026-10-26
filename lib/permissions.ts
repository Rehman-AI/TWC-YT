// All available permissions in the system
export const ALL_PERMISSIONS = [
  { key: "manage_roles", label: "Create & Edit Roles", category: "Admin" },
  { key: "manage_members", label: "Create & Edit Members", category: "Admin" },
  { key: "delete_channels", label: "Delete Channels", category: "Admin" },
  { key: "view_all_progress", label: "View Everyone's Progress", category: "Admin" },
  { key: "manage_channels", label: "Create & Edit Channels", category: "Channels" },
  { key: "assign_tasks", label: "Assign Tasks to People", category: "Management" },
  { key: "write_scripts", label: "Write & Assign Scripts", category: "Content" },
  { key: "make_videos", label: "Make Videos (see assigned scripts)", category: "Content" },
  { key: "post_youtube", label: "Post to YouTube", category: "Platforms" },
  { key: "post_tiktok", label: "Post to TikTok", category: "Platforms" },
  { key: "post_facebook", label: "Post to Facebook", category: "Platforms" },
  { key: "post_snapchat", label: "Post to Snapchat", category: "Platforms" },
  { key: "post_instagram", label: "Post to Instagram", category: "Platforms" },
  { key: "view_dashboard", label: "View Dashboard", category: "General" },
] as const;

export type Permission = typeof ALL_PERMISSIONS[number]["key"];

// Boss has all permissions implicitly — no need to check
export function hasPermission(
  userPermissions: string[],
  isBoss: boolean,
  required: Permission
): boolean {
  if (isBoss) return true;
  return userPermissions.includes(required);
}

export function hasAnyPermission(
  userPermissions: string[],
  isBoss: boolean,
  required: Permission[]
): boolean {
  if (isBoss) return true;
  return required.some((p) => userPermissions.includes(p));
}
