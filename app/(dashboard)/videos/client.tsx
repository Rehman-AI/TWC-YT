"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { submitVideo, updateVideoLink } from "@/app/actions/videos";
import { SubmitButton } from "@/components/submit-button";
import { Video, ExternalLink, Edit2, CheckCircle2, Clock, X, ChevronDown, ChevronUp } from "lucide-react";
import { useLiveSync } from "@/hooks/use-live-sync";

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
  const [editingVideo, setEditingVideo] = useState<CompletedVideo | null>(null);

  const [submitState, submitAction] = useFormState(submitVideo, null);
  const [editState, editAction] = useFormState(updateVideoLink, null);

  // Auto-sync every 4.5 seconds
  useLiveSync(4500);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-lg font-bold text-zinc-900">Video Tasks</h1>
        <p className="text-xs text-zinc-500">Produce videos from assigned scripts and paste CapCut links</p>
      </div>

      {/* Edit CapCut Link Modal */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80">
              <div className="flex items-center gap-2">
                <Edit2 className="w-3.5 h-3.5 text-pink-600" />
                <h3 className="text-xs font-bold text-zinc-900">Edit CapCut Video Link</h3>
              </div>
              <button onClick={() => setEditingVideo(null)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-[11px] text-zinc-500 mb-3">
                Video: <span className="font-semibold text-zinc-800">{editingVideo.script.title}</span> (
                {editingVideo.script.channel.name})
              </p>
              {editState?.error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg p-2.5 mb-3">
                  {editState.error}
                </div>
              )}
              <form
                action={async (fd) => {
                  await editAction(fd);
                  setEditingVideo(null);
                }}
                className="space-y-3"
              >
                <input type="hidden" name="videoId" value={editingVideo.id} />
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">CapCut Link URL</label>
                  <input
                    name="capCutLink"
                    required
                    defaultValue={editingVideo.capCutLink}
                    placeholder="https://..."
                    className="w-full px-2.5 py-1.5 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:bg-white focus:border-pink-500/50 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setEditingVideo(null)}
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

      {/* Section 1: Pending Scripts */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Pending Scripts Awaiting Video ({assignedScripts.length})
          </h2>
        </div>

        {assignedScripts.length === 0 ? (
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-4 text-center">
            <p className="text-xs text-zinc-500">No scripts assigned right now. All caught up! 🎉</p>
          </div>
        ) : (
          <div className="space-y-2">
            {assignedScripts.map((script) => {
              const isOpen = activeScript?.id === script.id;

              return (
                <div
                  key={script.id}
                  className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden hover:border-zinc-300 transition-colors"
                >
                  <div
                    className="p-3 cursor-pointer flex items-center justify-between gap-3"
                    onClick={() => setActiveScript(isOpen ? null : script)}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-zinc-900 truncate">{script.title}</h3>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium flex-none">
                          Ready for Video
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {script.channel.name} · by {script.writer.name} · {new Date(script.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-none">
                      <div className="flex gap-1">
                        {script.channel.platforms.map((p) => (
                          <span
                            key={p.platformName}
                            className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-zinc-100 text-zinc-600 capitalize"
                          >
                            {p.platformName}
                          </span>
                        ))}
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                    </div>
                  </div>

                  {/* Compact Script Content & Submission Drawer */}
                  {isOpen && (
                    <div className="border-t border-zinc-100 p-3 bg-zinc-50/60 space-y-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase text-zinc-500 mb-1">Script Content</div>
                        <div className="bg-white border border-zinc-200 rounded-lg p-2.5 max-h-[220px] overflow-y-auto">
                          <pre className="text-xs text-zinc-800 whitespace-pre-wrap font-mono leading-relaxed">
                            {script.content}
                          </pre>
                        </div>
                      </div>

                      {/* Extra Field Boxes */}
                      {(() => {
                        const extras = script.extraFields as { label: string; value: string }[] | null;
                        if (!extras || !Array.isArray(extras) || extras.length === 0) return null;
                        return (
                          <div className="grid grid-cols-2 gap-2">
                            {extras.map((f, i) => (
                              <div key={i} className="bg-white border border-zinc-200 rounded-md p-1.5 text-xs">
                                <span className="text-[10px] font-semibold text-zinc-400 uppercase block">{String(f.label)}</span>
                                <span className="text-zinc-800 font-medium text-[11px]">{String(f.value)}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}

                      {/* Submit CapCut Link Input */}
                      {submitState?.error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg p-2 mb-2">
                          {submitState.error}
                        </div>
                      )}
                      <form action={submitAction} className="flex gap-2 items-center">
                        <input type="hidden" name="scriptId" value={script.id} />
                        <input
                          name="capCutLink"
                          required
                          placeholder="Paste your completed CapCut video link..."
                          className="flex-1 px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:border-pink-500/50 focus:outline-none"
                        />
                        <SubmitButton pendingText="Submitting...">Submit Video ✓</SubmitButton>
                      </form>
                      <p className="text-[10px] text-zinc-400">
                        Submitting will auto-create platform tasks for:{" "}
                        {script.channel.platforms.map((p) => p.platformName).join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Completed Videos */}
      <div>
        <h2 className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Completed Videos ({completedVideos.length})
        </h2>

        {completedVideos.length === 0 ? (
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-4 text-center">
            <p className="text-xs text-zinc-500">No videos completed yet.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {completedVideos.map((v) => (
              <div
                key={v.id}
                className="bg-white border border-zinc-200 shadow-xs rounded-xl p-3 flex items-center justify-between gap-3 hover:border-zinc-300 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-zinc-900 truncate">{v.script.title}</h3>
                    <span className="text-[10px] text-zinc-400">· {v.script.channel.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <a
                      href={v.capCutLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded"
                    >
                      CapCut Link <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <button
                      onClick={() => setEditingVideo(v)}
                      className="inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-900 px-1.5 py-0.5 rounded hover:bg-zinc-100 transition-colors"
                    >
                      <Edit2 className="w-2.5 h-2.5" /> Edit Link
                    </button>
                  </div>
                </div>

                {/* Platform Status Pills */}
                <div className="flex gap-1 flex-wrap flex-none">
                  {v.platformTasks.map((t) => (
                    <span
                      key={t.id}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-semibold capitalize border ${
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
