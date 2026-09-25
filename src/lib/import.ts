import type { Comment, Platform } from "./types";

export type ImportResult = {
  entries: Comment[];
  format: "csv" | "lines";
  skipped: number;
};

const AUTHOR_KEYS = [
  "author",
  "username",
  "user name",
  "user",
  "handle",
  "unique id",
  "uniqueid",
  "login",
  "commenter",
  "account",
  "profile",
  "name",
  "nickname",
  "display name",
  "author name",
  "channel",
];
const TEXT_KEYS = [
  "text",
  "comment",
  "comment text",
  "comments",
  "message",
  "content",
  "body",
  "msg",
];
const LIKE_KEYS = ["likes", "like count", "likecount", "likes count", "digg count", "hearts"];
const DATE_KEYS = ["date", "time", "timestamp", "created at", "published at", "created"];

function normKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^\ufeff/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function findColumn(header: string[], keys: string[]): number {
  const normalized = header.map(normKey);
  for (const key of keys) {
    const idx = normalized.indexOf(key);
    if (idx !== -1) return idx;
  }
  return -1;
}

function detectDelimiter(firstLine: string): string {
  const counts: Record<string, number> = { ",": 0, "\t": 0, ";": 0 };
  let quoted = false;
  for (const ch of firstLine) {
    if (ch === '"') quoted = !quoted;
    else if (!quoted && ch in counts) counts[ch]++;
  }
  const [best, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return count > 0 ? best : ",";
}

export function parseCsv(text: string, delimiter = ","): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function cleanAuthor(value: string) {
  return value.trim().replace(/^@+/, "").trim();
}

function entryId(platform: Platform, index: number) {
  return `${platform}-${String(index + 1).padStart(5, "0")}`;
}

function toIsoDate(value: string | undefined, fallbackIndex: number) {
  if (value) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
  }
  return new Date(Date.now() - fallbackIndex * 60_000).toISOString();
}

const TIMESTAMP_PREFIX = /^\[?\s*(\d{4}-\d{2}-\d{2}[ T])?\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM)?\s*\]?\s*/i;
const HANDLE_COLON = /^@?([^\s:]{1,40}):\s*(.*)$/;
const AT_PREFIX = /^@([^\s]{1,40})\s+(.*)$/;

function parseLine(raw: string): { author: string; text: string } | null {
  let line = raw.trim();
  if (!line) return null;
  line = line.replace(TIMESTAMP_PREFIX, "");
  if (!line) return null;

  const colon = line.match(HANDLE_COLON);
  if (colon && !/^https?$/i.test(colon[1])) {
    return { author: cleanAuthor(colon[1]), text: colon[2].trim() };
  }
  const at = line.match(AT_PREFIX);
  if (at) return { author: cleanAuthor(at[1]), text: at[2].trim() };

  return { author: cleanAuthor(line), text: "" };
}

function looksLikeCsv(text: string, fileName?: string) {
  if (fileName && /\.(csv|tsv)$/i.test(fileName)) return true;
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = detectDelimiter(firstLine);
  const header = parseCsv(firstLine, delimiter)[0] ?? [];
  return header.length > 1 && findColumn(header, AUTHOR_KEYS) !== -1;
}

export function importEntries(
  text: string,
  platform: Platform,
  fileName?: string,
): ImportResult {
  const trimmed = text.replace(/^\ufeff/, "");

  if (looksLikeCsv(trimmed, fileName)) {
    const firstLine = trimmed.split(/\r?\n/, 1)[0] ?? "";
    const rows = parseCsv(trimmed, detectDelimiter(firstLine));
    const header = rows[0] ?? [];
    let authorCol = findColumn(header, AUTHOR_KEYS);
    let textCol = findColumn(header, TEXT_KEYS);
    const likeCol = findColumn(header, LIKE_KEYS);
    const dateCol = findColumn(header, DATE_KEYS);
    const hasHeader = authorCol !== -1;
    if (!hasHeader) {
      authorCol = 0;
      textCol = header.length > 1 ? 1 : -1;
    }

    const body = hasHeader ? rows.slice(1) : rows;
    const entries: Comment[] = [];
    let skipped = 0;
    body.forEach((row) => {
      const author = cleanAuthor(row[authorCol] ?? "");
      if (!author) {
        skipped++;
        return;
      }
      entries.push({
        id: entryId(platform, entries.length),
        author,
        text: textCol !== -1 ? (row[textCol] ?? "").trim() : "",
        likeCount: likeCol !== -1 ? Number.parseInt(row[likeCol] ?? "0", 10) || 0 : 0,
        publishedAt: toIsoDate(dateCol !== -1 ? row[dateCol] : undefined, entries.length),
      });
    });
    return { entries, format: "csv", skipped };
  }

  const entries: Comment[] = [];
  let skipped = 0;
  trimmed.split(/\r?\n/).forEach((raw) => {
    if (!raw.trim()) return;
    const parsed = parseLine(raw);
    if (!parsed || !parsed.author) {
      skipped++;
      return;
    }
    entries.push({
      id: entryId(platform, entries.length),
      author: parsed.author,
      text: parsed.text,
      likeCount: 0,
      publishedAt: toIsoDate(undefined, entries.length),
    });
  });
  return { entries, format: "lines", skipped };
}

export function sourceIdFromUrl(platform: Platform, input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    const parts = url.pathname.split("/").filter(Boolean);
    if (platform === "instagram") {
      const idx = parts.findIndex((p) => ["p", "reel", "reels", "tv"].includes(p));
      if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
    }
    if (platform === "tiktok") {
      const idx = parts.indexOf("video");
      if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
    }
    if (platform === "twitch" && parts[0]) return parts[0].toLowerCase();
    if (parts.length) return parts.join("-").slice(0, 64);
  } catch {
    /* fall through to slug */
  }
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64) || null;
}

export function displayHandle(author: string) {
  return /\s/.test(author) ? author : `@${author}`;
}
