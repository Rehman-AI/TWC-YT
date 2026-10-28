import { requireSession } from "@/lib/auth";
import { getChannelVideoMatrix } from "@/app/actions/platform-tasks";
import { PlatformTasksClient } from "./client";

export default async function PlatformTasksPage() {
  await requireSession();
  const matrixData = await getChannelVideoMatrix();

  return <PlatformTasksClient initialData={matrixData} />;
}

