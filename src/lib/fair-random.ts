/**
 * Deterministic, shareable fair draw.
 * Same seed + same ordered ids => same winners.
 */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function createSeed(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function seedToUint32(seed: string, salt: string): Promise<number> {
  const hex = await sha256Hex(`${seed}:${salt}`);
  return parseInt(hex.slice(0, 8), 16) >>> 0;
}

export async function fairShuffle<T extends { id: string }>(
  items: T[],
  seed: string,
): Promise<T[]> {
  const sorted = [...items].sort((a, b) => a.id.localeCompare(b.id));
  const out = [...sorted];
  const rand = mulberry32(await seedToUint32(seed, "shuffle"));

  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export async function pickWinners<T extends { id: string }>(
  items: T[],
  count: number,
  seed: string,
): Promise<T[]> {
  if (items.length === 0 || count <= 0) return [];
  const shuffled = await fairShuffle(items, seed);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export async function buildFairnessProof(input: {
  seed: string;
  videoId: string;
  poolIds: string[];
  winnerIds: string[];
  drawnAt: string;
}): Promise<string> {
  const payload = [
    input.seed,
    input.videoId,
    input.drawnAt,
    [...input.poolIds].sort().join(","),
    input.winnerIds.join(","),
  ].join("|");
  return sha256Hex(payload);
}
