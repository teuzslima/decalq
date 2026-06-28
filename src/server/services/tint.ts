import sharp from "sharp";

export async function tintStencil(pngBuffer: Buffer, hex: string): Promise<Buffer> {
  const { r, g, b } = hexToRgb(hex);

  const gray = sharp(pngBuffer).flatten({ background: "#ffffff" }).grayscale();
  const { data, info } = await gray.raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const n = width * height;

  let sum = 0;
  for (let i = 0; i < n; i++) sum += data[i];
  const mean = sum / n;
  const invert = mean < 128; // fundo escuro -> inverter p/ traço escuro no branco

  const alpha = Buffer.alloc(n);
  for (let i = 0; i < n; i++) {
    let lum = data[i];
    if (invert) lum = 255 - lum;
    let a = 255 - lum;
    a = Math.max(0, Math.min(255, Math.round((a - 40) * 1.8)));
    alpha[i] = a;
  }

  const colorLayer = await sharp({
    create: { width, height, channels: 3, background: { r, g, b } },
  })
    .joinChannel(alpha, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();

  return sharp({
    create: { width, height, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .composite([{ input: colorLayer }])
    .png()
    .toBuffer();
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export const STENCIL_COLORS = [
  { key: "purple", label: "Roxo", hex: "#7C3AED" },
  { key: "blue", label: "Azul", hex: "#2563EB" },
  { key: "red", label: "Vermelho", hex: "#E5484D" },
  { key: "green", label: "Verde", hex: "#16A34A" },
  { key: "black", label: "Preto", hex: "#111111" },
];