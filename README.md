<div align="center">

# 🖋️ DecalQ — Gerador de stencils de tatuagem com IA (PWA SaaS)

**Plataforma white-label multi-tenant para estúdios gerarem decalques de tatuagem com IA**
*Multi-tenant white-label PWA for tattoo studios to generate AI stencils*

![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-RLS-4169E1?logo=postgresql&logoColor=white)
![Replicate](https://img.shields.io/badge/Replicate-SDXL_+_ControlNet-000000)
![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white)

[**Português**](#-português) · [**English**](#-english)

</div>

---

## 🇧🇷 Português

### Sobre

**DecalQ** é uma **PWA SaaS multi-tenant** que gera *stencils* (decalques) de tatuagem a partir
de imagens, usando IA. É **white-label**: nasce com um estúdio, mas a base já é multi-tenant
(isolamento por `tenantId` + **Row-Level Security** no PostgreSQL), pronta para vender a outros
estúdios sem reescrever. Cada estúdio tem uma **franquia mensal de gerações**; o consumo é
medido para proteger o custo de GPU.

### Funcionalidades

- 🎨 **6 estilos** de stencil: Outline, Standard, Hatching, Fine Line, Blackwork, Lettering
- 🖌️ **Cor de transferência** do traço (roxo/azul/vermelho/verde/preto) — pós-processo, não é nova geração
- 🔁 **Antes/depois** ("segure para ver o original")
- 📐 **Tamanho em cm → export PNG/SVG/PDF** no tamanho físico (300 DPI)
- 🏢 **Multi-tenant** com papéis: **dono** (uso, plano, equipe) e **artista** (gera)
- 📊 **Painel de uso mensal** por estúdio e **admin global**
- 💳 **Assinatura B2B** (Mercado Pago) — o estúdio paga mensalidade; artistas geram livre dentro da franquia
- 📱 **PWA instalável** (iPhone, Android, iPad, desktop) com manifest + service worker

### Stack & arquitetura

**Next.js 14 (App Router)** · **TypeScript** · **Tailwind** · **PostgreSQL + Prisma**
(multi-tenant por `tenantId` + **RLS** por transação) · **Supabase Auth** · **Replicate**
(SDXL + ControlNet) + **OpenAI** (lettering) · **Cloudflare R2** (S3 API) · **Inngest** (jobs) ·
**Sharp** / **pdf-lib** (processamento de imagem e export) · **Mercado Pago** · **Vercel**.

```
src/server/
  db.ts         prisma + withTenant (RLS por transação)
  tenant.ts     host -> tenant
  ai/           adaptadores Replicate / OpenAI (interface única)
  services/     usage (franquia) · generation (orquestra IA) · tint · export · storage
  payments/     billing (assinatura mensal do estúdio)
src/app/        generate · history · usage · billing · settings · dashboard · admin · api
prisma/         schema.prisma · rls.sql · seed.ts
public/         manifest.webmanifest · sw.js (PWA)
```

### Como rodar

```bash
npm install
cp .env.example .env          # preencha as chaves (Supabase, Replicate, R2, Mercado Pago)
npm run db:push               # cria as tabelas
psql "$DATABASE_URL" -f prisma/rls.sql   # ativa Row-Level Security
npm run db:seed               # estilos globais + estúdio inicial + franquia
npm run dev
```

---

## 🇺🇸 English

### About

**DecalQ** is a **multi-tenant SaaS PWA** that turns images into tattoo **stencils** using AI.
It's **white-label**: it starts with a single studio, but the foundation is already multi-tenant
(isolation by `tenantId` + **Row-Level Security** in PostgreSQL), ready to sell to other studios
without a rewrite. Each studio gets a **monthly generation quota**, metered to protect GPU cost.

### Features

- 🎨 **6 stencil styles**: Outline, Standard, Hatching, Fine Line, Blackwork, Lettering
- 🖌️ **Transfer color** for the linework (post-process, not a new generation)
- 🔁 **Before/after** ("hold to see the original")
- 📐 **Size in cm → PNG/SVG/PDF export** at physical size (300 DPI)
- 🏢 **Multi-tenant** roles: **owner** (usage, plan, team) and **artist** (generates)
- 📊 Per-studio **monthly usage panel** and **global admin**
- 💳 **B2B subscription** (Mercado Pago) — the studio pays monthly; artists generate within the quota
- 📱 **Installable PWA** (iPhone, Android, iPad, desktop) with manifest + service worker

### Stack & architecture

**Next.js 14 (App Router)** · **TypeScript** · **Tailwind** · **PostgreSQL + Prisma**
(multi-tenant by `tenantId` + per-transaction **RLS**) · **Supabase Auth** · **Replicate**
(SDXL + ControlNet) + **OpenAI** (lettering) · **Cloudflare R2** (S3 API) · **Inngest** (jobs) ·
**Sharp** / **pdf-lib** · **Mercado Pago** · **Vercel**.

### Getting started

```bash
npm install
cp .env.example .env          # fill in your keys (Supabase, Replicate, R2, Mercado Pago)
npm run db:push               # create tables
psql "$DATABASE_URL" -f prisma/rls.sql   # enable Row-Level Security
npm run db:seed               # global styles + initial studio + quota
npm run dev
```

---

<div align="center">

Desenvolvido por **[@teuzslima](https://github.com/teuzslima)**

</div>
