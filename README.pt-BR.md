# 🍃 ScatterLeaf: Marginalia in the breeze.

> *"Marginalia in the breeze — Comentários ultraleves, nativos e sem iframes para blogs estáticos movidos a GitHub Discussions."*  
> *"O Minrock é a rocha sólida onde o conhecimento descansa; o ScatterLeaf é a brisa suave onde as ideias e conversas flutuam."*

[![Versão: v0.5.9](https://img.shields.io/badge/Vers%C3%A3o-v0.5.9-brightgreen.svg?style=flat-square)](https://github.com/rnt-rez/scatterleaf/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Web Component](https://img.shields.io/badge/W3C-Web%20Component-orange.svg?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
[![Cloudflare Workers](https://img.shields.io/badge/Edge%20Broker-Cloudflare%20Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)](worker/)
[![Bundle Size](https://img.shields.io/badge/Bundle%20Size-%3C21KB%20gzip-brightgreen.svg?style=flat-square)](dist/)
[![English](https://img.shields.io/badge/English-README.md-blue?style=flat-square)](README.md)

[🇺🇸 Read this documentation in English](README.md)

---

## 🧭 O que é o ScatterLeaf?

O **ScatterLeaf** é um Web Component nativo open-source para embutir notas e comentários em blogs e sites estáticos (Astro, Next.js, Hugo, Jekyll, HTML puro), utilizando o **GitHub Discussions** como banco de dados gratuito, transparente e escalável.

Diferente de alternativas tradicionais baseadas em `<iframe>`, o ScatterLeaf renderiza **no mesmo DOM da sua página** através de **Shadow DOM**, garantindo:

1. 🚀 **Zero Iframes:** Carregamento ultraveloz em milissegundos sem bloqueios de renderização nem layout shifts.
2. ⚡ **Edge Broker Serverless (Cloudflare Worker):** Intermediação segura entre o leitor e a API do GitHub com cache global de borda e blindagem total de segredos.
3. 🌈 **Modo Camaleão (`theme="auto"`):** Detecção automática de luminância/contraste WCAG e reatividade instantânea a mudanças de tema no blog via `MutationObserver`.
4. 🔊 **Áudio Poliglota Inteligente:** Síntese de voz nativa via Web Speech API (`speechSynthesis`) com detecção automática do idioma da nota (`pt-BR`, `en-US`, `es-ES`, `fr-FR`).
5. 🌐 **Tradução com 1 Clique:** Tradução direta in-place com recalibração imediata da voz sintetizada.
6. ✍️ **Editor Marginalia In-Place:** Abas *Escreva* e *Prévia* com suporte a Markdown, controle tipográfico `Aa` (monospace) e respostas aninhadas (threads).
7. 🔍 **Mini-Lightbox Integrado:** Visualização expandida de imagens com zoom e pan nativo, sem bibliotecas externas.
8. 🔒 **Segurança & Privacidade:** Sem rastreadores ou anúncios de terceiros; autenticação segura via GitHub OAuth (RFC 6749).
9. 🛡️ **Moderação Granular & Resiliência FinOps:** Restrição seletiva de usuários (ex: bloquear envio de mídia/GIFs vs bloqueio total) via Cloudflare KV com disjuntor de duplo estágio (*Circuit Breaker* preventivo + reativo) garantindo custo R$ 0,00 e tolerância a falhas.

---

## 📦 Instalação e Uso Rápido

### Opção 1: Via CDN Universal (Qualquer HTML / Blog Estático)
Adicione o script no `<head>` ou antes de fechar o `</body>`:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/scatterleaf/dist/scatterleaf.js"></script>

<!-- Inserir onde deseja os comentários: -->
<scatter-leaf
  repo="usuario/repositorio"
  category="General"
  theme="auto"
  broker="https://scatterleaf-broker.seu-subdominio.workers.dev"
  client-id="seu-github-client-id"
></scatter-leaf>
```

### Opção 2: Via Pacote NPM (Astro, Next.js, Vite)
```bash
npm install scatterleaf
```

No seu componente de layout Astro (por exemplo, `PostLayout.astro` ou tema [Minrock](https://github.com/rnt-rez/minrock)):
```astro
---
// PostLayout.astro
import 'scatterleaf';
---
<article>
  <!-- Conteúdo do post -->
</article>

<section class="comments-section">
  <scatter-leaf
    repo="usuario/repositorio"
    category="General"
    theme="auto"
    broker="https://scatterleaf-broker.seu-subdominio.workers.dev"
    client-id="seu-github-client-id"
  ></scatter-leaf>
</section>
```

---

## 🎨 Galeria de Temas Nativos

| Tema | Atributo | Estética Visual |
| :--- | :--- | :--- |
| **Camaleão (Auto)** | `theme="auto"` | Detecta o contraste do host e se adapta dinamicamente em tempo real. |
| **Cream** | `theme="cream"` | Fundo *Warm Paper* (`#f7f4ea`), bordas aconchegantes e leitura prolongada. |
| **Midnight** | `theme="midnight"` | Preto OLED profundo (`#0d1117`) com realces sutis em azul neon. |
| **Slate** | `theme="slate"` | Ardósia naval (`#0f172a`), estilo moderno Vercel / Linear. |
| **Clean White** | `theme="white"` | Branco puro, sombras suaves e visual editorial minimalista. |

---

## 🛠️ Atributos Suportados

| Atributo | Obrigatório? | Padrão | Descrição |
| :--- | :---: | :---: | :--- |
| `repo` | **Sim** | — | Repositório do GitHub no formato `owner/repo`. |
| `category` | Não | `"General"` | Categoria das discussões no repositório. |
| `theme` | Não | `"auto"` | Tema visual (`auto`, `cream`, `midnight`, `slate`, `white`). |
| `broker` | Não | `""` | URL do Cloudflare Edge Broker para conexão live ao GitHub Discussions. |
| `client-id` | Não | `""` | Client ID do seu GitHub OAuth App para login dos leitores. |
| `lang` | Não | `"auto"` | Idioma da interface (`auto`, `pt`, `en`, `es`). |
| `mapping` | Não | `"pathname"` | Estratégia de correspondência do post (`pathname`, `url`, `title`, `og:title`). |
| `order` | Não | `"oldest"` | Ordenação dos comentários raiz (`oldest` / `newest`). |
| `hide-reactions` | Não | `false` | Desativa e oculta a barra e os badges de reações com emojis. |
| `hide-skin-tone` | Não | `false` | Oculta o seletor de tom de pele `✋` e utiliza o emoji neutro. |
| `hide-sorting` | Não | `false` | Oculta o botão de alternância de ordenação no cabeçalho. |
| `hide-code-scroll` | Não | `false` | Oculta as setas de rolagem `^` e `v` em blocos de código longos. |
| `hide-preview` | Não | `false` | Oculta a aba "Prévia" no editor de novos comentários. |
| `hide-search` | Não | `false` | Oculta a barra de busca e filtro de comentários. |

---

## ⚡ Edge Broker (Cloudflare Worker)

O ScatterLeaf acompanha um Edge Broker serverless completo na pasta [`worker/`](worker/) para intermediar com segurança, velocidade e custo R$ 0,00 as requisições entre o Web Component e a API do GitHub Discussions. Consulte o [README do Worker](worker/README.md) para o passo a passo de implantação.

---

## 📜 Comandos Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o playground de desenvolvimento local no Vite |
| `npm run build` | Compila o Web Component TypeScript para `dist/` (ESM + UMD) |
| `npm run qa` | Suíte de verificação completa (build + worker check + segurança) |
| `npm run audit:security` | Auditoria DevSecOps Sentinel para blindagem de credenciais |
| `npm run worker:dev` | Inicia o Cloudflare Edge Broker localmente via Wrangler |
| `npm run worker:typecheck` | Validação estática de tipos do Worker |
| `npm run worker:deploy` | Implanta o Edge Broker na nuvem global da Cloudflare |

---

## 🤝 Parceria Oficial com o Minrock

O ScatterLeaf foi desenvolvido como a solução nativa de comentários oficial do tema [Minrock](https://github.com/rnt-rez/minrock):
* **Minrock:** A rocha sólida para seu conhecimento estático e soberania digital.
* **ScatterLeaf:** A brisa onde leitores e autores conversam livremente, sem intermediários proprietários.

---

## 📄 Licença

Distribuído sob a licença [MIT](LICENSE). Desenvolvido por [ScatterLeaf Project](https://github.com/rnt-rez/scatterleaf).
