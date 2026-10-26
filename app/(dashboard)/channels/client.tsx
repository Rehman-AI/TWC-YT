"use client";

import { useState, useActionState } from "react";
import { createChannel, deleteChannel } from "@/app/actions/channels";

const PLATFORMS = ["youtube", "tiktok", "facebook", "snapchat", "instagram"];
const VIDEO_LENGTHS = ["1 min", "5 min", "10 min", "15 min", "30 min", "1 hr", "2 hr"];

const platformEmoji: Record<string, string> = {
  youtube: "▶️",
  tiktok: "🎵",
  facebook: "📘",
  snapchat: "👻",
  instagram: "📸",
};

type Channel = {
  id: string;
  name: string;
  idea: string | null;
  videoLength: string;
  platforms: { id: string; platformName: string; uploadsPerDay: number }[];
  createdBy: { name: string };
  _count: { scripts: number };
};

export function ChannelsClient({ channels, isBoss }: { channels: Channel[]; isBoss: boolean }) {
  const [showForm, setShowForm] = useState(false);
  const [state, formAction, pending] = useActionState(createChannel, null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Channels</h1>
          <p className="text-sm text-zinc-500">Manage your content channels and platforms</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-[#8c0f60] to-[#e8227a] text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-pink-500/25 transition-all"
        >
          + New Channel
        </button>
      </div>

      {showForm && (
        <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-white mb-4">Create New Channel</h3>
          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 mb-4">{state.error}</div>
          )}
          <form action={async (formData) => {
            await formAction(formData);
            if (!state?.error) setShowForm(false);
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Channel Name</label>
                <input name="name" required placeholder="e.g. Car Fusion" className="w-full px-3 py-2 bg-[#1a1a1f] border border-white/[0.06] rounded-lg text-white text-sm focus:border-pink-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Video Length</label>
                <select name="videoLength" className="w-full px-3 py-2 bg-[#1a1a1f] border border-white/[0.06] rounded-lg text-white text-sm focus:border-pink-500/50 focus:outline-none">
                  {VIDEO_LENGTHS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Channel Idea / Description</label>
              <textarea name="idea" rows={2} placeholder="What's this channel about?" className="w-full px-3 py-2 bg-[#1a1a1f] border border-white/[0.06] rounded-lg text-white text-sm focus:border-pink-500/50 focus:outline-none resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">Platforms</label>
                <div className="space-y-2">
                  {PLATFORMS.map((p) => (
                    <label key={p} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="platforms" value={p} className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-pink-500" />
                      <span className="text-sm text-zinc-300 capitalize">{platformEmoji[p]} {p}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Uploads per platform/day</label>
                <input name="uploads" type="number" min="1" max="20" defaultValue="1" className="w-full px-3 py-2 bg-[#1a1a1f] border border-white/[0.06] rounded-lg text-white text-sm focus:border-pink-500/50 focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={pending} className="px-4 py-2 bg-pink-600 text-white text-sm font-semibold rounded-lg hover:bg-pink-500 disabled:opacity-50">
                {pending ? "Creating..." : "Create Channel"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Channel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((ch) => (
          <div key={ch.id} className="bg-[#111114] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.1] transition-all hover:-translate-y-0.5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-[15px] font-semibold text-white">{ch.name}</h3>
                {ch.idea && <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">{ch.idea}</p>}
              </div>
              {isBoss && (
                <button onClick={() => deleteChannel(ch.id)} className="text-xs text-zinc-600 hover:text-red-400 transition-colors">
                  Delete
                </button>
              )}
            </div>
            <div className="flex gap-4 mb-3 text-center">
              <div>
                <div className="text-lg font-bold text-white">{ch._count.scripts}</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Scripts</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{ch.videoLength}</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Length</div>
              </div>
            </div>
            <div className="flex gap-1.5 pt-3 border-t border-white/[0.06]">
              {ch.platforms.map((p) => (
                <span key={p.id} className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.04] text-zinc-400 capitalize">
                  {platformEmoji[p.platformName]} {p.platformName}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
