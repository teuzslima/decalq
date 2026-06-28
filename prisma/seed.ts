import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// custUnits: centi-unidades (100 = 1 crédito, 150 = 1,5, 300 = 3) — casa com a referência.
const GLOBAL_STYLES = [
  {
    key: "outline", label: "Outline", costUnits: 100, etaSeconds: 30,
    preprocessor: "lineart",
    description: "Formas básicas e contornos limpos. Ideal para designs simples.",
    promptTemplate: "clean single-weight tattoo outline, continuous black lines on white, no shading, no fill, high contrast, transfer-ready stencil",
    params: { conditioning_scale: 1.1, steps: 28, guidance: 6 },
  },
  {
    key: "standard", label: "Standard", costUnits: 100, etaSeconds: 30,
    preprocessor: "canny",
    description: "Sombras traçadas com linhas limpas. Ideal para realismo e retratos.",
    promptTemplate: "tattoo stencil with bold outlines and traced shadow guides, clean linework, black ink on white, transfer-ready",
    params: { conditioning_scale: 0.9, steps: 30, guidance: 6.5 },
  },
  {
    key: "hatching", label: "Hatching", costUnits: 100, etaSeconds: 30,
    preprocessor: "lineart",
    description: "Hachura cruzada para profundidade máxima. Ideal para retratos e realismo complexo.",
    promptTemplate: "engraving tattoo stencil with cross-hatching and fine parallel lines for shading, etching texture, black on white",
    params: { conditioning_scale: 1.0, steps: 32, guidance: 7 },
  },
  {
    key: "fine_line", label: "Fine Line", costUnits: 100, etaSeconds: 30,
    preprocessor: "lineart",
    description: "Linhas finas e delicadas, contínuas. Minimalista e elegante.",
    promptTemplate: "delicate fine-line tattoo, thin continuous single-weight lines, minimal, elegant, black on white, no shading",
    params: { conditioning_scale: 1.2, steps: 30, guidance: 6 },
  },
  {
    key: "blackwork", label: "Blackwork", costUnits: 100, etaSeconds: 30,
    preprocessor: "canny",
    description: "Preenchimentos sólidos e alto contraste. Forte uso de espaço negativo.",
    promptTemplate: "bold blackwork tattoo, solid black fills, strong negative space, high contrast graphic stencil, black on white",
    params: { conditioning_scale: 0.85, steps: 30, guidance: 7 },
  },
  {
    key: "lettering", label: "Lettering", costUnits: 100, etaSeconds: 25,
    provider: "openai", model: "gpt-image-1", preprocessor: "none",
    description: "Tipografia e escrita. Descreva a frase desejada.",
    promptTemplate: "tattoo lettering of the phrase, clean script, black ink on white, transfer-ready, centered",
    params: { size: "1024x1024" },
  },
];

async function main() {
  for (const s of GLOBAL_STYLES) {
    const provider = (s as any).provider ?? "replicate";
    const model = (s as any).model ?? "stability-ai/sdxl-controlnet";
    await prisma.style.upsert({
      where: { id: `global_${s.key}` },
      update: {
        label: s.label, description: s.description, costUnits: s.costUnits,
        etaSeconds: s.etaSeconds, promptTemplate: s.promptTemplate, params: s.params,
        provider, model, preprocessor: s.preprocessor, isActive: true,
      },
      create: {
        id: `global_${s.key}`, tenantId: null, key: s.key, label: s.label,
        description: s.description, provider, model, preprocessor: s.preprocessor,
        promptTemplate: s.promptTemplate, params: s.params,
        costUnits: s.costUnits, etaSeconds: s.etaSeconds, isActive: true,
      },
    });
  }

  // Tenant real: Júnior Tattoo (single-tenant em produção).
  const tenant = await prisma.tenant.upsert({
    where: { slug: "junior" },
    update: {},
    create: {
      name: "Júnior Tattoo",
      slug: "junior",
      status: "active",
      planName: "studio",
      monthlyAllowance: 6000, // 60 geracoes/mes (1 geracao = 100 unidades = 1 credito)
      theme: {
        primary: "#FFFFFF",        // marca monocromática do Júnior (botões brancos)
        brandFg: "#111111",        // texto sobre os botões brancos
        bg: "#0B0B0C",
        ink: "#F4F4F5",
        surface: "#161618",
        logoUrl: "/junior-logo.png",
        defaultColor: "#7C3AED",   // cor de transferência do stencil (funcional, não da marca)
      },
      meter: { create: { remaining: 6000, periodStart: new Date() } },
      billing: { create: { amountMonthly: 49.90, status: "active" } },
      domains: { create: [{ host: "junior.localhost:3000", isPrimary: true, sslStatus: "active" }] },
    },
  });

  console.log("Seed OK. Júnior Tattoo:", tenant.id);
  console.log("Crie o usuário owner no Supabase Auth e rode o vínculo (ver README).");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
