import { MercadoPagoConfig, PreApproval } from "mercadopago";

// Modelo B2B: o ESTÚDIO assina um plano mensal com VOCÊ (a plataforma).
// Nada de paywall de crédito pro cliente final — os artistas geram dentro
// da franquia do plano. Esta assinatura é a sua receita.

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export const STUDIO_PLANS = [
  { id: "studio", label: "Studio", monthly: 297.0, allowance: 1000 }, // ~1.000 gerações/mês
  { id: "studio_pro", label: "Studio Pro", monthly: 597.0, allowance: 3000 },
];

/** Cria a assinatura recorrente do estúdio. Para 1 cliente amigo, dá até para
 *  cobrar por Pix manualmente no começo e pular isto — mas já fica pronto p/ escalar. */
export async function createStudioSubscription(args: {
  tenantId: string;
  planId: string;
  ownerEmail: string;
}) {
  const plan = STUDIO_PLANS.find((p) => p.id === args.planId);
  if (!plan) throw new Error("Plano inválido");

  const preapproval = new PreApproval(client);
  const result = await preapproval.create({
    body: {
      reason: `DecalQ — Plano ${plan.label}`,
      external_reference: `${args.tenantId}:${plan.id}`,
      payer_email: args.ownerEmail,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: plan.monthly,
        currency_id: "BRL",
      },
      back_url: `${process.env.APP_URL}/billing?status=ok`,
      status: "pending",
    },
  });

  return { initPoint: result.init_point, preapprovalId: result.id };
}
