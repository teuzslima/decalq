import sharp from "sharp";
import { PDFDocument } from "pdf-lib";

// Decalque precisa imprimir no tamanho físico correto. O tatuador define a
// largura/altura em cm; convertemos para pixels no DPI alvo (300 = impressão).
const DPI = 300;
const CM_PER_INCH = 2.54;

function cmToPx(cm: number, dpi = DPI) {
  return Math.round((cm / CM_PER_INCH) * dpi);
}

/** PNG redimensionado para o tamanho físico desejado, com metadados de DPI. */
export async function exportPng(
  source: Buffer,
  sizeCm: { w: number; h: number }
): Promise<Buffer> {
  const width = cmToPx(sizeCm.w);
  const height = cmToPx(sizeCm.h);
  return sharp(source)
    .resize(width, height, { fit: "contain", background: "#ffffff" })
    .withMetadata({ density: DPI })
    .png()
    .toBuffer();
}

/**
 * SVG: embute o PNG já dimensionado em fisicamente cm. Não é uma vetorização
 * de traço real (isso exige potrace/autotrace — ver nota). Para vetorização
 * verdadeira do contorno, rode potrace sobre o PNG em P&B; aqui entregamos um
 * SVG com dimensões físicas corretas, suficiente para o MVP de impressão.
 */
export async function exportSvg(
  pngBuffer: Buffer,
  sizeCm: { w: number; h: number }
): Promise<Buffer> {
  const b64 = pngBuffer.toString("base64");
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${sizeCm.w}cm" height="${sizeCm.h}cm"
     viewBox="0 0 ${sizeCm.w} ${sizeCm.h}">
  <image href="data:image/png;base64,${b64}" width="${sizeCm.w}" height="${sizeCm.h}" />
</svg>`;
  return Buffer.from(svg, "utf-8");
}

/** PDF no tamanho físico exato (em pontos: 1cm = 28.3465pt) para impressão. */
export async function exportPdf(
  pngBuffer: Buffer,
  sizeCm: { w: number; h: number }
): Promise<Buffer> {
  const PT_PER_CM = 28.3465;
  const wPt = sizeCm.w * PT_PER_CM;
  const hPt = sizeCm.h * PT_PER_CM;

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([wPt, hPt]);
  const png = await pdf.embedPng(pngBuffer);
  page.drawImage(png, { x: 0, y: 0, width: wPt, height: hPt });

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
