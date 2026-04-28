"use server";

import {
  IS_DEMO, DEMO_ITEMS, DEMO_OUTFITS,
  DEMO_WARDROBES_WITH_SECTIONS, DEMO_SECTIONS,
} from "./demo";
import type {
  ClothingItem, Outfit, OutfitItem,
  WardrobeWithSections, ActionResult,
} from "@/types";

// ─── Supabase helper ──────────────────────────────────────────────────────────

async function sb() {
  if (IS_DEMO) return null;
  const { createClient } = await import("./supabase/server");
  return createClient();
}

async function userId(): Promise<string | null> {
  const client = await sb();
  if (!client) return null;
  const { data: { user } } = await client.auth.getUser();
  return user?.id ?? null;
}

// ─── ITEMS ────────────────────────────────────────────────────────────────────

export async function getItems(): Promise<ActionResult<ClothingItem[]>> {
  const client = await sb();
  if (!client) return { ok: true, data: DEMO_ITEMS };

  const uid = await userId();
  if (!uid) return { ok: true, data: DEMO_ITEMS };

  const [{ data: rows, error }, { data: wearRows }] = await Promise.all([
    client
      .from("clothing_items")
      .select("*, wardrobe:wardrobes(id,name), section:wardrobe_sections(id,name)")
      .eq("user_id", uid)
      .in("status", ["active", "stored"])
      .order("created_at", { ascending: false }),
    client
      .from("wear_logs")
      .select("item_id, worn_on")
      .eq("user_id", uid),
  ]);

  if (error) return { ok: false, error: error.message };

  const wearMap: Record<string, { count: number; lastWorn: string }> = {};
  for (const log of wearRows ?? []) {
    const e = wearMap[log.item_id];
    if (!e) { wearMap[log.item_id] = { count: 1, lastWorn: log.worn_on }; }
    else { e.count++; if (log.worn_on > e.lastWorn) e.lastWorn = log.worn_on; }
  }

  return {
    ok: true,
    data: (rows ?? []).map((item) => ({
      ...item,
      colours:   item.colours   ?? [],
      seasons:   item.seasons   ?? [],
      occasions: item.occasions ?? [],
      wear_count: wearMap[item.id]?.count    ?? 0,
      last_worn:  wearMap[item.id]?.lastWorn ?? null,
    })) as ClothingItem[],
  };
}

export async function getItem(id: string): Promise<ActionResult<{
  item: ClothingItem;
  wearCount: number;
  lastWorn: string | null;
  recentLogs: Array<{ worn_on: string; occasion: string | null }>;
}>> {
  const client = await sb();

  if (!client) {
    const item = DEMO_ITEMS.find((i) => i.id === id);
    if (!item) return { ok: false, error: "Item not found" };
    return { ok: true, data: { item, wearCount: item.wear_count ?? 0, lastWorn: item.last_worn ?? null, recentLogs: [] } };
  }

  const uid = await userId();
  if (!uid) return { ok: false, error: "Not authenticated" };

  const { data: item, error } = await client
    .from("clothing_items")
    .select("*, wardrobe:wardrobes(id,name), section:wardrobe_sections(id,name)")
    .eq("id", id)
    .eq("user_id", uid)
    .single();

  if (error || !item) return { ok: false, error: "Item not found" };

  const { data: logs } = await client
    .from("wear_logs")
    .select("worn_on, occasion")
    .eq("item_id", id)
    .order("worn_on", { ascending: false })
    .limit(20);

  return {
    ok: true,
    data: {
      item: { ...item, colours: item.colours ?? [], seasons: item.seasons ?? [], occasions: item.occasions ?? [] } as ClothingItem,
      wearCount: logs?.length ?? 0,
      lastWorn:  logs?.[0]?.worn_on ?? null,
      recentLogs: (logs ?? []).map((l) => ({ worn_on: l.worn_on, occasion: l.occasion ?? null })),
    },
  };
}

export async function saveItem(fd: FormData, imageFile?: File): Promise<ActionResult<{ id: string }>> {
  const client = await sb();
  if (!client) return { ok: true, data: { id: `demo-${Date.now()}` } };

  const uid = await userId();
  if (!uid) return { ok: false, error: "Not authenticated" };

  const payload = {
    user_id:        uid,
    name:           (fd.get("name") as string)?.trim(),
    category:       fd.get("category"),
    colours:        JSON.parse(fd.get("colours") as string ?? "[]"),
    seasons:        JSON.parse(fd.get("seasons") as string ?? "[]"),
    occasions:      JSON.parse(fd.get("occasions") as string ?? "[]"),
    brand:          (fd.get("brand") as string)?.trim() || null,
    size:           (fd.get("size") as string)?.trim() || null,
    purchase_price: fd.get("purchase_price") ? parseFloat(fd.get("purchase_price") as string) : null,
    purchase_date:  (fd.get("purchase_date") as string) || null,
    notes:          (fd.get("notes") as string)?.trim() || null,
    wardrobe_id:    (fd.get("wardrobe_id") as string) || null,
    section_id:     (fd.get("section_id") as string) || null,
    status:         fd.get("status") ?? "active",
    image_url:      null as string | null,
  };

  const { data: item, error } = await client.from("clothing_items").insert(payload).select("id").single();
  if (error || !item) return { ok: false, error: error?.message ?? "Failed to save" };

  if (imageFile) {
    const ext  = imageFile.name.split(".").pop() ?? "jpg";
    const path = `${uid}/${item.id}/photo.${ext}`;
    const { error: upErr } = await client.storage.from("clothing-photos").upload(path, imageFile, { upsert: true });
    if (!upErr) {
      const { data: urlData } = client.storage.from("clothing-photos").getPublicUrl(path);
      await client.from("clothing_items").update({ image_url: urlData.publicUrl }).eq("id", item.id);
    }
  }

  return { ok: true, data: { id: item.id } };
}

export async function deleteItem(id: string): Promise<ActionResult<void>> {
  const client = await sb();
  if (!client) return { ok: true, data: undefined };
  const uid = await userId();
  if (!uid) return { ok: false, error: "Not authenticated" };
  const { error } = await client.from("clothing_items").delete().eq("id", id).eq("user_id", uid);
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: undefined };
}

export async function logWear(itemId: string, wornOn: string, occasion?: string, outfitId?: string): Promise<ActionResult<void>> {
  const client = await sb();
  if (!client) return { ok: true, data: undefined };
  const uid = await userId();
  if (!uid) return { ok: false, error: "Not authenticated" };
  const { error } = await client.from("wear_logs").insert({
    user_id: uid, item_id: itemId, worn_on: wornOn,
    occasion: occasion ?? null, outfit_id: outfitId ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: undefined };
}

// ─── WARDROBES ────────────────────────────────────────────────────────────────

export async function getWardrobes(): Promise<ActionResult<WardrobeWithSections[]>> {
  const client = await sb();
  if (!client) return { ok: true, data: DEMO_WARDROBES_WITH_SECTIONS };

  const uid = await userId();
  if (!uid) return { ok: true, data: DEMO_WARDROBES_WITH_SECTIONS };

  const { data: rows, error } = await client
    .from("wardrobes")
    .select("*, wardrobe_sections(id,name,sort_order)")
    .eq("user_id", uid)
    .order("sort_order", { ascending: true });

  if (error) return { ok: false, error: error.message };

  const { data: itemRows } = await client
    .from("clothing_items")
    .select("wardrobe_id, section_id")
    .eq("user_id", uid)
    .not("wardrobe_id", "is", null);

  const wCount: Record<string, number> = {};
  const sCount: Record<string, number> = {};
  for (const i of itemRows ?? []) {
    if (i.wardrobe_id) wCount[i.wardrobe_id] = (wCount[i.wardrobe_id] ?? 0) + 1;
    if (i.section_id)  sCount[i.section_id]  = (sCount[i.section_id]  ?? 0) + 1;
  }

  return {
    ok: true,
    data: (rows ?? []).map((w) => ({
      ...w,
      sections: ((w.wardrobe_sections as Array<{ id: string; name: string; sort_order: number }>) ?? [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((s) => ({ ...s, wardrobe_id: w.id, created_at: w.created_at, updated_at: w.updated_at, item_count: sCount[s.id] ?? 0 })),
      total_items: wCount[w.id] ?? 0,
    })) as WardrobeWithSections[],
  };
}

export async function createWardrobe(name: string, description?: string): Promise<ActionResult<{ id: string }>> {
  const client = await sb();
  if (!client) return { ok: true, data: { id: `demo-${Date.now()}` } };
  const uid = await userId();
  if (!uid) return { ok: false, error: "Not authenticated" };
  const { count } = await client.from("wardrobes").select("id", { count: "exact", head: true }).eq("user_id", uid);
  const { data, error } = await client.from("wardrobes")
    .insert({ user_id: uid, name: name.trim(), description: description?.trim() || null, sort_order: (count ?? 0) + 1 })
    .select("id").single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: data.id } };
}

export async function updateWardrobe(id: string, name: string, description?: string): Promise<ActionResult<void>> {
  const client = await sb();
  if (!client) return { ok: true, data: undefined };
  const uid = await userId();
  if (!uid) return { ok: false, error: "Not authenticated" };
  const { error } = await client.from("wardrobes").update({ name: name.trim(), description: description?.trim() || null }).eq("id", id).eq("user_id", uid);
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: undefined };
}

export async function deleteWardrobe(id: string): Promise<ActionResult<void>> {
  const client = await sb();
  if (!client) return { ok: true, data: undefined };
  const uid = await userId();
  if (!uid) return { ok: false, error: "Not authenticated" };
  await client.from("clothing_items").update({ wardrobe_id: null, section_id: null }).eq("wardrobe_id", id).eq("user_id", uid);
  const { error } = await client.from("wardrobes").delete().eq("id", id).eq("user_id", uid);
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: undefined };
}

export async function createSection(wardrobeId: string, name: string): Promise<ActionResult<{ id: string }>> {
  const client = await sb();
  if (!client) return { ok: true, data: { id: `demo-${Date.now()}` } };
  const { count } = await client.from("wardrobe_sections").select("id", { count: "exact", head: true }).eq("wardrobe_id", wardrobeId);
  const { data, error } = await client.from("wardrobe_sections")
    .insert({ wardrobe_id: wardrobeId, name: name.trim(), sort_order: (count ?? 0) + 1 })
    .select("id").single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: data.id } };
}

export async function updateSection(id: string, name: string): Promise<ActionResult<void>> {
  const client = await sb();
  if (!client) return { ok: true, data: undefined };
  const { error } = await client.from("wardrobe_sections").update({ name: name.trim() }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: undefined };
}

export async function deleteSection(id: string): Promise<ActionResult<void>> {
  const client = await sb();
  if (!client) return { ok: true, data: undefined };
  const uid = await userId();
  if (uid) await client.from("clothing_items").update({ section_id: null }).eq("section_id", id).eq("user_id", uid);
  const { error } = await client.from("wardrobe_sections").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: undefined };
}

// ─── OUTFITS ──────────────────────────────────────────────────────────────────

export async function getOutfits(): Promise<ActionResult<Outfit[]>> {
  const client = await sb();
  if (!client) return { ok: true, data: DEMO_OUTFITS };

  const uid = await userId();
  if (!uid) return { ok: true, data: DEMO_OUTFITS };

  const [{ data: rows, error }, { data: wearRows }] = await Promise.all([
    client
      .from("outfits")
      .select(`id,name,notes,created_at,updated_at,
        outfit_items(item_id,slot,sort_order,
          clothing_items(id,name,category,colours,brand,image_url))`)
      .eq("user_id", uid)
      .order("created_at", { ascending: false }),
    client.from("wear_logs").select("outfit_id,worn_on").eq("user_id", uid).not("outfit_id", "is", null),
  ]);

  if (error) return { ok: false, error: error.message };

  const wMap: Record<string, { count: number; lastWorn: string }> = {};
  for (const r of wearRows ?? []) {
    if (!r.outfit_id) continue;
    const e = wMap[r.outfit_id];
    if (!e) { wMap[r.outfit_id] = { count: 1, lastWorn: r.worn_on }; }
    else { e.count++; if (r.worn_on > e.lastWorn) e.lastWorn = r.worn_on; }
  }

  type RawOI = { item_id: string; slot: string; sort_order: number; clothing_items: unknown };
  return {
    ok: true,
    data: (rows ?? []).map((o) => ({
      id: o.id, name: o.name ?? null, notes: o.notes ?? null,
      created_at: o.created_at, updated_at: o.updated_at,
      user_id: uid,
      wear_count: wMap[o.id]?.count ?? 0,
      last_worn:  wMap[o.id]?.lastWorn ?? null,
      items: ((o.outfit_items as RawOI[]) ?? [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((oi) => ({
          outfit_id: o.id, item_id: oi.item_id, slot: oi.slot,
          sort_order: oi.sort_order, created_at: o.created_at,
          item: oi.clothing_items as ClothingItem,
        })) as OutfitItem[],
      item_count: (o.outfit_items as RawOI[])?.length ?? 0,
    })) as Outfit[],
  };
}

export async function getOutfit(id: string): Promise<ActionResult<Outfit & {
  recentLogs: Array<{ worn_on: string; occasion: string | null }>;
}>> {
  const client = await sb();
  if (!client) {
    const outfit = DEMO_OUTFITS.find((o) => o.id === id);
    if (!outfit) return { ok: false, error: "Not found" };
    return { ok: true, data: { ...outfit, recentLogs: [] } };
  }

  const uid = await userId();
  if (!uid) return { ok: false, error: "Not authenticated" };

  const { data: o, error } = await client
    .from("outfits")
    .select(`id,name,notes,created_at,updated_at,
      outfit_items(item_id,slot,sort_order,
        clothing_items(id,name,category,colours,brand,image_url,wardrobe_id,section_id,
          wardrobe:wardrobes(id,name), section:wardrobe_sections(id,name)))`)
    .eq("id", id)
    .eq("user_id", uid)
    .single();

  if (error || !o) return { ok: false, error: "Outfit not found" };

  const { data: logs } = await client
    .from("wear_logs")
    .select("worn_on, occasion")
    .eq("outfit_id", id)
    .order("worn_on", { ascending: false })
    .limit(20);

  // Deduplicate by date
  const seen = new Set<string>();
  const recentLogs = (logs ?? []).filter((l) => { if (seen.has(l.worn_on)) return false; seen.add(l.worn_on); return true; })
    .map((l) => ({ worn_on: l.worn_on, occasion: l.occasion ?? null }));

  type RawOI = { item_id: string; slot: string; sort_order: number; clothing_items: unknown };
  return {
    ok: true,
    data: {
      id: o.id, name: o.name ?? null, notes: o.notes ?? null,
      created_at: o.created_at, updated_at: o.updated_at,
      user_id: uid,
      wear_count: recentLogs.length,
      last_worn:  recentLogs[0]?.worn_on ?? null,
      recentLogs,
      items: ((o.outfit_items as RawOI[]) ?? [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((oi) => ({
          outfit_id: o.id, item_id: oi.item_id, slot: oi.slot,
          sort_order: oi.sort_order, created_at: o.created_at,
          item: oi.clothing_items as ClothingItem,
        })) as OutfitItem[],
      item_count: (o.outfit_items as RawOI[])?.length ?? 0,
    },
  };
}

export async function saveOutfit(
  name: string,
  items: Array<{ item_id: string; slot: string; sort_order: number }>,
  notes?: string
): Promise<ActionResult<{ id: string }>> {
  const client = await sb();
  if (!client) return { ok: true, data: { id: `demo-${Date.now()}` } };

  const uid = await userId();
  if (!uid) return { ok: false, error: "Not authenticated" };

  const { data: outfit, error } = await client
    .from("outfits")
    .insert({ user_id: uid, name: name.trim() || null, notes: notes?.trim() || null })
    .select("id").single();

  if (error || !outfit) return { ok: false, error: error?.message ?? "Failed" };

  const { error: itemsErr } = await client.from("outfit_items")
    .insert(items.map((i) => ({ outfit_id: outfit.id, ...i })));

  if (itemsErr) {
    await client.from("outfits").delete().eq("id", outfit.id);
    return { ok: false, error: itemsErr.message };
  }

  return { ok: true, data: { id: outfit.id } };
}

export async function logOutfitWorn(
  outfitId: string,
  itemIds: string[],
  wornOn: string,
  occasion?: string
): Promise<ActionResult<void>> {
  const client = await sb();
  if (!client) return { ok: true, data: undefined };
  const uid = await userId();
  if (!uid) return { ok: false, error: "Not authenticated" };
  const { error } = await client.from("wear_logs").insert(
    itemIds.map((item_id) => ({
      user_id: uid, item_id, outfit_id: outfitId,
      worn_on: wornOn, occasion: occasion ?? null,
    }))
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: undefined };
}

export async function deleteOutfit(id: string): Promise<ActionResult<void>> {
  const client = await sb();
  if (!client) return { ok: true, data: undefined };
  const uid = await userId();
  if (!uid) return { ok: false, error: "Not authenticated" };
  const { error } = await client.from("outfits").delete().eq("id", id).eq("user_id", uid);
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: undefined };
}

// ─── INSIGHTS ─────────────────────────────────────────────────────────────────

export interface InsightsData {
  total_items:      number;
  total_outfits:    number;
  total_wears:      number;
  total_value:      number;
  items_with_price: number;
  never_worn:       ClothingItem[];
  unworn_60d:       ClothingItem[];
  most_worn:        Array<ClothingItem & { wear_count: number }>;
  recently_added:   ClothingItem[];
  category_breakdown: Array<{ category: string; count: number }>;
  duplicate_groups: Array<{ category: string; colour: string; count: number; items: ClothingItem[] }>;
  cost_per_wear:    Array<ClothingItem & { cost_per_wear: number }>;
}

export async function getInsights(): Promise<ActionResult<InsightsData>> {
  const itemsResult   = await getItems();
  const outfitsResult = await getOutfits();

  if (!itemsResult.ok)   return { ok: false, error: itemsResult.error };
  if (!outfitsResult.ok) return { ok: false, error: outfitsResult.error };

  const items   = itemsResult.data;
  const outfits = outfitsResult.data;
  const d60     = new Date(Date.now() - 60 * 86_400_000).toISOString().split("T")[0];

  const catMap: Record<string, number> = {};
  for (const i of items) catMap[i.category] = (catMap[i.category] ?? 0) + 1;

  const dupMap: Record<string, ClothingItem[]> = {};
  for (const i of items) {
    const key = `${i.category}::${i.colours[0] ?? "Other"}`;
    if (!dupMap[key]) dupMap[key] = [];
    dupMap[key].push(i);
  }

  const priced = items.filter((i) => (i.purchase_price ?? 0) > 0);

  return {
    ok: true,
    data: {
      total_items:      items.length,
      total_outfits:    outfits.length,
      total_wears:      items.reduce((s, i) => s + (i.wear_count ?? 0), 0),
      total_value:      priced.reduce((s, i) => s + i.purchase_price!, 0),
      items_with_price: priced.length,

      never_worn: items.filter((i) => !i.wear_count || i.wear_count === 0).slice(0, 12),

      unworn_60d: items
        .filter((i) => !i.last_worn || i.last_worn < d60)
        .sort((a, b) => (a.last_worn ?? "").localeCompare(b.last_worn ?? ""))
        .slice(0, 12),

      most_worn: [...items]
        .filter((i) => (i.wear_count ?? 0) > 0)
        .sort((a, b) => (b.wear_count ?? 0) - (a.wear_count ?? 0))
        .slice(0, 6) as Array<ClothingItem & { wear_count: number }>,

      recently_added: [...items]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 6),

      category_breakdown: Object.entries(catMap)
        .sort((a, b) => b[1] - a[1])
        .map(([category, count]) => ({ category, count })),

      duplicate_groups: Object.entries(dupMap)
        .filter(([, v]) => v.length >= 2)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 5)
        .map(([key, dupeItems]) => {
          const [category, colour] = key.split("::");
          return { category, colour, count: dupeItems.length, items: dupeItems };
        }),

      cost_per_wear: items
        .filter((i) => (i.purchase_price ?? 0) > 0 && (i.wear_count ?? 0) > 0)
        .map((i) => ({ ...i, cost_per_wear: Math.round((i.purchase_price! / i.wear_count!) * 100) / 100 }))
        .sort((a, b) => a.cost_per_wear - b.cost_per_wear)
        .slice(0, 6) as Array<ClothingItem & { cost_per_wear: number }>,
    },
  };
}
