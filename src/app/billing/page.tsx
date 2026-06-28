import AppShell from "@/components/AppShell";
import { getCurrentTenant, getCurrentUser } from "@/server/context";
import { withTenant } from "@/server/db";
import { redirect } from "next/navigation";

export default async function BillingPage() {
  const tenant = await getCurrentTenant();
  const { user } = await getCurrentUser();
  if (user?.role !== "owner") redirect("/dashboard");
  const billing = await withTenant(tenant.id, (tx) => tx.billing.findUnique({ where: { tenantId: tenant.id } }));

  return (
    <AppShell>
      <div className="space-y-6">
        <h2 className="font-display text-2xl">Plano do estúdio</h2>
        <div className="rounded-xl border border-white/10 p-6">
          <div className="font-display text-3xl">{tenant.name}</div>
          <div className="mt-1 text-sm text-ink/50">
            {billing ? `R$ ${Number(billing.amountMonthly).toFixed(2)}/mês · ${billing.status}` : "sem cobrança ativa"}
          </div>
          <p className="mt-4 text-xs text-ink/40">
            A mensalidade é cobrada pela plataforma. Para alterar o plano ou a franquia,
            fale com o suporte.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
