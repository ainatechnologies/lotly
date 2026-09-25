"use client";

import type { Comment, DrawResult } from "@/lib/types";

type Props = {
  result: DrawResult;
  proof: string;
  isPro: boolean;
  onExport: () => void;
};

export function WinnerPanel({ result, proof, isPro, onExport }: Props) {
  const primary = result.winners[0];
  if (!primary) return null;

  return (
    <section className="winner-panel">
      <div className="winner-card">
        {!isPro && <div className="watermark">Picked with Lotly</div>}
        <p className="eyebrow">Official winner</p>
        <h3>@{primary.author}</h3>
        <p className="winner-text">{primary.text}</p>
        {result.winners.length > 1 && (
          <ul className="runner-list">
            {result.winners.slice(1).map((w: Comment, i) => (
              <li key={w.id}>
                <span>#{i + 2}</span> @{w.author}
              </li>
            ))}
          </ul>
        )}
        <dl className="proof-grid">
          <div>
            <dt>Pool size</dt>
            <dd>{result.poolSize}</dd>
          </div>
          <div>
            <dt>Seed</dt>
            <dd className="mono">{result.seed.slice(0, 12)}…</dd>
          </div>
          <div>
            <dt>Proof</dt>
            <dd className="mono">{proof.slice(0, 12)}…</dd>
          </div>
        </dl>
        <div className="winner-actions">
          <button type="button" className="btn ghost" onClick={onExport} disabled={!isPro}>
            {isPro ? "Export CSV" : "Export CSV (Pro)"}
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              const payload = {
                winners: result.winners.map((w) => w.author),
                seed: result.seed,
                proof,
                drawnAt: result.drawnAt,
                poolSize: result.poolSize,
              };
              void navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
            }}
          >
            Copy fairness proof
          </button>
        </div>
      </div>
    </section>
  );
}
