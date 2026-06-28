import { prisma } from "@/server/db";

export default async function TenantDetail({ params }: { params: { id: string } }) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: params.id },
    include: {
      meter: true, users: true, billing: true,
      _count: { select: { generations: true } },
      ledger: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!tenant) return <div className="p-10">Estúdio não encontrado.</div>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl">{tenant.name}</h1>
      <p className="text-sm text-ink/50">{tenant.slug} · {tenant.status} · {tenant.planName}</p>
      <div className="my-6 grid grid-cols-3 gap-4">
        <Box label="Franquia rest." value={tenant.meter ? Math.floor(tenant.meter.remaining / 100) : 0} />
        <Box label="Usuários" value={tenant.users.length} />
        <Box label="Gerações" value={tenant._count.generations} />
      </div>
      <h2 className="mb-2 text-sm uppercase tracking-wide text-ink/50">Livro-razão de uso</h2>
      <div className="divide-y divide-white/5 rounded-xl border border-white/10 text-sm">
        {tenant.ledger.map((e) => (
          <div key={e.id} className="flex justify-between px-4 py-2">
            <span>{e.type}</span>
            <span className={e.amount < 0 ? "text-ink/60" : "text-green-400"}>
              {e.amount > 0 ? "+" : ""}{(e.amount / 100).toLocaleString("pt-BR")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
function Box({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 p-5">
      <div className="font-display text-2xl">{value}</div>
      <div className="text-xs text-ink/50">{label}</div>
    </div>
  );
}
