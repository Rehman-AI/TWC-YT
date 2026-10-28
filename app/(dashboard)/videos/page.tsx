import { requirePermission, requireSession } from "@/lib/auth";
import { getAssignedScripts, getCompletedVideos, getAllVideoMakers } from "@/app/actions/videos";
import { VideosClient } from "./client";

export default async function VideosPage() {
  await requirePermission("make_videos");
  const session = await requireSession();
  const [assignedScripts, completedVideos, videoMakers] = await Promise.all([
    getAssignedScripts(),
    getCompletedVideos(),
    getAllVideoMakers(),
  ]);

  return (
    <VideosClient
      assignedScripts={assignedScripts}
      completedVideos={completedVideos}
      isBoss={session.isBoss}
      videoMakers={videoMakers}
    />
  );
}
