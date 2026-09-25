import type { Comment, FilterOptions } from "./types";

export function normalizeHandle(value: string): string {
  return value.trim().replace(/^@+/, "").toLowerCase();
}

export function applyFilters(
  comments: Comment[],
  filters: FilterOptions,
  ownerChannelId?: string,
): Comment[] {
  let pool = [...comments];

  const keyword = filters.keyword.trim().toLowerCase();
  if (keyword) {
    pool = pool.filter((c) => c.text.toLowerCase().includes(keyword));
  }

  if (filters.minLikes > 0) {
    pool = pool.filter((c) => c.likeCount >= filters.minLikes);
  }

  if (filters.minLength > 0) {
    pool = pool.filter((c) => c.text.trim().length >= filters.minLength);
  }

  if (filters.excludeOwner) {
    const ownerHandle = normalizeHandle(filters.ownerHandle);
    if (ownerChannelId) {
      pool = pool.filter((c) => c.authorChannelId !== ownerChannelId);
    }
    if (ownerHandle) {
      pool = pool.filter((c) => normalizeHandle(c.author) !== ownerHandle);
    }
  }

  if (filters.uniqueAuthors) {
    const seen = new Set<string>();
    pool = pool.filter((c) => {
      const key = c.authorChannelId || normalizeHandle(c.author);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  return pool;
}
