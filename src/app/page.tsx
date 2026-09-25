import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PricingTable } from "@/components/PricingTable";
import { getPlanFromCookies } from "@/lib/license";
import { PLATFORM_ORDER, PLATFORMS } from "@/lib/platforms";
import { PRO_PRICE_USD } from "@/lib/types";

const heroStage = "https://images.unsplash.com/photo-1459749411175-04bf52967778?auto=format&fit=crop&w=2400&q=80";
const crowd = "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=2000&q=80";

const WORDMARK = ["L", "O", "T", "L", "Y"];

const RECEIPT: Array<[string, string]> = [
  ["Source", "instagram · p/LotlyDemo01"],
  ["Eligible", "143 of 160 comments"],
  ["Rules", "#giveaway · one per person · host out"],
  ["Seed", "9f3c0a6e41d27b58c0e1a9d4f7b26e13"],
  ["SHA-256", "e1b40c7d9a2f65e8b31d0c4a7f9e2b58d61c3a0f4e7b9d2c5a8f1e3b6d9c0a27"],
];

export default async function HomePage() {
  const plan = await getPlanFromCookies();

  return (
    <main className="landing">
      <section className="hero">
        <Image
          src={heroStage}
          alt="A crowd with hands raised under stage lights"
          fill
          preload
          unoptimized
          sizes="100vw"
          className="hero-img"
        />
        <div className="hero-shade" aria-hidden />
        <SiteHeader plan={plan} overlay />

        <div className="hero-inner">
          <h1 className="wordmark" aria-label="Lotly">
            {WORDMARK.map((ch, i) => (
              <span key={i} aria-hidden style={{ "--i": i } as CSSProperties}>
                {ch}
              </span>
            ))}
          </h1>
          <div className="hero-foot">
            <div className="hero-copy">
              <p className="hero-headline">Pick the winner. Prove it was fair.</p>
              <p className="hero-sub">
                Bring comments from YouTube, Instagram, TikTok, Twitch chat or any list,
                and draw a winner with a receipt your audience can check.
              </p>
            </div>
            <div className="hero-cta">
              <Link href="/app" className="btn primary lg">
                Start a draw — free
              </Link>
              <Link href="/pricing" className="btn line lg">
                Pro · ${PRO_PRICE_USD} once
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section sources" id="sources">
        <div className="section-head">
          <div>
            <p className="kicker">01 / Sources</p>
            <h2 className="section-title">Wherever the comments are</h2>
          </div>
          <p className="section-lede">
            YouTube loads from a link. For every other platform, paste the thread or drop
            a CSV export. Nothing waits on another platform approving an API app.
          </p>
        </div>
        <ol className="source-list">
          {PLATFORM_ORDER.map((id, i) => (
            <li key={id}>
              <Link href={`/app?platform=${id}`} className="source-row">
                <span className="source-index">0{i + 1}</span>
                <span className="source-name">{PLATFORMS[id].label}</span>
                <span className="source-how">{PLATFORMS[id].pitch}</span>
                <span className="source-go" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="section proof" id="proof">
        <div className="proof-copy">
          <p className="kicker">02 / Proof</p>
          <h2 className="section-title">Every draw leaves a receipt</h2>
          <p className="section-lede">
            Lotly commits to a random seed, sorts the eligible entries, shuffles them
            deterministically and hashes the whole lot with SHA-256. Post the receipt and
            anyone can re-run the draw and land on the same name.
          </p>
        </div>
        <dl className="receipt" aria-label="Sample fairness receipt">
          {RECEIPT.slice(0, 3).map(([k, v]) => (
            <div className="receipt-row" key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
          <div className="receipt-row is-winner">
            <dt>Winner</dt>
            <dd>@nova.beat</dd>
          </div>
          {RECEIPT.slice(3).map(([k, v]) => (
            <div className="receipt-row is-hash" key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="section pricing" id="pricing">
        <div className="section-head">
          <div>
            <p className="kicker">03 / Pricing</p>
            <h2 className="section-title">Free to run. ${PRO_PRICE_USD} to own.</h2>
          </div>
          <p className="section-lede">
            One payment unlocks Pro for good. No subscription and no per-draw fees.
          </p>
        </div>
        <PricingTable plan={plan} />
      </section>

      <section className="closer">
        <Image src={crowd} alt="" fill sizes="100vw" unoptimized className="closer-img" />
        <div className="closer-shade" aria-hidden />
        <div className="closer-inner">
          <h2 className="closer-title">They showed up. Pick one fairly.</h2>
          <Link href="/app" className="btn primary lg">
            Open the draw room
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
