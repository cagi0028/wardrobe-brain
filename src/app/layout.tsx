import type { Metadata, Viewport } from "next";
import { Playfair_Display, Jost } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";

const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

const body = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Wardrobe Brain", template: "%s · Wardrobe Brain" },
  description: "Your personal wardrobe organiser.",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Wardrobe Brain" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FAFAF8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="bg-stone-50 font-sans antialiased overflow-x-hidden">
        <div className="max-w-md mx-auto min-h-screen relative border-x border-stone-200/60">
          <main className="page-bottom-pad">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
