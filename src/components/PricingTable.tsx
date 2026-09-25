import Link from "next/link";
import { CheckoutButton } from "./CheckoutButton";
import { FREE_COMMENT_CAP, FREE_WINNER_CAP, PRO_PRICE_USD, type Plan } from "@/lib/types";

export function PricingTable({ plan }: { plan: Plan }) {
  return (
    <div className="tiers">
      <article className="tier">
        <header className="tier-head">
          <h3 className="tier-name">Free</h3>
          <p className="tier-note">For the casual draw</p>
        </header>
        <p className="tier-price">$0</p>
        <ul className="tier-list">
          <li>Up to {FREE_COMMENT_CAP} entries per draw</li>
          <li>{FREE_WINNER_CAP} winner per draw</li>
          <li>All five sources, including paste &amp; CSV</li>
          <li>Keyword, duplicate and host filters</li>
          <li>Fairness receipt with “Picked with Lotly” mark</li>
        </ul>
        <Link href="/app" className="btn line wide">
          Use the free picker
        </Link>
      </article>

      <article className="tier is-pro">
        <header className="tier-head">
          <h3 className="tier-name">Pro</h3>
          <p className="tier-note">One payment, yours for good</p>
        </header>
        <p className="tier-price">
          ${PRO_PRICE_USD}
          <span>once</span>
        </p>
        <ul className="tier-list">
          <li>Up to 5,000 entries per draw</li>
          <li>Up to 50 winners in one draw</li>
          <li>CSV export of every result</li>
          <li>Clean receipts, no watermark</li>
          <li>New platforms as they ship</li>
        </ul>
        {plan === "pro" ? (
          <Link href="/app" className="btn primary wide">
            You&apos;re Pro — open the studio
          </Link>
        ) : (
          <CheckoutButton className="btn primary wide" label={`Get Pro — $${PRO_PRICE_USD}`} />
        )}
      </article>
    </div>
  );
}
