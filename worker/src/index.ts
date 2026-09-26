import type { Env } from './types';
import { handleOptions, jsonResponse } from './utils/cors';
import { handleDiscovery } from './handlers/discovery';
import { handleDiscussions } from './handlers/discussions';
import { handleOAuthToken } from './handlers/oauth';
import {
  handleCreateDiscussion,
  handleAddComment,
  handleUpdateComment,
  handleDeleteComment,
  handleToggleReaction,
} from './handlers/mutations';
import {
  handleGetModerationList,
  handleSetModeration,
  handleRemoveModeration,
} from './handlers/moderation';

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    // 1. Resposta rápida para Preflight CORS (OPTIONS)
    if (request.method === 'OPTIONS') {
      return handleOptions(request, env);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // 2. Health check
      if (path === '/health' || path === '/') {
        return jsonResponse(
          {
            service: 'scatterleaf-broker',
            version: '0.1.0',
            status: 'operational',
            timestamp: new Date().toISOString(),
          },
          200,
          request,
          env
        );
      }

      // 3. Auto-discovery de repoId e categoryId
      if (path === '/api/discovery' && request.method === 'GET') {
        return await handleDiscovery(request, env);
      }

      // 4. Leitura pública de discussões e comentários (com Edge Cache)
      if (path === '/api/discussions' && request.method === 'GET') {
        return await handleDiscussions(request, env);
      }

      // 5. Criação de discussão (quando post não tem discussão ainda)
      if (path === '/api/discussions' && request.method === 'POST') {
        return await handleCreateDiscussion(request, env);
      }

      // 6. Envio, edição e exclusão in-place de comentários
      if (path === '/api/comments') {
        if (request.method === 'POST') {
          return await handleAddComment(request, env);
        }
        if (request.method === 'PATCH') {
          return await handleUpdateComment(request, env);
        }
        if (request.method === 'DELETE') {
          return await handleDeleteComment(request, env);
        }
      }

      // 7. Reações com emojis
      if (path === '/api/reactions' && request.method === 'POST') {
        return await handleToggleReaction(request, env);
      }

      // 8. Troca segura de OAuth Code por Access Token
      if (path === '/api/oauth/access_token' && request.method === 'POST') {
        return await handleOAuthToken(request, env);
      }

      // 9. Moderação e Gestão via Cloudflare KV
      if (path === '/api/moderation') {
        if (request.method === 'GET') {
          return await handleGetModerationList(request, env);
        }
        if (request.method === 'POST') {
          return await handleSetModeration(request, env);
        }
        if (request.method === 'DELETE') {
          return await handleRemoveModeration(request, env);
        }
      }

      // Rota não encontrada
      return jsonResponse({ error: `Rota não encontrada: ${request.method} ${path}` }, 404, request, env);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro interno não tratado no Edge Broker';
      return jsonResponse({ error: message }, 500, request, env);
    }
  },
};
