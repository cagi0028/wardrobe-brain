"use client";
import { useState, useMemo, useTransition } from "react";
import { Search, SlidersHorizontal, X, Check, ChevronDown, Loader2 } from "lucide-react";
import { ItemCard } from "./ItemCard";
import { BottomSheet, EmptyState } from "@/components/ui";
import { cn, CATEGORIES, COLOURS, SEASONS, OCCASIONS, COLOUR_HEX } from "@/lib/utils";
import { Shirt } from "lucide-react";
import type { ClothingItem, ItemFilters, Category, Colour, Season, Occasion } from "@/types";

const SORT_OPTIONS = [
  { value: "recent",     label: "Recently added" },
  { value: "name",       label: "Name A–Z" },
  { value: "most-worn",  label: "Most worn" },
  { value: "least-worn", label: "Least worn" },
] as const;
type SortKey = typeof SORT_OPTIONS[number]["value"];

interface WardrobeOption { id: string; name: string; sections: { id: string; name: string }[] }

interface ItemGridProps {
  items: ClothingItem[];
  wardrobes?: WardrobeOption[];
  initialFilters?: Partial<ItemFilters>;
}

export function ItemGrid({ items, wardrobes = [], initialFilters = {} }: ItemGridProps) {
  const [filters, setFilters] = useState<ItemFilters>(initialFilters);
  const [sort, setSort] = useState<SortKey>("recent");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const sections = wardrobes.find((w) => w.id === filters.wardrobe_id)?.sections ?? [];
  const activeCount = [filters.category, filters.colour, filters.season, filters.occasion, filters.wardrobe_id].filter(Boolean).length;

  const displayed = useMemo(() => {
    const isUnworn = filters.search === "__unworn__";
    const q = isUnworn ? "" : (filters.search ?? "").toLowerCase();
    let out = items.filter((item) => {
      if (isUnworn && item.last_worn)                                       return false;
      if (q && !item.name.toLowerCase().includes(q))                        return false;
      if (filters.category && item.category !== filters.category)           return false;
      if (filters.colour && !item.colours.includes(filters.colour as Colour)) return false;
      if (filters.season && !item.seasons.includes(filters.season as Season)) return false;
      if (filters.occasion && !item.occasions.includes(filters.occasion as Occasion)) return false;
      if (filters.wardrobe_id && item.wardrobe_id !== filters.wardrobe_id) return false;
      if (filters.section_id && item.section_id !== filters.section_id)    return false;
      return true;
    });
    return [...out].sort((a, b) => {
      if (sort === "name")       return a.name.localeCompare(b.name);
      if (sort === "most-worn")  return (b.wear_count ?? 0) - (a.wear_count ?? 0);
      if (sort === "least-worn") return (a.wear_count ?? 0) - (b.wear_count ?? 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [items, filters, sort]);

  const setF = <K extends keyof ItemFilters>(k: K, v?: ItemFilters[K]) =>
    startTransition(() => setFilters((f) => { const n = { ...f }; if (!v) delete n[k]; else n[k] = v; return n; }));

  const clearAll = () => { setFilters(initialFilters); };

  const hasActiveFilter = activeCount > 0 || (filters.search && filters.search !== "__unworn__");

  return (
    <div>
      {/* Search bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input type="search" placeholder="Search items…"
            defaultValue={filters.search && filters.search !== "__unworn__" ? filters.search : ""}
            onChange={(e) => { startTransition(() => setFilters((f) => ({ ...f, search: e.target.value || undefined }))); }}
            className="w-full pl-9 pr-4 py-2.5 bg-stone-100 rounded-2xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300" />
          {isPending && <Loader2 size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 animate-spin" />}
        </div>
      </div>

      {/* Quick chips */}
      <div className="flex gap-2 px-4 pb-2 overflow-x-auto scrollbar-hide">
        {[
          { label: "All",     filter: {} },
          { label: "Work",    filter: { occasion: "Work"   as Occasion } },
          { label: "Casual",  filter: { occasion: "Casual" as Occasion } },
          { label: "Summer",  filter: { season:   "Summer" as Season   } },
          { label: "Winter",  filter: { season:   "Winter" as Season   } },
          { label: "Unworn",  filter: { search:   "__unworn__"         } },
        ].map(({ label, filter }) => {
          const isAll = label === "All";
          const active = isAll
            ? !hasActiveFilter
            : Object.entries(filter).every(([k, v]) => (filters as Record<string, unknown>)[k] === v);
          return (
            <button key={label} onClick={() => { if (isAll) clearAll(); else setFilters({ ...initialFilters, ...filter }); }}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95",
                active ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
              )}>
              {label}
            </button>
          );
        })}
      </div>

      {/* Filter/sort bar */}
      <div className="flex items-center gap-2 px-4 pb-3 border-b border-stone-100">
        <button onClick={() => setFilterOpen(true)}
          className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
            activeCount > 0 ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200 hover:border-stone-400")}>
          <SlidersHorizontal size={12} />Filters{activeCount > 0 && ` (${activeCount})`}
        </button>

        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1">
          {filters.category && <Pill label={filters.category} onRemove={() => setF("category")} />}
          {filters.colour   && <Pill label={filters.colour}   onRemove={() => setF("colour")}   colour={COLOUR_HEX[filters.colour as Colour]} />}
          {filters.season   && <Pill label={filters.season}   onRemove={() => setF("season")}   />}
          {filters.occasion && <Pill label={filters.occasion} onRemove={() => setF("occasion")} />}
          {hasActiveFilter  && <button onClick={clearAll} className="flex-shrink-0 text-[11px] text-stone-400 hover:text-stone-700 flex items-center gap-0.5 px-1"><X size={11} />Clear</button>}
        </div>

        <button onClick={() => setSortOpen(true)} className="flex-shrink-0 flex items-center gap-1 text-[11px] font-medium text-stone-500">
          <ChevronDown size={12} />{SORT_OPTIONS.find((o) => o.value === sort)?.label.split(" ")[0]}
        </button>
      </div>

      {/* Count */}
      <div className="px-4 pt-2 pb-1">
        <p className="text-xs text-stone-400">{displayed.length === items.length ? `${items.length} items` : `${displayed.length} of ${items.length}`}</p>
      </div>

      {/* Grid */}
      {displayed.length === 0 ? (
        <EmptyState icon={<Shirt size={26} />} title="No items match"
          description={hasActiveFilter ? "Try adjusting your filters." : "Add your first item to get started."}
          action={hasActiveFilter
            ? <button onClick={clearAll} className="px-4 py-2 bg-stone-100 text-stone-700 rounded-2xl text-sm font-semibold">Clear filters</button>
            : undefined} />
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-4 pt-1 pb-6">
          {displayed.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>
      )}

      {/* Filter sheet */}
      <BottomSheet open={filterOpen} onClose={() => setFilterOpen(false)} title="Filter items">
        <div className="px-5 py-4 space-y-6">
          <FSection label="Category">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <ChipBtn key={c} label={c} active={filters.category === c}
                  onClick={() => setF("category", filters.category === c ? undefined : c as Category)} />
              ))}
            </div>
          </FSection>
          <FSection label="Colour">
            <div className="flex flex-wrap gap-2">
              {COLOURS.map((c) => (
                <ChipBtn key={c} label={c} active={filters.colour === c}
                  onClick={() => setF("colour", filters.colour === c ? undefined : c as Colour)}
                  prefix={<span className="w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-black/10"
                    style={c === "Multi" ? { background: "linear-gradient(135deg,#F87171,#60A5FA,#34D399)" } : { backgroundColor: COLOUR_HEX[c as Colour] }} />} />
              ))}
            </div>
          </FSection>
          <FSection label="Season">
            <div className="grid grid-cols-3 gap-2">
              {SEASONS.map((s) => <ChipBtn key={s} label={s} fullWidth active={filters.season === s} onClick={() => setF("season", filters.season === s ? undefined : s as Season)} />)}
            </div>
          </FSection>
          <FSection label="Occasion">
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((o) => <ChipBtn key={o} label={o} active={filters.occasion === o} onClick={() => setF("occasion", filters.occasion === o ? undefined : o as Occasion)} />)}
            </div>
          </FSection>
          {wardrobes.length > 0 && (
            <FSection label="Wardrobe">
              <div className="flex flex-wrap gap-2 mb-2">
                {wardrobes.map((w) => (
                  <ChipBtn key={w.id} label={w.name} active={filters.wardrobe_id === w.id}
                    onClick={() => { if (filters.wardrobe_id === w.id) { setF("wardrobe_id"); setF("section_id"); } else { setF("wardrobe_id", w.id); setF("section_id"); } }} />
                ))}
              </div>
              {filters.wardrobe_id && sections.length > 0 && (
                <div className="ml-2 pl-3 border-l-2 border-stone-100 flex flex-wrap gap-2">
                  {sections.map((s) => <ChipBtn key={s.id} label={s.name} small active={filters.section_id === s.id} onClick={() => setF("section_id", filters.section_id === s.id ? undefined : s.id)} />)}
                </div>
              )}
            </FSection>
          )}
        </div>
        <div className="sticky bottom-0 bg-white border-t border-stone-100 px-5 py-4 flex gap-3">
          {activeCount > 0 && <button onClick={() => { clearAll(); setFilterOpen(false); }} className="px-4 py-3 rounded-2xl bg-stone-100 text-stone-700 text-sm font-semibold">Clear</button>}
          <button onClick={() => setFilterOpen(false)} className="flex-1 py-3 rounded-2xl bg-stone-900 text-white text-sm font-semibold">
            Show {displayed.length} item{displayed.length !== 1 ? "s" : ""}
          </button>
        </div>
      </BottomSheet>

      {/* Sort sheet */}
      <BottomSheet open={sortOpen} onClose={() => setSortOpen(false)} title="Sort by">
        <div className="px-5 py-2 pb-8">
          {SORT_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => { setSort(opt.value); setSortOpen(false); }}
              className="w-full flex items-center justify-between px-1 py-3.5 border-b border-stone-50 last:border-0">
              <span className={cn("text-sm font-medium", sort === opt.value ? "text-stone-900" : "text-stone-600")}>{opt.label}</span>
              {sort === opt.value && <Check size={16} className="text-stone-900" strokeWidth={2.5} />}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}

function FSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2.5">{label}</h3>
      {children}
    </div>
  );
}

function ChipBtn({ label, active, onClick, prefix, fullWidth, small }: {
  label: string; active: boolean; onClick: () => void;
  prefix?: React.ReactNode; fullWidth?: boolean; small?: boolean;
}) {
  return (
    <button type="button" onClick={onClick}
      className={cn("inline-flex items-center justify-center gap-1.5 rounded-full font-medium border transition-all active:scale-95",
        small ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
        active ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200 hover:border-stone-400",
        fullWidth && "w-full")}>
      {prefix}{label}{active && <Check size={10} strokeWidth={3} className="opacity-80 ml-0.5" />}
    </button>
  );
}

function Pill({ label, colour, onRemove }: { label: string; colour?: string; onRemove: () => void }) {
  return (
    <span className="flex-shrink-0 flex items-center gap-1 bg-stone-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
      {colour && <span className="w-2.5 h-2.5 rounded-full ring-1 ring-white/30" style={{ backgroundColor: colour }} />}
      {label}
      <button onClick={onRemove} className="ml-0.5 opacity-70 hover:opacity-100"><X size={10} strokeWidth={3} /></button>
    </span>
  );
}
