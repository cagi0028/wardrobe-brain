import Image from "next/image";
import Link from "next/link";
import { Plus, Shirt, Sparkles, TrendingUp, MapPin } from "lucide-react";
import { getItems, getOutfits, getWardrobes } from "@/lib/data";
import { IS_DEMO } from "@/lib/demo";
import { COLOUR_HEX, formatRelative, getImg } from "@/lib/utils";
import type { Colour } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [ir, or, wr] = await Promise.all([getItems(), getOutfits(), getWardrobes()]);
  const items     = ir.ok ? ir.data : [];
  const outfits   = or.ok ? or.data : [];
  const wardrobes = wr.ok ? wr.data : [];

  const unwornCount   = items.filter((i) => !i.last_worn).length;
  const recentItems   = items.slice(0, 4);
  const recentOutfits = outfits.slice(0, 2);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div>
      <div className="px-5 pt-10 pb-4">
        {IS_DEMO && (
          <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-xs text-amber-700 font-medium">
              Demo mode — add <code className="bg-amber-100 px-1 rounded text-[11px]">.env.local</code> with Supabase credentials to use your own data
            </p>
          </div>
        )}
        <p className="text-sm text-stone-400 font-medium tracking-wide">{greeting}</p>
        <h1 className="text-3xl text-stone-900 mt-0.5">Your wardrobe</h1>
      </div>

      <div className="px-4 mb-5">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Items",   value: items.length,   href: "/items"    },
            { label: "Outfits", value: outfits.length, href: "/outfits"  },
            { label: "Unworn",  value: unwornCount,    href: "/insights" },
          ].map(({ label, value, href }) => (
            <Link key={label} href={href}
              className="bg-white rounded-2xl p-4 shadow-card text-center hover:shadow-card-hover transition-shadow active:scale-[0.98]">
              <p className="text-2xl font-semibold text-stone-900 tabular-nums">{value}</p>
              <p className="text-xs text-stone-400 mt-0.5">{label}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="px-4 mb-6">
        <Link href="/items/new"
          className="flex items-center gap-3 bg-stone-900 text-white rounded-2xl px-5 py-4 shadow-float active:scale-[0.99] transition-transform">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Plus size={20} />
          </div>
          <div>
            <p className="font-semibold text-sm">Add new item</p>
            <p className="text-xs text-white/60">Photo, name, category — 60 sec</p>
          </div>
        </Link>
      </div>

      {recentItems.length > 0 && (
        <section className="mb-6">
          <SectionHeader title="Recent items" href="/items" icon={<Shirt size={15} />} />
          <div className="grid grid-cols-4 gap-2 px-4">
            {recentItems.map((item) => {
              const hex = item.colours[0] ? (COLOUR_HEX[item.colours[0] as Colour] ?? "#E8E5DC") : "#E8E5DC";
              const img = getImg(item as unknown as Parameters<typeof getImg>[0]);
              return (
                <Link key={item.id} href={`/items/${item.id}`} className="flex flex-col gap-1 group">
                  <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-stone-100">
                    {img ? (
                      <Image src={img} alt={item.name} width={100} height={133}
                        className="w-full h-full object-cover group-active:opacity-80" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: hex + "30" }}>
                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: hex }} />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-600 leading-tight line-clamp-1">{item.name}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {wardrobes.length > 0 && (
        <section className="mb-6">
          <SectionHeader title="Storage" href="/wardrobes" icon={<MapPin size={15} />} />
          <div className="px-4 space-y-2">
            {wardrobes.slice(0, 3).map((w) => (
              <Link key={w.id} href="/wardrobes"
                className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-card active:scale-[0.99] transition-transform">
                <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} className="text-stone-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-800 text-sm truncate">{w.name}</p>
                  <p className="text-xs text-stone-400">{w.sections.length} sections · {w.total_items} items</p>
                </div>
                <span className="text-stone-300 text-lg">›</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recentOutfits.length > 0 && (
        <section className="mb-6">
          <SectionHeader title="Saved outfits" href="/outfits" icon={<Sparkles size={15} />} />
          <div className="px-4 space-y-2">
            {recentOutfits.map((outfit) => {
              const thumbs = (outfit.items ?? []).slice(0, 4);
              return (
                <Link key={outfit.id} href={`/outfits/${outfit.id}`}
                  className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-card active:scale-[0.99] transition-transform">
                  <div className="w-14 h-14 flex-shrink-0 grid grid-cols-2 grid-rows-2 gap-px rounded-xl overflow-hidden bg-stone-100">
                    {thumbs.map((oi, i) => {
                      const hex = oi.item?.colours[0] ? (COLOUR_HEX[oi.item.colours[0] as Colour] ?? "#E8E5DC") : "#E8E5DC";
                      const img = oi.item ? getImg(oi.item as Parameters<typeof getImg>[0]) : null;
                      return (
                        <div key={i} className="relative overflow-hidden bg-stone-100">
                          {img ? <Image src={img} alt="" fill className="object-cover" sizes="28px" />
                               : <div className="w-full h-full" style={{ backgroundColor: hex + "40" }} />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-800 text-sm truncate">{outfit.name ?? "Unnamed outfit"}</p>
                    <p className="text-xs text-stone-400">
                      {(outfit.items ?? []).length} items
                      {outfit.last_worn ? ` · ${formatRelative(outfit.last_worn)}` : ""}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {unwornCount > 0 && (
        <section className="px-4 mb-6">
          <Link href="/insights"
            className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4 active:scale-[0.99] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-stone-800 text-sm">
                {unwornCount} item{unwornCount !== 1 ? "s" : ""} never worn
              </p>
              <p className="text-xs text-stone-500 mt-0.5">View insights →</p>
            </div>
          </Link>
        </section>
      )}

      {items.length === 0 && (
        <section className="px-4 mb-6">
          <div className="bg-stone-100 rounded-2xl p-6 text-center">
            <p className="text-sm font-semibold text-stone-700 mb-1">Start your wardrobe</p>
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              Add your first item to unlock insights, outfit builder, and wear tracking.
            </p>
            <Link href="/items/new"
              className="inline-flex items-center gap-1.5 bg-stone-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl">
              <Plus size={14} />Add first item
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeader({ title, href, icon }: { title: string; href: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 mb-3">
      <div className="flex items-center gap-1.5">
        <span className="text-stone-400">{icon}</span>
        <h2 className="font-semibold text-stone-800 text-sm">{title}</h2>
      </div>
      <Link href={href} className="text-xs text-stone-400 hover:text-stone-700 font-medium transition-colors">
        See all
      </Link>
    </div>
  );
}
