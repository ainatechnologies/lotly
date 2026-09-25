import { NextResponse } from "next/server";
import { getStripe, appUrl } from "@/lib/stripe";
import { PRO_PRICE_ID } from "@/lib/types";

export async function POST() {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured. Set STRIPE_SECRET_KEY to enable checkout.",
        demoUnlock: true,
      },
      { status: 503 },
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
    success_url: appUrl("/api/checkout/success?session_id={CHECKOUT_SESSION_ID}"),
    cancel_url: appUrl("/pricing?canceled=1"),
    allow_promotion_codes: true,
    metadata: { product: "lotly_pro" },
  });

  return NextResponse.json({ url: session.url });
}
