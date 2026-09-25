import { NextResponse } from "next/server";
import { getStripe, appUrl } from "@/lib/stripe";
import { issueProLicense, LICENSE_COOKIE } from "@/lib/license";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  const demo = searchParams.get("demo");

  let email: string | undefined;

  if (
    demo === "1" &&
    (process.env.ALLOW_DEMO_UNLOCK === "true" || !process.env.STRIPE_SECRET_KEY)
  ) {
    // Dev unlock when Stripe isn't configured yet
  } else if (sessionId) {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.redirect(appUrl("/pricing?error=stripe"));
    }
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.redirect(appUrl("/pricing?error=unpaid"));
    }
    email = session.customer_details?.email || undefined;
  } else {
    return NextResponse.redirect(appUrl("/pricing"));
  }

  const token = await issueProLicense(email);
  const res = NextResponse.redirect(appUrl("/app?upgraded=1"));
  res.cookies.set(LICENSE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 10,
  });
  return res;
}
