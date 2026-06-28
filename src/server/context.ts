import { headers } from "next/headers";
import { resolveTenantByHost } from "@/server/tenant";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { withTenant } from "@/server/db";
import { cache } from "react";

/** Resolve o tenant atual a partir do host (setado pelo middleware). */
export const getCurrentTenant = cache(async () => {
  const host = headers().get("x-tenant-host") ?? headers().get("host");
  const tenant = await resolveTenantByHost(host);
  if (!tenant) throw new Error("Tenant não encontrado para este domínio");
  if (tenant.status === "suspended") throw new Error("Estúdio suspenso");
  return tenant;
});

/** Sessão do Supabase Auth (JWT em cookie). */
export function getSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
       setAll: (toSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          try {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Chamado de um Server Component: o cookie será renovado pelo
            // middleware na próxima navegação. Pode ignorar com segurança.
          }
        },
      },
    }
  );
}

/** Usuário do tenant atual (linka auth -> users do tenant). */
export async function getCurrentUser() {
  const tenant = await getCurrentTenant();
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { tenant, user: null };

  const dbUser = await withTenant(tenant.id, (tx) =>
    tx.user.findFirst({ where: { authId: user.id } })
  );
  return { tenant, user: dbUser };
}
