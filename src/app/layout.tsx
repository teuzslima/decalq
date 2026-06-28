import "./globals.css";
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { resolveTenantByHost } from "@/server/tenant";
import PwaRegister from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "Júnior Tattoo — Stencils",
  description: "Gerador de decalques de tatuagem com IA",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Stencils" },
};

export const viewport: Viewport = {
  themeColor: "#7C3AED",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const host = headers().get("x-tenant-host") ?? headers().get("host");
  const tenant = await resolveTenantByHost(host);
  const theme = (tenant?.theme ?? {}) as Record<string, string>;

  const styleVars = {
    "--brand": theme.primary ?? "#ffffff",
    "--brand-fg": theme.brandFg ?? "#111111",
    "--ink": theme.ink ?? "#f4f4f5",
    "--surface": theme.surface ?? "#161618",
    "--bg": theme.bg ?? "#0b0b0c",
  } as React.CSSProperties;

  return (
    <html lang="pt-BR">
      <body style={styleVars}>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
