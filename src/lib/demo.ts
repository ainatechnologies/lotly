import type { Platform } from "./types";

const HANDLES = [
  "maya.makes",
  "jordan_k",
  "pixelnomad",
  "ava.crafts",
  "leoloops",
  "nova.beat",
  "sam_sketch",
  "riley.riff",
  "kai_frames",
  "zoevault",
  "chris.clip",
  "nina_notes",
  "omar.ops",
  "lina.lens",
  "theo_tone",
  "ivy.ink",
  "benbytes",
  "sara.snap",
  "drew_desk",
  "mila.mix",
  "otto.grain",
  "yara_films",
  "felix.fm",
  "june.loop",
];

const COMMENTS = [
  "Count me in #giveaway",
  "Been here since the first upload #giveaway",
  "Tagging my sister, we both need this #giveaway",
  "This would upgrade my whole desk #giveaway",
  "Love the edit on this one",
  "Fingers crossed #giveaway",
  "Entering from Lagos #giveaway",
  "Night shift crew checking in #giveaway",
  "Fair draws only #giveaway",
  "Dropping my name in the hat #giveaway",
  "Saved and shared #giveaway",
  "First time entering anything #giveaway",
];

function csvCell(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export const DEMO_SOURCE_URL: Record<Exclude<Platform, "youtube">, string> = {
  instagram: "https://instagram.com/p/LotlyDemo01/",
  tiktok: "https://tiktok.com/@lotly/video/7390000000000000001",
  twitch: "twitch.tv/lotlylive",
  paste: "Discord merch raffle",
};

export const DEMO_OWNER: Record<Exclude<Platform, "youtube">, string> = {
  instagram: "lotly.studio",
  tiktok: "lotly",
  twitch: "lotlylive",
  paste: "",
};

export function buildDemoText(platform: Exclude<Platform, "youtube">, count = 160): string {
  if (platform === "instagram") {
    const rows = ["Username,Comment,Likes,Date"];
    for (let i = 0; i < count; i++) {
      const handle = i === 9 ? DEMO_OWNER.instagram : HANDLES[i % HANDLES.length];
      rows.push(
        [
          handle,
          csvCell(COMMENTS[(i * 5) % COMMENTS.length]),
          String((i * 7) % 23),
          new Date(Date.UTC(2026, 8, 20, 12, i)).toISOString(),
        ].join(","),
      );
    }
    return rows.join("\n");
  }

  if (platform === "tiktok") {
    const rows = ["Unique ID,Nickname,Comment,Likes"];
    for (let i = 0; i < count; i++) {
      const handle = HANDLES[(i * 7) % HANDLES.length];
      rows.push(
        [
          handle,
          csvCell(handle.replace(/[._]/g, " ")),
          csvCell(COMMENTS[(i * 7) % COMMENTS.length]),
          String((i * 11) % 40),
        ].join(","),
      );
    }
    return rows.join("\n");
  }

  if (platform === "twitch") {
    const lines: string[] = [];
    for (let i = 0; i < count; i++) {
      const handle = HANDLES[(i * 5) % HANDLES.length].replace(/\./g, "_");
      const message = i % 6 === 0 ? "gg that clutch was insane" : "!enter";
      const secs = 3 + i * 4;
      lines.push(
        `[20:${pad(14 + Math.floor(secs / 60))}:${pad(secs % 60)}] ${handle}: ${message}`,
      );
    }
    return lines.join("\n");
  }

  return HANDLES.map((h) => h.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())).join(
    "\n",
  );
}
