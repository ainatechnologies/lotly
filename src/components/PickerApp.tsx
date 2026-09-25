"use client";

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from "react";
import { applyFilters } from "@/lib/filters";
import { buildFairnessProof, createSeed, pickWinners, sha256Hex } from "@/lib/fair-random";
import { importEntries, sourceIdFromUrl } from "@/lib/import";
import { buildDemoText, DEMO_OWNER, DEMO_SOURCE_URL } from "@/lib/demo";
import { PLATFORM_ORDER, PLATFORMS } from "@/lib/platforms";
import {
  FREE_COMMENT_CAP,
  FREE_WINNER_CAP,
  PRO_ENTRY_CAP,
  PRO_PRICE_USD,
  type Comment,
  type DrawResult,
  type FilterOptions,
  type Plan,
  type Platform,
  type SourceMeta,
} from "@/lib/types";
import { StudioView } from "./StudioView";

const baseFilters: FilterOptions = {
  keyword: "",
  uniqueAuthors: true,
  excludeOwner: true,
  ownerHandle: "",
  minLikes: 0,
  minLength: 0,
};

const MAX_FILE_BYTES = 5 * 1024 * 1024;

type SourceMode = "live" | "demo" | "import";

type Props = {
  initialPlan: Plan;
  initialPlatform?: Platform;
  autoDemo?: boolean;
};

export function PickerApp({
  initialPlan,
  initialPlatform = "youtube",
  autoDemo = false,
}: Props) {
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [platform, setPlatform] = useState<Platform>(initialPlatform);
  const [ytPaste, setYtPaste] = useState(false);
  const [url, setUrl] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<SourceMeta | null>(null);
  const [entries, setEntries] = useState<Comment[]>([]);
  const [mode, setMode] = useState<SourceMode | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [importNote, setImportNote] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>(baseFilters);
  const deferredFilters = useDeferredValue(filters);
  const [winnerCount, setWinnerCount] = useState(1);
  const [drawing, setDrawing] = useState(false);
  const [result, setResult] = useState<DrawResult | null>(null);
  const [proof, setProof] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const config = PLATFORMS[platform];
  const isPro = plan === "pro";
  const entryCap = isPro ? PRO_ENTRY_CAP : FREE_COMMENT_CAP;
  const maxWinners = isPro ? 50 : FREE_WINNER_CAP;
  const usePaste = platform !== "youtube" || ytPaste;
  const hasLikes = entries.some((e) => e.likeCount > 0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "1") setPlan("pro");
  }, []);

  useEffect(() => {
    if (!autoDemo) return;
    loadDemo();
    // one-shot on mount for /app?demo=1
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDemo]);

  const pool = useMemo(
    () => applyFilters(entries, deferredFilters, source?.ownerId),
    [entries, deferredFilters, source?.ownerId],
  );

  function clearResult() {
    setResult(null);
    setProof("");
  }

  function switchPlatform(next: Platform) {
    if (next === platform || drawing) return;
    setPlatform(next);
    setYtPaste(false);
    setUrl("");
    setPasteText("");
    setFileName(null);
    setEntries([]);
    setSource(null);
    setMode(null);
    setTruncated(false);
    setImportNote(null);
    setError(null);
    setFilters((f) => ({ ...baseFilters, uniqueAuthors: f.uniqueAuthors }));
    clearResult();
    const params = new URLSearchParams(window.location.search);
    params.set("platform", next);
    params.delete("upgraded");
    window.history.replaceState(null, "", `?${params.toString()}`);
  }

  async function loadYouTube(target: string) {
    if (!target.trim()) {
      setError("Paste a YouTube video link, or load the demo.");
      return;
    }
    setLoading(true);
    setError(null);
    clearResult();
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load comments");
      startTransition(() => {
        setSource(data.source);
        setEntries(data.comments);
        setMode(data.mode);
        setTruncated(Boolean(data.truncated));
        setImportNote(
          data.mode === "demo"
            ? "Sample comments. Add a YOUTUBE_API_KEY to pull live videos."
            : "Pulled live from YouTube",
        );
        if (data.plan) setPlan(data.plan);
        if (data.mode === "demo") {
          setFilters((f) => ({ ...f, keyword: PLATFORMS.youtube.demoKeyword }));
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  async function importText(
    text: string,
    opts: { name?: string; label?: string; demo?: boolean } = {},
  ) {
    setError(null);
    clearResult();
    if (!text.trim()) {
      setError(`Paste ${config.noun} or upload a CSV first.`);
      return;
    }
    const parsed = importEntries(text, platform, opts.name ?? fileName ?? undefined);
    if (parsed.entries.length === 0) {
      setError("No entries found. Use one entry per line or a CSV with an author column.");
      return;
    }
    const capped = parsed.entries.slice(0, entryCap);
    const label = (opts.label ?? url).trim();
    const sourceId =
      sourceIdFromUrl(platform, label) ?? `paste-${(await sha256Hex(text)).slice(0, 12)}`;

    startTransition(() => {
      setEntries(capped);
      setSource({
        platform,
        sourceId,
        title: label || `${config.label} import`,
        url: /^https?:\/\//.test(label) ? label : undefined,
      });
      setMode(opts.demo ? "demo" : "import");
      setTruncated(parsed.entries.length > capped.length);
      setImportNote(
        [
          parsed.format === "csv" ? "Read as CSV" : "Read as one entry per line",
          parsed.skipped
            ? `${parsed.skipped} ${parsed.skipped === 1 ? "row" : "rows"} without a name skipped`
            : null,
        ]
          .filter(Boolean)
          .join(" · "),
      );
    });
  }

  function loadDemo() {
    if (platform === "youtube" && !ytPaste) {
      setUrl("demo");
      void loadYouTube("demo");
      return;
    }
    const demoPlatform = platform === "youtube" ? "paste" : platform;
    const text = buildDemoText(demoPlatform);
    const label = DEMO_SOURCE_URL[demoPlatform];
    setUrl(label);
    setPasteText(text);
    setFileName(null);
    setFilters((f) => ({
      ...f,
      keyword: PLATFORMS[demoPlatform].demoKeyword,
      ownerHandle: DEMO_OWNER[demoPlatform],
    }));
    void importText(text, { label, demo: true, name: "" });
  }

  async function readFile(file: File) {
    if (file.size > MAX_FILE_BYTES) {
      setError("That file is over 5 MB. Trim it or split the export.");
      return;
    }
    const text = await file.text();
    setFileName(file.name);
    setPasteText(text);
    await importText(text, { name: file.name });
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void readFile(file);
  }

  function onSubmitSource(e: FormEvent) {
    e.preventDefault();
    if (usePaste) void importText(pasteText);
    else void loadYouTube(url);
  }

  async function runDraw() {
    if (pool.length === 0) {
      setError("No entries match your rules.");
      return;
    }
    const allowed = Math.min(isPro ? winnerCount : FREE_WINNER_CAP, pool.length);
    const frozenPool = pool;
    const frozenFilters = deferredFilters;
    const sourceId = source?.sourceId ?? "unknown";

    setDrawing(true);
    setError(null);
    clearResult();

    const seed = createSeed();
    await new Promise((r) => setTimeout(r, 2400));
    const winners = await pickWinners(frozenPool, allowed, seed);
    const drawnAt = new Date().toISOString();
    const next: DrawResult = {
      winners,
      seed,
      drawnAt,
      poolSize: frozenPool.length,
      platform,
      sourceId,
      filters: frozenFilters,
    };
    const hash = await buildFairnessProof({
      seed,
      platform,
      sourceId,
      poolIds: frozenPool.map((c) => c.id),
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
        title: source?.title,
        winners: winners.map((w) => ({ id: w.id, author: w.author, text: w.text })),
      });
      localStorage.setItem("lotly_history", JSON.stringify(history.slice(0, 30)));
    } catch {
      /* storage unavailable */
    }
  }

  function exportCsv() {
    if (!result || !isPro) return;
    const cell = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = [
      ["rank", "platform", "source", "author", "text", "likes", "entry_id", "seed", "proof"],
      ...result.winners.map((w, i) => [
        String(i + 1),
        result.platform,
        cell(result.sourceId),
        cell(w.author),
        cell(w.text),
        String(w.likeCount),
        w.id,
        result.seed,
        proof,
      ]),
    ];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `lotly-${result.platform}-${result.sourceId}-winners.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <StudioView
      plan={plan}
      platform={platform}
      ytPaste={ytPaste}
      setYtPaste={setYtPaste}
      url={url}
      setUrl={setUrl}
      pasteText={pasteText}
      setPasteText={setPasteText}
      fileName={fileName}
      setFileName={setFileName}
      dragging={dragging}
      setDragging={setDragging}
      loading={loading}
      error={error}
      source={source}
      entries={entries}
      mode={mode}
      truncated={truncated}
      importNote={importNote}
      filters={filters}
      setFilters={setFilters}
      winnerCount={winnerCount}
      setWinnerCount={setWinnerCount}
      drawing={drawing}
      result={result}
      proof={proof}
      fileRef={fileRef}
      config={config}
      isPro={isPro}
      entryCap={entryCap}
      maxWinners={maxWinners}
      usePaste={usePaste}
      hasLikes={hasLikes}
      pool={pool}
      switchPlatform={switchPlatform}
      loadDemo={loadDemo}
      onDrop={onDrop}
      onSubmitSource={onSubmitSource}
      runDraw={() => void runDraw()}
      exportCsv={exportCsv}
      readFile={(file) => void readFile(file)}
    />
  );
}
