import type { Comment, VideoMeta } from "./types";

const DEMO_NAMES = [
  "MayaStreams",
  "JordanK",
  "PixelNomad",
  "AvaCrafts",
  "LeoLoops",
  "NovaBeat",
  "SamSketch",
  "RileyRiff",
  "KaiFrames",
  "ZoeVault",
  "ChrisClip",
  "NinaNotes",
  "OmarOps",
  "LinaLens",
  "TheoTone",
  "IvyInk",
  "BenBytes",
  "SaraSnap",
  "DrewDesk",
  "MilaMix",
];

const DEMO_TEXTS = [
  "Count me in! #giveaway",
  "Been watching since day one — #giveaway please!",
  "Entering for my studio setup #giveaway",
  "Love this channel. #giveaway",
  "Random luck activate #giveaway",
  "Would mean the world #giveaway",
  "Here for the vibes and the #giveaway",
  "Fingers crossed #giveaway",
  "Commenting from Brazil #giveaway",
  "Team night owl checking in #giveaway",
  "Need this for my next project #giveaway",
  "Fair draws only — trust the process #giveaway",
  "Signed up and ready #giveaway",
  "Dropping my name in the hat #giveaway",
  "May the odds be ever in my favor #giveaway",
];

export const DEMO_VIDEO: VideoMeta = {
  videoId: "demoLotlyGiveaway",
  title: "Lotly demo giveaway — pick a fair winner",
  channelTitle: "Lotly Creators",
  channelId: "UC_LOTLY_DEMO",
  thumbnailUrl:
    "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=640&q=80",
  commentCount: 240,
};

export function buildDemoComments(count = 240): Comment[] {
  const comments: Comment[] = [];
  for (let i = 0; i < count; i++) {
    const author = DEMO_NAMES[i % DEMO_NAMES.length];
    const text = DEMO_TEXTS[i % DEMO_TEXTS.length];
    comments.push({
      id: `demo-cmt-${i + 1}`,
      author: `${author}${i > DEMO_NAMES.length ? i : ""}`,
      authorChannelId: `UC_DEMO_${(i % DEMO_NAMES.length) + 1}`,
      text: i % 7 === 0 ? text.replace("#giveaway", "hello!") : text,
      likeCount: (i * 3) % 17,
      publishedAt: new Date(Date.now() - i * 3600_000).toISOString(),
    });
  }
  return comments;
}

export function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  if (trimmed === "demo" || trimmed.includes("demoLotly")) {
    return DEMO_VIDEO.videoId;
  }

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id?.slice(0, 11) ?? null;
    }
    if (url.searchParams.get("v")) return url.searchParams.get("v");
    const shorts = url.pathname.match(/\/(shorts|embed|live)\/([\w-]{11})/);
    if (shorts) return shorts[2];
  } catch {
    return null;
  }
  return null;
}
