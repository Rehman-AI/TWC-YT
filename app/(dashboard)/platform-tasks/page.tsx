import { requireSession } from "@/lib/auth";
import { getPlatformTasks } from "@/app/actions/platform-tasks";
import { PlatformTasksClient } from "./client";

export default async function PlatformTasksPage() {
  const session = await requireSession();
  const tasks = await getPlatformTasks();

  return <PlatformTasksClient tasks={tasks} />;
}
