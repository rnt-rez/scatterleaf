# 🍃 ScatterLeaf: Marginalia in the breeze.

> *"Marginalia in the breeze — Lightweight, iframe-free native Web Component comments for static blogs powered by GitHub Discussions."*  
> *"Minrock is the solid bedrock where knowledge rests; ScatterLeaf is the gentle breeze where ideas and conversations drift."*

[![Version: v0.5.9](https://img.shields.io/badge/Version-v0.5.9-brightgreen.svg?style=flat-square)](https://github.com/rnt-rez/scatterleaf/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Web Component](https://img.shields.io/badge/W3C-Web%20Component-orange.svg?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
[![Cloudflare Workers](https://img.shields.io/badge/Edge%20Broker-Cloudflare%20Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)](worker/)
[![Bundle Size](https://img.shields.io/badge/Bundle%20Size-%3C21KB%20gzip-brightgreen.svg?style=flat-square)](dist/)
[![Translations](https://img.shields.io/badge/Portugu%C3%AAs-README.pt--BR.md-green?style=flat-square)](README.pt-BR.md)

[🇧🇷 Leia esta documentação em Português](README.pt-BR.md)

---

## 🧭 What is ScatterLeaf?

**ScatterLeaf** is a lightweight, open-source native Web Component for embedding notes and reader discussions into static blogs and sites (Astro, Next.js, Hugo, Jekyll, or vanilla HTML), using **GitHub Discussions** as a free, transparent, and scalable backend.

Unlike traditional `<iframe>`-based alternatives, ScatterLeaf renders **directly into your page's DOM** via **Shadow DOM**, delivering:

1. 🚀 **Zero Iframes:** Millisecond render times with zero rendering pipeline blockage or layout shifts.
2. ⚡ **Serverless Edge Broker (Cloudflare Worker):** Secure broker between your readers and the GitHub GraphQL API, featuring global edge caching and zero client-exposed secrets.
3. 🌈 **Chameleon Mode (`theme="auto"`):** Automatic WCAG background/contrast detection that dynamically adapts to host theme changes in real-time via `MutationObserver`.
4. 🔊 **Smart Polyglot Speech (TTS):** Native browser speech synthesis via Web Speech API (`speechSynthesis`) with automatic language detection (`en-US`, `pt-BR`, `es-ES`, `fr-FR`).
5. 🌐 **1-Click In-Place Translation:** Instant translation of reader notes with voice engine auto-recalibration.
6. ✍️ **In-Place Marginalia Composer:** *Write* and *Preview* Markdown tabs, typography control (`Aa` monospace toggle), and nested reply threads.
7. 🔍 **Built-in Mini-Lightbox:** Native zoom & pan overlay for reader images without external dependencies.
8. 🔒 **Privacy & Security First:** Zero third-party trackers or ad scripts; secure GitHub OAuth flow (RFC 6749).
9. 🛡️ **Granular Moderation & FinOps Resilience:** Selective reader restriction (e.g. disable media/GIF uploads vs full ban) powered by Cloudflare KV with a 2-tier Circuit Breaker (preventive quota safeguard + reactive fallback) guaranteeing $0.00 cost and zero downtime.

---

## 📦 Installation & Quick Start

### Option 1: Universal CDN (Any Static Site / HTML)
Add the script tag inside `<head>` or before `</body>`:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/scatterleaf/dist/scatterleaf.js"></script>

<!-- Place where comments should appear: -->
<scatter-leaf
  repo="username/repository"
  category="General"
  theme="auto"
  broker="https://scatterleaf-broker.your-subdomain.workers.dev"
  client-id="your-github-client-id"
></scatter-leaf>
```

### Option 2: NPM Package (Astro, Next.js, Vite)
```bash
npm install scatterleaf
```

In your Astro layout component (e.g., `PostLayout.astro` or [Minrock](https://github.com/rnt-rez/minrock)):
```astro
---
// PostLayout.astro
import 'scatterleaf';
---
<article>
  <!-- Post content -->
</article>

<section class="comments-section">
  <scatter-leaf
    repo="username/repository"
    category="General"
    theme="auto"
    broker="https://scatterleaf-broker.your-subdomain.workers.dev"
    client-id="your-github-client-id"
  ></scatter-leaf>
</section>
```

---

## 🎨 Native Color Palettes

| Theme | Attribute | Visual Aesthetics |
| :--- | :--- | :--- |
| **Chameleon (Auto)** | `theme="auto"` | Automatically detects host luminance and updates contrast in real time. |
| **Cream** | `theme="cream"` | Warm Paper background (`#f7f4ea`), cozy borders, optimized for long reading. |
| **Midnight** | `theme="midnight"` | Deep OLED black (`#0d1117`) with subtle neon reactive accents. |
| **Slate** | `theme="slate"` | Modern Slate Navy (`#0f172a`), sleek Linear/Vercel-inspired dark palette. |
| **Clean White** | `theme="white"` | Crisp pure white, delicate shadows, and minimalist editorial typography. |

---

## 🛠️ Supported Attributes

| Attribute | Required? | Default | Description |
| :--- | :---: | :---: | :--- |
| `repo` | **Yes** | — | Target GitHub repository in `owner/repo` format. |
| `category` | No | `"General"` | GitHub Discussions category name. |
| `theme` | No | `"auto"` | Visual theme (`auto`, `cream`, `midnight`, `slate`, `white`). |
| `broker` | No | `""` | Cloudflare Edge Broker endpoint URL for live GitHub Discussions API access. |
| `client-id` | No | `""` | GitHub OAuth App Client ID for reader authentication. |
| `lang` | No | `"auto"` | Interface localization (`auto`, `en`, `pt`, `es`). |
| `mapping` | No | `"pathname"` | URL-to-discussion matching strategy (`pathname`, `url`, `title`, `og:title`). |
| `order` | No | `"oldest"` | Root comments sorting order (`oldest` / `newest`). |
| `hide-reactions` | No | `false` | Disables and hides reaction trigger and emoji badges. |
| `hide-skin-tone` | No | `false` | Hides the skin tone picker `✋` and defaults to neutral emoji. |
| `hide-sorting` | No | `false` | Hides the sorting toggle button in the toolbar. |
| `hide-code-scroll` | No | `false` | Hides the scroll arrows `^` and `v` in long code blocks. |
| `hide-preview` | No | `false` | Hides the "Preview" tab in the comment composer. |
| `hide-search` | No | `false` | Hides the comments search and filtering toolbar. |

---

## ⚡ Edge Broker (Cloudflare Worker)

ScatterLeaf ships with a production-ready serverless Edge Broker located in [`worker/`](worker/) that safely, quickly, and freely mediates requests between the `<scatter-leaf>` Web Component and the GitHub Discussions GraphQL API. See the [Worker Documentation](worker/README.md) for full deployment instructions.

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local Vite development sandbox |
| `npm run build` | Compiles TypeScript Web Component bundle to `dist/` (ESM + UMD) |
| `npm run qa` | Full quality check suite (build + worker typecheck + security audit) |
| `npm run audit:security` | DevSecOps Sentinel credential and token scanner |
| `npm run worker:dev` | Starts local Cloudflare Edge Broker simulation via Wrangler |
| `npm run worker:typecheck` | Static type diagnostics for the Worker backend |
| `npm run worker:deploy` | Deploys Edge Broker to Cloudflare Workers global network |

---

## 🤝 Official Companion for Minrock

ScatterLeaf was engineered as the official native comments solution for the [Minrock](https://github.com/rnt-rez/minrock) theme:
* **Minrock:** The solid bedrock for your thoughts, personal notes, and digital sovereignty.
* **ScatterLeaf:** The gentle breeze where readers and thinkers freely discuss ideas without proprietary gatekeepers.

---

## 📄 License

Distributed under the [MIT License](LICENSE). Crafted with care by the [ScatterLeaf Project](https://github.com/rnt-rez/scatterleaf).
