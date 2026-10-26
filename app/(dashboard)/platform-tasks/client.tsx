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
        <h1 className="text-xl font-bold text-zinc-900">Platform Tasks</h1>
        <p className="text-sm text-zinc-500">Post videos to your platforms and mark as done</p>
      </div>

      {/* Pending */}
      <div className="mb-8">
        <h2 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-wider">
          Pending ({pendingTasks.length})
        </h2>
        {pendingTasks.length === 0 ? (
          <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-8 text-center">
            <p className="text-sm text-zinc-500">No pending posts. All caught up! 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div key={task.id} className="bg-white border border-zinc-200 shadow-sm rounded-xl p-4 hover:border-zinc-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{platformEmoji[task.channelPlatform.platformName] || "📱"}</span>
                      <h3 className="text-sm font-bold text-zinc-900 capitalize">{task.channelPlatform.platformName}</h3>
                    </div>
                    <div className="text-[13px] font-medium text-zinc-800">{task.video.script.title}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{task.video.script.channel.name}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">PENDING</span>
                </div>

                {/* CapCut Link */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 mb-3">
                  <div className="text-[10px] font-bold text-zinc-500 mb-1">VIDEO LINK</div>
                  <a
                    href={task.video.capCutLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-pink-600 hover:underline break-all"
                  >
                    {task.video.capCutLink}
                  </a>
                </div>

                {/* Mark as Posted */}
                {postingId === task.id ? (
                  <div>
                    {state?.error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-2 mb-2">{state.error}</div>
                    )}
                    <form action={formAction} className="flex gap-2">
                      <input type="hidden" name="taskId" value={task.id} />
                      <input
                        name="postedUrl"
                        required
                        placeholder="Paste the URL where you posted it..."
                        className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:bg-white focus:border-emerald-500/50 focus:outline-none"
                      />
                      <SubmitButton
                        pendingText="..."
                        className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-500 disabled:opacity-50 whitespace-nowrap shadow-sm"
                      >
                        Done ✓
                      </SubmitButton>
                      <button
                        type="button"
                        onClick={() => setPostingId(null)}
                        className="px-3 py-2 text-sm text-zinc-500 hover:text-zinc-800"
                      >
                        ✕
                      </button>
                    </form>
                  </div>
                ) : (
                  <button
                    onClick={() => setPostingId(task.id)}
                    className="w-full py-2 rounded-lg text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
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
        <h2 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-wider">
          Posted ({postedTasks.length})
        </h2>
        {postedTasks.length > 0 && (
          <div className="space-y-2">
            {postedTasks.map((task) => (
              <div key={task.id} className="bg-white border border-zinc-200 shadow-sm rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{platformEmoji[task.channelPlatform.platformName] || "📱"}</span>
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">{task.video.script.title}</div>
                      <div className="text-[11px] text-zinc-500">
                        {task.video.script.channel.name} · {task.assignedTo?.name || "Unknown"} · {task.postedAt ? new Date(task.postedAt).toLocaleDateString() : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.postedUrl && (
                      <a href={task.postedUrl} target="_blank" rel="noreferrer" className="text-xs text-pink-600 hover:underline font-medium">
                        View ↗
                      </a>
                    )}
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">POSTED ✓</span>
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
