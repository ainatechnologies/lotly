"use client";

import { useEffect, useState } from "react";
import type { Comment } from "@/lib/types";

type Props = {
  pool: Comment[];
  running: boolean;
  winner: Comment | null;
};

export function DrawStage({ pool, running, winner }: Props) {
  const [flash, setFlash] = useState<Comment | null>(null);

  useEffect(() => {
    if (!running || pool.length === 0) {
      setFlash(null);
      return;
    }
    let alive = true;
    const tick = () => {
      if (!alive) return;
      const next = pool[Math.floor(Math.random() * pool.length)];
      setFlash(next);
    };
    tick();
    const id = window.setInterval(tick, 70);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [running, pool]);

  const shown = running ? flash : winner;

  return (
    <div className={`draw-stage ${running ? "is-running" : ""} ${winner && !running ? "is-won" : ""}`}>
      <div className="draw-orb" aria-hidden />
      <p className="draw-kicker">
        {running ? "Drawing…" : winner ? "Winner locked" : "Ready when you are"}
      </p>
      <div className="draw-name" key={shown?.id || "empty"}>
        {shown ? `@${shown.author}` : "—"}
      </div>
      <p className="draw-quote">
        {shown
          ? `“${shown.text.slice(0, 140)}${shown.text.length > 140 ? "…" : ""}”`
          : "Paste a video, set your rules, then pick."}
      </p>
    </div>
  );
}
