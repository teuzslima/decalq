import { PrismaClient } from "@prisma/client";

// Singleton do Prisma (evita esgotar conexões em dev/hot-reload).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Executa uma função dentro de uma transação com o tenant atual setado.
 * O set_config local garante que o RLS do Postgres só enxerga este tenant.
 *
 *   const gens = await withTenant(tenantId, (tx) =>
 *     tx.generation.findMany({ orderBy: { createdAt: "desc" } })
 *   );
 *
 * Não é preciso adicionar `where: { tenantId }` — o banco já filtra.
 */
export async function withTenant<T>(
  tenantId: string,
  fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    // `true` = escopo local à transação (reseta no fim).
    await tx.$executeRawUnsafe(
      `SELECT set_config('app.tenant_id', $1, true)`,
      tenantId
    );
    return fn(tx as unknown as PrismaClient);
  });
}
