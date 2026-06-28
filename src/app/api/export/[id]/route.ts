import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/context";
import { withTenant } from "@/server/db";
import { signedUrl } from "@/server/services/storage";
import { exportPng, exportSvg, exportPdf } from "@/server/services/export";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { tenant, user } = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const format = new URL(req.url).searchParams.get("format") ?? "png";
  const gen = await withTenant(tenant.id, (tx) =>
    tx.generation.findUnique({ where: { id: params.id } })
  );
  // exporta a versão tintada (cor de transferência); cai pro P&B se faltar
  const key = gen?.resultTintKey ?? gen?.resultPngKey;
  if (!key) return NextResponse.json({ error: "Resultado indisponível" }, { status: 404 });

  const baseBuffer = Buffer.from(await (await fetch(await signedUrl(key))).arrayBuffer());
  const sc = (gen!.sizeCm as { w?: number; h?: number }) ?? {};
  const size = { w: sc.w ?? 10, h: sc.h ?? 10 };
  const resizedPng = await exportPng(baseBuffer, size);

  let out: Buffer, contentType: string, ext: string;
  switch (format) {
    case "svg": out = await exportSvg(resizedPng, size); contentType = "image/svg+xml"; ext = "svg"; break;
    case "pdf": out = await exportPdf(resizedPng, size); contentType = "application/pdf"; ext = "pdf"; break;
    default:    out = resizedPng; contentType = "image/png"; ext = "png";
  }
  return new NextResponse(new Uint8Array(out), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="stencil-${gen!.id}.${ext}"`,
    },
  });
}
