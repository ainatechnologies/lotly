import {
  buildDemoComments,
  DEMO_VIDEO,
  extractVideoId,
} from "./youtube";
import type { Comment, VideoMeta } from "./types";

type FetchResult = {
  video: VideoMeta;
  comments: Comment[];
  mode: "live" | "demo";
  truncated: boolean;
  totalFetched: number;
};

async function ytGet<T>(
  path: string,
  params: Record<string, string>,
): Promise<T> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("Missing YOUTUBE_API_KEY");

  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set("key", key);

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API error ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchVideoAndComments(
  input: string,
  maxComments = 2500,
): Promise<FetchResult> {
  const videoId = extractVideoId(input);
  if (!videoId) {
    throw new Error("Paste a valid YouTube URL or video ID.");
  }

  if (videoId === DEMO_VIDEO.videoId || !process.env.YOUTUBE_API_KEY) {
    const comments = buildDemoComments(240);
    return {
      video: DEMO_VIDEO,
      comments,
      mode: "demo",
      truncated: false,
      totalFetched: comments.length,
    };
  }

  type VideosResponse = {
    items?: Array<{
      id: string;
      snippet: {
        title: string;
        channelTitle: string;
        channelId: string;
        thumbnails?: { medium?: { url: string }; high?: { url: string } };
      };
      statistics?: { commentCount?: string };
    }>;
  };

  const videos = await ytGet<VideosResponse>("videos", {
    part: "snippet,statistics",
    id: videoId,
  });

  const item = videos.items?.[0];
  if (!item) throw new Error("Video not found. Check the URL and try again.");

  const video: VideoMeta = {
    videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    thumbnailUrl:
      item.snippet.thumbnails?.high?.url ||
      item.snippet.thumbnails?.medium?.url,
    commentCount: Number(item.statistics?.commentCount || 0),
  };

  type ThreadsResponse = {
    nextPageToken?: string;
    items?: Array<{
      id: string;
      snippet: {
        topLevelComment: {
          id: string;
          snippet: {
            authorDisplayName: string;
            authorChannelId?: { value?: string };
            textDisplay: string;
            textOriginal?: string;
            likeCount: number;
            publishedAt: string;
            authorProfileImageUrl?: string;
          };
        };
      };
    }>;
  };

  const comments: Comment[] = [];
  let pageToken: string | undefined;
  let truncated = false;

  do {
    const page: ThreadsResponse = await ytGet<ThreadsResponse>(
      "commentThreads",
      {
        part: "snippet",
        videoId,
        maxResults: "100",
        order: "time",
        textFormat: "plainText",
        ...(pageToken ? { pageToken } : {}),
      },
    );

    for (const thread of page.items || []) {
      const sn = thread.snippet.topLevelComment.snippet;
      comments.push({
        id: thread.snippet.topLevelComment.id,
        author: sn.authorDisplayName,
        authorChannelId: sn.authorChannelId?.value,
        text: sn.textOriginal || sn.textDisplay,
        likeCount: sn.likeCount || 0,
        publishedAt: sn.publishedAt,
        profileImageUrl: sn.authorProfileImageUrl,
      });
    }

    pageToken = page.nextPageToken;
    if (comments.length >= maxComments) {
      truncated = Boolean(pageToken);
      break;
    }
  } while (pageToken);

  return {
    video,
    comments,
    mode: "live",
    truncated,
    totalFetched: comments.length,
  };
}
