"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { markAsPosted, updatePostedLink, getChannelVideoMatrix } from "@/app/actions/platform-tasks";
import { SubmitButton } from "@/components/submit-button";
import { Check, Clock, ExternalLink, Edit2, X, Film, Share2 } from "lucide-react";
import { useLiveSync } from "@/hooks/use-live-sync";

type MatrixData = Awaited<ReturnType<typeof getChannelVideoMatrix>>;

// Display order matching user requirement: Facebook, TikTok, Instagram, YouTube, Snapchat
const PLATFORM_ORDER = [
  { key: "facebook", label: "Facebook", icon: "📘" },
  { key: "tiktok", label: "TikTok", icon: "🎵" },
  { key: "instagram", label: "Instagram", icon: "📸" },
  { key: "youtube", label: "YouTube", icon: "▶️" },
  { key: "snapchat", label: "Snapchat", icon: "👻" },
];

export function PlatformTasksClient({ initialData }: { initialData: MatrixData }) {
  const { isBoss, userAllowedPlatforms, channels } = initialData;

  const [selectedChannelId, setSelectedChannelId] = useState<string>(
    channels.length > 0 ? channels[0].id : ""
  );

  const [postingTask, setPostingTask] = useState<{
    id: string;
    videoTitle: string;
    platformName: string;
  } | null>(null);

  const [editingTask, setEditingTask] = useState<{
    id: string;
    videoTitle: string;
    platformName: string;
    postedUrl: string;
  } | null>(null);

  const [postState, postAction] = useFormState(markAsPosted, null);
  const [editState, editAction] = useFormState(updatePostedLink, null);

  // Auto-sync every 4.5 seconds
  useLiveSync(4500);

  const selectedChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-zinc-900">Platform Tasks</h1>
          <p className="text-xs text-zinc-500">Track and publish videos across all channel platforms</p>
        </div>
      </div>

      {/* Mark As Posted Modal / Popover */}
      {postingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80">
              <div className="flex items-center gap-2">
                <Share2 className="w-3.5 h-3.5 text-pink-600" />
                <h3 className="text-xs font-bold text-zinc-900">
                  Mark as Posted ({postingTask.platformName.toUpperCase()})
                </h3>
              </div>
              <button onClick={() => setPostingTask(null)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold text-zinc-800 mb-1">{postingTask.videoTitle}</p>
              <p className="text-[11px] text-zinc-500 mb-3">
                Paste the public URL of the uploaded video on {postingTask.platformName}.
              </p>

              {postState?.error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg p-2.5 mb-3">
                  {postState.error}
                </div>
              )}

              <form
                action={async (fd) => {
                  await postAction(fd);
                  setPostingTask(null);
                }}
                className="space-y-3"
              >
                <input type="hidden" name="taskId" value={postingTask.id} />
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Posted Video URL</label>
                  <input
                    name="postedUrl"
                    required
                    placeholder="https://..."
                    className="w-full px-2.5 py-1.5 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:bg-white focus:border-pink-500/50 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setPostingTask(null)}
                    className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-800"
                  >
                    Cancel
                  </button>
                  <SubmitButton pendingText="Saving...">Mark as Done ✓</SubmitButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Posted Link Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80">
              <div className="flex items-center gap-2">
                <Edit2 className="w-3.5 h-3.5 text-pink-600" />
                <h3 className="text-xs font-bold text-zinc-900">
                  Edit Posted Link ({editingTask.platformName.toUpperCase()})
                </h3>
              </div>
              <button onClick={() => setEditingTask(null)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold text-zinc-800 mb-1">{editingTask.videoTitle}</p>
              <p className="text-[11px] text-zinc-500 mb-3">Update the posted link for this platform.</p>

              {editState?.error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg p-2.5 mb-3">
                  {editState.error}
                </div>
              )}

              <form
                action={async (fd) => {
                  await editAction(fd);
                  setEditingTask(null);
                }}
                className="space-y-3"
              >
                <input type="hidden" name="taskId" value={editingTask.id} />
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Posted Video URL</label>
                  <input
                    name="postedUrl"
                    required
                    defaultValue={editingTask.postedUrl}
                    className="w-full px-2.5 py-1.5 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:bg-white focus:border-pink-500/50 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-800"
                  >
                    Cancel
                  </button>
                  <SubmitButton pendingText="Saving...">Update Link</SubmitButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 1. Channel Selector Pills / Cards */}
      <div className="mb-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Select Channel</div>
        {channels.length === 0 ? (
          <div className="p-4 bg-white border border-zinc-200 rounded-xl text-center text-xs text-zinc-400">
            No channels found. Create channels in the Channels section.
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {channels.map((ch) => {
              const isSelected = ch.id === selectedChannel?.id;
              const videoCount = ch.videos.length;

              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannelId(ch.id)}
                  className={`px-3 py-2 rounded-xl text-left border transition-all flex items-center gap-2.5 flex-none ${
                    isSelected
                      ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                      : "bg-white text-zinc-800 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isSelected ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {ch.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold truncate max-w-[140px]">{ch.name}</div>
                    <div className={`text-[10px] ${isSelected ? "text-zinc-300" : "text-zinc-400"}`}>
                      {videoCount} {videoCount === 1 ? "video" : "videos"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Full Window: Video List with Platform Checkmarks */}
      {selectedChannel && (
        <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-pink-600" />
                <h2 className="text-xs font-bold text-zinc-900">{selectedChannel.name} — All Videos</h2>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                {selectedChannel.videos.length} videos produced · Checkmarks tick automatically when posted
              </p>
            </div>
            <div className="text-[10px] text-zinc-500 font-medium">
              Enabled platforms:{" "}
              <span className="font-semibold text-zinc-700 capitalize">
                {selectedChannel.enabledPlatforms.join(", ") || "None"}
              </span>
            </div>
          </div>

          {/* Videos Table */}
          {selectedChannel.videos.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400">
              No videos produced for this channel yet. Complete scripts in Video Tasks to auto-generate platform tasks.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50/30">
                    <th className="py-2.5 px-4 min-w-[200px]">Video</th>
                    {PLATFORM_ORDER.map((p) => (
                      <th key={p.key} className="py-2.5 px-2 text-center min-w-[105px]">
                        <span className="inline-flex items-center gap-1">
                          <span>{p.icon}</span>
                          <span>{p.label}</span>
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs">
                  {selectedChannel.videos.map((vid) => (
                    <tr key={vid.videoId} className="hover:bg-zinc-50/60 transition-colors">
                      {/* Video Title & CapCut link */}
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-zinc-900 text-xs leading-snug">{vid.title}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-zinc-400">
                            {new Date(vid.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {vid.capCutLink && (
                            <a
                              href={vid.capCutLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-0.5 font-medium"
                            >
                              CapCut <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* 5 Platform Columns */}
                      {PLATFORM_ORDER.map((plat) => {
                        const isEnabled = selectedChannel.enabledPlatforms.includes(plat.key);
                        const task = vid.tasks.find((t) => t.platformName === plat.key);
                        const canManage = isBoss || userAllowedPlatforms.includes(plat.key);

                        if (!isEnabled) {
                          return (
                            <td key={plat.key} className="py-2.5 px-2 text-center text-zinc-300 text-xs">
                              —
                            </td>
                          );
                        }

                        if (!task) {
                          return (
                            <td key={plat.key} className="py-2.5 px-2 text-center text-zinc-300 text-xs">
                              —
                            </td>
                          );
                        }

                        // Status is POSTED
                        if (task.status === "POSTED") {
                          return (
                            <td key={plat.key} className="py-2.5 px-2 text-center">
                              <div className="inline-flex flex-col items-center gap-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                                  <Check className="w-3 h-3 stroke-[2.5]" /> Posted
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  {task.postedUrl && (
                                    <a
                                      href={task.postedUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[9px] text-emerald-700 hover:underline flex items-center gap-0.5 font-medium"
                                      title={task.postedUrl}
                                    >
                                      View <ExternalLink className="w-2 h-2" />
                                    </a>
                                  )}
                                  {canManage && (
                                    <button
                                      onClick={() =>
                                        setEditingTask({
                                          id: task.id,
                                          videoTitle: vid.title,
                                          platformName: plat.key,
                                          postedUrl: task.postedUrl || "",
                                        })
                                      }
                                      className="text-[9px] text-zinc-400 hover:text-zinc-700 flex items-center gap-0.5"
                                      title="Edit posted URL"
                                    >
                                      <Edit2 className="w-2 h-2" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>
                          );
                        }

                        // Status is PENDING
                        return (
                          <td key={plat.key} className="py-2.5 px-2 text-center">
                            {canManage ? (
                              <button
                                onClick={() =>
                                  setPostingTask({
                                    id: task.id,
                                    videoTitle: vid.title,
                                    platformName: plat.key,
                                  })
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 text-[10px] font-semibold border border-amber-200 shadow-xs transition-colors"
                              >
                                <Clock className="w-2.5 h-2.5" /> Post
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-zinc-400 text-[10px] font-medium bg-zinc-50 border border-zinc-200/50">
                                <Clock className="w-2.5 h-2.5 text-zinc-300" /> Pending
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
