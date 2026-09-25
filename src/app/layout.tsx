import type { Metadata } from "next";
import { Syne, Figtree } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const figtree = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lotly — Fair YouTube giveaway picker",
  description:
    "Pick random YouTube comment winners with filters, multi-draws, and a shareable fairness proof. Free to start. Pro is a one-time unlock.",
  openGraph: {
    title: "Lotly — Fair YouTube giveaway picker",
    description:
      "The giveaway randomizer creators can trust — and monetize their audience with.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${figtree.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
