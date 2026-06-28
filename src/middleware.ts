import { NextResponse, type NextRequest } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";

/**
 * Middleware roda na borda em toda request. Aqui só extraímos o host e
 * passamos adiante via header — a resolução do tenant (que toca o banco)
 * acontece nos Server Components / route handlers, que não rodam na edge runtime.
 *
 * Rotas /admin não são white-label: usam o domínio raiz (admin.app.com).
 */
export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const url = req.nextUrl;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-tenant-host", host);

  // Painel admin global: somente no host raiz ou subdomínio "admin".
  const isAdminHost =
    host.startsWith("admin.") || host.split(":")[0] === ROOT_DOMAIN.split(":")[0];
  if (url.pathname.startsWith("/admin") && !isAdminHost) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)"],
};
