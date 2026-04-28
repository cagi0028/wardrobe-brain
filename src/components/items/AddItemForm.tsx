"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Camera, X, ImagePlus, ChevronDown, Loader2 } from "lucide-react";
import { cn, CATEGORIES, COLOURS, SEASONS, OCCASIONS, COLOUR_HEX, CLOTHING_SIZES, SHOE_SIZES } from "@/lib/utils";
import { Toast, useToast } from "@/components/ui";
import { saveItem, getWardrobes } from "@/lib/data";
import { IS_DEMO, DEMO_WARDROBES_WITH_SECTIONS } from "@/lib/demo";
import type { Category, Colour, Season, Occasion, ItemStatus } from "@/types";

const STATUS_OPTS: { value: ItemStatus; label: string; desc: string }[] = [
  { value: "active",    label: "Active",    desc: "In wardrobe, being worn" },
  { value: "stored",    label: "Stored",    desc: "Packed away seasonally" },
  { value: "donated",   label: "Donated",   desc: "Given away or sold" },
  { value: "discarded", label: "Discarded", desc: "Worn out or thrown away" },
];

export function AddItemForm() {
  const router = useRouter();
  const { toast, showLoading, showSuccess, showError, dismiss } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName]         = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [colours, setColours]   = useState<Colour[]>([]);
  const [seasons, setSeasons]   = useState<Season[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [brand, setBrand]       = useState("");
  const [size, setSize]         = useState("");
  const [price, setPrice]       = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [notes, setNotes]       = useState("");
  const [wardrobeId, setWardrobeId] = useState("");
  const [sectionId, setSectionId]   = useState("");
  const [status, setStatus]     = useState<ItemStatus>("active");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview]   = useState<string | null>(null);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [saving, setSaving]     = useState(false);

  const [wardrobes, setWardrobes] = useState(IS_DEMO ? DEMO_WARDROBES_WITH_SECTIONS : []);
  const [loadingW, setLoadingW]   = useState(!IS_DEMO);

  useEffect(() => {
    if (IS_DEMO) return;
    getWardrobes().then((r) => { if (r.ok) setWardrobes(r.data); setLoadingW(false); });
  }, []);

  const toggle = <T extends string>(arr: T[], val: T, set: (v: T[]) => void) =>
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setErrors((p) => ({ ...p, image: "Max 5 MB" })); return; }
    setPreview(URL.createObjectURL(f));
    setImageFile(f);
    setErrors((p) => { const n = { ...p }; delete n.image; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Required";
    if (!category)    e.category = "Required";
    if (price && isNaN(parseFloat(price))) e.price = "Must be a number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setSaving(true);
    showLoading("Saving item…");
    const fd = new FormData();
    fd.set("name", name.trim());
    fd.set("category", category);
    fd.set("colours", JSON.stringify(colours));
    fd.set("seasons", JSON.stringify(seasons));
    fd.set("occasions", JSON.stringify(occasions));
    fd.set("brand", brand.trim());
    fd.set("size", size);
    fd.set("purchase_price", price);
    fd.set("purchase_date", purchaseDate);
    fd.set("notes", notes.trim());
    fd.set("wardrobe_id", wardrobeId);
    fd.set("section_id", sectionId);
    fd.set("status", status);
    const result = await saveItem(fd, imageFile ?? undefined);
    setSaving(false);
    if (!result.ok) { showError(result.error); return; }
    showSuccess("Item saved!");
    await new Promise((r) => setTimeout(r, 500));
    router.push(`/items/${result.data.id}`);
  }, [name, category, colours, seasons, occasions, brand, size, price, purchaseDate, notes, wardrobeId, sectionId, status, imageFile, router]);

  const sections = wardrobes.find((w) => w.id === wardrobeId)?.sections ?? [];
  const isShoes  = category === "Shoes";
  const sizeList = isShoes ? SHOE_SIZES : CLOTHING_SIZES;
  const canSave  = !!name.trim() && !!category && !saving;

  return (
    <>
      <Toast toast={toast} onDismiss={dismiss} />
      <div className="pb-32">
        {/* Photo upload */}
        <div className="px-4 pt-4 pb-2">
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleFile} />
          {preview ? (
            <div className="relative rounded-3xl overflow-hidden bg-stone-100" style={{ aspectRatio: "4/3" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button onClick={() => { setPreview(null); setImageFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                <X size={15} className="text-white" />
              </button>
              <button onClick={() => fileRef.current?.click()}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
                <Camera size={13} className="text-white" />
                <span className="text-white text-xs font-medium">Replace</span>
              </button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()}
              className="w-full rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50 flex flex-col items-center justify-center gap-3 hover:border-stone-400 hover:bg-stone-100/50 active:scale-[0.99] transition-all"
              style={{ aspectRatio: "4/3" }}>
              <div className="w-14 h-14 rounded-2xl bg-white shadow-card flex items-center justify-center">
                <ImagePlus size={24} className="text-stone-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-stone-700">Add a photo</p>
                <p className="text-xs text-stone-400 mt-0.5">Tap to take or choose · max 5 MB</p>
              </div>
            </button>
          )}
          {errors.image && <p className="text-xs text-red-500 mt-1.5 px-1">{errors.image}</p>}
        </div>

        <div className="px-4 space-y-5 pt-4">
          {/* Name */}
          <Field label="Name" required error={errors.name}>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Navy Wool Blazer"
              className={cn(inputCls, errors.name && "ring-2 ring-red-300")} />
          </Field>

          {/* Category */}
          <Field label="Category" required error={errors.category}>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <ChipB key={c} active={category === c} onClick={() => { setCategory(c); setSize(""); }}>
                  {c}
                </ChipB>
              ))}
            </div>
          </Field>

          {/* Colours */}
          <Field label="Colours">
            <div className="flex flex-wrap gap-2">
              {COLOURS.map((c) => (
                <ChipB key={c} active={colours.includes(c)} onClick={() => toggle(colours, c, setColours)}
                  prefix={<span className="w-3 h-3 rounded-full ring-1 ring-black/10 flex-shrink-0"
                    style={c === "Multi" ? { background: "linear-gradient(135deg,#F87171,#60A5FA,#34D399)" } : { backgroundColor: COLOUR_HEX[c as Colour] }} />}>
                  {c}
                </ChipB>
              ))}
            </div>
          </Field>

          {/* Seasons */}
          <Field label="Seasons">
            <div className="grid grid-cols-3 gap-2">
              {SEASONS.map((s) => <ChipB key={s} fullWidth active={seasons.includes(s)} onClick={() => toggle(seasons, s, setSeasons)}>{s}</ChipB>)}
            </div>
          </Field>

          {/* Occasions */}
          <Field label="Occasions">
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((o) => <ChipB key={o} active={occasions.includes(o)} onClick={() => toggle(occasions, o, setOccasions)}>{o}</ChipB>)}
            </div>
          </Field>

          <div className="border-t border-stone-100" />

          {/* Brand + Size */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Brand">
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Arket" className={inputCls} />
            </Field>
            <Field label="Size">
              <SelectInput value={size} onChange={setSize} placeholder="Select…"
                options={sizeList.map((s) => ({ value: s, label: s }))} />
            </Field>
          </div>

          {/* Price + Date */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price paid" error={errors.price}>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm select-none">£</span>
                <input type="number" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00" step="0.01" min="0"
                  className={cn(inputCls, "pl-7", errors.price && "ring-2 ring-red-300")} />
              </div>
            </Field>
            <Field label="Date bought">
              <input type="date" value={purchaseDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setPurchaseDate(e.target.value)} className={inputCls} />
            </Field>
          </div>

          <div className="border-t border-stone-100" />

          {/* Location */}
          <Field label="Storage location">
            {loadingW ? (
              <div className="flex items-center gap-2 px-4 py-3 bg-stone-100 rounded-2xl">
                <Loader2 size={14} className="animate-spin text-stone-400" />
                <span className="text-sm text-stone-400">Loading wardrobes…</span>
              </div>
            ) : wardrobes.length === 0 ? (
              <div className="px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl">
                <p className="text-sm text-amber-800">
                  No wardrobes yet.{" "}
                  <a href="/wardrobes" className="font-semibold underline">Add one →</a>
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <SelectInput value={wardrobeId} onChange={(v) => { setWardrobeId(v); setSectionId(""); }}
                  placeholder="Select wardrobe…"
                  options={wardrobes.map((w) => ({ value: w.id, label: w.name }))} />
                {wardrobeId && sections.length > 0 && (
                  <SelectInput value={sectionId} onChange={setSectionId}
                    placeholder="Section (optional)…"
                    options={sections.map((s) => ({ value: s.id, label: s.name }))} />
                )}
              </div>
            )}
          </Field>

          {/* Status */}
          <Field label="Status">
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTS.map((opt) => (
                <button key={opt.value} type="button" onClick={() => setStatus(opt.value)}
                  className={cn("flex flex-col items-start px-3.5 py-3 rounded-2xl border text-left transition-all active:scale-[0.98]",
                    status === opt.value ? "bg-stone-900 border-stone-900" : "bg-white border-stone-200 hover:border-stone-400")}>
                  <span className={cn("text-xs font-semibold", status === opt.value ? "text-white" : "text-stone-800")}>
                    {opt.label}
                  </span>
                  <span className={cn("text-[10px] mt-0.5", status === opt.value ? "text-stone-300" : "text-stone-400")}>
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </Field>

          {/* Notes */}
          <Field label="Notes">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Care instructions, fit notes, where to wear it…"
              rows={3} maxLength={1000}
              className={cn(inputCls, "resize-none")} />
            {notes.length > 800 && (
              <p className="text-xs text-stone-400 text-right mt-1">{notes.length}/1000</p>
            )}
          </Field>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-100">
        <div className="max-w-md mx-auto px-4 pt-3 pb-safe">
          <div className="pb-3">
            <button onClick={handleSubmit} disabled={!canSave}
              className={cn(
                "w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 font-semibold text-sm transition-all active:scale-[0.98]",
                canSave ? "bg-stone-900 text-white shadow-float hover:bg-stone-800" : "bg-stone-200 text-stone-400 cursor-not-allowed"
              )}>
              {saving ? <><Loader2 size={16} className="animate-spin" />Saving…</> : "Save item"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const inputCls = "w-full px-4 py-3 rounded-2xl bg-stone-100 text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300";

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
      </div>
      {children}
    </div>
  );
}

function ChipB({ children, active, onClick, prefix, fullWidth }: { children: React.ReactNode; active: boolean; onClick: () => void; prefix?: React.ReactNode; fullWidth?: boolean }) {
  return (
    <button type="button" onClick={onClick}
      className={cn("inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95",
        active ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200 hover:border-stone-400",
        fullWidth && "w-full")}>
      {prefix}{children}
    </button>
  );
}

function SelectInput({ value, onChange, placeholder, options }: { value: string; onChange: (v: string) => void; placeholder: string; options: { value: string; label: string }[] }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className={cn(inputCls, "pr-10")}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
    </div>
  );
}
