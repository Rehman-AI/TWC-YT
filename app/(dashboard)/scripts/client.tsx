"use client";

import { useState, useMemo } from "react";
import { useFormState } from "react-dom";
import { createScript, updateScript } from "@/app/actions/scripts";
import { SubmitButton } from "@/components/submit-button";
import { Edit2, Plus, X, ExternalLink, Filter } from "lucide-react";
import { useLiveSync } from "@/hooks/use-live-sync";

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
  const [isEditing, setIsEditing] = useState(false);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);

  const [createExtraFields, setCreateExtraFields] = useState<ExtraField[]>([]);
  const [editExtraFields, setEditExtraFields] = useState<ExtraField[]>([]);
  const [editStatus, setEditStatus] = useState<string>("DRAFT");

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [memberFilter, setMemberFilter] = useState<string>("ALL");

  const [createState, createAction] = useFormState(createScript, null);
  const [editState, editAction] = useFormState(updateScript, null);

  // Auto-sync every 4.5 seconds
  useLiveSync(4500);

  const statusColors: Record<string, string> = {
    DRAFT: "bg-amber-50 text-amber-700 border border-amber-200",
    ASSIGNED: "bg-blue-50 text-blue-700 border border-blue-200",
    VIDEO_DONE: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };

  const allMembers = useMemo(() => {
    const map = new Map<string, string>();
    scripts.forEach((s) => {
      if (s.writer?.id) map.set(s.writer.id, s.writer.name);
      if (s.videoMaker?.id) map.set(s.videoMaker.id, s.videoMaker.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [scripts]);

  const filteredScripts = useMemo(() => {
    return scripts.filter((s) => {
      if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
      if (memberFilter !== "ALL") {
        const isWriter = s.writer?.id === memberFilter;
        const isMaker = s.videoMaker?.id === memberFilter;
        if (!isWriter && !isMaker) return false;
      }
      return true;
    });
  }, [scripts, statusFilter, memberFilter]);

  const startEdit = (script: Script) => {
    setIsEditing(true);
    setShowForm(false);
    setEditStatus(script.status);
    const extras = script.extraFields as ExtraField[] | null;
    setEditExtraFields(Array.isArray(extras) ? [...extras] : []);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-zinc-900">Script Board</h1>
          <p className="text-xs text-zinc-500">Write scripts and assign to video makers</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setIsEditing(false);
            setSelectedScript(null);
            setCreateExtraFields([]);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#8c0f60] to-[#e8227a] text-white text-xs font-semibold rounded-lg hover:shadow-md hover:shadow-pink-500/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          New Script
        </button>
      </div>

      <div className="grid grid-cols-[300px_1fr] gap-4 min-h-[calc(100vh-180px)]">
        {/* Left Script List */}
        <div className="bg-white border border-zinc-200 shadow-xs rounded-xl flex flex-col overflow-hidden">
          <div className="p-2.5 border-b border-zinc-100 bg-zinc-50/50 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-700">
              <span className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-zinc-400" />
                Scripts ({filteredScripts.length}{filteredScripts.length !== scripts.length ? ` / ${scripts.length}` : ""})
              </span>
              {(statusFilter !== "ALL" || memberFilter !== "ALL") && (
                <button
                  onClick={() => {
                    setStatusFilter("ALL");
                    setMemberFilter("ALL");
                  }}
                  className="text-[10px] text-pink-600 hover:text-pink-700 font-semibold"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {(["ALL", "DRAFT", "ASSIGNED", "VIDEO_DONE"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all whitespace-nowrap ${
                    statusFilter === st
                      ? "bg-zinc-900 text-white shadow-xs"
                      : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
                  }`}
                >
                  {st === "ALL" ? "All" : st === "VIDEO_DONE" ? "Video Done" : st.charAt(0) + st.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Member Filter Dropdown */}
            <select
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              className="w-full px-2 py-1 bg-white border border-zinc-200 rounded-md text-[11px] text-zinc-700 focus:outline-none focus:border-pink-500/50"
            >
              <option value="ALL">All Members</option>
              {allMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredScripts.length === 0 ? (
              <p className="text-xs text-zinc-400 p-4 text-center">No scripts match filters.</p>
            ) : (
              filteredScripts.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedScript(s);
                    setShowForm(false);
                    setIsEditing(false);
                  }}
                  className={`p-2.5 rounded-lg cursor-pointer transition-all border ${
                    selectedScript?.id === s.id && !showForm
                      ? "bg-pink-50/80 border-pink-200"
                      : "border-transparent hover:bg-zinc-50"
                  }`}
                >
                  <div className="text-xs font-bold text-zinc-900 mb-0.5 truncate">{s.title}</div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className={`px-1.5 py-0.2 rounded font-semibold ${statusColors[s.status] || "bg-zinc-100 text-zinc-600"}`}>
                      {s.status}
                    </span>
                    <span className="text-zinc-500 truncate">{s.channel.name}</span>
                    {s.videoMaker && <span className="text-zinc-600 font-medium">→ {s.videoMaker.name}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Form, Edit Mode, or Viewer */}
        <div className="bg-white border border-zinc-200 shadow-xs rounded-xl flex flex-col overflow-hidden">
          {/* Create New Script Form */}
          {showForm ? (
            <div className="p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-3 border-b border-zinc-100 pb-2">
                <h3 className="text-xs font-bold text-zinc-900">New Script</h3>
                <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-zinc-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {createState?.error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg p-2.5 mb-3">
                  {createState.error}
                </div>
              )}
              <form
                action={async (formData) => {
                  formData.set("extraFields", JSON.stringify(createExtraFields));
                  await createAction(formData);
                  if (!createState?.error) {
                    setShowForm(false);
                    setCreateExtraFields([]);
                  }
                }}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Title</label>
                    <input
                      name="title"
                      required
                      placeholder="Script title"
                      className="w-full px-2.5 py-1.5 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:bg-white focus:border-pink-500/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Channel</label>
                    <select
                      name="channelId"
                      required
                      className="w-full px-2.5 py-1.5 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:bg-white focus:border-pink-500/50 focus:outline-none"
                    >
                      <option value="">Select channel</option>
                      {channels.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Script Content</label>
                  <textarea
                    name="content"
                    required
                    rows={10}
                    placeholder="Paste or write your script here... No limit."
                    className="w-full px-2.5 py-1.5 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:bg-white focus:border-pink-500/50 focus:outline-none resize-y font-mono leading-relaxed"
                  />
                </div>

                {/* Extra Fields */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-zinc-700">Extra Fields</label>
                    <button
                      type="button"
                      onClick={() => setCreateExtraFields([...createExtraFields, { label: "", value: "" }])}
                      className="text-[11px] text-pink-600 hover:text-pink-700 font-semibold"
                    >
                      + Add Field
                    </button>
                  </div>
                  {createExtraFields.map((f, i) => (
                    <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 mb-2">
                      <input
                        placeholder="Label"
                        value={f.label}
                        onChange={(e) => {
                          const n = [...createExtraFields];
                          n[i].label = e.target.value;
                          setCreateExtraFields(n);
                        }}
                        className="px-2 py-1 bg-zinc-50/50 border border-zinc-200 rounded-md text-zinc-900 text-xs focus:bg-white focus:outline-none"
                      />
                      <input
                        placeholder="Value"
                        value={f.value}
                        onChange={(e) => {
                          const n = [...createExtraFields];
                          n[i].value = e.target.value;
                          setCreateExtraFields(n);
                        }}
                        className="px-2 py-1 bg-zinc-50/50 border border-zinc-200 rounded-md text-zinc-900 text-xs focus:bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setCreateExtraFields(createExtraFields.filter((_, j) => j !== i))}
                        className="text-xs text-zinc-400 hover:text-red-600 px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Assign to Video Maker (optional)
                  </label>
                  <select
                    name="videoMakerId"
                    className="w-full px-2.5 py-1.5 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:bg-white focus:border-pink-500/50 focus:outline-none"
                  >
                    <option value="">Don&apos;t assign yet</option>
                    {videoMakers.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-800"
                  >
                    Cancel
                  </button>
                  <SubmitButton pendingText="Saving...">Save Script</SubmitButton>
                </div>
              </form>
            </div>
          ) : isEditing && selectedScript ? (
            /* Edit Script Mode */
            <div className="p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-3 border-b border-zinc-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <Edit2 className="w-3.5 h-3.5 text-pink-600" />
                  <h3 className="text-xs font-bold text-zinc-900">Edit Script</h3>
                </div>
                <button onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-zinc-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {editState?.error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg p-2.5 mb-3">
                  {editState.error}
                </div>
              )}

              <form
                action={async (formData) => {
                  formData.set("extraFields", JSON.stringify(editExtraFields));
                  await editAction(formData);
                  setIsEditing(false);
                }}
                className="space-y-3"
              >
                <input type="hidden" name="id" value={selectedScript.id} />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Title</label>
                    <input
                      name="title"
                      required
                      defaultValue={selectedScript.title}
                      className="w-full px-2.5 py-1.5 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:bg-white focus:border-pink-500/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Channel</label>
                    <select
                      name="channelId"
                      defaultValue={selectedScript.channel.id}
                      className="w-full px-2.5 py-1.5 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:bg-white focus:border-pink-500/50 focus:outline-none"
                    >
                      {channels.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Script Content</label>
                  <textarea
                    name="content"
                    required
                    rows={10}
                    defaultValue={selectedScript.content}
                    className="w-full px-2.5 py-1.5 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:bg-white focus:border-pink-500/50 focus:outline-none resize-y font-mono leading-relaxed"
                  />
                </div>

                {/* Extra Fields */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-zinc-700">Extra Fields</label>
                    <button
                      type="button"
                      onClick={() => setEditExtraFields([...editExtraFields, { label: "", value: "" }])}
                      className="text-[11px] text-pink-600 hover:text-pink-700 font-semibold"
                    >
                      + Add Field
                    </button>
                  </div>
                  {editExtraFields.map((f, i) => (
                    <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 mb-2">
                      <input
                        placeholder="Label"
                        value={f.label}
                        onChange={(e) => {
                          const n = [...editExtraFields];
                          n[i].label = e.target.value;
                          setEditExtraFields(n);
                        }}
                        className="px-2 py-1 bg-zinc-50/50 border border-zinc-200 rounded-md text-zinc-900 text-xs focus:bg-white focus:outline-none"
                      />
                      <input
                        placeholder="Value"
                        value={f.value}
                        onChange={(e) => {
                          const n = [...editExtraFields];
                          n[i].value = e.target.value;
                          setEditExtraFields(n);
                        }}
                        className="px-2 py-1 bg-zinc-50/50 border border-zinc-200 rounded-md text-zinc-900 text-xs focus:bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setEditExtraFields(editExtraFields.filter((_, j) => j !== i))}
                        className="text-xs text-zinc-400 hover:text-red-600 px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:bg-white focus:border-pink-500/50 focus:outline-none"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="ASSIGNED">Assigned</option>
                      <option value="VIDEO_DONE">Video Done</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Video Maker</label>
                    <select
                      name="videoMakerId"
                      defaultValue={selectedScript.videoMaker?.id || ""}
                      className="w-full px-2.5 py-1.5 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:bg-white focus:border-pink-500/50 focus:outline-none"
                    >
                      <option value="">Unassigned</option>
                      {videoMakers.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {editStatus === "VIDEO_DONE" && !selectedScript.video && (
                  <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-3 space-y-1">
                    <label className="block text-[11px] font-semibold text-emerald-900">
                      CapCut / Video Link <span className="text-emerald-600 font-normal">(Optional - creates video & platform tasks)</span>
                    </label>
                    <input
                      name="capCutLink"
                      placeholder="https://www.capcut.com/..."
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-md text-zinc-900 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-800"
                  >
                    Cancel
                  </button>
                  <SubmitButton pendingText="Updating...">Update Script</SubmitButton>
                </div>
              </form>
            </div>
          ) : selectedScript ? (
            /* Script Details View */
            <div className="p-4 overflow-y-auto space-y-3">
              <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">{selectedScript.title}</h2>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Channel: <span className="font-semibold text-zinc-800">{selectedScript.channel.name}</span> · Writer:{" "}
                    <span className="font-medium text-zinc-700">{selectedScript.writer.name}</span>
                    {selectedScript.videoMaker && ` · Assigned to ${selectedScript.videoMaker.name}`}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-none">
                  <button
                    onClick={() => startEdit(selectedScript)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-zinc-600 hover:text-zinc-900 px-2 py-1 rounded-md border border-zinc-200 hover:bg-zinc-50 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusColors[selectedScript.status]}`}>
                    {selectedScript.status}
                  </span>
                </div>
              </div>

              {selectedScript.video && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-emerald-700 uppercase">CapCut Video Link</div>
                    <a
                      href={selectedScript.video.capCutLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline break-all font-medium inline-flex items-center gap-1 mt-0.5"
                    >
                      {selectedScript.video.capCutLink} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              <div className="bg-zinc-50/60 border border-zinc-200 rounded-lg p-3">
                <pre className="text-xs text-zinc-800 whitespace-pre-wrap font-mono leading-relaxed">
                  {selectedScript.content}
                </pre>
              </div>

              {(() => {
                const extras = selectedScript.extraFields as ExtraField[] | null;
                if (!extras || !Array.isArray(extras) || extras.length === 0) return null;
                return (
                  <div className="space-y-1.5 pt-1">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Extra Fields</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {extras.map((f: ExtraField, i: number) => (
                        <div key={i} className="bg-zinc-50 border border-zinc-200 rounded-md p-2">
                          <span className="text-[10px] font-semibold text-zinc-400 block uppercase">{String(f.label)}</span>
                          <span className="text-zinc-800 font-medium text-xs">{String(f.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <p className="text-xs text-zinc-400">Select a script from the left to view, or click &quot;+ New Script&quot;.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
