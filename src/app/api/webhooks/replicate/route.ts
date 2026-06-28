import { NextResponse } from "next/server";
import { withTenant } from "@/server/db";
import { replicateProvider } from "@/server/ai/replicate";
import { finalizeGeneration, failGeneration } from "@/server/services/generation";

/**
 * Replicate chama esta URL quando o job termina. Passamos ?gen=<id> na criação,
 * então sabemos qual geração atualizar sem depender só do externalId.
 *
 * Idempotência: se a geração já está "done", ignoramos chamadas repetidas.
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const genId = url.searchParams.get("gen");
  if (!genId) return NextResponse.json({ ok: false }, { status: 400 });

  const payload = await req.json();
  const parsed = replicateProvider.parseWebhook(payload);

  // Descobre o tenant da geração (consulta sem escopo de tenant: lookup interno).
  // Em produção, valide a assinatura do webhook do Replicate aqui.
  const { prisma } = await import("@/server/db");
  const gen = await prisma.generation.findUnique({ where: { id: genId } });
  if (!gen) return NextResponse.json({ ok: false }, { status: 404 });
  if (gen.status === "done") return NextResponse.json({ ok: true });

  if (parsed.status === "done" && parsed.outputUrl) {
    await finalizeGeneration(gen.tenantId, genId, parsed.outputUrl);
  } else if (parsed.status === "failed") {
    await failGeneration(gen.tenantId, genId, parsed.error ?? "Falha na geração");
  }

  return NextResponse.json({ ok: true });
}
