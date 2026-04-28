import { getItems, getWardrobes } from "@/lib/data";
import { ItemGrid } from "@/components/items/ItemGrid";
import { Fab } from "@/components/layout/Fab";
import type { ItemFilters } from "@/types";

export const dynamic = "force-dynamic";

interface Props {
  searchParams?: { wardrobe?: string; section?: string; category?: string; occasion?: string; season?: string };
}

export default async function ItemsPage({ searchParams }: Props) {
  const [ir, wr] = await Promise.all([getItems(), getWardrobes()]);
  const items     = ir.ok ? ir.data : [];
  const wardrobes = wr.ok ? wr.data.map((w) => ({ id: w.id, name: w.name, sections: w.sections })) : [];

  const initialFilters: Partial<ItemFilters> = {};
  if (searchParams?.wardrobe) initialFilters.wardrobe_id = searchParams.wardrobe;
  if (searchParams?.section)  initialFilters.section_id  = searchParams.section;
  if (searchParams?.category) initialFilters.category    = searchParams.category as ItemFilters["category"];
  if (searchParams?.occasion) initialFilters.occasion    = searchParams.occasion as ItemFilters["occasion"];
  if (searchParams?.season)   initialFilters.season      = searchParams.season   as ItemFilters["season"];

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="sticky top-0 z-30 bg-stone-50/95 backdrop-blur-md border-b border-stone-200/60">
        <div className="px-4 h-14 flex items-center gap-2">
          <h1 className="font-semibold text-stone-900 text-lg">Items</h1>
          <span className="text-xs text-stone-400">{items.length} pieces</span>
        </div>
      </div>
      <ItemGrid items={items} wardrobes={wardrobes} initialFilters={initialFilters} />
      <Fab href="/items/new" label="Add item" />
    </div>
  );
}
