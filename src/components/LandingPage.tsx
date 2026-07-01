"use client";

import { motion } from "framer-motion";
import { Space_Grotesk, Space_Mono } from "next/font/google";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

/* Wrapper de revelação ao rolar */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

const CropMarks = () => (
  <>
    <span className="pointer-events-none absolute -top-px -left-px h-3.5 w-3.5 border-t-2 border-l-2 border-[#7C3AED]" />
    <span className="pointer-events-none absolute -top-px -right-px h-3.5 w-3.5 border-t-2 border-r-2 border-[#7C3AED]" />
    <span className="pointer-events-none absolute -bottom-px -left-px h-3.5 w-3.5 border-b-2 border-l-2 border-[#7C3AED]" />
    <span className="pointer-events-none absolute -bottom-px -right-px h-3.5 w-3.5 border-b-2 border-r-2 border-[#7C3AED]" />
  </>
);

const APPS = [
  { status: "Ativo", soon: false, title: "Tatuagem",
    desc: "Foto vira stencil pronto pra calcar. Seis estilos, da linha limpa ao blackwork. Exporta em PNG, SVG e PDF no tamanho exato em centímetros.",
    icon: <><path d="M3 17l6-6 4 4 8-8" /><circle cx="9" cy="11" r="1" /></> },
  { status: "Em teste", soon: false, title: "Papel de parede",
    desc: "Foto da parede mais o papel desejado, e a IA mostra o resultado aplicado — perspectiva e luz no lugar. O cliente vê antes de comprar e decide na hora.",
    icon: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" /></> },
  { status: "Em breve", soon: true, title: "Próxima vertical",
    desc: "Estamos sempre abrindo novas frentes de transformação visual. Tem um caso no seu ramo? Fala com a gente — pode ser o próximo.",
    icon: <><path d="M12 3v18M3 12h18" /></> },
];

const STEPS = [
  { n: "01 — Envie", t: "A imagem que você tem", d: "Uma foto de tatuagem, uma parede, uma referência. Direto do celular." },
  { n: "02 — Transforme", t: "A IA faz o trabalho", d: "Em segundos, fiel ao original — sem inventar outra coisa no lugar." },
  { n: "03 — Use", t: "Baixe e aplique", d: "Pronto pra calcar, imprimir ou mostrar ao cliente. No formato e tamanho certos." },
];

const SPECS = [
  { k: "Fiel", v: "Decalca a imagem, não inventa outra" },
  { k: "No celular", v: "App instalável, onde você trabalha" },
  { k: "Sua marca", v: "Cada negócio com a própria cara" },
  { k: "Sem amarra", v: "7 dias grátis, sem fidelidade" },
];

const FAQS = [
  { q: "Funciona com qualquer foto?", a: "Funciona melhor com fotos nítidas e bem iluminadas. Quanto mais clara a imagem, mais fiel o resultado — vale escolher uma boa referência." },
  { q: "Preciso instalar algum programa?", a: "Não. É uma página web que abre no navegador e pode ser instalada no celular como um app, sem loja de aplicativos." },
  { q: "Posso usar com a marca do meu negócio?", a: "Sim. Cada cliente tem a própria identidade na ferramenta — logo, cores e domínio. Seus clientes veem a sua marca, não a nossa." },
  { q: "Tem fidelidade ou multa?", a: "Nenhuma. São 7 dias grátis pra testar e, depois, você paga mês a mês. Cancela quando quiser, sem multa." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#15151A] antialiased">
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-[#E7E5DE] bg-[#FAFAF7]/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1080px] items-center justify-between px-6">
          <div className={`${display.className} text-[1.35rem] font-bold tracking-tight`}>
            Decal<span className="text-[#7C3AED]">Q</span>
          </div>
          <div className="flex items-center gap-7">
            <a href="#aplicacoes" className="hidden text-[.92rem] text-[#6f6f78] hover:text-[#15151A] sm:block">Aplicações</a>
            <a href="#como" className="hidden text-[.92rem] text-[#6f6f78] hover:text-[#15151A] sm:block">Como funciona</a>
            <a href="#planos" className="hidden text-[.92rem] text-[#6f6f78] hover:text-[#15151A] sm:block">Planos</a>
            <a href="#planos" className="rounded-[10px] bg-[#7C3AED] px-[18px] py-2.5 text-[.92rem] font-semibold text-white transition hover:bg-[#6d28d9]">Testar grátis</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="mx-auto max-w-[1080px] px-6 pb-16 pt-[88px]">
        <Reveal><div className={`${mono.className} mb-[22px] text-[.72rem] uppercase tracking-[.12em] text-[#6f6f78]`}>Estúdio de IA &nbsp;·&nbsp; entrada → saída</div></Reveal>
        <Reveal delay={0.05}>
          <h1 className={`${display.className} max-w-[14ch] text-[clamp(2.4rem,6vw,4.2rem)] font-semibold leading-[1.04] tracking-[-.03em]`}>
            Sua imagem vira arte <span className="text-[#6f6f78]">pronta pra usar.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="my-6 max-w-[48ch] text-[1.15rem] text-[#3f3f46]">
            O DecalQ transforma uma foto no que o seu negócio precisa entregar — em segundos, fiel ao original, direto do celular. Começou com tatuagem. Não vai parar nela.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="flex flex-wrap items-center gap-3.5">
            <a href="#planos" className="rounded-[10px] bg-[#7C3AED] px-[18px] py-2.5 text-[.92rem] font-semibold text-white transition hover:bg-[#6d28d9]">Testar 7 dias grátis</a>
            <a href="#aplicacoes" className="rounded-[10px] border border-[#15151A] px-[18px] py-2.5 text-[.92rem] font-semibold transition hover:bg-[#15151A] hover:text-white">Ver aplicações</a>
          </div>
        </Reveal>
        <Reveal delay={0.2}><div className="mt-[18px] text-[.85rem] text-[#6f6f78]">Sem fidelidade · sem cartão no teste · cancela quando quiser</div></Reveal>

        {/* PAINEL ASSINATURA: antes → depois */}
        <Reveal delay={0.25}>
          <div className="relative mt-16 rounded-md border border-[#E7E5DE] bg-white p-7">
            <CropMarks />
            <div className="grid grid-cols-1 items-stretch md:grid-cols-[1fr_auto_1fr]">
              {/* ENTRADA — troque por <img> da foto real */}
              <div className="relative flex min-h-[220px] items-end rounded p-4 md:min-h-[300px]" style={{ background: "linear-gradient(135deg,#d9d6cf,#b9b4ab)" }}>
                <span className={`${mono.className} absolute left-3.5 top-3.5 text-[.72rem] uppercase tracking-[.12em] text-white`}>Entrada · foto</span>
              </div>
              <div className="flex items-center justify-center py-3 md:w-14 md:py-0">
                <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#7C3AED] text-[1.1rem] font-bold text-white">→</div>
              </div>
              {/* SAÍDA — troque por <img> do stencil real */}
              <div className="relative flex min-h-[220px] items-center justify-center rounded border border-[#E7E5DE] bg-white p-4 md:min-h-[300px]">
                <span className={`${mono.className} absolute left-3.5 top-3.5 text-[.72rem] uppercase tracking-[.12em] text-[#6f6f78]`}>Saída · decalque</span>
                <svg width="150" height="200" viewBox="0 0 150 200" fill="none" stroke="#15151A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M75 30 C 55 30, 45 50, 48 72 C 50 92, 62 104, 75 104 C 88 104, 100 92, 102 72 C 105 50, 95 30, 75 30 Z" />
                  <path d="M58 64 q 7 -8 16 -2 M76 62 q 8 -6 16 1" />
                  <path d="M75 78 l -4 12 l 8 0 Z" />
                  <path d="M64 96 q 11 8 22 0" />
                  <path d="M75 104 C 60 116, 50 140, 52 175 M75 104 C 90 116, 100 140, 98 175" />
                  <path d="M52 150 q 23 -10 46 0" />
                </svg>
              </div>
            </div>
          </div>
        </Reveal>
      </header>

      {/* APLICAÇÕES */}
      <section id="aplicacoes" className="border-t border-[#E7E5DE] py-[72px]">
        <div className="mx-auto max-w-[1080px] px-6">
          <div className="mb-10 flex flex-wrap items-baseline gap-4">
            <Reveal><h2 className={`${display.className} text-[clamp(1.7rem,3.5vw,2.4rem)] font-semibold tracking-[-.02em]`}>Uma ferramenta, vários negócios</h2></Reveal>
            <Reveal delay={0.1}><p className="max-w-[46ch] text-[#6f6f78]">A mesma IA que decalca uma tatuagem aplica um papel numa parede. Toda imagem que precisa virar entregável profissional cabe aqui.</p></Reveal>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {APPS.map((a, i) => (
              <Reveal key={a.title} delay={i * 0.08}>
                <div className="group relative h-full rounded-md border border-[#E7E5DE] bg-white p-[26px] transition hover:-translate-y-1 hover:shadow-[0_12px_30px_-18px_rgba(0,0,0,.25)]">
                  <span className={`${mono.className} float-right rounded-full px-2 py-[3px] text-[.62rem] tracking-[.1em] ${a.soon ? "bg-[#f4f4f5] text-[#6f6f78]" : "bg-[#F2ECFF] text-[#7C3AED]"}`}>{a.status}</span>
                  <svg className="mb-[18px] h-10 w-10 text-[#7C3AED]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">{a.icon}</svg>
                  <h3 className={`${display.className} mb-2 text-[1.25rem] font-semibold`}>{a.title}</h3>
                  <p className="text-[.95rem] text-[#52525b]">{a.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como" className="border-t border-[#E7E5DE] py-[72px]">
        <div className="mx-auto max-w-[1080px] px-6">
          <Reveal><h2 className={`${display.className} mb-10 text-[clamp(1.7rem,3.5vw,2.4rem)] font-semibold tracking-[-.02em]`}>Como funciona</h2></Reveal>
          <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <div>
                  <span className={`${mono.className} mb-3.5 inline-block border-t-2 border-[#7C3AED] pt-2.5 text-[.8rem] text-[#7C3AED]`}>{s.n}</span>
                  <h3 className={`${display.className} mb-1.5 text-[1.15rem] font-semibold`}>{s.t}</h3>
                  <p className="text-[.96rem] text-[#52525b]">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* POR QUE */}
      <section className="border-t border-[#E7E5DE] py-[72px]">
        <div className="mx-auto max-w-[1080px] px-6">
          <Reveal><h2 className={`${display.className} mb-10 text-[clamp(1.7rem,3.5vw,2.4rem)] font-semibold tracking-[-.02em]`}>Por que DecalQ</h2></Reveal>
          <Reveal delay={0.1}>
            <div className="grid grid-cols-1 overflow-hidden rounded-md border border-[#E7E5DE] bg-white sm:grid-cols-2">
              {SPECS.map((s, i) => (
                <div key={s.k} className={`p-[26px] ${i % 2 === 0 ? "sm:border-r" : ""} ${i < SPECS.length - 2 ? "border-b" : ""} border-[#E7E5DE]`}>
                  <div className={`${mono.className} mb-2 text-[.72rem] uppercase tracking-[.12em] text-[#6f6f78]`}>{s.k}</div>
                  <div className={`${display.className} text-[1.1rem] font-medium`}>{s.v}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="border-t border-[#E7E5DE] py-[72px]">
        <div className="mx-auto max-w-[1080px] px-6">
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-6 rounded-[10px] bg-[#15151A] p-11 text-white">
              <div>
                <div className={`${mono.className} mb-2.5 text-[.72rem] uppercase tracking-[.12em] text-[#a78bfa]`}>Planos</div>
                <h2 className={`${display.className} text-[clamp(1.7rem,3.5vw,2.4rem)] font-semibold tracking-[-.02em] text-white`}>Comece grátis. Pague só se valer.</h2>
                <p className="mt-2 text-[#a1a1aa]">Planos a partir de R$ 19,90/mês · 7 dias grátis · sem fidelidade.</p>
              </div>
              <div className="text-right">
                <div className={`${display.className} text-[2.2rem] font-bold`}>R$ 19,90<small className="text-[1rem] font-normal text-[#a1a1aa]">/mês</small></div>
                <a href="#" className="mt-3.5 inline-block rounded-[10px] bg-[#7C3AED] px-[18px] py-2.5 text-[.92rem] font-semibold text-white transition hover:bg-[#6d28d9]">Ver planos</a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-[#E7E5DE] py-[72px]">
        <div className="mx-auto max-w-[1080px] px-6">
          <Reveal><h2 className={`${display.className} mb-10 text-[clamp(1.7rem,3.5vw,2.4rem)] font-semibold tracking-[-.02em]`}>Perguntas frequentes</h2></Reveal>
          <Reveal delay={0.1}>
            <div>
              {FAQS.map((f) => (
                <details key={f.q} className="group cursor-pointer border-b border-[#E7E5DE] py-[18px]">
                  <summary className={`${display.className} flex list-none items-center justify-between text-[1.08rem] font-medium [&::-webkit-details-marker]:hidden`}>
                    {f.q}
                    <span className="text-[1.4rem] text-[#7C3AED] group-open:hidden">+</span>
                    <span className="hidden text-[1.4rem] text-[#7C3AED] group-open:inline">–</span>
                  </summary>
                  <p className="mt-3 max-w-[60ch] text-[#52525b]">{f.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA FINAL */}
      <div className="px-6 py-[88px] text-center">
        <Reveal><h2 className={`${display.className} mb-3.5 text-[clamp(1.9rem,4vw,2.6rem)] font-semibold`}>Transforme sua primeira imagem hoje.</h2></Reveal>
        <Reveal delay={0.05}><p className="mb-7 text-[#6f6f78]">Grátis por 7 dias. Sem cartão, sem compromisso.</p></Reveal>
        <Reveal delay={0.1}><a href="#" className="inline-block rounded-[10px] bg-[#7C3AED] px-7 py-3.5 text-[1rem] font-semibold text-white transition hover:bg-[#6d28d9]">Começar agora</a></Reveal>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-[#E7E5DE] py-10 text-[.88rem] text-[#6f6f78]">
        <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-3 px-6">
          <div className={`${display.className} text-[1.1rem] font-bold text-[#15151A]`}>Decal<span className="text-[#7C3AED]">Q</span></div>
          <div>decalq.site · feito em Aracaju</div>
          <div className={`${mono.className} text-[.72rem]`}>© 2026</div>
        </div>
      </footer>
    </div>
  );
}
