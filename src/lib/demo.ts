import type { ClothingItem, Outfit, Wardrobe, WardrobeSection, WardrobeWithSections } from "@/types";

// ─── Feature flag ─────────────────────────────────────────────────────────────

export const IS_DEMO =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project");

// ─── Wardrobes ────────────────────────────────────────────────────────────────

const RAW_WARDROBES: Wardrobe[] = [
  { id: "w1", user_id: "demo", name: "Bedroom Wardrobe",  description: "Double rail, left wall", sort_order: 1, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "w2", user_id: "demo", name: "Spare Room Rail",   description: null,                     sort_order: 2, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "w3", user_id: "demo", name: "Chest of Drawers",  description: "Bedroom, 4 drawers",     sort_order: 3, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

const RAW_SECTIONS: WardrobeSection[] = [
  { id: "s1", wardrobe_id: "w1", name: "Left Rail",    sort_order: 1, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s2", wardrobe_id: "w1", name: "Right Rail",   sort_order: 2, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s3", wardrobe_id: "w1", name: "Top Shelf",    sort_order: 3, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s4", wardrobe_id: "w1", name: "Shoe Rack",    sort_order: 4, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s5", wardrobe_id: "w2", name: "Main Rail",    sort_order: 1, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s6", wardrobe_id: "w3", name: "Top Drawer",   sort_order: 1, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s7", wardrobe_id: "w3", name: "Second Drawer",sort_order: 2, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

// ─── Items ────────────────────────────────────────────────────────────────────

const w1 = RAW_WARDROBES[0];
const w2 = RAW_WARDROBES[1];
const w3 = RAW_WARDROBES[2];

const RAW_ITEMS: ClothingItem[] = [
  {
    id: "i1", user_id: "demo", name: "Navy Wool Blazer", status: "active",
    category: "Outerwear", colours: ["Navy"], seasons: ["Autumn", "Winter", "Spring"],
    occasions: ["Work", "Formal"], brand: "Reiss",
    image_url: "https://images.unsplash.com/photo-1555069519-127aadedf1ee?w=500&q=80",
    wardrobe_id: "w1", section_id: "s1", wardrobe: w1, section: { id: "s1", name: "Left Rail" },
    purchase_price: 220, created_at: "2024-01-15T00:00:00Z", updated_at: "2024-01-15T00:00:00Z",
    wear_count: 12, last_worn: "2024-06-10T00:00:00Z",
  },
  {
    id: "i2", user_id: "demo", name: "White Silk Blouse", status: "active",
    category: "Top", colours: ["White"], seasons: ["All Year"],
    occasions: ["Work", "Formal", "Casual"], brand: "& Other Stories",
    image_url: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=500&q=80",
    wardrobe_id: "w1", section_id: "s1", wardrobe: w1, section: { id: "s1", name: "Left Rail" },
    purchase_price: 65, created_at: "2024-02-01T00:00:00Z", updated_at: "2024-02-01T00:00:00Z",
    wear_count: 8, last_worn: "2024-06-12T00:00:00Z",
  },
  {
    id: "i3", user_id: "demo", name: "High-Waist Trousers", status: "active",
    category: "Bottom", colours: ["Black"], seasons: ["All Year"],
    occasions: ["Work", "Casual", "Formal"], brand: "Arket",
    image_url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&q=80",
    wardrobe_id: "w1", section_id: "s2", wardrobe: w1, section: { id: "s2", name: "Right Rail" },
    purchase_price: 89, created_at: "2024-02-10T00:00:00Z", updated_at: "2024-02-10T00:00:00Z",
    wear_count: 20, last_worn: "2024-06-14T00:00:00Z",
  },
  {
    id: "i4", user_id: "demo", name: "Linen Midi Dress", status: "active",
    category: "Dress", colours: ["Cream"], seasons: ["Spring", "Summer"],
    occasions: ["Casual", "Occasion"], brand: "Mango",
    image_url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80",
    wardrobe_id: "w1", section_id: "s2", wardrobe: w1, section: { id: "s2", name: "Right Rail" },
    purchase_price: 50, created_at: "2024-03-01T00:00:00Z", updated_at: "2024-03-01T00:00:00Z",
    wear_count: 3, last_worn: "2024-05-20T00:00:00Z",
  },
  {
    id: "i5", user_id: "demo", name: "White Leather Trainers", status: "active",
    category: "Shoes", colours: ["White"], seasons: ["Spring", "Summer", "Autumn"],
    occasions: ["Casual", "Sport"], brand: "Veja",
    image_url: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&q=80",
    wardrobe_id: "w1", section_id: "s4", wardrobe: w1, section: { id: "s4", name: "Shoe Rack" },
    purchase_price: 160, created_at: "2024-01-20T00:00:00Z", updated_at: "2024-01-20T00:00:00Z",
    wear_count: 35, last_worn: "2024-06-14T00:00:00Z",
  },
  {
    id: "i6", user_id: "demo", name: "Camel Cashmere Jumper", status: "active",
    category: "Top", colours: ["Tan"], seasons: ["Autumn", "Winter"],
    occasions: ["Casual", "Work"], brand: "John Lewis",
    image_url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80",
    wardrobe_id: "w1", section_id: "s3", wardrobe: w1, section: { id: "s3", name: "Top Shelf" },
    purchase_price: 120, created_at: "2023-11-01T00:00:00Z", updated_at: "2023-11-01T00:00:00Z",
    wear_count: 15, last_worn: "2024-03-10T00:00:00Z",
  },
  {
    id: "i7", user_id: "demo", name: "Dark Wash Straight Jeans", status: "active",
    category: "Bottom", colours: ["Navy", "Blue"], seasons: ["All Year"],
    occasions: ["Casual"], brand: "AGOLDE",
    image_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80",
    wardrobe_id: "w1", section_id: "s2", wardrobe: w1, section: { id: "s2", name: "Right Rail" },
    purchase_price: 195, created_at: "2024-01-05T00:00:00Z", updated_at: "2024-01-05T00:00:00Z",
    wear_count: 28, last_worn: "2024-06-13T00:00:00Z",
  },
  {
    id: "i8", user_id: "demo", name: "Tan Leather Tote", status: "active",
    category: "Bag", colours: ["Tan", "Brown"], seasons: ["All Year"],
    occasions: ["Work", "Casual"], brand: "Totême",
    image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80",
    wardrobe_id: "w3", section_id: "s6", wardrobe: w3, section: { id: "s6", name: "Top Drawer" },
    purchase_price: 395, created_at: "2023-09-01T00:00:00Z", updated_at: "2023-09-01T00:00:00Z",
    wear_count: 45, last_worn: "2024-06-14T00:00:00Z",
  },
  {
    id: "i9", user_id: "demo", name: "Forest Green Trench", status: "active",
    category: "Outerwear", colours: ["Green", "Olive"], seasons: ["Spring", "Autumn"],
    occasions: ["Casual", "Work"], brand: "Burberry",
    image_url: "https://images.unsplash.com/photo-1539533018257-51ad7b5c2a57?w=500&q=80",
    wardrobe_id: "w2", section_id: "s5", wardrobe: w2, section: { id: "s5", name: "Main Rail" },
    purchase_price: 1350, created_at: "2023-10-01T00:00:00Z", updated_at: "2023-10-01T00:00:00Z",
    wear_count: 6, last_worn: "2024-04-02T00:00:00Z",
  },
  {
    id: "i10", user_id: "demo", name: "Black Block Heels", status: "active",
    category: "Shoes", colours: ["Black"], seasons: ["All Year"],
    occasions: ["Work", "Formal", "Evening"],
    image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80",
    wardrobe_id: "w1", section_id: "s4", wardrobe: w1, section: { id: "s4", name: "Shoe Rack" },
    purchase_price: 145, created_at: "2023-12-01T00:00:00Z", updated_at: "2023-12-01T00:00:00Z",
    wear_count: 9, last_worn: "2024-05-30T00:00:00Z",
  },
  {
    id: "i11", user_id: "demo", name: "Striped Breton Top", status: "active",
    category: "Top", colours: ["Navy", "White"], seasons: ["Spring", "Summer"],
    occasions: ["Casual"], brand: "Saint James",
    image_url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&q=80",
    wardrobe_id: "w1", section_id: "s1", wardrobe: w1, section: { id: "s1", name: "Left Rail" },
    purchase_price: 85, created_at: "2024-04-01T00:00:00Z", updated_at: "2024-04-01T00:00:00Z",
    wear_count: 2, last_worn: "2024-06-01T00:00:00Z",
  },
  {
    id: "i12", user_id: "demo", name: "Gold Hoop Earrings", status: "active",
    category: "Accessory", colours: ["Yellow"], seasons: ["All Year"],
    occasions: ["Casual", "Work", "Formal", "Evening"],
    image_url: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500&q=80",
    wardrobe_id: "w3", section_id: "s6", wardrobe: w3, section: { id: "s6", name: "Top Drawer" },
    purchase_price: 35, created_at: "2023-08-01T00:00:00Z", updated_at: "2023-08-01T00:00:00Z",
    wear_count: 60, last_worn: "2024-06-14T00:00:00Z",
  },
  {
    id: "i13", user_id: "demo", name: "Navy Pleated Skirt", status: "active",
    category: "Bottom", colours: ["Navy"], seasons: ["Spring", "Summer"],
    occasions: ["Work", "Casual"], brand: "Whistles",
    image_url: "https://images.unsplash.com/photo-1583496661160-fb5218afa9a6?w=500&q=80",
    wardrobe_id: "w1", section_id: "s2", wardrobe: w1, section: { id: "s2", name: "Right Rail" },
    created_at: "2024-05-01T00:00:00Z", updated_at: "2024-05-01T00:00:00Z",
    wear_count: 0, last_worn: null,
  },
  {
    id: "i14", user_id: "demo", name: "Floral Summer Wrap Dress", status: "active",
    category: "Dress", colours: ["Pink", "Multi"], seasons: ["Summer"],
    occasions: ["Casual", "Occasion", "Evening"], brand: "Faithfull the Brand",
    image_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80",
    wardrobe_id: "w2", section_id: "s5", wardrobe: w2, section: { id: "s5", name: "Main Rail" },
    purchase_price: 189, created_at: "2024-05-15T00:00:00Z", updated_at: "2024-05-15T00:00:00Z",
    wear_count: 0, last_worn: null,
  },
];

// ─── Outfits ──────────────────────────────────────────────────────────────────

const mkOI = (outfitId: string, itemId: string, slot: string, order: number) => ({
  outfit_id: outfitId, item_id: itemId, slot, sort_order: order,
  created_at: "2024-03-01T00:00:00Z",
  item: RAW_ITEMS.find(i => i.id === itemId),
});

export const DEMO_OUTFITS: Outfit[] = [
  {
    id: "o1", user_id: "demo", name: "Friday Office",
    created_at: "2024-03-01T00:00:00Z", updated_at: "2024-03-01T00:00:00Z",
    wear_count: 5, last_worn: "2024-06-07T00:00:00Z",
    items: [
      mkOI("o1", "i1",  "Outerwear", 1),
      mkOI("o1", "i2",  "Top",       2),
      mkOI("o1", "i3",  "Bottom",    3),
      mkOI("o1", "i10", "Shoes",     4),
    ],
  },
  {
    id: "o2", user_id: "demo", name: "Weekend Errands",
    created_at: "2024-04-01T00:00:00Z", updated_at: "2024-04-01T00:00:00Z",
    wear_count: 8, last_worn: "2024-06-13T00:00:00Z",
    items: [
      mkOI("o2", "i11", "Top",    1),
      mkOI("o2", "i7",  "Bottom", 2),
      mkOI("o2", "i5",  "Shoes",  3),
      mkOI("o2", "i8",  "Bag",    4),
    ],
  },
  {
    id: "o3", user_id: "demo", name: "Summer Brunch",
    created_at: "2024-05-01T00:00:00Z", updated_at: "2024-05-01T00:00:00Z",
    wear_count: 2, last_worn: "2024-05-20T00:00:00Z",
    items: [
      mkOI("o3", "i4", "Dress",  1),
      mkOI("o3", "i5", "Shoes",  2),
      mkOI("o3", "i8", "Bag",    3),
    ],
  },
];

// ─── Wardrobes with stats ─────────────────────────────────────────────────────

export const DEMO_WARDROBES_WITH_SECTIONS: WardrobeWithSections[] = RAW_WARDROBES.map(w => {
  const sections = RAW_SECTIONS
    .filter(s => s.wardrobe_id === w.id)
    .map(s => ({
      ...s,
      wardrobe: w,
      item_count: RAW_ITEMS.filter(i => i.section_id === s.id).length,
    }));
  return {
    ...w,
    sections,
    total_items: RAW_ITEMS.filter(i => i.wardrobe_id === w.id).length,
  };
});

// ─── Exports ──────────────────────────────────────────────────────────────────

export const DEMO_ITEMS: ClothingItem[] = RAW_ITEMS;
export const DEMO_WARDROBES: Wardrobe[] = RAW_WARDROBES;
export const DEMO_SECTIONS: WardrobeSection[] = RAW_SECTIONS;
