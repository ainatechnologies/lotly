import Link from "next/link";

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer className={`site-footer${compact ? " is-compact" : ""}`}>
      {!compact && <p className="footer-mark">Lotly</p>}
      <div className="footer-row">
        <span>Fair giveaway draws · Softset Studios</span>
        <nav className="footer-nav" aria-label="Footer">
          <Link href="/app">Studio</Link>
          <Link href="/pricing">Pricing</Link>
          <a href="mailto:alisher@live.co.uk">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
