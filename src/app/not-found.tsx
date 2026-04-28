import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <div className="text-6xl mb-4">?</div>
      <h1 className="text-2xl font-semibold text-stone-900 mb-2">Page not found</h1>
      <p className="text-stone-400 text-sm mb-8">That page doesn't exist.</p>
      <Link href="/dashboard" className="flex items-center gap-2 bg-stone-900 text-white text-sm font-semibold px-5 py-3 rounded-2xl">
        <Home size={16} /> Go home
      </Link>
    </div>
  );
}
