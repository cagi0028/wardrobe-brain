"use client";

import { cn } from "@/lib/utils";
import { forwardRef, useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2, X, CheckCircle2, AlertCircle, Info } from "lucide-react";

// ── Button ────────────────────────────────────────────────────────────────────

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  loadingText?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, loadingText, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold rounded-2xl",
        "transition-all duration-150 select-none",
        "active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2",
        variant === "primary"   && "bg-stone-900 text-white hover:bg-stone-800 shadow-sm",
        variant === "secondary" && "bg-stone-100 text-stone-800 hover:bg-stone-200",
        variant === "ghost"     && "bg-transparent text-stone-600 hover:bg-stone-100",
        variant === "danger"    && "bg-red-50 text-red-600 hover:bg-red-100",
        size === "sm" && "px-3 py-2 text-xs",
        size === "md" && "px-4 py-2.5 text-sm",
        size === "lg" && "px-6 py-4 text-sm w-full",
        className
      )}
      {...props}
    >
      {loading
        ? <><Loader2 size={15} className="animate-spin flex-shrink-0" /><span>{loadingText ?? children}</span></>
        : children}
    </button>
  )
);
Button.displayName = "Button";

// ── BottomSheet ────────────────────────────────────────────────────────────────

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function BottomSheet({ open, onClose, title, children, className }: BottomSheetProps) {
  const firstRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label={title ?? "Menu"} className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in" aria-hidden onClick={onClose} />
      <div className={cn(
        "relative bg-white rounded-t-3xl shadow-float max-h-[90vh] flex flex-col animate-slide-up",
        className
      )}>
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0" aria-hidden>
          <div className="w-10 h-1 rounded-full bg-stone-200" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100 flex-shrink-0">
            <h2 className="font-semibold text-stone-900 text-base">{title}</h2>
            <button onClick={onClose} aria-label="Close"
              className="w-8 h-8 rounded-full hover:bg-stone-100 active:bg-stone-200 flex items-center justify-center transition-colors">
              <X size={18} className="text-stone-500" aria-hidden />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1 overscroll-contain">{children}</div>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error" | "info" | "loading";
export interface ToastState { type: ToastVariant | "idle"; message?: string; }
export const IDLE_TOAST: ToastState = { type: "idle" };

export function useToast() {
  const [toast, setToast] = useState<ToastState>(IDLE_TOAST);
  return {
    toast,
    showLoading: (message = "Saving…") => setToast({ type: "loading", message }),
    showSuccess: (message: string)      => setToast({ type: "success", message }),
    showError:   (message: string)      => setToast({ type: "error",   message }),
    dismiss:     ()                     => setToast(IDLE_TOAST),
  };
}

interface ToastProps { toast: ToastState; onDismiss: () => void; autoDismissMs?: number; }

export function Toast({ toast, onDismiss, autoDismissMs = 2500 }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast.type === "idle") { setVisible(false); return; }
    setVisible(true);
    if (autoDismissMs > 0 && (toast.type === "success" || toast.type === "info")) {
      const t = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 200); }, autoDismissMs);
      return () => clearTimeout(t);
    }
  }, [toast, autoDismissMs, onDismiss]);

  if (toast.type === "idle") return null;

  const configs: Record<ToastVariant, { bg: string; icon: ReactNode; text: string }> = {
    loading: { bg: "bg-stone-800",   icon: <Loader2    size={15} className="animate-spin text-white flex-shrink-0" />, text: "text-white" },
    success: { bg: "bg-emerald-600", icon: <CheckCircle2 size={15} className="text-white flex-shrink-0" />,           text: "text-white" },
    error:   { bg: "bg-white border border-red-100 shadow-card", icon: <AlertCircle size={15} className="text-red-500 flex-shrink-0" />, text: "text-red-700" },
    info:    { bg: "bg-stone-700",   icon: <Info       size={15} className="text-white flex-shrink-0" />,             text: "text-white" },
  };
  const { bg, icon, text } = configs[toast.type as ToastVariant];

  return (
    <div role="status" aria-live="polite"
      className={cn(
        "fixed top-4 left-4 right-4 z-[60] max-w-md mx-auto transition-all duration-200",
        visible ? "animate-slide-up opacity-100" : "opacity-0 translate-y-2 pointer-events-none"
      )}>
      <div className={cn("flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-float", bg)}>
        {icon}
        <p className={cn("text-sm font-medium flex-1 leading-snug", text)}>{toast.message}</p>
        {(toast.type === "error" || toast.type === "info") && (
          <button onClick={() => { setVisible(false); setTimeout(onDismiss, 200); }}
            aria-label="Dismiss"
            className="flex-shrink-0 p-0.5 rounded-full opacity-70 hover:opacity-100">
            <X size={14} className={toast.type === "error" ? "text-red-500" : "text-white"} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton rounded-2xl", className)} />;
}

export function ItemCardSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-hidden>
      <Skeleton className="aspect-[3/4] w-full" />
      <Skeleton className="h-3.5 w-3/4 rounded-full" />
      <Skeleton className="h-3 w-1/2 rounded-full" />
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div aria-label="Loading…" aria-busy className="grid grid-cols-2 gap-x-3 gap-y-5 px-4 pt-2">
      {Array.from({ length: count }).map((_, i) => <ItemCardSkeleton key={i} />)}
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: ReactNode; title: string; description?: string;
  action?: ReactNode; className?: string; compact?: boolean;
}
export function EmptyState({ icon, title, description, action, className, compact }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 text-center", compact ? "py-10" : "py-20", className)}>
      {icon && (
        <div className="w-16 h-16 rounded-3xl bg-stone-100 flex items-center justify-center mb-4 text-stone-300">
          {icon}
        </div>
      )}
      <h3 className="font-semibold text-stone-800 text-base mb-1.5">{title}</h3>
      {description && <p className="text-stone-400 text-sm leading-relaxed mb-5 max-w-[260px]">{description}</p>}
      {action}
    </div>
  );
}

// ── Chip ──────────────────────────────────────────────────────────────────────

interface ChipProps {
  label: string; active?: boolean; onClick?: () => void;
  prefix?: ReactNode; fullWidth?: boolean; small?: boolean;
}
export function Chip({ label, active, onClick, prefix, fullWidth, small }: ChipProps) {
  return (
    <button type="button" onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-all border active:scale-95 select-none",
        small ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
        active
          ? "bg-stone-900 text-white border-stone-900"
          : "bg-white text-stone-600 border-stone-200 hover:border-stone-400",
        fullWidth && "w-full"
      )}>
      {prefix}{label}
    </button>
  );
}
