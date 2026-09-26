export const baseStyles = `
:host {
  display: block;
  font-family: var(--sl-font, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  color: var(--sl-text);
  line-height: 1.5;
  box-sizing: border-box;
}

*, *::before, *::after {
  box-sizing: inherit;
}

button, input, textarea, select {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}

/* Foco Visível para Acessibilidade (A11y) */
:focus-visible {
  outline: 2px solid var(--sl-accent) !important;
  outline-offset: 2px !important;
}

/* Container Principal */
.sl-container {
  background: var(--sl-bg);
  border: 1px solid var(--sl-border);
  border-radius: var(--sl-radius, 12px);
  padding: 1.5rem;
  transition: background 0.25s ease, border-color 0.25s ease, color 0.25s ease;
}

/* Header & Contador */
.sl-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--sl-border);
}

.sl-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--sl-text);
}

.sl-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--sl-surface);
  color: var(--sl-accent);
  border: 1px solid var(--sl-border);
}

.sl-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Barra de Ferramentas e Filtro de Comentários (Toolbar - Estilo Minrock com Efeito Neon) */
.sl-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.25rem;
  margin-bottom: 1.25rem;
  gap: 0.75rem;
  min-height: 36px;
}

.sl-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  height: 36px;
}

.sl-toolbar-count {
  display: inline-flex;
  align-items: center;
  height: 36px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--sl-text-muted);
  white-space: nowrap;
  letter-spacing: -0.01em;
  user-select: none;
  line-height: 1;
}

.sl-sort-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: var(--sl-surface);
  border: 1px solid var(--sl-border);
  border-radius: 6px;
  height: 36px;
  box-sizing: border-box;
  padding: 0 0.75rem;
  font-size: 0.8rem;
  font-weight: 500;
  font-family: inherit;
  color: var(--sl-text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  user-select: none;
  line-height: 1;
}

.sl-sort-btn:hover {
  color: var(--sl-text);
  border-color: var(--sl-accent);
  background: var(--sl-hover, rgba(125, 125, 125, 0.08));
}

.sl-sort-btn:active {
  transform: scale(0.96);
  color: var(--sl-accent);
}

.sl-search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--sl-surface);
  border: 1px solid var(--sl-border);
  border-radius: 6px;
  padding: 0 0.75rem;
  height: 36px;
  width: 280px;
  max-width: 100%;
  box-sizing: border-box;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.sl-search-wrapper:hover {
  border-color: var(--sl-accent);
  box-shadow: 0 0 8px var(--sl-accent-glow, rgba(146, 64, 14, 0.2));
}

.sl-search-wrapper:focus-within {
  border-color: var(--sl-accent);
  box-shadow: 0 0 0 1px var(--sl-accent), 0 0 14px var(--sl-accent-glow, rgba(146, 64, 14, 0.35)), 0 2px 4px rgba(0, 0, 0, 0.06);
  background: var(--sl-surface);
}

.sl-search-svg {
  flex-shrink: 0;
  color: var(--sl-text-muted);
  transition: color 0.2s ease;
  user-select: none;
}

.sl-search-wrapper:focus-within .sl-search-svg,
.sl-search-wrapper:hover .sl-search-svg {
  color: var(--sl-accent);
}

.sl-search-input {
  width: 100%;
  height: 100%;
  border: none !important;
  outline: none !important;
  -webkit-appearance: none;
  appearance: none;
  box-shadow: none !important;
  background: transparent !important;
  border-radius: 4px;
  color: var(--sl-text);
  font-family: inherit;
  font-size: 0.84rem;
  box-sizing: border-box;
  padding: 0;
}

.sl-search-input:focus,
.sl-search-input:focus-visible {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}

.sl-search-input::placeholder {
  color: var(--sl-text-muted);
  opacity: 0.75;
  font-size: 0.84rem;
}

.sl-search-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border: 1px solid var(--sl-border);
  border-radius: 4px;
  background: var(--sl-tab-bg, rgba(0, 0, 0, 0.04));
  color: var(--sl-text-muted);
  font-family: inherit;
  font-size: 0.6875rem;
  font-weight: 500;
  line-height: 1;
  user-select: none;
  pointer-events: none;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
}

.sl-search-clear-btn {
  background: transparent;
  border: none;
  color: var(--sl-text-muted);
  font-size: 0.8125rem;
  cursor: pointer;
  padding: 0.2rem;
  margin-left: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: color 0.15s ease, background 0.15s ease;
  line-height: 1;
}

.sl-search-clear-btn:hover {
  color: var(--sl-text);
  background: var(--sl-card-bg-hover, rgba(0, 0, 0, 0.06));
}

/* Banner de Resultados da Busca */
.sl-search-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--sl-tab-bg, rgba(0, 0, 0, 0.03));
  border: 1px solid var(--sl-border);
  border-radius: 8px;
  padding: 0.5rem 0.85rem;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: var(--sl-text-muted);
}

.sl-search-banner-clear {
  background: transparent;
  border: none;
  color: var(--sl-accent);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.sl-search-banner-clear:hover {
  color: var(--sl-accent-hover);
}

@media (max-width: 640px) {
  .sl-header {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .sl-toolbar {
    width: 100%;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .sl-search-wrapper {
    flex: 1 1 200px;
    width: auto !important;
  }
  .sl-toolbar-actions {
    margin-left: auto;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .sl-toolbar-count {
    font-size: 0.8rem;
  }
}

.sl-brand-tag {
  font-size: 0.75rem;
  color: var(--sl-text-muted);
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.sl-brand-tag a {
  color: var(--sl-accent);
  text-decoration: none;
  font-weight: 500;
}

.sl-brand-tag a:hover {
  text-decoration: underline;
}

/* Caixa de Escrita de Novo Comentário (Composer) */
.sl-composer {
  background: var(--sl-surface);
  border: 1px solid var(--sl-border);
  border-radius: var(--sl-radius, 10px);
  padding: 0;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  position: relative;
  z-index: 20;
}

/* Abas do Composer: Escreva / Prévia e Controle Tipográfico Aa */
.sl-composer-tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--sl-tab-bg, rgba(0, 0, 0, 0.03));
  border-bottom: 1px solid var(--sl-border);
  border-top-left-radius: calc(var(--sl-radius, 10px) - 1px);
  border-top-right-radius: calc(var(--sl-radius, 10px) - 1px);
  padding: 0.25rem 0.5rem;
}

.sl-tabs-group {
  display: flex;
  gap: 0.25rem;
}

.sl-tab {
  background: transparent;
  border: none;
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--sl-text-muted);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.sl-tab:hover {
  color: var(--sl-text);
}

.sl-tab.sl-tab-active {
  background: var(--sl-surface);
  color: var(--sl-accent);
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.sl-composer-tabs-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  position: relative;
}

.sl-code-menu-wrapper {
  position: relative;
}

.sl-code-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace;
  color: var(--sl-text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.sl-code-toggle:hover {
  border-color: var(--sl-border);
  color: var(--sl-text);
  background: var(--sl-surface);
}

.sl-code-toggle.sl-code-toggle-active {
  background: var(--sl-bg);
  border-color: var(--sl-accent);
  color: var(--sl-accent);
}

/* Popover do Seletor de Linguagens */
.sl-code-picker-popover {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: 250px;
  max-width: 90vw;
  background: var(--sl-surface);
  border: 1px solid var(--sl-border);
  border-radius: var(--sl-radius, 8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  padding: 0.5rem;
  z-index: 100;
  animation: sl-fade-in 0.15s ease;
}

.sl-code-picker-title {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--sl-text-muted);
  padding: 0.2rem 0.4rem 0.4rem;
  border-bottom: 1px solid var(--sl-border);
  margin-bottom: 0.35rem;
}

.sl-code-lang-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.25rem;
  max-height: 210px;
  overflow-y: auto;
}

.sl-code-lang-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 0.3rem 0.45rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.12s ease;
  width: 100%;
}

.sl-code-lang-btn:hover {
  background: var(--sl-bg);
  border-color: var(--sl-border);
}

.sl-code-lang-name {
  font-size: 0.78rem;
  color: var(--sl-text);
  font-weight: 500;
}

.sl-code-lang-tag {
  font-size: 0.68rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: var(--sl-accent);
  background: var(--sl-tab-bg, rgba(0, 0, 0, 0.05));
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
}

.sl-font-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--sl-text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.sl-font-toggle:hover {
  border-color: var(--sl-border);
  color: var(--sl-text);
}

.sl-font-toggle.sl-mono-active {
  background: var(--sl-bg);
  border-color: var(--sl-accent);
  color: var(--sl-accent);
}

/* Área de Texto com Auto-grow */
.sl-composer-body {
  padding: 0.75rem;
}

.sl-textarea {
  width: 100%;
  min-height: 85px;
  background: transparent;
  border: none;
  color: var(--sl-text);
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.5;
  resize: vertical;
  outline: none;
  display: block;
}

.sl-textarea.sl-monospace {
  font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace !important;
  font-size: 0.9rem;
}

.sl-textarea::placeholder {
  color: var(--sl-text-muted);
}

/* Área de Prévia do Markdown */
.sl-preview-area {
  min-height: 85px;
  padding: 0.5rem;
  color: var(--sl-text);
  font-size: 0.95rem;
  line-height: 1.6;
  word-break: break-word;
}

.sl-preview-area.sl-monospace {
  font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace !important;
}

.sl-preview-empty {
  color: var(--sl-text-muted);
  font-style: italic;
}

.sl-composer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: var(--sl-tab-bg, rgba(0, 0, 0, 0.02));
  border-top: 1px solid var(--sl-border);
  border-bottom-left-radius: calc(var(--sl-radius, 10px) - 1px);
  border-bottom-right-radius: calc(var(--sl-radius, 10px) - 1px);
  position: relative;
}

.sl-composer-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Emoji Picker e Ações Rápidas */
.sl-emoji-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.sl-btn-emoji,
.sl-btn-toolbar-media {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: var(--sl-bg);
  border: 1px solid var(--sl-border);
  border-radius: 6px;
  font-size: 1.15rem;
  cursor: pointer;
  color: var(--sl-text);
  line-height: 1;
  transition: all 0.15s ease;
  box-sizing: border-box;
  flex-shrink: 0;
}

.sl-btn-emoji:hover,
.sl-btn-emoji.sl-btn-emoji-active,
.sl-btn-toolbar-media:hover {
  border-color: var(--sl-accent);
  background: var(--sl-card-bg-hover, rgba(255, 255, 255, 0.08));
  transform: scale(1.05);
}

.sl-emoji-popover {
  position: absolute;
  bottom: calc(100% + 12px);
  right: 0;
  width: 320px;
  max-width: calc(100vw - 36px);
  background: var(--sl-surface, var(--sl-bg));
  border: 1px solid var(--sl-border);
  border-radius: 10px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.38), 0 0 0 1px rgba(255, 255, 255, 0.06);
  padding: 0.6rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  animation: sl-fade-in 0.15s ease;
}

/* Header com Título e Botões de Navegação (Mobile / Scroll) */
.sl-emoji-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--sl-border);
}

.sl-emoji-title {
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--sl-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.sl-emoji-nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.sl-emoji-nav-btn {
  background: var(--sl-tab-bg, rgba(0, 0, 0, 0.04));
  border: 1px solid var(--sl-border);
  border-radius: 4px;
  padding: 0.22rem 0.45rem;
  font-size: 0.72rem;
  color: var(--sl-text);
  cursor: pointer;
  line-height: 1;
  transition: all 0.12s ease;
}

.sl-emoji-nav-btn:hover {
  background: var(--sl-accent-subtle, rgba(88, 166, 255, 0.2));
  border-color: var(--sl-accent);
  color: var(--sl-accent);
}

.sl-emoji-close-btn:hover {
  background: rgba(248, 81, 73, 0.15);
  border-color: rgba(248, 81, 73, 0.4);
  color: #f85149;
}

/* Seletor de Tom de Pele (Skin Tone / Estilo WhatsApp / Unicode Fitzpatrick) */
.sl-skin-tone-toggle-btn {
  background: var(--sl-tab-bg, rgba(0, 0, 0, 0.04));
  border: 1px solid var(--sl-border);
  border-radius: 4px;
  padding: 0.15rem 0.35rem;
  font-size: 0.88rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: all 0.15s ease;
}

.sl-skin-tone-toggle-btn:hover,
.sl-skin-tone-toggle-btn.sl-tone-active {
  border-color: var(--sl-accent);
  background: var(--sl-accent-subtle, rgba(88, 166, 255, 0.18));
  transform: scale(1.08);
}

.sl-skin-tone-panel {
  background: var(--sl-tab-bg, rgba(0, 0, 0, 0.04));
  border: 1px solid var(--sl-accent);
  border-radius: 8px;
  padding: 0.45rem 0.55rem;
  margin-bottom: 0.45rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  animation: sl-fade-in 0.12s ease;
}

.sl-skin-tone-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.71rem;
  font-weight: 600;
  color: var(--sl-accent);
}

.sl-skin-tone-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 3px;
}

.sl-tone-btn {
  background: var(--sl-surface, var(--sl-bg));
  border: 1px solid var(--sl-border);
  border-radius: 6px;
  padding: 0.22rem 0.35rem;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: transform 0.1s ease, border-color 0.15s ease, background 0.15s ease;
}

.sl-tone-btn:hover {
  transform: scale(1.22);
  border-color: var(--sl-accent);
  background: var(--sl-accent-subtle, rgba(88, 166, 255, 0.2));
}

.sl-tone-btn.sl-tone-selected {
  border-color: var(--sl-accent);
  background: var(--sl-accent-subtle, rgba(88, 166, 255, 0.25));
  box-shadow: 0 0 0 1px var(--sl-accent);
}

/* Área de Rolagem com Barra Visível (Mouse Wheel / Touchpad / Mobile) */
.sl-emoji-scroll {
  max-height: 195px;
  overflow-y: scroll;
  overflow-x: hidden;
  padding-right: 0.35rem;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: var(--sl-accent) var(--sl-tab-bg, rgba(0, 0, 0, 0.06));
}

.sl-emoji-scroll::-webkit-scrollbar {
  width: 6px;
}

.sl-emoji-scroll::-webkit-scrollbar-track {
  background: var(--sl-tab-bg, rgba(0, 0, 0, 0.06));
  border-radius: 4px;
}

.sl-emoji-scroll::-webkit-scrollbar-thumb {
  background: var(--sl-accent);
  border-radius: 4px;
}

.sl-emoji-category {
  margin-bottom: 0.55rem;
}

.sl-emoji-category:last-child {
  margin-bottom: 0;
}

.sl-emoji-category-title {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--sl-text-muted);
  margin-bottom: 0.25rem;
  display: block;
}

.sl-emoji-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}

.sl-emoji-item {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  padding: 0.28rem 0;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s ease, background 0.1s ease;
}

.sl-emoji-item:hover {
  background: var(--sl-accent-subtle, rgba(88, 166, 255, 0.18));
  transform: scale(1.22);
}

.sl-emoji-gif-btn,
.sl-emoji-img-btn {
  width: 100%;
  margin-top: 2px;
  padding: 0.4rem 0.5rem;
  background: var(--sl-tab-bg, rgba(0, 0, 0, 0.04));
  border: 1px dashed var(--sl-border);
  border-radius: 6px;
  color: var(--sl-text-muted);
  font-size: 0.76rem;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}

.sl-emoji-gif-btn:hover,
.sl-emoji-img-btn:hover {
  color: var(--sl-accent);
  border-color: var(--sl-accent);
  background: var(--sl-card-bg-hover, rgba(255, 255, 255, 0.06));
}

/* Botões */
.sl-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  height: 36px;
  padding: 0 0.95rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
  box-sizing: border-box;
  white-space: nowrap;
}

.sl-btn-primary {
  background: var(--sl-btn-primary-bg, var(--sl-accent));
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  font-weight: 600;
}

.sl-btn-primary:hover {
  background: var(--sl-btn-primary-hover, var(--sl-accent-hover));
}

.sl-btn-primary span:first-child {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35));
}

.sl-btn-secondary {
  background: var(--sl-bg);
  color: var(--sl-text);
  border-color: var(--sl-border);
}

.sl-btn-secondary:hover {
  border-color: var(--sl-text-muted);
}

/* Botão Verde de Login do GitHub */
.sl-btn-github {
  background: #238636;
  color: #ffffff;
  border: 1px solid rgba(240, 246, 252, 0.1);
  font-weight: 600;
}

.sl-btn-github:hover {
  background: #2ea043;
}

.sl-btn-github svg {
  fill: currentColor;
}

/* Status do Usuário Logado e Broker */
.sl-user-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.8125rem;
  color: var(--sl-text);
  font-weight: 500;
  line-height: 1;
}

.sl-user-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid var(--sl-border);
  object-fit: cover;
  flex-shrink: 0;
}

.sl-user-name {
  display: inline-flex;
  align-items: center;
  line-height: 1;
  color: var(--sl-text);
  font-weight: 500;
}

.sl-btn-logout {
  background: transparent;
  border: 1px solid transparent;
  color: var(--sl-text-muted);
  font-family: inherit;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  line-height: 1;
  vertical-align: middle;
}

.sl-btn-logout:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
}

.sl-broker-status {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: var(--sl-text-muted);
}

.sl-broker-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
}

.sl-broker-dot.sl-broker-standalone {
  background: #f59e0b;
}

/* Lista de Comentários e Threads */
.sl-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Card de Comentário */
.sl-card {
  background: var(--sl-surface);
  border: 1px solid var(--sl-border);
  border-radius: var(--sl-radius, 10px);
  padding: 1.1rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  position: relative;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.sl-card:hover {
  border-color: var(--sl-accent);
}

/* Destaque pulsante para Deep Linking (#comment-123) */
.sl-card.sl-highlight {
  border-color: var(--sl-accent);
  box-shadow: 0 0 0 3px var(--sl-accent-glow, rgba(146, 64, 14, 0.2));
}

/* Card Fixado pelo Autor */
.sl-card.sl-card-pinned {
  border-color: var(--sl-accent);
  box-shadow: 0 0 14px var(--sl-accent-glow, rgba(56, 189, 248, 0.25)), 0 2px 8px rgba(0, 0, 0, 0.04);
}

.sl-pinned-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  background: rgba(56, 189, 248, 0.12);
  color: var(--sl-accent);
  border: 1px solid var(--sl-accent);
  user-select: none;
  font-family: inherit;
  line-height: inherit;
  box-sizing: border-box;
}

button.sl-pinned-badge-clickable {
  cursor: pointer;
  background: rgba(56, 189, 248, 0.12);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

button.sl-pinned-badge-clickable:hover {
  background: rgba(56, 189, 248, 0.25);
  box-shadow: 0 0 10px var(--sl-accent-glow, rgba(56, 189, 248, 0.35));
  transform: translateY(-1px);
}

button.sl-pinned-badge-clickable:active {
  transform: translateY(0);
}

.sl-card.sl-card-menu-open,
.sl-card:has(.sl-dropdown-menu) {
  z-index: 40;
}

.sl-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.65rem;
  gap: 0.5rem;
}

.sl-author-info {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.sl-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--sl-border);
  flex-shrink: 0;
}

.sl-author-top-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.sl-author-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--sl-text);
  text-decoration: none;
}

.sl-author-name:hover {
  color: var(--sl-accent);
  text-decoration: underline;
}

.sl-author-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  background: var(--sl-accent);
  color: var(--sl-accent-contrast, #ffffff);
}

.sl-card-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sl-date {
  font-size: 0.75rem;
  color: var(--sl-text-muted);
}

.sl-edited-tag {
  font-size: 0.75rem;
  color: var(--sl-text-muted);
  font-style: italic;
}

/* Menu de Três Pontinhos (•••) */
.sl-menu-container {
  position: relative;
}

.sl-menu-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.sl-menu-btn {
  background: transparent;
  border: none;
  color: var(--sl-text-muted);
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9rem;
  line-height: 1;
  transition: all 0.15s ease;
}

.sl-menu-btn:hover {
  background: var(--sl-bg);
  color: var(--sl-text);
}

.sl-dropdown,
.sl-dropdown-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  background: var(--sl-surface);
  border: 1px solid var(--sl-border);
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  z-index: 60;
  min-width: 160px;
  display: flex;
  flex-direction: column;
  padding: 0.35rem;
  gap: 0.15rem;
  overflow: visible;
  backdrop-filter: blur(8px);
}

.sl-dropdown-item {
  background: transparent;
  border: none;
  text-align: left;
  padding: 0.45rem 0.65rem;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--sl-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 6px;
  transition: background 0.15s ease, color 0.15s ease;
  white-space: nowrap;
  user-select: none;
  width: 100%;
  box-sizing: border-box;
}

.sl-dropdown-item:hover {
  background: var(--sl-bg);
  color: var(--sl-accent);
}

.sl-dropdown-item.sl-danger:hover,
.sl-dropdown-item.sl-dropdown-danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* Corpo do Comentário com Markdown */
.sl-body {
  font-size: 0.95rem;
  color: var(--sl-text);
  line-height: 1.6;
  margin-bottom: 0.75rem;
  word-break: break-word;
}

.sl-body p {
  margin: 0 0 0.5rem 0;
}

.sl-body p:last-child {
  margin-bottom: 0;
}

.sl-body code,
.sl-card-body code:not(.sl-code-body),
.sl-preview-area code:not(.sl-code-body),
.sl-inline-code {
  background: var(--sl-bg);
  border: 1px solid var(--sl-border);
  padding: 0.12rem 0.4rem;
  border-radius: 4px;
  font-size: 0.85em;
  font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace;
  color: var(--sl-accent);
}

/* Modo de Edição In-Place */
.sl-edit-mode {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 0.5rem 0 0.75rem 0;
}

.sl-edit-mode .sl-textarea {
  min-height: 90px;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--sl-border);
  border-radius: var(--sl-radius, 8px);
  background: var(--sl-bg);
  box-sizing: border-box;
}

.sl-edit-mode .sl-textarea:focus {
  border-color: var(--sl-accent);
  box-shadow: 0 0 0 2px var(--sl-mention-bg);
}

.sl-edit-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.sl-edit-actions .sl-btn {
  padding: 0.4rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: var(--sl-radius, 6px);
  cursor: pointer;
  transition: all 0.15s ease;
}

/* Bloco de Código Técnico Estruturado */
.sl-code-block {
  position: relative;
  background: var(--sl-bg);
  border: 1px solid var(--sl-border);
  border-radius: var(--sl-radius, 8px);
  margin: 0.75rem 0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.sl-code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.35rem 0.75rem;
  background: var(--sl-tab-bg, rgba(0, 0, 0, 0.03));
  border-bottom: 1px solid var(--sl-border);
  font-size: 0.75rem;
}

.sl-code-badge {
  font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--sl-accent);
  text-transform: lowercase;
  letter-spacing: 0.03em;
}

.sl-code-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 0.2rem 0.45rem;
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--sl-text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.sl-code-copy-btn:hover {
  background: var(--sl-surface);
  border-color: var(--sl-border);
  color: var(--sl-text);
}

.sl-code-copy-btn.sl-copied {
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.08);
}

/* Elemento <pre> do Código */
.sl-code-pre {
  display: block !important;
  box-sizing: border-box !important;
  margin: 0 !important;
  padding: 0.5rem 0 !important;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  overflow-x: auto !important;
  overflow-y: auto !important;
  scroll-behavior: smooth;
  font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace !important;
  font-size: 0.78rem !important;
  line-height: 1.35rem !important;
}

/* Quando longo e minimizado (default para > 20 linhas) */
.sl-code-block-long.sl-collapsed .sl-code-pre {
  max-height: 290px !important;
  overflow-y: auto !important;
}

/* Quando expandido */
.sl-code-block-long.sl-expanded .sl-code-pre {
  max-height: none !important;
  overflow-y: visible !important;
}

.sl-code-pre::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.sl-code-pre::-webkit-scrollbar-track {
  background: transparent;
}
.sl-code-pre::-webkit-scrollbar-thumb {
  background: var(--sl-border);
  border-radius: 4px;
}
.sl-code-pre::-webkit-scrollbar-thumb:hover {
  background: var(--sl-text-muted);
}

/* Barra inferior de Expandir / Minimizar Código */
.sl-code-expand-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.75rem;
  background: var(--sl-tab-bg, rgba(0, 0, 0, 0.03));
  border-top: 1px solid var(--sl-border);
}

.sl-code-expand-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: transparent;
  border: none;
  color: var(--sl-accent);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.2rem 0.75rem;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.sl-code-expand-btn:hover {
  background: var(--sl-surface);
  color: var(--sl-text);
}

/* Controles Flutuantes de Rolagem de Código (Mobile & Desktop) */
.sl-code-scroll-controls {
  position: absolute;
  bottom: 38px; /* Acima da barra de expandir */
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  background: var(--sl-surface);
  border: 1px solid var(--sl-border);
  border-radius: 6px;
  padding: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(8px);
  z-index: 5;
  opacity: 0.85;
  transition: opacity 0.15s ease, transform 0.15s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.sl-code-block-long.sl-expanded .sl-code-scroll-controls {
  display: none;
}

.sl-code-block:hover .sl-code-scroll-controls,
.sl-code-scroll-controls:hover,
.sl-code-scroll-controls:focus-within {
  opacity: 1;
}

/* Brilho Neon no Container ao interagir com as setas */
.sl-code-scroll-controls:has(.sl-code-scroll-btn:active:not(.sl-disabled)) {
  border-color: var(--sl-accent);
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.45), 0 2px 8px rgba(0, 0, 0, 0.25);
}

.sl-code-scroll-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--sl-text);
  cursor: pointer;
  padding: 0;
  transition: background 0.12s ease, color 0.12s ease, opacity 0.12s ease, box-shadow 0.15s ease, transform 0.1s ease;
}

.sl-code-scroll-btn:hover:not(.sl-disabled) {
  background: var(--sl-hover, rgba(125, 125, 125, 0.15));
  color: var(--sl-accent);
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.35);
}

/* Efeito Neon Vibrante ao Clicar / Tocar (:active) */
.sl-code-scroll-btn:active:not(.sl-disabled) {
  color: var(--sl-accent);
  background: rgba(56, 189, 248, 0.2);
  box-shadow: 0 0 14px var(--sl-accent), inset 0 0 6px var(--sl-accent);
  filter: drop-shadow(0 0 6px var(--sl-accent));
  transform: scale(0.9);
}

.sl-code-scroll-btn.sl-disabled {
  opacity: 0.25;
  cursor: not-allowed;
  pointer-events: none;
}

.sl-code-body {
  display: block;
  width: 100%;
}

.sl-code-line {
  display: flex;
  align-items: baseline;
  min-height: 1.35rem;
  line-height: 1.35rem;
  transition: background 0.1s ease;
}

.sl-code-line:hover {
  background: rgba(125, 125, 125, 0.06);
}

.sl-line-num {
  width: 2.8rem;
  min-width: 2.8rem;
  text-align: right;
  padding: 0 0.65rem 0 0.5rem;
  color: var(--sl-text-muted);
  opacity: 0.45;
  user-select: none;
  -webkit-user-select: none;
  font-size: 0.72rem;
  line-height: 1.35rem;
  border-right: 1px solid var(--sl-border);
  flex-shrink: 0;
  box-sizing: border-box;
}

.sl-line-code {
  flex: 1;
  padding-left: 0.65rem;
  padding-right: 0.65rem;
  white-space: pre;
  color: var(--sl-text);
  font-size: 0.78rem;
  line-height: 1.35rem;
  tab-size: 2;
  word-break: normal;
  overflow-wrap: normal;
  box-sizing: border-box;
}

.sl-body pre {
  background: var(--sl-bg);
  border: 1px solid var(--sl-border);
  padding: 0.75rem;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.85em;
  margin: 0.5rem 0;
}

.sl-body pre code {
  background: transparent;
  border: none;
  padding: 0;
}

.sl-body blockquote {
  margin: 0.5rem 0;
  padding-left: 0.75rem;
  border-left: 3px solid var(--sl-accent);
  color: var(--sl-text-muted);
}

.sl-card-body a,
.sl-body a {
  color: var(--sl-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: opacity 0.15s ease;
}

.sl-card-body a:hover,
.sl-body a:hover {
  opacity: 0.85;
}

/* Imagens e GIFs Animados Embutidos (Delimitação e Harmonia) */
.sl-card-body img:not(.sl-emoji-inline),
.sl-preview-area img:not(.sl-emoji-inline),
.sl-body img:not(.sl-emoji-inline) {
  max-width: 100%;
  max-height: 280px;
  min-height: 80px;
  height: auto;
  width: auto;
  object-fit: contain;
  border-radius: var(--sl-radius-md, 8px);
  margin: 0.6rem 0;
  display: block;
  box-shadow: var(--sl-shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.15));
  border: 1px solid var(--sl-border);
  background: rgba(0, 0, 0, 0.05);
  cursor: zoom-in;
  transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.18s ease;
}

.sl-card-body img:not(.sl-emoji-inline):hover {
  transform: translateY(-2px) scale(1.008);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
}

.sl-card-body img.sl-emoji-inline,
.sl-preview-area img.sl-emoji-inline,
.sl-body img.sl-emoji-inline {
  display: inline-block;
  vertical-align: -0.2em;
  height: 1.3em;
  width: auto;
  margin: 0 0.15em;
  box-shadow: none;
}

/* Menções de Nicknames (@usuario) Estilo Chip / Tag */
.sl-mention {
  color: var(--sl-mention-color, var(--sl-accent)) !important;
  font-weight: 600;
  font-size: 0.88em;
  text-decoration: none !important;
  background: var(--sl-mention-bg, rgba(88, 166, 255, 0.14));
  padding: 0.12rem 0.45rem;
  border-radius: 5px;
  border: 1px solid var(--sl-mention-border, rgba(88, 166, 255, 0.28));
  display: inline-flex;
  align-items: center;
  line-height: 1.3;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.sl-mention:hover {
  background: var(--sl-mention-hover, rgba(88, 166, 255, 0.25));
  border-color: var(--sl-accent);
  color: var(--sl-accent-hover, var(--sl-accent)) !important;
}

/* Rodapé do Card (Reações, Responder e Áudio) */
.sl-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

.sl-actions-left {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.sl-reaction-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  background: var(--sl-bg);
  border: 1px solid var(--sl-border);
  color: var(--sl-text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.sl-reaction-btn:hover {
  border-color: var(--sl-accent);
  color: var(--sl-text);
}

.sl-reaction-btn.sl-active,
.sl-reaction-btn.sl-reacted {
  background: var(--sl-accent);
  color: var(--sl-accent-contrast, #ffffff);
  border-color: var(--sl-accent);
  font-weight: 600;
}

/* ========================================================
   REATIVIDADE ESTILO LINKEDIN (FLUTUANTE E SUMMARY)
   ======================================================== */
.sl-reaction-container {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.sl-reaction-trigger-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  background: var(--sl-bg);
  border: 1px solid var(--sl-border);
  color: var(--sl-text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.sl-reaction-trigger-btn:hover {
  border-color: var(--sl-accent);
  color: var(--sl-text);
  background: var(--sl-surface);
}

.sl-reaction-trigger-btn.sl-reacted {
  background: var(--sl-mention-bg, rgba(88, 166, 255, 0.14));
  border-color: var(--sl-accent);
  color: var(--sl-accent);
  font-weight: 600;
}

/* Popover Flutuante LinkedIn */
.sl-reaction-popover {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  background: var(--sl-surface);
  border: 1px solid var(--sl-border);
  border-radius: 9999px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.28), 0 4px 10px -2px rgba(0, 0, 0, 0.15);
  display: none;
  align-items: center;
  padding: 4px 8px;
  gap: 6px;
  z-index: 60;
  backdrop-filter: blur(8px);
  animation: sl-popover-in 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  white-space: nowrap;
}

@keyframes sl-popover-in {
  from {
    opacity: 0;
    transform: translateY(6px) scale(0.92);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Mostrar ao passar o mouse no container ou se estiver ativo (mobile tap) */
.sl-reaction-container:hover .sl-reaction-popover,
.sl-reaction-container.sl-popover-open .sl-reaction-popover {
  display: flex;
}

/* Área de segurança invisível abaixo do popover para o mouse não perder o hover */
.sl-reaction-popover::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -10px;
  height: 10px;
}

/* Botões do Picker com micro-animação */
.sl-reaction-picker-item {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.35rem;
  line-height: 1;
  padding: 4px 6px;
  border-radius: 50%;
  position: relative;
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.12s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sl-reaction-picker-item:hover {
  transform: translateY(-5px) scale(1.35);
  background: rgba(125, 125, 125, 0.12);
}

.sl-reaction-picker-item:active {
  transform: scale(0.95);
}

/* Tooltip elegante em cada emoji */
.sl-reaction-picker-item::before {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  background: rgba(15, 23, 42, 0.9);
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 500;
  padding: 2px 7px;
  border-radius: 4px;
  opacity: 0;
  pointer-events: none;
  transition: all 0.15s ease;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.sl-reaction-picker-item:hover::before {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* Resumo e Badges de Reações já recebidas */
.sl-reactions-summary {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.sl-reaction-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.45rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  background: var(--sl-bg);
  border: 1px solid var(--sl-border);
  color: var(--sl-text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.sl-reaction-badge:hover {
  border-color: var(--sl-accent);
  color: var(--sl-text);
  transform: translateY(-1px);
}

.sl-reaction-badge.sl-reacted {
  background: var(--sl-mention-bg, rgba(88, 166, 255, 0.14));
  border-color: var(--sl-accent);
  color: var(--sl-accent);
  font-weight: 600;
}

/* ========================================================
   MODAL DE INSERÇÃO SEGURA DE MÍDIA (ANTI-NSFW / CONTEÚDO ADULTO)
   ======================================================== */
.sl-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: sl-fade-in 0.15s ease-out forwards;
}

.sl-modal-box {
  background: var(--sl-surface);
  border: 1px solid var(--sl-border);
  border-radius: var(--sl-radius, 12px);
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.35), 0 8px 10px -6px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: sl-scale-up 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes sl-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes sl-scale-up {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.sl-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--sl-border);
}

.sl-modal-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--sl-text);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sl-modal-close-btn {
  background: transparent;
  border: none;
  color: var(--sl-text-muted);
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  padding: 0.25rem;
  border-radius: 4px;
}

.sl-modal-close-btn:hover {
  color: var(--sl-text);
}

.sl-modal-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sl-modal-notice {
  font-size: 0.78rem;
  color: var(--sl-text-muted);
  background: var(--sl-bg);
  border-left: 3px solid #22c55e;
  padding: 0.5rem 0.75rem;
  border-radius: 0 6px 6px 0;
  line-height: 1.4;
}

.sl-modal-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.sl-modal-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--sl-text);
}

.sl-modal-input {
  width: 100%;
  background: var(--sl-bg);
  border: 1px solid var(--sl-border);
  border-radius: 6px;
  padding: 0.6rem 0.75rem;
  font-size: 0.85rem;
  color: var(--sl-text);
  outline: none;
  transition: border-color 0.15s ease;
}

.sl-modal-input:focus {
  border-color: var(--sl-accent);
}

.sl-modal-input:disabled,
.sl-modal-input.sl-modal-input-disabled {
  opacity: 0.45;
  cursor: not-allowed;
  background: rgba(125, 125, 125, 0.08);
  border-style: dashed;
}

.sl-modal-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.sl-tag-exclusive-badge {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  background: rgba(125, 125, 125, 0.14);
  color: var(--sl-text-muted);
}

.sl-modal-error {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

/* Linha de Salvamento na Coleção (Modais de Mídia) */
.sl-modal-collection-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.15rem;
  margin-bottom: 0.2rem;
}

.sl-btn-save-collection {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 6px;
  background: var(--sl-bg);
  border: 1px dashed var(--sl-border);
  color: var(--sl-text-primary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.sl-btn-save-collection:hover {
  background: var(--sl-card-bg);
  border-color: var(--sl-accent);
  color: var(--sl-accent);
}

.sl-modal-success-badge {
  font-size: 0.75rem;
  font-weight: 500;
  color: #10b981;
  display: inline-flex;
  align-items: center;
}

.sl-modal-recents {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.sl-modal-recents-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--sl-text-muted);
}

.sl-confirm-clear-box {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 4px;
  padding: 0.15rem 0.45rem;
}

.sl-confirm-clear-text {
  font-size: 0.72rem;
  color: #ef4444;
  font-weight: 600;
}

.sl-confirm-clear-actions {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.sl-btn-confirm-yes {
  background: #ef4444;
  color: #ffffff;
  border: none;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 3px;
  padding: 0.1rem 0.4rem;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.sl-btn-confirm-yes:hover {
  opacity: 0.85;
}

.sl-btn-confirm-no {
  background: transparent;
  color: var(--sl-text-muted);
  border: 1px solid var(--sl-border);
  font-size: 0.7rem;
  border-radius: 3px;
  padding: 0.1rem 0.35rem;
  cursor: pointer;
  transition: color 0.15s ease;
}

.sl-btn-confirm-no:hover {
  color: var(--sl-text-primary);
}

.sl-btn-clear-recents {
  background: transparent;
  border: none;
  font-size: 0.72rem;
  color: var(--sl-text-muted);
  cursor: pointer;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  transition: color 0.15s ease;
}

.sl-modal-recents-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sl-btn-manage-recents,
.sl-btn-clear-recents {
  background: transparent;
  border: none;
  font-size: 0.72rem;
  color: var(--sl-text-muted);
  cursor: pointer;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.sl-btn-manage-recents:hover {
  color: var(--sl-accent);
}

.sl-btn-manage-recents.sl-active {
  color: var(--sl-accent);
  font-weight: 600;
}

.sl-btn-clear-recents:hover {
  color: #ef4444;
}

.sl-modal-recents-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.45rem;
  max-height: 175px;
  overflow-y: auto;
  padding-right: 2px;
}

.sl-modal-recents-grid::-webkit-scrollbar {
  width: 4px;
}
.sl-modal-recents-grid::-webkit-scrollbar-track {
  background: transparent;
}
.sl-modal-recents-grid::-webkit-scrollbar-thumb {
  background: var(--sl-border);
  border-radius: 4px;
}

.sl-recent-gif-wrapper {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
}

.sl-recent-gif-item {
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 6px;
  border: 1px solid var(--sl-border);
  overflow: hidden;
  background: var(--sl-bg);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease;
}

.sl-recent-gif-item:hover {
  transform: scale(1.03);
  border-color: var(--sl-accent);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.sl-recent-gif-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Botão de Exclusão Individual de Mídia Recente (GIF ou Imagem) */
.sl-btn-delete-recent-gif,
.sl-btn-delete-recent-image {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(4px);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.85);
  transition: opacity 0.15s ease, transform 0.15s ease, background 0.15s ease;
  z-index: 2;
  padding: 0;
}

.sl-recent-gif-wrapper:hover .sl-btn-delete-recent-gif,
.sl-recent-gif-wrapper:hover .sl-btn-delete-recent-image,
.sl-recent-gif-wrapper:focus-within .sl-btn-delete-recent-gif,
.sl-recent-gif-wrapper:focus-within .sl-btn-delete-recent-image {
  opacity: 1;
  transform: scale(1);
}

.sl-managing-recents .sl-btn-delete-recent-gif,
.sl-managing-recents .sl-btn-delete-recent-image {
  opacity: 1;
  transform: scale(1);
  background: #ef4444;
  border-color: #ef4444;
}

.sl-btn-delete-recent-gif:hover,
.sl-btn-delete-recent-image:hover {
  background: #dc2626;
  border-color: #dc2626;
  transform: scale(1.1);
}

@media (max-width: 640px) {
  .sl-modal-recents-grid {
    grid-template-columns: repeat(3, 1fr);
    max-height: 160px;
  }
}

/* Novo Card Moderno de Upload e Drag & Drop */
.sl-modal-dropzone {
  border: 2px dashed var(--sl-border);
  border-radius: 10px;
  padding: 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--sl-bg);
  text-align: center;
  transition: all 0.2s ease;
  user-select: none;
}

.sl-modal-dropzone:hover {
  border-color: var(--sl-accent);
  background: rgba(56, 189, 248, 0.03);
}

.sl-modal-dropzone.sl-drag-over {
  border-color: var(--sl-accent);
  background: rgba(56, 189, 248, 0.12);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.3);
  transform: scale(1.01);
}

.sl-dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  width: 100%;
}

.sl-dropzone-icon {
  color: var(--sl-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08));
  transition: transform 0.2s ease;
}

.sl-modal-dropzone:hover .sl-dropzone-icon {
  transform: translateY(-2px);
}

.sl-dropzone-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--sl-text);
}

.sl-dropzone-divider {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--sl-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0.15rem 0;
}

.sl-dropzone-divider::before,
.sl-dropzone-divider::after {
  content: '';
  display: block;
  width: 24px;
  height: 1px;
  background: var(--sl-border);
}

.sl-btn-browse {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid var(--sl-border);
  background: var(--sl-accent);
  color: #fff;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sl-btn-browse:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Card do Arquivo Selecionado */
.sl-file-selected-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: rgba(125, 125, 125, 0.06);
  border: 1px solid var(--sl-accent);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.sl-file-card-preview {
  width: 46px;
  height: 46px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--sl-border);
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sl-file-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sl-file-card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.sl-file-card-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--sl-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sl-file-card-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
  color: var(--sl-text-muted);
}

.sl-file-card-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  font-weight: 600;
  font-size: 0.7rem;
}

.sl-file-size-warning {
  font-size: 0.72rem;
  color: #f59e0b;
  margin-top: 0.2rem;
  line-height: 1.3;
}

.sl-btn-remove-file {
  background: transparent;
  border: 1px solid var(--sl-border);
  color: var(--sl-text-muted);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.sl-btn-remove-file:hover {
  background: #ef4444;
  border-color: #ef4444;
  color: #fff;
  transform: scale(1.08);
}

/* Card de Prévia da URL */
.sl-url-preview-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.45rem 0.65rem;
  border-radius: 6px;
  background: rgba(125, 125, 125, 0.05);
  border: 1px solid var(--sl-border);
  margin-top: 0.35rem;
}

.sl-url-preview-img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid var(--sl-border);
}

.sl-url-preview-label {
  font-size: 0.75rem;
  color: var(--sl-text-muted);
  font-weight: 500;
}

.sl-modal-preview-box {
  border: 1px dashed var(--sl-border);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 110px;
  background: var(--sl-bg);
  text-align: center;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.sl-modal-preview-box.sl-drag-over {
  border-color: var(--sl-accent);
  background: rgba(56, 189, 248, 0.1);
  box-shadow: 0 0 0 2px var(--sl-accent-glow, rgba(56, 189, 248, 0.3));
}

.sl-modal-preview-img {
  max-width: 100%;
  max-height: 180px;
  object-fit: contain;
  border-radius: 4px;
}

.sl-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--sl-border);
  background: var(--sl-bg);
}

.sl-blocked-media-notice {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  font-size: 0.78rem;
  font-weight: 500;
  margin: 0.5rem 0;
}

.sl-embedded-img {
  max-width: min(100%, 520px);
  width: auto;
  max-height: 420px;
  object-fit: contain;
  border-radius: 8px;
  display: block;
  margin: 0.6rem 0;
  border: 1px solid var(--sl-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.15s ease;
}

.sl-embedded-img:hover {
  border-color: var(--sl-accent);
}

.sl-actions-right {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-left: auto;
  flex-wrap: wrap;
}

/* Botão de Tradução Consolidado (Canto Inferior Direito ao lado de Ouvir) */
.sl-translate-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  background: transparent;
  border: 1px solid var(--sl-border);
  color: var(--sl-text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1.3;
  text-decoration: none;
  white-space: nowrap;
}

.sl-translate-btn:hover {
  background: var(--sl-bg);
  border-color: var(--sl-accent);
  color: var(--sl-accent);
}

.sl-translate-btn.sl-translated {
  background: var(--sl-mention-bg, rgba(88, 166, 255, 0.14));
  border-color: var(--sl-mention-border, var(--sl-accent));
  color: var(--sl-mention-color, var(--sl-accent));
  font-weight: 600;
}

/* Botão de Responder (Estilo LinkedIn / Reddit) */
.sl-reply-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  background: transparent;
  border: 1px solid transparent;
  color: var(--sl-text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.sl-reply-btn:hover {
  background: var(--sl-bg);
  border-color: var(--sl-border);
  color: var(--sl-accent);
}

/* Botão de Áudio (Web Speech API) */
.sl-audio-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  background: transparent;
  border: 1px solid var(--sl-border);
  color: var(--sl-text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.sl-audio-btn:hover {
  color: var(--sl-accent);
  border-color: var(--sl-accent);
}

.sl-audio-btn.sl-audio-playing {
  background: var(--sl-accent);
  color: var(--sl-accent-contrast, #ffffff);
  border-color: var(--sl-accent);
  animation: sl-pulse 1.5s infinite;
}

@keyframes sl-pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

/* Respostas Aninhadas (Threads Estilo LinkedIn com Linha Guia) */
.sl-thread {
  margin-top: 0.75rem;
  padding-left: 1.5rem;
  border-left: 2px solid var(--sl-border);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sl-card-reply,
.sl-reply-card {
  background: var(--sl-bg);
  border: 1px solid var(--sl-border);
  border-radius: var(--sl-radius, 8px);
  padding: 0.85rem;
}

.sl-card-reply .sl-avatar,
.sl-reply-card .sl-avatar {
  width: 26px;
  height: 26px;
}

/* Botão de Toggle de Thread (Ver mais respostas / Recolher) */
.sl-thread-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: 1px dashed var(--sl-border);
  border-radius: 6px;
  color: var(--sl-text-muted);
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.35rem 0.65rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  margin-top: 0.25rem;
  align-self: flex-start;
}

.sl-thread-toggle-btn:hover {
  background: var(--sl-surface);
  border-color: var(--sl-accent);
  color: var(--sl-accent);
  transform: translateY(-1px);
}

/* Caixa de Resposta Inline */
.sl-inline-composer {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: var(--sl-bg);
  border: 1px solid var(--sl-border);
  border-radius: 8px;
}

.sl-inline-composer textarea {
  width: 100%;
  min-height: 60px;
  background: var(--sl-surface);
  border: 1px solid var(--sl-border);
  border-radius: 6px;
  padding: 0.5rem;
  color: var(--sl-text);
  font-family: inherit;
  font-size: 0.85rem;
  resize: vertical;
  outline: none;
  display: block;
}

.sl-inline-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

/* ========================================================
   PAGINAÇÃO INTELIGENTE & ROLAGEM SUAVE
   ======================================================== */
.sl-list {
  scrollbar-width: thin;
  scrollbar-color: var(--sl-border) transparent;
}

.sl-list::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.sl-list::-webkit-scrollbar-track {
  background: transparent;
}

.sl-list::-webkit-scrollbar-thumb {
  background: var(--sl-border);
  border-radius: 9999px;
}

.sl-list::-webkit-scrollbar-thumb:hover {
  background: var(--sl-accent);
}

.sl-pagination {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--sl-border);
}

.sl-pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  justify-content: center;
}

.sl-page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--sl-border);
  background: var(--sl-surface);
  color: var(--sl-text);
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

.sl-page-btn:hover:not(:disabled) {
  background: var(--sl-bg);
  border-color: var(--sl-accent);
  color: var(--sl-accent);
  transform: translateY(-1px);
}

.sl-page-btn.sl-page-active {
  background: var(--sl-accent);
  border-color: var(--sl-accent);
  color: var(--sl-accent-contrast, #ffffff);
  font-weight: 600;
  box-shadow: 0 2px 8px var(--sl-accent-glow, rgba(0, 0, 0, 0.15));
}

.sl-page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  border-color: var(--sl-border);
  color: var(--sl-text-muted);
}

.sl-page-nav-btn {
  padding: 0 0.65rem;
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.sl-pagination-info {
  font-size: 0.78rem;
  color: var(--sl-text-muted);
  user-select: none;
}

/* ========================================================
   DEFINIÇÕES DE TEMAS
   ======================================================== */

/* 0. Auto / Camaleão (Herda ou Auto-computa do Blog) */
:host([theme="auto"]),
:host(:not([theme])) {
  --sl-bg: var(--page-bg, var(--color-bg, #ffffff));
  --sl-surface: var(--page-card-bg, var(--color-surface, #ffffff));
  --sl-tab-bg: var(--page-tab-bg, rgba(0, 0, 0, 0.03));
  --sl-text: var(--page-text, var(--color-text, #1c1917));
  --sl-text-muted: var(--page-text-muted, #78716c);
  --sl-border: var(--page-border, var(--color-border, #e7e5e4));
  --sl-accent: var(--page-accent, var(--color-accent, #92400e));
  --sl-accent-hover: var(--page-accent-hover, var(--color-accent-hover, #b45309));
  --sl-accent-contrast: #ffffff;
  --sl-accent-glow: rgba(146, 64, 14, 0.25);
  --sl-mention-color: var(--page-accent, var(--color-accent, #92400e));
  --sl-mention-bg: rgba(146, 64, 14, 0.12);
  --sl-mention-border: rgba(146, 64, 14, 0.25);
}

/* 1. Cream (Warm Paper / Marginalia) */
:host([theme="cream"]) {
  --sl-bg: #f7f4ea;
  --sl-surface: #ffffff;
  --sl-tab-bg: #f0ebe0;
  --sl-text: #2c2724;
  --sl-text-muted: #78716c;
  --sl-border: #ded7c6;
  --sl-accent: #92400e;
  --sl-accent-hover: #b45309;
  --sl-accent-contrast: #ffffff;
  --sl-accent-glow: rgba(146, 64, 14, 0.25);
  --sl-mention-color: #92400e;
  --sl-mention-bg: rgba(146, 64, 14, 0.1);
  --sl-mention-border: rgba(146, 64, 14, 0.25);
}

/* 2. Midnight (Dark OLED) */
:host([theme="midnight"]) {
  --sl-bg: #0d1117;
  --sl-surface: #161b22;
  --sl-tab-bg: #090d13;
  --sl-text: #e6edf3;
  --sl-text-muted: #8b949e;
  --sl-border: #30363d;
  --sl-accent: #58a6ff;
  --sl-accent-hover: #79c0ff;
  --sl-accent-contrast: #0d1117;
  --sl-accent-glow: rgba(88, 166, 255, 0.25);
  --sl-mention-color: #79c0ff;
  --sl-mention-bg: rgba(56, 139, 253, 0.16);
  --sl-mention-border: rgba(56, 139, 253, 0.35);
  --sl-btn-primary-bg: #1f6feb;
  --sl-btn-primary-hover: #388bfd;
}

/* 3. Slate (Ardósia Naval / Vercel-style) */
:host([theme="slate"]) {
  --sl-bg: #0f172a;
  --sl-surface: #1e293b;
  --sl-tab-bg: #0b1120;
  --sl-text: #f8fafc;
  --sl-text-muted: #94a3b8;
  --sl-border: #334155;
  --sl-accent: #38bdf8;
  --sl-accent-hover: #0ea5e9;
  --sl-accent-contrast: #0f172a;
  --sl-accent-glow: rgba(56, 189, 248, 0.25);
  --sl-mention-color: #7dd3fc;
  --sl-mention-bg: rgba(56, 189, 248, 0.16);
  --sl-mention-border: rgba(56, 189, 248, 0.35);
  --sl-btn-primary-bg: #0284c7;
  --sl-btn-primary-hover: #0369a1;
}

/* 4. Clean White (Minimalista) */
:host([theme="clean-white"]) {
  --sl-bg: #ffffff;
  --sl-surface: #f8fafc;
  --sl-tab-bg: #f1f5f9;
  --sl-text: #0f172a;
  --sl-text-muted: #64748b;
  --sl-border: #e2e8f0;
  --sl-accent: #2563eb;
  --sl-accent-hover: #1d4ed8;
  --sl-accent-contrast: #ffffff;
  --sl-accent-glow: rgba(37, 99, 235, 0.2);
  --sl-mention-color: #1d4ed8;
  --sl-mention-bg: rgba(37, 99, 235, 0.1);
  --sl-mention-border: rgba(37, 99, 235, 0.25);
}

/* 5. Terminal (Monospace CRT) */
:host([theme="terminal"]) {
  --sl-bg: #0a0e14;
  --sl-surface: #010409;
  --sl-tab-bg: #000000;
  --sl-text: #00ff66;
  --sl-text-muted: #009933;
  --sl-border: #00ff6633;
  --sl-accent: #00ff66;
  --sl-accent-hover: #33ff88;
  --sl-accent-contrast: #000000;
  --sl-accent-glow: rgba(0, 255, 102, 0.3);
  --sl-mention-color: #33ff88;
  --sl-mention-bg: rgba(0, 255, 102, 0.16);
  --sl-mention-border: rgba(0, 255, 102, 0.35);
  --sl-font: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, monospace;
}

/* 6. High Contrast (Acessibilidade Visual Máxima) */
:host([theme="high-contrast"]) {
  --sl-bg: #000000;
  --sl-surface: #0a0a0a;
  --sl-tab-bg: #141414;
  --sl-text: #ffffff;
  --sl-text-muted: #cccccc;
  --sl-border: #ffffff;
  --sl-accent: #ffff00;
  --sl-accent-hover: #ffff66;
  --sl-accent-contrast: #000000;
  --sl-accent-glow: rgba(255, 255, 0, 0.5);
  --sl-mention-color: #ffff00;
  --sl-mention-bg: rgba(255, 255, 0, 0.2);
  --sl-mention-border: rgba(255, 255, 0, 0.5);
}

/* 7. Protanopia & Deuteranopia (Daltonismo Calibrado) */
:host([theme="protanopia"]) {
  --sl-bg: #0e1726;
  --sl-surface: #1b263b;
  --sl-tab-bg: #0d1b2a;
  --sl-text: #e0e1dd;
  --sl-text-muted: #a0abbd;
  --sl-border: #415a77;
  --sl-accent: #f4d03f;
  --sl-accent-hover: #f7dc6f;
  --sl-accent-contrast: #0e1726;
  --sl-accent-glow: rgba(244, 208, 63, 0.3);
  --sl-mention-color: #f7dc6f;
  --sl-mention-bg: rgba(244, 208, 63, 0.16);
  --sl-mention-border: rgba(244, 208, 63, 0.35);
}

/* Respeito a Preferência de Redução de Movimento */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}

/* 8. Barra de Gestão e Moderação (Cloudflare KV) */
.sl-moderation-bar {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  background: var(--sl-surface);
  border: 1px dashed var(--sl-border);
  border-left: 3px solid var(--sl-accent);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.25rem;
  font-size: 0.82rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.sl-mod-bar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--sl-text);
}

.sl-mod-bar-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.sl-mod-bar-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.sl-mod-refresh-btn,
.sl-mod-toggle-btn {
  background: transparent;
  border: 1px solid var(--sl-border);
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
  color: var(--sl-text-muted);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  transition: all 0.15s ease;
}

.sl-mod-refresh-btn:hover,
.sl-mod-toggle-btn:hover {
  color: var(--sl-text);
  border-color: var(--sl-accent);
  background: var(--sl-hover, rgba(125, 125, 125, 0.08));
}

.sl-mod-chevron {
  display: inline-block;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  transform: rotate(0deg);
}

.sl-mod-chevron-open {
  transform: rotate(180deg);
}

.sl-mod-subcard {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: var(--sl-input-bg, rgba(125, 125, 125, 0.05));
  border: 1px solid var(--sl-border);
  border-radius: 6px;
  padding: 0.45rem 0.55rem;
  transition: all 0.2s ease;
}

.sl-mod-subcard-collapsed {
  display: none !important;
}

.sl-mod-pills {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.sl-mod-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.18s ease;
  user-select: none;
  line-height: 1.2;
}

.sl-mod-pill-neutral {
  background: var(--sl-surface, rgba(125, 125, 125, 0.08));
  color: var(--sl-text-muted);
  border-color: var(--sl-border);
}

.sl-mod-pill-neutral:hover {
  background: var(--sl-hover, rgba(125, 125, 125, 0.14));
  color: var(--sl-text);
  border-color: var(--sl-border-focus, var(--sl-accent));
}

.sl-mod-pill-ban-active {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.35);
}

.sl-mod-pill-ban-active:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.55);
}

.sl-mod-pill-media-active {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
  border-color: rgba(245, 158, 11, 0.35);
}

.sl-mod-pill-media-active:hover {
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(245, 158, 11, 0.55);
}

.sl-mod-pill-open {
  box-shadow: 0 0 0 1px currentColor;
}

.sl-mod-pill-arrow {
  font-size: 0.65rem;
  opacity: 0.8;
  display: inline-block;
  transition: transform 0.18s ease;
}

.sl-mod-drawer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
  padding: 0.45rem 0.55rem;
  background: var(--sl-surface);
  border: 1px solid var(--sl-border);
  border-radius: 6px;
  animation: slFadeSlideDown 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slFadeSlideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sl-mod-empty-text {
  font-size: 0.78rem;
  color: var(--sl-text-muted);
  font-style: italic;
  padding: 0.2rem 0.25rem;
}

.sl-mod-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.sl-mod-chip-user {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  vertical-align: middle;
}

.sl-mod-chip-action {
  font-weight: 600;
  font-size: 0.7rem;
  opacity: 0.9;
}

.sl-mod-chip-ban {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.sl-mod-chip-media {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.sl-mod-chip-remove {
  background: transparent;
  border: none;
  color: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0 0.15rem;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.15s ease;
}

.sl-mod-chip-remove:hover {
  opacity: 1;
}

/* ==========================================================================
   MINI-LIGHTBOX NATIVO COM PAN & ZOOM (EXPANSÃO DE IMAGENS DE COMENTÁRIOS)
   ========================================================================== */
.sl-lightbox-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100000;
  background: rgba(8, 8, 11, 0.94);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: slFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  touch-action: none;
  user-select: none;
}

.sl-lightbox-toolbar {
  position: absolute;
  top: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100010;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  background: rgba(22, 24, 29, 0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  max-width: 90vw;
  color: #f3f4f6;
  font-family: inherit;
}

.sl-lightbox-caption {
  font-size: 0.82rem;
  font-weight: 500;
  color: #9ca3af;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sl-lightbox-controls {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.sl-lightbox-btn {
  background: transparent;
  border: none;
  color: #d1d5db;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
}

.sl-lightbox-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.sl-lightbox-btn:active {
  transform: scale(0.95);
}

.sl-lightbox-btn-close {
  margin-left: 0.3rem;
  border-left: 1px solid rgba(255, 255, 255, 0.12);
  padding-left: 0.5rem;
  border-radius: 0 6px 6px 0;
  width: 34px;
}

.sl-lightbox-btn-close:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.sl-lightbox-level {
  font-size: 0.78rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: #e5e7eb;
  min-width: 48px;
  text-align: center;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.sl-lightbox-stage {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: grab;
}

.sl-lightbox-stage.is-dragging {
  cursor: grabbing !important;
}

.sl-lightbox-img {
  max-width: 88vw;
  max-height: 82vh;
  object-fit: contain;
  pointer-events: auto;
  user-select: none;
  -webkit-user-drag: none;
  transform-origin: center center;
  transition: transform 0.08s ease-out;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6);
  border-radius: 4px;
}

.sl-lightbox-img.is-panning {
  transition: none !important;
}

.sl-lightbox-hint {
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100010;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  pointer-events: none;
  background: rgba(0, 0, 0, 0.45);
  padding: 0.3rem 0.85rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  white-space: nowrap;
}
`;

