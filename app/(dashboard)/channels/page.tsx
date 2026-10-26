import { requirePermission } from "@/lib/auth";
import { getChannels } from "@/app/actions/channels";
import { ChannelsClient } from "./client";
import { requireSession } from "@/lib/auth";

export default async function ChannelsPage() {
  await requirePermission("manage_channels");
  const session = await requireSession();
  const channels = await getChannels();

  return <ChannelsClient channels={channels} isBoss={session.isBoss} />;
}
