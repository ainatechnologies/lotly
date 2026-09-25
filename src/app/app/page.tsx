import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PickerApp } from "@/components/PickerApp";
import { getPlanFromCookies } from "@/lib/license";
import { PLATFORM_ORDER } from "@/lib/platforms";
import type { Platform } from "@/lib/types";

export const metadata = {
  title: "Draw room — Lotly",
};

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string }>;
}) {
  const plan = await getPlanFromCookies();
  const { platform } = await searchParams;
  const initialPlatform = PLATFORM_ORDER.find((p) => p === platform) as Platform | undefined;

  return (
    <main className="app-page">
      <SiteHeader plan={plan} />
      <PickerApp initialPlan={plan} initialPlatform={initialPlatform} />
      <SiteFooter compact />
    </main>
  );
}
