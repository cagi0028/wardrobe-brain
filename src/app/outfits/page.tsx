import Image from "next/image";
import Link from "next/link";
import { Plus, Heart, Clock, Sparkles } from "lucide-react";
import { getOutfits } from "@/lib/data";
import { COLOUR_HEX, formatRelative, getImg } from "@/lib/utils";
import type { Outfit, Colour } from "@/types";

export const dynamic = "force-dynamic";

export default async function OutfitsPage() {
  const result  = await getOutfits();
  const outfits = result.ok ? result.data : [];

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="sticky top-0 z-30 bg-stone-50/95 backdrop-blur-md border-b border-stone-200/60">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-baseline gap-2">
            <h1 className="font-semibold text-stone-900 text-lg leading-none">Outfits</h1>
            {outfits.length > 0 && <span className="text-xs text-stone-400">{outfits.length} saved</span>}
          </div>
          <Link href="/outfits/new"
            className="flex items-center gap-1.5 bg-stone-900 text-white text-xs font-semibold px-3.5 py-2 rounded-full shadow-sm active:scale-95 transition-transform">
            <Plus size={14} strokeWidth={2.5} />New outfit
          </Link>
        </div>
      </div>

      {outfits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-stone-100 flex items-center justify-center mb-5">
            <Sparkles size={32} className="text-stone-300" />
          </div>
          <h3 className="font-semibold text-stone-800 text-base mb-2">No outfits yet</h3>
          <p className="text-sm text-stone-400 leading-relaxed mb-6 max-w-xs">Build outfits from your wardrobe, then log them when you wear them.</p>
          <Link href="/outfits/new"
            className="flex items-center gap-2 bg-stone-900 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-float">
            <Plus size={16} />Create first outfit
          </Link>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3 pb-28">
          {outfits.map((outfit) => <OutfitCard key={outfit.id} outfit={outfit} />)}
        </div>
      )}
    </div>
  );
}

function OutfitCard({ outfit }: { outfit: Outfit }) {
  const thumbs = (outfit.items ?? []).slice(0, 4);
  const n = thumbs.length;

  return (
    <Link href={`/outfits/${outfit.id}`}
      className="group flex gap-4 items-center bg-white rounded-2xl p-3 shadow-card hover:shadow-card-hover transition-all active:scale-[0.99]">
      {/* Collage */}
      <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-stone-50">
        {n === 0 ? (
          <div className="w-full h-full flex items-center justify-center"><Sparkles size={22} className="text-stone-200" /></div>
        ) : n === 1 ? <TC item={thumbs[0].item} full />
        : n === 2 ? (
          <div className="grid grid-cols-2 h-full gap-px">{thumbs.map((oi, i) => <TC key={i} item={oi.item} />)}</div>
        ) : n === 3 ? (
          <div className="grid grid-cols-2 grid-rows-2 h-full gap-px">
            <div className="row-span-2"><TC item={thumbs[0].item} /></div>
            <TC item={thumbs[1].item} /><TC item={thumbs[2].item} />
          </div>
        ) : (
          <div className="grid grid-cols-2 grid-rows-2 h-full gap-px">
            {thumbs.map((oi, i) => <TC key={i} item={oi.item} />)}
          </div>
        )}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-stone-900 text-sm leading-snug line-clamp-1">{outfit.name ?? "Unnamed outfit"}</p>
        <p className="text-xs text-stone-500 mt-0.5">{(outfit.items ?? []).length} items</p>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {(outfit.wear_count ?? 0) > 0 && (
            <div className="flex items-center gap-1"><Heart size={11} className="text-stone-400" />
              <span className="text-xs text-stone-500">×{outfit.wear_count}</span>
            </div>
          )}
          {outfit.last_worn && (
            <div className="flex items-center gap-1"><Clock size={11} className="text-stone-400" />
              <span className="text-xs text-stone-400">{formatRelative(outfit.last_worn)}</span>
            </div>
          )}
          {!outfit.last_worn && (outfit.items?.length ?? 0) > 0 && (
            <span className="text-[11px] text-amber-600 font-medium">Never worn</span>
          )}
        </div>
      </div>
      <span className="text-stone-300 group-hover:text-stone-400 text-lg flex-shrink-0">›</span>
    </Link>
  );
}

function TC({ item, full }: { item?: { image_url?: string | null; colours?: string[] }; full?: boolean }) {
  const hex = item?.colours?.[0] ? (COLOUR_HEX[item.colours[0] as Colour] ?? "#E8E5DC") : "#E8E5DC";
  const img = item ? getImg(item as Parameters<typeof getImg>[0]) : null;
  return (
    <div className={cn("relative overflow-hidden bg-stone-100", full && "w-full h-full")}>
      {img ? <Image src={img} alt="" fill className="object-cover" sizes="40px" />
           : <div className="w-full h-full" style={{ backgroundColor: hex + "40" }} />}
    </div>
  );
}

function cn(...cls: (string | boolean | undefined)[]) {
  return cls.filter(Boolean).join(" ");
}
