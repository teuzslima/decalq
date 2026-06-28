"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function Section({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function FadeUp({ children, className = "", delay = 0, style }: { children: React.ReactNode; className?: string; delay?: number; style?: React.CSSProperties }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] } } }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

const STYLES = [
  { name: "Outline", desc: "Linhas limpas e precisas", icon: "⬡", color: "#a78bfa" },
  { name: "Standard", desc: "Equilíbrio clássico", icon: "◈", color: "#818cf8" },
  { name: "Hatching", desc: "Hachurado expressivo", icon: "▦", color: "#60a5fa" },
  { name: "Fine Line", desc: "Delicadeza e detalhe", icon: "◇", color: "#34d399" },
  { name: "Blackwork", desc: "Impacto em preto total", icon: "◼", color: "#f472b6" },
  { name: "Lettering", desc: "Tipografia via IA", icon: "Aa", color: "#fb923c" },
];

const STEPS = [
  { n: "01", title: "Envie a referência", desc: "Foto, desenho ou imagem — qualquer arquivo funciona." },
  { n: "02", title: "Escolha o estilo", desc: "6 estilos de stencil. Mude a cor de transferência com um clique." },
  { n: "03", title: "Baixe e tatue", desc: "PNG, SVG ou PDF no tamanho físico exato em 300 DPI." },
];

const FAQS = [
  { q: "O stencil já vem no tamanho real?", a: "Sim. Você informa as dimensões em cm e o export sai calibrado em 300 DPI para imprimir e transferir direto." },
  { q: "Precisa de papel de decalque especial?", a: "Não. Use o papel termográfico de sempre. O stencil é exportado pronto para impressão." },
  { q: "Quantas gerações tenho por mês?", a: "O plano atual inclui 60 gerações/mês por estúdio. Artistas compartilham essa franquia." },
  { q: "Funciona no iPhone e Android?", a: "Sim. É uma PWA — instala direto pelo navegador, sem App Store, sem comissão de 30%." },
  { q: "Posso usar para clientes do meu estúdio?", a: "Os stencils gerados são do estúdio. Você pode mostrar opções ao cliente, imprimir e usar normalmente." },
];

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ background: "#0b0b0c", color: "#f4f4f5", fontFamily: "system-ui, sans-serif", overflowX: "hidden" }}>

      {/* NAV */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 2rem", height: "64px",
          background: "rgba(11,11,12,0.85)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #7C3AED, #4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700, color: "#fff",
          }}>D</div>
          <span style={{ fontWeight: 600, fontSize: 18, color: "#f4f4f5" }}>DecalQ</span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="#como-funciona" style={{ color: "#a1a1aa", fontSize: 14, textDecoration: "none", padding: "6px 12px" }}
            className="hover:text-white">Como funciona</a>
          <a href="#estilos" style={{ color: "#a1a1aa", fontSize: 14, textDecoration: "none", padding: "6px 12px" }}>Estilos</a>
          <a href="#plano" style={{ color: "#a1a1aa", fontSize: 14, textDecoration: "none", padding: "6px 12px" }}>Plano</a>
          <a href="/login" style={{
            background: "#7C3AED", color: "#fff", fontSize: 14, fontWeight: 500,
            textDecoration: "none", padding: "8px 20px", borderRadius: 8,
          }}>Entrar</a>
        </div>
      </motion.nav>

      {/* HERO */}
      <section ref={heroRef} style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "64px", overflow: "hidden" }}>
        {/* Background glow */}
        <motion.div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{
            position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
            width: 600, height: 600, borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 70%)",
          }} />
        </motion.div>

        <motion.div style={{ y: heroY, opacity: heroOpacity, textAlign: "center", maxWidth: 720, padding: "0 2rem", position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)",
              borderRadius: 100, padding: "6px 16px", marginBottom: "2rem",
              fontSize: 13, color: "#a78bfa",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7C3AED", display: "inline-block" }} />
            IA para estúdios de tatuagem
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: "1.5rem", letterSpacing: "-0.02em" }}
          >
            Stencils de tatuagem{" "}
            <span style={{ background: "linear-gradient(135deg, #7C3AED, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              gerados por IA
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            style={{ fontSize: "1.2rem", color: "#a1a1aa", lineHeight: 1.7, marginBottom: "2.5rem", maxWidth: 560, margin: "0 auto 2.5rem" }}
          >
            Da foto ao decalque em segundos. 6 estilos artísticos, export em tamanho físico real, sem App Store.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
            style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}
          >
            <a href="/login" style={{
              background: "#7C3AED", color: "#fff", fontSize: 16, fontWeight: 600,
              textDecoration: "none", padding: "14px 32px", borderRadius: 10,
              display: "inline-flex", alignItems: "center", gap: 8,
              transition: "transform 0.15s, box-shadow 0.15s",
              boxShadow: "0 0 24px rgba(124,58,237,0.4)",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 36px rgba(124,58,237,0.5)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(124,58,237,0.4)"; }}
            >
              Começar grátis →
            </a>
            <a href="#como-funciona" style={{
              background: "rgba(255,255,255,0.05)", color: "#f4f4f5", fontSize: 16, fontWeight: 500,
              textDecoration: "none", padding: "14px 28px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
            }}>
              Ver como funciona
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            style={{ display: "flex", gap: "2rem", justifyContent: "center", marginTop: "3.5rem", flexWrap: "wrap" }}
          >
            {[
              { v: "6", l: "estilos artísticos" },
              { v: "300 DPI", l: "export físico" },
              { v: "PWA", l: "sem App Store" },
            ].map(s => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f4f4f5" }}>{s.v}</div>
                <div style={{ fontSize: 13, color: "#71717a", marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          style={{ position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)" }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            style={{ width: 1, height: 40, background: "linear-gradient(to bottom, rgba(124,58,237,0.6), transparent)", margin: "0 auto" }}
          />
        </motion.div>
      </section>

      {/* DEMO MOCKUP */}
      <Section style={{ padding: "4rem 2rem", maxWidth: 900, margin: "0 auto" }}>
        <FadeUp>
          <div style={{
            background: "#161618", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20, overflow: "hidden",
            boxShadow: "0 0 80px rgba(124,58,237,0.12), 0 40px 80px rgba(0,0,0,0.4)",
          }}>
            {/* Browser bar */}
            <div style={{ background: "#111113", padding: "12px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#eab308" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#22c55e" }} />
              <div style={{ flex: 1, background: "#1e1e20", borderRadius: 6, padding: "5px 12px", fontSize: 12, color: "#71717a", marginLeft: 8 }}>
                decalq.site/generate
              </div>
            </div>
            {/* App mockup */}
            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", minHeight: 360 }}>
              <div style={{ borderRight: "1px solid rgba(255,255,255,0.06)", padding: "1.5rem" }}>
                <div style={{ fontSize: 12, color: "#71717a", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Configurar stencil</div>
                {["Outline", "Fine Line", "Blackwork"].map((s, i) => (
                  <motion.div
                    key={s}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                    style={{
                      padding: "10px 12px", borderRadius: 8, marginBottom: 6, cursor: "pointer",
                      background: i === 0 ? "rgba(124,58,237,0.2)" : "transparent",
                      border: i === 0 ? "1px solid rgba(124,58,237,0.4)" : "1px solid transparent",
                      fontSize: 14, color: i === 0 ? "#a78bfa" : "#a1a1aa",
                    }}
                  >{s}</motion.div>
                ))}
                <div style={{ marginTop: "1.5rem" }}>
                  <div style={{ fontSize: 12, color: "#71717a", marginBottom: 8 }}>Cor de transferência</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["#7C3AED", "#3b82f6", "#ef4444", "#22c55e"].map((c, i) => (
                      <div key={c} style={{ width: 24, height: 24, borderRadius: "50%", background: c, border: i === 0 ? "2px solid #fff" : "2px solid transparent" }} />
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ padding: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    style={{ fontSize: 64, marginBottom: "1rem" }}
                  >🌸</motion.div>
                  <div style={{ fontSize: 14, color: "#71717a" }}>Stencil gerado • Outline</div>
                  <div style={{ marginTop: "1rem", display: "flex", gap: 8, justifyContent: "center" }}>
                    {["PNG", "SVG", "PDF"].map(f => (
                      <div key={f} style={{
                        padding: "4px 12px", borderRadius: 6, fontSize: 12,
                        background: "rgba(124,58,237,0.12)", color: "#a78bfa",
                        border: "1px solid rgba(124,58,237,0.2)",
                      }}>{f}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeUp>
      </Section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" style={{ padding: "6rem 2rem" }}>
        <Section style={{ maxWidth: 900, margin: "0 auto" }}>
          <FadeUp style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div style={{ fontSize: 13, color: "#a78bfa", fontWeight: 500, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Simples assim
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Do upload ao stencil em 3 passos
            </h2>
          </FadeUp>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
            {STEPS.map((step, i) => (
              <FadeUp key={step.n} delay={i * 0.12}>
                <motion.div
                  whileHover={{ y: -4, borderColor: "rgba(124,58,237,0.4)" }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: "#161618", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 16, padding: "2rem",
                  }}
                >
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: "#7C3AED",
                    marginBottom: "1rem", fontFamily: "monospace",
                  }}>{step.n}</div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 8 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: "#71717a", lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </Section>
      </section>

      {/* ESTILOS */}
      <section id="estilos" style={{ padding: "6rem 2rem", background: "#0d0d0f" }}>
        <Section style={{ maxWidth: 1000, margin: "0 auto" }}>
          <FadeUp style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div style={{ fontSize: 13, color: "#a78bfa", fontWeight: 500, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              6 estilos disponíveis
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Para cada traço, um estilo
            </h2>
          </FadeUp>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
            {STYLES.map((style, i) => (
              <FadeUp key={style.name} delay={i * 0.08}>
                <motion.div
                  whileHover={{ scale: 1.04, y: -4 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: "#161618", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14, padding: "1.5rem 1rem", textAlign: "center", cursor: "default",
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 12, filter: `drop-shadow(0 0 12px ${style.color}60)` }}>
                    {style.icon}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: style.color }}>{style.name}</div>
                  <div style={{ fontSize: 12, color: "#71717a", lineHeight: 1.4 }}>{style.desc}</div>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </Section>
      </section>

      {/* PRICING */}
      <section id="plano" style={{ padding: "6rem 2rem" }}>
        <Section style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
          <FadeUp style={{ marginBottom: "3rem" }}>
            <div style={{ fontSize: 13, color: "#a78bfa", fontWeight: 500, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Sem surpresas
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Um plano, para o seu estúdio
            </h2>
          </FadeUp>

          <FadeUp delay={0.1}>
            <motion.div
              whileHover={{ boxShadow: "0 0 60px rgba(124,58,237,0.2)" }}
              style={{
                background: "#161618", border: "1px solid rgba(124,58,237,0.3)",
                borderRadius: 20, padding: "2.5rem", position: "relative", overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute", top: 0, right: 0, left: 0, height: 2,
                background: "linear-gradient(90deg, #7C3AED, #60a5fa)",
              }} />
              <div style={{
                display: "inline-block", background: "rgba(124,58,237,0.15)", color: "#a78bfa",
                fontSize: 12, fontWeight: 600, padding: "4px 14px", borderRadius: 100,
                marginBottom: "1.5rem", border: "1px solid rgba(124,58,237,0.25)",
              }}>
                MVP — Plano Estúdio
              </div>
              <div style={{ marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "3rem", fontWeight: 700, letterSpacing: "-0.03em" }}>R$&nbsp;49</span>
                <span style={{ fontSize: "1.5rem", fontWeight: 500, color: "#a1a1aa" }}>,90</span>
                <span style={{ fontSize: 14, color: "#71717a", marginLeft: 6 }}>/mês</span>
              </div>
              <p style={{ color: "#71717a", fontSize: 14, marginBottom: "2rem" }}>por estúdio · artistas ilimitados</p>

              <div style={{ textAlign: "left", marginBottom: "2rem" }}>
                {[
                  "60 gerações por mês",
                  "6 estilos artísticos",
                  "Export PNG, SVG e PDF",
                  "Tamanho físico em cm (300 DPI)",
                  "Histórico por estúdio",
                  "PWA — instala sem App Store",
                  "Papéis dono e artista",
                ].map(feat => (
                  <div key={feat} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 14 }}>
                    <span style={{ color: "#7C3AED", fontSize: 16 }}>✓</span>
                    <span style={{ color: "#d4d4d8" }}>{feat}</span>
                  </div>
                ))}
              </div>

              <a href="/login" style={{
                display: "block", textAlign: "center",
                background: "#7C3AED", color: "#fff", textDecoration: "none",
                padding: "14px", borderRadius: 10, fontWeight: 600, fontSize: 15,
                boxShadow: "0 0 24px rgba(124,58,237,0.35)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
              >
                Começar agora
              </a>
            </motion.div>
          </FadeUp>
        </Section>
      </section>

      {/* FAQ */}
      <section style={{ padding: "6rem 2rem", background: "#0d0d0f" }}>
        <Section style={{ maxWidth: 680, margin: "0 auto" }}>
          <FadeUp style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Perguntas frequentes
            </h2>
          </FadeUp>

          <div>
            {FAQS.map((faq, i) => (
              <FadeUp key={i} delay={i * 0.06}>
                <div
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: "100%", textAlign: "left", padding: "1.25rem 0",
                      background: "none", border: "none", cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      color: "#f4f4f5", fontSize: 15, fontWeight: 500,
                    }}
                  >
                    {faq.q}
                    <motion.span
                      animate={{ rotate: openFaq === i ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ fontSize: 20, color: "#7C3AED", flexShrink: 0, marginLeft: 12 }}
                    >+</motion.span>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <p style={{ padding: "0 0 1.25rem", color: "#71717a", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeUp>
            ))}
          </div>
        </Section>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: "8rem 2rem" }}>
        <Section style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <FadeUp>
            <motion.div
              style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(96,165,250,0.08))",
                border: "1px solid rgba(124,58,237,0.2)",
                borderRadius: 24, padding: "4rem 3rem",
                position: "relative", overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                width: 400, height: 400, borderRadius: "50%",
                background: "radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />
              <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "1rem", position: "relative" }}>
                Pronto para gerar seu primeiro stencil?
              </h2>
              <p style={{ color: "#71717a", fontSize: 15, lineHeight: 1.6, marginBottom: "2rem", position: "relative" }}>
                Instale como app, gere stencils com IA e leve o fluxo do seu estúdio para outro nível.
              </p>
              <a href="/login" style={{
                display: "inline-block",
                background: "#7C3AED", color: "#fff", textDecoration: "none",
                padding: "14px 36px", borderRadius: 10, fontWeight: 600, fontSize: 16,
                boxShadow: "0 0 32px rgba(124,58,237,0.4)",
                position: "relative",
              }}>
                Começar agora →
              </a>
            </motion.div>
          </FadeUp>
        </Section>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "2.5rem 2rem", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: "1rem" }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "linear-gradient(135deg, #7C3AED, #4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#fff",
          }}>D</div>
          <span style={{ fontWeight: 600, fontSize: 16, color: "#f4f4f5" }}>DecalQ</span>
        </div>
        <p style={{ fontSize: 13, color: "#52525b", margin: 0 }}>
          © {new Date().getFullYear()} DecalQ · Stencils com IA para estúdios de tatuagem
        </p>
      </footer>
    </div>
  );
}
