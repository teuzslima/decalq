import { NextResponse } from "next/server";
import sharp from "sharp";
import { getCurrentUser } from "@/server/context";
import { withTenant } from "@/server/db";
import { putObject, buildKey } from "@/server/services/storage";

export async function POST(req: Request) {
  const { tenant, user } = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Arquivo ausente" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  // Normaliza para PNG e lê dimensões.
  const img = sharp(buffer);
  const meta = await img.metadata();
  const normalized = await img.png().toBuffer();

  const id = crypto.randomUUID();
  const key = buildKey(tenant.id, "source", id, "png");
  await putObject(key, normalized, "image/png");

  const record = await withTenant(tenant.id, (tx) =>
    tx.sourceImage.create({
      data: {
        id,
        tenantId: tenant.id,
        userId: user.id,
        storageKey: key,
        width: meta.width,
        height: meta.height,
        mime: "image/png",
      },
    })
  );

  return NextResponse.json({ sourceImageId: record.id });
}
