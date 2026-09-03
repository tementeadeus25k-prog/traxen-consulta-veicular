# Traxen — Plataforma de consulta veicular (protótipo funcional)

Traxen é uma plataforma SaaS de consulta veicular com identidade visual e experiência originais, inspirada apenas
no **conceito** de serviços como VR Check (placa, restrições, leilão, sinistro) — sem reaproveitar nome, marca,
textos, layout ou código de nenhuma plataforma existente.

Este repositório é um **protótipo funcional completo**: os fluxos de cadastro, login, consulta, pagamento (PIX e
cartão), geração de relatório, histórico, carteira de créditos e painel administrativo funcionam de ponta a ponta
localmente, usando adapters "mock" no lugar de um bureau de dados veiculares e de um gateway de pagamento reais.
A arquitetura foi desenhada para que esses adapters sejam substituídos por integrações reais **sem alterar
nenhuma tela**.

## Stack

- Next.js 14 (App Router) + TypeScript + React 18
- Tailwind CSS (design system próprio — ver `tailwind.config.ts`)
- Prisma + PostgreSQL (schema pronto em `prisma/schema.prisma`; não conectado neste protótipo — ver abaixo)
- Autenticação própria com sessão assinada (HMAC/Web Crypto) em cookie HttpOnly — ponto de integração para Auth.js
- bcryptjs para hash de senha, zod para validação

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

**Conta de demonstração (cliente):** `demo@traxen.com.br` / `demo1234`
**Conta de demonstração (admin):** `admin@traxen.com.br` / `demo1234` → `/admin`

## O que é real neste protótipo vs. o que é mock

Esta seção existe para que fique muito claro o que pode ir para produção como está e o que precisa de integração
real antes de cobrar de um cliente de verdade.

### Real (funciona de ponta a ponta, é a arquitetura pretendida para produção)

- **Autenticação**: cadastro e login reais, senha com hash bcrypt, sessão assinada em cookie `HttpOnly` +
  `Secure` (em produção) + `SameSite=Lax`, `middleware.ts` protegendo `/painel`, `/checkout` e `/admin` (com
  checagem de papel para `/admin`).
- **Fluxo de pagamento e liberação da consulta**: o frontend nunca marca um pagamento como aprovado. Uma
  cobrança é criada com **chave de idempotência** (uma por consulta), e a liberação do relatório só ocorre depois
  que `confirmPayment()` — chamada pelo endpoint de webhook (`/api/payments/webhook`) ou, neste protótipo, por um
  timer que simula essa notificação assíncrona — muda o status da consulta no servidor. O endpoint
  `/api/reports/generate` reverifica esse status no servidor antes de gerar qualquer relatório.
- **Rate limiting** em memória nos endpoints sensíveis (login, cadastro, criação de cobrança, consulta por placa),
  como ponto de proteção contra força bruta e abuso — trocar por Redis em produção multi-instância.
- **Arquitetura desacoplada de fornecedor** (`src/lib/vehicle-provider`): a interface `VehicleDataProvider` define
  o contrato (`lookupVehicle`, `getVehicleDetails`, `getRestrictions`, `getDebts`, `getTheftRecords`,
  `getLienInformation`, `getClaims`, `getAdditionalHistory`). O `MockVehicleProvider` é a única implementação
  hoje; um adapter real implementa a mesma interface e é trocado em um único ponto (`getVehicleProvider()`).
- **Camada de normalização** (`src/lib/vehicle-provider/normalize.ts` + `src/types/report.ts`): nenhuma tela
  depende do JSON bruto de um fornecedor. Campos ausentes na fonte são sempre `unavailable`, nunca "nada consta".
- **Admin como fonte de verdade dos produtos**: alterar preço/ativação em `/admin/produtos` reflete imediatamente
  no fluxo de compra (`/api/products` é consultado pelo cliente antes de criar uma consulta).

### Mock / simplificado (documentado para não ser confundido com produção)

- **Banco de dados**: `src/lib/store.ts` é um armazenamento em memória (perdido ao reiniciar o servidor). O schema
  Prisma equivalente já existe em `prisma/schema.prisma` — a migração é reescrever as funções de `store.ts` como
  consultas Prisma, mantendo as mesmas assinaturas.
- **Bureau de dados veiculares**: `MockVehicleProvider` gera dados fictícios determinísticos por placa. Nenhuma
  chamada é feita a sites governamentais (isso nunca deve ser implementado via scraping — apenas via API/bureau
  contratado e autorizado).
- **Gateway de pagamento**: `MockPaymentProvider` simula PIX e cartão e "aprova" a cobrança automaticamente após
  alguns segundos, para permitir testar o fluxo completo sem uma conta em um gateway real.
- **PDF**: o botão "Baixar PDF" aciona a impressão do navegador (`window.print()`), com CSS dedicado
  (`@media print` em `globals.css`) que esconde navegação e mantém o relatório limpo. Em produção, recomenda-se
  geração server-side (ex.: Chromium headless) para um PDF com o mesmo layout, anexável a e-mails.
- **Login com Google**: o botão existe na tela de login, mas está desconectado (mostra um aviso). O ponto de
  integração é `src/lib/auth/session.ts`.
- **Redis**: citado no `.env.example` e no código como o destino de produção do rate limiting; não está
  conectado — o protótipo usa um `Map` em memória.

## Estrutura de pastas (resumo)

```
src/
  app/
    (marketing)/        rotas públicas (landing, preços, como funciona, para empresas, dúvidas, termos, privacidade)
    (auth)/entrar, /cadastro
    painel/              área logada do cliente (protegida por middleware)
    checkout/[queryId]/  checkout (protegida por middleware)
    admin/               painel administrativo (protegida por middleware + papel admin)
    relatorio-exemplo/   relatório de exemplo público
    api/                 route handlers (auth, queries, payments, reports, wallet, admin, products)
  components/
    ui/                  design system (Button, Card, Badge, Input, Toast, Tooltip, Skeleton, Table...)
    marketing/, auth/, dashboard/, checkout/, report/, admin/
  lib/
    vehicle-provider/    contrato + adapter mock + normalizador
    payments/            contrato + adapter mock + confirmação de pagamento
    store.ts             "banco" em memória (ver prisma/schema.prisma para o equivalente real)
    auth/                sessão assinada, current-user, require-admin
    products.ts, plate.ts, rate-limit.ts, utils.ts
  types/report.ts        tipo normalizado VehicleReport
prisma/schema.prisma      schema de produção (PostgreSQL)
```

## Segurança — o que está implementado e o que falta para produção

Implementado neste protótipo:

- Senhas com hash bcrypt, nunca texto puro.
- Sessão em cookie `HttpOnly`, `SameSite=Lax`, `Secure` em produção.
- Validação de entrada com `zod` em todas as rotas de API.
- Rate limiting nos endpoints de login, cadastro, consulta e criação de cobrança.
- Autorização por papel (`role`) para `/admin`, verificada tanto no `middleware.ts` quanto em cada rota
  `api/admin/*` (`requireAdmin()`), nunca apenas no frontend.
- Idempotência na criação de cobrança (uma cobrança por consulta) e no endpoint de geração de relatório.
- Confirmação de pagamento **exclusivamente** via servidor (webhook), nunca por informação vinda do navegador.
- `next.config.js` define headers de segurança (`X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`) e `X-Robots-Tag: noindex` para `/painel` e `/admin`.
- Logs de auditoria (`audit_logs`) para ações administrativas sensíveis (bloqueio de cliente, crédito
  adicionado/removido, alteração de produto, criação de cupom).

Antes de produção, complementar com:

- CSRF: como a autenticação usa cookies, adicionar um token CSRF (ou usar `SameSite=Strict` combinado com
  verificação de origem) nas mutações sensíveis se a API for consumida por outros domínios.
- Substituir o rate limiter em memória por Redis (obrigatório em ambiente com múltiplas instâncias).
- Substituir a sessão HMAC própria por Auth.js (NextAuth) com rotação de refresh token, se o produto crescer em
  complexidade de autenticação (múltiplos provedores, MFA, etc).
- Verificação real de assinatura HMAC do webhook do gateway de pagamento (`PAYMENT_WEBHOOK_SECRET`).
- Escaneamento de dependências e cabeçalho `Content-Security-Policy` dedicado.

## LGPD

- Coleta mínima de dados (nome, e-mail, telefone, senha com hash).
- Página "Minha conta" com edição de dados e **solicitação de exclusão de conta** (registrada em audit log; em
  produção deve disparar um fluxo assíncrono de anonimização/exclusão dentro do prazo legal).
- Termos de Uso e Política de Privacidade completos em `/termos` e `/privacidade`.
- Nenhum dado de cartão é armazenado — o campo de cartão no checkout é apenas ilustrativo, pois não há gateway
  real conectado.

## Design

Identidade visual própria ("Traxen"): azul-marinho quase preto (`navy-950`) como cor de ancoragem, azul elétrico
(`electric-500`) como destaque, verde/vermelho reservados exclusivamente para indicadores positivos/alertas,
tipografia Inter, cantos entre 10–16px, sombras suaves, microanimações e skeleton loading. Tokens completos em
`tailwind.config.ts`.
