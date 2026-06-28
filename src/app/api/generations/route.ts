import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/server/context";
import { startGeneration } from "@/server/services/generation";
import { withTenant } from "@/server/db";
import { AllowanceExhaustedError } from "@/server/services/usage";

const StartSchema = z.object({
  styleId: z.string(),
  sourceImageId: z.string().optional(),
  text: z.string().optional(),
  color: z.string().optional(),
  sizeCm: z.object({ w: z.number().positive(), h: z.number().positive() }).optional(),
});

export async function POST(req: Request) {
  const { tenant, user } = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (user.role === "staff")
    return NextResponse.json({ error: "Sem permissão para gerar" }, { status: 403 });

  const body = StartSchema.parse(await req.json());
  try {
    const result = await startGeneration({
      tenantId: tenant.id, userId: user.id,
      styleId: body.styleId, sourceImageId: body.sourceImageId,
      text: body.text, color: body.color, sizeCm: body.sizeCm,
    });
    return NextResponse.json(result, { status: 202 });
  } catch (e) {
    if (e instanceof AllowanceExhaustedError) {
      return NextResponse.json(
        { error: "Limite do estúdio atingido este mês. Fale com o responsável." },
        { status: 402 }
      );
    }
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  const { tenant, user } = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const gens = await withTenant(tenant.id, (tx) =>
    tx.generation.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { style: true } })
  );
  return NextResponse.json({ generations: gens });
}
