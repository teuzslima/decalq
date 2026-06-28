import Link from "next/link";
import { getCurrentTenant, getCurrentUser } from "@/server/context";
import { getUsage } from "@/server/services/usage";

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const tenant = await getCurrentTenant();
  const { user } = await getCurrentUser();
  const usage = await getUsage(tenant.id).catch(() => null);
  const logoUrl = (tenant.theme as Record<string, string>)?.logoUrl;
  const isOwner = user?.role === "owner";

  const nav = [
    { href: "/generate", label: "Criar" },
    { href: "/history", label: "Stencils" },
    ...(isOwner ? [{ href: "/usage", label: "Uso" }, { href: "/settings", label: "Estúdio" }] : []),
  ];

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={tenant.name} className="h-8 w-auto" />
          ) : (
            <span className="font-display text-xl tracking-tight">{tenant.name}</span>
          )}
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="text-ink/70 hover:text-ink">{n.label}</Link>
          ))}
          {isOwner && usage && (
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-ink/70">
              {Math.floor(usage.remainingCredits)} de {usage.allowanceCredits} este mês
            </span>
          )}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
