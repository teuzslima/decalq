import Link from "next/link";
import { prisma } from "@/server/db";

export default async function AdminHome() {
  const tenants = await prisma.tenant.findMany({
    include: { meter: true, billing: true, _count: { select: { generations: true, users: true } } },
    orderBy: { createdAt: "desc" },
  });
  const totalGenerations = tenants.reduce((a, t) => a + t._count.generations, 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-3xl">Plataforma — Admin</h1>
      <div className="my-6 grid grid-cols-3 gap-4">
        <Stat label="Estúdios" value={tenants.length} />
        <Stat label="Gerações totais" value={totalGenerations} />
        <Stat label="Ativos" value={tenants.filter((t) => t.status === "active").length} />
      </div>
      <table className="w-full text-sm">
        <thead className="text-left text-ink/40">
          <tr><th className="py-2">Estúdio</th><th>Status</th><th>Plano</th><th>Franquia rest.</th><th>Gerações</th><th></th></tr>
        </thead>
        <tbody>
          {tenants.map((t) => (
            <tr key={t.id} className="border-t border-white/5">
              <td className="py-3">{t.name}</td>
              <td>{t.status}</td>
              <td>{t.planName}</td>
              <td>{t.meter ? Math.floor(t.meter.remaining / 100) : 0}</td>
              <td>{t._count.generations}</td>
              <td><Link href={`/admin/tenants/${t.id}`} className="text-brand">ver</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 p-5">
      <div className="font-display text-3xl">{value}</div>
      <div className="text-sm text-ink/50">{label}</div>
    </div>
  );
}
