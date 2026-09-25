import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { CheckoutButton } from "@/components/CheckoutButton";
import { getPlanFromCookies } from "@/lib/license";
import { FREE_COMMENT_CAP, FREE_WINNER_CAP, PRO_PRICE_USD } from "@/lib/types";

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string; error?: string }>;
}) {
  const plan = await getPlanFromCookies();
  const params = await searchParams;

  return (
    <main className="page">
      <SiteHeader plan={plan} />
      <section className="pricing-hero">
        <p className="brand-lockup">Lotly</p>
        <h1>Simple pricing for creators who run giveaways.</h1>
        <p className="lede">
          Start free. Unlock Pro once when your audience grows past casual draws.
        </p>
        {params.canceled && (
          <p className="hint">Checkout canceled — no charge. You can try again anytime.</p>
        )}
        {params.error && (
          <p className="error">Payment could not be verified. Contact support if this persists.</p>
        )}
      </section>

      <section className="pricing-grid">
        <article className="price-card muted">
          <p className="eyebrow">Free</p>
          <p className="price">
            $0<span>forever</span>
          </p>
          <ul>
            <li>Up to {FREE_COMMENT_CAP} comments per draw</li>
            <li>{FREE_WINNER_CAP} winner</li>
            <li>Keyword + author filters</li>
            <li>Fairness seed + proof</li>
            <li>Lotly watermark on winner card</li>
          </ul>
          <Link href="/app" className="btn ghost wide">
            Use free picker
          </Link>
        </article>

        <article className="price-card featured">
          <p className="eyebrow">Pro</p>
          <p className="price">
            ${PRO_PRICE_USD}
            <span>one-time</span>
          </p>
          <ul>
            <li>Unlimited comments</li>
            <li>Multiple winners</li>
            <li>CSV export</li>
            <li>No watermark</li>
            <li>Priority for future overlays & platforms</li>
          </ul>
          {plan === "pro" ? (
            <Link href="/app" className="btn primary wide">
              You&apos;re Pro — open studio
            </Link>
          ) : (
            <CheckoutButton className="btn primary wide" />
          )}
        </article>
      </section>

      <footer className="site-footer">
        <span>Questions? alisher@live.co.uk</span>
        <Link href="/app">Back to picker</Link>
      </footer>
    </main>
  );
}
