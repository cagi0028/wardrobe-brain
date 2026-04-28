"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, Heart, Calendar, MapPin, PoundSterling, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { cn, COLOUR_HEX, formatDate, formatRelative, OCCASIONS, getImg } from "@/lib/utils";
import { Toast, BottomSheet, useToast } from "@/components/ui";
import { logWear, deleteItem } from "@/lib/data";
import type { ClothingItem, Colour, Occasion } from "@/types";

interface Props {
  item: ClothingItem;
  wearCount: number;
  lastWorn: string | null;
  recentLogs: Array<{ worn_on: string; occasion: string | null }>;
}

export function ItemDetailClient({ item, wearCount, lastWorn, recentLogs }: Props) {
  const router = useRouter();
  const { toast, showLoading, showSuccess, showError, dismiss } = useToast();
  const [logOpen, setLogOpen]       = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const imageUrl = getImg(item as Parameters<typeof getImg>[0]);
  const hex = item.colours[0] ? (COLOUR_HEX[item.colours[0] as Colour] ?? "#E8E5DC") : "#E8E5DC";

  const location = item.wardrobe?.name
    ? item.section?.name ? `${item.wardrobe.name} › ${item.section.name}` : item.wardrobe.name
    : null;

  const handleLog = async (date: string, occ?: Occasion) => {
    setLogOpen(false);
    showLoading("Logging wear…");
    const r = await logWear(item.id, date, occ);
    if (!r.ok) { showError(r.error); return; }
    showSuccess("Wear logged!");
    router.refresh();
  };

  const handleDelete = async () => {
    setDeleteOpen(false);
    showLoading("Deleting…");
    const r = await deleteItem(item.id);
    if (!r.ok) { showError(r.error); return; }
    router.push("/items");
  };

  const cpw = item.purchase_price && wearCount > 0
    ? (item.purchase_price / wearCount).toFixed(2)
    : null;

  return (
    <>
      <Toast toast={toast} onDismiss={dismiss} />
      <div className="min-h-screen bg-stone-50 pb-32">
        {/* Hero */}
        <div className="relative bg-stone-100" style={{ aspectRatio: "4/3", maxHeight: "55vw" }}>
          {imageUrl ? (
            <Image src={imageUrl} alt={item.name} fill className="object-cover" sizes="(max-width:448px) 100vw,448px" priority />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: hex + "28" }}>
              <div className="w-20 h-20 rounded-full ring-4 ring-white shadow-lg" style={{ backgroundColor: hex }} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

          {/* Controls */}
          <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 pt-safe">
            <div className="flex items-center h-14">
              <button onClick={() => router.back()} aria-label="Back"
                className="w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
                <ChevronLeft size={20} className="text-white" />
              </button>
            </div>
            <div className="flex items-center gap-2 h-14">
              <button onClick={() => setDeleteOpen(true)} aria-label="Delete item"
                className="w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Trash2 size={15} className="text-white" />
              </button>
            </div>
          </div>

          <div className="absolute bottom-3 left-4">
            <span className="bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
              {item.category}
            </span>
          </div>
        </div>

        {/* Card pull-up */}
        <div className="-mt-4 relative z-10">
          <div className="bg-stone-50 rounded-t-3xl px-5 pt-5 pb-4">
            <div className="mb-4">
              <h1 className="text-2xl font-semibold text-stone-900 leading-tight">{item.name}</h1>
              {item.brand && <p className="text-stone-500 text-sm mt-0.5">{item.brand}</p>}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <Stat icon={<Heart size={14} />} label="Times worn" value={String(wearCount)} />
              <Stat icon={<Calendar size={14} />} label="Last worn" value={lastWorn ? formatRelative(lastWorn) : "Never"} />
              {cpw && <Stat icon={<PoundSterling size={14} />} label="Cost/wear" value={`£${cpw}`} />}
            </div>

            {/* Colours */}
            {item.colours.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Colours</p>
                <div className="flex gap-2 flex-wrap">
                  {item.colours.map((c) => (
                    <div key={c} className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full ring-1 ring-black/10" style={{ backgroundColor: COLOUR_HEX[c as Colour] ?? "#ccc" }} />
                      <span className="text-sm text-stone-700">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {item.seasons.map((s)   => <Tag key={s}>{s}</Tag>)}
              {item.occasions.map((o) => <Tag key={o} dark>{o}</Tag>)}
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-4">
              {item.size            && <Row icon={<span className="text-xs font-bold text-stone-400">S</span>} label="Size"           value={item.size} />}
              {location             && <Row icon={<MapPin size={14} />}          label="Location"       value={location} />}
              {item.purchase_price  && <Row icon={<PoundSterling size={14} />}   label="Purchase price" value={`£${item.purchase_price.toFixed(2)}`} />}
              {item.purchase_date   && <Row icon={<ShoppingBag size={14} />}     label="Bought"         value={formatDate(item.purchase_date)} />}
              <Row icon={<Calendar size={14} />} label="Added" value={formatDate(item.created_at)} last />
            </div>

            {item.notes && (
              <div className="bg-white rounded-2xl shadow-card px-4 py-3 mb-4">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">Notes</p>
                <p className="text-sm text-stone-700 leading-relaxed">{item.notes}</p>
              </div>
            )}

            {recentLogs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Wear history</p>
                <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                  {recentLogs.slice(0, 8).map((log, i) => (
                    <div key={i} className={cn("flex items-center justify-between px-4 py-3",
                      i < recentLogs.length - 1 && "border-b border-stone-50")}>
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

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-100">
        <div className="max-w-md mx-auto px-4 pt-3 pb-safe">
          <div className="pb-3">
            <button onClick={() => setLogOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-stone-900 text-white rounded-2xl py-4 font-semibold text-sm shadow-float hover:bg-stone-800 active:scale-[0.98] transition-all">
              <Heart size={16} />Log as worn
            </button>
          </div>
        </div>
      </div>

      {/* Log wear sheet */}
      <BottomSheet open={logOpen} onClose={() => setLogOpen(false)} title="Log a wear">
        <WearForm itemName={item.name} onLog={handleLog} />
      </BottomSheet>

      {/* Delete confirm */}
      <BottomSheet open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete item">
        <div className="px-5 py-4 pb-8 space-y-5">
          <p className="text-sm text-stone-600">
            Delete <span className="font-semibold">{item.name}</span>? Wear history will also be removed. This can't be undone.
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

function WearForm({ itemName, onLog }: { itemName: string; onLog: (date: string, occ?: Occasion) => void }) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [occ, setOcc]   = useState<Occasion | "">("");
  return (
    <div className="px-5 py-4 space-y-5 pb-8">
      <p className="text-sm text-stone-500">Logging wear for <span className="font-semibold text-stone-800">{itemName}</span></p>
      <div>
        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Date</label>
        <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-stone-100 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Occasion <span className="text-stone-300 font-normal normal-case">optional</span></label>
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

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-card px-3 py-3 flex flex-col gap-1">
      <div className="text-stone-400 flex-shrink-0">{icon}</div>
      <p className="text-base font-semibold text-stone-900 leading-none">{value}</p>
      <p className="text-[10px] text-stone-400 leading-tight">{label}</p>
    </div>
  );
}

function Tag({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full",
      dark ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600")}>
      {children}
    </span>
  );
}

function Row({ icon, label, value, last }: { icon: React.ReactNode; label: string; value: string; last?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 px-4 py-3", !last && "border-b border-stone-50")}>
      <span className="text-stone-400 flex-shrink-0">{icon}</span>
      <span className="text-sm text-stone-400 flex-shrink-0 w-24">{label}</span>
      <span className="text-sm text-stone-800 font-medium text-right flex-1 truncate">{value}</span>
    </div>
  );
}
