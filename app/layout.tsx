import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import QueryProvider from "./providers/QueryProvider";
import NextTopLoader from 'nextjs-toploader';
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "OnTrack - VSU University Supreme Student Council Project Hub",
    template: "%s | OnTrack"
  },
  description: "Discover, share, and collaborate on student projects at VSU. A vibrant hub for innovation and creativity, ensuring transparency in council initiatives.",
  keywords: ["VSU", "Student Council", "Project Tracking", "Transparency", "Kiwi Soda", "University Supreme Student Council"],
  authors: [{ name: "USSC" }],
  creator: "USSC",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ontrack-web-gamma.vercel.app",
    siteName: "OnTrack",
    title: "OnTrack - VSU Student Project Hub",
    description: "Real-time project tracking and budget transparency for VSU students.",
    images: [
      {
        url: "/logov3.png",
        width: 800,
        height: 600,
        alt: "OnTrack Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OnTrack - VSU Student Project Hub",
    description: "Real-time project tracking and budget transparency for VSU students.",
    images: ["/logov3.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  alternates: {
    canonical: "https://ontrack-web-gamma.vercel.app",
  },
  metadataBase: new URL("https://ontrack-web-gamma.vercel.app"),
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
      <body className="min-h-screen" suppressHydrationWarning>
        <NextTopLoader color="#52B788" showSpinner={false} height={3} />
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}