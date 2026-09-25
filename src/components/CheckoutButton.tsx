"use client";

import { useState } from "react";
import { PRO_PRICE_USD } from "@/lib/types";

export function CheckoutButton({
  label = `Unlock Pro — $${PRO_PRICE_USD}`,
  className = "btn primary",
}: {
  label?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.demoUnlock) {
        window.location.href = "/api/checkout/success?demo=1";
        return;
      }
      throw new Error(data.error || "Checkout unavailable");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setBusy(false);
    }
  }

  return (
    <div className="checkout-wrap">
      <button type="button" className={className} onClick={() => void checkout()} disabled={busy}>
        {busy ? "Redirecting…" : label}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
