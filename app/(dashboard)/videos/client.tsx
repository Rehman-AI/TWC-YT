"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { submitVideo } from "@/app/actions/videos";
import { SubmitButton } from "@/components/submit-button";

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
  const [state, formAction] = useFormState(submitVideo, null);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900">Video Tasks</h1>
        <p className="text-sm text-zinc-500">Scripts assigned to you — make the video and paste the CapCut link</p>
      </div>

      {/* Pending Scripts */}
      <div className="mb-8">
        <h2 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-wider">
          Pending Scripts ({assignedScripts.length})
        </h2>
        {assignedScripts.length === 0 ? (
          <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-8 text-center">
            <p className="text-sm text-zinc-500">No scripts assigned to you right now. 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignedScripts.map((script) => (
              <div key={script.id} className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden hover:border-zinc-300 transition-colors">
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setActiveScript(activeScript?.id === script.id ? null : script)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900">{script.title}</h3>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        {script.channel.name} · by {script.writer.name} · {new Date(script.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      {script.channel.platforms.map((p) => (
                        <span key={p.platformName} className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-700 capitalize">
                          {p.platformName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {activeScript?.id === script.id && (
                  <div className="border-t border-zinc-100 p-4">
                    {/* Script Content */}
                    <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 mb-4 max-h-[300px] overflow-y-auto">
                      <pre className="text-sm text-zinc-800 whitespace-pre-wrap font-mono leading-relaxed">{script.content}</pre>
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
                              <span className="text-zinc-800">{String(f.value)}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Submit CapCut Link */}
                    {state?.error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-3">{state.error}</div>
                    )}
                    <form action={formAction} className="flex gap-2">
                      <input type="hidden" name="scriptId" value={script.id} />
                      <input
                        name="capCutLink"
                        required
                        placeholder="Paste your CapCut video link here..."
                        className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:bg-white focus:border-pink-500/50 focus:outline-none"
                      />
                      <SubmitButton
                        pendingText="Submitting..."
                        className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-500 disabled:opacity-50 whitespace-nowrap shadow-sm"
                      >
                        Submit Video ✓
                      </SubmitButton>
                    </form>
                    <p className="text-[11px] text-zinc-500 mt-2">
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
        <h2 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-wider">
          Completed ({completedVideos.length})
        </h2>
        {completedVideos.length > 0 && (
          <div className="space-y-2">
            {completedVideos.map((v) => (
              <div key={v.id} className="bg-white border border-zinc-200 shadow-sm rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">{v.script.title}</h3>
                    <div className="text-[11px] text-zinc-500">{v.script.channel.name} · {new Date(v.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex gap-1.5">
                    {v.platformTasks.map((t) => (
                      <span
                        key={t.id}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize border ${
                          t.status === "POSTED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
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
