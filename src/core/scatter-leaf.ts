import { baseStyles } from '../themes/styles';
import type { ThemeName, ScatterComment, EditorTab, FontMode, CurrentUser, ModerationRecord, ModerationAction } from '../types';
import { ScatterBrokerClient, ScatterAuthError } from './broker-client';

const SKIN_TONE_STORAGE_KEY = 'scatterleaf_skin_tone';

interface SkinToneOption {
  id: string;
  namePt: string;
  nameEn: string;
  modifier: string;
  swatch: string;
}

const SKIN_TONES: SkinToneOption[] = [
  { id: 'default', namePt: 'Padrão (Amarelo)', nameEn: 'Default (Yellow)', modifier: '', swatch: '🟡' },
  { id: 'light', namePt: 'Tom Claro', nameEn: 'Light Skin Tone', modifier: '\u{1F3FB}', swatch: '🏻' },
  { id: 'medium-light', namePt: 'Tom Médio-Claro', nameEn: 'Medium-Light Skin Tone', modifier: '\u{1F3FC}', swatch: '🏼' },
  { id: 'medium', namePt: 'Tom Médio', nameEn: 'Medium Skin Tone', modifier: '\u{1F3FD}', swatch: '🏽' },
  { id: 'medium-dark', namePt: 'Tom Médio-Escuro', nameEn: 'Medium-Dark Skin Tone', modifier: '\u{1F3FE}', swatch: '🏾' },
  { id: 'dark', namePt: 'Tom Escuro', nameEn: 'Dark Skin Tone', modifier: '\u{1F3FF}', swatch: '🏿' },
];

const TONEABLE_EMOJIS = new Set([
  '👍', '👎', '👏', '🙌', '👐', '🤝', '🙏',
  '✌️', '🤘', '🤙', '👊', '✊', '🤛', '🤜',
  '🤞', '🫶', '👋', '🖐️', '✋', '🖖', '💪',
  '✍️', '💅', '🤳', '👂', '👃', '👶', '🧒',
  '👦', '👧', '🧑', '👨', '👩', '🧓', '👴',
  '👵', '🧙', '🧙‍♂️', '🧙‍♀️',
]);

function applySkinTone(emoji: string, toneModifier: string | null): string {
  if (!toneModifier || toneModifier === 'default') return emoji;

  // Se for uma sequência composta ZWJ (como 🧙‍♂️ ou 🧙‍♀️)
  // O modificador de tom de pele deve ser inserido imediatamente após o caractere base (🧙),
  // e NUNCA após o símbolo de gênero (♂ / ♀), evitando falhas de glifo [▒]
  if (emoji.includes('\u200D')) {
    const parts = emoji.split('\u200D');
    const basePart = parts[0]
      .replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '')
      .replace(/\uFE0F/g, '');
    return `${basePart}${toneModifier}\u200D${parts.slice(1).join('\u200D')}`;
  }

  const cleanEmoji = emoji
    .replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '')
    .replace(/\uFE0F/g, '');
  return cleanEmoji + toneModifier;
}

export interface LinkedInReaction {
  symbol: string;
  namePt: string;
  nameEn: string;
}

export const LINKEDIN_REACTIONS: LinkedInReaction[] = [
  { symbol: '👍', namePt: 'Gostei', nameEn: 'Like' },
  { symbol: '❤️', namePt: 'Amei', nameEn: 'Love' },
  { symbol: '🚀', namePt: 'Sensacional', nameEn: 'Rocket' },
  { symbol: '🎉', namePt: 'Parabéns', nameEn: 'Celebrate' },
  { symbol: '😄', namePt: 'Divertido', nameEn: 'Laugh' },
  { symbol: '👀', namePt: 'De olho', nameEn: 'Eyes' },
];

export interface CodeLanguageOption {
  id: string;
  name: string;
}

export const POPULAR_CODE_LANGUAGES: CodeLanguageOption[] = [
  { id: 'typescript', name: 'TypeScript' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'python', name: 'Python' },
  { id: 'bash', name: 'Bash / Shell' },
  { id: 'html', name: 'HTML' },
  { id: 'css', name: 'CSS' },
  { id: 'json', name: 'JSON' },
  { id: 'sql', name: 'SQL' },
  { id: 'rust', name: 'Rust' },
  { id: 'go', name: 'Go' },
];


const RECENT_GIFS_STORAGE_KEY = 'scatterleaf_recent_gifs';

export interface RecentGifItem {
  url: string;
  alt?: string;
  timestamp: number;
}

function getStoredRecentGifs(): RecentGifItem[] {
  try {
    const raw = localStorage.getItem(RECENT_GIFS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function storeRecentGif(url: string, alt?: string): void {
  try {
    const list = getStoredRecentGifs().filter((g) => g.url !== url);
    list.unshift({ url, alt: alt || '', timestamp: Date.now() });
    localStorage.setItem(RECENT_GIFS_STORAGE_KEY, JSON.stringify(list.slice(0, 24)));
  } catch {}
}

function removeStoredRecentGif(url: string): void {
  try {
    const list = getStoredRecentGifs().filter((g) => g.url !== url);
    localStorage.setItem(RECENT_GIFS_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

function clearStoredRecentGifs(): void {
  try {
    localStorage.removeItem(RECENT_GIFS_STORAGE_KEY);
  } catch {}
}

const RECENT_IMAGES_STORAGE_KEY = 'scatterleaf_recent_images';

export interface RecentImageItem {
  url: string;
  alt?: string;
  timestamp: number;
}

function getStoredRecentImages(): RecentImageItem[] {
  try {
    const raw = localStorage.getItem(RECENT_IMAGES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function storeRecentImage(url: string, alt?: string): void {
  try {
    const list = getStoredRecentImages().filter((img) => img.url !== url);
    list.unshift({ url, alt: alt || '', timestamp: Date.now() });
    localStorage.setItem(RECENT_IMAGES_STORAGE_KEY, JSON.stringify(list.slice(0, 24)));
  } catch {}
}

function removeStoredRecentImage(url: string): void {
  try {
    const list = getStoredRecentImages().filter((img) => img.url !== url);
    localStorage.setItem(RECENT_IMAGES_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

function clearStoredRecentImages(): void {
  try {
    localStorage.removeItem(RECENT_IMAGES_STORAGE_KEY);
  } catch {}
}

export const BLOCKED_MEDIA_DOMAINS = [
  'pornhub.com',
  'xvideos.com',
  'xnxx.com',
  'redtube.com',
  'youporn.com',
  'chaturbate.com',
  'onlyfans.com',
  'fansly.com',
  'rule34.xxx',
  'gelbooru.com',
  'danbooru.donmai.us',
  'e621.net',
  'hentaihaven.xxx',
  'xhamster.com',
  'tube8.com',
  'beeg.com',
  'spankbang.com',
  'brazzers.com',
  'bangbros.com',
  'fetlife.com',
  'cam4.com',
  'stripchat.com',
  'livejasmin.com',
  'erome.com',
  'heavy-r.com',
  'bestgore.fun',
  'kaotic.com',
  'motherless.com',
];

export const BLOCKED_MEDIA_KEYWORDS = [
  'porn',
  'xxx',
  'hentai',
  'nsfw',
  'nude',
  'naked',
  'erotic',
  'boobs',
  'pussy',
  'dick',
  'cock',
  'vagina',
  'hardcore',
  'anal',
  'blowjob',
  'creampie',
  'milf',
  'bdsm',
  'fetish',
  'gore',
  'onlyfans',
  'escort',
  'sex',
];

export function isSafeMediaUrl(rawUrl: string): { safe: boolean; reason?: string } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { safe: false, reason: 'URL inválida ou ausente.' };
  }

  const trimmed = rawUrl.trim();

  if (!trimmed.startsWith('https://')) {
    return {
      safe: false,
      reason: 'Por segurança e privacidade, apenas links seguros (HTTPS) são permitidos.',
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { safe: false, reason: 'Formato de URL inválido.' };
  }

  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname.toLowerCase();
  const search = parsed.search.toLowerCase();
  const fullPath = hostname + pathname + search;

  for (const domain of BLOCKED_MEDIA_DOMAINS) {
    if (hostname === domain || hostname.endsWith('.' + domain)) {
      return {
        safe: false,
        reason: 'Domínio bloqueado pelo filtro de conteúdo sensível / adulto.',
      };
    }
  }

  for (const keyword of BLOCKED_MEDIA_KEYWORDS) {
    const regex = new RegExp(`(^|[-_/.?&=])${keyword}([-_/.?&=]|$)`, 'i');
    if (regex.test(fullPath)) {
      return {
        safe: false,
        reason: 'O link contém termos classificados como potencialmente sensíveis ou adultos.',
      };
    }
  }

  return { safe: true };
}

export type SupportedMediaFormat = 'gif' | 'png' | 'jpeg' | 'webp';

/**
 * Validação de Assinatura Binária (Magic Bytes) para Imagens e GIFs
 * Garante que o arquivo é autenticamente uma imagem e não um script/executável malicioso.
 */
export async function validateImageMagicBytes(
  file: File
): Promise<{ valid: boolean; format?: SupportedMediaFormat }> {
  try {
    const slice = file.slice(0, 16);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    if (bytes.length < 4) return { valid: false };

    // 1. GIF: 'GIF87a' ou 'GIF89a'
    if (bytes.length >= 6) {
      const header6 = String.fromCharCode(...bytes.slice(0, 6));
      if (header6 === 'GIF87a' || header6 === 'GIF89a') {
        return { valid: true, format: 'gif' };
      }
    }

    // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
    if (bytes.length >= 8) {
      if (
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47 &&
        bytes[4] === 0x0d &&
        bytes[5] === 0x0a &&
        bytes[6] === 0x1a &&
        bytes[7] === 0x0a
      ) {
        return { valid: true, format: 'png' };
      }
    }

    // 3. JPEG: FF D8 FF
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return { valid: true, format: 'jpeg' };
    }

    // 4. WebP: RIFF .... WEBP
    if (bytes.length >= 12) {
      const riff = String.fromCharCode(...bytes.slice(0, 4));
      const webp = String.fromCharCode(...bytes.slice(8, 12));
      if (riff === 'RIFF' && webp === 'WEBP') {
        return { valid: true, format: 'webp' };
      }
    }

    return { valid: false };
  } catch {
    return { valid: false };
  }
}

/**
 * Filtro de Segurança e Validação de Arquivo Local de Imagem/GIF
 * Valida limite de tamanho (3 MB), sanitização de termos adultos no nome e Magic Bytes.
 */
export async function isSafeMediaFile(
  file: File,
  isPt: boolean = true
): Promise<{ safe: boolean; format?: SupportedMediaFormat; reason?: string }> {
  if (!file) {
    return { safe: false, reason: isPt ? 'Nenhum arquivo fornecido.' : 'No file provided.' };
  }

  // 1. Limite estrito de tamanho de entrada (máx 3 MB)
  const MAX_CLIENT_BYTES = 3 * 1024 * 1024; // 3 MB
  if (file.size > MAX_CLIENT_BYTES) {
    return {
      safe: false,
      reason: isPt
        ? 'Arquivo excede o limite máximo permitido de 3 MB.'
        : 'File exceeds maximum allowed size of 3 MB.',
    };
  }

  // 2. Sanitização de Nome (Filtro Anti-NSFW de termos no nome do arquivo)
  const name = file.name.toLowerCase();
  for (const keyword of BLOCKED_MEDIA_KEYWORDS) {
    const regex = new RegExp(`(^|[-_/.?&=])${keyword}([-_/.?&=]|$)`, 'i');
    if (regex.test(name)) {
      return {
        safe: false,
        reason: isPt
          ? 'O nome do arquivo contém termos classificados como potencialmente sensíveis ou adultos.'
          : 'File name contains terms classified as potentially sensitive or adult content.',
      };
    }
  }

  // 3. Validação binária estrita (Magic Bytes)
  const magicCheck = await validateImageMagicBytes(file);
  if (!magicCheck.valid || !magicCheck.format) {
    return {
      safe: false,
      reason: isPt
        ? 'Cabeçalho binário inválido. O arquivo não é uma imagem legítima (.gif, .webp, .png, .jpg).'
        : 'Invalid binary header. File is not a legitimate image (.gif, .webp, .png, .jpg).',
    };
  }

  return { safe: true, format: magicCheck.format };
}

/**
 * Otimizador Instantâneo de Imagem no Cliente (Canvas Nativo)
 * - Imagens estáticas (.webp, .png, .jpeg): redimensiona proporcionalmente para largura máx 520px e comprime em WebP (qualidade 82%).
 * - GIFs animados (.gif): preserva integralmente os frames da animação sem converter para canvas estático.
 */
export async function optimizeMediaFile(
  file: File,
  format: SupportedMediaFormat,
  maxDim = 520,
  quality = 0.82
): Promise<{
  dataUrl: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
  wasCompressed: boolean;
}> {
  // Para GIF animado: lê os bytes originais via FileReader para preservar 100% da animação
  if (format === 'gif') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const img = new Image();
        img.onload = () => {
          resolve({
            dataUrl,
            width: img.naturalWidth || 480,
            height: img.naturalHeight || 320,
            originalSize: file.size,
            compressedSize: file.size,
            wasCompressed: false,
          });
        };
        img.onerror = () => {
          resolve({
            dataUrl,
            width: 480,
            height: 320,
            originalSize: file.size,
            compressedSize: file.size,
            wasCompressed: false,
          });
        };
        img.src = dataUrl;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Para imagens estáticas (.webp, .png, .jpeg): Redimensionamento nativo Canvas instantâneo (~15-30ms)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;

        // Redimensiona proporcionalmente se exceder a dimensão ideal
        if (w > maxDim || h > maxDim) {
          if (w >= h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            dataUrl: rawDataUrl,
            width: w,
            height: h,
            originalSize: file.size,
            compressedSize: file.size,
            wasCompressed: false,
          });
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);

        // Exporta em WebP otimizado (ou JPEG como fallback)
        let optimizedDataUrl = canvas.toDataURL('image/webp', quality);
        if (!optimizedDataUrl.startsWith('data:image/webp')) {
          optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        const commaIdx = optimizedDataUrl.indexOf(',');
        const base64Str = commaIdx >= 0 ? optimizedDataUrl.slice(commaIdx + 1) : optimizedDataUrl;
        const estimatedBytes = Math.round(base64Str.length * 0.75);

        resolve({
          dataUrl: optimizedDataUrl,
          width: w,
          height: h,
          originalSize: file.size,
          compressedSize: estimatedBytes,
          wasCompressed: true,
        });
      };
      img.onerror = reject;
      img.src = rawDataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export class ScatterLeaf extends HTMLElement {
  static get observedAttributes(): string[] {
    return [
      'repo',
      'category',
      'theme',
      'lang',
      'mapping',
      'input-position',
      'broker',
      'client-id',
      'page-size',
      'title',
      'term',
      'order',
      'hide-reactions',
      'reactions',
      'hide-skin-tone',
      'skin-tone',
      'hide-sorting',
      'sorting',
      'hide-code-scroll',
      'code-scroll',
      'hide-preview',
      'preview',
      'hide-search',
      'search',
      'enable-moderation',
      'moderation',
      'enable-images',
      'images',
    ];
  }

  private _repo: string = '';
  private _category: string = 'General';
  private _theme: ThemeName = 'cream';
  private _lang: string = 'pt';
  private _inputPosition: 'top' | 'bottom' = 'top';
  private _broker: string = '';
  private _clientId: string = 'Iv23liZHApvnx6e6wtMJ';
  private _pageSize: number = 10;
  private _currentPage: number = 1;
  private _title: string = '';
  private _term: string = '';

  // Feature Flags & Ordenação
  private _order: 'oldest' | 'newest' = 'oldest';
  private _hideReactions: boolean = false;
  private _hideSkinTone: boolean = false;
  private _hideSorting: boolean = false;
  private _hideCodeScroll: boolean = false;
  private _hidePreview: boolean = false;
  private _hideSearch: boolean = false;
  private _enableModeration: boolean = false;
  private _enableImages: boolean = false;
  private _moderatedUsers: ModerationRecord[] = [];
  private _isModerationLoading: boolean = false;
  private _expandedModCategory: 'ban' | 'media' | null = null;
  private _isModerationCollapsed: boolean = false;

  private _comments: ScatterComment[] = [];
  private _isLoading: boolean = false;
  private _isBrokerConnected: boolean = false;

  // Sessão de Autenticação
  private _currentUser: CurrentUser | null = null;
  private _authToken: string | null = null;
  private _brokerClient: ScatterBrokerClient | null = null;
  private _discussionId: string | null = null;
  private _repositoryId: string | null = null;
  private _categoryId: string | null = null;

  // Estados de Interface do Editor e Interações
  private _activeTab: EditorTab = 'write';
  private _fontMode: FontMode = 'default';
  private _composerText: string = '';
  private _replyingToId: string | null = null;
  private _replyText: string = '';
  private _expandedThreads: Set<string> = new Set();
  private _searchQuery: string = '';
  private _editingId: string | null = null;
  private _openMenuId: string | null = null;
  private _speakingId: string | null = null;
  private _isEmojiPickerOpen: boolean = false;
  private _isCodePickerOpen: boolean = false;
  private _savedComposerSelection: { start: number; end: number } | null = null;
  private _isTranslatingId: string | null = null;
  private _selectedSkinTone: string | null = null;
  private _isSkinTonePanelOpen: boolean = false;
  private _activeTonePickerEmoji: string | null = null;
  private _themeObserver: MutationObserver | null = null;

  // Modal de Inserção de GIFs (Anti-NSFW)
  private _isMediaModalOpen: boolean = false;
  private _isManagingRecentGifs: boolean = false;
  private _isConfirmingClearGifs: boolean = false;
  private _mediaModalUrl: string = '';
  private _mediaModalAlt: string = '';
  private _mediaModalSuccess: string | null = null;

  // Modal de Inserção de Imagens (Apenas via URL HTTPS)
  private _isImageModalOpen: boolean = false;
  private _isManagingRecentImages: boolean = false;
  private _isConfirmingClearImages: boolean = false;
  private _imageModalUrl: string = '';
  private _imageModalAlt: string = '';
  private _imageModalSuccess: string | null = null;

  // Estado do Mini-Lightbox Nativo (Zoom & Pan de Imagens)
  private _lightboxOpen: boolean = false;
  private _lightboxImgSrc: string = '';
  private _lightboxImgAlt: string = '';
  private _lightboxScale: number = 1;
  private _lightboxTranslateX: number = 0;
  private _lightboxTranslateY: number = 0;
  private _isDraggingImage: boolean = false;
  private _dragStartX: number = 0;
  private _dragStartY: number = 0;
  private _dragStartTx: number = 0;
  private _dragStartTy: number = 0;

  // Fechamento de menus ao clicar fora do componente no document ou tecla Escape
  private _handleDocumentClick = (event: MouseEvent): void => {
    let shouldRender = false;
    const path = event.composedPath();

    if (this._openMenuId) {
      const clickedInsideMenu = path.some(
        (el) => el instanceof HTMLElement && el.classList?.contains('sl-menu-wrapper')
      );
      if (!clickedInsideMenu) {
        this._openMenuId = null;
        shouldRender = true;
      }
    }

    if (this._isCodePickerOpen) {
      const clickedInsideCodeMenu = path.some(
        (el) => el instanceof HTMLElement && (el.classList?.contains('sl-code-menu-wrapper') || el.classList?.contains('sl-code-picker-popover'))
      );
      if (!clickedInsideCodeMenu) {
        this._isCodePickerOpen = false;
        shouldRender = true;
      }
    }

    if (this._isEmojiPickerOpen) {
      const clickedInsideEmoji = path.some(
        (el) => el instanceof HTMLElement && (el.classList?.contains('sl-emoji-wrapper') || el.classList?.contains('sl-emoji-popover'))
      );
      if (!clickedInsideEmoji) {
        this._isEmojiPickerOpen = false;
        shouldRender = true;
      }
    }

    if (shouldRender) {
      this.render();
    }
  };

  private _handleDocumentKeydown = (event: KeyboardEvent): void => {
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const activeEl = document.activeElement;
      const isTyping =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        (activeEl as HTMLElement)?.isContentEditable;
      if (!isTyping) {
        const searchInput = this.shadowRoot?.getElementById('sl-search-input') as HTMLInputElement | null;
        if (searchInput) {
          event.preventDefault();
          searchInput.focus();
        }
      }
    }

    if (event.key === 'Escape') {
      if (this._lightboxOpen) {
        this.closeLightbox();
        return;
      }
      let shouldRender = false;
      if (this._openMenuId) {
        this._openMenuId = null;
        shouldRender = true;
      }
      if (this._isCodePickerOpen) {
        this._isCodePickerOpen = false;
        shouldRender = true;
      }
      if (this._isEmojiPickerOpen) {
        this._isEmojiPickerOpen = false;
        shouldRender = true;
      }
      if (this._isMediaModalOpen) {
        this._isMediaModalOpen = false;
        shouldRender = true;
      }
      if (this._isImageModalOpen) {
        this._isImageModalOpen = false;
        shouldRender = true;
      }
      if (this._searchQuery) {
        this._searchQuery = '';
        this._currentPage = 1;
        shouldRender = true;
      }
      if (shouldRender) {
        this.render();
      }
    }
  };
  private _mediaModalError: string | null = null;
  private _imageModalError: string | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  get repo(): string {
    return this._repo;
  }

  set repo(val: string) {
    this.setAttribute('repo', val);
  }

  get category(): string {
    return this._category;
  }

  set category(val: string) {
    this.setAttribute('category', val);
  }

  get theme(): ThemeName {
    return this._theme;
  }

  set theme(val: ThemeName) {
    this.setAttribute('theme', val);
  }

  get broker(): string {
    return this._broker;
  }

  set broker(val: string) {
    this.setAttribute('broker', val);
  }

  get clientId(): string {
    return this._clientId;
  }

  set clientId(val: string) {
    this.setAttribute('client-id', val);
  }

  get pageSize(): number {
    return this._pageSize;
  }

  set pageSize(val: number) {
    this.setAttribute('page-size', String(val));
  }

  get currentPage(): number {
    return this._currentPage;
  }

  set currentPage(val: number) {
    this._currentPage = val;
    this.render();
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  set isLoading(val: boolean) {
    this._isLoading = val;
    this.render();
  }

  get enableModeration(): boolean {
    return this._enableModeration;
  }

  set enableModeration(val: boolean) {
    this._enableModeration = Boolean(val);
    if (this.isConnected) {
      if (this._enableModeration && this._isOwner()) {
        this.loadModerationList();
      }
      this.render();
    }
  }

  get enableImages(): boolean {
    return this._enableImages;
  }

  set enableImages(val: boolean) {
    this._enableImages = Boolean(val);
    if (this.isConnected) {
      this.render();
    }
  }

  connectedCallback(): void {
    this.syncAttributes();
    this.initSkinTonePreference();
    try {
      this._isModerationCollapsed = localStorage.getItem('sl_mod_collapsed') === 'true';
    } catch {
      this._isModerationCollapsed = false;
    }
    this.initAuthSession();
    this.setupOAuthListener();
    this.checkUrlForOAuthCode();
    document.addEventListener('click', this._handleDocumentClick);
    document.addEventListener('keydown', this._handleDocumentKeydown);
    if (this._theme === 'auto') {
      this.detectAndApplyAutoPalette();
      this.setupAutoThemeObserver();
    }
    this.loadComments();
    if (this._enableModeration && this._isOwner()) {
      this.loadModerationList();
    }
    this.render();
  }

  disconnectedCallback(): void {
    document.removeEventListener('click', this._handleDocumentClick);
    document.removeEventListener('keydown', this._handleDocumentKeydown);
    if (this._themeObserver) {
      this._themeObserver.disconnect();
      this._themeObserver = null;
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    if (name === 'theme' && newValue) {
      this._theme = newValue as ThemeName;
      if (this._theme === 'auto') {
        this.detectAndApplyAutoPalette();
        this.setupAutoThemeObserver();
      } else {
        if (this._themeObserver) {
          this._themeObserver.disconnect();
          this._themeObserver = null;
        }
        this.clearAutoPaletteProperties();
      }
    } else if (name === 'repo' && newValue) {
      this._repo = newValue;
      this.loadComments();
    } else if (name === 'category' && newValue) {
      this._category = newValue;
      this.loadComments();
    } else if (name === 'lang' && newValue) {
      this._lang = newValue;
    } else if (name === 'broker' && newValue) {
      this._broker = newValue;
      this.initBrokerClient();
      this.loadComments();
    } else if (name === 'client-id' && newValue) {
      this._clientId = newValue;
    } else if (name === 'input-position' && (newValue === 'top' || newValue === 'bottom')) {
      this._inputPosition = newValue;
    } else if (name === 'page-size' && newValue) {
      const parsed = parseInt(newValue, 10);
      this._pageSize = !isNaN(parsed) && parsed > 0 ? parsed : 10;
      this._currentPage = 1;
    } else if (name === 'title') {
      this._title = newValue || '';
    } else if (name === 'term') {
      this._term = newValue || '';
    } else if (name === 'order') {
      this._order = newValue === 'newest' ? 'newest' : 'oldest';
    } else if (name === 'hide-reactions' || name === 'reactions') {
      this._hideReactions = this.hasAttribute('hide-reactions') || this.getAttribute('reactions') === 'false';
    } else if (name === 'hide-skin-tone' || name === 'skin-tone') {
      this._hideSkinTone = this.hasAttribute('hide-skin-tone') || this.getAttribute('skin-tone') === 'false';
    } else if (name === 'hide-sorting' || name === 'sorting') {
      this._hideSorting = this.hasAttribute('hide-sorting') || this.getAttribute('sorting') === 'false';
    } else if (name === 'hide-code-scroll' || name === 'code-scroll') {
      this._hideCodeScroll = this.hasAttribute('hide-code-scroll') || this.getAttribute('code-scroll') === 'false';
    } else if (name === 'hide-preview' || name === 'preview') {
      this._hidePreview = this.hasAttribute('hide-preview') || this.getAttribute('preview') === 'false';
    } else if (name === 'hide-search' || name === 'search') {
      this._hideSearch = this.hasAttribute('hide-search') || this.getAttribute('search') === 'false';
    } else if (name === 'enable-moderation' || name === 'moderation') {
      this._enableModeration = this.hasAttribute('enable-moderation') || this.getAttribute('moderation') === 'true';
      if (this.isConnected && this._enableModeration && this._isOwner()) {
        this.loadModerationList();
      }
    } else if (name === 'enable-images' || name === 'images') {
      this._enableImages = this.hasAttribute('enable-images') || this.getAttribute('images') === 'true';
    }

    this.render();
  }

  private syncAttributes(): void {
    this._repo = this.getAttribute('repo') || '';
    this._category = this.getAttribute('category') || 'General';
    this._theme = (this.getAttribute('theme') as ThemeName) || 'cream';
    this._lang = this.getAttribute('lang') || 'auto';
    this._broker = this.getAttribute('broker') || '';
    this._clientId = this.getAttribute('client-id') || 'Iv23liZHApvnx6e6wtMJ';

    const pos = this.getAttribute('input-position');
    if (pos === 'top' || pos === 'bottom') {
      this._inputPosition = pos;
    }

    const pageSizeAttr = this.getAttribute('page-size');
    if (pageSizeAttr) {
      const parsed = parseInt(pageSizeAttr, 10);
      if (!isNaN(parsed) && parsed > 0) this._pageSize = parsed;
    }

    this._title = this.getAttribute('title') || '';
    this._term = this.getAttribute('term') || '';

    // Sincronização de Feature Flags & Ordenação
    this._order = this.getAttribute('order') === 'newest' ? 'newest' : 'oldest';
    this._hideReactions = this.hasAttribute('hide-reactions') || this.getAttribute('reactions') === 'false';
    this._hideSkinTone = this.hasAttribute('hide-skin-tone') || this.getAttribute('skin-tone') === 'false';
    this._hideSorting = this.hasAttribute('hide-sorting') || this.getAttribute('sorting') === 'false';
    this._hideCodeScroll = this.hasAttribute('hide-code-scroll') || this.getAttribute('code-scroll') === 'false';
    this._hidePreview = this.hasAttribute('hide-preview') || this.getAttribute('preview') === 'false';
    this._hideSearch = this.hasAttribute('hide-search') || this.getAttribute('search') === 'false';
    this._enableModeration = this.hasAttribute('enable-moderation') || this.getAttribute('moderation') === 'true';
    this._enableImages = this.hasAttribute('enable-images') || this.getAttribute('images') === 'true';

    if (!this.hasAttribute('theme')) {
      this.setAttribute('theme', this._theme);
    }

    this.initBrokerClient();
  }

  /**
   * Inicializa e persiste o tom de pele padrão escolhido pelo usuário no navegador (localStorage)
   */
  private initSkinTonePreference(): void {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(SKIN_TONE_STORAGE_KEY);
      if (saved !== null) {
        this._selectedSkinTone = saved;
      }
    } catch (e) {
      console.warn('🍃 [ScatterLeaf] localStorage inacessível para skin tones:', e);
    }
  }

  private saveSkinTonePreference(tone: string): void {
    this._selectedSkinTone = tone;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SKIN_TONE_STORAGE_KEY, tone);
      } catch (e) {
        console.warn('🍃 [ScatterLeaf] Erro ao salvar skin tone em localStorage:', e);
      }
    }
  }

  /**
   * Resolve o idioma efetivo: se lang="auto", detecta automaticamente do navegador/sistema do usuário
   */
  public get currentLang(): string {
    if (this._lang && this._lang !== 'auto') {
      return this._lang.toLowerCase();
    }
    if (typeof navigator !== 'undefined' && navigator.language) {
      const nav = navigator.language.toLowerCase();
      if (nav.startsWith('pt')) return 'pt';
      if (nav.startsWith('es')) return 'es';
    }
    return 'en';
  }

  /**
   * Identifica a paleta de cores do site hospedeiro (body/container/CSS vars) e replica harmoniosamente
   */
  public detectAndApplyAutoPalette(): void {
    if (typeof window === 'undefined') return;

    try {
      const parseColor = (colorStr: string): { r: number; g: number; b: number } | null => {
        if (!colorStr || colorStr === 'transparent' || colorStr === 'rgba(0, 0, 0, 0)') {
          return null;
        }

        // Formato Hex (#rgb ou #rrggbb)
        if (colorStr.startsWith('#')) {
          let hex = colorStr.slice(1);
          if (hex.length === 3 || hex.length === 4) {
            hex = hex.split('').map((c) => c + c).join('');
          }
          if (hex.length >= 6) {
            return {
              r: parseInt(hex.substring(0, 2), 16),
              g: parseInt(hex.substring(2, 4), 16),
              b: parseInt(hex.substring(4, 6), 16),
            };
          }
        }

        // Formato rgb() / rgba()
        const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
        if (match) {
          return {
            r: parseInt(match[1], 10),
            g: parseInt(match[2], 10),
            b: parseInt(match[3], 10),
          };
        }
        return null;
      };

      const docStyle = window.getComputedStyle(document.documentElement);
      const bodyStyle = window.getComputedStyle(document.body);
      const hostEl = this.parentElement || document.body;
      const hostStyle = window.getComputedStyle(hostEl);

      const getVarColor = (propNames: string[]): { r: number; g: number; b: number } | null => {
        for (const name of propNames) {
          const val =
            hostStyle.getPropertyValue(name).trim() ||
            bodyStyle.getPropertyValue(name).trim() ||
            docStyle.getPropertyValue(name).trim();
          if (val) {
            const parsed = parseColor(val);
            if (parsed) return parsed;
          }
        }
        return null;
      };

      // 1. Cor de fundo do blog (Var CSS ou sobe a árvore DOM)
      let bgRgb = getVarColor([
        '--sl-bg',
        '--page-bg',
        '--color-bg',
        '--background',
        '--color-background',
        '--bg-color',
        '--body-bg',
        '--bg',
      ]);

      if (!bgRgb) {
        let curr: HTMLElement | null = this;
        while (curr) {
          const bg = window.getComputedStyle(curr).backgroundColor;
          const parsed = parseColor(bg);
          if (parsed) {
            bgRgb = parsed;
            break;
          }
          curr = curr.parentElement;
        }
      }

      if (!bgRgb) {
        bgRgb =
          parseColor(bodyStyle.backgroundColor) ||
          parseColor(docStyle.backgroundColor) ||
          { r: 255, g: 255, b: 255 };
      }

      // 2. Cor do texto (Var CSS ou computado)
      let textRgb = getVarColor([
        '--sl-text',
        '--page-text',
        '--color-text',
        '--text-color',
        '--color-foreground',
        '--foreground',
        '--text',
      ]);

      if (!textRgb) {
        let curr: HTMLElement | null = this;
        while (curr) {
          const fg = window.getComputedStyle(curr).color;
          const parsed = parseColor(fg);
          if (parsed) {
            textRgb = parsed;
            break;
          }
          curr = curr.parentElement;
        }
      }

      // 3. Cor de destaque (links ou Var CSS)
      let accentRgb = getVarColor([
        '--sl-accent',
        '--page-accent',
        '--color-accent',
        '--color-primary',
        '--primary',
        '--accent',
        '--brand',
      ]);

      if (!accentRgb) {
        const linkEl = document.querySelector('a');
        if (linkEl) {
          accentRgb = parseColor(window.getComputedStyle(linkEl).color);
        }
      }

      // 4. Detecção de Dark Mode (Luminância relativa WCAG + Classes/Atributos)
      const hasDarkClass =
        document.documentElement.classList.contains('dark') ||
        document.body.classList.contains('dark') ||
        document.documentElement.getAttribute('data-theme') === 'dark' ||
        document.body.getAttribute('data-theme') === 'dark' ||
        document.body.getAttribute('data-page-theme') === 'midnight' ||
        document.body.getAttribute('data-page-theme') === 'slate' ||
        document.body.getAttribute('data-page-theme') === 'terminal';

      const luminance = 0.2126 * bgRgb.r + 0.7152 * bgRgb.g + 0.0722 * bgRgb.b;
      const isDark = hasDarkClass || luminance < 128;

      if (!textRgb) {
        textRgb = isDark ? { r: 230, g: 237, b: 243 } : { r: 28, g: 25, b: 23 };
      }

      if (!accentRgb) {
        accentRgb = isDark ? { r: 88, g: 166, b: 255 } : { r: 146, g: 64, b: 14 };
      }

      // 5. Gera superfícies e bordas harmônicas baseadas na cor detectada
      let surfaceColor: string;
      let tabBgColor: string;
      let borderColor: string;
      let textMutedColor: string;
      let mentionColor: string;
      let mentionBg: string;
      let mentionBorder: string;

      if (isDark) {
        const cardR = Math.min(255, Math.round(bgRgb.r + 15));
        const cardG = Math.min(255, Math.round(bgRgb.g + 18));
        const cardB = Math.min(255, Math.round(bgRgb.b + 22));
        surfaceColor = `rgb(${cardR}, ${cardG}, ${cardB})`;
        tabBgColor = `rgba(0, 0, 0, 0.35)`;
        borderColor = `rgba(255, 255, 255, 0.12)`;
        textMutedColor = `rgba(${textRgb.r}, ${textRgb.g}, ${textRgb.b}, 0.62)`;
        mentionColor = `rgb(${Math.min(255, accentRgb.r + 30)}, ${Math.min(255, accentRgb.g + 30)}, ${Math.min(255, accentRgb.b + 30)})`;
        mentionBg = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.16)`;
        mentionBorder = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.35)`;
      } else {
        surfaceColor = `rgba(255, 255, 255, 0.96)`;
        tabBgColor = `rgba(0, 0, 0, 0.035)`;
        borderColor = `rgba(0, 0, 0, 0.12)`;
        textMutedColor = `rgba(${textRgb.r}, ${textRgb.g}, ${textRgb.b}, 0.65)`;
        mentionColor = `rgb(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b})`;
        mentionBg = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.12)`;
        mentionBorder = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.28)`;
      }

      const accentHex = `rgb(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b})`;

      // Injeta diretamente as variáveis no :host do Shadow DOM
      this.style.setProperty('--sl-bg', `rgb(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b})`);
      this.style.setProperty('--sl-surface', surfaceColor);
      this.style.setProperty('--sl-tab-bg', tabBgColor);
      this.style.setProperty('--sl-border', borderColor);
      this.style.setProperty('--sl-text', `rgb(${textRgb.r}, ${textRgb.g}, ${textRgb.b})`);
      this.style.setProperty('--sl-text-muted', textMutedColor);
      this.style.setProperty('--sl-accent', accentHex);
      this.style.setProperty('--sl-accent-hover', accentHex);
      this.style.setProperty('--sl-mention-color', mentionColor);
      this.style.setProperty('--sl-mention-bg', mentionBg);
      this.style.setProperty('--sl-mention-border', mentionBorder);

      // Em modo dark, garante contraste WCAG AA alto e destaque nítido para o logo 🍃
      if (isDark) {
        this.style.setProperty('--sl-btn-primary-bg', '#1f6feb');
        this.style.setProperty('--sl-btn-primary-hover', '#388bfd');
      } else {
        this.style.setProperty('--sl-btn-primary-bg', accentHex);
        this.style.setProperty('--sl-btn-primary-hover', accentHex);
      }
    } catch (e) {
      console.warn('🍃 [ScatterLeaf] Erro ao auto-computar paleta do tema:', e);
    }
  }

  private setupAutoThemeObserver(): void {
    if (typeof window === 'undefined') return;
    if (this._themeObserver) this._themeObserver.disconnect();

    this._themeObserver = new MutationObserver(() => {
      if (this._theme === 'auto') {
        this.detectAndApplyAutoPalette();
      }
    });

    this._themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'style'],
    });
    this._themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'data-page-theme', 'style'],
    });

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this._theme === 'auto') {
          this.detectAndApplyAutoPalette();
        }
      });
    }
  }

  private clearAutoPaletteProperties(): void {
    const props = [
      '--sl-bg',
      '--sl-surface',
      '--sl-tab-bg',
      '--sl-border',
      '--sl-text',
      '--sl-text-muted',
      '--sl-accent',
      '--sl-accent-hover',
      '--sl-btn-primary-bg',
      '--sl-btn-primary-hover',
      '--sl-mention-color',
      '--sl-mention-bg',
      '--sl-mention-border',
    ];
    props.forEach((p) => this.style.removeProperty(p));
  }

  private initBrokerClient(): void {
    if (this._broker) {
      this._brokerClient = new ScatterBrokerClient(this._broker, () => this._authToken);
    } else {
      this._brokerClient = null;
      this._isBrokerConnected = false;
    }
  }

  /**
   * Recupera sessão de autenticação prévia salva no sessionStorage
   */
  private initAuthSession(): void {
    try {
      const token = sessionStorage.getItem('scatterleaf_token');
      const userStr = sessionStorage.getItem('scatterleaf_user');
      if (token && userStr) {
        this._authToken = token;
        this._currentUser = JSON.parse(userStr);
      }
    } catch {
      this._authToken = null;
      this._currentUser = null;
    }
  }

  /**
   * Escuta mensagens de retorno do popup OAuth
   */
  private setupOAuthListener(): void {
    window.addEventListener('message', async (event) => {
      if (event.data && event.data.type === 'scatterleaf-oauth-code' && event.data.code) {
        await this.exchangeOAuthCode(event.data.code);
      }
    });
  }

  /**
   * Suporte para retorno por redirecionamento direto com ?code=...
   */
  private async checkUrlForOAuthCode(): Promise<void> {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      // Se estiver rodando dentro de um popup com window.opener, notifica o pai e fecha
      if (window.opener) {
        window.opener.postMessage({ type: 'scatterleaf-oauth-code', code }, '*');
        window.close();
        return;
      }

      // Limpa a URL para remover o parâmetro code da barra de endereços
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);

      await this.exchangeOAuthCode(code);
    }
  }

  /**
   * Troca o código retornado pelo OAuth pelo token seguro via Edge Broker
   */
  public async exchangeOAuthCode(code: string): Promise<void> {
    if (!this._brokerClient) {
      console.warn('🍃 [ScatterLeaf] Broker URL não configurada para efetuar troca de token.');
      return;
    }

    try {
      this._isLoading = true;
      this.render();

      const redirectUri = window.location.origin + window.location.pathname;
      const token = await this._brokerClient.exchangeOAuthCode(code, redirectUri);
      const user = await this._brokerClient.fetchGitHubUserProfile(token);

      this._authToken = token;
      this._currentUser = user;

      sessionStorage.setItem('scatterleaf_token', token);
      sessionStorage.setItem('scatterleaf_user', JSON.stringify(user));

      // Sincroniza discussões com o token recém-autenticado para obter viewerHasReacted real
      await this.loadComments();

      if (this._enableModeration && this._isOwner()) {
        await this.loadModerationList();
      }

      this._isLoading = false;
      this.render();

      this.dispatchEvent(
        new CustomEvent('scatterleaf-login', {
          detail: { user },
          bubbles: true,
          composed: true,
        })
      );
    } catch (err: unknown) {
      this._isLoading = false;
      this.render();
      const msg = err instanceof Error ? err.message : 'Falha na autenticação';
      alert(`🍃 [ScatterLeaf Auth] ${msg}`);
    }
  }

  /**
   * Inicia o fluxo de login em 1 clique via popup
   */
  public loginWithGitHub(): void {
    if (!this._clientId) {
      // Modo de teste amigável no sandbox local caso o usuário ainda não tenha registrado o OAuth App
      const confirmSimulate = confirm(
        this.currentLang === 'pt'
          ? '🍃 ScatterLeaf Playground:\nNenhum "client-id" do GitHub OAuth configurado ainda.\nDeseja simular um login local de teste (@demo-reader)?'
          : '🍃 ScatterLeaf Playground:\nNo "client-id" configured yet.\nDo you want to simulate a local test login (@demo-reader)?'
      );

      if (confirmSimulate) {
        const mockUser: CurrentUser = {
          login: 'demo-reader',
          avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
          name: 'Demo Reader',
          url: 'https://github.com',
        };
        this._currentUser = mockUser;
        this._authToken = 'mock_token_local';
        sessionStorage.setItem('scatterleaf_token', this._authToken);
        sessionStorage.setItem('scatterleaf_user', JSON.stringify(mockUser));
        if (this._enableModeration && this._isOwner()) {
          this.loadModerationList();
        }
        this.render();
      }
      return;
    }

    const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname);
    const scope = encodeURIComponent('read:user');
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${this._clientId}&scope=${scope}&redirect_uri=${redirectUri}`;

    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      authUrl,
      'scatterleaf-oauth-popup',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
    );
  }

  /**
   * Encerra a sessão do usuário
   */
  public logout(): void {
    sessionStorage.removeItem('scatterleaf_token');
    sessionStorage.removeItem('scatterleaf_user');
    this._authToken = null;
    this._currentUser = null;
    this._moderatedUsers = [];
    this.render();

    this.dispatchEvent(
      new CustomEvent('scatterleaf-logout', {
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Identifica se um erro lançado é decorrente de falha de autenticação/token expirado
   */
  private isAuthError(err: unknown): boolean {
    if (err instanceof ScatterAuthError) return true;
    if (err instanceof Error) {
      return /bad credentials|unauthorized|sessão expirada|http 401/i.test(err.message);
    }
    return false;
  }

  /**
   * Trata expiração de token (HTTP 401 / Bad credentials).
   * Limpa as credenciais salvas sem perder o rascunho de texto digitado no composer.
   */
  private handleExpiredSession(silent = false): void {
    sessionStorage.removeItem('scatterleaf_token');
    sessionStorage.removeItem('scatterleaf_user');
    this._authToken = null;
    this._currentUser = null;
    this._moderatedUsers = [];

    if (!silent) {
      alert(
        this.currentLang === 'pt'
          ? 'Sua sessão do GitHub expirou. Conecte-se novamente para publicar sua mensagem (seu texto foi preservado no editor).'
          : 'Your GitHub session has expired. Please sign in again to publish (your text was preserved in the editor).'
      );
    }

    this.render();

    this.dispatchEvent(
      new CustomEvent('scatterleaf-logout', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private getCurrentTerm(): string {
    if (this._term) return this._term;
    if (this._title) return this._title.trim();
    if (typeof window === 'undefined') return 'general';
    return window.location.pathname || 'general';
  }

  /**
   * Verifica se o usuário autenticado é o proprietário do repositório
   */
  private _isOwner(): boolean {
    if (!this._currentUser?.login || !this._repo) return false;
    const repoOwner = this._repo.split('/')[0]?.toLowerCase();
    return Boolean(repoOwner && this._currentUser.login.toLowerCase() === repoOwner);
  }

  /**
   * Carrega a lista de usuários moderados direto do KV via Broker
   */
  public async loadModerationList(): Promise<void> {
    if (!this._enableModeration || !this._isOwner() || !this._brokerClient || !this._authToken || !this._repo) {
      return;
    }
    this._isModerationLoading = true;
    this.render();
    try {
      this._moderatedUsers = await this._brokerClient.getModerationList(this._repo);
    } catch (err) {
      console.warn('🍃 [ScatterLeaf] Erro ao carregar lista de moderação:', err);
      if (this.isAuthError(err)) {
        this.handleExpiredSession(true);
      }
    } finally {
      this._isModerationLoading = false;
      this.render();
    }
  }

  /**
   * Aplica ban ou restrição de mídia a um usuário
   */
  private async handleSetModeration(username: string, action: ModerationAction): Promise<void> {
    if (!this._isOwner() || !this._brokerClient || !this._authToken || !this._repo) {
      alert(
        this.currentLang === 'pt'
          ? '🍃 Apenas o proprietário do repositório pode moderar usuários.'
          : '🍃 Only the repository owner can moderate users.'
      );
      return;
    }
    const actionLabel =
      action === 'ban'
        ? this.currentLang === 'pt'
          ? 'banir'
          : 'ban'
        : this.currentLang === 'pt'
        ? 'restringir mídia de'
        : 'restrict media for';

    const confirmed = confirm(
      this.currentLang === 'pt'
        ? `Tem certeza que deseja ${actionLabel} @${username}?`
        : `Are you sure you want to ${actionLabel} @${username}?`
    );
    if (!confirmed) return;

    try {
      await this._brokerClient.setModeration(this._repo, username, action);
      await this.loadModerationList();
      alert(
        this.currentLang === 'pt'
          ? `🍃 @${username} foi moderado com sucesso (${action === 'ban' ? 'banido' : 'sem mídia'}).`
          : `🍃 @${username} moderated successfully (${action === 'ban' ? 'banned' : 'media restricted'}).`
      );
    } catch (err: any) {
      if (this.isAuthError(err)) {
        this.handleExpiredSession(false);
        return;
      }
      alert(err?.message || 'Erro ao moderar usuário');
    }
  }

  /**
   * Remove restrição de moderação de um usuário
   */
  private async handleRemoveModeration(username: string): Promise<void> {
    if (!this._isOwner() || !this._brokerClient || !this._authToken || !this._repo) return;
    const confirmed = confirm(
      this.currentLang === 'pt'
        ? `Remover restrição de moderação de @${username}?`
        : `Remove moderation restriction for @${username}?`
    );
    if (!confirmed) return;

    try {
      await this._brokerClient.removeModeration(this._repo, username);
      await this.loadModerationList();
      const activeCategory = this._expandedModCategory;
      if (activeCategory) {
        const activeList = this._moderatedUsers.filter(
          (u) => u.action === (activeCategory === 'ban' ? 'ban' : 'restrict_media')
        );
        if (activeList.length === 0) {
          this._expandedModCategory = null;
          this.render();
        }
      }
    } catch (err: any) {
      if (this.isAuthError(err)) {
        this.handleExpiredSession(false);
        return;
      }
      alert(err?.message || 'Erro ao remover moderação');
    }
  }

  /**
   * Carrega comentários: tenta o Edge Broker primeiro; se offline, faz fallback gracioso para mock
   */
  private async loadComments(): Promise<void> {
    if (!this._broker || !this._repo) {
      this.loadMockComments();
      this._isBrokerConnected = false;
      return;
    }

    this._isLoading = true;
    this.render();

    try {
      if (!this._brokerClient) {
        this.initBrokerClient();
      }

      if (this._brokerClient) {
        // 1. Auto-Discovery de Categoria e Repo
        const discovery = await this._brokerClient.discover(this._repo, this._category);
        this._repositoryId = discovery.repositoryId;
        this._categoryId = discovery.defaultCategory?.id || null;

        // 2. Busca Discussões e Comentários
        const term = this.getCurrentTerm();
        const discussionsData = await this._brokerClient.fetchDiscussions(this._repo, term);

        if (discussionsData.discussion) {
          this._discussionId = discussionsData.discussion.id;
        }

        this._comments = (discussionsData.comments || []).map((c) => ({
          ...c,
          originalLang: c.originalLang || this.detectTextLanguage(c.body),
          replies: (c.replies || []).map((r) => ({
            ...r,
            originalLang: r.originalLang || this.detectTextLanguage(r.body),
          })),
        }));
        this._isBrokerConnected = true;
      }
    } catch (err) {
      if (this.isAuthError(err) && this._authToken) {
        console.warn('🍃 [ScatterLeaf] Token de usuário expirado detectado ao carregar discussões. Limpando sessão e recarregando anonimamente...');
        this.handleExpiredSession(true);
        return this.loadComments();
      }
      console.warn('🍃 [ScatterLeaf] Broker offline ou inacessível. Usando mock local:', err);
      this._isBrokerConnected = false;
      this.loadMockComments();
    } finally {
      this._isLoading = false;
      this.render();
    }
  }

  private loadMockComments(): void {
    const lang = this.currentLang;
    const isPt = lang === 'pt';
    const isEs = lang === 'es';
    const term = this.getCurrentTerm().toLowerCase();

    if (term.includes('obsidian')) {
      this._comments = [
        {
          id: 'obs-1',
          author: {
            login: 'vault-author',
            avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
            url: 'https://github.com',
            isAuthor: true,
          },
          body: isPt
            ? 'Bem-vindo à discussão do guia de conexão do **Obsidian Vault** com o Minrock! 🍃 Se você tiver dúvidas sobre os passos do assistente do Vault CMS ou sobre o formato Page Bundle, deixe uma mensagem aqui.'
            : isEs
            ? '¡Bienvenido a la discusión de la guía de conexión de **Obsidian Vault** con Minrock! 🍃 Si tienes dudas sobre los pasos del asistente de Vault CMS o el formato Page Bundle, deja un mensaje aquí.'
            : 'Welcome to the **Obsidian Vault** + Minrock integration discussion! 🍃 If you have questions about the Vault CMS wizard steps or the Page Bundle format, leave a message below.',
          createdAt: isPt ? 'há 15 minutos' : isEs ? 'hace 15 minutos' : '15 minutes ago',
          originalLang: isPt ? 'pt' : isEs ? 'es' : 'en',
          reactions: [
            { content: '👍', count: 5, viewerHasReacted: true },
            { content: '🚀', count: 3, viewerHasReacted: false },
          ],
          replies: [
            {
              id: 'obs-1-1',
              author: {
                login: 'alex-notes',
                avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
                url: 'https://github.com',
                isAuthor: false,
              },
              body: isPt
                ? '@vault-author A calibração do modo de criação como pasta (`folder`) e `index.md` foi essencial. Agora ao colar um print com `Ctrl+V`, a imagem fica junto com o post sem espalhar arquivos soltos na raiz!'
                : '@vault-author Setting file organization to `folder` and `index.md` was key. Now when pasting screenshots via `Ctrl+V`, images stay co-located with the post instead of scattering across the root!',
              createdAt: isPt ? 'há 10 minutos' : '10 minutes ago',
              originalLang: isPt ? 'pt' : 'en',
              reactions: [{ content: '❤️', count: 3, viewerHasReacted: true }],
              parentId: 'obs-1',
            },
            {
              id: 'obs-1-2',
              author: {
                login: 'vault-author',
                avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
                url: 'https://github.com',
                isAuthor: true,
              },
              body: isPt
                ? '@alex-notes Exatamente! O padrão de Page Bundle deixa o cofre 100% autocontido e portátil. Se deletar a pasta do post, as imagens vão embora juntas.'
                : '@alex-notes Exactly! The Page Bundle pattern keeps your vault 100% self-contained and portable. If you ever delete the post folder, its assets are removed cleanly.',
              createdAt: isPt ? 'há 4 minutos' : '4 minutes ago',
              originalLang: isPt ? 'pt' : 'en',
              reactions: [{ content: '🚀', count: 2, viewerHasReacted: false }],
              parentId: 'obs-1',
            },
          ],
        },
        {
          id: 'obs-2',
          author: {
            login: 'carlos-dev',
            avatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
            url: 'https://github.com',
            isAuthor: false,
          },
          body: isPt
            ? 'O vídeo do David Kimball no final do artigo ajudou bastante a visualizar o fluxo de publicação com o Git status bar do Obsidian!'
            : isEs
            ? '¡El vídeo de David Kimball al final del artículo ayudó muchísimo a visualizar el flujo de publicación con la barra de Git en Obsidian!'
            : "David Kimball's walkthrough video at the end of the post really helped clarify the Git push workflow in Obsidian's status bar!",
          createdAt: isPt ? 'há 12 minutos' : isEs ? 'hace 12 minutos' : '12 minutes ago',
          originalLang: isPt ? 'pt' : isEs ? 'es' : 'en',
          reactions: [{ content: '🎉', count: 4, viewerHasReacted: false }],
          replies: [],
        },
      ];
      return;
    }

    if (term.includes('writing-technical-articles')) {
      this._comments = [
        {
          id: 'write-1',
          author: {
            login: 'vault-author',
            avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
            url: 'https://github.com',
            isAuthor: true,
          },
          body: isPt
            ? 'Qual é a sua opinião sobre o ritmo tipográfico e o espaçamento para leitura de blocos longos de código técnico no Minrock?'
            : isEs
            ? '¿Cuál es tu opinión sobre el ritmo tipográfico y el espaciado para leer bloques largos de código técnico en Minrock?'
            : 'What are your thoughts on Minrock\'s typographic rhythm and line height when reading long technical code blocks?',
          createdAt: isPt ? 'há 20 minutos' : isEs ? 'hace 20 minutos' : '20 minutes ago',
          originalLang: isPt ? 'pt' : isEs ? 'es' : 'en',
          reactions: [
            { content: '👍', count: 6, viewerHasReacted: true },
            { content: '💡', count: 4, viewerHasReacted: false },
          ],
          replies: [
            {
              id: 'write-1-1',
              author: {
                login: 'jordan-tech',
                avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
                url: 'https://github.com',
                isAuthor: false,
              },
              body: isPt
                ? '@vault-author A renderização com Shiki e o fundo sutil do bloco de código dão um contraste perfeito sem agredir a visão em sessões longas de leitura.'
                : '@vault-author The Shiki rendering paired with subtle background surfaces creates ideal contrast without eye strain during long reading sessions.',
              createdAt: isPt ? 'há 14 minutos' : '14 minutes ago',
              originalLang: isPt ? 'pt' : 'en',
              reactions: [{ content: '❤️', count: 2, viewerHasReacted: false }],
              parentId: 'write-1',
            },
          ],
        },
        {
          id: 'write-2',
          author: {
            login: 'lucas-writer',
            avatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
            url: 'https://github.com',
            isAuthor: false,
          },
          body: isPt
            ? 'A hierarquia limpa de títulos (`h2`, `h3`) e listas compactas mantém o foco total na substância técnica do artigo.'
            : isEs
            ? 'La jerarquía limpia de encabezados (`h2`, `h3`) y listas compactas mantiene el foco total en la sustancia técnica del artículo.'
            : 'The clean headings hierarchy (`h2`, `h3`) and compact lists keep the focus entirely on technical substance.',
          createdAt: isPt ? 'há 8 minutos' : isEs ? 'hace 8 minutos' : '8 minutes ago',
          originalLang: isPt ? 'pt' : isEs ? 'es' : 'en',
          reactions: [{ content: '🎉', count: 2, viewerHasReacted: false }],
          replies: [],
        },
      ];
      return;
    }

    // Padrão: getting-started-with-minrock ou páginas gerais
    this._comments = [
      {
        id: '1',
        author: {
          login: 'vault-author',
          avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
          url: 'https://github.com',
          isAuthor: true,
        },
        body: isPt
          ? 'Bem-vindo ao **ScatterLeaf**! 🍃 Este é um comentário nativo renderizado diretamente via Shadow DOM, com zero iframes e suporte a Markdown.'
          : isEs
          ? '¡Bienvenido a **ScatterLeaf**! 🍃 Este es un comentario nativo renderizado directamente a través de Shadow DOM, sin iframes y con soporte para Markdown.'
          : 'Welcome to **ScatterLeaf**! 🍃 This is a native comment rendered directly via Shadow DOM, with zero iframes and full Markdown support.',
        createdAt: isPt ? 'há 10 minutos' : isEs ? 'hace 10 minutos' : '10 minutes ago',
        originalLang: isPt ? 'pt' : isEs ? 'es' : 'en',
        reactions: [
          { content: '👍', count: 4, viewerHasReacted: true },
          { content: '❤️', count: 6, viewerHasReacted: false },
          { content: '🚀', count: 2, viewerHasReacted: false },
        ],
        replies: [
          {
            id: '1-1',
            author: {
              login: 'sarah-eng',
              avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
              url: 'https://github.com',
              isAuthor: false,
            },
            body: isPt
              ? '@vault-author Isso é genial! Ter Shadow DOM nativo deixa a rolagem suave como manteiga, sem nenhum engasgo de iframe.'
              : '@vault-author This is brilliant! Having native Shadow DOM makes the scroll buttery smooth without any iframe stutter.',
            createdAt: isPt ? 'há 5 minutos' : '5 minutes ago',
            originalLang: isPt ? 'pt' : 'en',
            reactions: [{ content: '❤️', count: 2, viewerHasReacted: true }],
            parentId: '1',
          },
          {
            id: '1-2',
            author: {
              login: 'vault-author',
              avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
              url: 'https://github.com',
              isAuthor: true,
            },
            body: isPt
              ? '@sarah-eng Exato! A rolagem da página não sofre com os pulos visuais de redimensionamento do iframe.'
              : '@sarah-eng Exactly! Page scrolling does not suffer from visual jumping caused by iframe resizing.',
            createdAt: isPt ? 'há 2 minutos' : '2 minutes ago',
            originalLang: isPt ? 'pt' : 'en',
            reactions: [{ content: '🚀', count: 1, viewerHasReacted: false }],
            parentId: '1',
          },
          {
            id: '1-3',
            author: {
              login: 'lucas-writer',
              avatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
              url: 'https://github.com',
              isAuthor: false,
            },
            body: isPt
              ? '@sarah-eng E o consumo de memória cai drasticamente, pois não há instâncias de documentos HTML duplicadas.'
              : '@sarah-eng Plus memory usage drops dramatically since there are no duplicate HTML document contexts.',
            createdAt: isPt ? 'há 1 minuto' : '1 minute ago',
            originalLang: isPt ? 'pt' : 'en',
            reactions: [{ content: '🎉', count: 2, viewerHasReacted: false }],
            parentId: '1',
          },
        ],
      },
      {
        id: '2',
        author: {
          login: 'carlos-dev',
          avatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
          url: 'https://github.com',
          isAuthor: false,
        },
        body: '¡Excelente proyecto! El tema Warm Paper (**Cream**) queda fenomenal para leer artículos largos.',
        createdAt: isPt ? 'há 8 minutos' : isEs ? 'hace 8 minutos' : '8 minutes ago',
        originalLang: 'es',
        reactions: [{ content: '🎉', count: 3, viewerHasReacted: false }],
        replies: [],
      },
      {
        id: '3',
        author: {
          login: 'marina-ui',
          avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
          url: 'https://github.com',
          isAuthor: false,
        },
        body: isPt
          ? 'Adorei a tipografia e o suporte a Markdown sem precisar carregar frameworks pesados. A performance agradece!'
          : 'Loved the typography and Markdown support without needing heavy frameworks. Performance is incredible!',
        createdAt: isPt ? 'há 7 minutos' : '7 minutes ago',
        originalLang: isPt ? 'pt' : 'en',
        reactions: [{ content: '❤️', count: 4, viewerHasReacted: false }],
        replies: [],
      },
      {
        id: '4',
        author: {
          login: 'felipe-dev',
          avatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
          url: 'https://github.com',
          isAuthor: false,
        },
        body: isPt
          ? 'O popover de reações com emojis 3D animados traz uma sensação muito viva e dinâmica para o blog.'
          : 'The reaction popover with animated 3D emojis gives the blog a very lively and engaging feel.',
        createdAt: isPt ? 'há 6 minutos' : '6 minutes ago',
        originalLang: isPt ? 'pt' : 'en',
        reactions: [{ content: '🚀', count: 5, viewerHasReacted: true }],
        replies: [],
      },
      {
        id: '5',
        author: {
          login: 'beatriz-sec',
          avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
          url: 'https://github.com',
          isAuthor: false,
        },
        body: isPt
          ? 'A validação binária de Magic Bytes para imagens e o filtro Anti-NSFW trazem muita segurança para quem gerencia um blog público.'
          : 'Magic Bytes binary validation for images plus Anti-NSFW filtering bring massive peace of mind for public blogs.',
        createdAt: isPt ? 'há 5 minutos' : '5 minutes ago',
        originalLang: isPt ? 'pt' : 'en',
        reactions: [{ content: '👍', count: 2, viewerHasReacted: false }],
        replies: [],
      },
      {
        id: '6',
        author: {
          login: 'thiago-arch',
          avatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
          url: 'https://github.com',
          isAuthor: false,
        },
        body: isPt
          ? 'A separação de responsabilidades com o Cloudflare Worker como Edge Broker é a melhor decisão de arquitetura.'
          : 'Separating concerns with Cloudflare Worker as Edge Broker is the cleanest architectural pattern.',
        createdAt: isPt ? 'há 4 minutos' : '4 minutes ago',
        originalLang: isPt ? 'pt' : 'en',
        reactions: [{ content: '💡', count: 3, viewerHasReacted: false }],
        replies: [],
      },
      {
        id: '7',
        author: {
          login: 'juliana-doc',
          avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
          url: 'https://github.com',
          isAuthor: false,
        },
        body: isPt
          ? 'A tradução automática com detecção de idioma e Web Speech para síntese de voz tornam o conteúdo acessível para todos.'
          : 'Automatic translation with language detection and Web Speech text-to-speech make content accessible to everyone.',
        createdAt: isPt ? 'há 3 minutos' : '3 minutes ago',
        originalLang: isPt ? 'pt' : 'en',
        reactions: [{ content: '❤️', count: 1, viewerHasReacted: false }],
        replies: [],
      },
      {
        id: '8',
        author: {
          login: 'rodrigo-qa',
          avatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
          url: 'https://github.com',
          isAuthor: false,
        },
        body: isPt
          ? 'Testei em vários navegadores (Chromium, Firefox, Safari) e o Shadow DOM isola os estilos com 100% de integridade.'
          : 'Tested across Chromium, Firefox, and Safari: Shadow DOM isolates all styles with 100% integrity.',
        createdAt: isPt ? 'há 3 minutos' : '3 minutes ago',
        originalLang: isPt ? 'pt' : 'en',
        reactions: [{ content: '👍', count: 2, viewerHasReacted: false }],
        replies: [],
      },
      {
        id: '9',
        author: {
          login: 'clara-rust',
          avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
          url: 'https://github.com',
          isAuthor: false,
        },
        body: isPt
          ? 'O botão assistido de blocos de código com numeração de linhas e cópia limpa ficou perfeito para desenvolvedores.'
          : 'The assisted code block button with line numbering and clean copy is perfect for developers.',
        createdAt: isPt ? 'há 2 minutos' : '2 minutes ago',
        originalLang: isPt ? 'pt' : 'en',
        reactions: [{ content: '🚀', count: 4, viewerHasReacted: false }],
        replies: [],
      },
      {
        id: '10',
        author: {
          login: 'andre-linux',
          avatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
          url: 'https://github.com',
          isAuthor: false,
        },
        body: isPt
          ? 'Sem trackers externos, sem cookies de terceiros e com zero poluição. É disso que a web estática precisa.'
          : 'No third-party trackers, no third-party cookies, and zero bloat. Exactly what static web needs.',
        createdAt: isPt ? 'há 2 minutos' : '2 minutes ago',
        originalLang: isPt ? 'pt' : 'en',
        reactions: [{ content: '🎉', count: 3, viewerHasReacted: false }],
        replies: [],
      },
      {
        id: '11',
        author: {
          login: 'renata-cloud',
          avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
          url: 'https://github.com',
          isAuthor: false,
        },
        body: isPt
          ? 'A paginação inteligente permite manter dezenas de comentários organizados sem travar a navegação da página principal.'
          : 'Smart pagination keeps dozens of comments neatly organized without breaking main page navigation flow.',
        createdAt: isPt ? 'há 1 minuto' : '1 minute ago',
        originalLang: isPt ? 'pt' : 'en',
        reactions: [{ content: '💡', count: 5, viewerHasReacted: true }],
        replies: [],
      },
      {
        id: '12',
        author: {
          login: 'gabriel-astro',
          avatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
          url: 'https://github.com',
          isAuthor: false,
        },
        body: isPt
          ? 'Integração transparente com Astro 7 e SSG. O ScatterLeaf se tornou indispensável.'
          : 'Seamless integration with Astro 7 and SSG. ScatterLeaf is now an essential staple.',
        createdAt: isPt ? 'há alguns segundos' : 'a few seconds ago',
        originalLang: isPt ? 'pt' : 'en',
        reactions: [{ content: '❤️', count: 2, viewerHasReacted: false }],
        replies: [],
      },
    ];
  }

  /**
   * Parser ultraleve de Markdown client-side (Zero dependências externas)
   * Suporta blocos técnicos de código estruturados, numeração de linhas, inline code, imagens seguras, etc.
   */
  private parseMarkdown(text: string): string {
    if (!text) return '';

    // 1. Extração isolada e segura de blocos de código (```lang ... ```)
    const codeBlocks: string[] = [];
    const placeholderPrefix = 'SLCODEBLOCKTOKEN';

    let processedText = text.replace(
      /```([a-zA-Z0-9_-]*)\r?\n?([\s\S]*?)```/g,
      (_match, lang, code) => {
        const normalizedLang = (lang || 'code').trim().toLowerCase();
        const trimmedCode = code.replace(/^\n+|\n+$/g, '');

        // Sanitização de caracteres HTML dentro do código para prevenir XSS
        const escapedCode = trimmedCode
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');

        // Divide em linhas para renderização com numeração isolada
        const lines = escapedCode.split(/\r?\n/);
        const linesHtml = lines
          .map(
            (line: string, idx: number) =>
              `<span class="sl-code-line"><span class="sl-line-num">${idx + 1}</span><span class="sl-line-code">${line || ' '}</span></span>`
          )
          .join('');

        const isLongCode = lines.length > 20;
        const isPt = this.currentLang === 'pt';
        const copyLabel = isPt ? 'Copiar' : 'Copy';
        const copyTitle = isPt ? 'Copiar código' : 'Copy code';
        const scrollUpTitle = isPt ? 'Rolar para cima' : 'Scroll up';
        const scrollDownTitle = isPt ? 'Rolar para baixo' : 'Scroll down';
        const badgeText = isLongCode
          ? `${normalizedLang} · ${lines.length} ${isPt ? 'linhas' : 'lines'}`
          : normalizedLang;

        const expandLabel = isPt
          ? `Mostrar todas as ${lines.length} linhas`
          : `Show all ${lines.length} lines`;

        const scrollControlsHtml = isLongCode && !this._hideCodeScroll
          ? `
            <div class="sl-code-scroll-controls" aria-label="${isPt ? 'Navegação do código' : 'Code navigation'}">
              <button type="button" class="sl-code-scroll-btn sl-scroll-up" title="${scrollUpTitle}" aria-label="${scrollUpTitle}">
                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                  <path d="M8 3.5a.75.75 0 0 1 .53.22l4.5 4.5a.75.75 0 0 1-1.06 1.06L8 5.31 4.03 9.28a.75.75 0 0 1-1.06-1.06l4.5-4.5A.75.75 0 0 1 8 3.5Z"/>
                </svg>
              </button>
              <button type="button" class="sl-code-scroll-btn sl-scroll-down" title="${scrollDownTitle}" aria-label="${scrollDownTitle}">
                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                  <path d="M8 12.5a.75.75 0 0 1-.53-.22l-4.5-4.5a.75.75 0 0 1 1.06-1.06L8 10.69l3.97-3.97a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-.53.22Z"/>
                </svg>
              </button>
            </div>
            <div class="sl-code-expand-bar">
              <button type="button" class="sl-code-expand-btn" data-lines="${lines.length}">
                <span>↕</span>
                <span class="sl-expand-text">${expandLabel}</span>
              </button>
            </div>
          `
          : '';

        const blockHtml = `
          <div class="sl-code-block ${isLongCode ? 'sl-code-block-long sl-collapsed' : ''}" data-lang="${normalizedLang}">
            <div class="sl-code-header">
              <span class="sl-code-badge">${badgeText}</span>
              <button type="button" class="sl-code-copy-btn" title="${copyTitle}" aria-label="${copyTitle}">
                <svg class="sl-copy-icon" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                  <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
                  <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
                </svg>
                <span class="sl-copy-text">${copyLabel}</span>
              </button>
            </div>
            <pre class="sl-code-pre"><code class="sl-code-body">${linesHtml}</code></pre>
            ${scrollControlsHtml}
          </div>
        `.trim();

        const index = codeBlocks.length;
        codeBlocks.push(blockHtml);
        return `${placeholderPrefix}${index}ENDTOKEN`;
      }
    );

    // 2. Escape de caracteres HTML no texto restante
    let out = processedText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 3. Inline code
    out = out.replace(/`([^`]+)`/g, '<code class="sl-inline-code">$1</code>');
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    out = out.replace(/_([^_]+)_/g, '<em>$1</em>');
    out = out.replace(/~~([^~]+)~~/g, '<del>$1</del>');

    // 4. Imagens e GIFs Animados com filtro Anti-NSFW
    out = out.replace(
      /!\[([^\]]*)\]\(((?:https?:\/\/|data:image\/)[^\s)]+)\)/g,
      (_match, alt, url) => {
        const check = isSafeMediaUrl(url);
        if (!check.safe) {
          const reason = check.reason || 'Conteúdo potencialmente sensível';
          return `<span class="sl-blocked-media-notice" title="${reason}">⚠️ [Mídia bloqueada: filtro de conteúdo sensível / link não seguro]</span>`;
        }
        return `<img src="${url}" alt="${alt}" class="sl-embedded-img" loading="lazy" />`;
      }
    );

    // 5. Links e Menções
    out = out.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    out = out.replace(
      /(^|[^"'])(https?:\/\/[^\s<]+)/g,
      '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>'
    );
    out = out.replace(
      /@([a-zA-Z0-9-_]+)/g,
      '<a href="https://github.com/$1" target="_blank" rel="noopener noreferrer" class="sl-mention">@$1</a>'
    );

    // 6. Quebras de parágrafo e linhas
    out = out.replace(/\n\n/g, '</p><p>');
    out = out.replace(/\n/g, '<br />');

    // 7. Restauração dos blocos de código intactos (desaninhando de <p>)
    codeBlocks.forEach((blockHtml, idx) => {
      const ph = `${placeholderPrefix}${idx}ENDTOKEN`;
      out = out.replace(new RegExp(`<p>\\s*${ph}\\s*<\\/p>`, 'g'), blockHtml);
      out = out.replace(new RegExp(ph, 'g'), blockHtml);
    });

    return `<p>${out}</p>`;
  }

  /**
   * Formata datas de maneira inteligente, contextual e regionalizada (Intl API)
   */
  public formatDate(dateInput: string): { relative: string; full: string } {
    if (!dateInput) return { relative: '', full: '' };

    // Se já é texto mock relativo
    if (!dateInput.includes('T') && !dateInput.includes('-') && !dateInput.includes(':')) {
      return { relative: dateInput, full: dateInput };
    }

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return { relative: dateInput, full: dateInput };
    }

    const locale =
      typeof navigator !== 'undefined' && navigator.language
        ? navigator.language
        : this.currentLang === 'pt'
        ? 'pt-BR'
        : 'en-US';

    // Tooltip com data e hora completas no fuso horário do usuário
    const full = new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);

    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    const lang = this.currentLang;
    const isPt = lang === 'pt';
    const isEs = lang === 'es';

    if (diffSec < 60) {
      return {
        relative: isPt ? 'agora mesmo' : isEs ? 'ahora mismo' : 'just now',
        full,
      };
    }
    if (diffSec < 3600) {
      const mins = Math.floor(diffSec / 60);
      return {
        relative: isPt
          ? `há ${mins} ${mins === 1 ? 'minuto' : 'minutos'}`
          : isEs
          ? `hace ${mins} ${mins === 1 ? 'minuto' : 'minutos'}`
          : `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`,
        full,
      };
    }
    if (diffSec < 86400) {
      const hours = Math.floor(diffSec / 3600);
      return {
        relative: isPt
          ? `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`
          : isEs
          ? `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`
          : `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`,
        full,
      };
    }
    if (diffSec < 604800) {
      const days = Math.floor(diffSec / 86400);
      return {
        relative: isPt
          ? `há ${days} ${days === 1 ? 'dia' : 'dias'}`
          : isEs
          ? `hace ${days} ${days === 1 ? 'día' : 'días'}`
          : `${days} ${days === 1 ? 'day' : 'days'} ago`,
        full,
      };
    }

    // Acima de 7 dias: formato regional dia/mês/ano ou mês/dia/ano conforme localidade do navegador
    const localizedDate = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);

    return { relative: localizedDate, full };
  }

  /**
   * Detector heurístico ultrarrápido de idioma do texto do comentário (para voz poliglota e tradução)
   */
  public detectTextLanguage(text: string): string {
    if (!text || text.trim().length === 0) return this._lang;

    const clean = text
      .toLowerCase()
      .replace(/[*_`#]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/@\w+/g, '');

    const ptScore =
      (clean.match(/\b(o|a|os|as|de|do|da|em|um|uma|para|com|não|que|isso|este|esta|muito|bom|bem|projeto|comentário|genial|manteiga|artigo|leitura)\b/g) || []).length * 2 +
      (clean.match(/[ãõéêáàçíú]/g) || []).length * 3;

    const enScore =
      (clean.match(/\b(the|and|this|is|that|with|for|you|have|not|but|from|are|was|they|will|all|would|there|what|out|about|who|get|which|go|me|when|make|can|like|time|no|just|know|take|people|into|year|your|good|some|could|them|see|other|than|then|now|look|only|come|its|over|think|also|back|after|use|two|how|our|work|first|well|way|even|new|want|because|any|these|give|day|most|us|welcome|native|having|scroll|stutter)\b/g) || []).length * 2;

    const esScore =
      (clean.match(/\b(el|la|los|las|de|del|en|un|una|por|con|para|esto|este|esta|muy|bien|es|son|pero|como|más|sus|le|ya|o|fue|ha|sí|porque|cuando|sin|sobre|ser|tiene|también|me|hasta|hay|donde|quien|desde|todo|nos|durante|todos|uno|les|ni|contra|otros|ese|eso|ante|ellos|mí|antes|algunos|qué|unos|yo|otro|otras|otra|él|tanto|esa|estos|mucho|quienes|nada|muchos|cual|poco|ella|estar|estas|algunas|algo|nosotros|queda|excelente|artículos)\b/g) || []).length * 2 +
      (clean.match(/[¿¡ñ]/g) || []).length * 4;

    const frScore =
      (clean.match(/\b(le|la|les|de|du|des|en|et|un|une|pour|avec|dans|que|qui|est|sont|sur|ce|cette|ces|mais|ou|donc|or|ni|car|très|bien)\b/g) || []).length * 2 +
      (clean.match(/[œçèêàâôûëï]/g) || []).length * 3;

    const maxScore = Math.max(ptScore, enScore, esScore, frScore);
    if (maxScore < 2) return this.currentLang;

    if (maxScore === ptScore) return 'pt';
    if (maxScore === enScore) return 'en';
    if (maxScore === esScore) return 'es';
    if (maxScore === frScore) return 'fr';

    return this.currentLang;
  }

  private getVisitorLang(): string {
    return this.currentLang;
  }

  private getLanguageName(code: string, targetLang: string): string {
    const namesPt: Record<string, string> = {
      pt: 'Português',
      en: 'Inglês',
      es: 'Espanhol',
      fr: 'Francês',
      de: 'Alemão',
    };
    const namesEn: Record<string, string> = {
      pt: 'Portuguese',
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
    };
    const dict = targetLang === 'pt' ? namesPt : namesEn;
    return dict[code] || code.toUpperCase();
  }

  public async toggleTranslate(commentId: string): Promise<void> {
    const findItem = (list: ScatterComment[]): ScatterComment | null => {
      for (const item of list) {
        if (item.id === commentId) return item;
        if (item.replies) {
          const found = findItem(item.replies);
          if (found) return found;
        }
      }
      return null;
    };

    const item = findItem(this._comments);
    if (!item) return;

    if (item.isShowingTranslation) {
      item.isShowingTranslation = false;
      this.render();
      return;
    }

    if (item.translatedBody) {
      item.isShowingTranslation = true;
      this.render();
      return;
    }

    const lang = this.currentLang;
    const isPt = lang === 'pt';
    const isEs = lang === 'es';
    const targetLang = isPt ? 'pt' : isEs ? 'es' : 'en';

    const translationsPt: Record<string, string> = {
      '1': 'Welcome to **ScatterLeaf**! 🍃 This is a native comment rendered directly via Shadow DOM, with zero iframes and Markdown support.',
      '1-1':
        '@vault-author Isso é genial! Ter Shadow DOM nativo deixa a rolagem suave como manteiga, sem nenhum engasgo de iframe.',
      '1-2':
        '@sarah-eng Exactly! Page scrolling does not suffer from visual jumping caused by iframe resizing.',
      '2': 'Excelente projeto! O tema Warm Paper (**Cream**) fica fenomenal para ler artigos longos.',
    };
    const translationsEn: Record<string, string> = {
      '1': 'Bem-vindo ao **ScatterLeaf**! 🍃 Este é um comentário nativo renderizado diretamente via Shadow DOM, com zero iframes e suporte a Markdown.',
      '1-1':
        '@vault-author This is brilliant! Having native Shadow DOM makes the scroll buttery smooth without any iframe stutter.',
      '1-2':
        '@sarah-eng Exato! A rolagem da página não sofre com os pulos visuais de redimensionamento do iframe.',
      '2': 'Excellent project! The Warm Paper (**Cream**) theme looks phenomenal for reading long articles.',
    };

    const dict = isPt ? translationsPt : translationsEn;
    if (dict[commentId]) {
      item.translatedBody = dict[commentId];
      item.isShowingTranslation = true;
      this.render();
      return;
    }

    // Tradução dinâmica client-side via API gratuita MyMemory
    this._isTranslatingId = commentId;
    this.render();

    try {
      const fromLang = item.originalLang || this.detectTextLanguage(item.body);
      const cleanBody = item.body.replace(/[#*`_~]/g, '');
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanBody.slice(0, 500))}&langpair=${fromLang}|${targetLang}`
      );
      const data = await res.json();
      if (data && data.responseData && data.responseData.translatedText) {
        item.translatedBody = data.responseData.translatedText;
      } else {
        item.translatedBody = isPt ? `[Tradução]: ${item.body}` : `[Translation]: ${item.body}`;
      }
    } catch (err) {
      console.warn('🍃 [ScatterLeaf] Erro na tradução automática:', err);
      item.translatedBody = isPt ? `[Tradução]: ${item.body}` : `[Translation]: ${item.body}`;
    } finally {
      this._isTranslatingId = null;
      item.isShowingTranslation = true;
      this.render();
    }
  }

  public toggleSpeak(id: string, textToSpeak: string, langCode?: string): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert(
        this._lang === 'pt'
          ? 'Seu navegador não possui suporte à síntese de voz (Web Speech API).'
          : 'Your browser does not support Speech Synthesis (Web Speech API).'
      );
      return;
    }

    if (this._speakingId === id) {
      window.speechSynthesis.cancel();
      this._speakingId = null;
      this.render();
      return;
    }

    window.speechSynthesis.cancel();
    this._speakingId = id;
    this.render();

    const cleanText = textToSpeak
      .replace(/```[\s\S]*?(?:```|$)|~~~[\s\S]*?(?:~~~|$)/g, '')
      .replace(/[*_`#]/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .replace(/\s+/g, ' ')
      .trim();

    const textToRead =
      cleanText ||
      (this._lang === 'pt'
        ? 'Este comentário contém apenas um bloco de código.'
        : 'This comment contains only a code block.');

    const utterance = new SpeechSynthesisUtterance(textToRead);

    // Mapeamento poliglota por idioma do comentário / tradução
    const langMap: Record<string, string> = {
      pt: 'pt-BR',
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      it: 'it-IT',
    };
    const targetLocale =
      (langCode && langMap[langCode]) ||
      langCode ||
      (this._lang === 'pt' ? 'pt-BR' : 'en-US');
    utterance.lang = targetLocale;

    // Seleciona a melhor voz nativa disponível no sistema operacional para o idioma
    if ('speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      const prefix = targetLocale.slice(0, 2).toLowerCase();
      const matchedVoice = voices.find((v) =>
        v.lang.replace('_', '-').toLowerCase().startsWith(prefix)
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    utterance.rate = 1.0;

    utterance.onend = () => {
      this._speakingId = null;
      this.render();
    };

    utterance.onerror = () => {
      this._speakingId = null;
      this.render();
    };

    window.speechSynthesis.speak(utterance);
  }


  private render(): void {
    if (!this.shadowRoot) return;

    const totalComments = this._comments.reduce(
      (acc, c) => acc + 1 + (c.replies?.length || 0),
      0
    );

    const titleText = this.currentLang === 'pt' ? 'Comentários' : 'Comments';
    const composerHtml = this.renderComposer();
    const listHtml = this._isLoading
      ? `<div style="text-align: center; padding: 2.5rem; color: var(--sl-text-muted);">
           <span style="font-size: 1.5rem; display: block; margin-bottom: 0.5rem; animation: spin 1s infinite linear;">🍃</span>
           ${this.currentLang === 'pt' ? 'Carregando notas na brisa...' : 'Floating notes in the breeze...'}
         </div>`
      : this.renderCommentsList();

    this.shadowRoot.innerHTML = `
      <style>${baseStyles}</style>
      <div class="sl-container" part="container">
        <header class="sl-header" part="header">
          <div class="sl-header-left">
            <h3 class="sl-title">
              <span>💬</span>
              <span>${titleText}</span>
              <span class="sl-badge" part="badge">${totalComments}</span>
            </h3>
            ${
              this._broker
                ? `<span class="sl-broker-status" title="${this._isBrokerConnected ? 'Conectado ao Cloudflare Edge Broker' : 'Broker configurado mas offline (Mock local ativo)'}">
                    <span class="sl-broker-dot ${this._isBrokerConnected ? '' : 'sl-broker-standalone'}"></span>
                    <span>${this._isBrokerConnected ? 'Broker Borda' : 'Mock Local'}</span>
                  </span>`
                : ''
            }
          </div>

          <span class="sl-brand-tag" part="brand">
            🍃 <a href="https://github.com/rnt-rez/scatterleaf" target="_blank" rel="noopener noreferrer">ScatterLeaf</a>
          </span>
        </header>

        ${this._inputPosition === 'top' ? composerHtml : ''}
        ${this.renderCommentsToolbar()}
        ${this.renderModerationBar()}
        ${listHtml}
        ${this._inputPosition === 'bottom' ? composerHtml : ''}
      </div>
      ${this._isMediaModalOpen ? this.renderMediaModal() : ''}
      ${this._isImageModalOpen ? this.renderImageModal() : ''}
      ${this._lightboxOpen ? this.renderLightbox() : ''}
    `;

    this.attachEvents();
  }

  /**
   * Renderiza o Modal Seguro de Inserção de GIFs (Anti-NSFW)
   */
  private renderMediaModal(): string {
    const isPt = this.currentLang === 'pt';
    const title = isPt ? 'Inserir GIF' : 'Insert GIF';
    const notice = isPt
      ? 'Filtro Anti-NSFW ativo: URLs passam por validação estrita de segurança e integridade.'
      : 'Anti-NSFW filter active: URLs undergo strict security and integrity checks.';
    const urlLabel = isPt ? 'URL do GIF (HTTPS obrigatório):' : 'GIF URL (Strict HTTPS):';
    const altLabel = isPt ? 'Descrição do GIF / Alt text (Opcional):' : 'GIF description / Alt text (Optional):';
    const cancelText = isPt ? 'Cancelar' : 'Cancel';
    const insertText = isPt ? 'Inserir GIF' : 'Insert GIF';
    const recentGifs = getStoredRecentGifs();

    return `
      <div class="sl-modal-backdrop" id="media-modal-backdrop">
        <div class="sl-modal-box" role="dialog" aria-modal="true" aria-labelledby="sl-media-modal-title">
          <div class="sl-modal-header">
            <h4 class="sl-modal-title" id="sl-media-modal-title">
              <span>🖼️</span>
              <span>${title}</span>
            </h4>
            <button type="button" class="sl-modal-close-btn" id="btn-close-media-modal" aria-label="${isPt ? 'Fechar' : 'Close'}">✕</button>
          </div>

          <div class="sl-modal-body">
            <div class="sl-modal-notice">
              <span>${notice}</span>
            </div>

            <!-- Inserção por URL segura -->
            <div class="sl-modal-input-group">
              <label class="sl-modal-label" for="media-url-input">${urlLabel}</label>
              <input
                type="url"
                class="sl-modal-input"
                id="media-url-input"
                placeholder="https://media.giphy.com/media/.../giphy.gif"
                value="${this._mediaModalUrl}"
                autofocus
              />
              <div class="sl-url-preview-card" id="media-url-preview-card" style="${this._mediaModalUrl && !this._mediaModalError ? 'display: flex;' : 'display: none;'}">
                <img src="${this._mediaModalUrl || ''}" alt="Prévia do GIF" class="sl-url-preview-img" id="media-url-preview-img" onerror="this.style.display='none'" />
                <span class="sl-url-preview-label">${isPt ? '✓ Link pronto para inserção' : '✓ Link ready to insert'}</span>
              </div>
            </div>

            <!-- Descrição / Alt Text -->
            <div class="sl-modal-input-group">
              <label class="sl-modal-label" for="media-alt-input">${altLabel}</label>
              <input
                type="text"
                class="sl-modal-input"
                id="media-alt-input"
                placeholder="${isPt ? 'Ex: Comemoração animada' : 'Ex: Cheering reaction'}"
                value="${this._mediaModalAlt}"
              />
            </div>

            <!-- Botão Adicionar na Coleção -->
            <div class="sl-modal-collection-row">
              <button type="button" class="sl-btn sl-btn-save-collection" id="btn-save-gif-collection" title="${
                isPt ? 'Salvar GIF na sua coleção recente sem postar direto' : 'Save GIF to your recent collection without posting'
              }">
                <span>➕</span>
                <span>${isPt ? 'Salvar na coleção' : 'Save to collection'}</span>
              </button>
              ${
                this._mediaModalSuccess
                  ? `<span class="sl-modal-success-badge">✓ ${this._mediaModalSuccess}</span>`
                  : ''
              }
            </div>

            ${
              recentGifs.length > 0
                ? `
              <div class="sl-modal-recents">
                <div class="sl-modal-recents-header">
                  <span>${isPt ? `Seus GIFs Recentes (${recentGifs.length}/24):` : `Your Recent GIFs (${recentGifs.length}/24):`}</span>
                  ${
                    this._isConfirmingClearGifs
                      ? `
                    <div class="sl-confirm-clear-box">
                      <span class="sl-confirm-clear-text">${isPt ? 'Limpar todos?' : 'Clear all?'}</span>
                      <div class="sl-confirm-clear-actions">
                        <button type="button" class="sl-btn-confirm-yes" id="btn-confirm-clear-gifs-yes">${isPt ? 'Sim, limpar' : 'Yes, clear'}</button>
                        <button type="button" class="sl-btn-confirm-no" id="btn-confirm-clear-gifs-no">${isPt ? 'Cancelar' : 'Cancel'}</button>
                      </div>
                    </div>
                  `
                      : `
                    <div class="sl-modal-recents-actions">
                      <button type="button" class="sl-btn-manage-recents ${this._isManagingRecentGifs ? 'sl-active' : ''}" id="btn-manage-recent-gifs" title="${
                          this._isManagingRecentGifs
                            ? (isPt ? 'Concluir gerenciamento' : 'Done managing')
                            : (isPt ? 'Gerenciar e remover GIFs' : 'Manage & remove GIFs')
                        }">
                        ${this._isManagingRecentGifs ? (isPt ? '✓ Concluir' : '✓ Done') : (isPt ? 'Gerenciar' : 'Manage')}
                      </button>
                      <button type="button" class="sl-btn-clear-recents" id="btn-clear-recent-gifs" title="${
                          isPt ? 'Limpar histórico de GIFs' : 'Clear GIF history'
                        }">
                        ${isPt ? 'Limpar' : 'Clear'}
                      </button>
                    </div>
                  `
                  }
                </div>
                <div class="sl-modal-recents-grid ${this._isManagingRecentGifs ? 'sl-managing-recents' : ''}">
                  ${recentGifs
                    .map(
                      (g) => `
                    <div class="sl-recent-gif-wrapper">
                      <button type="button" class="sl-recent-gif-item" data-url="${g.url}" data-alt="${g.alt || ''}" title="${g.alt || g.url}">
                        <img src="${g.url}" alt="${g.alt || 'GIF'}" loading="lazy" />
                      </button>
                      <button type="button" class="sl-btn-delete-recent-gif" data-url="${g.url}" title="${
                        isPt ? 'Remover este GIF dos recentes' : 'Remove this GIF from recents'
                      }" aria-label="${isPt ? 'Remover GIF' : 'Remove GIF'}">✕</button>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>
            `
                : ''
            }

            <div class="sl-modal-error" id="media-modal-error-box" style="${this._mediaModalError ? 'display: flex;' : 'display: none;'}">
              <span>⚠️</span>
              <span id="media-modal-error-text">${this._mediaModalError || ''}</span>
            </div>
          </div>

          <div class="sl-modal-footer">
            <button type="button" class="sl-btn sl-btn-secondary" id="btn-cancel-media-modal">
              ${cancelText}
            </button>
            <button type="button" class="sl-btn sl-btn-primary" id="btn-confirm-media-modal">
              <span>🖼️</span>
              <span>${insertText}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza o Modal Seguro de Inserção de Imagens (Apenas via URL HTTPS)
   */
  private renderImageModal(): string {
    const isPt = this.currentLang === 'pt';
    const title = isPt ? 'Inserir imagem' : 'Insert image';
    const notice = isPt
      ? 'Filtro Anti-NSFW ativo: Insira um link direto HTTPS seguro da sua imagem (Imgur, Cloudinary, GitHub, etc.).'
      : 'Anti-NSFW filter active: Enter a secure HTTPS direct link to your image (Imgur, Cloudinary, GitHub, etc.).';
    const urlLabel = isPt ? 'URL da Imagem (HTTPS obrigatório):' : 'Image URL (Strict HTTPS):';
    const altLabel = isPt ? 'Descrição da Imagem / Alt text (Opcional):' : 'Image description / Alt text (Optional):';
    const cancelText = isPt ? 'Cancelar' : 'Cancel';
    const insertText = isPt ? 'Inserir Imagem' : 'Insert Image';
    const recentImages = getStoredRecentImages();

    return `
      <div class="sl-modal-backdrop" id="image-modal-backdrop">
        <div class="sl-modal-box" role="dialog" aria-modal="true" aria-labelledby="sl-image-modal-title">
          <div class="sl-modal-header">
            <h4 class="sl-modal-title" id="sl-image-modal-title">
              <span>📷</span>
              <span>${title}</span>
            </h4>
            <button type="button" class="sl-modal-close-btn" id="btn-close-image-modal" aria-label="${isPt ? 'Fechar' : 'Close'}">✕</button>
          </div>

          <div class="sl-modal-body">
            <div class="sl-modal-notice">
              <span>${notice}</span>
            </div>

            <!-- Inserção por URL segura -->
            <div class="sl-modal-input-group">
              <label class="sl-modal-label" for="image-url-input">${urlLabel}</label>
              <input
                type="url"
                class="sl-modal-input"
                id="image-url-input"
                placeholder="https://i.imgur.com/... ou https://res.cloudinary.com/..."
                value="${this._imageModalUrl}"
                autofocus
              />
              <div class="sl-url-preview-card" id="image-url-preview-card" style="${this._imageModalUrl && !this._imageModalError ? 'display: flex;' : 'display: none;'}">
                <img src="${this._imageModalUrl || ''}" alt="Prévia da imagem" class="sl-url-preview-img" id="image-url-preview-img" onerror="this.style.display='none'" />
                <span class="sl-url-preview-label">${isPt ? '✓ Link pronto para inserção' : '✓ Link ready to insert'}</span>
              </div>
            </div>

            <!-- Descrição / Alt Text -->
            <div class="sl-modal-input-group">
              <label class="sl-modal-label" for="image-alt-input">${altLabel}</label>
              <input
                type="text"
                class="sl-modal-input"
                id="image-alt-input"
                placeholder="${isPt ? 'Ex: Diagrama de fluxo do projeto' : 'Ex: Project workflow diagram'}"
                value="${this._imageModalAlt}"
              />
            </div>

            <!-- Botão Adicionar na Coleção -->
            <div class="sl-modal-collection-row">
              <button type="button" class="sl-btn sl-btn-save-collection" id="btn-save-image-collection" title="${
                isPt ? 'Salvar Imagem na sua coleção recente sem postar direto' : 'Save Image to your recent collection without posting'
              }">
                <span>➕</span>
                <span>${isPt ? 'Salvar na coleção' : 'Save to collection'}</span>
              </button>
              ${
                this._imageModalSuccess
                  ? `<span class="sl-modal-success-badge">✓ ${this._imageModalSuccess}</span>`
                  : ''
              }
            </div>

            ${
              recentImages.length > 0
                ? `
              <div class="sl-modal-recents">
                <div class="sl-modal-recents-header">
                  <span>${isPt ? `Suas Imagens Recentes (${recentImages.length}/24):` : `Your Recent Images (${recentImages.length}/24):`}</span>
                  ${
                    this._isConfirmingClearImages
                      ? `
                    <div class="sl-confirm-clear-box">
                      <span class="sl-confirm-clear-text">${isPt ? 'Limpar todas?' : 'Clear all?'}</span>
                      <div class="sl-confirm-clear-actions">
                        <button type="button" class="sl-btn-confirm-yes" id="btn-confirm-clear-images-yes">${isPt ? 'Sim, limpar' : 'Yes, clear'}</button>
                        <button type="button" class="sl-btn-confirm-no" id="btn-confirm-clear-images-no">${isPt ? 'Cancelar' : 'Cancel'}</button>
                      </div>
                    </div>
                  `
                      : `
                    <div class="sl-modal-recents-actions">
                      <button type="button" class="sl-btn-manage-recents ${this._isManagingRecentImages ? 'sl-active' : ''}" id="btn-manage-recent-images" title="${
                          this._isManagingRecentImages
                            ? (isPt ? 'Concluir gerenciamento' : 'Done managing')
                            : (isPt ? 'Gerenciar e remover imagens' : 'Manage & remove images')
                        }">
                        ${this._isManagingRecentImages ? (isPt ? '✓ Concluir' : '✓ Done') : (isPt ? 'Gerenciar' : 'Manage')}
                      </button>
                      <button type="button" class="sl-btn-clear-recents" id="btn-clear-recent-images" title="${
                          isPt ? 'Limpar histórico de imagens' : 'Clear image history'
                        }">
                        ${isPt ? 'Limpar' : 'Clear'}
                      </button>
                    </div>
                  `
                  }
                </div>
                <div class="sl-modal-recents-grid ${this._isManagingRecentImages ? 'sl-managing-recents' : ''}">
                  ${recentImages
                    .map(
                      (img) => `
                    <div class="sl-recent-gif-wrapper">
                      <button type="button" class="sl-recent-image-item sl-recent-gif-item" data-url="${img.url}" data-alt="${img.alt || ''}" title="${img.alt || img.url}">
                        <img src="${img.url}" alt="${img.alt || 'Imagem'}" loading="lazy" />
                      </button>
                      <button type="button" class="sl-btn-delete-recent-image sl-btn-delete-recent-gif" data-url="${img.url}" title="${
                        isPt ? 'Remover esta imagem dos recentes' : 'Remove this image from recents'
                      }" aria-label="${isPt ? 'Remover Imagem' : 'Remove Image'}">✕</button>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>
            `
                : ''
            }

            <div class="sl-modal-error" id="image-modal-error-box" style="${this._imageModalError ? 'display: flex;' : 'display: none;'}">
              <span>⚠️</span>
              <span id="image-modal-error-text">${this._imageModalError || ''}</span>
            </div>
          </div>

          <div class="sl-modal-footer">
            <button type="button" class="sl-btn sl-btn-secondary" id="btn-cancel-image-modal">
              ${cancelText}
            </button>
            <button type="button" class="sl-btn sl-btn-primary" id="btn-confirm-image-modal">
              <span>📷</span>
              <span>${insertText}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza a visualização imersiva do Mini-Lightbox Nativo (Zoom & Pan)
   */
  private renderLightbox(): string {
    const isPt = this.currentLang === 'pt';
    const zoomInTitle = isPt ? 'Aproximar zoom (+)' : 'Zoom in (+)';
    const zoomOutTitle = isPt ? 'Afastar zoom (-)' : 'Zoom out (-)';
    const resetTitle = isPt ? 'Redefinir zoom (1:1)' : 'Reset zoom (1:1)';
    const closeTitle = isPt ? 'Fechar visualização (Esc)' : 'Close view (Esc)';
    const zoomPct = Math.round(this._lightboxScale * 100);

    return `
      <div class="sl-lightbox-backdrop" id="sl-lightbox-backdrop" role="dialog" aria-modal="true" aria-label="${isPt ? 'Visualizador de Imagem' : 'Image Viewer'}">
        <div class="sl-lightbox-toolbar">
          <div class="sl-lightbox-title">${this.escapeHtml(this._lightboxImgAlt || (isPt ? 'Imagem' : 'Image'))}</div>
          <div class="sl-lightbox-actions">
            <span class="sl-lightbox-badge" id="sl-lightbox-badge">${zoomPct}%</span>
            <button type="button" class="sl-lightbox-btn" id="sl-lightbox-zoom-out" title="${zoomOutTitle}" aria-label="${zoomOutTitle}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
            </button>
            <button type="button" class="sl-lightbox-btn" id="sl-lightbox-zoom-in" title="${zoomInTitle}" aria-label="${zoomInTitle}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
            </button>
            <button type="button" class="sl-lightbox-btn" id="sl-lightbox-reset" title="${resetTitle}" aria-label="${resetTitle}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            </button>
            <button type="button" class="sl-lightbox-btn sl-lightbox-btn-close" id="sl-lightbox-close" title="${closeTitle}" aria-label="${closeTitle}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
        <div class="sl-lightbox-stage" id="sl-lightbox-stage">
          <img
            class="sl-lightbox-img ${this._lightboxScale > 1.05 ? 'sl-zoomed' : ''}"
            id="sl-lightbox-img"
            src="${this.escapeHtml(this._lightboxImgSrc)}"
            alt="${this.escapeHtml(this._lightboxImgAlt)}"
            draggable="false"
            style="transform: translate(${this._lightboxTranslateX}px, ${this._lightboxTranslateY}px) scale(${this._lightboxScale});"
          />
        </div>
        <div class="sl-lightbox-hint">
          ${isPt ? 'Dica: Arraste para mover • Roda do mouse ou duplo clique para zoom • Esc para fechar' : 'Tip: Drag to pan • Mouse wheel or double click to zoom • Esc to close'}
        </div>
      </div>
    `;
  }

  private openLightbox(src: string, alt: string = ''): void {
    this._lightboxImgSrc = src;
    this._lightboxImgAlt = alt;
    this._lightboxScale = 1;
    this._lightboxTranslateX = 0;
    this._lightboxTranslateY = 0;
    this._lightboxOpen = true;
    this.render();
  }

  private closeLightbox(): void {
    this._lightboxOpen = false;
    this._lightboxScale = 1;
    this._lightboxTranslateX = 0;
    this._lightboxTranslateY = 0;
    this._isDraggingImage = false;
    this.render();
  }

  private setLightboxZoom(newScale: number): void {
    const clamped = Math.max(0.5, Math.min(4, newScale));
    this._lightboxScale = Math.round(clamped * 100) / 100;
    if (this._lightboxScale <= 1) {
      this._lightboxTranslateX = 0;
      this._lightboxTranslateY = 0;
    }
    this.updateLightboxTransform();
  }

  private resetLightboxTransform(): void {
    this._lightboxScale = 1;
    this._lightboxTranslateX = 0;
    this._lightboxTranslateY = 0;
    this.updateLightboxTransform();
  }

  private updateLightboxTransform(isPanning: boolean = false): void {
    const img = this.shadowRoot?.getElementById('sl-lightbox-img') as HTMLImageElement | null;
    const badge = this.shadowRoot?.getElementById('sl-lightbox-badge');
    if (!img) return;

    if (isPanning) {
      img.classList.add('sl-panning');
    } else {
      img.classList.remove('sl-panning');
    }

    if (this._lightboxScale > 1.05) {
      img.classList.add('sl-zoomed');
    } else {
      img.classList.remove('sl-zoomed');
    }

    img.style.transform = `translate(${this._lightboxTranslateX}px, ${this._lightboxTranslateY}px) scale(${this._lightboxScale})`;
    if (badge) {
      badge.textContent = `${Math.round(this._lightboxScale * 100)}%`;
    }
  }

  /**
   * Renderiza o Menu Popover Flutuante com as Linguagens Populares
   */
  private renderCodePicker(): string {
    const isPt = this.currentLang === 'pt';
    const title = isPt ? 'Linguagem do Bloco' : 'Code Language';

    return `
      <div class="sl-code-picker-popover" role="menu" aria-label="${title}">
        <div class="sl-code-picker-title">${title}</div>
        <div class="sl-code-lang-grid">
          ${POPULAR_CODE_LANGUAGES.map(
            (l) => `
            <button type="button" class="sl-code-lang-btn" data-lang="${l.id}" role="menuitem" title="${l.name}">
              <span class="sl-code-lang-name">${l.name}</span>
              <span class="sl-code-lang-tag">${l.id}</span>
            </button>
          `
          ).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Insere bloco de código com formatação e foco inteligente
   * Suporta seleção prévia do usuário ou template com placeholder pré-selecionado
   */
  private insertCodeBlock(lang: string = 'typescript'): void {
    const textarea = this.shadowRoot?.getElementById('composer-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = this._savedComposerSelection?.start ?? textarea.selectionStart ?? this._composerText.length;
    const end = this._savedComposerSelection?.end ?? textarea.selectionEnd ?? this._composerText.length;
    const selectedText = textarea.value.substring(start, end);
    const placeholder = selectedText || (this.currentLang === 'pt' ? '// Seu código aqui' : '// Your code here');

    const prefix = textarea.value.substring(0, start);
    const suffix = textarea.value.substring(end);

    const needLeadingNewline = prefix.length > 0 && !prefix.endsWith('\n');
    const needTrailingNewline = suffix.length > 0 && !suffix.startsWith('\n');

    const lead = needLeadingNewline ? '\n' : '';
    const trail = needTrailingNewline ? '\n' : '';

    const insertedBlock = `${lead}\`\`\`${lang}\n${placeholder}\n\`\`\`${trail}`;
    const newText = prefix + insertedBlock + suffix;

    this._composerText = newText;
    this._isCodePickerOpen = false;
    this._savedComposerSelection = null;

    const codeStart = prefix.length + lead.length + 3 + lang.length + 1;
    const codeEnd = codeStart + placeholder.length;

    // Re-renderiza para fechar a tela de linguagens imediatamente no DOM
    this.render();

    // Foco e seleção inteligente do placeholder para digitação imediata
    const newTextarea = this.shadowRoot?.getElementById('composer-textarea') as HTMLTextAreaElement | null;
    if (newTextarea) {
      newTextarea.focus();
      newTextarea.setSelectionRange(codeStart, codeEnd);
      newTextarea.style.height = 'auto';
      newTextarea.style.height = `${newTextarea.scrollHeight}px`;
    }
  }

  /**
   * Renderiza a Caixa de Escrita Principal (com Abas Escreva / Prévia, Aa e Autenticação)
   */
  private renderComposer(): string {
    const isWrite = this._hidePreview ? true : this._activeTab === 'write';
    const isMono = this._fontMode === 'monospace';
    const writePlaceholder =
      this.currentLang === 'pt'
        ? 'Deixe uma nota ou comentário...'
        : 'Leave a note or comment...';
    const writeTabLabel = this.currentLang === 'pt' ? 'Escreva' : 'Write';
    const previewTabLabel = this.currentLang === 'pt' ? 'Prévia' : 'Preview';
    const previewEmptyText =
      this.currentLang === 'pt' ? 'Nada para pré-visualizar ainda.' : 'Nothing to preview yet.';
    const signInText = this.currentLang === 'pt' ? 'Entre com GitHub' : 'Sign in with GitHub';
    const postNoteText = this.currentLang === 'pt' ? 'Publicar nota' : 'Post note';

    return `
      <div class="sl-composer" part="composer">
        <!-- Barra de Abas e Ações (Bloco de Código </> e Controle Tipográfico Aa) -->
        <div class="sl-composer-tabs">
          <div class="sl-tabs-group" role="tablist">
            <button class="sl-tab ${isWrite ? 'sl-tab-active' : ''}" id="tab-write" role="tab" aria-selected="${isWrite}">
              ${writeTabLabel}
            </button>
            ${
              !this._hidePreview
                ? `
              <button class="sl-tab ${!isWrite ? 'sl-tab-active' : ''}" id="tab-preview" role="tab" aria-selected="${!isWrite}">
                ${previewTabLabel}
              </button>
            `
                : ''
            }
          </div>
          <div class="sl-composer-tabs-actions">
            <div class="sl-code-menu-wrapper">
              <button class="sl-code-toggle ${this._isCodePickerOpen ? 'sl-code-toggle-active' : ''}" id="btn-code-toggle" type="button" title="${this.currentLang === 'pt' ? 'Inserir bloco de código' : 'Insert code block'}" aria-label="Código">
                <span>&lt;/&gt;</span>
              </button>
              ${this._isCodePickerOpen ? this.renderCodePicker() : ''}
            </div>
            <button class="sl-font-toggle ${isMono ? 'sl-mono-active' : ''}" id="btn-font-toggle" title="Alternar fonte monoespaçada / texto" aria-label="Alternar tipografia">
              <span>Aa</span>
            </button>
          </div>
        </div>

        <!-- Área de Edição / Prévia -->
        <div class="sl-composer-body">
          ${
            isWrite
              ? `<textarea class="sl-textarea ${isMono ? 'sl-monospace' : ''}" id="composer-textarea" placeholder="${writePlaceholder}" part="textarea">${this._composerText}</textarea>`
              : `<div class="sl-preview-area ${isMono ? 'sl-monospace' : ''}" part="preview-area">
                  ${this._composerText ? this.parseMarkdown(this._composerText) : `<span class="sl-preview-empty">${previewEmptyText}</span>`}
                </div>`
          }
        </div>

        <!-- Rodapé do Composer (Usuário Autenticado vs Visitante) -->
        <div class="sl-composer-footer">
          ${
            this._currentUser
              ? `
            <div class="sl-user-badge">
              <img class="sl-user-avatar" src="${this._currentUser.avatarUrl}" alt="${this._currentUser.login}" />
              <span class="sl-user-name">@${this._currentUser.login}</span>
              <button class="sl-btn-logout" id="btn-logout" title="Sair da sessão">
                ${this.currentLang === 'pt' ? 'Sair' : 'Logout'}
              </button>
            </div>
            <div class="sl-composer-actions">
              <div class="sl-emoji-wrapper">
                <button class="sl-btn-emoji ${this._isEmojiPickerOpen ? 'sl-btn-emoji-active' : ''}" id="btn-emoji-toggle" type="button" title="${this.currentLang === 'pt' ? 'Inserir emojis e ícones' : 'Insert emojis & icons'}" aria-label="Emoji">
                  <span>😀</span>
                </button>
                ${this._isEmojiPickerOpen ? this.renderEmojiPicker() : ''}
              </div>
              <button class="sl-btn sl-btn-primary" id="btn-submit" part="submit-btn">
                <span>🍃</span>
                <span>${postNoteText}</span>
              </button>
            </div>
          `
              : `
            <span style="font-size: 0.75rem; color: var(--sl-text-muted);">
              ${this.currentLang === 'pt' ? 'Markdown suportado' : 'Markdown supported'}
            </span>
            <div class="sl-composer-actions">
              <div class="sl-emoji-wrapper">
                <button class="sl-btn-emoji ${this._isEmojiPickerOpen ? 'sl-btn-emoji-active' : ''}" id="btn-emoji-toggle" type="button" title="${this.currentLang === 'pt' ? 'Inserir emojis e ícones' : 'Insert emojis & icons'}" aria-label="Emoji">
                  <span>😀</span>
                </button>
                ${this._isEmojiPickerOpen ? this.renderEmojiPicker() : ''}
              </div>
              <button class="sl-btn sl-btn-github" id="btn-login-submit" part="submit-btn">
                <svg height="16" width="16" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                </svg>
                <span>${signInText}</span>
              </button>
            </div>
          `
          }
        </div>
      </div>
    `;
  }

  /**
   * Caixa de Emojis e Ícones Expressivos com Seletor de Tom de Pele
   */
  private renderEmojiPicker(): string {
    const categories = [
      {
        name: this.currentLang === 'pt' ? 'Rostos & Emoções' : 'Faces & Feelings',
        emojis: [
          '😀', '😃', '😄', '😁', '😆', '😅', '😂',
          '🤣', '🥹', '😊', '😇', '🙂', '😉', '😌',
          '😍', '🥰', '😘', '😋', '😜', '🤪', '😎',
          '🤓', '🧐', '🤔', '🫡', '🤫', '😴', '🤯',
          '🥳', '🤩', '😭', '😡', '😈', '👻', '🤖',
        ],
      },
      {
        name: this.currentLang === 'pt' ? 'Gestos & Mágica' : 'Gestures & Magic',
        emojis: [
          '🧙‍♂️', '🧙‍♀️', '🧙', '🔮', '✨', '🪄', '👍', '👏',
          '🙌', '🤝', '🙏', '✌️', '🤘', '🤙', '👊', '✊',
          '🤛', '🤜', '🤞', '🫶', '👋', '🖐️', '✋', '🖖',
          '💪', '👀', '🧠', '🫀', '💯', '💥', '🚀',
        ],
      },
      {
        name: this.currentLang === 'pt' ? 'Símbolos & Celebração' : 'Symbols & Celebration',
        emojis: [
          '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤',
          '🤍', '💔', '❣️', '💕', '💖', '🔥', '🌟',
          '⭐', '⚡', '💡', '🎉', '🏆', '☕', '🍵',
          '🍺', '🍻', '🍕', '🍿', '🎲', '🎮', '🎸',
        ],
      },
      {
        name: this.currentLang === 'pt' ? 'Dev, Tech & Natureza' : 'Dev, Tech & Nature',
        emojis: [
          '🍃', '🌱', '🌿', '🍂', '🍁', '🌍', '🌎',
          '💻', '🖥️', '📱', '⌨️', '🖱️', '📡', '🚀',
          '🐛', '🐞', '📦', '🛠️', '⚙️', '🔧', '🔨',
          '🔍', '🔒', '🛡️', '🎨', '🧪', '💎', '🎯',
        ],
      },
    ];

    const gifLabel = this.currentLang === 'pt' ? 'Inserir GIF' : 'Insert GIF';
    const titleText = this.currentLang === 'pt' ? 'Emojis & Ícones' : 'Emojis & Icons';
    const currentToneFist = applySkinTone('👊', this._selectedSkinTone);
    const toneToggleTitle =
      this.currentLang === 'pt'
        ? 'Tom de pele (clique para escolher)'
        : 'Skin tone (click to choose)';

    return `
      <div class="sl-emoji-popover" id="emoji-popover" part="emoji-popover">
        <div class="sl-emoji-header">
          <div style="display: flex; align-items: center; gap: 0.45rem;">
            <span class="sl-emoji-title">${titleText}</span>
            ${
              !this._hideSkinTone
                ? `
              <button type="button" class="sl-skin-tone-toggle-btn ${this._isSkinTonePanelOpen ? 'sl-tone-active' : ''}" id="btn-skin-tone-toggle" title="${toneToggleTitle}">
                <span>${currentToneFist}</span>
              </button>
            `
                : ''
            }
          </div>
          <div class="sl-emoji-nav">
            <button type="button" class="sl-emoji-nav-btn" id="btn-emoji-scroll-up" title="${this.currentLang === 'pt' ? 'Subir' : 'Scroll up'}">▲</button>
            <button type="button" class="sl-emoji-nav-btn" id="btn-emoji-scroll-down" title="${this.currentLang === 'pt' ? 'Descer' : 'Scroll down'}">▼</button>
            <button type="button" class="sl-emoji-nav-btn sl-emoji-close-btn" id="btn-emoji-close" title="${this.currentLang === 'pt' ? 'Fechar' : 'Close'}">✕</button>
          </div>
        </div>

        ${
          !this._hideSkinTone && this._isSkinTonePanelOpen
            ? `
          <div class="sl-skin-tone-panel">
            <div class="sl-skin-tone-panel-header">
              <span>${this.currentLang === 'pt' ? 'Escolha o tom de pele padrão:' : 'Choose default skin tone:'}</span>
              <span style="font-size: 0.68rem; opacity: 0.85;">💾 ${this.currentLang === 'pt' ? 'Salvo no navegador' : 'Saved in browser'}</span>
            </div>
            <div class="sl-skin-tone-options">
              ${SKIN_TONES.map((t) => {
                const sampleEmoji = applySkinTone('👊', t.modifier);
                const isSelected =
                  this._selectedSkinTone === t.modifier ||
                  (this._selectedSkinTone === 'default' && t.modifier === '');
                const titleName = this.currentLang === 'pt' ? t.namePt : t.nameEn;
                return `
                  <button type="button" class="sl-tone-btn ${isSelected ? 'sl-tone-selected' : ''}" data-tone-mod="${t.modifier || 'default'}" title="${titleName}">
                    ${sampleEmoji}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        `
            : ''
        }

        <div class="sl-emoji-scroll" id="emoji-scroll-container">
          ${categories
            .map(
              (cat) => `
            <div class="sl-emoji-category">
              <span class="sl-emoji-category-title">${cat.name}</span>
              <div class="sl-emoji-grid">
                ${cat.emojis
                  .map((emoji) => {
                    const isToneable = TONEABLE_EMOJIS.has(emoji);
                    const displayedEmoji = isToneable ? applySkinTone(emoji, this._selectedSkinTone) : emoji;
                    return `
                      <button type="button" class="sl-emoji-item" data-emoji="${displayedEmoji}" data-base-emoji="${emoji}" data-toneable="${isToneable ? 'true' : 'false'}" title="${displayedEmoji}">
                        ${displayedEmoji}
                      </button>
                    `;
                  })
                  .join('')}
              </div>
            </div>
          `
            )
            .join('')}
        </div>

        <button type="button" class="sl-emoji-gif-btn" id="btn-insert-gif" title="${
          this.currentLang === 'pt' ? 'Insere modelo Markdown de GIF' : 'Inserts Markdown GIF template'
        }">
          <span>🖼️</span>
          <span>${gifLabel}</span>
        </button>
        ${
          this._enableImages
            ? `
          <button type="button" class="sl-emoji-img-btn" id="btn-insert-image" title="${
            this.currentLang === 'pt' ? 'Inserir imagem via URL' : 'Insert image via URL'
          }">
            <span>📷</span>
            <span>${this.currentLang === 'pt' ? 'Inserir imagem' : 'Insert image'}</span>
          </button>
        `
            : ''
        }
      </div>
    `;
  }

  /**
   * Insere texto ou emojis na posição atual do cursor na textarea
   */
  private insertTextAtCursor(insertedText: string): void {
    if (!this.shadowRoot) return;
    const textarea = this.shadowRoot.getElementById('composer-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const current = textarea.value;

    const before = current.substring(0, start);
    const after = current.substring(end);

    textarea.value = before + insertedText + after;
    this._composerText = textarea.value;

    const newPos = start + insertedText.length;
    this._isEmojiPickerOpen = false;
    this.render();

    // Restaura o foco e a posição do cursor após re-render
    const reloadedTextarea = this.shadowRoot.getElementById('composer-textarea') as HTMLTextAreaElement | null;
    if (reloadedTextarea) {
      reloadedTextarea.focus();
      reloadedTextarea.setSelectionRange(newPos, newPos);
    }
  }

  /**
   * Renderiza a Lista Completa com Threads e Respostas Aninhadas
   */
  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private getFilteredComments(): ScatterComment[] {
    const rawQuery = this._searchQuery.trim().toLowerCase();
    let list: ScatterComment[] = [];

    if (!rawQuery) {
      list = [...this._comments];
    } else {
      const cleanQuery = rawQuery.startsWith('@') ? rawQuery.slice(1) : rawQuery;
      const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);

      interface ScoredComment {
        comment: ScatterComment;
        score: number;
      }

      const scored: ScoredComment[] = [];

      for (const c of this._comments) {
        let score = 0;
        const authorLogin = c.author.login.toLowerCase();
        const bodyLower = c.body.toLowerCase();

        // 1. Priorização Máxima: Match exato de autor (@autor ou autor)
        if (authorLogin === cleanQuery) {
          score += 100;
        } else if (authorLogin.startsWith(cleanQuery)) {
          score += 60;
        } else if (authorLogin.includes(cleanQuery)) {
          score += 40;
        }

        // 2. Priorização no texto do comentário
        if (bodyLower.includes(rawQuery) || bodyLower.includes(cleanQuery)) {
          score += 35;
        } else {
          for (const token of queryTokens) {
            if (bodyLower.includes(token)) score += 10;
          }
        }

        // 3. Match em respostas aninhadas (replies)
        if (c.replies && c.replies.length > 0) {
          for (const r of c.replies) {
            const rAuthor = r.author.login.toLowerCase();
            const rBody = r.body.toLowerCase();

            if (rAuthor === cleanQuery) {
              score += 50;
            } else if (rAuthor.includes(cleanQuery)) {
              score += 25;
            }

            if (rBody.includes(rawQuery) || rBody.includes(cleanQuery)) {
              score += 20;
            } else {
              for (const token of queryTokens) {
                if (rBody.includes(token)) score += 5;
              }
            }
          }
        }

        if (score > 0) {
          scored.push({ comment: c, score });
        }
      }

      // Ordenação estrita: maior pontuação de relevância primeiro
      scored.sort((a, b) => b.score - a.score);
      list = scored.map((s) => s.comment);
    }

    // Aplicação da Ordenação quando não houver busca ativa por relevância
    if (!rawQuery) {
      list = this.sortComments(list, this._order);
    }

    return list;
  }

  /**
   * Ordena comentários por data de criação (cronológico ou cronológico inverso),
   * priorizando comentários fixados pelo autor (pinned) no topo da discussão.
   */
  private sortComments(comments: ScatterComment[], order: 'oldest' | 'newest'): ScatterComment[] {
    const pinned: ScatterComment[] = [];
    const regular: ScatterComment[] = [];

    for (const c of comments) {
      const isPinned = !!(
        c.isPinned ||
        c.body.includes('<!-- sl:pinned -->') ||
        c.body.includes('<!-- pinned -->')
      );
      if (isPinned) {
        pinned.push(c);
      } else {
        regular.push(c);
      }
    }

    const canParseAll = regular.every((c) => c.createdAt && !isNaN(Date.parse(c.createdAt)));

    if (order === 'newest') {
      if (canParseAll) {
        regular.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      } else {
        regular.reverse();
      }
    } else {
      // 'oldest'
      if (canParseAll) {
        regular.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
      }
    }

    return [...pinned, ...regular];
  }

  /**
   * Renderiza a Barra de Moderação do Proprietário do Repositório (quando enable-moderation ativo)
   */
  private renderModerationBar(): string {
    if (!this._enableModeration || !this._isOwner()) {
      return '';
    }

    const isPt = this.currentLang === 'pt';
    const isEs = this.currentLang === 'es';
    const title = isPt
      ? 'Painel de Moderação KV (Proprietário)'
      : isEs
      ? 'Panel de Moderación KV (Propietario)'
      : 'KV Moderation Bar (Repo Owner)';
    const refreshTitle = isPt ? 'Atualizar lista de moderação' : 'Refresh moderation list';
    const collapseTitle = isPt ? 'Recolher painel de moderação' : 'Collapse moderation panel';
    const expandTitle = isPt ? 'Expandir painel de moderação' : 'Expand moderation panel';

    const bannedUsers = this._moderatedUsers.filter((u) => u.action === 'ban');
    const mediaUsers = this._moderatedUsers.filter((u) => u.action === 'restrict_media');

    const isExpandedBan = this._expandedModCategory === 'ban';
    const isExpandedMedia = this._expandedModCategory === 'media';

    const banPillClass = `sl-mod-pill ${
      bannedUsers.length > 0 ? 'sl-mod-pill-ban-active' : 'sl-mod-pill-neutral'
    } ${isExpandedBan ? 'sl-mod-pill-open' : ''}`;

    const mediaPillClass = `sl-mod-pill ${
      mediaUsers.length > 0 ? 'sl-mod-pill-media-active' : 'sl-mod-pill-neutral'
    } ${isExpandedMedia ? 'sl-mod-pill-open' : ''}`;

    const banLabel = isPt ? 'Banidos' : isEs ? 'Bloqueados' : 'Banned';
    const mediaLabel = isPt ? 'Sem Mídia' : isEs ? 'Sin Medios' : 'No Media';

    let drawerHtml = '';
    if (this._expandedModCategory !== null) {
      const activeList = this._expandedModCategory === 'ban' ? bannedUsers : mediaUsers;
      const isBanActive = this._expandedModCategory === 'ban';
      const emptyCategoryText = isBanActive
        ? isPt
          ? 'Nenhum usuário banido. Para restringir alguém, use o menu ••• no comentário dele.'
          : isEs
          ? 'Ningún usuario bloqueado. Para restringir a alguien, usa el menú ••• en su comentario.'
          : 'No banned users. To restrict someone, use the ••• menu on their comment.'
        : isPt
        ? 'Nenhum usuário com mídia restrita. Para restringir mídia, use o menu ••• no comentário dele.'
        : isEs
        ? 'Ningún usuario sin medios. Para restringir medios, usa el menú ••• en su comentario.'
        : 'No media-restricted users. To restrict media, use the ••• menu on their comment.';

      if (activeList.length === 0) {
        drawerHtml = `
          <div class="sl-mod-drawer">
            <span class="sl-mod-empty-text">${emptyCategoryText}</span>
          </div>
        `;
      } else {
        const chips = activeList
          .map((item) => {
            const badgeClass = isBanActive ? 'sl-mod-chip-ban' : 'sl-mod-chip-media';
            const label = isBanActive ? banLabel : mediaLabel;
            const removeTitle = isPt
              ? `Remover moderação de @${item.username}`
              : `Remove moderation for @${item.username}`;
            return `
              <div class="sl-mod-chip ${badgeClass}">
                <span class="sl-mod-chip-user" title="@${this.escapeHtml(item.username)}">@${this.escapeHtml(item.username)}</span>
                <span class="sl-mod-chip-action">${label}</span>
                <button type="button" class="sl-mod-chip-remove" data-user="${this.escapeHtml(
                  item.username
                )}" title="${removeTitle}" aria-label="${removeTitle}">✕</button>
              </div>
            `;
          })
          .join('');
        drawerHtml = `
          <div class="sl-mod-drawer">
            ${chips}
          </div>
        `;
      }
    }

    const subcardHtml = this._isModerationCollapsed
      ? ''
      : `
        <div class="sl-mod-subcard">
          <div class="sl-mod-pills" role="tablist">
            <button type="button" class="${banPillClass}" id="sl-mod-pill-ban" aria-expanded="${isExpandedBan}">
              <span>🚫 ${banLabel} (${bannedUsers.length})</span>
              <span class="sl-mod-pill-arrow">${isExpandedBan ? '▲' : '▼'}</span>
            </button>
            <button type="button" class="${mediaPillClass}" id="sl-mod-pill-media" aria-expanded="${isExpandedMedia}">
              <span>🔇 ${mediaLabel} (${mediaUsers.length})</span>
              <span class="sl-mod-pill-arrow">${isExpandedMedia ? '▲' : '▼'}</span>
            </button>
          </div>
          ${drawerHtml}
        </div>
      `;

    return `
      <div class="sl-moderation-bar ${this._isModerationCollapsed ? 'sl-mod-bar-collapsed' : ''}" role="region" aria-label="${title}">
        <div class="sl-mod-bar-header">
          <div class="sl-mod-bar-title">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path d="M7.47 10.78a.75.75 0 001.06 0l3.75-3.75a.75.75 0 00-1.06-1.06L8.5 8.69V3a.75.75 0 00-1.5 0v5.69L4.28 5.97a.75.75 0 00-1.06 1.06l3.75 3.75zM8 0a8 8 0 100 16A8 8 0 008 0z" />
            </svg>
            <span>🛡️ ${title}</span>
          </div>
          <div class="sl-mod-bar-actions">
            <button type="button" class="sl-mod-refresh-btn" id="sl-mod-refresh" title="${refreshTitle}" ${
      this._isModerationLoading ? 'disabled' : ''
    }>
              ${this._isModerationLoading ? '⌛' : '🔄'}
            </button>
            <button type="button" class="sl-mod-toggle-btn" id="sl-mod-toggle-collapse" aria-expanded="${!this._isModerationCollapsed}" title="${this._isModerationCollapsed ? expandTitle : collapseTitle}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sl-mod-chevron ${this._isModerationCollapsed ? '' : 'sl-mod-chevron-open'}">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
        </div>
        ${subcardHtml}
      </div>
    `;
  }

  /**
   * Renderiza a Barra de Ferramentas / Buscador e Ordenação acima da Lista de Comentários
   */
  private renderCommentsToolbar(): string {
    // Se não há comentários no total e nenhuma busca está ativa, oculta a barra
    if (this._comments.length === 0 && !this._searchQuery) {
      return '';
    }

    // Se a busca e a ordenação estiverem desabilitadas e não houver busca ativa, oculta a barra
    if (this._hideSearch && this._hideSorting && !this._searchQuery) {
      return '';
    }

    const isPt = this.currentLang === 'pt';
    const totalCount = this._comments.length;
    const filteredCount = this.getFilteredComments().length;
    const isSearching = this._searchQuery.trim().length > 0;

    let countText = '';
    if (isSearching) {
      countText = isPt
        ? `${filteredCount} de ${totalCount} encontrados`
        : `${filteredCount} of ${totalCount} found`;
    } else {
      const commentWord = isPt
        ? (totalCount === 1 ? 'comentário' : 'comentários')
        : (totalCount === 1 ? 'comment' : 'comments');
      countText = `${totalCount} ${commentWord}`;
    }

    const sortLabel = this._order === 'newest'
      ? (isPt ? 'Mais recentes' : 'Newest first')
      : (isPt ? 'Mais antigos' : 'Oldest first');

    const sortTooltip = this._order === 'newest'
      ? (isPt ? 'Ordenado por mais recentes. Clique para mais antigos.' : 'Sorted by newest. Click for oldest.')
      : (isPt ? 'Ordenado por mais antigos. Clique para mais recentes.' : 'Sorted by oldest. Click for newest.');

    const searchWrapperHtml = !this._hideSearch
      ? `
        <div class="sl-search-wrapper" part="search-wrapper">
          <svg class="sl-search-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          <input
            type="text"
            id="sl-search-input"
            class="sl-search-input"
            part="search-input"
            placeholder="${isPt ? 'Buscar comentários ou @autor...' : 'Search comments or @user...'}"
            value="${this.escapeHtml(this._searchQuery)}"
            autocomplete="off"
            spellcheck="false"
            aria-label="${isPt ? 'Buscar comentários ou autor' : 'Search comments or author'}"
          />
          ${
            this._searchQuery
              ? `<button type="button" class="sl-search-clear-btn" id="sl-search-clear" part="search-clear-btn" title="${isPt ? 'Limpar busca (Esc)' : 'Clear search (Esc)'}">✕</button>`
              : `<kbd class="sl-search-kbd" title="${isPt ? 'Pressione / para buscar' : 'Press / to search'}">/</kbd>`
          }
        </div>
      `
      : '';

    const sortBtnHtml = !this._hideSorting
      ? `
        <button type="button" class="sl-sort-btn" id="btn-sort-toggle" part="sort-btn" title="${sortTooltip}" aria-label="${sortTooltip}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m3 16 4 4 4-4"/>
            <path d="M7 20V4"/>
            <path d="m21 8-4-4-4 4"/>
            <path d="M17 4v16"/>
          </svg>
          <span>${sortLabel}</span>
        </button>
      `
      : '';

    return `
      <div class="sl-toolbar" part="toolbar">
        ${searchWrapperHtml}
        <div class="sl-toolbar-actions" part="toolbar-actions">
          <div class="sl-toolbar-count" part="toolbar-count">
            <span>${countText}</span>
          </div>
          ${sortBtnHtml}
        </div>
      </div>
    `;
  }

  /**
   * Renderiza a Lista Completa com Threads, Filtros de Busca e Paginação
   */
  private renderCommentsList(): string {
    const isSearching = this._searchQuery.trim().length > 0;
    const filteredComments = this.getFilteredComments();

    if (filteredComments.length === 0) {
      const isPt = this.currentLang === 'pt';
      const emptyText = isSearching
        ? (isPt
            ? `Nenhum comentário encontrado para "${this._searchQuery}".`
            : `No comments found for "${this._searchQuery}".`)
        : (isPt
            ? 'Nenhum comentário por aqui ainda. Seja o primeiro a semear uma reflexão!'
            : 'No comments here yet. Be the first to scatter an idea!');
      return `
        ${
          isSearching
            ? `
          <div class="sl-search-banner" part="search-banner">
            <span>🔍 ${isPt ? '0 comentários encontrados' : '0 comments found'}</span>
            <button type="button" class="sl-search-banner-clear" part="search-banner-clear">${isPt ? 'Limpar busca' : 'Clear search'}</button>
          </div>
        `
            : ''
        }
        <div class="sl-empty" part="empty">
          <span class="sl-empty-icon">${isSearching ? '🔍' : '🍃'}</span>
          <p>${emptyText}</p>
        </div>
      `;
    }

    const totalComments = filteredComments.length;
    const totalPages = Math.max(1, Math.ceil(totalComments / this._pageSize));
    if (this._currentPage > totalPages) {
      this._currentPage = totalPages;
    }

    const startIndex = (this._currentPage - 1) * this._pageSize;
    const endIndex = startIndex + this._pageSize;
    const visibleComments = filteredComments.slice(startIndex, endIndex);

    let searchBannerHtml = '';
    if (isSearching) {
      const isPt = this.currentLang === 'pt';
      searchBannerHtml = `
        <div class="sl-search-banner" part="search-banner">
          <span>🔍 ${isPt ? `${totalComments} comentário(s) para` : `${totalComments} comment(s) for`} "<strong>${this.escapeHtml(this._searchQuery)}</strong>"</span>
          <button type="button" class="sl-search-banner-clear" part="search-banner-clear">${isPt ? 'Limpar busca' : 'Clear search'}</button>
        </div>
      `;
    }

    let paginationHtml = '';
    if (totalComments > this._pageSize) {
      const isPt = this.currentLang === 'pt';
      const prevText = isPt ? '‹ Anterior' : '‹ Previous';
      const nextText = isPt ? 'Próxima ›' : 'Next ›';
      const infoText = isPt
        ? `Página ${this._currentPage} de ${totalPages} • ${totalComments} comentários`
        : `Page ${this._currentPage} of ${totalPages} • ${totalComments} comments`;

      let pageButtonsHtml = '';
      for (let p = 1; p <= totalPages; p++) {
        const isActive = p === this._currentPage;
        pageButtonsHtml += `
          <button class="sl-page-btn ${isActive ? 'sl-page-active' : ''}" data-page="${p}" part="page-btn" ${isActive ? 'aria-current="page"' : ''}>
            ${p}
          </button>
        `;
      }

      paginationHtml = `
        <nav class="sl-pagination" part="pagination" aria-label="${isPt ? 'Paginação de comentários' : 'Comments pagination'}">
          <div class="sl-pagination-controls">
            <button class="sl-page-btn sl-page-nav-btn btn-prev-page" part="page-btn-prev" ${this._currentPage <= 1 ? 'disabled' : ''}>
              ${prevText}
            </button>
            ${pageButtonsHtml}
            <button class="sl-page-btn sl-page-nav-btn btn-next-page" part="page-btn-next" ${this._currentPage >= totalPages ? 'disabled' : ''}>
              ${nextText}
            </button>
          </div>
          <span class="sl-pagination-info" part="pagination-info">${infoText}</span>
        </nav>
      `;
    }

    return `
      <div class="sl-list" part="list">
        ${searchBannerHtml}
        ${visibleComments.map((comment) => this.renderCommentCard(comment)).join('')}
        ${paginationHtml}
      </div>
    `;
  }

  /**
   * Renderiza um Card de Comentário Individual
   */
  private renderCommentCard(comment: ScatterComment, isReply: boolean = false, parentCommentId?: string): string {
    const repoOwner = this._repo ? this._repo.split('/')[0].toLowerCase() : '';
    const isCommentAuthor =
      comment.author.isAuthor ||
      (repoOwner && comment.author.login.toLowerCase() === repoOwner);
    const authorBadge = isCommentAuthor
      ? `<span class="sl-author-badge" part="author-badge">${this.currentLang === 'pt' ? 'Autor' : 'Author'}</span>`
      : '';

    const isPinned = !isReply && !!(
      comment.isPinned ||
      comment.body.includes('<!-- sl:pinned -->') ||
      comment.body.includes('<!-- pinned -->')
    );
    const pinnedBadge = isPinned
      ? `<span class="sl-pinned-badge" part="pinned-badge" title="${this.currentLang === 'pt' ? 'Comentário fixado no topo pelo autor' : 'Comment pinned to top by author'}"><span>📌</span><span>${this.currentLang === 'pt' ? 'Fixado pelo autor' : 'Pinned by author'}</span></span>`
      : '';

    const isViewerRepoAuthor = !!(
      this._currentUser &&
      repoOwner &&
      (this._currentUser.login.toLowerCase() === repoOwner)
    );

    const isSpeaking = this._speakingId === comment.id;
    const isReplying = this._replyingToId === comment.id;
    const isEditing = this._editingId === comment.id;
    const isMenuOpen = this._openMenuId === comment.id;

    const audioButtonText = isSpeaking
      ? (this.currentLang === 'pt' ? '⏸️ Pausar' : '⏸️ Pause')
      : (this.currentLang === 'pt' ? '🔊 Ouvir' : '🔊 Listen');

    const replyButtonText = this.currentLang === 'pt' ? 'Responder' : 'Reply';

    // Inteligência de Idioma e Tradução Dinâmica
    const visitorLang = this.getVisitorLang();
    const commentLang = comment.originalLang || 'pt';
    const isDifferentLang = commentLang !== visitorLang;
    const langName = this.getLanguageName(commentLang, visitorLang);

    const rawDisplayedBody =
      comment.isShowingTranslation && comment.translatedBody
        ? comment.translatedBody
        : comment.body;
    const displayedBody = rawDisplayedBody
      .replace(/<!--\s*sl:pinned\s*-->\r?\n?/g, '')
      .replace(/<!--\s*pinned\s*-->\r?\n?/g, '');

    const dateInfo = this.formatDate(comment.createdAt);

    // Reação de like principal (👍) pelo visualizador
    const viewerHasLiked = !!comment.reactions?.find((r) => r.content === '👍' && r.viewerHasReacted);
    const likeButtonText = this.currentLang === 'pt' ? 'Gostei' : 'Like';
    const likeButtonTitle = viewerHasLiked
      ? (this.currentLang === 'pt' ? 'Remover curtida' : 'Remove like')
      : (this.currentLang === 'pt' ? 'Curtir' : 'Like');

    // Resumo de contadores de reações recebidas
    const existingReactions = (comment.reactions || []).filter((r) => r.count > 0);

    return `
      <article class="sl-card ${isReply ? 'sl-card-reply' : ''} ${isPinned ? 'sl-card-pinned' : ''}" id="comment-${comment.id}" part="card">
        <!-- Cabeçalho do Card (Avatar ancorado no topo!) -->
        <div class="sl-card-header">
          <div class="sl-author-info">
            <a href="${comment.author.url}" target="_blank" rel="noopener noreferrer">
              <img class="sl-avatar" src="${comment.author.avatarUrl}" alt="${comment.author.login}" part="avatar" />
            </a>
            <div class="sl-author-top-row">
              <a class="sl-author-name" href="${comment.author.url}" target="_blank" rel="noopener noreferrer" part="author-name">
                ${comment.author.login}
              </a>
              ${authorBadge}
              ${pinnedBadge}
              <time class="sl-date" part="date" datetime="${comment.createdAt}" title="${dateInfo.full}">${dateInfo.relative}</time>
              ${comment.isEdited ? `<span class="sl-edited-badge">(${this.currentLang === 'pt' ? 'editado' : 'edited'})</span>` : ''}
            </div>
          </div>

          <!-- Menu de Contexto In-Place (•••) -->
          <div class="sl-menu-wrapper">
            <button class="sl-menu-btn" data-menu-id="${comment.id}" aria-label="${this.currentLang === 'pt' ? 'Opções do comentário' : 'Comment options'}">
              •••
            </button>
            ${
              isMenuOpen
                ? `
              <div class="sl-dropdown-menu" part="dropdown-menu">
                ${
                  isViewerRepoAuthor && !isReply
                    ? `
                  <button class="sl-dropdown-item btn-toggle-pin" data-comment-id="${comment.id}">
                    <span>📌</span>
                    <span>${isPinned ? (this.currentLang === 'pt' ? 'Desafixar do topo' : 'Unpin from top') : (this.currentLang === 'pt' ? 'Fixar no topo' : 'Pin to top')}</span>
                  </button>
                `
                    : ''
                }
                <button class="sl-dropdown-item btn-edit" data-comment-id="${comment.id}">
                  <span>✏️</span>
                  <span>${this.currentLang === 'pt' ? 'Editar' : 'Edit'}</span>
                </button>
                <button class="sl-dropdown-item btn-copy-link" data-comment-id="${comment.id}">
                  <span>🔗</span>
                  <span>${this.currentLang === 'pt' ? 'Copiar link' : 'Copy link'}</span>
                </button>
                <button class="sl-dropdown-item sl-dropdown-danger btn-delete" data-comment-id="${comment.id}">
                  <span>🗑️</span>
                  <span>${this.currentLang === 'pt' ? 'Excluir' : 'Delete'}</span>
                </button>
                ${
                  this._enableModeration &&
                  isViewerRepoAuthor &&
                  comment.author?.login &&
                  this._currentUser?.login &&
                  comment.author.login.toLowerCase() !== this._currentUser.login.toLowerCase()
                    ? `
                  <button class="sl-dropdown-item btn-mod-restrict-media" data-user="${this.escapeHtml(comment.author.login)}">
                    <span>🚫</span>
                    <span>${this.currentLang === 'pt' ? 'Restringir Mídia' : 'Restrict Media'}</span>
                  </button>
                  <button class="sl-dropdown-item sl-danger btn-mod-ban" data-user="${this.escapeHtml(comment.author.login)}">
                    <span>🛑</span>
                    <span>${this.currentLang === 'pt' ? 'Banir Usuário' : 'Ban User'}</span>
                  </button>
                `
                    : ''
                }
              </div>
            `
                : ''
            }
          </div>
        </div>

        <!-- Corpo do Comentário ou Editor In-Place -->
        ${
          isEditing
            ? `
          <div class="sl-edit-mode">
            <textarea class="sl-textarea" id="edit-textarea-${comment.id}">${comment.body.replace(/<!--\s*sl:pinned\s*-->\r?\n?/g, '').replace(/<!--\s*pinned\s*-->\r?\n?/g, '')}</textarea>
            <div class="sl-edit-actions">
              <button class="sl-btn sl-btn-secondary btn-cancel-edit" data-comment-id="${comment.id}">
                ${this._lang === 'pt' ? 'Cancelar' : 'Cancel'}
              </button>
              <button class="sl-btn sl-btn-primary btn-save-edit" data-comment-id="${comment.id}">
                ${this._lang === 'pt' ? 'Salvar' : 'Save'}
              </button>
            </div>
          </div>
        `
            : `
          <div class="sl-card-body" part="card-body">
            ${
              comment.isShowingTranslation
                ? this.parseMarkdown(displayedBody)
                : (comment.bodyHtml || this.parseMarkdown(displayedBody))
            }
          </div>
        `
        }

        <!-- Rodapé do Card: Reações estilo LinkedIn, Responder e Ações da Direita -->
        <div class="sl-card-footer">
          <div class="sl-actions-left">
            ${
              !this._hideReactions
                ? `
            <!-- Gatilho de Reação Universal (Gostei / Like) -->
            <div class="sl-reaction-container" data-comment-id="${comment.id}">
              <button type="button" class="sl-reaction-trigger-btn" data-comment-id="${comment.id}" data-emoji="👍" part="reaction-trigger-btn" title="${likeButtonTitle}">
                <span>👍</span>
                <span>${likeButtonText}</span>
              </button>

              <!-- Popover Flutuante com 6 Emojis Animados -->
              <div class="sl-reaction-popover" role="toolbar" aria-label="Reações">
                ${LINKEDIN_REACTIONS.map((lr) => {
                  const tooltip = this.currentLang === 'pt' ? lr.namePt : lr.nameEn;
                  const hasReactedWithThis = !!comment.reactions?.find((r) => r.content === lr.symbol && r.viewerHasReacted);
                  return `
                    <button type="button" class="sl-reaction-picker-item ${hasReactedWithThis ? 'sl-reacted' : ''}" data-comment-id="${comment.id}" data-emoji="${lr.symbol}" data-tooltip="${tooltip}" title="${tooltip}" aria-label="${tooltip}">
                      ${lr.symbol}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Resumo / Badges de Reações Recebidas -->
            ${
              existingReactions.length > 0
                ? `
              <div class="sl-reactions-summary">
                ${existingReactions
                  .map(
                    (r) => `
                  <button type="button" class="sl-reaction-badge ${r.viewerHasReacted ? 'sl-reacted' : ''}" data-comment-id="${comment.id}" data-emoji="${r.content}" title="${r.viewerHasReacted ? (this.currentLang === 'pt' ? 'Remover sua reação' : 'Remove your reaction') : (this.currentLang === 'pt' ? 'Reagir com ' + r.content : 'React with ' + r.content)}">
                    <span>${r.content}</span>
                    <span>${r.count}</span>
                  </button>
                `
                  )
                  .join('')}
              </div>
            `
                : ''
            }
            `
                : ''
            }

            <button class="sl-reply-btn" data-reply-to="${comment.id}" data-parent-id="${parentCommentId || comment.id}" part="reply-btn">
              <span>↩️</span>
              <span>${replyButtonText}</span>
            </button>
          </div>

          <div class="sl-actions-right">
            ${
              isDifferentLang
                ? `
              <button class="sl-translate-btn btn-toggle-translate ${comment.isShowingTranslation ? 'sl-translated' : ''}" data-comment-id="${comment.id}" part="translate-btn" title="${comment.isShowingTranslation ? (this.currentLang === 'pt' ? 'Ver original' : 'See original') : (this.currentLang === 'pt' ? 'Traduzir comentário' : 'Translate comment')}">
                <span>${this._isTranslatingId === comment.id ? '⏳' : comment.isShowingTranslation ? '✨' : '🌐'}</span>
                <span>${
                  this._isTranslatingId === comment.id
                    ? (this.currentLang === 'pt' ? 'Traduzindo...' : 'Translating...')
                    : comment.isShowingTranslation
                    ? (this.currentLang === 'pt' ? `Traduzido do ${langName} • Ver original` : `Translated from ${langName} • See original`)
                    : (this.currentLang === 'pt' ? `Publicado em ${langName} • Traduzir` : `Published in ${langName} • Translate`)
                }</span>
              </button>
            `
                : ''
            }

            <button class="sl-audio-btn ${isSpeaking ? 'sl-audio-playing' : ''}" data-speak-id="${comment.id}" data-text="${encodeURIComponent(displayedBody)}" data-lang="${comment.isShowingTranslation ? visitorLang : commentLang}" part="audio-btn">
              <span>${audioButtonText}</span>
            </button>
          </div>
        </div>

        <!-- Formulário de Resposta Aninhada Inline -->
        ${
          isReplying
            ? `
          <div class="sl-inline-composer">
            <textarea id="reply-textarea-${comment.id}" placeholder="${this.currentLang === 'pt' ? `Respondendo para @${comment.author.login}...` : `Replying to @${comment.author.login}...`}">${this._replyText}</textarea>
            <div class="sl-inline-footer">
              <button class="sl-btn sl-btn-secondary btn-cancel-reply" data-comment-id="${comment.id}">
                ${this.currentLang === 'pt' ? 'Cancelar' : 'Cancel'}
              </button>
              <button class="sl-btn sl-btn-primary btn-send-reply" data-comment-id="${comment.id}" data-parent-id="${parentCommentId || comment.id}">
                ${this.currentLang === 'pt' ? 'Responder' : 'Reply'}
              </button>
            </div>
          </div>
        `
            : ''
        }

        <!-- Respostas Aninhadas (Threads Estilo LinkedIn com Linha Guia) -->
        ${
          !isReply && comment.replies && comment.replies.length > 0
            ? (() => {
                const totalReplies = comment.replies.length;
                const isExpanded = this._expandedThreads.has(comment.id);
                const visibleReplies =
                  isExpanded || totalReplies <= 2
                    ? comment.replies
                    : comment.replies.slice(0, 2);
                const hiddenCount = totalReplies - 2;

                return `
                  <div class="sl-thread">
                    ${visibleReplies.map((reply) => this.renderCommentCard(reply, true, comment.id)).join('')}
                    ${
                      totalReplies > 2
                        ? `
                      <button class="sl-thread-toggle-btn" data-thread-id="${comment.id}" part="thread-toggle-btn">
                        <span>${isExpanded ? '▴' : '💬'}</span>
                        <span>${
                          isExpanded
                            ? (this.currentLang === 'pt' ? 'Recolher respostas' : 'Collapse replies')
                            : (this.currentLang === 'pt' ? `Ver mais ${hiddenCount} resposta${hiddenCount > 1 ? 's' : ''} ▾` : `View ${hiddenCount} more repl${hiddenCount > 1 ? 'ies' : 'y'} ▾`)
                        }</span>
                      </button>
                    `
                        : ''
                    }
                  </div>
                `;
              })()
            : ''
        }
      </article>
    `;
  }

  /**
   * Vinculação de Eventos Interativos do Shadow DOM
   */
  private attachEvents(): void {
    if (!this.shadowRoot) return;

    // 1. Abas Escreva / Prévia
    const tabWrite = this.shadowRoot.getElementById('tab-write');
    const tabPreview = this.shadowRoot.getElementById('tab-preview');
    const composerTextarea = this.shadowRoot.getElementById('composer-textarea') as HTMLTextAreaElement;

    if (composerTextarea) {
      const saveSelection = () => {
        this._savedComposerSelection = {
          start: composerTextarea.selectionStart ?? 0,
          end: composerTextarea.selectionEnd ?? 0,
        };
      };
      composerTextarea.addEventListener('input', () => {
        this._composerText = composerTextarea.value;
        saveSelection();
        composerTextarea.style.height = 'auto';
        composerTextarea.style.height = `${composerTextarea.scrollHeight}px`;
      });
      composerTextarea.addEventListener('click', saveSelection);
      composerTextarea.addEventListener('keyup', saveSelection);
      composerTextarea.addEventListener('select', saveSelection);
    }

    if (tabWrite) {
      tabWrite.addEventListener('click', () => {
        this._activeTab = 'write';
        this.render();
      });
    }

    if (tabPreview) {
      tabPreview.addEventListener('click', () => {
        if (composerTextarea) {
          this._composerText = composerTextarea.value;
        }
        this._activeTab = 'preview';
        this.render();
      });
    }

    // Alternador de Ordenação (Mais antigos / Mais recentes)
    const btnSortToggle = this.shadowRoot.getElementById('btn-sort-toggle');
    if (btnSortToggle) {
      btnSortToggle.addEventListener('click', () => {
        this._order = this._order === 'oldest' ? 'newest' : 'oldest';
        this._currentPage = 1;
        this.render();
      });
    }

    // 2. Alternador de Fonte Aa e Bloco de Código </>
    const btnCodeToggle = this.shadowRoot.getElementById('btn-code-toggle');
    if (btnCodeToggle) {
      btnCodeToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const textarea = this.shadowRoot?.getElementById('composer-textarea') as HTMLTextAreaElement | null;
        if (textarea) {
          const start = textarea.selectionStart ?? this._composerText.length;
          const end = textarea.selectionEnd ?? this._composerText.length;
          this._savedComposerSelection = { start, end };
          const hasSelection = end > start && textarea.value.substring(start, end).trim().length > 0;

          if (hasSelection) {
            this.insertCodeBlock('typescript');
            return;
          }
        }
        this._isCodePickerOpen = !this._isCodePickerOpen;
        this.render();
      });
    }

    const langButtons = this.shadowRoot.querySelectorAll<HTMLButtonElement>('.sl-code-lang-btn');
    langButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = btn.getAttribute('data-lang') || 'typescript';
        this.insertCodeBlock(lang);
      });
    });

    const btnFontToggle = this.shadowRoot.getElementById('btn-font-toggle');
    if (btnFontToggle) {
      btnFontToggle.addEventListener('click', () => {
        this._fontMode = this._fontMode === 'default' ? 'monospace' : 'default';
        this.render();
      });
    }

    // 2.1. Controle do Emoji Picker e Inserção
    const btnEmojiToggle = this.shadowRoot.getElementById('btn-emoji-toggle');
    if (btnEmojiToggle) {
      btnEmojiToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this._isEmojiPickerOpen = !this._isEmojiPickerOpen;
        this.render();
      });
    }

    const scrollContainer = this.shadowRoot.getElementById('emoji-scroll-container');
    const btnScrollUp = this.shadowRoot.getElementById('btn-emoji-scroll-up');
    const btnScrollDown = this.shadowRoot.getElementById('btn-emoji-scroll-down');
    const btnCloseEmoji = this.shadowRoot.getElementById('btn-emoji-close');

    if (btnScrollUp && scrollContainer) {
      btnScrollUp.addEventListener('click', (e) => {
        e.stopPropagation();
        scrollContainer.scrollBy({ top: -90, behavior: 'smooth' });
      });
    }

    if (btnScrollDown && scrollContainer) {
      btnScrollDown.addEventListener('click', (e) => {
        e.stopPropagation();
        scrollContainer.scrollBy({ top: 90, behavior: 'smooth' });
      });
    }

    if (btnCloseEmoji) {
      btnCloseEmoji.addEventListener('click', (e) => {
        e.stopPropagation();
        this._isEmojiPickerOpen = false;
        this.render();
      });
    }

    // 2.2. Seletor de Tom de Pele (Skin Tone / Estilo WhatsApp)
    const btnSkinToneToggle = this.shadowRoot.getElementById('btn-skin-tone-toggle');
    if (btnSkinToneToggle) {
      btnSkinToneToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this._isSkinTonePanelOpen = !this._isSkinTonePanelOpen;
        this._activeTonePickerEmoji = null;
        this.render();
      });
    }

    const toneButtons = this.shadowRoot.querySelectorAll('.sl-tone-btn');
    toneButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const toneMod = (btn as HTMLElement).dataset.toneMod || 'default';
        const actualMod = toneMod === 'default' ? 'default' : toneMod;
        this.saveSkinTonePreference(actualMod);

        const targetBase = this._activeTonePickerEmoji;
        this._isSkinTonePanelOpen = false;
        this._activeTonePickerEmoji = null;

        if (targetBase) {
          const finalEmoji = applySkinTone(targetBase, actualMod === 'default' ? '' : actualMod);
          this.insertTextAtCursor(finalEmoji);
        } else {
          this.render();
        }
      });
    });

    const emojiButtons = this.shadowRoot.querySelectorAll('.sl-emoji-item');
    emojiButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isToneable = (btn as HTMLElement).dataset.toneable === 'true';
        const baseEmoji = (btn as HTMLElement).dataset.baseEmoji;
        const emoji = (btn as HTMLElement).dataset.emoji;

        // Se o emoji aceita tom de pele e o usuário AINDA NÃO escolheu um tom padrão:
        if (isToneable && baseEmoji && this._selectedSkinTone === null) {
          this._activeTonePickerEmoji = baseEmoji;
          this._isSkinTonePanelOpen = true;
          this.render();
          return;
        }

        if (emoji) {
          this.insertTextAtCursor(emoji);
        }
      });
    });

    // 2.3. Modal Seguro de Inserção de GIF (Apenas via URL HTTPS + Recentes)
    const btnInsertGif = this.shadowRoot.getElementById('btn-insert-gif');
    if (btnInsertGif) {
      btnInsertGif.addEventListener('click', (e) => {
        e.stopPropagation();
        this._isEmojiPickerOpen = false;
        this._isMediaModalOpen = true;
        this._isManagingRecentGifs = false;
        this._isConfirmingClearGifs = false;
        this._mediaModalUrl = '';
        this._mediaModalAlt = '';
        this._mediaModalError = null;
        this._mediaModalSuccess = null;
        this.render();
      });
    }

    // 2.3.2. Modal Seguro de Inserção de Imagens (Apenas via URL HTTPS)
    const btnInsertImage = this.shadowRoot.getElementById('btn-insert-image');
    if (btnInsertImage) {
      btnInsertImage.addEventListener('click', (e) => {
        e.stopPropagation();
        this._isEmojiPickerOpen = false;
        this._isImageModalOpen = true;
        this._isManagingRecentImages = false;
        this._isConfirmingClearImages = false;
        this._imageModalUrl = '';
        this._imageModalAlt = '';
        this._imageModalError = null;
        this._imageModalSuccess = null;
        this.render();
      });
    }

    if (this._isMediaModalOpen) {
      const modalBackdrop = this.shadowRoot.getElementById('media-modal-backdrop');
      const btnCloseModal = this.shadowRoot.getElementById('btn-close-media-modal');
      const btnCancelModal = this.shadowRoot.getElementById('btn-cancel-media-modal');
      const btnConfirmModal = this.shadowRoot.getElementById('btn-confirm-media-modal');
      const inputUrl = this.shadowRoot.getElementById('media-url-input') as HTMLInputElement | null;
      const inputAlt = this.shadowRoot.getElementById('media-alt-input') as HTMLInputElement | null;
      const previewCard = this.shadowRoot.getElementById('media-url-preview-card');
      const previewImg = this.shadowRoot.getElementById('media-url-preview-img') as HTMLImageElement | null;
      const errorBox = this.shadowRoot.getElementById('media-modal-error-box');
      const errorText = this.shadowRoot.getElementById('media-modal-error-text');

      const isPt = this.currentLang === 'pt';

      const updateGifLivePreview = (url: string) => {
        this._mediaModalUrl = url;
        const trimmed = url.trim();
        if (trimmed.length > 0) {
          const check = isSafeMediaUrl(trimmed);
          if (check.safe) {
            this._mediaModalError = null;
            if (errorBox) errorBox.style.display = 'none';
            if (previewCard) previewCard.style.display = 'flex';
            if (previewImg) {
              previewImg.style.display = 'block';
              previewImg.src = trimmed;
            }
          } else {
            this._mediaModalError = check.reason || (isPt ? 'Link inválido.' : 'Invalid link.');
            if (previewCard) previewCard.style.display = 'none';
            if (errorText) errorText.textContent = this._mediaModalError;
            if (errorBox) errorBox.style.display = 'flex';
          }
        } else {
          this._mediaModalError = null;
          if (previewCard) previewCard.style.display = 'none';
          if (errorBox) errorBox.style.display = 'none';
        }
      };

      const closeModal = () => {
        this._isMediaModalOpen = false;
        this._isManagingRecentGifs = false;
        this._isConfirmingClearGifs = false;
        this._mediaModalUrl = '';
        this._mediaModalAlt = '';
        this._mediaModalError = null;
        this._mediaModalSuccess = null;
        this.render();
      };

      if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
      if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);
      if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
          if (e.target === modalBackdrop) closeModal();
        });
      }

      // Input de URL: valida link digitado em tempo real sem re-renderizar
      if (inputUrl) {
        inputUrl.addEventListener('keydown', (e) => {
          e.stopPropagation();
        });
        inputUrl.addEventListener('input', () => {
          updateGifLivePreview(inputUrl.value);
        });
        inputUrl.addEventListener('paste', () => {
          setTimeout(() => updateGifLivePreview(inputUrl.value), 0);
        });
      }

      if (inputAlt) {
        inputAlt.addEventListener('keydown', (e) => {
          e.stopPropagation();
        });
        inputAlt.addEventListener('input', () => {
          this._mediaModalAlt = inputAlt.value;
        });
      }

      // Botão Adicionar GIF na Coleção (sem postar imediatamente)
      const btnSaveGifCollection = this.shadowRoot.getElementById('btn-save-gif-collection');
      if (btnSaveGifCollection) {
        btnSaveGifCollection.addEventListener('click', (e) => {
          e.stopPropagation();
          const rawUrl = (inputUrl ? inputUrl.value : this._mediaModalUrl).trim();
          const altText = (inputAlt ? inputAlt.value : this._mediaModalAlt).trim() || 'GIF';
          if (!rawUrl) {
            this._mediaModalError = isPt
              ? 'Por favor, insira a URL do GIF antes de salvar.'
              : 'Please enter a GIF URL before saving.';
            if (errorText) errorText.textContent = this._mediaModalError;
            if (errorBox) errorBox.style.display = 'flex';
            return;
          }
          const check = isSafeMediaUrl(rawUrl);
          if (!check.safe) {
            this._mediaModalError = check.reason || (isPt ? 'URL inválida ou não segura.' : 'Invalid or unsafe URL.');
            if (errorText) errorText.textContent = this._mediaModalError;
            if (errorBox) errorBox.style.display = 'flex';
            return;
          }
          storeRecentGif(rawUrl, altText);
          this._mediaModalUrl = '';
          this._mediaModalAlt = '';
          this._mediaModalError = null;
          this._mediaModalSuccess = isPt ? 'GIF salvo na sua coleção!' : 'GIF saved to collection!';
          this.render();
          setTimeout(() => {
            if (this._isMediaModalOpen && this._mediaModalSuccess) {
              this._mediaModalSuccess = null;
              this.render();
            }
          }, 2500);
        });
      }

      // Miniaturas de GIFs Recentes
      const recentButtons = this.shadowRoot.querySelectorAll('.sl-recent-gif-item');
      recentButtons.forEach((btn) => {
        let touchTimer: ReturnType<typeof setTimeout> | null = null;
        let touchMoved = false;

        btn.addEventListener('touchstart', () => {
          touchMoved = false;
          touchTimer = setTimeout(() => {
            if (!touchMoved) {
              this._isManagingRecentGifs = true;
              if ('vibrate' in navigator) {
                try {
                  navigator.vibrate(50);
                } catch {}
              }
              this.render();
            }
          }, 450);
        }, { passive: true });

        btn.addEventListener('touchmove', () => {
          touchMoved = true;
          if (touchTimer) clearTimeout(touchTimer);
        }, { passive: true });

        btn.addEventListener('touchend', () => {
          if (touchTimer) clearTimeout(touchTimer);
        });

        btn.addEventListener('click', () => {
          if (this._isManagingRecentGifs) {
            return;
          }
          const url = btn.getAttribute('data-url') || '';
          const alt = btn.getAttribute('data-alt') || '';
          if (inputUrl) inputUrl.value = url;
          if (inputAlt) inputAlt.value = alt;
          this._mediaModalAlt = alt;
          updateGifLivePreview(url);
        });
      });

      // Botão Gerenciar GIFs Recentes (Modo de Remoção)
      const btnManageRecents = this.shadowRoot.getElementById('btn-manage-recent-gifs');
      if (btnManageRecents) {
        btnManageRecents.addEventListener('click', (e) => {
          e.stopPropagation();
          this._isManagingRecentGifs = !this._isManagingRecentGifs;
          this.render();
        });
      }

      // Botões Individuais de Exclusão de GIF
      const deleteRecentButtons = this.shadowRoot.querySelectorAll('.sl-btn-delete-recent-gif');
      deleteRecentButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const url = btn.getAttribute('data-url') || '';
          if (url) {
            removeStoredRecentGif(url);
            if (getStoredRecentGifs().length === 0) {
              this._isManagingRecentGifs = false;
            }
            this.render();
          }
        });
      });

      // Botão Limpar Histórico de GIFs (Gatilha confirmação inline)
      const btnClearRecents = this.shadowRoot.getElementById('btn-clear-recent-gifs');
      if (btnClearRecents) {
        btnClearRecents.addEventListener('click', (e) => {
          e.stopPropagation();
          this._isConfirmingClearGifs = true;
          this.render();
        });
      }

      // Confirmação Inline: Sim, limpar
      const btnConfirmClearGifsYes = this.shadowRoot.getElementById('btn-confirm-clear-gifs-yes');
      if (btnConfirmClearGifsYes) {
        btnConfirmClearGifsYes.addEventListener('click', (e) => {
          e.stopPropagation();
          clearStoredRecentGifs();
          this._isConfirmingClearGifs = false;
          this._isManagingRecentGifs = false;
          this.render();
        });
      }

      // Confirmação Inline: Cancelar
      const btnConfirmClearGifsNo = this.shadowRoot.getElementById('btn-confirm-clear-gifs-no');
      if (btnConfirmClearGifsNo) {
        btnConfirmClearGifsNo.addEventListener('click', (e) => {
          e.stopPropagation();
          this._isConfirmingClearGifs = false;
          this.render();
        });
      }

      // Botão Confirmar Inserção de GIF (1º Clique Direto + Salva na Coleção)
      if (btnConfirmModal) {
        btnConfirmModal.addEventListener('click', () => {
          const rawUrl = (inputUrl ? inputUrl.value : this._mediaModalUrl).trim();
          const altText = (inputAlt ? inputAlt.value : this._mediaModalAlt).trim() || 'GIF';
          if (!rawUrl) {
            this._mediaModalError = isPt
              ? 'Por favor, insira a URL do GIF.'
              : 'Please enter a GIF URL.';
            if (errorText) errorText.textContent = this._mediaModalError;
            if (errorBox) errorBox.style.display = 'flex';
            if (previewCard) previewCard.style.display = 'none';
            return;
          }

          const check = isSafeMediaUrl(rawUrl);
          if (!check.safe) {
            this._mediaModalError = check.reason || (isPt ? 'URL inválida ou não segura.' : 'Invalid or unsafe URL.');
            if (errorText) errorText.textContent = this._mediaModalError;
            if (errorBox) errorBox.style.display = 'flex';
            if (previewCard) previewCard.style.display = 'none';
            return;
          }

          storeRecentGif(rawUrl, altText);
          const markdown = `![${altText}](${rawUrl})`;
          this._isMediaModalOpen = false;
          this._isManagingRecentGifs = false;
          this._isConfirmingClearGifs = false;
          this._mediaModalUrl = '';
          this._mediaModalAlt = '';
          this._mediaModalError = null;
          this._mediaModalSuccess = null;
          this.insertTextAtCursor(markdown);
        });
      }
    }

    if (this._isImageModalOpen) {
      const modalBackdrop = this.shadowRoot.getElementById('image-modal-backdrop');
      const btnCloseModal = this.shadowRoot.getElementById('btn-close-image-modal');
      const btnCancelModal = this.shadowRoot.getElementById('btn-cancel-image-modal');
      const btnConfirmModal = this.shadowRoot.getElementById('btn-confirm-image-modal');
      const inputUrl = this.shadowRoot.getElementById('image-url-input') as HTMLInputElement | null;
      const inputAlt = this.shadowRoot.getElementById('image-alt-input') as HTMLInputElement | null;
      const previewCard = this.shadowRoot.getElementById('image-url-preview-card');
      const previewImg = this.shadowRoot.getElementById('image-url-preview-img') as HTMLImageElement | null;
      const errorBox = this.shadowRoot.getElementById('image-modal-error-box');
      const errorText = this.shadowRoot.getElementById('image-modal-error-text');

      const isPt = this.currentLang === 'pt';

      const updateImageLivePreview = (url: string) => {
        this._imageModalUrl = url;
        const trimmed = url.trim();
        if (trimmed.length > 0) {
          const check = isSafeMediaUrl(trimmed);
          if (check.safe) {
            this._imageModalError = null;
            if (errorBox) errorBox.style.display = 'none';
            if (previewCard) previewCard.style.display = 'flex';
            if (previewImg) {
              previewImg.style.display = 'block';
              previewImg.src = trimmed;
            }
          } else {
            this._imageModalError = check.reason || (isPt ? 'Link inválido.' : 'Invalid link.');
            if (previewCard) previewCard.style.display = 'none';
            if (errorText) errorText.textContent = this._imageModalError;
            if (errorBox) errorBox.style.display = 'flex';
          }
        } else {
          this._imageModalError = null;
          if (previewCard) previewCard.style.display = 'none';
          if (errorBox) errorBox.style.display = 'none';
        }
      };

      const closeImageModal = () => {
        this._isImageModalOpen = false;
        this._isManagingRecentImages = false;
        this._isConfirmingClearImages = false;
        this._imageModalUrl = '';
        this._imageModalAlt = '';
        this._imageModalError = null;
        this._imageModalSuccess = null;
        this.render();
      };

      if (btnCloseModal) btnCloseModal.addEventListener('click', closeImageModal);
      if (btnCancelModal) btnCancelModal.addEventListener('click', closeImageModal);
      if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
          if (e.target === modalBackdrop) closeImageModal();
        });
      }

      if (inputUrl) {
        inputUrl.addEventListener('keydown', (e) => {
          e.stopPropagation();
        });
        inputUrl.addEventListener('input', () => {
          updateImageLivePreview(inputUrl.value);
        });
        inputUrl.addEventListener('paste', () => {
          setTimeout(() => updateImageLivePreview(inputUrl.value), 0);
        });
      }

      if (inputAlt) {
        inputAlt.addEventListener('keydown', (e) => {
          e.stopPropagation();
        });
        inputAlt.addEventListener('input', () => {
          this._imageModalAlt = inputAlt.value;
        });
      }

      // Botão Adicionar Imagem na Coleção (sem postar imediatamente)
      const btnSaveImageCollection = this.shadowRoot.getElementById('btn-save-image-collection');
      if (btnSaveImageCollection) {
        btnSaveImageCollection.addEventListener('click', (e) => {
          e.stopPropagation();
          const rawUrl = (inputUrl ? inputUrl.value : this._imageModalUrl).trim();
          const altText = (inputAlt ? inputAlt.value : this._imageModalAlt).trim() || (isPt ? 'Imagem' : 'Image');
          if (!rawUrl) {
            this._imageModalError = isPt
              ? 'Por favor, insira a URL da imagem antes de salvar.'
              : 'Please enter an image URL before saving.';
            if (errorText) errorText.textContent = this._imageModalError;
            if (errorBox) errorBox.style.display = 'flex';
            return;
          }
          const check = isSafeMediaUrl(rawUrl);
          if (!check.safe) {
            this._imageModalError = check.reason || (isPt ? 'URL inválida ou não segura.' : 'Invalid or unsafe URL.');
            if (errorText) errorText.textContent = this._imageModalError;
            if (errorBox) errorBox.style.display = 'flex';
            return;
          }
          storeRecentImage(rawUrl, altText);
          this._imageModalUrl = '';
          this._imageModalAlt = '';
          this._imageModalError = null;
          this._imageModalSuccess = isPt ? 'Imagem salva na sua coleção!' : 'Image saved to collection!';
          this.render();
          setTimeout(() => {
            if (this._isImageModalOpen && this._imageModalSuccess) {
              this._imageModalSuccess = null;
              this.render();
            }
          }, 2500);
        });
      }

      // Miniaturas de Imagens Recentes
      const recentImageButtons = this.shadowRoot.querySelectorAll('.sl-recent-image-item');
      recentImageButtons.forEach((btn) => {
        let touchTimer: ReturnType<typeof setTimeout> | null = null;
        let touchMoved = false;

        btn.addEventListener('touchstart', () => {
          touchMoved = false;
          touchTimer = setTimeout(() => {
            if (!touchMoved) {
              this._isManagingRecentImages = true;
              if ('vibrate' in navigator) {
                try {
                  navigator.vibrate(50);
                } catch {}
              }
              this.render();
            }
          }, 450);
        }, { passive: true });

        btn.addEventListener('touchmove', () => {
          touchMoved = true;
          if (touchTimer) clearTimeout(touchTimer);
        }, { passive: true });

        btn.addEventListener('touchend', () => {
          if (touchTimer) clearTimeout(touchTimer);
        });

        btn.addEventListener('click', () => {
          if (this._isManagingRecentImages) {
            return;
          }
          const url = btn.getAttribute('data-url') || '';
          const alt = btn.getAttribute('data-alt') || '';
          if (inputUrl) inputUrl.value = url;
          if (inputAlt) inputAlt.value = alt;
          this._imageModalAlt = alt;
          updateImageLivePreview(url);
        });
      });

      // Botão Gerenciar Imagens Recentes (Modo de Remoção)
      const btnManageRecentImages = this.shadowRoot.getElementById('btn-manage-recent-images');
      if (btnManageRecentImages) {
        btnManageRecentImages.addEventListener('click', (e) => {
          e.stopPropagation();
          this._isManagingRecentImages = !this._isManagingRecentImages;
          this.render();
        });
      }

      // Botões Individuais de Exclusão de Imagem
      const deleteRecentImageButtons = this.shadowRoot.querySelectorAll('.sl-btn-delete-recent-image');
      deleteRecentImageButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const url = btn.getAttribute('data-url') || '';
          if (url) {
            removeStoredRecentImage(url);
            if (getStoredRecentImages().length === 0) {
              this._isManagingRecentImages = false;
            }
            this.render();
          }
        });
      });

      // Botão Limpar Histórico de Imagens (Gatilha confirmação inline)
      const btnClearRecentImages = this.shadowRoot.getElementById('btn-clear-recent-images');
      if (btnClearRecentImages) {
        btnClearRecentImages.addEventListener('click', (e) => {
          e.stopPropagation();
          this._isConfirmingClearImages = true;
          this.render();
        });
      }

      // Confirmação Inline: Sim, limpar
      const btnConfirmClearImagesYes = this.shadowRoot.getElementById('btn-confirm-clear-images-yes');
      if (btnConfirmClearImagesYes) {
        btnConfirmClearImagesYes.addEventListener('click', (e) => {
          e.stopPropagation();
          clearStoredRecentImages();
          this._isConfirmingClearImages = false;
          this._isManagingRecentImages = false;
          this.render();
        });
      }

      // Confirmação Inline: Cancelar
      const btnConfirmClearImagesNo = this.shadowRoot.getElementById('btn-confirm-clear-images-no');
      if (btnConfirmClearImagesNo) {
        btnConfirmClearImagesNo.addEventListener('click', (e) => {
          e.stopPropagation();
          this._isConfirmingClearImages = false;
          this.render();
        });
      }

      // Botão Confirmar Inserção de Imagem (1º Clique Direto + Salva na Coleção)
      if (btnConfirmModal) {
        btnConfirmModal.addEventListener('click', () => {
          const rawUrl = (inputUrl ? inputUrl.value : this._imageModalUrl).trim();
          const altText = (inputAlt ? inputAlt.value : this._imageModalAlt).trim() || (isPt ? 'Imagem' : 'Image');
          if (!rawUrl) {
            this._imageModalError = isPt
              ? 'Por favor, insira a URL da imagem.'
              : 'Please enter an image URL.';
            if (errorText) errorText.textContent = this._imageModalError;
            if (errorBox) errorBox.style.display = 'flex';
            if (previewCard) previewCard.style.display = 'none';
            return;
          }

          const check = isSafeMediaUrl(rawUrl);
          if (!check.safe) {
            this._imageModalError = check.reason || (isPt ? 'URL inválida ou não segura.' : 'Invalid or unsafe URL.');
            if (errorText) errorText.textContent = this._imageModalError;
            if (errorBox) errorBox.style.display = 'flex';
            if (previewCard) previewCard.style.display = 'none';
            return;
          }

          storeRecentImage(rawUrl, altText);
          const markdown = `![${altText}](${rawUrl})`;
          this._isImageModalOpen = false;
          this._isManagingRecentImages = false;
          this._isConfirmingClearImages = false;
          this._imageModalUrl = '';
          this._imageModalAlt = '';
          this._imageModalError = null;
          this._imageModalSuccess = null;
          this.insertTextAtCursor(markdown);
        });
      }
    }

    if (this._isEmojiPickerOpen) {
      const handleOutsideEmojiClick = (e: MouseEvent) => {
        const path = e.composedPath();
        const popover = this.shadowRoot?.getElementById('emoji-popover');
        if (popover && !path.includes(popover) && btnEmojiToggle && !path.includes(btnEmojiToggle)) {
          this._isEmojiPickerOpen = false;
          this.render();
          document.removeEventListener('click', handleOutsideEmojiClick);
        }
      };
      setTimeout(() => document.addEventListener('click', handleOutsideEmojiClick), 0);
    }

    // 3. Botão de Login do GitHub (quando deslogado)
    const btnLoginSubmit = this.shadowRoot.getElementById('btn-login-submit');
    if (btnLoginSubmit) {
      btnLoginSubmit.addEventListener('click', () => {
        this.loginWithGitHub();
      });
    }

    // 4. Botão de Logout
    const btnLogout = this.shadowRoot.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        this.logout();
      });
    }

    // 5. Botão de Envio de Novo Comentário (quando logado)
    const btnSubmit = this.shadowRoot.getElementById('btn-submit');
    if (btnSubmit) {
      btnSubmit.addEventListener('click', async () => {
        const text = this._composerText.trim();
        if (!text) {
          alert(
            this.currentLang === 'pt'
              ? 'Por favor, escreva uma reflexão antes de publicar.'
              : 'Please write a note before posting.'
          );
          return;
        }

        await this.handlePostComment(text);
      });
    }

    // 6. Reatividade LinkedIn: Gatilho Principal [ 👍 Gostei ], Popover Flutuante e Badges
    const reactionTriggers = this.shadowRoot.querySelectorAll('.sl-reaction-trigger-btn');
    reactionTriggers.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!this._currentUser) {
          this.loginWithGitHub();
          return;
        }
        const target = e.currentTarget as HTMLElement;
        const commentId = target.getAttribute('data-comment-id');
        const emoji = target.getAttribute('data-emoji') || '👍';
        if (commentId) {
          await this.handleToggleReaction(commentId, emoji);
        }
      });
    });

    const reactionPickers = this.shadowRoot.querySelectorAll('.sl-reaction-picker-item');
    reactionPickers.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!this._currentUser) {
          this.loginWithGitHub();
          return;
        }
        const target = e.currentTarget as HTMLElement;
        const commentId = target.getAttribute('data-comment-id');
        const emoji = target.getAttribute('data-emoji');
        const container = target.closest('.sl-reaction-container');
        container?.classList.remove('sl-popover-open');
        if (commentId && emoji) {
          await this.handleToggleReaction(commentId, emoji);
        }
      });
    });

    const reactionBadges = this.shadowRoot.querySelectorAll('.sl-reaction-badge');
    reactionBadges.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!this._currentUser) {
          this.loginWithGitHub();
          return;
        }
        const target = e.currentTarget as HTMLElement;
        const commentId = target.getAttribute('data-comment-id');
        const emoji = target.getAttribute('data-emoji');
        if (commentId && emoji) {
          await this.handleToggleReaction(commentId, emoji);
        }
      });
    });

    // Reação popover: mouseenter/mouseleave e toque longo / contextmenu no mobile
    const reactionContainers = this.shadowRoot.querySelectorAll('.sl-reaction-container');
    reactionContainers.forEach((container) => {
      container.addEventListener('mouseenter', () => {
        container.classList.add('sl-popover-open');
      });
      container.addEventListener('mouseleave', () => {
        container.classList.remove('sl-popover-open');
      });
      container.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        container.classList.toggle('sl-popover-open');
      });
    });

    // 7. Botões de Responder (Abre formulário inline)
    const replyButtons = this.shadowRoot.querySelectorAll('.sl-reply-btn:not(.btn-toggle-translate)');
    replyButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const commentId = target.getAttribute('data-reply-to');

        if (!this._currentUser) {
          this.loginWithGitHub();
          return;
        }

        if (this._replyingToId === commentId) {
          this._replyingToId = null;
          this._replyText = '';
        } else {
          this._replyingToId = commentId;
          // Buscar o autor: pode ser o comentário raiz ou estar dentro de replies de algum comentário
          let authorLogin = '';
          const rootComment = this._comments.find((c) => c.id === commentId);
          if (rootComment) {
            authorLogin = rootComment.author.login;
          } else {
            for (const c of this._comments) {
              const reply = c.replies?.find((r) => r.id === commentId);
              if (reply) {
                authorLogin = reply.author.login;
                break;
              }
            }
          }
          this._replyText = authorLogin ? `@${authorLogin} ` : '';
        }
        this.render();
      });
    });

    // 7.1. Alternar visualização da thread (Ver mais respostas / Recolher)
    const threadToggleButtons = this.shadowRoot.querySelectorAll('.sl-thread-toggle-btn');
    threadToggleButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const threadId = target.getAttribute('data-thread-id');
        if (!threadId) return;

        if (this._expandedThreads.has(threadId)) {
          this._expandedThreads.delete(threadId);
        } else {
          this._expandedThreads.add(threadId);
        }
        this.render();
      });
    });

    // 8. Enviar Resposta Aninhada
    const sendReplyButtons = this.shadowRoot.querySelectorAll('.btn-send-reply');
    sendReplyButtons.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const target = e.currentTarget as HTMLElement;
        const commentId = target.getAttribute('data-comment-id');
        const parentId = target.getAttribute('data-parent-id') || commentId;
        const textarea = this.shadowRoot?.getElementById(`reply-textarea-${commentId}`) as HTMLTextAreaElement;
        if (!textarea) return;

        const replyContent = textarea.value.trim();
        if (!replyContent || !parentId) return;

        await this.handlePostReply(parentId, replyContent);
      });
    });

    // 9. Cancelar Resposta
    const cancelReplyButtons = this.shadowRoot.querySelectorAll('.btn-cancel-reply');
    cancelReplyButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this._replyingToId = null;
        this._replyText = '';
        this.render();
      });
    });

    // 10. Tradução Multilíngue (Toggle Original / Traduzido)
    const translateButtons = this.shadowRoot.querySelectorAll('.btn-toggle-translate');
    translateButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const commentId = target.getAttribute('data-comment-id');
        if (commentId) {
          this.toggleTranslate(commentId);
        }
      });
    });

    // 11. Botão de Áudio (Web Speech API Poliglota)
    const audioButtons = this.shadowRoot.querySelectorAll('.sl-audio-btn');
    audioButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const commentId = target.getAttribute('data-speak-id');
        const rawText = target.getAttribute('data-text');
        const langCode = target.getAttribute('data-lang') || undefined;
        if (commentId && rawText) {
          const text = decodeURIComponent(rawText);
          this.toggleSpeak(commentId, text, langCode);
        }
      });
    });

    // 12. Menu de Três Pontinhos (•••)
    const menuButtons = this.shadowRoot.querySelectorAll('.sl-menu-btn');
    menuButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const target = e.currentTarget as HTMLElement;
        const menuId = target.getAttribute('data-menu-id');
        this._openMenuId = this._openMenuId === menuId ? null : menuId;
        this.render();
      });
    });

    // Fechar menu ao clicar fora
    this.shadowRoot.addEventListener('click', () => {
      if (this._openMenuId) {
        this._openMenuId = null;
        this.render();
      }
    });

    // 12.1. Ações do Menu: Fixar / Desafixar Comentário pelo Autor
    const togglePinButtons = this.shadowRoot.querySelectorAll('.btn-toggle-pin');
    togglePinButtons.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const target = e.currentTarget as HTMLElement;
        const commentId = target.getAttribute('data-comment-id');
        if (!commentId) return;
        await this.handleTogglePin(commentId);
      });
    });

    // 13. Ações do Menu: Editar
    const editButtons = this.shadowRoot.querySelectorAll('.btn-edit');
    editButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const target = e.currentTarget as HTMLElement;
        const commentId = target.getAttribute('data-comment-id');
        this._editingId = commentId;
        this._openMenuId = null;
        this.render();
      });
    });

    // Salvar Edição
    const saveEditButtons = this.shadowRoot.querySelectorAll('.btn-save-edit');
    saveEditButtons.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const target = e.currentTarget as HTMLElement;
        const commentId = target.getAttribute('data-comment-id');
        const textarea = this.shadowRoot?.getElementById(`edit-textarea-${commentId}`) as HTMLTextAreaElement;
        if (!textarea || !commentId) return;

        const newText = textarea.value.trim();
        if (!newText) return;

        await this.handleSaveEdit(commentId, newText);
      });
    });

    // Cancelar Edição
    const cancelEditButtons = this.shadowRoot.querySelectorAll('.btn-cancel-edit');
    cancelEditButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this._editingId = null;
        this.render();
      });
    });

    // 14. Ações do Menu: Excluir
    const deleteButtons = this.shadowRoot.querySelectorAll('.btn-delete');
    deleteButtons.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const target = e.currentTarget as HTMLElement;
        const commentId = target.getAttribute('data-comment-id');
        if (!commentId) return;

        const confirmMsg =
          this.currentLang === 'pt'
            ? 'Tem certeza que deseja excluir esta nota?'
            : 'Are you sure you want to delete this note?';
        if (confirm(confirmMsg)) {
          await this.handleDelete(commentId);
        }
      });
    });

    // 14.1. Ações de Moderação KV (Proprietário): Restringir Mídia / Banir com Confirmação Prévia
    const restrictMediaButtons = this.shadowRoot.querySelectorAll('.btn-mod-restrict-media');
    restrictMediaButtons.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const target = e.currentTarget as HTMLElement;
        const username = target.getAttribute('data-user');
        if (!username) return;

        const confirmMsg =
          this.currentLang === 'pt'
            ? `Deseja realmente remover a permissão de mídia de @${username}?`
            : this.currentLang === 'es'
            ? `¿Deseas quitar el permiso de medios a @${username}?`
            : `Are you sure you want to restrict media for @${username}?`;
        if (!confirm(confirmMsg)) return;

        this._openMenuId = null;
        this.render();
        await this.handleSetModeration(username, 'restrict_media');
      });
    });

    const banButtons = this.shadowRoot.querySelectorAll('.btn-mod-ban');
    banButtons.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const target = e.currentTarget as HTMLElement;
        const username = target.getAttribute('data-user');
        if (!username) return;

        const confirmMsg =
          this.currentLang === 'pt'
            ? `Deseja realmente banir o usuário @${username} dos comentários?`
            : this.currentLang === 'es'
            ? `¿Deseas bloquear al usuario @${username} de los comentarios?`
            : `Are you sure you want to ban @${username} from commenting?`;
        if (!confirm(confirmMsg)) return;

        this._openMenuId = null;
        this.render();
        await this.handleSetModeration(username, 'ban');
      });
    });

    // 14.2. Ações da Barra de Moderação: Atualizar Lista, Alternar Gaveta, Recolher Painel e Remover Moderação
    const modRefreshBtn = this.shadowRoot.getElementById('sl-mod-refresh');
    if (modRefreshBtn) {
      modRefreshBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await this.loadModerationList();
      });
    }

    const toggleCollapseBtn = this.shadowRoot.getElementById('sl-mod-toggle-collapse');
    if (toggleCollapseBtn) {
      toggleCollapseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._isModerationCollapsed = !this._isModerationCollapsed;
        try {
          localStorage.setItem('sl_mod_collapsed', String(this._isModerationCollapsed));
        } catch {}
        this.render();
      });
    }

    const pillBan = this.shadowRoot.getElementById('sl-mod-pill-ban');
    if (pillBan) {
      pillBan.addEventListener('click', (e) => {
        e.stopPropagation();
        this._expandedModCategory = this._expandedModCategory === 'ban' ? null : 'ban';
        this.render();
      });
    }

    const pillMedia = this.shadowRoot.getElementById('sl-mod-pill-media');
    if (pillMedia) {
      pillMedia.addEventListener('click', (e) => {
        e.stopPropagation();
        this._expandedModCategory = this._expandedModCategory === 'media' ? null : 'media';
        this.render();
      });
    }

    const modRemoveButtons = this.shadowRoot.querySelectorAll('.sl-mod-chip-remove');
    modRemoveButtons.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const target = e.currentTarget as HTMLElement;
        const username = target.getAttribute('data-user');
        if (username) {
          await this.handleRemoveModeration(username);
        }
      });
    });

    // 15. Ações do Menu: Copiar Link Permanente
    const copyLinkButtons = this.shadowRoot.querySelectorAll('.btn-copy-link');
    copyLinkButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const target = e.currentTarget as HTMLElement;
        const commentId = target.getAttribute('data-comment-id');
        const url = `${window.location.href.split('#')[0]}#comment-${commentId}`;
        navigator.clipboard.writeText(url).then(() => {
          alert(
            this.currentLang === 'pt'
              ? 'Link copiado para a área de transferência!'
              : 'Link copied to clipboard!'
          );
        });
        this._openMenuId = null;
        this.render();
      });
    });

    // 16. Suporte ao Mini-Lightbox Nativo (Zoom, Pan & Visualização sem sair da página)
    const commentImages = this.shadowRoot.querySelectorAll<HTMLImageElement>(
      '.sl-card-body img:not(.sl-emoji-inline), .sl-preview-area img:not(.sl-emoji-inline)'
    );
    commentImages.forEach((img) => {
      img.addEventListener('click', (e) => {
        // Previne navegação da tag <a> ancestral (ex: camo.githubusercontent.com)
        e.preventDefault();
        e.stopPropagation();
        const src = img.getAttribute('src') || '';
        const alt = img.getAttribute('alt') || '';
        if (src) {
          this.openLightbox(src, alt);
        }
      });
    });

    if (this._lightboxOpen) {
      const stage = this.shadowRoot.getElementById('sl-lightbox-stage');
      const img = this.shadowRoot.getElementById('sl-lightbox-img') as HTMLImageElement | null;
      const btnClose = this.shadowRoot.getElementById('sl-lightbox-close');
      const btnZoomIn = this.shadowRoot.getElementById('sl-lightbox-zoom-in');
      const btnZoomOut = this.shadowRoot.getElementById('sl-lightbox-zoom-out');
      const btnReset = this.shadowRoot.getElementById('sl-lightbox-reset');

      if (btnClose) {
        btnClose.addEventListener('click', (e) => {
          e.stopPropagation();
          this.closeLightbox();
        });
      }

      if (btnZoomIn) {
        btnZoomIn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.setLightboxZoom(this._lightboxScale + 0.3);
        });
      }

      if (btnZoomOut) {
        btnZoomOut.addEventListener('click', (e) => {
          e.stopPropagation();
          this.setLightboxZoom(this._lightboxScale - 0.3);
        });
      }

      if (btnReset) {
        btnReset.addEventListener('click', (e) => {
          e.stopPropagation();
          this.resetLightboxTransform();
        });
      }

      // Fecha ao clicar fora da imagem (no palco vazio)
      if (stage) {
        stage.addEventListener('click', (e) => {
          if (e.target === stage) {
            this.closeLightbox();
          }
        });

        // Zoom com a roda do mouse (wheel)
        stage.addEventListener(
          'wheel',
          (e) => {
            e.preventDefault();
            const delta = e.deltaY < 0 ? 0.25 : -0.25;
            this.setLightboxZoom(this._lightboxScale + delta);
          },
          { passive: false }
        );
      }

      if (img) {
        // Duplo clique na imagem alterna rapidamente entre 1x e 2x
        img.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          if (this._lightboxScale > 1.2) {
            this.resetLightboxTransform();
          } else {
            this.setLightboxZoom(2);
          }
        });

        // Pan / Arrastar fluido com Mouse
        img.addEventListener('mousedown', (e: MouseEvent) => {
          if (e.button !== 0) return;
          e.preventDefault();
          this._isDraggingImage = true;
          this._dragStartX = e.clientX;
          this._dragStartY = e.clientY;
          this._dragStartTx = this._lightboxTranslateX;
          this._dragStartTy = this._lightboxTranslateY;
          this.updateLightboxTransform(true);

          const onMouseMove = (moveEv: MouseEvent) => {
            if (!this._isDraggingImage) return;
            const dx = moveEv.clientX - this._dragStartX;
            const dy = moveEv.clientY - this._dragStartY;
            this._lightboxTranslateX = this._dragStartTx + dx;
            this._lightboxTranslateY = this._dragStartTy + dy;
            this.updateLightboxTransform(true);
          };

          const onMouseUp = () => {
            this._isDraggingImage = false;
            this.updateLightboxTransform(false);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
          };

          window.addEventListener('mousemove', onMouseMove);
          window.addEventListener('mouseup', onMouseUp);
        });

        // Pan / Arrastar fluido com Touch (Mobile / Tablets)
        img.addEventListener('touchstart', (e: TouchEvent) => {
          if (e.touches.length === 1) {
            const touch = e.touches[0];
            this._isDraggingImage = true;
            this._dragStartX = touch.clientX;
            this._dragStartY = touch.clientY;
            this._dragStartTx = this._lightboxTranslateX;
            this._dragStartTy = this._lightboxTranslateY;
            this.updateLightboxTransform(true);

            const onTouchMove = (tmEv: TouchEvent) => {
              if (!this._isDraggingImage || tmEv.touches.length !== 1) return;
              const curTouch = tmEv.touches[0];
              const dx = curTouch.clientX - this._dragStartX;
              const dy = curTouch.clientY - this._dragStartY;
              this._lightboxTranslateX = this._dragStartTx + dx;
              this._lightboxTranslateY = this._dragStartTy + dy;
              this.updateLightboxTransform(true);
            };

            const onTouchEnd = () => {
              this._isDraggingImage = false;
              this.updateLightboxTransform(false);
              window.removeEventListener('touchmove', onTouchMove);
              window.removeEventListener('touchend', onTouchEnd);
            };

            window.addEventListener('touchmove', onTouchMove, { passive: true });
            window.addEventListener('touchend', onTouchEnd);
          }
        }, { passive: true });
      }
    }

    // 17. Configuração e Ativação dos Blocos de Código Técnicos
    this.setupCodeBlocks();
  }

  /**
   * Configura blocos de código nos comentários e na área de prévia:
   * Numeração de linhas, botão Copiar com feedback visual e adaptação de blocos do GitHub Discussions.
   */
  private setupCodeBlocks(): void {
    if (!this.shadowRoot) return;

    // 1. Adaptação de <pre><code> do GitHub Discussions que ainda não são .sl-code-block
    const preElements = this.shadowRoot.querySelectorAll<HTMLPreElement>(
      '.sl-card-body pre, .sl-preview-area pre'
    );

    preElements.forEach((pre) => {
      if (pre.closest('.sl-code-block')) return;

      const codeEl = pre.querySelector('code') || pre;
      const rawText = codeEl.textContent || '';
      if (!rawText.trim()) return;

      // Detecta linguagem (GitHub usa highlight highlight-source-{lang} ou atributos lang/class)
      let detectedLang = 'code';
      const containerWithHighlight = pre.closest('[class*="highlight-source-"]');
      if (containerWithHighlight) {
        const match = containerWithHighlight.className.match(/highlight-source-([a-zA-Z0-9_-]+)/);
        if (match && match[1]) detectedLang = match[1];
      } else if (pre.getAttribute('lang')) {
        detectedLang = pre.getAttribute('lang') || 'code';
      } else if (codeEl.className) {
        const match = codeEl.className.match(/(?:language|lang)-([a-zA-Z0-9_-]+)/);
        if (match && match[1]) detectedLang = match[1];
      }

      const lines = rawText.split(/\r?\n/);
      const isLongCode = lines.length > 20;
      const isPt = this.currentLang === 'pt';
      const copyLabel = isPt ? 'Copiar' : 'Copy';
      const copyTitle = isPt ? 'Copiar código' : 'Copy code';
      const scrollUpTitle = isPt ? 'Rolar para cima' : 'Scroll up';
      const scrollDownTitle = isPt ? 'Rolar para baixo' : 'Scroll down';
      const badgeText = isLongCode
        ? `${detectedLang} · ${lines.length} ${isPt ? 'linhas' : 'lines'}`
        : detectedLang;

      const wrapper = document.createElement('div');
      wrapper.className = `sl-code-block ${isLongCode ? 'sl-code-block-long sl-collapsed' : ''}`;
      wrapper.setAttribute('data-lang', detectedLang);

      const header = document.createElement('div');
      header.className = 'sl-code-header';
      header.innerHTML = `
        <span class="sl-code-badge">${badgeText}</span>
        <button type="button" class="sl-code-copy-btn" title="${copyTitle}" aria-label="${copyTitle}">
          <svg class="sl-copy-icon" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
            <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
          </svg>
          <span class="sl-copy-text">${copyLabel}</span>
        </button>
      `;

      // Linhas com numeração se ainda não possuir .sl-code-line
      if (!codeEl.querySelector('.sl-code-line')) {
        codeEl.innerHTML = lines
          .map((l, i) => {
            const escaped = l.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `<span class="sl-code-line"><span class="sl-line-num">${i + 1}</span><span class="sl-line-code">${escaped || ' '}</span></span>`;
          })
          .join('');
      }

      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);
      pre.classList.add('sl-code-pre');
      codeEl.classList.add('sl-code-body');

      if (isLongCode && !this._hideCodeScroll) {
        const controls = document.createElement('div');
        controls.className = 'sl-code-scroll-controls';
        controls.setAttribute('aria-label', isPt ? 'Navegação do código' : 'Code navigation');
        controls.innerHTML = `
          <button type="button" class="sl-code-scroll-btn sl-scroll-up" title="${scrollUpTitle}" aria-label="${scrollUpTitle}">
            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
              <path d="M8 3.5a.75.75 0 0 1 .53.22l4.5 4.5a.75.75 0 0 1-1.06 1.06L8 5.31 4.03 9.28a.75.75 0 0 1-1.06-1.06l4.5-4.5A.75.75 0 0 1 8 3.5Z"/>
            </svg>
          </button>
          <button type="button" class="sl-code-scroll-btn sl-scroll-down" title="${scrollDownTitle}" aria-label="${scrollDownTitle}">
            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
              <path d="M8 12.5a.75.75 0 0 1-.53-.22l-4.5-4.5a.75.75 0 0 1 1.06-1.06L8 10.69l3.97-3.97a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-.53.22Z"/>
            </svg>
          </button>
        `;
        wrapper.appendChild(controls);

        const expandBar = document.createElement('div');
        expandBar.className = 'sl-code-expand-bar';
        expandBar.innerHTML = `
          <button type="button" class="sl-code-expand-btn" data-lines="${lines.length}">
            <span>↕</span>
            <span class="sl-expand-text">${isPt ? `Mostrar todas as ${lines.length} linhas` : `Show all ${lines.length} lines`}</span>
          </button>
        `;
        wrapper.appendChild(expandBar);
      }
    });

    // 2. Vinculação do botão de Copiar em todos os .sl-code-block
    const copyButtons = this.shadowRoot.querySelectorAll<HTMLButtonElement>('.sl-code-copy-btn');
    copyButtons.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const block = btn.closest('.sl-code-block');
        if (!block) return;

        // Extrai apenas o texto puro de cada .sl-line-code (ignorando números de linha)
        const lineCodeElements = block.querySelectorAll('.sl-line-code');
        let codeToCopy = '';

        if (lineCodeElements.length > 0) {
          codeToCopy = Array.from(lineCodeElements)
            .map((el) => el.textContent || '')
            .join('\n');
        } else {
          const preEl = block.querySelector('pre');
          codeToCopy = preEl?.textContent || '';
        }

        try {
          await navigator.clipboard.writeText(codeToCopy);

          const textSpan = btn.querySelector('.sl-copy-text');
          const originalText = textSpan ? textSpan.textContent : '';

          btn.classList.add('sl-copied');
          if (textSpan) {
            textSpan.textContent = this.currentLang === 'pt' ? 'Copiado!' : 'Copied!';
          }

          setTimeout(() => {
            btn.classList.remove('sl-copied');
            if (textSpan && originalText) {
              textSpan.textContent = originalText;
            }
          }, 2000);
        } catch {
          // Fallback gracioso
        }
      });
    });

    // 3. Vinculação das setas de rolagem em .sl-code-block-long
    const scrollButtons = this.shadowRoot.querySelectorAll<HTMLButtonElement>('.sl-code-scroll-btn');
    scrollButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const block = btn.closest('.sl-code-block');
        const pre = block?.querySelector<HTMLPreElement>('.sl-code-pre');
        if (!pre) return;
        const isDown = btn.classList.contains('sl-scroll-down');
        pre.scrollBy({ top: isDown ? 160 : -160, behavior: 'smooth' });
      });
    });

    const longCodeBlocks = this.shadowRoot.querySelectorAll<HTMLElement>('.sl-code-block-long');
    longCodeBlocks.forEach((block) => {
      const pre = block.querySelector<HTMLPreElement>('.sl-code-pre');
      const btnUp = block.querySelector<HTMLButtonElement>('.sl-scroll-up');
      const btnDown = block.querySelector<HTMLButtonElement>('.sl-scroll-down');
      if (!pre || !btnUp || !btnDown) return;

      const updateButtons = () => {
        const isAtTop = pre.scrollTop <= 2;
        const isAtBottom = pre.scrollTop + pre.clientHeight >= pre.scrollHeight - 4;
        btnUp.classList.toggle('sl-disabled', isAtTop);
        btnDown.classList.toggle('sl-disabled', isAtBottom);
      };

      pre.addEventListener('scroll', updateButtons, { passive: true });
      updateButtons();
    });

    // 4. Vinculação do botão Expandir / Minimizar Código
    const expandButtons = this.shadowRoot.querySelectorAll<HTMLButtonElement>('.sl-code-expand-btn');
    expandButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const block = btn.closest('.sl-code-block-long');
        if (!block) return;
        const isCollapsed = block.classList.contains('sl-collapsed');
        const linesCount = btn.getAttribute('data-lines') || '';
        const textSpan = btn.querySelector('.sl-expand-text');
        const isPt = this.currentLang === 'pt';

        if (isCollapsed) {
          block.classList.remove('sl-collapsed');
          block.classList.add('sl-expanded');
          if (textSpan) {
            textSpan.textContent = isPt ? 'Minimizar código' : 'Collapse code';
          }
        } else {
          block.classList.remove('sl-expanded');
          block.classList.add('sl-collapsed');
          if (textSpan) {
            textSpan.textContent = isPt
              ? `Mostrar todas as ${linesCount} linhas`
              : `Show all ${linesCount} lines`;
          }
          block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });

    // 16. Paginação de Comentários
    const pageButtons = this.shadowRoot.querySelectorAll('.sl-page-btn[data-page]');
    pageButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const pageStr = target.getAttribute('data-page');
        if (!pageStr) return;
        const targetPage = parseInt(pageStr, 10);
        if (targetPage !== this._currentPage) {
          this._currentPage = targetPage;
          this.render();
          this.scrollListToTop();
        }
      });
    });

    const prevPageBtn = this.shadowRoot.querySelector('.btn-prev-page');
    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', () => {
        if (this._currentPage > 1) {
          this._currentPage--;
          this.render();
          this.scrollListToTop();
        }
      });
    }

    const nextPageBtn = this.shadowRoot.querySelector('.btn-next-page');
    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(this._comments.length / this._pageSize);
        if (this._currentPage < totalPages) {
          this._currentPage++;
          this.render();
          this.scrollListToTop();
        }
      });
    }

    // 17. Campo de Busca Dinâmico no Cabeçalho
    const searchInput = this.shadowRoot.getElementById('sl-search-input') as HTMLInputElement | null;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const val = (e.target as HTMLInputElement).value;
        this._searchQuery = val;
        this._currentPage = 1;
        this.render();
        const reloaded = this.shadowRoot?.getElementById('sl-search-input') as HTMLInputElement | null;
        if (reloaded) {
          reloaded.focus();
          const len = reloaded.value.length;
          reloaded.setSelectionRange(len, len);
        }
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this._searchQuery = '';
          this._currentPage = 1;
          this.render();
        }
      });
    }

    const clearBtn = this.shadowRoot.getElementById('sl-search-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this._searchQuery = '';
        this._currentPage = 1;
        this.render();
      });
    }

    const bannerClearBtn = this.shadowRoot.querySelector('.sl-search-banner-clear');
    if (bannerClearBtn) {
      bannerClearBtn.addEventListener('click', () => {
        this._searchQuery = '';
        this._currentPage = 1;
        this.render();
      });
    }
  }

  private scrollListToTop(): void {
    const listEl = this.shadowRoot?.querySelector('.sl-container');
    if (listEl) {
      listEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Operações de Mutação conectadas ao Broker (ou Fallback Mock)
   */
  private async handlePostComment(text: string): Promise<void> {
    const author = this._currentUser || {
      login: 'demo-reader',
      avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
      url: 'https://github.com',
    };

    if (this._brokerClient && this._authToken) {
      try {
        // Se a discussão ainda não existe no GitHub, cria automaticamente
        if (!this._discussionId && this._repositoryId && this._categoryId) {
          const pageTitle =
            this._title.trim() ||
            (typeof document !== 'undefined'
              ? document.title.replace(/\s*[-|·].*$/, '').trim()
              : '') ||
            this.getCurrentTerm();

          const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
          const initialBody = pageUrl
            ? `Discussão para o artigo: **[${pageTitle}](${pageUrl})**\n\n_Comentários gerenciados nativamente pelo [ScatterLeaf](https://github.com/rnt-rez/scatterleaf)._`
            : undefined;

          const disc = await this._brokerClient.createDiscussion(
            this._repositoryId,
            this._categoryId,
            pageTitle,
            initialBody
          );
          this._discussionId = disc.id;
        }

        if (this._discussionId) {
          const res = await this._brokerClient.addComment(
            this._discussionId,
            text,
            undefined,
            this._repo
          );
          const newComment: ScatterComment = {
            id: res.id,
            author: {
              login: res.author.login,
              avatarUrl: res.author.avatarUrl,
              url: res.author.url,
              isAuthor: true,
            },
            body: res.body,
            bodyHtml: res.bodyHTML,
            createdAt: this.currentLang === 'pt' ? 'agora mesmo' : 'just now',
            originalLang: this.detectTextLanguage(text),
            reactions: [],
            replies: [],
          };
          this._comments.unshift(newComment);
          this._currentPage = 1;
          this._composerText = '';
          this._activeTab = 'write';
          this.render();

          // Após 5 segundos no topo para feedback imediato, move para o final da lista (ordem cronológica natural)
          setTimeout(() => {
            const idx = this._comments.findIndex((c) => c.id === newComment.id);
            if (idx !== -1) {
              const [item] = this._comments.splice(idx, 1);
              this._comments.push(item);
              this.render();
            }
          }, 5000);

          return;
        }
      } catch (err: any) {
        console.error('Falha ao enviar comentário via broker:', err);
        if (this.isAuthError(err)) {
          this.handleExpiredSession(false);
          return;
        }
        alert(
          err?.message ||
            (this._lang === 'pt' ? 'Erro ao enviar comentário.' : 'Failed to post comment.')
        );
        return;
      }
    }

    // Fallback Mock Local
    const newComment: ScatterComment = {
      id: String(Date.now()),
      author: {
        login: author.login,
        avatarUrl: author.avatarUrl,
        url: author.url || `https://github.com/${author.login}`,
        isAuthor: true,
      },
      body: text,
      createdAt: this.currentLang === 'pt' ? 'agora mesmo' : 'just now',
      originalLang: this.detectTextLanguage(text),
      reactions: [],
      replies: [],
    };

    this._comments.unshift(newComment);
    this._currentPage = 1;
    this._composerText = '';
    this._activeTab = 'write';
    this.render();

    // Após 5 segundos no topo para feedback imediato, move para o final da lista (ordem cronológica natural)
    setTimeout(() => {
      const idx = this._comments.findIndex((c) => c.id === newComment.id);
      if (idx !== -1) {
        const [item] = this._comments.splice(idx, 1);
        this._comments.push(item);
        this.render();
      }
    }, 5000);

    this.dispatchEvent(
      new CustomEvent('comment-added', {
        detail: newComment,
        bubbles: true,
        composed: true,
      })
    );
  }

  private async handlePostReply(commentId: string, replyContent: string): Promise<void> {
    const author = this._currentUser || {
      login: 'demo-reader',
      avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
      url: 'https://github.com',
    };

    if (this._brokerClient && this._authToken && this._discussionId) {
      try {
        const res = await this._brokerClient.addComment(
          this._discussionId,
          replyContent,
          commentId,
          this._repo
        );
        const parent = this._comments.find((c) => c.id === commentId);
        if (parent) {
          if (!parent.replies) parent.replies = [];
          parent.replies.push({
            id: res.id,
            author: {
              login: res.author.login,
              avatarUrl: res.author.avatarUrl,
              url: res.author.url,
              isAuthor: false,
            },
            body: res.body,
            bodyHtml: res.bodyHTML,
            createdAt: this.currentLang === 'pt' ? 'agora mesmo' : 'just now',
            originalLang: this.detectTextLanguage(replyContent),
            reactions: [],
            parentId: commentId,
          });
          this._expandedThreads.add(commentId);
          this._replyingToId = null;
          this._replyText = '';
          this.render();
          return;
        }
      } catch (err: any) {
        console.error('Falha ao enviar réplica via broker:', err);
        if (this.isAuthError(err)) {
          this.handleExpiredSession(false);
          return;
        }
        alert(
          err?.message ||
            (this._lang === 'pt' ? 'Erro ao enviar réplica.' : 'Failed to post reply.')
        );
        return;
      }
    }

    // Fallback Mock Local
    const parent = this._comments.find((c) => c.id === commentId);
    if (parent) {
      if (!parent.replies) parent.replies = [];
      const newReply: ScatterComment = {
        id: `${commentId}-${Date.now()}`,
        author: {
          login: author.login,
          avatarUrl: author.avatarUrl,
          url: author.url || `https://github.com/${author.login}`,
          isAuthor: false,
        },
        body: replyContent,
        createdAt: this.currentLang === 'pt' ? 'agora mesmo' : 'just now',
        originalLang: this.detectTextLanguage(replyContent),
        reactions: [],
        parentId: commentId,
      };

      parent.replies.push(newReply);
      this._expandedThreads.add(commentId);
      this._replyingToId = null;
      this._replyText = '';
      this.render();

      this.dispatchEvent(
        new CustomEvent('reply-added', {
          detail: newReply,
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  private async handleSaveEdit(commentId: string, newBody: string): Promise<void> {
    let updatedData: any = null;
    if (this._brokerClient && this._authToken) {
      try {
        updatedData = await this._brokerClient.updateComment(commentId, newBody, this._repo);
      } catch (err: any) {
        console.error('Falha ao editar comentário via broker:', err);
        if (this.isAuthError(err)) {
          this.handleExpiredSession(false);
          return;
        }
        alert(
          err?.message ||
            (this._lang === 'pt'
              ? 'Não foi possível salvar a edição no GitHub. Verifique sua conexão ou permissões.'
              : 'Failed to save edit on GitHub. Please check your connection or permissions.')
        );
        return;
      }
    }

    const updateCommentFields = (target: ScatterComment) => {
      const isPinned = !!(
        target.isPinned ||
        target.body.includes('<!-- sl:pinned -->') ||
        target.body.includes('<!-- pinned -->')
      );
      const cleanBody = newBody
        .replace(/<!--\s*sl:pinned\s*-->\r?\n?/g, '')
        .replace(/<!--\s*pinned\s*-->\r?\n?/g, '');
      target.body = isPinned ? `<!-- sl:pinned -->\n${cleanBody}` : cleanBody;
      target.isEdited = true;
      target.bodyHtml = updatedData?.bodyHTML || undefined;
      target.translatedBody = undefined;
      target.isShowingTranslation = false;
    };

    for (const c of this._comments) {
      if (c.id === commentId) {
        updateCommentFields(c);
        break;
      }
      if (c.replies) {
        const found = c.replies.find((r) => r.id === commentId);
        if (found) {
          updateCommentFields(found);
          break;
        }
      }
    }

    this._editingId = null;
    this.render();
  }

  private async handleDelete(commentId: string): Promise<void> {
    if (this._brokerClient && this._authToken) {
      try {
        await this._brokerClient.deleteComment(commentId);
      } catch (err) {
        console.error('Falha ao excluir comentário via broker:', err);
        if (this.isAuthError(err)) {
          this.handleExpiredSession(false);
          return;
        }
      }
    }

    this._comments = this._comments.filter((c) => {
      if (c.id === commentId) return false;
      if (c.replies) {
        c.replies = c.replies.filter((r) => r.id !== commentId);
      }
      return true;
    });
    this._openMenuId = null;
    this.render();
  }

  private async handleTogglePin(commentId: string): Promise<void> {
    const comment = this._comments.find((c) => c.id === commentId);
    if (!comment) return;

    const isPinned = !comment.parentId && !!(
      comment.isPinned ||
      comment.body.includes('<!-- sl:pinned -->') ||
      comment.body.includes('<!-- pinned -->')
    );

    const newIsPinned = !isPinned;
    const cleanBody = comment.body
      .replace(/<!--\s*sl:pinned\s*-->\r?\n?/g, '')
      .replace(/<!--\s*pinned\s*-->\r?\n?/g, '');
    const newBody = newIsPinned ? `<!-- sl:pinned -->\n${cleanBody}` : cleanBody;

    comment.isPinned = newIsPinned;
    comment.body = newBody;
    this._openMenuId = null;
    this.render();

    if (this._brokerClient && this._authToken) {
      try {
        const updated = await this._brokerClient.updateComment(commentId, newBody);
        if (updated?.bodyHTML) {
          comment.bodyHtml = updated.bodyHTML;
        }
      } catch (err) {
        console.error('Falha ao atualizar fixação do comentário via broker:', err);
        if (this.isAuthError(err)) {
          this.handleExpiredSession(false);
          return;
        }
      }
    }
  }

  private async handleToggleReaction(commentId: string, emoji: string): Promise<void> {
    let targetComment: ScatterComment | undefined;
    for (const c of this._comments) {
      if (c.id === commentId) {
        targetComment = c;
        break;
      }
      if (c.replies) {
        const found = c.replies.find((r) => r.id === commentId);
        if (found) {
          targetComment = found;
          break;
        }
      }
    }

    if (!targetComment) return;
    if (!targetComment.reactions) {
      targetComment.reactions = [];
    }

    // Procura se o visualizador já reagiu especificamente com este emoji
    const existingTarget = targetComment.reactions.find((r) => r.content === emoji);
    const viewerHasReacted = !!existingTarget?.viewerHasReacted;
    const action: 'add' | 'remove' = viewerHasReacted ? 'remove' : 'add';

    // 1. Atualização Otimista Imediata (independente por emoji, sem apagar outros)
    if (action === 'remove') {
      if (existingTarget) {
        existingTarget.count = Math.max(0, existingTarget.count - 1);
        existingTarget.viewerHasReacted = false;
        if (existingTarget.count === 0) {
          targetComment.reactions = targetComment.reactions.filter((r) => r.content !== emoji);
        }
      }
    } else {
      if (existingTarget) {
        existingTarget.count += 1;
        existingTarget.viewerHasReacted = true;
      } else {
        targetComment.reactions.push({
          content: emoji,
          count: 1,
          viewerHasReacted: true,
        });
      }
    }

    this.render();

    // 2. Dispara a mutação para o Edge Broker / GitHub
    if (this._brokerClient && this._authToken) {
      try {
        await this._brokerClient.toggleReaction(commentId, emoji, action);
      } catch (err) {
        console.error(`Falha ao processar reação (${action}) via broker:`, err);
        // Rollback gracioso se a requisição falhar no backend
        if (action === 'add') {
          const r = targetComment.reactions.find((item) => item.content === emoji);
          if (r) {
            r.count = Math.max(0, r.count - 1);
            r.viewerHasReacted = false;
            if (r.count === 0) {
              targetComment.reactions = targetComment.reactions.filter((item) => item.content !== emoji);
            }
          }
        } else {
          const r = targetComment.reactions.find((item) => item.content === emoji);
          if (r) {
            r.count += 1;
            r.viewerHasReacted = true;
          } else {
            targetComment.reactions.push({ content: emoji, count: 1, viewerHasReacted: true });
          }
        }
        if (this.isAuthError(err)) {
          this.handleExpiredSession(false);
          return;
        }
        this.render();
      }
    }
  }
}
