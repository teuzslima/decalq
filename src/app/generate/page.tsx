import AppShell from "@/components/AppShell";
import GeneratorClient from "@/components/GeneratorClient";
import { getCurrentTenant } from "@/server/context";
import { withTenant } from "@/server/db";

export default async function GeneratePage() {
  const tenant = await getCurrentTenant();
  const styles = await withTenant(tenant.id, (tx) =>
    tx.style.findMany({
      where: { isActive: true },
      orderBy: { costUnits: "asc" },
      select: { id: true, key: true, label: true, description: true, costUnits: true, etaSeconds: true },
    })
  );
  const defaultColor = (tenant.theme as Record<string, string>)?.defaultColor ?? "#7C3AED";
  return (
    <AppShell>
      <GeneratorClient styles={styles} defaultColor={defaultColor} />
    </AppShell>
  );
}
