import Link from "next/link";
import type { Plan } from "@/lib/types";

export function SiteHeader({ plan, overlay = false }: { plan?: Plan; overlay?: boolean }) {
  return (
    <header className={`site-header${overlay ? " is-overlay" : ""}`}>
      <Link href="/" className="brand" aria-label="Lotly home">
        Lotly
      </Link>
      <nav className="nav" aria-label="Main">
        <Link href="/#sources" className="nav-link hide-sm">
          Platforms
        </Link>
        <Link href="/pricing" className="nav-link">
          Pricing
        </Link>
        <Link href="/app" className="nav-cta">
          {plan === "pro" ? "Open studio" : "Start a draw"}
        </Link>
      </nav>
    </header>
  );
}
