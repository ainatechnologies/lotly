import type { Metadata, Viewport } from "next";
import { Big_Shoulders, IBM_Plex_Mono, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

const display = Big_Shoulders({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"],
  fallback: ["Impact", "Arial Narrow", "sans-serif"],
  adjustFontFallback: false,
});

const body = Schibsted_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Lotly — Fair giveaway picker for YouTube, Instagram, TikTok & Twitch",
  description:
    "Draw giveaway winners from YouTube comments, Instagram and TikTok exports, Twitch chat, or any list — with a fairness receipt your audience can verify.",
  openGraph: {
    title: "Lotly — Pick the winner. Prove it was fair.",
    description:
      "The giveaway picker for creators on every platform. Free to run, $29 once for Pro.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0c0d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
