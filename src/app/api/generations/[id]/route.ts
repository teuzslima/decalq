import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/context";
import { withTenant } from "@/server/db";
import { signedUrl } from "@/server/services/storage";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { tenant, user } = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const gen = await withTenant(tenant.id, (tx) =>
    tx.generation.findUnique({ where: { id: params.id }, include: { style: true, sourceImage: true } })
  );
  if (!gen) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const [resultUrl, originalUrl] = await Promise.all([
    gen.resultTintKey ? signedUrl(gen.resultTintKey) : null,
    gen.sourceImage ? signedUrl(gen.sourceImage.storageKey) : null,
  ]);

  return NextResponse.json({
    id: gen.id, status: gen.status, style: gen.style.label,
    color: gen.color, resultUrl, originalUrl, sizeCm: gen.sizeCm, error: gen.error,
  });
}
