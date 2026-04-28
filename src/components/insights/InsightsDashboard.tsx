"use client";
import Image from "next/image";
import Link from "next/link";
import { Plus, Package, TrendingUp, BarChart3, Copy, Clock, Tag, Sparkles, Heart, PoundSterling } from "lucide-react";
import { cn, COLOUR_HEX, formatRelative, formatDate, formatCurrency, getImg } from "@/lib/utils";
import type { InsightsData } from "@/lib/data";
import type { ClothingItem, Colour } from "@/types";

export function InsightsDashboard({ data }: { data: InsightsData }) {
  const maxCat = Math.max(...data.category_breakdown.map((c) => c.count), 1);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="sticky top-0 z-30 bg-stone-50/95 backdrop-blur-md border-b border-stone-200/60">
        <div className="px-4 h-14 flex items-center">
          <h1 className="font-semibold text-stone-900 text-lg">Insights</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-28">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Items",   value: data.total_items,   href: "/items"   },
            { label: "Outfits", value: data.total_outfits, href: "/outfits" },
            { label: "Wears",   value: data.total_wears,   href: undefined  },
          ].map(({ label, value, href }) => {
            const inner = (
              <div className="bg-white rounded-2xl shadow-card px-3 py-4 flex flex-col gap-1 text-center hover:shadow-card-hover transition-shadow">
                <p className="text-2xl font-semibold text-stone-900 tabular-nums">{value.toLocaleString()}</p>
                <p className="text-xs font-medium text-stone-600">{label}</p>
              </div>
            );
            return href ? <Link key={label} href={href}>{inner}</Link> : <div key={label}>{inner}</div>;
          })}
        </div>

        {/* Value tiles */}
        {data.items_with_price > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <VTile label="Wardrobe value"
              value={formatCurrency(data.total_value)}
              sub={`${data.items_with_price} priced items`} />
            <VTile label="Avg cost/wear"
              value={data.cost_per_wear.length > 0
                ? formatCurrency(data.cost_per_wear.reduce((s, i) => s + i.cost_per_wear, 0) / data.cost_per_wear.length)
                : "—"}
              sub="for tracked items" />
          </div>
        )}

        {/* Never worn */}
        {data.never_worn.length > 0 && (
          <Section icon={<Tag size={15} />} title="Never worn" count={data.never_worn.length} accent="amber"
            hint="These items have never been logged as worn.">
            <Scroll>
              {data.never_worn.map((item) => <IThumb key={item.id} item={item} />)}
            </Scroll>
          </Section>
        )}

        {/* Unworn 60d */}
        {data.unworn_60d.length > 0 && (
          <Section icon={<Clock size={15} />} title="Not worn in 60+ days" count={data.unworn_60d.length}
            hint="Consider whether these are still earning their wardrobe space.">
            <Scroll>
              {data.unworn_60d.map((item) => <IThumb key={item.id} item={item} showDaysSince />)}
            </Scroll>
          </Section>
        )}

        {/* Most worn */}
        {data.most_worn.length > 0 && (
          <Section icon={<TrendingUp size={15} />} title="Most worn">
            <div className="divide-y divide-stone-50">
              {data.most_worn.map((item, i) => (
                <Link key={item.id} href={`/items/${item.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors group">
                  <span className="w-5 text-xs font-mono text-stone-300 flex-shrink-0 text-center">{i + 1}</span>
                  <IImg item={item} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{item.name}</p>
                    <p className="text-xs text-stone-400">{item.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-stone-800">{item.wear_count}×</p>
                    {item.last_worn && <p className="text-[10px] text-stone-400">{formatRelative(item.last_worn)}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* Category breakdown */}
        <Section icon={<BarChart3 size={15} />} title="By category">
          <div className="space-y-2.5 pt-1 px-1">
            {data.category_breakdown.map(({ category, count }) => (
              <Link key={category} href={`/items?category=${encodeURIComponent(category)}`}
                className="flex items-center gap-3 group">
                <span className="text-xs text-stone-500 w-20 flex-shrink-0 group-hover:text-stone-800 transition-colors">{category}</span>
                <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-stone-700 rounded-full transition-all group-hover:bg-stone-900"
                    style={{ width: `${(count / maxCat) * 100}%` }} />
                </div>
                <span className="text-xs font-semibold text-stone-500 w-5 text-right flex-shrink-0">{count}</span>
              </Link>
            ))}
          </div>
        </Section>

        {/* Duplicate groups */}
        {data.duplicate_groups.length > 0 && (
          <Section icon={<Copy size={15} />} title="Similar items"
            hint="Multiple items sharing the same category and colour.">
            <div className="space-y-4 pt-1">
              {data.duplicate_groups.map((g) => (
                <div key={`${g.category}-${g.colour}`}>
                  <div className="flex items-center gap-2 px-4 mb-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-black/10"
                      style={{ backgroundColor: COLOUR_HEX[g.colour as Colour] ?? "#E8E5DC" }} />
                    <span className="text-xs font-semibold text-stone-600">{g.colour} {g.category}</span>
                    <span className="text-xs text-stone-400 ml-auto">{g.count} items</span>
                  </div>
                  <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide">
                    {g.items.map((item) => (
                      <Link key={item.id} href={`/items/${item.id}`} className="flex-shrink-0 w-14 flex flex-col gap-1 group">
                        <div className="w-14 h-[72px] rounded-xl overflow-hidden bg-stone-100 group-active:opacity-80">
                          <IImg item={item} size={56} />
                        </div>
                        <p className="text-[10px] text-stone-500 line-clamp-1">{item.name}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Cost per wear */}
        {data.cost_per_wear.length > 0 && (
          <Section icon={<PoundSterling size={15} />} title="Cost per wear"
            hint="Purchase price ÷ wears logged. Lower = better value.">
            <div className="divide-y divide-stone-50 pt-1">
              {data.cost_per_wear.map((item) => {
                const cpw = item.cost_per_wear;
                const badge = cpw <= 5 ? "bg-emerald-50 text-emerald-700" : cpw <= 20 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700";
                return (
                  <Link key={item.id} href={`/items/${item.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors">
                    <IImg item={item} size={40} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">{item.name}</p>
                      <p className="text-xs text-stone-400">{formatCurrency(item.purchase_price!)} · {item.wear_count} wear{item.wear_count !== 1 ? "s" : ""}</p>
                    </div>
                    <span className={cn("flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full", badge)}>
                      {formatCurrency(cpw)}/wear
                    </span>
                  </Link>
                );
              })}
            </div>
          </Section>
        )}

        {/* Recently added */}
        {data.recently_added.length > 0 && (
          <Section icon={<Sparkles size={15} />} title="Recently added">
            <Scroll>
              {data.recently_added.map((item) => <IThumb key={item.id} item={item} showDate />)}
            </Scroll>
          </Section>
        )}

        {/* Empty */}
        {data.total_items === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-3xl bg-stone-100 flex items-center justify-center mb-5">
              <Package size={32} className="text-stone-300" />
            </div>
            <h3 className="font-semibold text-stone-700 mb-2">No items yet</h3>
            <p className="text-sm text-stone-400 mb-6 max-w-xs leading-relaxed">Add items to your wardrobe to see insights about what you wear.</p>
            <Link href="/items/new"
              className="flex items-center gap-2 bg-stone-900 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-float">
              <Plus size={16} />Add first item
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Section({ icon, title, count, hint, accent = "stone", children }: {
  icon: React.ReactNode; title: string; count?: number;
  hint?: string; accent?: "stone" | "amber"; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <span className={accent === "amber" ? "text-amber-500" : "text-stone-400"}>{icon}</span>
          <h2 className="font-semibold text-stone-800 text-sm flex-1">{title}</h2>
          {count != null && count > 0 && (
            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0",
              accent === "amber" ? "bg-amber-50 text-amber-600" : "bg-stone-100 text-stone-500")}>
              {count}
            </span>
          )}
        </div>
        {hint && <p className="text-[11px] text-stone-400 mt-1 leading-snug">{hint}</p>}
      </div>
      <div className="pb-4">{children}</div>
    </div>
  );
}

function Scroll({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-1">{children}</div>;
}

function VTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-card px-4 py-4">
      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-semibold text-stone-900">{value}</p>
      <p className="text-[11px] text-stone-400 mt-0.5">{sub}</p>
    </div>
  );
}

function IThumb({ item, showDaysSince, showDate }: { item: ClothingItem; showDaysSince?: boolean; showDate?: boolean }) {
  return (
    <Link href={`/items/${item.id}`} className="flex-shrink-0 w-[72px] flex flex-col gap-1.5 group">
      <div className="w-[72px] h-[90px] rounded-2xl overflow-hidden bg-stone-100 group-active:opacity-80">
        <IImg item={item} size={72} />
      </div>
      <p className="text-[11px] font-medium text-stone-700 line-clamp-1 leading-tight">{item.name}</p>
      {showDaysSince && item.last_worn && <p className="text-[10px] text-stone-400">{formatRelative(item.last_worn)}</p>}
      {showDaysSince && !item.last_worn && <p className="text-[10px] text-amber-500 font-medium">never worn</p>}
      {showDate && <p className="text-[10px] text-stone-400">{formatDate(item.created_at)}</p>}
    </Link>
  );
}

function IImg({ item, size }: { item: ClothingItem; size: number }) {
  const hex = item.colours[0] ? (COLOUR_HEX[item.colours[0] as Colour] ?? "#E8E5DC") : "#E8E5DC";
  const img = getImg(item as Parameters<typeof getImg>[0]);
  return img
    ? <Image src={img} alt={item.name} width={size} height={size} className="w-full h-full object-cover" />
    : <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: hex + "28" }}>
        <div style={{ width: size * 0.4, height: size * 0.4, backgroundColor: hex, borderRadius: "50%" }} />
      </div>;
}
