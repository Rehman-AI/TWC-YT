import { requirePermission } from "@/lib/auth";
import { getAssignedScripts, getCompletedVideos } from "@/app/actions/videos";
import { VideosClient } from "./client";

export default async function VideosPage() {
  await requirePermission("make_videos");
  const [assignedScripts, completedVideos] = await Promise.all([
    getAssignedScripts(),
    getCompletedVideos(),
  ]);

  return <VideosClient assignedScripts={assignedScripts} completedVideos={completedVideos} />;
}
