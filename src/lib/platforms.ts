import type { Platform } from "./types";

export type PlatformConfig = {
  id: Platform;
  label: string;
  code: string;
  noun: string;
  canFetch: boolean;
  urlLabel: string;
  urlPlaceholder: string;
  pasteLabel: string;
  pastePlaceholder: string;
  pasteHint: string;
  ownerLabel: string;
  demoKeyword: string;
  pitch: string;
};

export const PLATFORM_ORDER: Platform[] = [
  "youtube",
  "instagram",
  "tiktok",
  "twitch",
  "paste",
];

export const PLATFORMS: Record<Platform, PlatformConfig> = {
  youtube: {
    id: "youtube",
    label: "YouTube",
    code: "YT",
    noun: "comments",
    canFetch: true,
    urlLabel: "Video link",
    urlPlaceholder: "youtube.com/watch?v=…",
    pasteLabel: "Comment export",
    pastePlaceholder: "author,text\nMayaStreams,Count me in #giveaway",
    pasteHint: "Paste a comment export or one entry per line.",
    ownerLabel: "Channel handle",
    demoKeyword: "#giveaway",
    pitch: "Drop the video link. Every top-level comment loads straight from YouTube.",
  },
  instagram: {
    id: "instagram",
    label: "Instagram",
    code: "IG",
    noun: "comments",
    canFetch: false,
    urlLabel: "Post or Reel link",
    urlPlaceholder: "https://instagram.com/p/…",
    pasteLabel: "Comments or CSV export",
    pastePlaceholder: "username: comment\n@maya.makes Count me in #giveaway",
    pasteHint:
      "Paste comments as “username: comment”, or drop the CSV from your comment exporter.",
    ownerLabel: "Your handle",
    demoKeyword: "#giveaway",
    pitch: "Drop your comment export or paste the thread. The post link goes on the receipt.",
  },
  tiktok: {
    id: "tiktok",
    label: "TikTok",
    code: "TT",
    noun: "comments",
    canFetch: false,
    urlLabel: "Video link",
    urlPlaceholder: "https://tiktok.com/@you/video/…",
    pasteLabel: "Comments or CSV export",
    pastePlaceholder: "Unique ID,Comment\nnova.beat,entering #giveaway",
    pasteHint:
      "Works with TikTok comment exports (Unique ID / Nickname / Comment) or plain pasted lines.",
    ownerLabel: "Your handle",
    demoKeyword: "#giveaway",
    pitch: "Paste comments or upload the CSV your exporter gives you. Usernames stay intact.",
  },
  twitch: {
    id: "twitch",
    label: "Twitch",
    code: "TW",
    noun: "chat entries",
    canFetch: false,
    urlLabel: "Channel",
    urlPlaceholder: "twitch.tv/yourchannel",
    pasteLabel: "Chat log or usernames",
    pastePlaceholder: "[20:14:03] nightowl_tv: !enter\n[20:14:05] kai_frames: !enter",
    pasteHint:
      "Paste raw chat — timestamps are stripped and “name: message” is split for you. Filter on !enter.",
    ownerLabel: "Your channel name",
    demoKeyword: "!enter",
    pitch: "Paste the chat log. Timestamps get stripped, so you can filter on !enter.",
  },
  paste: {
    id: "paste",
    label: "Paste / CSV",
    code: "CSV",
    noun: "entries",
    canFetch: false,
    urlLabel: "Draw label",
    urlPlaceholder: "Spring merch drop, Discord raffle…",
    pasteLabel: "Entries",
    pastePlaceholder: "One name per line\n— or —\nauthor,text\nsam,hello",
    pasteHint:
      "Any platform: one entry per line, or a CSV with author and text columns.",
    ownerLabel: "Handle to exclude",
    demoKeyword: "",
    pitch: "Any other platform. One name per line, or a CSV with author and text columns.",
  },
};
