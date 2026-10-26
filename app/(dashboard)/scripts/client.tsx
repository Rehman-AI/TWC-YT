"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { createScript } from "@/app/actions/scripts";
import { SubmitButton } from "@/components/submit-button";

type ExtraField = { label: string; value: string };

type Script = {
  id: string;
  title: string;
  content: string;
  extraFields: unknown;
  status: string;
  channel: { id: string; name: string };
  writer: { id: string; name: string };
  videoMaker: { id: string; name: string } | null;
  video: { id: string; capCutLink: string } | null;
  createdAt: Date;
};

type Channel = { id: string; name: string };
type VideoMaker = { id: string; name: string; email: string };

export function ScriptsClient({
  scripts,
  channels,
  videoMakers,
}: {
  scripts: Script[];
  channels: Channel[];
  videoMakers: VideoMaker[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [extraFields, setExtraFields] = useState<ExtraField[]>([]);
  const [state, formAction] = useFormState(createScript, null);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);

  const statusColors: Record<string, string> = {
    DRAFT: "bg-yellow-500/10 text-yellow-400",
    ASSIGNED: "bg-blue-500/10 text-blue-400",
    VIDEO_DONE: "bg-green-500/10 text-green-400",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Script Board</h1>
          <p className="text-sm text-zinc-500">Write scripts and assign to video makers</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setSelectedScript(null); }}
          className="px-4 py-2 bg-gradient-to-r from-[#8c0f60] to-[#e8227a] text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-pink-500/25 transition-all"
        >
          + New Script
        </button>
      </div>

      <div className="grid grid-cols-[340px_1fr] gap-4 min-h-[calc(100vh-180px)]">
        {/* Script List */}
        <div className="bg-white border border-zinc-200 shadow-sm rounded-xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-100 text-xs font-bold text-zinc-700 bg-zinc-50/50">
            All Scripts ({scripts.length})
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {scripts.length === 0 ? (
              <p className="text-sm text-zinc-500 p-4">No scripts yet.</p>
            ) : (
              scripts.map((s) => (
                <div
                  key={s.id}
                  onClick={() => { setSelectedScript(s); setShowForm(false); }}
                  className={`p-3 rounded-lg cursor-pointer transition-all mb-1 border ${
                    selectedScript?.id === s.id
                      ? "bg-pink-50/80 border-pink-200"
                      : "border-transparent hover:bg-zinc-50"
                  }`}
                >
                  <div className="text-[13px] font-semibold text-zinc-900 mb-1">{s.title}</div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${statusColors[s.status]}`}>
                      {s.status}
                    </span>
                    <span className="text-zinc-500">{s.channel.name}</span>
                    {s.videoMaker && <span className="text-zinc-600 font-medium">→ {s.videoMaker.name}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel — Form or Detail */}
        <div className="bg-white border border-zinc-200 shadow-sm rounded-xl flex flex-col overflow-hidden">
          {showForm ? (
            <div className="p-5 overflow-y-auto">
              <h3 className="text-sm font-bold text-zinc-900 mb-4">New Script</h3>
              {state?.error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">{state.error}</div>
              )}
              <form action={async (formData) => {
                formData.set("extraFields", JSON.stringify(extraFields));
                await formAction(formData);
                if (!state?.error) { setShowForm(false); setExtraFields([]); }
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Title</label>
                    <input name="title" required placeholder="Script title" className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:bg-white focus:border-pink-500/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Channel</label>
                    <select name="channelId" required className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:bg-white focus:border-pink-500/50 focus:outline-none">
                      <option value="">Select channel</option>
                      {channels.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Script Content</label>
                  <textarea name="content" required rows={10} placeholder="Paste or write your script here... No limit." className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:bg-white focus:border-pink-500/50 focus:outline-none resize-y font-mono" />
                </div>

                {/* Extra Fields */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-zinc-600">Extra Fields</label>
                    <button
                      type="button"
                      onClick={() => setExtraFields([...extraFields, { label: "", value: "" }])}
                      className="text-xs text-pink-600 hover:text-pink-700 font-semibold"
                    >
                      + Add Field
                    </button>
                  </div>
                  {extraFields.map((f, i) => (
                    <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 mb-2">
                      <input
                        placeholder="Label"
                        value={f.label}
                        onChange={(e) => {
                          const n = [...extraFields];
                          n[i].label = e.target.value;
                          setExtraFields(n);
                        }}
                        className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:bg-white focus:border-pink-500/50 focus:outline-none"
                      />
                      <input
                        placeholder="Value"
                        value={f.value}
                        onChange={(e) => {
                          const n = [...extraFields];
                          n[i].value = e.target.value;
                          setExtraFields(n);
                        }}
                        className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:bg-white focus:border-pink-500/50 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setExtraFields(extraFields.filter((_, j) => j !== i))}
                        className="text-xs text-zinc-400 hover:text-red-600 px-2"
                      >✕</button>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Assign to Video Maker (optional)</label>
                  <select name="videoMakerId" className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:bg-white focus:border-pink-500/50 focus:outline-none">
                    <option value="">Don&apos;t assign yet</option>
                    {videoMakers.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <SubmitButton pendingText="Saving...">Save Script</SubmitButton>
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-800">Cancel</button>
                </div>
              </form>
            </div>
          ) : selectedScript ? (
            <div className="p-5 overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">{selectedScript.title}</h2>
                  <div className="text-xs text-zinc-500 mt-1">
                    {selectedScript.channel.name} · by <span className="font-medium text-zinc-700">{selectedScript.writer.name}</span>
                    {selectedScript.videoMaker && ` · assigned to ${selectedScript.videoMaker.name}`}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusColors[selectedScript.status]}`}>
                  {selectedScript.status}
                </span>
              </div>
              {selectedScript.video && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
                  <div className="text-xs font-semibold text-emerald-700 mb-1">CapCut Video Link</div>
                  <a href={selectedScript.video.capCutLink} target="_blank" rel="noreferrer" className="text-sm text-pink-600 hover:underline break-all">
                    {selectedScript.video.capCutLink}
                  </a>
                </div>
              )}
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                <pre className="text-sm text-zinc-800 whitespace-pre-wrap font-mono leading-relaxed">{selectedScript.content}</pre>
              </div>
              {(() => {
                const extras = selectedScript.extraFields as ExtraField[] | null;
                if (!extras || !Array.isArray(extras) || extras.length === 0) return null;
                return (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-xs font-bold text-zinc-700">Extra Fields</h4>
                    {extras.map((f: ExtraField, i: number) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <span className="text-zinc-500 font-medium">{String(f.label)}:</span>
                        <span className="text-zinc-800">{String(f.value)}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-zinc-500">Select a script to view, or create a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
