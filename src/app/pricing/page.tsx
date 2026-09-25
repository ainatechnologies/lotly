import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PricingTable } from "@/components/PricingTable";
import { getPlanFromCookies } from "@/lib/license";
import { FREE_COMMENT_CAP, PRO_PRICE_USD } from "@/lib/types";
import heroStage from "../../../public/hero-stage.jpg";

const FAQ: Array<[string, string]> = [
  [
    "Which platforms work?",
    "YouTube comments load straight from a video link. Instagram, TikTok and Twitch come in as pasted comments, chat logs or CSV exports, and the Paste / CSV source takes a list from anywhere else.",
  ],
  [
    "Is it really one payment?",
    `Yes. Pro is $${PRO_PRICE_USD} once, checked out through Stripe. The license lives in a signed cookie on your browser, with no account or subscription.`,
  ],
  [
    "What happens past the free cap?",
    `Free draws use the first ${FREE_COMMENT_CAP} entries and tell you when the list was capped. Pro raises that to 5,000 per draw.`,
  ],
  [
    "Do you store my entries?",
    "No. Pasted entries stay in your browser. Lotly keeps recent results in your browser's local storage so you can find them again.",
  ],
];

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string; error?: string }>;
}) {
  const plan = await getPlanFromCookies();
  const params = await searchParams;

  return (
    <main className="pricing-page">
      <div className="pricing-atmos" aria-hidden>
        <Image src={heroStage} alt="" fill preload placeholder="blur" sizes="100vw" />
      </div>
      <SiteHeader plan={plan} overlay />

      <section className="pricing-intro">
        <p className="kicker">Pricing</p>
        <h1 className="pricing-title">
          Free to run.
          <br />${PRO_PRICE_USD} to own.
        </h1>
        <p className="section-lede">
          Every source and the fairness receipt are free. Pro lifts the caps and removes
          the watermark, for one payment.
        </p>
        {params.canceled && (
          <p className="notice">Checkout canceled. No charge was made.</p>
        )}
        {params.error && (
          <p className="error">Payment could not be verified. Contact support if this keeps happening.</p>
        )}
      </section>

      <section className="section pricing">
        <PricingTable plan={plan} />
      </section>

      <section className="section faq">
        <h2 className="section-title">Questions</h2>
        <dl className="faq-list">
          {FAQ.map(([q, a]) => (
            <div key={q} className="faq-item">
              <dt>{q}</dt>
              <dd>{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <SiteFooter />
    </main>
  );
}
