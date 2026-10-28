"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { createChannel, updateChannel, deleteChannel } from "@/app/actions/channels";
import { SubmitButton } from "@/components/submit-button";
import { ChevronDown, ChevronUp, Edit2, Trash2, Plus, Film, Clock, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useLiveSync } from "@/hooks/use-live-sync";

const PLATFORMS = ["youtube", "tiktok", "facebook", "snapchat", "instagram"];
const VIDEO_LENGTHS = ["1 min", "5 min", "10 min", "15 min", "30 min", "1 hr", "2 hr"];

const platformLabels: Record<string, { label: string; icon: string }> = {
  youtube: { label: "YouTube", icon: "▶️" },
  tiktok: { label: "TikTok", icon: "🎵" },
  facebook: { label: "Facebook", icon: "📘" },
  snapchat: { label: "Snapchat", icon: "👻" },
  instagram: { label: "Instagram", icon: "📸" },
};

type ChannelPlatform = {
  id: string;
  platformName: string;
  uploadsPerDay: number;
  platformTasks?: { id: string; status: string }[];
};

type Channel = {
  id: string;
  name: string;
  idea: string | null;
  videoLength: string;
  platforms: ChannelPlatform[];
  createdBy: { name: string };
  _count: { scripts: number };
};

export function ChannelsClient({ channels, isBoss }: { channels: Channel[]; isBoss: boolean }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [expandedChannelId, setExpandedChannelId] = useState<string | null>(null);

  const [createState, createAction] = useFormState(createChannel, null);
  const [editState, editAction] = useFormState(updateChannel, null);

  // Auto-sync every 4.5 seconds
  useLiveSync(4500);

  const toggleExpand = (channelId: string) => {
    setExpandedChannelId((prev) => (prev === channelId ? null : channelId));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-zinc-900">Channels</h1>
          <p className="text-xs text-zinc-500">Manage content channels and platform progress</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#8c0f60] to-[#e8227a] text-white text-xs font-semibold rounded-lg hover:shadow-md hover:shadow-pink-500/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          New Channel
        </button>
      </div>

      {/* Create Channel Modal / Drawer */}
      {showCreateForm && (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-3 border-b border-zinc-100 pb-2">
            <h3 className="text-xs font-bold text-zinc-900">Create New Channel</h3>
            <button onClick={() => setShowCreateForm(false)} className="text-zinc-400 hover:text-zinc-700">
              <X className="w-4 h-4" />
            </button>
          </div>
          {createState?.error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg p-2.5 mb-3">
              {createState.error}
            </div>
          )}
          <form action={createAction} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Channel Name</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Car Fusion"
                  className="w-full px-2.5 py-1.5 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:bg-white focus:border-pink-500/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Video Length</label>
                <select
                  name="videoLength"
                  className="w-full px-2.5 py-1.5 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:bg-white focus:border-pink-500/50 focus:outline-none"
                >
                  {VIDEO_LENGTHS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Channel Idea / Description</label>
              <textarea
                name="idea"
                rows={2}
                placeholder="What's this channel about?"
                className="w-full px-2.5 py-1.5 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:bg-white focus:border-pink-500/50 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1.5">Platforms</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PLATFORMS.map((p) => (
                    <label
                      key={p}
                      className="flex items-center gap-1.5 p-1 rounded-md hover:bg-zinc-50 cursor-pointer border border-transparent hover:border-zinc-200"
                    >
                      <input
                        type="checkbox"
                        name="platforms"
                        value={p}
                        defaultChecked={p === "youtube"}
                        className="w-3.5 h-3.5 rounded border-zinc-300 text-pink-600 focus:ring-pink-500"
                      />
                      <span className="text-[11px] text-zinc-700 capitalize">
                        {platformLabels[p]?.icon} {p}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Uploads per platform/day</label>
                <input
                  name="uploads"
                  type="number"
                  min="1"
                  max="20"
                  defaultValue="1"
                  className="w-full px-2.5 py-1.5 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:bg-white focus:border-pink-500/50 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1 justify-end">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-800"
              >
                Cancel
              </button>
              <SubmitButton pendingText="Creating...">Create Channel</SubmitButton>
            </div>
          </form>
        </div>
      )}

      {/* Edit Channel Modal */}
      {editingChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-pink-600" />
                <h3 className="text-xs font-bold text-zinc-900">Edit Channel</h3>
              </div>
              <button onClick={() => setEditingChannel(null)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              {editState?.error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg p-2.5 mb-3">
                  {editState.error}
                </div>
              )}
              <form
                action={async (fd) => {
                  await editAction(fd);
                  setEditingChannel(null);
                }}
                className="space-y-3"
              >
                <input type="hidden" name="id" value={editingChannel.id} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Channel Name</label>
                    <input
                      name="name"
                      required
                      defaultValue={editingChannel.name}
                      className="w-full px-2.5 py-1.5 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:bg-white focus:border-pink-500/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Video Length</label>
                    <select
                      name="videoLength"
                      defaultValue={editingChannel.videoLength}
                      className="w-full px-2.5 py-1.5 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:bg-white focus:border-pink-500/50 focus:outline-none"
                    >
                      {VIDEO_LENGTHS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Channel Idea / Description</label>
                  <textarea
                    name="idea"
                    rows={2}
                    defaultValue={editingChannel.idea || ""}
                    className="w-full px-2.5 py-1.5 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:bg-white focus:border-pink-500/50 focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1.5">Platforms</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {PLATFORMS.map((p) => {
                        const isChecked = editingChannel.platforms.some((cp) => cp.platformName === p);
                        return (
                          <label
                            key={p}
                            className="flex items-center gap-1.5 p-1 rounded-md hover:bg-zinc-50 cursor-pointer border border-transparent hover:border-zinc-200"
                          >
                            <input
                              type="checkbox"
                              name="platforms"
                              value={p}
                              defaultChecked={isChecked}
                              className="w-3.5 h-3.5 rounded border-zinc-300 text-pink-600 focus:ring-pink-500"
                            />
                            <span className="text-[11px] text-zinc-700 capitalize">
                              {platformLabels[p]?.icon} {p}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Uploads per platform/day</label>
                    <input
                      name="uploads"
                      type="number"
                      min="1"
                      max="20"
                      defaultValue={editingChannel.platforms[0]?.uploadsPerDay || 1}
                      className="w-full px-2.5 py-1.5 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:bg-white focus:border-pink-500/50 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingChannel(null)}
                    className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-800"
                  >
                    Cancel
                  </button>
                  <SubmitButton pendingText="Saving...">Save Changes</SubmitButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sleek, Minimal & Compact Channel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {channels.map((ch) => {
          const isExpanded = expandedChannelId === ch.id;

          // Aggregated platform stats
          let totalPosted = 0;
          let totalPending = 0;
          ch.platforms.forEach((p) => {
            const tasks = p.platformTasks || [];
            totalPosted += tasks.filter((t) => t.status === "POSTED").length;
            totalPending += tasks.filter((t) => t.status === "PENDING").length;
          });

          return (
            <div
              key={ch.id}
              className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden hover:border-zinc-300 transition-all flex flex-col justify-between"
            >
              {/* Card Header & Compact Metadata */}
              <div className="p-3.5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-zinc-900 truncate">{ch.name}</h3>
                    {ch.idea ? (
                      <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">{ch.idea}</p>
                    ) : (
                      <p className="text-[10px] text-zinc-400 mt-0.5">No description</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-none">
                    <button
                      onClick={() => setEditingChannel(ch)}
                      className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
                      title="Edit Channel"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {isBoss && (
                      <button
                        onClick={() => deleteChannel(ch.id)}
                        className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Channel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Compact Stats Row */}
                <div className="grid grid-cols-3 gap-1.5 py-1.5 px-2 bg-zinc-50/80 rounded-lg text-center mb-2.5 border border-zinc-100">
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-medium">Scripts</div>
                    <div className="text-xs font-bold text-purple-700">{ch._count.scripts}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-medium">Length</div>
                    <div className="text-xs font-bold text-zinc-800">{ch.videoLength}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-medium">Posted</div>
                    <div className="text-xs font-bold text-emerald-700">{totalPosted}</div>
                  </div>
                </div>

                {/* Platform Badges with Dropdown Trigger */}
                <button
                  type="button"
                  onClick={() => toggleExpand(ch.id)}
                  className="w-full flex items-center justify-between pt-2 border-t border-zinc-100 text-[11px] text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-1 flex-wrap">
                    {ch.platforms.map((p) => (
                      <span
                        key={p.id}
                        className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-zinc-100 text-zinc-700 capitalize flex items-center gap-0.5"
                      >
                        <span>{platformLabels[p.platformName]?.icon || "📱"}</span>
                        <span>{p.platformName}</span>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-0.5 text-zinc-400 hover:text-zinc-700 text-[10px] font-medium flex-none">
                    <span>{isExpanded ? "Hide" : "Progress"}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </button>
              </div>

              {/* Expandable Platform Progress Dropdown */}
              {isExpanded && (
                <div className="border-t border-zinc-100 bg-zinc-50/60 p-3 space-y-1.5 animate-in slide-in-from-top-1 duration-150">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Platform Video Progress
                  </div>
                  {ch.platforms.length === 0 ? (
                    <div className="text-[10px] text-zinc-400 italic">No platforms configured.</div>
                  ) : (
                    ch.platforms.map((p) => {
                      const tasks = p.platformTasks || [];
                      const posted = tasks.filter((t) => t.status === "POSTED").length;
                      const pending = tasks.filter((t) => t.status === "PENDING").length;

                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-zinc-200/80 text-xs"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{platformLabels[p.platformName]?.icon || "📱"}</span>
                            <span className="font-semibold text-zinc-800 capitalize">
                              {platformLabels[p.platformName]?.label || p.platformName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                              <CheckCircle2 className="w-2.5 h-2.5" /> {posted} Posted
                            </span>
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                              <Clock className="w-2.5 h-2.5" /> {pending} Pending
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
