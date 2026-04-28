"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, Heart, Calendar, MapPin, Trash2, X, Loader2, Sparkles } from "lucide-react";
import { cn, COLOUR_HEX, formatDate, formatRelative, OCCASIONS, getImg } from "@/lib/utils";
import { Toast, BottomSheet, useToast } from "@/components/ui";
import { logOutfitWorn, deleteOutfit } from "@/lib/data";
import type { Outfit, ClothingItem, Colour, Occasion } from "@/types";

interface Props {
  outfit: Outfit & { recentLogs: Array<{ worn_on: string; occasion: string | null }> };
}

export function OutfitDetailClient({ outfit }: Props) {
  const router = useRouter();
  const { toast, showLoading, showSuccess, showError, dismiss } = useToast();
  const [logOpen, setLogOpen]       = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const items  = outfit.items ?? [];
  const thumbs = items.slice(0, 4);
  const n      = thumbs.length;

  const handleLog = async (date: string, occ?: Occasion) => {
    setLogOpen(false);
    showLoading("Logging wear…");
    const r = await logOutfitWorn(outfit.id, items.map((i) => i.item_id), date, occ);
    if (!r.ok) { showError(r.error); return; }
    showSuccess("Outfit logged!");
    router.refresh();
  };

  const handleDelete = async () => {
    setDeleteOpen(false);
    showLoading("Deleting…");
    const r = await deleteOutfit(outfit.id);
    if (!r.ok) { showError(r.error); return; }
    router.push("/outfits");
  };

  return (
    <>
      <Toast toast={toast} onDismiss={dismiss} />
      <div className="min-h-screen bg-stone-50 pb-32">
        {/* Collage hero */}
        <div className="relative bg-stone-100 overflow-hidden" style={{ height: 240 }}>
          {n === 0 ? (
            <div className="w-full h-full flex items-center justify-center"><Sparkles size={40} className="text-stone-200" /></div>
          ) : n === 1 ? (
            <HCell item={thumbs[0].item} />
          ) : n === 2 ? (
            <div className="grid grid-cols-2 h-full gap-px">{thumbs.map((oi, i) => <HCell key={i} item={oi.item} />)}</div>
          ) : n === 3 ? (
            <div className="grid grid-cols-2 grid-rows-2 h-full gap-px">
              <div className="row-span-2"><HCell item={thumbs[0].item} /></div>
              <HCell item={thumbs[1].item} />
              <HCell item={thumbs[2].item} />
            </div>
          ) : (
            <div className="grid grid-cols-2 grid-rows-2 h-full gap-px">
              {thumbs.map((oi, i) => <HCell key={i} item={oi.item} />)}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/25" />
          <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 pt-safe">
            <div className="flex items-center h-14">
              <button onClick={() => router.back()} aria-label="Back"
                className="w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
                <ChevronLeft size={20} className="text-white" />
              </button>
            </div>
            <div className="flex items-center gap-2 h-14">
              <button onClick={() => setDeleteOpen(true)} aria-label="Delete"
                className="w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Trash2 size={15} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="-mt-5 relative z-10">
          <div className="bg-stone-50 rounded-t-3xl px-5 pt-5 pb-4">
            <div className="mb-4">
              <h1 className="text-2xl font-semibold text-stone-900 leading-tight">{outfit.name ?? "Unnamed outfit"}</h1>
              <p className="text-sm text-stone-500 mt-0.5">{items.length} item{items.length !== 1 ? "s" : ""}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              <Stat icon={<Heart size={14} />} label="Times worn" value={outfit.recentLogs.length > 0 ? String(outfit.recentLogs.length) : "Never"} />
              <Stat icon={<Calendar size={14} />} label="Last worn" value={outfit.last_worn ? formatRelative(outfit.last_worn) : "—"} />
            </div>

            {outfit.notes && (
              <div className="bg-white rounded-2xl shadow-card px-4 py-3 mb-5">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">Notes</p>
                <p className="text-sm text-stone-700 leading-relaxed">{outfit.notes}</p>
              </div>
            )}

            {/* Items list */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Items</p>
              <div className="space-y-2">
                {items.map((oi) => {
                  const item = oi.item;
                  if (!item) return null;
                  const hex = item.colours[0] ? (COLOUR_HEX[item.colours[0] as Colour] ?? "#E8E5DC") : "#E8E5DC";
                  const img = getImg(item as Parameters<typeof getImg>[0]);
                  const loc = item.wardrobe ? (item.section ? `${item.wardrobe.name} › ${item.section.name}` : item.wardrobe.name) : null;
                  return (
                    <Link key={oi.item_id} href={`/items/${oi.item_id}`}
                      className="flex items-center gap-3 bg-white rounded-2xl shadow-card px-3 py-3 hover:shadow-card-hover transition-shadow group active:scale-[0.99]">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                        {img ? <Image src={img} alt={item.name} width={48} height={48} className="w-full h-full object-cover" />
                             : <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: hex + "28" }}>
                                 <div className="w-5 h-5 rounded-full" style={{ backgroundColor: hex }} />
                               </div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-stone-900 truncate">{item.name}</p>
                        <p className="text-xs text-stone-400">{item.category}{item.brand ? ` · ${item.brand}` : ""}</p>
                        {loc && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin size={10} className="text-stone-300 flex-shrink-0" />
                            <span className="text-[11px] text-stone-400 truncate">{loc}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-0.5 flex-shrink-0">
                        {item.colours.slice(0, 3).map((c) => (
                          <span key={c} className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10"
                            style={{ backgroundColor: COLOUR_HEX[c as Colour] ?? "#ccc" }} />
                        ))}
                      </div>
                      <span className="text-stone-300 group-hover:text-stone-400 text-sm">›</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Wear history */}
            {outfit.recentLogs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Wear history</p>
                <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                  {outfit.recentLogs.map((log, i) => (
                    <div key={i} className={cn("flex items-center justify-between px-4 py-3",
                      i < outfit.recentLogs.length - 1 && "border-b border-stone-50")}>
                      <span className="text-sm text-stone-700 font-medium">{formatDate(log.worn_on)}</span>
                      {log.occasion && (
                        <span className="text-xs text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full">{log.occasion}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-100">
        <div className="max-w-md mx-auto px-4 pt-3 pb-safe"><div className="pb-3">
          <button onClick={() => setLogOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-stone-900 text-white rounded-2xl py-4 font-semibold text-sm shadow-float hover:bg-stone-800 active:scale-[0.98] transition-all">
            <Heart size={16} />Log as worn today
          </button>
        </div></div>
      </div>

      {/* Sheets */}
      <BottomSheet open={logOpen} onClose={() => setLogOpen(false)} title="Log a wear">
        <WearForm outfitName={outfit.name} itemCount={items.length} onLog={handleLog} />
      </BottomSheet>
      <BottomSheet open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete outfit">
        <div className="px-5 py-4 pb-8 space-y-5">
          <p className="text-sm text-stone-600">
            Delete "{outfit.name ?? "this outfit"}"? Wear history is kept. This can't be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteOpen(false)} className="flex-1 bg-stone-100 text-stone-800 rounded-2xl py-3.5 font-semibold text-sm">Cancel</button>
            <button onClick={handleDelete} className="flex-1 bg-red-600 text-white rounded-2xl py-3.5 font-semibold text-sm">Delete</button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}

function HCell({ item }: { item?: ClothingItem }) {
  const hex = item?.colours[0] ? (COLOUR_HEX[item.colours[0] as Colour] ?? "#E8E5DC") : "#E8E5DC";
  const img = item ? getImg(item as Parameters<typeof getImg>[0]) : null;
  return (
    <div className="relative w-full h-full overflow-hidden bg-stone-100">
      {img ? <Image src={img} alt={item?.name ?? ""} fill className="object-cover" sizes="(max-width:448px) 50vw,224px" priority />
           : <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: hex + "28" }}>
               <div className="w-8 h-8 rounded-full" style={{ backgroundColor: hex }} />
             </div>}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-card px-4 py-3 flex flex-col gap-1">
      <div className="text-stone-400">{icon}</div>
      <p className="text-lg font-semibold text-stone-900 leading-none">{value}</p>
      <p className="text-[10px] text-stone-400">{label}</p>
    </div>
  );
}

function WearForm({ outfitName, itemCount, onLog }: { outfitName?: string | null; itemCount: number; onLog: (date: string, occ?: Occasion) => void }) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [occ, setOcc]   = useState<Occasion|"">("");
  return (
    <div className="px-5 py-4 space-y-5 pb-8">
      <p className="text-sm text-stone-500">
        Logging wear for <span className="font-semibold text-stone-800">{outfitName ?? "this outfit"}</span> and all {itemCount} items.
      </p>
      <div>
        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Date</label>
        <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-stone-100 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
          Occasion <span className="text-stone-300 font-normal normal-case">optional</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((o) => (
            <button key={o} onClick={() => setOcc(occ === o ? "" : o as Occasion)}
              className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95",
                occ === o ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200 hover:border-stone-400")}>
              {o}
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => onLog(date, occ || undefined)}
        className="w-full bg-stone-900 text-white rounded-2xl py-4 font-semibold text-sm hover:bg-stone-800 active:scale-[0.98] transition-all">
        Log wear
      </button>
    </div>
  );
}
