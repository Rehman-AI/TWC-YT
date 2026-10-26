import { requirePermission } from "@/lib/auth";
import { getScripts, getVideoMakers } from "@/app/actions/scripts";
import { getChannels } from "@/app/actions/channels";
import { ScriptsClient } from "./client";

export default async function ScriptsPage() {
  await requirePermission("write_scripts");
  const [scripts, channels, videoMakers] = await Promise.all([
    getScripts(),
    getChannels(),
    getVideoMakers(),
  ]);

  return <ScriptsClient scripts={scripts} channels={channels} videoMakers={videoMakers} />;
}
