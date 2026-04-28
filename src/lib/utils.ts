import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Colour, Category, Season, Occasion } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Colour map ───────────────────────────────────────────────────────────────

export const COLOUR_HEX: Record<Colour, string> = {
  Black:  "#1C1917",
  White:  "#FAF9F6",
  Grey:   "#9CA3AF",
  Navy:   "#1E3A5F",
  Blue:   "#3B82F6",
  Green:  "#16A34A",
  Olive:  "#6B7C32",
  Brown:  "#7C5C3A",
  Tan:    "#C9A96E",
  Cream:  "#F5EDDB",
  Red:    "#DC2626",
  Pink:   "#EC4899",
  Orange: "#F97316",
  Yellow: "#EAB308",
  Purple: "#9333EA",
  Multi:  "#E2D4F0",
  Other:  "#D1D5DB",
};

// ─── Constants ────────────────────────────────────────────────────────────────

export const CATEGORIES: Category[] = [
  "Top", "Bottom", "Dress", "Jumpsuit", "Outerwear",
  "Shoes", "Bag", "Accessory", "Activewear", "Swimwear",
  "Nightwear", "Other",
];

export const COLOURS: Colour[] = Object.keys(COLOUR_HEX) as Colour[];

export const SEASONS: Season[] = ["Spring", "Summer", "Autumn", "Winter", "All Year"];

export const OCCASIONS: Occasion[] = [
  "Casual", "Work", "Formal", "Sport", "Evening", "Occasion", "Lounge",
];

export const CLOTHING_SIZES = [
  "XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "One Size",
];

export const SHOE_SIZES = Array.from({ length: 16 }, (_, i) => `EU ${33 + i}`);

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRelative(dateStr: string): string {
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 86_400_000
  );
  if (diff === 0) return "today";
  if (diff === 1) return "yesterday";
  if (diff < 7)  return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  if (diff < 365) return `${Math.floor(diff / 30)}mo ago`;
  return `${Math.floor(diff / 365)}y ago`;
}

export function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

// ─── Image URL helper ─────────────────────────────────────────────────────────

export function getImg(item: any): string | null {
  return item?.image_url ?? item?.photo_url ?? null;
}

// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatCurrency(n: number, currency = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
