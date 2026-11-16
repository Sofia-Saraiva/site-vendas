# Estante à Venda

Vitrine estática (`public/`) + três funções da Vercel (`api/`) que guardam o estoque num Redis (Upstash).
Sem dependências de npm.

## Deploy

1. Suba esta pasta para um repositório no GitHub e importe em vercel.com (ou rode `npx vercel` aqui dentro).
2. No projeto da Vercel, aba **Storage**: crie um banco **Upstash for Redis** (plano gratuito) e conecte ao projeto.
   Isso cria sozinho as variáveis `KV_REST_API_URL` e `KV_REST_API_TOKEN`.
3. Em **Settings → Environment Variables**, crie duas variáveis (marque como *Sensitive*):
   - `ADMIN_PASSWORD`: sua senha de vendedor, com pelo menos 10 caracteres (o ideal é uma frase longa gerada no gerenciador de senhas).
   - `SESSION_SECRET`: 32+ caracteres aleatórios. Gere com `openssl rand -hex 32`.
4. Faça um **Redeploy** para as variáveis valerem.
5. Abra o site, toque em **Área do vendedor** no rodapé e entre com a senha.

Antes do passo 2 o site já abre e mostra tudo como disponível; só o login e o "Publicar" ficam desligados.

## Como o modo vendedor é protegido

- A senha nunca está no código nem no navegador: fica só na variável `ADMIN_PASSWORD` e é comparada no servidor.
- Login certo devolve um cookie assinado (HMAC com `SESSION_SECRET`), `HttpOnly`, `Secure`, `SameSite=Strict`, válido por 7 dias.
- Toda gravação (`POST /api/state`) confere o cookie no servidor. Esconder botões no front é só cosmético.
- 5 tentativas de senha por IP a cada 15 minutos.
- O servidor valida tudo que grava (preços, textos, tamanhos) e recusa POST vindo de outro site.
- Para derrubar todas as sessões, troque `SESSION_SECRET` e faça redeploy. Para trocar a senha, troque `ADMIN_PASSWORD`.

## Editar o catálogo

Itens, títulos e preços iniciais ficam em `public/catalog.js`; fotos em `public/img/`.
Vendido, preço ajustado, estado, WhatsApp e desconto do lote ficam no Redis e são alterados pelo modo vendedor.

## Testar local

`npx vercel dev` (depois de `npx vercel link` e `npx vercel env pull`). Em `http://localhost` o cookie `Secure` pode não ser aceito por alguns navegadores; teste o login no deploy de preview.
