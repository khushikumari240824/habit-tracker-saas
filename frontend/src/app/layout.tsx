import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "@/styles/globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Habit Tracker - Build Routines",
  description: "Maintain streaks and visualize your daily habits",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${outfit.className} min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 antialiased selection:bg-indigo-500/30`}>
        {children}
      </body>
    </html>
  );
}
