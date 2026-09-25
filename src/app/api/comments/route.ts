import { NextResponse } from "next/server";
import { fetchVideoAndComments } from "@/lib/fetch-comments";
import { FREE_COMMENT_CAP } from "@/lib/types";
import { getPlanFromCookies } from "@/lib/license";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { url?: string };
    const url = body.url?.trim();
    if (!url) {
      return NextResponse.json({ error: "Video URL is required." }, { status: 400 });
    }

    const plan = await getPlanFromCookies();
    const maxComments = plan === "pro" ? 5000 : FREE_COMMENT_CAP;
    const result = await fetchVideoAndComments(url, maxComments);

    const capped =
      plan === "free" && result.comments.length > FREE_COMMENT_CAP
        ? result.comments.slice(0, FREE_COMMENT_CAP)
        : result.comments;

    return NextResponse.json({
      video: result.video,
      comments: capped,
      mode: result.mode,
      truncated:
        result.truncated ||
        (plan === "free" && result.totalFetched > FREE_COMMENT_CAP),
      totalFetched: result.totalFetched,
      plan,
      freeCap: FREE_COMMENT_CAP,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load comments.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
