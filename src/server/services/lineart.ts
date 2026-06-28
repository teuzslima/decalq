import sharp from "sharp";

/**
 * Extrai o traço da PRÓPRIA foto (XDoG) -> linhas pretas sobre branco.
 * Agora com: normalização de contraste (pega fotos claras/pastel) e
 * sensibilidade automática (acha o limiar que rende traço suficiente).
 */
export async function extractLineArt(
  src: Buffer,
  params: Record<string, number | string> = {}
): Promise<Buffer> {
  const maxDim = 1024;
  const base = sharp(src)
    .rotate()
    .flatten({ background: "#ffffff" })
    .resize(maxDim, maxDim, { fit: "inside", withoutEnlargement: true })
    .grayscale()
    .normalise(); // estica o contraste -> funciona em fotos claras/pastel

  const { data, info } = await base.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const n = width * height;

  const gray = Buffer.alloc(n);
  for (let i = 0; i < n; i++) gray[i] = data[i * channels];

  // Blackwork: preenchimento tonal (áreas escuras viram preto sólido)
  if (params.mode === "fill") {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += gray[i];
    const mean = sum / n;
    const t = num(params.fillThreshold, Math.max(60, mean - 40));
    const out = Buffer.alloc(n);
    for (let i = 0; i < n; i++) out[i] = gray[i] < t ? 0 : 255;
    return sharp(out, { raw: { width, height, channels: 1 } }).png().toBuffer();
  }

  const s1 = num(params.s1, 0.8);
  const s2 = num(params.s2, 2.2);
  const tau = num(params.tau, 0.96);
  const thickness = num(params.thickness, 1);
  const startThr = num(params.thr, 6);

  const b1 = await sharp(gray, { raw: { width, height, channels: 1 } }).blur(s1).raw().toBuffer();
  const b2 = await sharp(gray, { raw: { width, height, channels: 1 } }).blur(s2).raw().toBuffer();

  // sensibilidade automática: baixa o limiar até ter traço suficiente
  let out = Buffer.alloc(n);
  for (const thr of [startThr, startThr * 0.6, startThr * 0.35, startThr * 0.2, startThr * 0.1, 1]) {
    let black = 0;
    for (let i = 0; i < n; i++) {
      const d = b1[i] - tau * b2[i];
      const v = d < -thr ? 0 : 255;
      out[i] = v;
      if (v === 0) black++;
    }
    if (black / n >= 0.004) break; // ~0,4% de traço já é uma linha visível
  }

  if (thickness > 1) {
    const bl = await sharp(out, { raw: { width, height, channels: 1 } })
      .blur(thickness)
      .raw()
      .toBuffer();
    const thick = Buffer.alloc(n);
    for (let i = 0; i < n; i++) thick[i] = bl[i] < 200 ? 0 : 255;
    out = thick;
  }

  return sharp(out, { raw: { width, height, channels: 1 } }).png().toBuffer();
}

function num(v: unknown, d: number): number {
  return typeof v === "number" ? v : d;
}