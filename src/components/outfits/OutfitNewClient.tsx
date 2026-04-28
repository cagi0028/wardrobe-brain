"use client";
import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Check, X, ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { cn, COLOUR_HEX, OCCASIONS, SEASONS } from "@/lib/utils";
import { Toast, useToast } from "@/components/ui";
import { saveOutfit } from "@/lib/data";
import type { Colour, Occasion, Season } from "@/types";

interface BuilderItem {
  id: string; name: string; category: string;
  colours: string[]; brand: string | null; image_url: string | null;
}

const CAT_TABS = ["All","Top","Bottom","Dress","Jumpsuit","Outerwear","Shoes","Bag","Accessory","Other"];

export function OutfitNewClient({ items }: { items: BuilderItem[] }) {
  const router = useRouter();
  const { toast, showLoading, showSuccess, showError, dismiss } = useToast();
  const [step, setStep]         = useState<"pick"|"details">("pick");
  const [selected, setSelected] = useState<BuilderItem[]>([]);
  const [search, setSearch]     = useState("");
  const [cat, setCat]           = useState("All");
  const [name, setName]         = useState("");
  const [occasion, setOccasion] = useState<Occasion|"">("");
  const [season, setSeason]     = useState<Season|"">("");
  const [notes, setNotes]       = useState("");
  const [saving, setSaving]     = useState(false);

  const displayed = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((i) => {
      if (cat !== "All" && i.category !== cat) return false;
      if (q && !i.name.toLowerCase().includes(q) && !i.brand?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, search, cat]);

  const usedCats = useMemo(() => {
    const s = new Set(items.map((i) => i.category));
    return CAT_TABS.filter((c) => c === "All" || s.has(c));
  }, [items]);

  const isSel = (id: string) => selected.some((s) => s.id === id);
  const toggle = useCallback((item: BuilderItem) =>
    setSelected((p) => p.some((s) => s.id === item.id) ? p.filter((s) => s.id !== item.id) : [...p, item]), []);

  const handleSave = async () => {
    setSaving(true);
    showLoading("Saving outfit…");
    const r = await saveOutfit(name, selected.map((item, i) => ({ item_id: item.id, slot: item.category, sort_order: i + 1 })), notes);
    setSaving(false);
    if (!r.ok) { showError(r.error); return; }
    showSuccess("Outfit saved!");
    await new Promise((res) => setTimeout(res, 500));
    router.push(`/outfits/${r.data.id}`);
  };

  return (
    <>
      <Toast toast={toast} onDismiss={dismiss} />
      <div className="min-h-screen bg-stone-50 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-stone-50/95 backdrop-blur-md border-b border-stone-200/60">
          <div className="flex items-center gap-2 px-4 h-14">
            <button onClick={() => step === "details" ? setStep("pick") : router.back()}
              className="p-2 -ml-2 rounded-xl hover:bg-stone-100 text-stone-600">
              <ChevronLeft size={22} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-stone-900 text-lg leading-none">
                {step === "pick" ? "Choose items" : "Name this outfit"}
              </h1>
              {step === "pick" && (
                <p className="text-xs text-stone-400 mt-0.5">
                  {selected.length === 0 ? "Tap to select" : `${selected.length} selected`}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <div className={cn("w-2 h-2 rounded-full", step === "pick" ? "bg-stone-800" : "bg-stone-300")} />
              <div className={cn("w-2 h-2 rounded-full", step === "details" ? "bg-stone-800" : "bg-stone-300")} />
            </div>
          </div>
        </div>

        {step === "pick" ? (
          <div className="flex flex-col flex-1 pb-28">
            {/* Search */}
            <div className="px-4 pt-3 pb-2">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items…"
                  className="w-full pl-9 pr-4 py-2.5 bg-stone-100 rounded-2xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300" />
              </div>
            </div>
            {/* Category tabs */}
            <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
              {usedCats.map((c) => (
                <button key={c} onClick={() => setCat(c)}
                  className={cn("flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95",
                    cat === c ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200 hover:border-stone-400")}>
                  {c}
                </button>
              ))}
            </div>
            {/* Selected strip */}
            {selected.length > 0 && (
              <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
                {selected.map((item) => <SelThumb key={item.id} item={item} onRemove={() => toggle(item)} />)}
              </div>
            )}
            {/* Grid */}
            {displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <Sparkles size={28} className="text-stone-300 mb-3" />
                <p className="text-sm text-stone-500">No items match</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5 px-4">
                {displayed.map((item) => {
                  const hex = COLOUR_HEX[item.colours[0] as Colour] ?? "#E8E5DC";
                  return (
                    <button key={item.id} onClick={() => toggle(item)} className="flex flex-col gap-1.5 text-left group">
                      <div className={cn(
                        "relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-stone-100 transition-all",
                        isSel(item.id) ? "ring-2 ring-stone-900 ring-offset-1" : "hover:opacity-90"
                      )}>
                        {item.image_url
                          ? <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="(max-width:448px) 33vw,150px" />
                          : <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: hex + "28" }}>
                              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: hex }} />
                            </div>}
                        {isSel(item.id) && (
                          <div className="absolute inset-0 bg-stone-900/20 flex items-end justify-end p-1.5">
                            <div className="w-6 h-6 bg-stone-900 rounded-full flex items-center justify-center shadow-sm">
                              <Check size={13} className="text-white" strokeWidth={3} />
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-1.5 left-1.5">
                          <span className="text-[9px] font-semibold text-white/80 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <div className="px-0.5">
                        <p className="text-xs font-medium text-stone-800 line-clamp-1 leading-tight">{item.name}</p>
                        {item.brand && <p className="text-[10px] text-stone-400 truncate">{item.brand}</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {/* CTA */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-100">
              <div className="max-w-md mx-auto px-4 pt-3 pb-safe"><div className="pb-3">
                <button onClick={() => setStep("details")} disabled={selected.length === 0}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-sm transition-all active:scale-[0.98]",
                    selected.length === 0 ? "bg-stone-200 text-stone-400 cursor-not-allowed" : "bg-stone-900 text-white shadow-float hover:bg-stone-800"
                  )}>
                  Continue with {selected.length} item{selected.length !== 1 ? "s" : ""}
                  <ChevronRight size={16} />
                </button>
              </div></div>
            </div>
          </div>
        ) : (
          <div className="flex-1 pb-32">
            {/* Selected preview */}
            <div className="px-4 pt-4 pb-5">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">{selected.length} items</p>
              <div className="flex gap-2 flex-wrap">
                {selected.map((item) => <SelThumb key={item.id} item={item} large onRemove={() => setSelected((p) => p.filter((s) => s.id !== item.id))} />)}
              </div>
            </div>
            <div className="px-4 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                  Outfit name <span className="text-stone-300 font-normal normal-case">optional</span>
                </label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Friday Office" autoFocus
                  className="w-full px-4 py-3 rounded-2xl bg-stone-100 text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" />
                {!name && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["Friday Office","Weekend Casual","Summer Brunch","Date Night","Smart Casual"].map((s) => (
                      <button key={s} onClick={() => setName(s)} className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">{s}</button>
                    ))}
                  </div>
                )}
              </div>
              {/* Occasion */}
              <div>
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                  Occasion <span className="text-stone-300 font-normal normal-case">optional</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map((o) => (
                    <button key={o} onClick={() => setOccasion(occasion === o ? "" : o as Occasion)}
                      className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95",
                        occasion === o ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200 hover:border-stone-400")}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              {/* Season */}
              <div>
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                  Season <span className="text-stone-300 font-normal normal-case">optional</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SEASONS.map((s) => (
                    <button key={s} onClick={() => setSeason(season === s ? "" : s as Season)}
                      className={cn("py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95",
                        season === s ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200 hover:border-stone-400")}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                  Notes <span className="text-stone-300 font-normal normal-case">optional</span>
                </label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything to remember about this outfit…" rows={3} maxLength={500}
                  className="w-full px-4 py-3 rounded-2xl bg-stone-100 text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none" />
              </div>
            </div>
            {/* Save CTA */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-100">
              <div className="max-w-md mx-auto px-4 pt-3 pb-safe"><div className="pb-3">
                <button onClick={handleSave} disabled={saving}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-sm transition-all active:scale-[0.98]",
                    saving ? "bg-stone-200 text-stone-400" : "bg-stone-900 text-white shadow-float hover:bg-stone-800"
                  )}>
                  {saving ? <><Loader2 size={16} className="animate-spin" />Saving…</> : <><Sparkles size={16} />Save outfit</>}
                </button>
              </div></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function SelThumb({ item, onRemove, large }: { item: BuilderItem; onRemove: () => void; large?: boolean }) {
  const hex = COLOUR_HEX[item.colours[0] as Colour] ?? "#E8E5DC";
  const size = large ? "w-16 h-16" : "w-12 h-12";
  return (
    <div className={cn("relative flex-shrink-0 rounded-2xl overflow-hidden bg-stone-100 group", size)}>
      {item.image_url
        ? <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="64px" />
        : <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: hex + "28" }}>
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: hex }} />
          </div>}
      <button onClick={onRemove}
        className="absolute -top-1 -right-1 w-5 h-5 bg-stone-900 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity">
        <X size={10} className="text-white" />
      </button>
    </div>
  );
}
