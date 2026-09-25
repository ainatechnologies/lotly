import Link from "next/link";

export function SiteHeader({ plan }: { plan?: "free" | "pro" }) {
  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <span className="brand-mark" aria-hidden />
        Lotly
      </Link>
      <nav className="nav">
        <Link href="/#how">How it works</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/app" className="nav-cta">
          {plan === "pro" ? "Open picker" : "Start free"}
        </Link>
      </nav>
    </header>
  );
}
