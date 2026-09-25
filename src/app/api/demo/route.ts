import { NextResponse } from "next/server";
import { buildDemoComments, DEMO_VIDEO } from "@/lib/youtube";
import { buildDemoText, DEMO_SOURCE_URL } from "@/lib/demo";
import { importEntries } from "@/lib/import";
import { PLATFORM_ORDER } from "@/lib/platforms";
import type { Platform } from "@/lib/types";

export async function GET(req: Request) {
  const requested = new URL(req.url).searchParams.get("platform") as Platform | null;
  const platform: Platform =
    requested && PLATFORM_ORDER.includes(requested) ? requested : "youtube";

  if (platform === "youtube") {
    const comments = buildDemoComments(240);
    return NextResponse.json({
      platform,
      video: DEMO_VIDEO,
      comments,
      mode: "demo",
      truncated: false,
      totalFetched: comments.length,
    });
  }

  const { entries } = importEntries(buildDemoText(platform), platform);
  return NextResponse.json({
    platform,
    sourceUrl: DEMO_SOURCE_URL[platform],
    comments: entries,
    mode: "demo",
    truncated: false,
    totalFetched: entries.length,
  });
}
