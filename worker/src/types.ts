export interface Env {
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GITHUB_TOKEN?: string; // Token used for read-only public queries (rate limit 5,000 req/hr)
  ALLOWED_ORIGINS?: string;
  MODERATION_KV?: KVNamespace;
}

export type ModerationAction = 'ban' | 'restrict_media';

export interface ModerationRecord {
  username: string;
  action: ModerationAction;
  createdAt: string;
  reason?: string;
  repo: string;
}

export interface ModerationListResponse {
  moderatedUsers: ModerationRecord[];
}

export interface DiscussionCategory {
  id: string;
  name: string;
  slug: string;
  isAnswerable?: boolean;
}

export interface DiscoveryResult {
  repositoryId: string;
  nameWithOwner: string;
  categories: DiscussionCategory[];
  defaultCategory?: DiscussionCategory;
}

export interface OAuthTokenResponse {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}
