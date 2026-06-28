import AppShell from "@/components/AppShell";
import { getCurrentTenant, getCurrentUser } from "@/server/context";
import { withTenant } from "@/server/db";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const tenant = await getCurrentTenant();
  const { user } = await getCurrentUser();
  if (user?.role !== "owner") redirect("/dashboard");

  const theme = tenant.theme as Record<string, string>;
  const users = await withTenant(tenant.id, (tx) => tx.user.findMany({ orderBy: { createdAt: "asc" } }));
  const domains = await withTenant(tenant.id, (tx) => tx.tenantDomain.findMany());

  return (
    <AppShell>
      <div className="space-y-10">
        <div>
          <h2 className="font-display text-2xl">Configurações do estúdio</h2>
          <p className="text-sm text-ink/60">Marca, equipe e domínio.</p>
        </div>

        <section>
          <h3 className="mb-3 text-sm uppercase tracking-wide text-ink/50">Marca</h3>
          <div className="flex flex-wrap gap-6 rounded-xl border border-white/10 p-6">
            <div>
              <div className="text-xs text-ink/50">Cor principal</div>
              <div className="mt-1 flex items-center gap-2">
                <span className="h-6 w-6 rounded" style={{ background: theme.primary }} />
                <code className="text-sm">{theme.primary ?? "—"}</code>
              </div>
            </div>
            <div>
              <div className="text-xs text-ink/50">Cor de stencil padrão</div>
              <div className="mt-1 flex items-center gap-2">
                <span className="h-6 w-6 rounded-full" style={{ background: theme.defaultColor }} />
                <code className="text-sm">{theme.defaultColor ?? "—"}</code>
              </div>
            </div>
            <div>
              <div className="text-xs text-ink/50">Logo</div>
              <div className="mt-1 text-sm">{theme.logoUrl ? "definida" : "padrão (nome)"}</div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm uppercase tracking-wide text-ink/50">Equipe</h3>
          <div className="divide-y divide-white/5 rounded-xl border border-white/10">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>{u.name ?? u.email}</span>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs">{u.role}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm uppercase tracking-wide text-ink/50">Domínio</h3>
          <div className="space-y-2 rounded-xl border border-white/10 p-4 text-sm">
            {domains.map((d) => (
              <div key={d.id} className="flex items-center justify-between">
                <code>{d.host}</code>
                <span className="text-xs text-ink/50">{d.sslStatus}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
