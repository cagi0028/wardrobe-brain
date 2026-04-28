"use client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FabProps { href?: string; onClick?: () => void; label?: string; className?: string; }

export function Fab({ href, onClick, label, className }: FabProps) {
  const cls = cn(
    "flex items-center gap-2 bg-stone-900 text-white rounded-full shadow-float transition-all duration-150 active:scale-95 hover:bg-stone-800",
    label ? "px-5 py-3.5 text-sm font-semibold" : "p-4",
    className
  );
  const style = { bottom: "calc(64px + env(safe-area-inset-bottom,0px) + 14px)" };
  const inner = <><Plus size={20} strokeWidth={2.5} aria-hidden />{label && <span>{label}</span>}</>;
  if (href) return <Link href={href} aria-label={label ?? "Add"} className={cn("fixed right-4 z-40", cls)} style={style}>{inner}</Link>;
  return <button onClick={onClick} aria-label={label ?? "Add"} className={cn("fixed right-4 z-40", cls)} style={style}>{inner}</button>;
}
