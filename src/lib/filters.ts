import type { Comment, FilterOptions } from "./types";

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

  if (filters.excludeOwner && ownerChannelId) {
    pool = pool.filter((c) => c.authorChannelId !== ownerChannelId);
  }

  if (filters.uniqueAuthors) {
    const seen = new Set<string>();
    pool = pool.filter((c) => {
      const key = c.authorChannelId || c.author.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  return pool;
}
