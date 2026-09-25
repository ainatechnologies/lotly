"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { displayHandle } from "@/lib/import";
import type { Comment } from "@/lib/types";

type Props = {
  pool: Comment[];
  running: boolean;
  winner: Comment | null;
  platformLabel: string;
  sourceLabel?: string;
  children?: ReactNode;
};

export function DrawStage({ pool, running, winner, platformLabel, sourceLabel, children }: Props) {
  const [flash, setFlash] = useState<{ entry: Comment; tick: number } | null>(null);

  useEffect(() => {
    if (!running || pool.length === 0) return;
    let tick = 0;
    let delay = 45;
    const step = () => {
      tick++;
      setFlash({ entry: pool[Math.floor(Math.random() * pool.length)], tick });
      delay = Math.min(delay * 1.07, 260);
      timer = window.setTimeout(step, delay);
    };
    let timer = window.setTimeout(step, 0);
    return () => window.clearTimeout(timer);
  }, [running, pool]);

  const shown = running ? flash?.entry ?? null : winner;
  const won = Boolean(winner && !running);
  const name = shown ? displayHandle(shown.author) : "";
  const status = running ? "Drawing" : won ? "Winner locked" : "Ready";

  return (
    <section
      className={`stage${running ? " is-running" : ""}${won ? " is-won" : ""}`}
      aria-live="polite"
      aria-busy={running}
    >
      <div className="stage-top">
        <span className="stage-status">
          <i aria-hidden />
          {status}
        </span>
        <span className="stage-source">
          {platformLabel}
          {sourceLabel ? ` · ${sourceLabel}` : ""}
        </span>
      </div>

      <div className="stage-center">
        {shown ? (
          <>
            <p
              className="stage-name"
              key={running ? flash?.tick : `won-${shown.id}`}
              style={{ "--len": Math.max(name.length, 6) } as CSSProperties}
            >
              {name}
            </p>
            {won && <span className="stage-rule" aria-hidden />}
            {shown.text && (
              <p className="stage-quote">
                “{shown.text.slice(0, 140)}
                {shown.text.length > 140 ? "…" : "”"}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="stage-name is-idle" style={{ "--len": 8 } as CSSProperties}>
              {pool.length > 0 ? `${pool.length} in the drum` : "Empty drum"}
            </p>
            <p className="stage-quote">
              {pool.length > 0
                ? "Rules are live. Every change updates the eligible pool."
                : "Load a source on the left to fill the drum."}
            </p>
          </>
        )}
      </div>

      {children}
    </section>
  );
}
