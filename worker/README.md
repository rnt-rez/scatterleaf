# 🍃 ScatterLeaf Edge Broker (Cloudflare Worker)

O **ScatterLeaf Edge Broker** é a camada de borda serverless (Cloudflare Worker) responsável por intermediar com segurança, velocidade e custo R$ 0,00 as requisições entre o Web Component `<scatter-leaf>` e a API do **GitHub Discussions**.

---

## ⚡ Funcionalidades

1. **Zero-Burocracia Auto-Discovery (`GET /api/discovery`):**
   * Resolve o `repositoryId` e a categoria padrão (`General`) a partir de `repo="usuario/repositorio"`.
   * Cache de 24 horas na borda global da Cloudflare (`s-maxage=86400`).
2. **Leitura Pública & Edge Cache (`GET /api/discussions`):**
   * Busca a discussão do post pelo termo/título e retorna os comentários, réplicas e reações.
   * Cache de borda de 60 segundos com `stale-while-revalidate` para leitores anônimos.
3. **Troca Segura de OAuth (`POST /api/oauth/access_token`):**
   * Troca o `code` retornado pelo fluxo OAuth do GitHub pelo `access_token`.
   * Mantém o `GITHUB_CLIENT_SECRET` 100% blindado na nuvem.
4. **Mutations In-Place (`POST/PATCH/DELETE /api/comments`, `POST /api/reactions`):**
   * Permite postar, responder em thread, editar in-place, excluir e reagir com emojis usando o token de sessão do leitor.
5. **Moderação Granular na Borda (Cloudflare KV):**
   * Permite ao autor restringir usuários individualmente (ex: bloquear apenas envio de imagens/GIFs inapropriados ou bloqueio total de comentários).
   * Verificação ultrarrápida em milissegundos antes de encaminhar requisições ao GitHub.

---

## 🛡️ Arquitetura de Moderação & Disjuntor Duplo (Cloudflare KV)

Para garantir custo R$ 0,00 e resiliência total contra falhas ou cobranças surpresa, o sistema de moderação adota as seguintes regras arquiteturais:

### 1. Garantia Anti-Cobrança Surpresa (Plano Gratuito)
* O **Cloudflare KV Free Tier** disponibiliza **100.000 leituras/dia**, **1.000 gravações/dia** e **1 GB de armazenamento**.
* **Não há cobrança automática:** No plano gratuito, a Cloudflare **nunca fatura excedentes** automaticamente a menos que o usuário faça o upgrade manual para o plano pago (*Workers Paid* por $5/mês). Se a cota diária for atingida, a API simplesmente retorna `HTTP 429` até a meia-noite (UTC).

### 2. Padrão Circuit Breaker de 2 Estágios (Disjuntor de Segurança)
Para garantir que os comentários do blog **nunca quebrem** mesmo em dias de tráfego atípico:

* **Estágio 1 (Preventivo / Proativo):**
  - O Worker monitora o volume de consultas. Faltando 1.000 requisições para o teto (ao bater 99.000 leituras no dia), o disjuntor desarma preventivamente: o Worker para de chamar o KV e passa direto em modo aberto (*fail-open*), preservando a cota restante.
* **Estágio 2 (Reativo / Fail-Safe):**
  - Qualquer consulta ao KV é envelopada em um bloco `try / catch`. Se o KV falhar por qualquer oscilação ou erro de cota, o erro é capturado e tratado silenciosamente, permitindo o fluxo normal dos comentários sem travar o blog.

### 3. Persistência dos Dados
* **Os dados salvos no KV nunca são apagados quando o limite diário de leitura é atingido.** A cota afeta apenas a quantidade de operações de leitura em um único dia.
* Quando a cota reseta à meia-noite (UTC), o contador volta para 0 de 100.000 e **todas as regras de moderação continuam intactas no banco de dados**, voltando a ser aplicadas automaticamente.

---

## 🛠️ Desenvolvimento Local

Na pasta raiz de `scatterleaf`:
```bash
npm run worker:dev
```
Ou dentro da pasta `worker/`:
```bash
npm run dev
```

---

## 🚀 Como Publicar na Nuvem (Deploy em 3 Minutos)

Quando você for colocar o broker no ar para o mundo, basta seguir estes passos:

### 1. Criar o OAuth App no GitHub
1. Acesse: **GitHub ➔ Settings ➔ Developer Settings ➔ OAuth Apps ➔ New OAuth App**
2. Preencha:
   * **Application name:** `ScatterLeaf Comments` (ou o nome do seu blog)
   * **Homepage URL:** `https://yourdomain.com` (ou sua URL)
   * **Authorization callback URL:** URL do seu blog ou do broker.
3. Copie o **Client ID** e gere um novo **Client Secret**.

### 2. Configurar os Segredos na Cloudflare
No terminal, faça login na sua conta gratuita da Cloudflare:
```bash
npx wrangler login
```

Configure o Client ID no `worker/wrangler.toml` (ou como secret):
```toml
[vars]
GITHUB_CLIENT_ID = "SEU_CLIENT_ID_AQUI"
ALLOWED_ORIGINS = "https://yourdomain.com,http://localhost:4321"
```

Injete o segredo de forma criptografada:
```bash
cd worker
npx wrangler secret put GITHUB_CLIENT_SECRET
# Cole o Client Secret quando solicitado
```

*(Opcional, mas recomendado)* Configure um token do GitHub para consultas públicas de alta volumetria:
```bash
npx wrangler secret put GITHUB_TOKEN
```

### 3. Fazer o Deploy
```bash
npm run deploy
```
A Cloudflare exibirá a URL do seu worker, por exemplo:
`https://scatterleaf-broker.seu-usuario.workers.dev`

Pronto! Basta apontar seu componente para essa URL:
```html
<scatter-leaf
  repo="owner/repo"
  broker="https://scatterleaf-broker.seu-usuario.workers.dev"
  theme="cream"
></scatter-leaf>
```
