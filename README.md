# DecalQ — Gerador de stencils (PWA) para o Júnior Tattoo

Ferramenta white-label de decalques de tatuagem com IA. Começa com **um estúdio**
(Júnior Tattoo), mas a base é **multi-tenant** — pronta para vender a outros estúdios
sem reescrever.

## Modelo de negócio (decidido)

- **Plataforma (PWA web instalável)** — sem App Store, sem comissão de 15–30%.
  Roda em iPhone, Android, iPad e desktop com um código só.
- **Estúdio paga mensalidade** à plataforma (você). Os **artistas geram livre**
  dentro de uma **franquia mensal** (plano do Júnior: 60 gerações/mês por R$ 49,90).
- O "crédito" não é paywall de cliente: é **medidor de uso** que protege seu
  custo de IA. Cada estilo consome unidades conforme o custo de GPU
  No MVP está achatado: 1 geração = 1 crédito (peso por estilo fica para estúdios de alto volume).

## Stack

Next.js 14 (App Router) · PostgreSQL + Prisma (multi-tenant via tenant_id + RLS) ·
Supabase Auth · Replicate (SDXL+ControlNet) + OpenAI (lettering) · Cloudflare R2 ·
Mercado Pago (mensalidade B2B) · Vercel (serverless). PWA com manifest + service worker.

## Funcionalidades

- 6 estilos: Outline, Standard, Hatching, Fine Line, Blackwork, Lettering
- **Cor de transferência** do stencil (roxo/azul/vermelho/verde/preto) — pós-processo barato, não é nova geração
- **Antes/depois** ("segure para ver o original")
- Tamanho em cm → export PNG/SVG/PDF no tamanho físico (300 DPI)
- Histórico por estúdio · Papéis: dono (vê uso, plano, equipe) vs artista (gera)
- Painel de **uso mensal** (dono) e **admin global** (você)

## Setup

```bash
npm install
cp .env.example .env          # preencha as chaves
npm run db:push               # cria as tabelas
psql "$DATABASE_URL" -f prisma/rls.sql   # ativa Row-Level Security
npm run db:seed               # estilos globais + Júnior Tattoo + franquia

npm run dev
```

Acesse `http://junior.localhost:3000` (adicione `127.0.0.1 junior.localhost` ao
`/etc/hosts`). Admin global: `http://localhost:3000/admin`.

### Vincular o primeiro usuário (dono)

1. Crie o e-mail do Júnior no Supabase Auth (painel ou tela /login → cadastrar).
2. Pegue o `auth_id` (uuid do usuário no Supabase) e insira o User dono:

```sql
INSERT INTO users (id, "tenantId", "authId", email, name, role, "createdAt")
SELECT gen_random_uuid()::text, t.id, '<AUTH_UUID>', 'junior@estudio.com', 'Júnior', 'owner', now()
FROM tenants t WHERE t.slug = 'junior';
```

Artistas: mesmo INSERT com `role = 'artist'`.

## Personalizar a marca do Júnior

No seed (`prisma/seed.ts`) ou via SQL, ajuste `tenants.theme`:
`{ "primary": "<cor>", "logoUrl": "<url da logo no R2>", "defaultColor": "<cor de stencil>" }`.
**Envie a logo + as cores de marca** para finalizar.

## Estrutura

```
prisma/        schema.prisma · rls.sql · seed.ts (Júnior + estilos)
src/server/
  db.ts        prisma + withTenant (RLS por transação)
  tenant.ts    host -> tenant
  ai/          adaptadores Replicate / OpenAI (interface única)
  services/
    usage.ts        franquia mensal, consumo/reembolso, reset lazy
    generation.ts   orquestra estilo + franquia + IA + tint
    tint.ts         recolore o traço P&B para a cor escolhida
    export.ts       PNG/SVG/PDF no tamanho físico (cm -> DPI)
    storage.ts      R2 (S3 API)
  payments/billing.ts   assinatura mensal do estúdio (B2B)
src/app/
  generate/ history/ usage/ billing/ settings/ dashboard/ login/
  admin/     painel global
  api/       generations, upload, export, webhooks/replicate
public/      manifest.webmanifest · sw.js (PWA)
```

## Pendências antes de produção

- Ícones da PWA (`public/icon-192.png`, `icon-512.png`) — usar a logo do Júnior
- Validar assinatura dos webhooks (Replicate)
- Vetorização real (potrace) para SVG editável
- Cron opcional para reset de franquia (hoje é lazy, suficiente p/ MVP)
