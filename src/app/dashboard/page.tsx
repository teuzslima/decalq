import Link from "next/link";
import AppShell from "@/components/AppShell";
import { getCurrentTenant, getCurrentUser } from "@/server/context";
import { withTenant } from "@/server/db";

export default async function DashboardPage() {
  const tenant = await getCurrentTenant();
  const { user } = await getCurrentUser();
  const count = await withTenant(tenant.id, (tx) =>
    tx.generation.count({ where: { status: "done" } })
  );
  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/40">Estúdio</p>
          <h1 className="font-display text-4xl">{tenant.name}</h1>
          {user && <p className="text-sm text-ink/50">Olá, {user.name ?? user.email} · {user.role}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 p-6">
            <div className="font-display text-3xl">{count}</div>
            <div className="text-sm text-ink/50">stencils criados</div>
          </div>
          <Link href="/generate" className="flex items-center justify-center rounded-xl bg-brand p-6 font-medium text-brand-fg">
            + Criar stencil
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
