"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Shirt, Sparkles, MapPin, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Home",     icon: LayoutGrid },
  { href: "/items",     label: "Items",    icon: Shirt      },
  { href: "/outfits",   label: "Outfits",  icon: Sparkles   },
  { href: "/wardrobes", label: "Storage",  icon: MapPin     },
  { href: "/insights",  label: "Insights", icon: BarChart3  },
] as const;

export function BottomNav() {
  const path = usePathname();
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <nav className="bg-white/96 backdrop-blur-md border-t border-x border-stone-200/60"
             style={{ paddingBottom: "max(env(safe-area-inset-bottom,0px),6px)" }}>
          <div className="flex items-center justify-around">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = path === href || (href !== "/dashboard" && path.startsWith(href));
              return (
                <Link key={href} href={href}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-0.5 pt-2 pb-1 px-3 min-w-[52px] transition-colors duration-150",
                    active ? "text-stone-900" : "text-stone-400 hover:text-stone-600"
                  )}>
                  <div className={cn("p-1.5 rounded-xl transition-all duration-150", active && "bg-stone-100")}>
                    <Icon size={19} strokeWidth={active ? 2.5 : 1.8} aria-hidden />
                  </div>
                  <span className={cn("text-[9px] font-semibold tracking-wide uppercase",
                    active ? "text-stone-800" : "text-stone-400")}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
