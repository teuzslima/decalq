import { withTenant } from "../db";
import { consumeUnits, refundUnits, AllowanceExhaustedError } from "./usage";
import { getProvider } from "../ai";
import { signedUrl, putObject, buildKey } from "./storage";
import { tintStencil } from "./tint";
import { extractLineArt } from "./lineart";

type StartArgs = {
  tenantId: string;
  userId: string;
  styleId: string;
  sourceImageId?: string;
  text?: string;
  color?: string;
  sizeCm?: { w: number; h: number };
};

export async function startGeneration(args: StartArgs) {
  const { tenantId, userId, styleId, sourceImageId, text, color, sizeCm } = args;
  const stencilColor = color ?? "#7C3AED";

  const { gen, style } = await withTenant(tenantId, async (tx) => {
    const style = await tx.style.findFirst({ where: { id: styleId, isActive: true } });
    if (!style) throw new Error("Estilo indisponível");
    const gen = await tx.generation.create({
      data: {
        tenantId, userId, styleId: style.id, sourceImageId,
        provider: style.provider, status: "queued",
        color: stencilColor, costUnits: style.costUnits,
        sizeCm: sizeCm ?? {}, params: { text: text ?? null },
      },
    });
    return { gen, style };
  });

  try {
    await consumeUnits(tenantId, style.costUnits, gen.id);
  } catch (e) {
    if (e instanceof AllowanceExhaustedError) {
      await withTenant(tenantId, (tx) =>
        tx.generation.update({
          where: { id: gen.id },
          data: { status: "failed", error: "Franquia mensal esgotada" },
        })
      );
    }
    throw e;
  }

  let imageUrl: string | undefined;
  if (sourceImageId) {
    const src = await withTenant(tenantId, (tx) =>
      tx.sourceImage.findUnique({ where: { id: sourceImageId } })
    );
    if (src) imageUrl = await signedUrl(src.storageKey);
  }

  try {
    if (style.provider === "local") {
      if (!imageUrl) throw new Error("Envie uma imagem de referência para este estilo.");
      const srcBuf = await fetchToBuffer(imageUrl);
      const lineBuf = await extractLineArt(srcBuf, style.params as Record<string, number | string>);
      await withTenant(tenantId, (tx) =>
        tx.generation.update({
          where: { id: gen.id },
          data: { status: "processing", externalId: `local_${Date.now()}` },
        })
      );
      await finalizeFromBuffer(tenantId, gen.id, lineBuf);
      return { generationId: gen.id, status: "processing" as const };
    }

    const provider = getProvider(style.provider);
    const webhookUrl = `${process.env.APP_URL}/api/webhooks/replicate?gen=${gen.id}`;

    const result = await provider.startGeneration({
      imageUrl, text,
      style: {
        provider: style.provider, model: style.model,
        preprocessor: style.preprocessor, promptTemplate: style.promptTemplate,
        params: style.params as Record<string, unknown>,
      },
      webhookUrl,
    });

    await withTenant(tenantId, (tx) =>
      tx.generation.update({
        where: { id: gen.id },
        data: { status: "processing", externalId: result.externalId },
      })
    );

    if (style.provider === "openai" || style.provider === "replicate") {
      const parsed = provider.parseWebhook({ externalId: result.externalId });
      if (parsed.status === "done" && parsed.outputUrl) {
        await finalizeGeneration(tenantId, gen.id, parsed.outputUrl);
      } else if (parsed.status === "failed") {
        await failGeneration(tenantId, gen.id, parsed.error ?? "Falha na geração");
      }
    }

    return { generationId: gen.id, status: "processing" as const };
  } catch (err) {
    await refundUnits(tenantId, style.costUnits, gen.id);
    await withTenant(tenantId, (tx) =>
      tx.generation.update({
        where: { id: gen.id },
        data: { status: "failed", error: String(err) },
      })
    );
    throw err;
  }
}

export async function finalizeGeneration(tenantId: string, generationId: string, outputUrl: string) {
  const baseBuffer = await fetchToBuffer(outputUrl);
  return finalizeFromBuffer(tenantId, generationId, baseBuffer);
}

export async function finalizeFromBuffer(tenantId: string, generationId: string, baseBuffer: Buffer) {
  const gen = await withTenant(tenantId, (tx) =>
    tx.generation.findUnique({ where: { id: generationId } })
  );
  const color = gen?.color ?? "#7C3AED";

  const pngKey = buildKey(tenantId, "result", generationId, "png");
  await putObject(pngKey, baseBuffer, "image/png");

  const tinted = await tintStencil(baseBuffer, color);
  const tintKey = buildKey(tenantId, "result", `${generationId}-tint`, "png");
  await putObject(tintKey, tinted, "image/png");

  await withTenant(tenantId, (tx) =>
    tx.generation.update({
      where: { id: generationId },
      data: { status: "done", resultPngKey: pngKey, resultTintKey: tintKey, completedAt: new Date() },
    })
  );
}

export async function failGeneration(tenantId: string, generationId: string, error: string) {
  const gen = await withTenant(tenantId, (tx) =>
    tx.generation.findUnique({ where: { id: generationId } })
  );
  if (!gen || gen.status === "done") return;
  await refundUnits(tenantId, gen.costUnits, generationId);
  await withTenant(tenantId, (tx) =>
    tx.generation.update({ where: { id: generationId }, data: { status: "failed", error } })
  );
}

async function fetchToBuffer(url: string): Promise<Buffer> {
  if (url.startsWith("data:")) return Buffer.from(url.split(",")[1], "base64");
  const res = await fetch(url);
  return Buffer.from(await res.arrayBuffer());
}