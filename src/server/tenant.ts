import { prisma } from "./db";

const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? "localhost:3000";

export type ResolvedTenant = {
  id: string;
  name: string;
  slug: string;
  status: string;
  planName: string;
  theme: Record<string, unknown>;
};

/**
 * Descobre o tenant pelo host da requisição.
 * 1) domínio próprio cadastrado em tenant_domains (estudio.com.br)
 * 2) subdomínio do domínio raiz (slug.app.com)
 *
 * Resultado é cacheável; em produção, ponha um cache (KV/Redis) por host.
 */
export async function resolveTenantByHost(
  host: string | null
): Promise<ResolvedTenant | null> {
  if (!host) return null;
  const cleanHost = host.toLowerCase().split(":")[0]; // ignora porta na comparação de subdomínio

  // 1) Domínio próprio exato
  const domain = await prisma.tenantDomain.findUnique({
    where: { host },
    include: { tenant: true },
  });
  if (domain?.tenant) return toResolved(domain.tenant);

  // (tenta também sem a porta, útil em dev com demo.localhost:3000)
  const domainNoPort = await prisma.tenantDomain.findFirst({
    where: { host: { startsWith: cleanHost } },
    include: { tenant: true },
  });
  if (domainNoPort?.tenant) return toResolved(domainNoPort.tenant);

  // 2) Subdomínio do domínio raiz
  const rootBase = ROOT_DOMAIN.split(":")[0];
  if (cleanHost.endsWith(`.${rootBase}`)) {
    const slug = cleanHost.replace(`.${rootBase}`, "").split(".")[0];
    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (tenant) return toResolved(tenant);
  }

 // Fallback: estúdio padrão (útil no domínio da Vercel, sem subdomínio)
  const fallbackSlug = process.env.DEFAULT_TENANT_SLUG;
  if (fallbackSlug) {
    const tenant = await prisma.tenant.findUnique({ where: { slug: fallbackSlug } });
    if (tenant) return toResolved(tenant);
  }

  return null;
}

function toResolved(t: {
  id: string;
  name: string;
  slug: string;
  status: string;
  planName: string;
  theme: unknown;
}): ResolvedTenant {
  return {
    id: t.id,
    name: t.name,
    slug: t.slug,
    status: t.status,
    planName: t.planName,
    theme: (t.theme as Record<string, unknown>) ?? {},
  };
}