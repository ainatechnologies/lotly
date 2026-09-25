import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { CheckoutButton } from "@/components/CheckoutButton";
import { getPlanFromCookies } from "@/lib/license";
import { FREE_COMMENT_CAP, PRO_PRICE_USD } from "@/lib/types";

export default async function HomePage() {
  const plan = await getPlanFromCookies();

  return (
    <main className="page">
      <SiteHeader plan={plan} />

      <section className="hero">
        <div className="hero-copy">
          <p className="brand-lockup">Lotly</p>
          <h1>Fair giveaways your audience can trust.</h1>
          <p className="lede">
            Paste a YouTube link, set the rules, and draw a winner with a
            shareable proof — built for creators who run giveaways for growth.
          </p>
          <div className="cta-row">
            <Link href="/app" className="btn primary">
              Start a giveaway
            </Link>
            <Link href="/pricing" className="btn ghost">
              See Pro — ${PRO_PRICE_USD} once
            </Link>
          </div>
        </div>
        <div className="hero-visual" aria-hidden>
          <div className="hero-stage">
            <span className="pulse" />
            <span className="hero-label">Live draw</span>
            <strong>@MayaStreams</strong>
          </div>
        </div>
      </section>

      <section className="section" id="how">
        <h2>One job: pick a winner cleanly.</h2>
        <p className="section-lede">
          Lotly is a giveaway studio — not a dashboard of clutter. Load comments,
          filter entries, then prove the draw.
        </p>
        <ol className="steps">
          <li>
            <strong>Load</strong>
            <span>Pull comments from any public YouTube video.</span>
          </li>
          <li>
            <strong>Filter</strong>
            <span>Keyword, unique authors, likes, exclude yourself.</span>
          </li>
          <li>
            <strong>Prove</strong>
            <span>Seeded draw + copyable fairness certificate for your community.</span>
          </li>
        </ol>
      </section>

      <section className="section split">
        <div>
          <h2>Monetize the moment.</h2>
          <p className="section-lede">
            Free covers casual draws. Pro unlocks unlimited comments, multi-winners,
            CSV exports, and removes the Lotly watermark — a one-time ${PRO_PRICE_USD}
            purchase creators actually finish.
          </p>
        </div>
        <div className="price-card">
          <p className="eyebrow">Lotly Pro</p>
          <p className="price">
            ${PRO_PRICE_USD}
            <span>lifetime</span>
          </p>
          <ul>
            <li>Unlimited comments (beyond {FREE_COMMENT_CAP} free)</li>
            <li>Multiple winners per draw</li>
            <li>CSV export + fairness proofs</li>
            <li>No “Picked with Lotly” watermark</li>
          </ul>
          {plan === "pro" ? (
            <Link href="/app" className="btn primary wide">
              Open your Pro studio
            </Link>
          ) : (
            <CheckoutButton className="btn primary wide" />
          )}
        </div>
      </section>

      <footer className="site-footer">
        <span>Lotly · Softset Studios</span>
        <Link href="/app">Open picker</Link>
      </footer>
    </main>
  );
}
