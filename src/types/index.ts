// ─── Enums ────────────────────────────────────────────────────────────────────

export type Category =
  | "Top" | "Bottom" | "Dress" | "Jumpsuit" | "Outerwear"
  | "Shoes" | "Bag" | "Accessory" | "Activewear" | "Swimwear"
  | "Nightwear" | "Other";

export type Season = "Spring" | "Summer" | "Autumn" | "Winter" | "All Year";

export type Occasion =
  | "Casual" | "Work" | "Formal" | "Sport"
  | "Evening" | "Occasion" | "Lounge";

export type Colour =
  | "Black" | "White" | "Grey" | "Navy" | "Blue" | "Green" | "Olive"
  | "Brown" | "Tan" | "Cream" | "Red" | "Pink" | "Orange" | "Yellow"
  | "Purple" | "Multi" | "Other";

export type ItemStatus = "active" | "stored" | "donated" | "discarded";

// ─── Models ───────────────────────────────────────────────────────────────────

export interface Wardrobe {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface WardrobeSection {
  id: string;
  wardrobe_id: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  wardrobe?: { id: string; name: string } | null;
}

export interface ClothingItem {
  id: string;
  user_id: string;
  wardrobe_id?: string | null;
  section_id?: string | null;
  name: string;
  brand?: string | null;
  size?: string | null;
  category: Category;
  colours: Colour[];
  seasons: Season[];
  occasions: Occasion[];
  status: ItemStatus;
  image_url?: string | null;
  purchase_price?: number | null;
  purchase_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  wardrobe?: { id: string; name: string } | null;
  section?: { id: string; name: string } | null;
  // Computed
  wear_count?: number;
  last_worn?: string | null;
}

export interface OutfitItem {
  outfit_id: string;
  item_id: string;
  slot: string;
  sort_order: number;
  created_at: string;
  item?: ClothingItem;
}

export interface Outfit {
  id: string;
  user_id: string;
  name?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  items?: OutfitItem[];
  item_count?: number;
  wear_count?: number;
  last_worn?: string | null;
}

export interface WearLog {
  id: string;
  user_id: string;
  item_id: string;
  outfit_id?: string | null;
  worn_on: string;
  occasion?: Occasion | null;
  notes?: string | null;
  created_at: string;
}

// ─── Form / UI types ──────────────────────────────────────────────────────────

export interface WardrobeWithSections extends Wardrobe {
  sections: Array<WardrobeSection & { item_count: number }>;
  total_items: number;
}

export interface ItemFilters {
  search?: string;
  category?: Category;
  colour?: Colour;
  season?: Season;
  occasion?: Occasion;
  wardrobe_id?: string;
  section_id?: string;
}

export type SortKey = "recent" | "name" | "most-worn" | "least-worn" | "oldest";

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };
