import type { ScatterComment, CurrentUser, ModerationRecord, ModerationAction } from '../types';

export class ScatterAuthError extends Error {
  constructor(message = 'Sessão expirada ou credenciais inválidas. Faça login novamente.') {
    super(message);
    this.name = 'ScatterAuthError';
  }
}

export class ScatterBrokerClient {
  private baseUrl: string;
  private getToken: () => string | null;

  constructor(brokerUrl: string, getToken: () => string | null) {
    // Remove barras finais se houver
    this.baseUrl = brokerUrl.replace(/\/+$/, '');
    this.getToken = getToken;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponseError(res: Response, defaultMsg: string): Promise<never> {
    const err = await res.json().catch(() => ({}));
    const message = err.error || err.error_description || `${defaultMsg}: HTTP ${res.status}`;
    if (
      res.status === 401 ||
      (typeof message === 'string' && /bad credentials|unauthorized|sessão expirada/i.test(message))
    ) {
      throw new ScatterAuthError(message);
    }
    throw new Error(message);
  }

  /**
   * Auto-Discovery de IDs do repositório e categoria no GitHub
   */
  async discover(repo: string, category = 'General'): Promise<{
    repositoryId: string;
    nameWithOwner: string;
    defaultCategory: { id: string; name: string; slug: string };
  }> {
    const res = await fetch(
      `${this.baseUrl}/api/discovery?repo=${encodeURIComponent(repo)}&category=${encodeURIComponent(category)}`
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Falha no Auto-Discovery: HTTP ${res.status}`);
    }
    return await res.json();
  }

  /**
   * Leitura de discussões e comentários com cache de borda
   */
  async fetchDiscussions(repo: string, term: string): Promise<{
    discussion: { id: string; number: number; title: string; url: string } | null;
    totalComments: number;
    comments: ScatterComment[];
  }> {
    const token = this.getToken();
    const cacheBuster = token ? `&_t=${Date.now()}` : '';
    const res = await fetch(
      `${this.baseUrl}/api/discussions?repo=${encodeURIComponent(repo)}&term=${encodeURIComponent(term)}${cacheBuster}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    if (!res.ok) {
      await this.handleResponseError(res, 'Falha ao carregar discussões');
    }
    return await res.json();
  }

  /**
   * Troca segura de código OAuth por token de acesso
   */
  async exchangeOAuthCode(code: string, redirectUri?: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirect_uri: redirectUri }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error_description || err.error || `Erro ao trocar código: HTTP ${res.status}`);
    }

    const data = await res.json();
    if (!data.access_token) {
      throw new Error(data.error_description || data.error || 'Token de acesso não retornado.');
    }

    return data.access_token;
  }

  /**
   * Busca perfil do usuário logado diretamente da API do GitHub usando o Bearer token
   */
  async fetchGitHubUserProfile(token: string): Promise<CurrentUser> {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new ScatterAuthError('Credenciais inválidas ao carregar perfil do GitHub.');
      }
      throw new Error(`Falha ao obter perfil do usuário: HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      login: data.login,
      avatarUrl: data.avatar_url,
      name: data.name,
      url: data.html_url,
    };
  }

  /**
   * Criação de nova discussão no GitHub
   */
  async createDiscussion(repositoryId: string, categoryId: string, title: string, body?: string) {
    const res = await fetch(`${this.baseUrl}/api/discussions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ repositoryId, categoryId, title, body }),
    });

    if (!res.ok) {
      await this.handleResponseError(res, 'Erro ao criar discussão');
    }

    return await res.json();
  }

  /**
   * Envio de comentário ou réplica
   */
  async addComment(discussionId: string, body: string, replyToId?: string, repo?: string) {
    const res = await fetch(`${this.baseUrl}/api/comments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ discussionId, body, replyToId, repo }),
    });

    if (!res.ok) {
      await this.handleResponseError(res, 'Erro ao enviar comentário');
    }

    return await res.json();
  }

  /**
   * Edição in-place de comentário
   */
  async updateComment(commentId: string, body: string, repo?: string) {
    const res = await fetch(`${this.baseUrl}/api/comments`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ commentId, body, repo }),
    });

    if (!res.ok) {
      await this.handleResponseError(res, 'Erro ao editar comentário');
    }

    return await res.json();
  }

  /**
   * Exclusão in-place de comentário
   */
  async deleteComment(commentId: string) {
    const res = await fetch(`${this.baseUrl}/api/comments?id=${encodeURIComponent(commentId)}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!res.ok) {
      await this.handleResponseError(res, 'Erro ao excluir comentário');
    }

    return await res.json();
  }

  /**
   * Consulta lista de moderação do repositório
   */
  async getModerationList(repo: string): Promise<ModerationRecord[]> {
    const res = await fetch(`${this.baseUrl}/api/moderation?repo=${encodeURIComponent(repo)}`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) {
      await this.handleResponseError(res, 'Erro ao carregar moderação');
    }
    const data = (await res.json()) as { moderatedUsers?: ModerationRecord[] };
    return data.moderatedUsers || [];
  }

  /**
   * Aplica restrição a um usuário (ban ou restrict_media)
   */
  async setModeration(repo: string, username: string, action: ModerationAction, reason?: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/moderation`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ repo, username, action, reason }),
    });
    if (!res.ok) {
      await this.handleResponseError(res, 'Erro ao aplicar moderação');
    }
  }

  /**
   * Remove restrição de um usuário
   */
  async removeModeration(repo: string, username: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/moderation`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ repo, username }),
    });
    if (!res.ok) {
      await this.handleResponseError(res, 'Erro ao remover moderação');
    }
  }

  /**
   * Adiciona ou remove reação de emoji
   */
  async toggleReaction(subjectId: string, emojiSymbol: string, action: 'add' | 'remove') {
    const EMOJI_REVERSE_MAP: Record<string, string> = {
      '👍': 'THUMBS_UP',
      '❤️': 'HEART',
      '🚀': 'ROCKET',
      '🎉': 'HOORAY',
      '😄': 'LAUGH',
      '👀': 'EYES',
      '👎': 'THUMBS_DOWN',
      '😕': 'CONFUSED',
      // Aliases retrocompatíveis
      '👏': 'HOORAY',
      '💡': 'ROCKET',
      '🧙‍♂️': 'THUMBS_UP',
      '🧙‍♀️': 'THUMBS_UP',
      '🧙': 'THUMBS_UP',
    };

    const content = EMOJI_REVERSE_MAP[emojiSymbol] || emojiSymbol;

    const res = await fetch(`${this.baseUrl}/api/reactions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ subjectId, content, action }),
    });

    if (!res.ok) {
      await this.handleResponseError(res, 'Erro ao atualizar reação');
    }

    return await res.json();
  }
}
