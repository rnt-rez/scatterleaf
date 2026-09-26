export type ThemeName = 
  | 'auto'
  | 'cream' 
  | 'midnight' 
  | 'slate' 
  | 'clean-white' 
  | 'terminal'
  | 'high-contrast'
  | 'protanopia';

export type MappingStrategy = 'pathname' | 'url' | 'title' | 'og:title';

export type EditorTab = 'write' | 'preview';
export type FontMode = 'default' | 'monospace';

export interface CommentAuthor {
  login: string;
  avatarUrl: string;
  url: string;
  isAuthor?: boolean;
}

export interface CommentReaction {
  content: string; // '👍' | '❤️' | '🚀' | '🎉' | etc.
  count: number;
  viewerHasReacted: boolean;
}

export interface ScatterComment {
  id: string;
  body: string;
  bodyHtml?: string;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
  author: CommentAuthor;
  reactions: CommentReaction[];
  replyCount?: number;
  replies?: ScatterComment[];
  parentId?: string;
  originalLang?: string;
  translatedBody?: string;
  isShowingTranslation?: boolean;
  isPinned?: boolean;
}

export interface CurrentUser {
  login: string;
  avatarUrl: string;
  name?: string;
  url?: string;
}

export interface AuthSession {
  token: string;
  user: CurrentUser;
}

export interface ScatterLeafConfig {
  repo: string;
  category?: string;
  broker?: string;
  clientId?: string;
  theme?: ThemeName;
  lang?: string;
  mapping?: MappingStrategy;
  inputPosition?: 'top' | 'bottom';
  pageSize?: number;
  enableModeration?: boolean;
}

export type ModerationAction = 'ban' | 'restrict_media';

export interface ModerationRecord {
  username: string;
  action: ModerationAction;
  createdAt: string;
  reason?: string;
  repo: string;
}
