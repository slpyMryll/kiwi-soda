import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kiwi Soda - VSU University Supreme Student Council Project Hub",
  description: "Discover, share, and collaborate on student projects at VSU. A vibrant hub for innovation and creativity.",
};

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <body className="min-h-screen" suppressHydrationWarning>{children}</body>
    </html>
  );
}
