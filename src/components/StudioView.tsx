"use client";

import Link from "next/link";
import type { DragEvent, FormEvent, RefObject } from "react";
import { DrawStage } from "./DrawStage";
import { WinnerPanel } from "./WinnerPanel";
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

export type StudioViewModel = {
  plan: Plan;
  platform: Platform;
  ytPaste: boolean;
  setYtPaste: (v: boolean) => void;
  url: string;
  setUrl: (v: string) => void;
  pasteText: string;
  setPasteText: (v: string) => void;
  fileName: string | null;
  setFileName: (v: string | null) => void;
  dragging: boolean;
  setDragging: (v: boolean) => void;
  loading: boolean;
  error: string | null;
  source: SourceMeta | null;
  entries: Comment[];
  mode: "live" | "demo" | "import" | null;
  truncated: boolean;
  importNote: string | null;
  filters: FilterOptions;
  setFilters: (updater: (f: FilterOptions) => FilterOptions) => void;
  winnerCount: number;
  setWinnerCount: (n: number) => void;
  drawing: boolean;
  result: DrawResult | null;
  proof: string;
  fileRef: RefObject<HTMLInputElement | null>;
  config: (typeof PLATFORMS)[Platform];
  isPro: boolean;
  entryCap: number;
  maxWinners: number;
  usePaste: boolean;
  hasLikes: boolean;
  pool: Comment[];
  switchPlatform: (p: Platform) => void;
  loadDemo: () => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onSubmitSource: (e: FormEvent) => void;
  runDraw: () => void;
  exportCsv: () => void;
  readFile: (file: File) => void;
};

export function StudioView(s: StudioViewModel) {
  const {
    plan, platform, ytPaste, setYtPaste, url, setUrl, pasteText, setPasteText,
    fileName, setFileName, dragging, setDragging, loading, error, source, entries, mode, truncated, importNote,
    filters, setFilters, winnerCount, setWinnerCount, drawing, result, proof, fileRef,
    config, isPro, entryCap, maxWinners, usePaste, hasLikes, pool,
    switchPlatform, loadDemo, onDrop, onSubmitSource, runDraw, exportCsv, readFile,
  } = s;

  return (
    <div className="studio">
      <header className="studio-head">
        <div>
          <p className="kicker">Draw room</p>
          <h1 className="studio-title">Pick a winner. Keep the receipt.</h1>
        </div>
        <p className="plan-line">
          {isPro ? (
            <span className="plan-pro">Pro · {PRO_ENTRY_CAP.toLocaleString()} entries · 50 winners</span>
          ) : (
            <>
              <span>
                Free · {FREE_COMMENT_CAP} entries · {FREE_WINNER_CAP} winner
              </span>
              <Link href="/pricing">Go Pro ${PRO_PRICE_USD}</Link>
            </>
          )}
        </p>
      </header>

      <div className="platform-tabs" role="tablist" aria-label="Where are the entries from?">
        {PLATFORM_ORDER.map((id, i) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={platform === id}
            className="platform-tab"
            onClick={() => switchPlatform(id)}
            disabled={drawing}
          >
            <span className="tab-code">
              0{i + 1} · {PLATFORMS[id].code}
            </span>
            <span className="tab-label">{PLATFORMS[id].label}</span>
          </button>
        ))}
      </div>

      <div className="studio-grid">
        <div className="studio-controls">
          <section className="panel" aria-labelledby="source-title">
            <div className="panel-head">
              <span className="step">01</span>
              <h2 id="source-title" className="panel-title">
                Source
              </h2>
              <button type="button" className="btn ghost compact" onClick={loadDemo} disabled={loading}>
                {loading ? "Loading…" : "Load demo"}
              </button>
            </div>

            <form onSubmit={onSubmitSource}>
              {!usePaste ? (
                <>
                  <label className="field" htmlFor="source-url">
                    <span>{config.urlLabel}</span>
                  </label>
                  <div className="field-row">
                    <input
                      id="source-url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder={config.urlPlaceholder}
                      inputMode="url"
                      autoComplete="off"
                    />
                    <button type="submit" className="btn primary" disabled={loading}>
                      {loading ? "Loading" : "Load"}
                    </button>
                  </div>
                  <p className="hint">
                    Type <code>demo</code> and hit Load, or paste a YouTube link when your API key is set.{" "}
                    <button type="button" className="text-link" onClick={() => setYtPaste(true)}>
                      Paste an export instead
                    </button>
                  </p>
                </>
              ) : (
                <>
                  <label className="field">
                    <span>
                      {config.urlLabel} <em>optional · printed on the receipt</em>
                    </span>
                    <input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder={config.urlPlaceholder}
                      autoComplete="off"
                    />
                  </label>
                  <label className="field">
                    <span>
                      {config.pasteLabel}
                      {fileName ? <em> · {fileName}</em> : null}
                    </span>
                    <div
                      className={`dropzone${dragging ? " is-drag" : ""}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={onDrop}
                    >
                      <textarea
                        value={pasteText}
                        onChange={(e) => {
                          setPasteText(e.target.value);
                          setFileName(null);
                        }}
                        placeholder={config.pastePlaceholder}
                        spellCheck={false}
                        rows={8}
                      />
                      {dragging && <span className="dropzone-label">Drop CSV to import</span>}
                    </div>
                  </label>
                  <p className="hint">{config.pasteHint}</p>
                  <div className="field-actions">
                    <button type="submit" className="btn primary">
                      Import
                    </button>
                    <button
                      type="button"
                      className="btn line"
                      onClick={() => fileRef.current?.click()}
                    >
                      Upload CSV
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".csv,.tsv,.txt,text/csv,text/plain"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void readFile(file);
                        e.target.value = "";
                      }}
                    />
                    {platform === "youtube" && (
                      <button type="button" className="text-link" onClick={() => setYtPaste(false)}>
                        Use a video link
                      </button>
                    )}
                  </div>
                </>
              )}
            </form>

            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}

            {source && (
              <div className="source-line">
                {source.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={source.thumbnailUrl} alt="" />
                )}
                <div>
                  <strong>{source.title}</strong>
                  <span>
                    {entries.length} {config.noun}
                    {source.owner ? ` · ${source.owner}` : ""}
                    {mode === "demo" ? " · demo" : ""}
                    {truncated ? ` · capped at ${entryCap}` : ""}
                  </span>
                  {importNote && <span className="source-note">{importNote}</span>}
                </div>
              </div>
            )}
          </section>

          <section className="panel" aria-labelledby="rules-title">
            <div className="panel-head">
              <span className="step">02</span>
              <h2 id="rules-title" className="panel-title">
                Rules
              </h2>
            </div>

            <label className="field">
              <span>Must include</span>
              <input
                value={filters.keyword}
                onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
                placeholder={platform === "twitch" ? "!enter" : "#giveaway"}
              />
            </label>

            <div className="checks">
              <label className="check">
                <input
                  type="checkbox"
                  checked={filters.uniqueAuthors}
                  onChange={(e) => setFilters((f) => ({ ...f, uniqueAuthors: e.target.checked }))}
                />
                One entry per person
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={filters.excludeOwner}
                  onChange={(e) => setFilters((f) => ({ ...f, excludeOwner: e.target.checked }))}
                />
                {platform === "youtube" ? "Exclude the channel owner" : "Exclude the host"}
              </label>
            </div>

            {filters.excludeOwner && (platform !== "youtube" || usePaste) && (
              <label className="field">
                <span>{config.ownerLabel}</span>
                <input
                  value={filters.ownerHandle}
                  onChange={(e) => setFilters((f) => ({ ...f, ownerHandle: e.target.value }))}
                  placeholder="@yourhandle"
                  autoComplete="off"
                />
              </label>
            )}

            <div className="field-pair">
              <label className="field">
                <span>Min likes{entries.length > 0 && !hasLikes ? <em> · n/a</em> : null}</span>
                <input
                  type="number"
                  min={0}
                  value={filters.minLikes}
                  disabled={entries.length > 0 && !hasLikes}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, minLikes: Math.max(0, Number(e.target.value) || 0) }))
                  }
                />
              </label>
              <label className="field">
                <span>Min length</span>
                <input
                  type="number"
                  min={0}
                  value={filters.minLength}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, minLength: Math.max(0, Number(e.target.value) || 0) }))
                  }
                />
              </label>
            </div>

            <label className="field">
              <span>
                Winners{!isPro ? <em> · Pro draws up to 50</em> : null}
              </span>
              <input
                type="number"
                min={1}
                max={maxWinners}
                value={isPro ? winnerCount : FREE_WINNER_CAP}
                disabled={!isPro}
                onChange={(e) =>
                  setWinnerCount(Math.max(1, Math.min(maxWinners, Number(e.target.value) || 1)))
                }
              />
            </label>
          </section>
        </div>

        <div className="studio-stage">
          <DrawStage
            pool={pool}
            running={drawing}
            winner={result?.winners[0] ?? null}
            platformLabel={config.label}
            sourceLabel={source?.sourceId}
          >
            <div className="stage-bar">
              <p className="pool-count">
                <strong>{pool.length}</strong>
                <span>
                  eligible
                  {entries.length > 0 ? ` of ${entries.length}` : ""}
                </span>
              </p>
              <button
                type="button"
                className="btn primary draw"
                onClick={() => void runDraw()}
                disabled={drawing || pool.length === 0}
              >
                {drawing ? "Drawing" : result ? "Draw again" : isPro && winnerCount > 1 ? `Draw ${Math.min(winnerCount, pool.length || winnerCount)} winners` : "Draw winner"}
              </button>
            </div>
          </DrawStage>

          {result && !drawing && (
            <WinnerPanel
              result={result}
              proof={proof}
              isPro={isPro}
              platformLabel={PLATFORMS[result.platform].label}
              onExport={exportCsv}
              onRedraw={() => void runDraw()}
            />
          )}

          {!isPro && truncated && (
            <aside className="upsell">
              <p>
                <strong>This list was capped at {FREE_COMMENT_CAP} entries.</strong> Pro draws from
                up to {PRO_ENTRY_CAP.toLocaleString()}, picks multiple winners and exports CSV.
              </p>
              <Link href="/pricing" className="btn primary">
                Go Pro — ${PRO_PRICE_USD}
              </Link>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
