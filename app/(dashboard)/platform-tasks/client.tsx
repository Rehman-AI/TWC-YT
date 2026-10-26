"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { markAsPosted } from "@/app/actions/platform-tasks";
import { SubmitButton } from "@/components/submit-button";

type PlatformTask = {
  id: string;
  status: string;
  postedUrl: string | null;
  postedAt: Date | null;
  createdAt: Date;
  channelPlatform: { platformName: string };
  video: {
    capCutLink: string;
    script: {
      title: string;
      channel: { name: string };
    };
  };
  assignedTo: { name: string } | null;
};

const platformEmoji: Record<string, string> = {
  youtube: "▶️",
  tiktok: "🎵",
  facebook: "📘",
  snapchat: "👻",
  instagram: "📸",
};

export function PlatformTasksClient({ tasks }: { tasks: PlatformTask[] }) {
  const [postingId, setPostingId] = useState<string | null>(null);
  const [state, formAction] = useFormState(markAsPosted, null);

  const pendingTasks = tasks.filter((t) => t.status === "PENDING");
  const postedTasks = tasks.filter((t) => t.status === "POSTED");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Platform Tasks</h1>
        <p className="text-sm text-zinc-500">Post videos to your platforms and mark as done</p>
      </div>

      {/* Pending */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">
          Pending ({pendingTasks.length})
        </h2>
        {pendingTasks.length === 0 ? (
          <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-8 text-center">
            <p className="text-sm text-zinc-500">No pending posts. All caught up! 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div key={task.id} className="bg-[#111114] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.1] transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{platformEmoji[task.channelPlatform.platformName] || "📱"}</span>
                      <h3 className="text-sm font-semibold text-white capitalize">{task.channelPlatform.platformName}</h3>
                    </div>
                    <div className="text-[13px] text-zinc-300">{task.video.script.title}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{task.video.script.channel.name}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-yellow-500/10 text-yellow-400">PENDING</span>
                </div>

                {/* CapCut Link */}
                <div className="bg-[#0c0c0f] rounded-lg p-3 mb-3">
                  <div className="text-[10px] font-semibold text-zinc-500 mb-1">VIDEO LINK</div>
                  <a
                    href={task.video.capCutLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-400 hover:underline break-all"
                  >
                    {task.video.capCutLink}
                  </a>
                </div>

                {/* Mark as Posted */}
                {postingId === task.id ? (
                  <div>
                    {state?.error && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-2 mb-2">{state.error}</div>
                    )}
                    <form action={formAction} className="flex gap-2">
                      <input type="hidden" name="taskId" value={task.id} />
                      <input
                        name="postedUrl"
                        required
                        placeholder="Paste the URL where you posted it..."
                        className="flex-1 px-3 py-2 bg-[#1a1a1f] border border-white/[0.06] rounded-lg text-white text-sm focus:border-green-500/50 focus:outline-none"
                      />
                      <SubmitButton
                        pendingText="..."
                        className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-500 disabled:opacity-50 whitespace-nowrap"
                      >
                        Done ✓
                      </SubmitButton>
                      <button
                        type="button"
                        onClick={() => setPostingId(null)}
                        className="px-3 py-2 text-sm text-zinc-500 hover:text-white"
                      >
                        ✕
                      </button>
                    </form>
                  </div>
                ) : (
                  <button
                    onClick={() => setPostingId(task.id)}
                    className="w-full py-2 rounded-lg text-sm font-medium text-green-400 bg-green-500/5 border border-green-500/10 hover:bg-green-500/10 transition-colors"
                  >
                    Mark as Posted
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Posted */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">
          Posted ({postedTasks.length})
        </h2>
        {postedTasks.length > 0 && (
          <div className="space-y-2">
            {postedTasks.map((task) => (
              <div key={task.id} className="bg-[#111114] border border-white/[0.06] rounded-xl p-4 opacity-70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{platformEmoji[task.channelPlatform.platformName] || "📱"}</span>
                    <div>
                      <div className="text-sm text-white">{task.video.script.title}</div>
                      <div className="text-[11px] text-zinc-500">
                        {task.video.script.channel.name} · {task.assignedTo?.name || "Unknown"} · {task.postedAt ? new Date(task.postedAt).toLocaleDateString() : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.postedUrl && (
                      <a href={task.postedUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">
                        View ↗
                      </a>
                    )}
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-500/10 text-green-400">POSTED ✓</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
