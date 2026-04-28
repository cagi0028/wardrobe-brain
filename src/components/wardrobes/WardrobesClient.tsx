"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ChevronRight, Pencil, Trash2, Package, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toast, useToast, BottomSheet } from "@/components/ui";
import { createWardrobe, updateWardrobe, deleteWardrobe, createSection, updateSection, deleteSection } from "@/lib/data";
import type { WardrobeWithSections } from "@/types";

type Sheet =
  | null
  | { type: "add-wardrobe" }
  | { type: "edit-wardrobe";  id: string; name: string; description: string }
  | { type: "del-wardrobe";   id: string; name: string; itemCount: number }
  | { type: "add-section";    wardrobeId: string; wardrobeName: string }
  | { type: "edit-section";   sectionId: string; wardrobeId: string; name: string }
  | { type: "del-section";    sectionId: string; wardrobeId: string; name: string; itemCount: number };

export function WardrobesClient({ initialWardrobes }: { initialWardrobes: WardrobeWithSections[] }) {
  const router = useRouter();
  const { toast, showLoading, showSuccess, showError, dismiss } = useToast();
  const [wardrobes, setWardrobes] = useState(initialWardrobes);
  const [sheet, setSheet]   = useState<Sheet>(null);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(initialWardrobes.map((w) => w.id)));

  const run = async (fn: () => Promise<void>) => { setSaving(true); try { await fn(); } finally { setSaving(false); } };

  const addWardrobe = (name: string, desc: string) => run(async () => {
    showLoading("Adding…");
    const r = await createWardrobe(name, desc);
    if (!r.ok) { showError(r.error); return; }
    const now = new Date().toISOString();
    setWardrobes((p) => [...p, { id: r.data.id, user_id: "", name, description: desc || null, sort_order: p.length + 1, created_at: now, updated_at: now, sections: [], total_items: 0 }]);
    setExpanded((p) => new Set([...p, r.data.id]));
    setSheet(null); showSuccess(`"${name}" added`);
  });

  const editWardrobe = (id: string, name: string, desc: string) => run(async () => {
    showLoading("Saving…");
    const r = await updateWardrobe(id, name, desc);
    if (!r.ok) { showError(r.error); return; }
    setWardrobes((p) => p.map((w) => w.id === id ? { ...w, name, description: desc || null } : w));
    setSheet(null); showSuccess("Updated");
  });

  const removeWardrobe = (id: string) => run(async () => {
    showLoading("Deleting…");
    const r = await deleteWardrobe(id);
    if (!r.ok) { showError(r.error); return; }
    setWardrobes((p) => p.filter((w) => w.id !== id));
    setSheet(null); showSuccess("Deleted"); router.refresh();
  });

  const addSection = (wardrobeId: string, name: string) => run(async () => {
    showLoading("Adding section…");
    const r = await createSection(wardrobeId, name);
    if (!r.ok) { showError(r.error); return; }
    const now = new Date().toISOString();
    setWardrobes((p) => p.map((w) => w.id === wardrobeId ? { ...w, sections: [...w.sections, { id: r.data.id, wardrobe_id: wardrobeId, name, sort_order: w.sections.length + 1, item_count: 0, created_at: now, updated_at: now }] } : w));
    setSheet(null); showSuccess("Section added");
  });

  const editSection = (sectionId: string, wardrobeId: string, name: string) => run(async () => {
    showLoading("Saving…");
    const r = await updateSection(sectionId, name);
    if (!r.ok) { showError(r.error); return; }
    setWardrobes((p) => p.map((w) => w.id === wardrobeId ? { ...w, sections: w.sections.map((s) => s.id === sectionId ? { ...s, name } : s) } : w));
    setSheet(null); showSuccess("Updated");
  });

  const removeSection = (sectionId: string, wardrobeId: string) => run(async () => {
    showLoading("Removing…");
    const r = await deleteSection(sectionId);
    if (!r.ok) { showError(r.error); return; }
    setWardrobes((p) => p.map((w) => w.id === wardrobeId ? { ...w, sections: w.sections.filter((s) => s.id !== sectionId) } : w));
    setSheet(null); showSuccess("Removed");
  });

  const totalItems = wardrobes.reduce((n, w) => n + w.total_items, 0);

  return (
    <>
      <Toast toast={toast} onDismiss={dismiss} />

      <div className="sticky top-0 z-30 bg-stone-50/95 backdrop-blur-md border-b border-stone-200/60">
        <div className="flex items-center justify-between px-4 h-14">
          <div>
            <h1 className="font-semibold text-stone-900 text-lg leading-none">Storage</h1>
            <p className="text-xs text-stone-400">{wardrobes.length} wardrobe{wardrobes.length !== 1 ? "s" : ""} · {totalItems} items</p>
          </div>
          <button onClick={() => setSheet({ type: "add-wardrobe" })}
            className="flex items-center gap-1.5 bg-stone-900 text-white text-xs font-semibold px-3.5 py-2 rounded-full active:scale-95 transition-transform">
            <Plus size={14} />Add wardrobe
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3 pb-28">
        {wardrobes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-3xl bg-stone-100 flex items-center justify-center mb-5">
              <MapPin size={32} className="text-stone-300" />
            </div>
            <h3 className="font-semibold text-stone-800 mb-2">No wardrobes yet</h3>
            <p className="text-sm text-stone-400 mb-6 max-w-xs leading-relaxed">Add wardrobes to track exactly where each item lives.</p>
            <button onClick={() => setSheet({ type: "add-wardrobe" })}
              className="flex items-center gap-2 bg-stone-900 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-float">
              <Plus size={16} />Add first wardrobe
            </button>
          </div>
        ) : wardrobes.map((w) => (
          <div key={w.id} className="bg-white rounded-3xl shadow-card overflow-hidden">
            {/* Wardrobe header */}
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center flex-shrink-0">
                  <Package size={18} className="text-stone-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <button onClick={() => setExpanded((p) => { const n = new Set(p); n.has(w.id) ? n.delete(w.id) : n.add(w.id); return n; })}
                    className="flex items-center gap-1.5 w-full text-left">
                    <h2 className="font-semibold text-stone-900 text-base leading-tight flex-1">{w.name}</h2>
                    <ChevronRight size={16} className={cn("text-stone-400 flex-shrink-0 transition-transform duration-200", expanded.has(w.id) && "rotate-90")} />
                  </button>
                  {w.description && <p className="text-xs text-stone-400 mt-0.5">{w.description}</p>}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-stone-400"><span className="font-semibold text-stone-600">{w.sections.length}</span> sections</span>
                    <Link href={`/items?wardrobe=${w.id}`} className="text-xs text-stone-400 hover:text-stone-700">
                      {w.total_items} items →
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Btn onClick={() => setSheet({ type: "edit-wardrobe", id: w.id, name: w.name, description: w.description ?? "" })} label="Edit">
                    <Pencil size={14} />
                  </Btn>
                  <Btn onClick={() => setSheet({ type: "del-wardrobe", id: w.id, name: w.name, itemCount: w.total_items })} label="Delete" danger>
                    <Trash2 size={14} />
                  </Btn>
                </div>
              </div>
            </div>

            {/* Sections */}
            {expanded.has(w.id) && (
              <div className="border-t border-stone-50">
                {w.sections.length === 0 ? (
                  <div className="px-4 py-4 text-center">
                    <p className="text-xs text-stone-400 mb-2">No sections.</p>
                    <button onClick={() => setSheet({ type: "add-section", wardrobeId: w.id, wardrobeName: w.name })}
                      className="text-xs font-semibold text-stone-700 hover:underline">Add first section →</button>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-50">
                    {w.sections.map((s) => (
                      <div key={s.id} className="flex items-center gap-3 pl-14 pr-3 py-2.5 hover:bg-stone-50 group">
                        <div className="w-1.5 h-1.5 rounded-full bg-stone-300 flex-shrink-0" />
                        <Link href={`/items?wardrobe=${w.id}&section=${s.id}`} className="flex-1 flex items-center gap-2 min-w-0">
                          <span className="text-sm text-stone-700 font-medium truncate">{s.name}</span>
                          <span className={cn("text-[10px] flex-shrink-0 px-2 py-0.5 rounded-full",
                            s.item_count > 0 ? "bg-stone-100 text-stone-500 font-semibold" : "text-stone-300")}>
                            {s.item_count > 0 ? s.item_count : "empty"}
                          </span>
                        </Link>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Btn sm onClick={() => setSheet({ type: "edit-section", sectionId: s.id, wardrobeId: w.id, name: s.name })} label="Edit">
                            <Pencil size={12} />
                          </Btn>
                          <Btn sm danger onClick={() => setSheet({ type: "del-section", sectionId: s.id, wardrobeId: w.id, name: s.name, itemCount: s.item_count })} label="Remove">
                            <Trash2 size={12} />
                          </Btn>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="px-4 py-3 border-t border-stone-50">
                  <button onClick={() => setSheet({ type: "add-section", wardrobeId: w.id, wardrobeName: w.name })}
                    className="flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-stone-800 group">
                    <div className="w-6 h-6 rounded-lg border-2 border-dashed border-stone-200 group-hover:border-stone-400 flex items-center justify-center transition-colors">
                      <Plus size={12} className="text-stone-300 group-hover:text-stone-500" />
                    </div>
                    Add section
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sheets */}
      <BottomSheet open={sheet?.type === "add-wardrobe"} onClose={() => setSheet(null)} title="New wardrobe">
        <WardrobeForm onSave={(n, d) => addWardrobe(n, d)} onClose={() => setSheet(null)} saving={saving} />
      </BottomSheet>
      <BottomSheet open={sheet?.type === "edit-wardrobe"} onClose={() => setSheet(null)} title="Edit wardrobe">
        {sheet?.type === "edit-wardrobe" && (
          <WardrobeForm initialName={sheet.name} initialDesc={sheet.description}
            onSave={(n, d) => editWardrobe(sheet.id, n, d)} onClose={() => setSheet(null)} saving={saving} />
        )}
      </BottomSheet>
      <BottomSheet open={sheet?.type === "del-wardrobe"} onClose={() => setSheet(null)} title="Delete wardrobe">
        {sheet?.type === "del-wardrobe" && (
          <div className="px-5 py-4 pb-8 space-y-5">
            <p className="text-sm text-stone-600">
              Delete "{sheet.name}"?{sheet.itemCount > 0 ? ` ${sheet.itemCount} items will become unassigned.` : " This can't be undone."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setSheet(null)} className="flex-1 bg-stone-100 text-stone-800 rounded-2xl py-3.5 font-semibold text-sm">Cancel</button>
              <button onClick={() => removeWardrobe(sheet.id)} disabled={saving}
                className="flex-1 bg-red-600 text-white rounded-2xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {saving && <Loader2 size={15} className="animate-spin" />}Delete
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
      <BottomSheet open={sheet?.type === "add-section"} onClose={() => setSheet(null)}
        title={sheet?.type === "add-section" ? `Add section — ${sheet.wardrobeName}` : "Add section"}>
        <SectionForm onSave={(n) => sheet?.type === "add-section" && addSection(sheet.wardrobeId, n)} onClose={() => setSheet(null)} saving={saving} />
      </BottomSheet>
      <BottomSheet open={sheet?.type === "edit-section"} onClose={() => setSheet(null)} title="Edit section">
        {sheet?.type === "edit-section" && (
          <SectionForm initialName={sheet.name}
            onSave={(n) => editSection(sheet.sectionId, sheet.wardrobeId, n)} onClose={() => setSheet(null)} saving={saving} />
        )}
      </BottomSheet>
      <BottomSheet open={sheet?.type === "del-section"} onClose={() => setSheet(null)} title="Remove section">
        {sheet?.type === "del-section" && (
          <div className="px-5 py-4 pb-8 space-y-5">
            <p className="text-sm text-stone-600">
              Remove "{sheet.name}"?{sheet.itemCount > 0 ? ` ${sheet.itemCount} items lose their section.` : ""}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setSheet(null)} className="flex-1 bg-stone-100 text-stone-800 rounded-2xl py-3.5 font-semibold text-sm">Cancel</button>
              <button onClick={() => removeSection(sheet.sectionId, sheet.wardrobeId)} disabled={saving}
                className="flex-1 bg-red-600 text-white rounded-2xl py-3.5 font-semibold text-sm disabled:opacity-50">
                Remove
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </>
  );
}

const W_SUGGESTIONS = ["Bedroom Wardrobe", "Spare Room Rail", "Chest of Drawers", "Shoe Rack", "Hallway Rail"];
const S_SUGGESTIONS = ["Left Side", "Right Side", "Top Shelf", "Bottom Shelf", "Hanging Rail", "Drawer 1", "Shoe Rack"];

function WardrobeForm({ initialName = "", initialDesc = "", onSave, onClose, saving }: {
  initialName?: string; initialDesc?: string;
  onSave: (n: string, d: string) => void; onClose: () => void; saving: boolean;
}) {
  const [name, setName] = useState(initialName);
  const [desc, setDesc] = useState(initialDesc);
  const cls = "w-full px-4 py-3 rounded-2xl bg-stone-100 text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300";
  return (
    <div className="px-5 py-4 space-y-4 pb-8">
      <div>
        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Name *</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bedroom Wardrobe" autoFocus className={cls} />
        {!name && <div className="flex flex-wrap gap-1.5 mt-2">{W_SUGGESTIONS.map((s) => <button key={s} onClick={() => setName(s)} className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">{s}</button>)}</div>}
      </div>
      <div>
        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Description <span className="text-stone-300 font-normal normal-case">optional</span></label>
        <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. Double rail, left of bedroom" className={cls} />
      </div>
      <div className="flex gap-3 pt-1">
        <button onClick={onClose} className="flex-1 bg-stone-100 text-stone-800 rounded-2xl py-3.5 font-semibold text-sm">Cancel</button>
        <button onClick={() => onSave(name, desc)} disabled={!name.trim() || saving}
          className="flex-1 bg-stone-900 text-white rounded-2xl py-3.5 font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2">
          {saving && <Loader2 size={15} className="animate-spin" />}Save
        </button>
      </div>
    </div>
  );
}

function SectionForm({ initialName = "", onSave, onClose, saving }: {
  initialName?: string; onSave: (n: string) => void; onClose: () => void; saving: boolean;
}) {
  const [name, setName] = useState(initialName);
  const cls = "w-full px-4 py-3 rounded-2xl bg-stone-100 text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300";
  return (
    <div className="px-5 py-4 space-y-4 pb-8">
      <div>
        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Section name *</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Left Side" autoFocus className={cls} />
        {!name && <div className="flex flex-wrap gap-1.5 mt-2">{S_SUGGESTIONS.map((s) => <button key={s} onClick={() => setName(s)} className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">{s}</button>)}</div>}
      </div>
      <div className="flex gap-3 pt-1">
        <button onClick={onClose} className="flex-1 bg-stone-100 text-stone-800 rounded-2xl py-3.5 font-semibold text-sm">Cancel</button>
        <button onClick={() => onSave(name)} disabled={!name.trim() || saving}
          className="flex-1 bg-stone-900 text-white rounded-2xl py-3.5 font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2">
          {saving && <Loader2 size={15} className="animate-spin" />}Save
        </button>
      </div>
    </div>
  );
}

function Btn({ children, onClick, label, danger, sm }: { children: React.ReactNode; onClick: () => void; label: string; danger?: boolean; sm?: boolean }) {
  return (
    <button onClick={onClick} aria-label={label}
      className={cn("rounded-xl flex items-center justify-center transition-colors",
        sm ? "w-6 h-6" : "w-8 h-8",
        danger ? "text-stone-400 hover:text-red-500 hover:bg-red-50" : "text-stone-400 hover:text-stone-700 hover:bg-stone-100")}>
      {children}
    </button>
  );
}
