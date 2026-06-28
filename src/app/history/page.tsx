import AppShell from "@/components/AppShell";
import { getCurrentTenant } from "@/server/context";
import { withTenant } from "@/server/db";
import { signedUrl } from "@/server/services/storage";

export default async function HistoryPage() {
  const tenant = await getCurrentTenant();
  const gens = await withTenant(tenant.id, (tx) =>
    tx.generation.findMany({ orderBy: { createdAt: "desc" }, take: 60, include: { style: true } })
  );
  const items = await Promise.all(
    gens.map(async (g) => ({
      id: g.id, style: g.style.label, status: g.status,
      url: g.resultTintKey ? await signedUrl(g.resultTintKey) : (g.resultPngKey ? await signedUrl(g.resultPngKey) : null),
    }))
  );

  return (
    <AppShell>
      <h2 className="mb-6 font-display text-2xl">Meus stencils</h2>
      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-ink/60">Nenhum stencil ainda.</p>
          <p className="mt-1 text-sm text-ink/40">Comece criando seu primeiro na aba Criar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map((g) => (
            <div key={g.id} className="overflow-hidden rounded-lg border border-white/10">
              <div className="flex aspect-square items-center justify-center bg-white">
                {g.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={g.url} alt={g.style} className="h-full w-full object-contain p-2" />
                ) : <span className="text-xs text-black/40">{g.status}</span>}
              </div>
              <div className="flex items-center justify-between px-2 py-1.5 text-xs">
                <span>{g.style}</span>
                {g.url && <a href={`/api/export/${g.id}?format=png`} className="text-brand">baixar</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
