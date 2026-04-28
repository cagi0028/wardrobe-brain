"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  backHref?: string;
  action?: React.ReactNode;
  transparent?: boolean;
  className?: string;
}

export function PageHeader({ title, subtitle, back, backHref, action, transparent, className }: PageHeaderProps) {
  const router = useRouter();
  return (
    <header className={cn(
      "sticky top-0 z-30 px-4",
      !transparent && "bg-stone-50/95 backdrop-blur-md border-b border-stone-200/60",
      className
    )}>
      <div className="flex items-center gap-2 h-14">
        {back && (
          <button
            onClick={() => backHref ? router.push(backHref) : router.back()}
            aria-label="Go back"
            className="p-2 -ml-2 rounded-xl hover:bg-stone-100 active:bg-stone-200 transition-colors text-stone-600 flex-shrink-0">
            <ChevronLeft size={22} aria-hidden />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-stone-900 text-lg leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs text-stone-400 truncate leading-none mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </header>
  );
}
