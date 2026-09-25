"use client";

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DrawStage } from "./DrawStage";
import { WinnerPanel } from "./WinnerPanel";
import { applyFilters } from "@/lib/filters";
import { buildFairnessProof, createSeed, pickWinners } from "@/lib/fair-random";
import {
  FREE_COMMENT_CAP,
  FREE_WINNER_CAP,
  type Comment,
  type DrawResult,
  type FilterOptions,
  type Plan,
  type VideoMeta,
} from "@/lib/types";

const defaultFilters: FilterOptions = {
  keyword: "#giveaway",
  uniqueAuthors: true,
  excludeOwner: true,
  minLikes: 0,
  minLength: 0,
};

type Props = { initialPlan: Plan };

export function PickerApp({ initialPlan }: Props) {
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [url, setUrl] = useState("demo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [video, setVideo] = useState<VideoMeta | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [mode, setMode] = useState<"live" | "demo" | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const deferredFilters = useDeferredValue(filters);
  const [winnerCount, setWinnerCount] = useState(1);
  const [drawing, setDrawing] = useState(false);
  const [result, setResult] = useState<DrawResult | null>(null);
  const [proof, setProof] = useState("");

  const isPro = plan === "pro";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "1") setPlan("pro");
  }, []);

  const pool = useMemo(
    () => applyFilters(comments, deferredFilters, video?.channelId),
    [comments, deferredFilters, video?.channelId],
  );

  async function loadComments(target = url) {
    setLoading(true);
    setError(null);
    setResult(null);
    setProof("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load comments");
      startTransition(() => {
        setVideo(data.video);
        setComments(data.comments);
        setMode(data.mode);
        setTruncated(Boolean(data.truncated));
        if (data.plan) setPlan(data.plan);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  async function runDraw() {
    if (pool.length === 0) {
      setError("No comments match your filters.");
      return;
    }
    const allowed = isPro
      ? Math.min(winnerCount, pool.length)
      : Math.min(FREE_WINNER_CAP, pool.length);

    setDrawing(true);
    setError(null);
    setResult(null);

    const seed = createSeed();
    await new Promise((r) => setTimeout(r, 2200));
    const winners = await pickWinners(pool, allowed, seed);
    const drawnAt = new Date().toISOString();
    const next: DrawResult = {
      winners,
      seed,
      drawnAt,
      poolSize: pool.length,
      videoId: video?.videoId || "unknown",
      filters: deferredFilters,
    };
    const hash = await buildFairnessProof({
      seed,
      videoId: next.videoId,
      poolIds: pool.map((c) => c.id),
      winnerIds: winners.map((w) => w.id),
      drawnAt,
    });
    setResult(next);
    setProof(hash);
    setDrawing(false);

    try {
      const history = JSON.parse(localStorage.getItem("lotly_history") || "[]");
      history.unshift({
        ...next,
        proof: hash,
        title: video?.title,
        winners: winners.map((w) => ({ id: w.id, author: w.author, text: w.text })),
      });
      localStorage.setItem("lotly_history", JSON.stringify(history.slice(0, 30)));
    } catch {
      /* ignore */
    }
  }

  function exportCsv() {
    if (!result || !isPro) return;
    const rows = [
      ["rank", "author", "comment", "likes", "comment_id"],
      ...result.winners.map((w, i) => [
        String(i + 1),
        w.author,
        `"${w.text.replace(/"/g, '""')}"`,
        String(w.likeCount),
        w.id,
      ]),
    ];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `lotly-${result.videoId}-winners.csv`;
    a.click();
  }

  return (
    <div className="picker-shell">
      <div className="picker-toolbar">
        <div>
          <p className="eyebrow">Giveaway studio</p>
          <h1>Pick a winner. Prove it was fair.</h1>
        </div>
        <div className="plan-chip">
          {isPro ? (
            <span className="pro">Pro unlocked</span>
          ) : (
            <>
              <span>Free · {FREE_COMMENT_CAP} comments</span>
              <Link href="/pricing">Upgrade</Link>
            </>
          )}
        </div>
      </div>

      <section className="load-panel">
        <label htmlFor="yt-url">YouTube video URL</label>
        <div className="url-row">
          <input
            id="yt-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=… or type demo"
          />
          <button
            type="button"
            className="btn primary"
            onClick={() => void loadComments()}
            disabled={loading}
          >
            {loading ? "Loading…" : "Load comments"}
          </button>
        </div>
        <p className="hint">
          Tip: type <button type="button" className="text-link" onClick={() => { setUrl("demo"); void loadComments("demo"); }}>demo</button> to try a full giveaway without an API key.
        </p>
        {error && <p className="error">{error}</p>}
        {video && (
          <div className="video-meta">
            {video.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={video.thumbnailUrl} alt="" />
            )}
            <div>
              <strong>{video.title}</strong>
              <span>
                {video.channelTitle} · {comments.length} loaded
                {mode === "demo" ? " · demo mode" : ""}
                {truncated ? " · capped" : ""}
              </span>
            </div>
          </div>
        )}
      </section>

      <div className="picker-grid">
        <section className="rules-panel">
          <h2>Entry rules</h2>
          <label>
            Required keyword
            <input
              value={filters.keyword}
              onChange={(e) =>
                setFilters((f) => ({ ...f, keyword: e.target.value }))
              }
              placeholder="#giveaway"
            />
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={filters.uniqueAuthors}
              onChange={(e) =>
                setFilters((f) => ({ ...f, uniqueAuthors: e.target.checked }))
              }
            />
            One entry per author
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={filters.excludeOwner}
              onChange={(e) =>
                setFilters((f) => ({ ...f, excludeOwner: e.target.checked }))
              }
            />
            Exclude channel owner
          </label>
          <label>
            Minimum likes
            <input
              type="number"
              min={0}
              value={filters.minLikes}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  minLikes: Number(e.target.value) || 0,
                }))
              }
            />
          </label>
          <label>
            Minimum comment length
            <input
              type="number"
              min={0}
              value={filters.minLength}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  minLength: Number(e.target.value) || 0,
                }))
              }
            />
          </label>
          <label>
            Number of winners {!isPro && "(Pro unlocks multi)"}
            <input
              type="number"
              min={1}
              max={isPro ? 50 : FREE_WINNER_CAP}
              value={winnerCount}
              onChange={(e) =>
                setWinnerCount(
                  Math.max(1, Math.min(isPro ? 50 : FREE_WINNER_CAP, Number(e.target.value) || 1)),
                )
              }
              disabled={!isPro && FREE_WINNER_CAP === 1}
            />
          </label>
          <div className="pool-stat">
            <strong>{pool.length}</strong>
            <span>eligible after filters</span>
          </div>
          <button
            type="button"
            className="btn primary wide"
            onClick={() => void runDraw()}
            disabled={drawing || pool.length === 0}
          >
            {drawing ? "Spinning the drum…" : "Pick fair winner"}
          </button>
        </section>

        <div className="stage-col">
          <DrawStage
            pool={pool}
            running={drawing}
            winner={result?.winners[0] ?? null}
          />
          {result && (
            <WinnerPanel
              result={result}
              proof={proof}
              isPro={isPro}
              onExport={exportCsv}
            />
          )}
        </div>
      </div>

      {!isPro && truncated && (
        <aside className="upsell-banner">
          <div>
            <strong>Free plan capped at {FREE_COMMENT_CAP} comments.</strong>
            <p>Unlock Pro for unlimited pulls, multi-winners, and CSV exports.</p>
          </div>
          <Link href="/pricing" className="btn primary">
            Go Pro — $29
          </Link>
        </aside>
      )}
    </div>
  );
}
