"use client";

import { useState, useRef, useEffect } from "react";

type Style = {
  id: string; key: string; label: string;
  description: string; costUnits: number; etaSeconds: number;
};

const COLORS = [
  { key: "purple", label: "Roxo", hex: "#7C3AED" },
  { key: "blue", label: "Azul", hex: "#2563EB" },
  { key: "red", label: "Vermelho", hex: "#E5484D" },
  { key: "green", label: "Verde", hex: "#16A34A" },
  { key: "black", label: "Preto", hex: "#111111" },
];

export default function GeneratorClient({
  styles, defaultColor,
}: { styles: Style[]; defaultColor: string }) {
  const [styleId, setStyleId] = useState(styles[0]?.id ?? "");
  const [color, setColor] = useState(defaultColor);
  const [sourceImageId, setSourceImageId] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [w, setW] = useState(10);
  const [h, setH] = useState(10);
  const [status, setStatus] = useState<"idle" | "uploading" | "generating" | "done" | "error">("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [genId, setGenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedStyle = styles.find((s) => s.id === styleId);
  const isLettering = selectedStyle?.key === "lettering";

  async function handleUpload(file: File) {
    setStatus("uploading");
    setPreview(URL.createObjectURL(file));
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (res.ok) { setSourceImageId(data.sourceImageId); setStatus("idle"); }
    else { setError(data.error); setStatus("error"); }
  }

  async function handleGenerate() {
    setError(null); setResultUrl(null); setStatus("generating");
    const res = await fetch("/api/generations", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        styleId, color,
        sourceImageId: isLettering ? undefined : sourceImageId,
        text: isLettering ? text : undefined,
        sizeCm: { w, h },
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Falha ao gerar"); setStatus("error"); return; }
    setGenId(data.generationId);
  }

  useEffect(() => {
    if (!genId || status !== "generating") return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/generations/${genId}`);
      const data = await res.json();
      if (data.status === "done") {
        setResultUrl(data.resultUrl); setOriginalUrl(data.originalUrl);
        setStatus("done"); clearInterval(interval);
      } else if (data.status === "failed") {
        setError(data.error ?? "Geração falhou"); setStatus("error"); clearInterval(interval);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [genId, status]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl">Criar stencil</h2>
          <p className="text-sm text-ink/60">
            {isLettering ? "Digite a frase, escolha cor e tamanho." : "Envie a referência, escolha estilo, cor e tamanho."}
          </p>
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-wide text-ink/50">Estilo</label>
          <div className="space-y-2">
            {styles.map((s) => (
              <button key={s.id} onClick={() => setStyleId(s.id)}
                className={`flex w-full items-start justify-between rounded-lg border p-3 text-left transition ${
                  styleId === s.id ? "border-brand bg-brand/10" : "border-white/10 hover:border-white/30"
                }`}>
                <div>
                  <div className="font-medium">{s.label}</div>
                  <div className="text-xs text-ink/50">{s.description}</div>
                </div>
                <div className="ml-3 shrink-0 text-right text-xs text-ink/50">
                  <div>{(s.costUnits / 100).toLocaleString("pt-BR")} créd.</div>
                  <div>~{s.etaSeconds}s</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-wide text-ink/50">Cor do stencil</label>
          <div className="flex gap-3">
            {COLORS.map((c) => (
              <button key={c.key} onClick={() => setColor(c.hex)} title={c.label}
                className={`h-9 w-9 rounded-full border-2 ${color === c.hex ? "border-white" : "border-transparent"}`}
                style={{ background: c.hex }} aria-label={c.label} />
            ))}
          </div>
        </div>

        {isLettering ? (
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wide text-ink/50">Frase</label>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="ex.: carpe diem"
              className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2" />
          </div>
        ) : (
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wide text-ink/50">Referência</label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            <button onClick={() => fileRef.current?.click()}
              className="flex h-40 w-full items-center justify-center rounded-lg border border-dashed border-white/20 text-sm text-ink/50 hover:border-white/40">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="h-full w-full rounded-lg object-contain" />
              ) : status === "uploading" ? "Enviando…" : "Enviar imagem (PNG, JPG, WEBP)"}
            </button>
          </div>
        )}

        <div>
          <label className="mb-2 block text-xs uppercase tracking-wide text-ink/50">Tamanho de impressão (cm)</label>
          <div className="flex items-center gap-3">
            <input type="number" min={1} value={w} onChange={(e) => setW(Number(e.target.value))}
              className="w-20 rounded-lg border border-white/10 bg-surface px-3 py-2" />
            <span className="text-ink/40">×</span>
            <input type="number" min={1} value={h} onChange={(e) => setH(Number(e.target.value))}
              className="w-20 rounded-lg border border-white/10 bg-surface px-3 py-2" />
            <span className="text-sm text-ink/50">largura × altura</span>
          </div>
        </div>

        <button onClick={handleGenerate}
          disabled={status === "generating" || (!sourceImageId && !isLettering) || (isLettering && !text)}
          className="w-full rounded-lg bg-brand py-3 font-medium text-brand-fg disabled:opacity-40">
          {status === "generating" ? "Gerando stencil…" : "Gerar stencil"}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </section>

      <section className="space-y-4">
        <h3 className="font-display text-lg">Resultado</h3>
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white">
          {resultUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={showOriginal && originalUrl ? originalUrl : resultUrl}
              alt="Stencil" className="h-full w-full object-contain p-4" />
          ) : status === "generating" ? (
            <span className="animate-pulse text-sm text-black/40">Processando na IA…</span>
          ) : (
            <span className="text-sm text-black/30">O stencil aparecerá aqui</span>
          )}
          {resultUrl && originalUrl && (
            <button
              onMouseDown={() => setShowOriginal(true)} onMouseUp={() => setShowOriginal(false)}
              onMouseLeave={() => setShowOriginal(false)}
              onTouchStart={() => setShowOriginal(true)} onTouchEnd={() => setShowOriginal(false)}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-brand/90 px-4 py-1.5 text-xs font-medium text-brand-fg">
              Segure para ver o original
            </button>
          )}
        </div>

        {status === "done" && genId && (
          <div className="flex gap-2">
            {(["png", "svg", "pdf"] as const).map((fmt) => (
              <a key={fmt} href={`/api/export/${genId}?format=${fmt}`}
                className="flex-1 rounded-lg border border-white/15 py-2 text-center text-sm hover:border-brand">
                {fmt.toUpperCase()}
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
