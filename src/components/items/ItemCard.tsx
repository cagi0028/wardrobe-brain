"use client";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { cn, COLOUR_HEX, formatRelative, getImg } from "@/lib/utils";
import type { ClothingItem, Colour } from "@/types";

export function ItemCard({ item }: { item: ClothingItem }) {
  const hex = item.colours[0] ? (COLOUR_HEX[item.colours[0] as Colour] ?? "#E8E5DC") : "#E8E5DC";
  const imageUrl = getImg(item as Parameters<typeof getImg>[0]);
  const location = item.wardrobe?.name
    ? item.section?.name
      ? `${item.wardrobe.name} › ${item.section.name}`
      : item.wardrobe.name
    : null;

  return (
    <Link href={`/items/${item.id}`} className="group flex flex-col animate-fade-in">
      {/* Photo */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-stone-100 shadow-card group-active:scale-[0.98] transition-transform duration-150">
        {imageUrl ? (
          <Image
            src={imageUrl} alt={item.name} fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            sizes="(max-width:448px) 50vw, 224px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center gap-1" style={{ backgroundColor: hex + "20" }}>
            {item.colours.slice(0, 3).map((c) => (
              <div key={c} className="w-7 h-7 rounded-full ring-2 ring-white shadow"
                style={{ backgroundColor: COLOUR_HEX[c as Colour] ?? "#ccc" }} />
            ))}
          </div>
        )}
        {/* Gradient + badges */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-2 left-2">
          <span className="text-[10px] font-semibold text-white/90 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
            {item.category}
          </span>
        </div>
        {(item.wear_count ?? 0) > 0 && (
          <div className="absolute bottom-2 right-2">
            <span className="text-[10px] font-semibold text-white/80 bg-black/30 px-1.5 py-0.5 rounded-full">
              ×{item.wear_count}
            </span>
          </div>
        )}
        {!item.last_worn && (
          <div className="absolute top-2 right-2">
            <span className="text-[9px] font-bold text-amber-700 bg-amber-100/90 px-1.5 py-0.5 rounded-full tracking-wide">
              NEW
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pt-2 pb-1 px-0.5 space-y-0.5">
        <p className="text-sm font-semibold text-stone-900 leading-snug line-clamp-1">{item.name}</p>
        <div className="flex items-center gap-1.5">
          {item.colours.slice(0, 4).map((c) => (
            <span key={c} className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10"
              style={{ backgroundColor: COLOUR_HEX[c as Colour] ?? "#ccc" }} title={c} />
          ))}
          {item.brand && <span className="text-[11px] text-stone-400 truncate ml-0.5">{item.brand}</span>}
        </div>
        {location ? (
          <div className="flex items-center gap-1 min-w-0">
            <MapPin size={10} className="text-stone-300 flex-shrink-0" />
            <span className="text-[11px] text-stone-400 truncate">{location}</span>
          </div>
        ) : <div className="h-[14px]" />}
        {item.last_worn && (
          <div className="flex items-center gap-1">
            <Clock size={10} className="text-stone-300 flex-shrink-0" />
            <span className="text-[11px] text-stone-400">{formatRelative(item.last_worn)}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
