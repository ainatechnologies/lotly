"use client";

import { useState } from "react";
import { displayHandle } from "@/lib/import";
import type { DrawResult } from "@/lib/types";

type Props = {
  result: DrawResult;
  proof: string;
  isPro: boolean;
  platformLabel: string;
  onExport: () => void;
  onRedraw: () => void;
};

export function WinnerPanel({ result, proof, isPro, platformLabel, onExport, onRedraw }: Props) {
  const [copied, setCopied] = useState(false);
  const primary = result.winners[0];
  if (!primary) return null;

  const rules = [
    result.filters.keyword.trim() ? `must include “${result.filters.keyword.trim()}”` : null,
    result.filters.uniqueAuthors ? "one per person" : null,
    result.filters.excludeOwner ? "host excluded" : null,
    result.filters.minLikes > 0 ? `${result.filters.minLikes}+ likes` : null,
    result.filters.minLength > 0 ? `${result.filters.minLength}+ chars` : null,
  ].filter(Boolean);

  async function copyProof() {
    const payload = {
      platform: result.platform,
      source: result.sourceId,
      winners: result.winners.map((w) => w.author),
      seed: result.seed,
      proof,
      drawnAt: result.drawnAt,
      poolSize: result.poolSize,
      rules,
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="result" aria-label="Draw result">
      <header className="result-head">
        <p className="kicker">Official result</p>
        <time dateTime={result.drawnAt}>
          {new Date(result.drawnAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </time>
      </header>

      <ol className="result-winners">
        {result.winners.map((w, i) => (
          <li key={w.id}>
            <span className="result-rank">{String(i + 1).padStart(2, "0")}</span>
            <span className="result-name">{displayHandle(w.author)}</span>
          </li>
        ))}
      </ol>

      <dl className="result-receipt">
        <div>
          <dt>Source</dt>
          <dd>
            {platformLabel} · {result.sourceId}
          </dd>
        </div>
        <div>
          <dt>Pool</dt>
          <dd>{result.poolSize} eligible</dd>
        </div>
        <div>
          <dt>Rules</dt>
          <dd>{rules.length ? rules.join(" · ") : "none"}</dd>
        </div>
        <div>
          <dt>Seed</dt>
          <dd className="mono">{result.seed}</dd>
        </div>
        <div>
          <dt>SHA-256</dt>
          <dd className="mono">{proof}</dd>
        </div>
      </dl>

      <div className="result-actions">
        <button type="button" className="btn primary" onClick={() => void copyProof()}>
          {copied ? "Receipt copied" : "Copy receipt"}
        </button>
        <button type="button" className="btn line" onClick={onExport} disabled={!isPro}>
          {isPro ? "Export CSV" : "CSV export · Pro"}
        </button>
        <button type="button" className="btn text" onClick={onRedraw}>
          Redraw
        </button>
      </div>

      {!isPro && (
        <p className="watermark">
          <span aria-hidden />
          Picked with Lotly
        </p>
      )}
    </section>
  );
}
