import AppShell from "@/components/AppShell";
import { getCurrentTenant, getCurrentUser } from "@/server/context";
import { getUsage } from "@/server/services/usage";
import { withTenant } from "@/server/db";
import { redirect } from "next/navigation";

export default async function UsagePage() {
  const tenant = await getCurrentTenant();
  const { user } = await getCurrentUser();
  if (user?.role !== "owner") redirect("/dashboard");

  const usage = await getUsage(tenant.id);
  const pct = usage.allowance > 0 ? Math.round((usage.used / usage.allowance) * 100) : 0;
  const ledger = await withTenant(tenant.id, (tx) =>
    tx.ledgerEntry.findMany({ orderBy: { createdAt: "desc" }, take: 30 })
  );

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h2 className="font-display text-2xl">Uso do mês</h2>
          <p className="text-sm text-ink/60">Plano {tenant.planName} · franquia mensal de {usage.allowanceCredits} gerações.</p>
        </div>

        <div className="rounded-xl border border-white/10 p-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="font-display text-4xl">{Math.floor(usage.remainingCredits)}</div>
              <div className="text-sm text-ink/50">restantes de {usage.allowanceCredits}</div>
            </div>
            <div className="text-sm text-ink/50">{pct}% usado</div>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
          </div>
          {pct >= 80 && (
            <p className="mt-3 text-xs text-amber-400">
              Perto do limite do mês. Para subir o plano, fale com o suporte da plataforma.
            </p>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-sm uppercase tracking-wide text-ink/50">Movimentações</h3>
          <div className="divide-y divide-white/5 rounded-xl border border-white/10 text-sm">
            {ledger.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-4 py-2">
                <span className="text-ink/70">
                  {e.type === "consume" ? "Geração" : e.type === "refund" ? "Reembolso" : e.type === "monthly_set" ? "Recarga mensal" : "Ajuste"}
                </span>
                <span className={e.amount < 0 ? "text-ink/60" : "text-green-400"}>
                  {e.amount > 0 ? "+" : ""}{(e.amount / 100).toLocaleString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
