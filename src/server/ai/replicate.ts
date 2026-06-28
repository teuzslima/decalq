import Replicate from "replicate";
import type { AiProvider, GenerateInput, GenerateResult } from "./provider";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

// google/nano-banana — recebe prompt + image_input (array de URLs), devolve 1 arquivo.
const MODEL = "google/nano-banana";

export const replicateProvider: AiProvider = {
  async startGeneration(input: GenerateInput): Promise<GenerateResult> {
    const { style, imageUrl } = input;
    if (!imageUrl) throw new Error("Envie uma imagem de referência para este estilo.");

    const id = `nb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    (globalThis as any).__repResults ??= new Map();

    try {
      const output: any = await replicate.run(MODEL, {
        input: {
          prompt: style.promptTemplate,
          image_input: [imageUrl],
          output_format: "png",
        },
      });

      let url: string | undefined;
      if (output && typeof output.url === "function") url = output.url().toString();
      else if (typeof output === "string") url = output;
      else if (Array.isArray(output) && output[0]) {
        url = typeof output[0]?.url === "function" ? output[0].url().toString() : String(output[0]);
      }

      if (!url) throw new Error("nano-banana não retornou imagem");
      (globalThis as any).__repResults.set(id, { ok: true, url });
    } catch (err) {
      (globalThis as any).__repResults.set(id, { ok: false, error: String(err) });
    }

    return { externalId: id, status: "processing" };
  },

  parseWebhook(payload: unknown) {
    const { externalId } = payload as { externalId: string };
    const r = (globalThis as any).__repResults?.get(externalId);
    if (r?.ok) return { externalId, status: "done" as const, outputUrl: r.url };
    return { externalId, status: "failed" as const, error: r?.error ?? "resultado não encontrado" };
  },
};