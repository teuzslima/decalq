"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Planos do DecalQ                                                    */
/*  - precoMensal: valor cheio por mês                                  */
/*  - geracoes: franquia mensal de gerações                            */
/*  Para voltar o Estúdio a 60 gerações, troque geracoes: 75 -> 60.    */
/* ------------------------------------------------------------------ */
const PLANOS = [
  {
    id: "inicial",
    nome: "Inicial",
    precoMensal: 19.9,
    geracoes: 25,
    tagline: "Pra começar e testar com clientes reais.",
    destaque: false,
    selo: null as string | null,
    beneficios: [
      "25 gerações por mês",
      "6 estilos de stencil",
      "Export PNG, SVG e PDF",
      "Tamanho exato em centímetros",
    ],
  },
  {
    id: "estudio",
    nome: "Estúdio",
    precoMensal: 49.9,
    geracoes: 75,
    tagline: "O ideal pra um estúdio em ritmo normal.",
    destaque: true,
    selo: "Mais escolhido",
    beneficios: [
      "75 gerações por mês",
      "Tudo do plano Inicial",
      "Histórico completo por estúdio",
      "Sua marca no app (white-label)",
      "Suporte prioritário",
    ],
  },
  {
    id: "pro",
    nome: "Pro",
    precoMensal: 69.9,
    geracoes: 150,
    tagline: "Pra quem produz em alto volume.",
    destaque: false,
    selo: "Melhor custo por arte",
    beneficios: [
      "150 gerações por mês",
      "Tudo do plano Estúdio",
      "Menor preço por geração",
      "Vários artistas no mesmo estúdio",
    ],
  },
];

const brl = (n: number) => n.toFixed(2).replace(".", ",");

export default function Pricing() {
  const [anual, setAnual] = useState(false);

  return (
    <section id="planos" className="relative mx-auto max-w-6xl px-5 py-24">
      {/* Cabeçalho */}
      <div className="text-center">
        <span className="inline-block rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1 text-sm font-medium text-violet-300">
          Planos e preços
        </span>
        <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Escolha o plano do seu estúdio
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
          Sem fidelidade. Cancele quando quiser. Você só paga a mensalidade —
          a IA está inclusa.
        </p>
      </div>

      {/* Toggle mensal / anual */}
      <div className="mt-10 flex items-center justify-center gap-4">
        <span className={!anual ? "font-medium text-white" : "text-zinc-500"}>
          Mensal
        </span>
        <button
          onClick={() => setAnual((v) => !v)}
          className="relative h-7 w-14 rounded-full bg-zinc-700 transition-colors"
          aria-label="Alternar cobrança anual"
        >
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-1 h-5 w-5 rounded-full bg-violet-500"
            style={{ left: anual ? 32 : 4 }}
          />
        </button>
        <span className={anual ? "font-medium text-white" : "text-zinc-500"}>
          Anual
          <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400">
            2 meses grátis
          </span>
        </span>
      </div>

      {/* Cards */}
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {PLANOS.map((p, i) => {
          // No anual, paga 10 meses e usa 12 -> custo mensal efetivo menor
          const mensalEfetivo = anual ? (p.precoMensal * 10) / 12 : p.precoMensal;
          const totalAnual = p.precoMensal * 10;
          const economiaAnual = p.precoMensal * 2;
          const porGeracao = mensalEfetivo / p.geracoes;

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                p.destaque
                  ? "border-violet-500 bg-gradient-to-b from-violet-500/10 to-transparent shadow-[0_0_40px_-12px] shadow-violet-500/40"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              {p.selo && (
                <span
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                    p.destaque
                      ? "bg-violet-500 text-white"
                      : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {p.selo}
                </span>
              )}

              <h3 className="text-lg font-semibold text-white">{p.nome}</h3>
              <p className="mt-1 text-sm text-zinc-400">{p.tagline}</p>

              {/* Preço */}
              <div className="mt-6">
                <div className="flex items-end gap-1">
                  <span className="text-sm text-zinc-400">R$</span>
                  <span className="text-5xl font-bold tracking-tight text-white">
                    {brl(mensalEfetivo)}
                  </span>
                  <span className="mb-1 text-zinc-400">/mês</span>
                </div>
                {anual ? (
                  <p className="mt-1 text-sm text-zinc-500">
                    Cobrado R$ {brl(totalAnual)}/ano ·{" "}
                    <span className="text-emerald-400">
                      economize R$ {brl(economiaAnual)}
                    </span>
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-zinc-500">cobrança mensal</p>
                )}
              </div>

              {/* Preço por geração (explícito) */}
              <div className="mt-5 rounded-lg bg-white/5 px-4 py-3 text-center">
                <span className="text-sm text-zinc-400">Sai a </span>
                <span className="text-lg font-semibold text-violet-300">
                  R$ {brl(porGeracao)}
                </span>
                <span className="text-sm text-zinc-400"> por geração</span>
              </div>

              {/* Benefícios */}
              <ul className="mt-6 space-y-3">
                {p.beneficios.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-zinc-300">
                    <CheckIcon highlight={p.destaque} />
                    {b}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="#contato"
                className={`mt-7 block rounded-xl px-5 py-3 text-center font-semibold transition ${
                  p.destaque
                    ? "bg-violet-500 text-white hover:bg-violet-400"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                Assinar {p.nome}
              </a>
            </motion.div>
          );
        })}
      </div>

      {/* Reversão de risco */}
      <p className="mt-10 text-center text-sm text-zinc-500">
        Pagamento via Pix ou cartão · Sem taxa de adesão · Troque ou cancele
        seu plano a qualquer momento.
      </p>
    </section>
  );
}

function CheckIcon({ highlight }: { highlight: boolean }) {
  return (
    <svg
      className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
        highlight ? "text-violet-400" : "text-emerald-400"
      }`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.1 3.1 6.8-6.8a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
