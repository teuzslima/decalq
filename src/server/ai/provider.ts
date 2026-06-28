// Contrato único que toda IA implementa. A aplicação fala com esta interface,
// nunca diretamente com Replicate/OpenAI — trocar provedor é trocar adaptador.

export type StyleConfig = {
  provider: string;
  model: string;
  preprocessor: string | null;
  promptTemplate: string;
  params: Record<string, unknown>;
};

export type GenerateInput = {
  imageUrl?: string; // URL pública/assinada da imagem de origem (decalque a partir de foto)
  text?: string; // para lettering
  style: StyleConfig;
  webhookUrl: string; // para onde o provedor avisa quando concluir
};

export type GenerateResult = {
  externalId: string; // id do job no provedor (para reconciliar via webhook)
  status: "queued" | "processing";
};

export interface AiProvider {
  /** Dispara a geração de forma assíncrona e retorna o id externo do job. */
  startGeneration(input: GenerateInput): Promise<GenerateResult>;
  /** Interpreta o payload do webhook do provedor -> resultado normalizado. */
  parseWebhook(payload: unknown): {
    externalId: string;
    status: "done" | "failed" | "processing";
    outputUrl?: string;
    error?: string;
  };
}
