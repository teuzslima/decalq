import type { PrismaClient } from "@prisma/client";
import { withTenant, prisma } from "../db";

/**
 * Medidor de uso = saldo de franquia restante no mês. Cada geração consome
 * unidades (custo do estilo). Quando zera, geração é bloqueada com aviso.
 *
 * Isso protege SEU custo de IA: o estúdio paga mensalidade fixa, mas não pode
 * gerar infinito. O livro-razão (LedgerEntry) registra cada movimento.
 *
 * Reset é "lazy": ao consultar/consumir, se o período virou, recarrega a
 * franquia ao valor do plano. Sem cron necessário no MVP.
 */

export class AllowanceExhaustedError extends Error {
  constructor(public remaining: number) {
    super("Franquia mensal do estúdio esgotada");
    this.name = "AllowanceExhaustedError";
  }
}

function sameMonth(a: Date, b: Date) {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth();
}

/** Garante que o medidor reflete o mês atual; recarrega se virou o período. */
async function ensurePeriod(tx: PrismaClient, tenantId: string) {
  const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new Error("Estúdio não encontrado");

  let meter = await tx.usageMeter.findUnique({ where: { tenantId } });
  const now = new Date();

  if (!meter) {
    meter = await tx.usageMeter.create({
      data: { tenantId, remaining: tenant.monthlyAllowance, periodStart: now },
    });
    await tx.ledgerEntry.create({
      data: { tenantId, amount: tenant.monthlyAllowance, type: "monthly_set", note: "início" },
    });
    return meter;
  }

  if (!sameMonth(meter.periodStart, now)) {
    meter = await tx.usageMeter.update({
      where: { tenantId },
      data: { remaining: tenant.monthlyAllowance, periodStart: now },
    });
    await tx.ledgerEntry.create({
      data: { tenantId, amount: tenant.monthlyAllowance, type: "monthly_set", note: "reset mensal" },
    });
  }
  return meter;
}

/** Consome unidades para uma geração. Lança se a franquia não cobre. */
export function consumeUnits(tenantId: string, units: number, generationId?: string) {
  return withTenant(tenantId, async (tx) => {
    const meter = await ensurePeriod(tx, tenantId);
    if (meter.remaining < units) throw new AllowanceExhaustedError(meter.remaining);

    const updated = await tx.usageMeter.update({
      where: { tenantId },
      data: { remaining: meter.remaining - units },
    });
    await tx.ledgerEntry.create({
      data: { tenantId, amount: -units, type: "consume", generationId },
    });
    return updated.remaining;
  });
}

/** Devolve unidades quando a geração falha. */
export function refundUnits(tenantId: string, units: number, generationId: string) {
  return withTenant(tenantId, async (tx) => {
    const meter = await ensurePeriod(tx, tenantId);
    const updated = await tx.usageMeter.update({
      where: { tenantId },
      data: { remaining: meter.remaining + units },
    });
    await tx.ledgerEntry.create({
      data: { tenantId, amount: units, type: "refund", generationId },
    });
    return updated.remaining;
  });
}

/** Estado de uso para o painel do dono. */
export async function getUsage(tenantId: string) {
  return withTenant(tenantId, async (tx) => {
    const meter = await ensurePeriod(tx, tenantId);
    const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
    const allowance = tenant?.monthlyAllowance ?? 0;
    return {
      remaining: meter.remaining,
      allowance,
      used: allowance - meter.remaining,
      // exibimos em "créditos" (1 crédito = 100 unidades) p/ casar com a UX da referência
      remainingCredits: meter.remaining / 100,
      allowanceCredits: allowance / 100,
    };
  });
}
