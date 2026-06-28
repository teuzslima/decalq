import type { AiProvider, GenerateInput, GenerateResult } from "./provider";
import { replicateProvider } from "./replicate";

/**
 * OpenAI gpt-image-1: usado para LETTERING, onde a compreensão semântica do
 * texto vence o controle de contorno. A API é síncrona, então simulamos o
 * fluxo assíncrono devolvendo o resultado imediatamente via "webhook interno".
 *
 * Observação: gpt-image-1 não tem webhook; o caller trata o retorno direto.
 * Aqui mantemos a mesma interface por consistência.
 */
export const openaiProvider: AiProvider = {
  async startGeneration(input: GenerateInput): Promise<GenerateResult> {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: input.style.model || "gpt-image-1",
        prompt: `${input.style.promptTemplate}: "${input.text ?? ""}"`,
        size: (input.style.params.size as string) ?? "1024x1024",
        n: 1,
      }),
    });
    const data = (await res.json()) as { data?: { b64_json?: string }[]; error?: unknown };
    if (!res.ok) throw new Error(`OpenAI error: ${JSON.stringify(data.error)}`);

    // Síncrono: usamos um id próprio e o caller persiste o b64 direto.
    const externalId = `openai_${Date.now()}`;
    // Truque: anexamos o resultado no id via cache de processo simples não é
    // production-safe; em produção, salve direto no storage aqui e marque done.
    (globalThis as any).__openaiResults ??= new Map();
    (globalThis as any).__openaiResults.set(externalId, data.data?.[0]?.b64_json);

    return { externalId, status: "processing" };
  },

  parseWebhook(payload: unknown) {
    const { externalId } = payload as { externalId: string };
    const b64 = (globalThis as any).__openaiResults?.get(externalId);
    if (b64) {
      return {
        externalId,
        status: "done" as const,
        outputUrl: `data:image/png;base64,${b64}`,
      };
    }
    return { externalId, status: "failed" as const, error: "resultado não encontrado" };
  },
};

/** Seleciona o adaptador certo a partir do provider do estilo. */
export function getProvider(provider: string): AiProvider {
  switch (provider) {
    case "openai":
      return openaiProvider;
    case "replicate":
    case "stability": // stability roda via Replicate ou API própria; aqui via replicate
    default:
      return replicateProvider;
  }
}
