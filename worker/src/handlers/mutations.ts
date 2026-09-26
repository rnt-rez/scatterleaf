import type { Env } from '../types';
import { fetchGitHubGraphQL } from '../github/client';
import {
  CREATE_DISCUSSION_MUTATION,
  ADD_DISCUSSION_COMMENT_MUTATION,
  UPDATE_DISCUSSION_COMMENT_MUTATION,
  DELETE_DISCUSSION_COMMENT_MUTATION,
  ADD_REACTION_MUTATION,
  REMOVE_REACTION_MUTATION,
} from '../github/queries';
import { jsonResponse } from '../utils/cors';
import { checkUserModerationStatus } from './moderation';

function extractUserToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

function isAuthError(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return msg.includes('401') || msg.includes('bad credentials') || msg.includes('unauthorized');
  }
  return false;
}

export async function handleCreateDiscussion(request: Request, env: Env): Promise<Response> {
  const token = extractUserToken(request);
  if (!token) {
    return jsonResponse({ error: 'Autenticação necessária para criar discussões.' }, 401, request, env);
  }

  const body = (await request.json()) as {
    repositoryId: string;
    categoryId: string;
    title: string;
    body: string;
  };

  if (!body.repositoryId || !body.categoryId || !body.title) {
    return jsonResponse({ error: 'Parâmetros repositoryId, categoryId e title são obrigatórios.' }, 400, request, env);
  }

  try {
    const result = await fetchGitHubGraphQL<{
      createDiscussion: {
        discussion: { id: string; number: number; url: string; title: string };
      };
    }>(
      CREATE_DISCUSSION_MUTATION,
      {
        repositoryId: body.repositoryId,
        categoryId: body.categoryId,
        title: body.title,
        body: body.body || `Comentários para o artigo: **${body.title}**\n\n_Gerado automaticamente por [ScatterLeaf](https://github.com/rnt-rez/scatterleaf)._`,
      },
      env,
      token
    );

    if (result.errors && result.errors.length > 0) {
      return jsonResponse({ error: 'Erro ao criar discussão', details: result.errors }, 400, request, env);
    }

    return jsonResponse(result.data?.createDiscussion.discussion, 201, request, env);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao criar discussão';
    if (isAuthError(err)) {
      return jsonResponse(
        { error: 'Sessão expirada ou credenciais do GitHub inválidas. Faça login novamente.', details: msg },
        401,
        request,
        env
      );
    }
    return jsonResponse({ error: msg }, 500, request, env);
  }
}

export async function handleAddComment(request: Request, env: Env): Promise<Response> {
  const token = extractUserToken(request);
  if (!token) {
    return jsonResponse({ error: 'Autenticação necessária para postar comentários.' }, 401, request, env);
  }

  const body = (await request.json()) as {
    discussionId: string;
    body: string;
    replyToId?: string;
    repo?: string;
  };

  if (!body.discussionId || !body.body) {
    return jsonResponse({ error: 'discussionId e body são obrigatórios.' }, 400, request, env);
  }

  // Interceptador de Moderação (Fail-Open / Circuit Breaker)
  if (body.repo && env.MODERATION_KV) {
    try {
      const viewerRes = await fetchGitHubGraphQL<{ viewer: { login: string } }>(
        `query { viewer { login } }`,
        {},
        env,
        token
      );
      const username = viewerRes.data?.viewer.login;
      if (username) {
        const modRecord = await checkUserModerationStatus(body.repo, username, env);
        if (modRecord) {
          if (modRecord.action === 'ban') {
            return jsonResponse(
              { error: 'Você foi impedido de comentar neste repositório pela moderação.' },
              403,
              request,
              env
            );
          }
          if (modRecord.action === 'restrict_media') {
            const hasImages = /!\[.*?\]\(.*?\)|<img\b[^>]*>/i.test(body.body);
            if (hasImages) {
              return jsonResponse(
                { error: 'O envio de imagens ou GIFs foi restringido para seu usuário neste repositório pela moderação.' },
                400,
                request,
                env
              );
            }
          }
        }
      }
    } catch (modErr) {
      console.warn('Falha na checagem de moderação (fail-open):', modErr);
    }
  }

  try {
    const result = await fetchGitHubGraphQL<{
      addDiscussionComment: {
        comment: {
          id: string;
          body: string;
          bodyHTML: string;
          createdAt: string;
          author: { login: string; avatarUrl: string; url: string };
        };
      };
    }>(
      ADD_DISCUSSION_COMMENT_MUTATION,
      {
        discussionId: body.discussionId,
        body: body.body,
        replyToId: body.replyToId || null,
      },
      env,
      token
    );

    if (result.errors && result.errors.length > 0) {
      return jsonResponse({ error: 'Erro ao adicionar comentário', details: result.errors }, 400, request, env);
    }

    return jsonResponse(result.data?.addDiscussionComment.comment, 201, request, env);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao enviar comentário';
    if (isAuthError(err)) {
      return jsonResponse(
        { error: 'Sessão expirada ou credenciais do GitHub inválidas. Faça login novamente.', details: msg },
        401,
        request,
        env
      );
    }
    return jsonResponse({ error: msg }, 500, request, env);
  }
}

export async function handleUpdateComment(request: Request, env: Env): Promise<Response> {
  const token = extractUserToken(request);
  if (!token) {
    return jsonResponse({ error: 'Autenticação necessária para editar comentários.' }, 401, request, env);
  }

  const body = (await request.json()) as {
    commentId: string;
    body: string;
    repo?: string;
  };

  if (!body.commentId || !body.body) {
    return jsonResponse({ error: 'commentId e body são obrigatórios.' }, 400, request, env);
  }

  // Interceptador de Moderação (Fail-Open / Circuit Breaker)
  if (body.repo && env.MODERATION_KV) {
    try {
      const viewerRes = await fetchGitHubGraphQL<{ viewer: { login: string } }>(
        `query { viewer { login } }`,
        {},
        env,
        token
      );
      const username = viewerRes.data?.viewer.login;
      if (username) {
        const modRecord = await checkUserModerationStatus(body.repo, username, env);
        if (modRecord) {
          if (modRecord.action === 'ban') {
            return jsonResponse(
              { error: 'Você foi impedido de comentar neste repositório pela moderação.' },
              403,
              request,
              env
            );
          }
          if (modRecord.action === 'restrict_media') {
            const hasImages = /!\[.*?\]\(.*?\)|<img\b[^>]*>/i.test(body.body);
            if (hasImages) {
              return jsonResponse(
                { error: 'O envio de imagens ou GIFs foi restringido para seu usuário neste repositório pela moderação.' },
                400,
                request,
                env
              );
            }
          }
        }
      }
    } catch (modErr) {
      console.warn('Falha na checagem de moderação (fail-open):', modErr);
    }
  }

  try {
    const result = await fetchGitHubGraphQL<{
      updateDiscussionComment: {
        comment: { id: string; body: string; bodyHTML: string; updatedAt: string };
      };
    }>(
      UPDATE_DISCUSSION_COMMENT_MUTATION,
      { commentId: body.commentId, body: body.body },
      env,
      token
    );

    if (result.errors && result.errors.length > 0) {
      return jsonResponse({ error: 'Erro ao atualizar comentário', details: result.errors }, 400, request, env);
    }

    return jsonResponse(result.data?.updateDiscussionComment.comment, 200, request, env);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao atualizar comentário';
    if (isAuthError(err)) {
      return jsonResponse(
        { error: 'Sessão expirada ou credenciais do GitHub inválidas. Faça login novamente.', details: msg },
        401,
        request,
        env
      );
    }
    return jsonResponse({ error: msg }, 500, request, env);
  }
}

export async function handleDeleteComment(request: Request, env: Env): Promise<Response> {
  const token = extractUserToken(request);
  if (!token) {
    return jsonResponse({ error: 'Autenticação necessária para excluir comentários.' }, 401, request, env);
  }

  const url = new URL(request.url);
  const commentId = url.searchParams.get('id');

  if (!commentId) {
    return jsonResponse({ error: 'Parametro "id" do comentário é obrigatório.' }, 400, request, env);
  }

  try {
    const result = await fetchGitHubGraphQL<{
      deleteDiscussionComment: { comment: { id: string } | null };
    }>(DELETE_DISCUSSION_COMMENT_MUTATION, { id: commentId }, env, token);

    if (result.errors && result.errors.length > 0) {
      const errorMsg = result.errors.map((e) => e.message).join(', ');
      return jsonResponse({ error: `Erro ao excluir comentário: ${errorMsg}`, details: result.errors }, 400, request, env);
    }

    return jsonResponse({ success: true, deletedId: commentId }, 200, request, env);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao excluir comentário';
    if (isAuthError(err)) {
      return jsonResponse(
        { error: 'Sessão expirada ou credenciais do GitHub inválidas. Faça login novamente.', details: msg },
        401,
        request,
        env
      );
    }
    return jsonResponse({ error: msg }, 500, request, env);
  }
}

export async function handleToggleReaction(request: Request, env: Env): Promise<Response> {
  const token = extractUserToken(request);
  if (!token) {
    return jsonResponse({ error: 'Autenticação necessária para reagir com emojis.' }, 401, request, env);
  }

  const body = (await request.json()) as {
    subjectId: string;
    content: string; // 'THUMBS_UP', 'HEART', etc.
    action: 'add' | 'remove';
  };

  if (!body.subjectId || !body.content) {
    return jsonResponse({ error: 'subjectId e content são obrigatórios.' }, 400, request, env);
  }

  const mutation = body.action === 'remove' ? REMOVE_REACTION_MUTATION : ADD_REACTION_MUTATION;

  try {
    const result = await fetchGitHubGraphQL(
      mutation,
      { subjectId: body.subjectId, content: body.content },
      env,
      token
    );

    if (result.errors && result.errors.length > 0) {
      return jsonResponse({ error: 'Erro ao processar reação', details: result.errors }, 400, request, env);
    }

    return jsonResponse({ success: true, action: body.action, content: body.content }, 200, request, env);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao processar reação';
    if (isAuthError(err)) {
      return jsonResponse(
        { error: 'Sessão expirada ou credenciais do GitHub inválidas. Faça login novamente.', details: msg },
        401,
        request,
        env
      );
    }
    return jsonResponse({ error: msg }, 500, request, env);
  }
}
