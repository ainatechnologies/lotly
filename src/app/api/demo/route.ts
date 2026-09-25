import { NextResponse } from "next/server";
import { buildDemoComments, DEMO_VIDEO } from "@/lib/youtube";

export async function GET() {
  const comments = buildDemoComments(240);
  return NextResponse.json({
    video: DEMO_VIDEO,
    comments,
    mode: "demo",
    truncated: false,
    totalFetched: comments.length,
  });
}
