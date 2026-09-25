import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { PickerApp } from "@/components/PickerApp";
import { getPlanFromCookies } from "@/lib/license";

export default async function AppPage() {
  const plan = await getPlanFromCookies();

  return (
    <main className="page app-page">
      <SiteHeader plan={plan} />
      <PickerApp initialPlan={plan} />
      <footer className="site-footer compact">
        <Link href="/pricing">Upgrade to Pro</Link>
        <span>Fair draws · shareable proof</span>
      </footer>
    </main>
  );
}
