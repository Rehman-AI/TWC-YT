"use client";

import { useState, useActionState } from "react";
import { submitVideo } from "@/app/actions/videos";

type AssignedScript = {
  id: string;
  title: string;
  content: string;
  extraFields: unknown;
  channel: {
    name: string;
    platforms: { platformName: string }[];
  };
  writer: { name: string };
  createdAt: Date;
};

type CompletedVideo = {
  id: string;
  capCutLink: string;
  createdAt: Date;
  script: {
    title: string;
    channel: { name: string };
  };
  platformTasks: {
    id: string;
    status: string;
    channelPlatform: { platformName: string };
  }[];
};

export function VideosClient({
  assignedScripts,
  completedVideos,
}: {
  assignedScripts: AssignedScript[];
  completedVideos: CompletedVideo[];
}) {
  const [activeScript, setActiveScript] = useState<AssignedScript | null>(null);
  const [state, formAction, pending] = useActionState(submitVideo, null);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Video Tasks</h1>
        <p className="text-sm text-zinc-500">Scripts assigned to you — make the video and paste the CapCut link</p>
      </div>

      {/* Pending Scripts */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">
          Pending Scripts ({assignedScripts.length})
        </h2>
        {assignedScripts.length === 0 ? (
          <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-8 text-center">
            <p className="text-sm text-zinc-500">No scripts assigned to you right now. 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignedScripts.map((script) => (
              <div key={script.id} className="bg-[#111114] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.1] transition-colors">
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setActiveScript(activeScript?.id === script.id ? null : script)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{script.title}</h3>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        {script.channel.name} · by {script.writer.name} · {new Date(script.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      {script.channel.platforms.map((p) => (
                        <span key={p.platformName} className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.04] text-zinc-400 capitalize">
                          {p.platformName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {activeScript?.id === script.id && (
                  <div className="border-t border-white/[0.06] p-4">
                    {/* Script Content */}
                    <div className="bg-[#0c0c0f] rounded-lg p-4 mb-4 max-h-[300px] overflow-y-auto">
                      <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">{script.content}</pre>
                    </div>

                    {/* Extra Fields */}
                    {(() => {
                      const extras = script.extraFields as { label: string; value: string }[] | null;
                      if (!extras || !Array.isArray(extras) || extras.length === 0) return null;
                      return (
                        <div className="mb-4 space-y-1">
                          {extras.map((f, i) => (
                            <div key={i} className="text-sm">
                              <span className="text-zinc-500 font-medium">{String(f.label)}:</span>{" "}
                              <span className="text-zinc-300">{String(f.value)}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Submit CapCut Link */}
                    {state?.error && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 mb-3">{state.error}</div>
                    )}
                    <form action={formAction} className="flex gap-2">
                      <input type="hidden" name="scriptId" value={script.id} />
                      <input
                        name="capCutLink"
                        required
                        placeholder="Paste your CapCut video link here..."
                        className="flex-1 px-3 py-2 bg-[#1a1a1f] border border-white/[0.06] rounded-lg text-white text-sm focus:border-pink-500/50 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={pending}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-500 disabled:opacity-50 whitespace-nowrap"
                      >
                        {pending ? "Submitting..." : "Submit Video ✓"}
                      </button>
                    </form>
                    <p className="text-[11px] text-zinc-600 mt-2">
                      This will auto-create tasks for: {script.channel.platforms.map((p) => p.platformName).join(", ")}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Videos */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">
          Completed ({completedVideos.length})
        </h2>
        {completedVideos.length > 0 && (
          <div className="space-y-2">
            {completedVideos.map((v) => (
              <div key={v.id} className="bg-[#111114] border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-white">{v.script.title}</h3>
                    <div className="text-[11px] text-zinc-500">{v.script.channel.name} · {new Date(v.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex gap-1.5">
                    {v.platformTasks.map((t) => (
                      <span
                        key={t.id}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                          t.status === "POSTED"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {t.channelPlatform.platformName} {t.status === "POSTED" ? "✓" : "⏳"}
                      </span>
                    ))}
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
