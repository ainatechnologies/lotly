export type Comment = {
  id: string;
  author: string;
  authorChannelId?: string;
  text: string;
  likeCount: number;
  publishedAt: string;
  profileImageUrl?: string;
};

export type VideoMeta = {
  videoId: string;
  title: string;
  channelTitle: string;
  channelId?: string;
  thumbnailUrl?: string;
  commentCount?: number;
};

export type FilterOptions = {
  keyword: string;
  uniqueAuthors: boolean;
  excludeOwner: boolean;
  minLikes: number;
  minLength: number;
};

export type DrawResult = {
  winners: Comment[];
  seed: string;
  drawnAt: string;
  poolSize: number;
  videoId: string;
  filters: FilterOptions;
};

export type Plan = "free" | "pro";

export const FREE_COMMENT_CAP = 200;
export const FREE_WINNER_CAP = 1;
export const PRO_PRICE_USD = 29;
export const PRO_PRICE_ID =
  process.env.STRIPE_PRICE_ID ?? "price_1UJcVz25t2inaGCoFzLwT8kj";
