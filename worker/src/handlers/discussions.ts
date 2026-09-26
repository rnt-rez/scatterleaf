import type { Env } from '../types';
import { fetchGitHubGraphQL } from '../github/client';
import { SEARCH_DISCUSSION_BY_TITLE_QUERY } from '../github/queries';
import { jsonResponse } from '../utils/cors';

const EMOJI_MAP: Record<string, string> = {
  THUMBS_UP: '👍',
  THUMBS_DOWN: '👎',
  LAUGH: '😄',
  HOORAY: '🎉',
  CONFUSED: '😕',
  HEART: '❤️',
  ROCKET: '🚀',
  EYES: '👀',
};

interface GitHubReactionGroup {
  content: string;
  reactors: { totalCount: number };
  viewerHasReacted: boolean;
}

interface GitHubCommentNode {
  id: string;
  body: string;
  bodyHTML?: string;
  createdAt: string;
  updatedAt?: string;
  author: {
    login: string;
    avatarUrl: string;
    url: string;
  } | null;
  reactionGroups?: GitHubReactionGroup[];
  replies?: {
    totalCount: number;
    nodes: GitHubCommentNode[];
  };
}

interface GitHubDiscussionNode {
  id: string;
  number: number;
  title: string;
  url: string;
  createdAt: string;
  comments: {
    totalCount: number;
    nodes: GitHubCommentNode[];
  };
}

function mapComment(node: GitHubCommentNode, isAuthenticated: boolean) {
  const reactions = (node.reactionGroups || [])
    .filter((g) => g.reactors.totalCount > 0)
    .map((g) => ({
      content: EMOJI_MAP[g.content] || g.content,
      count: g.reactors.totalCount,
      viewerHasReacted: isAuthenticated ? g.viewerHasReacted : false,
    }));

  const replies = (node.replies?.nodes || []).map((replyNode) => ({
    id: replyNode.id,
    body: replyNode.body,
    bodyHtml: replyNode.bodyHTML,
    createdAt: replyNode.createdAt,
    updatedAt: replyNode.updatedAt,
    author: replyNode.author || {
      login: 'ghost',
      avatarUrl: 'https://avatars.githubusercontent.com/u/10137?v=4',
      url: 'https://github.com/ghost',
    },
    reactions: (replyNode.reactionGroups || [])
      .filter((g) => g.reactors.totalCount > 0)
      .map((g) => ({
        content: EMOJI_MAP[g.content] || g.content,
        count: g.reactors.totalCount,
        viewerHasReacted: isAuthenticated ? g.viewerHasReacted : false,
      })),
  }));

  return {
    id: node.id,
    body: node.body,
    bodyHtml: node.bodyHTML,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    author: node.author || {
      login: 'ghost',
      avatarUrl: 'https://avatars.githubusercontent.com/u/10137?v=4',
      url: 'https://github.com/ghost',
    },
    reactions,
    replyCount: node.replies?.totalCount || replies.length,
    replies,
  };
}

export async function handleDiscussions(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const repo = url.searchParams.get('repo');
  const term = url.searchParams.get('term') || '';

  if (!repo || !repo.includes('/')) {
    return jsonResponse(
      { error: 'Parametro "repo" é obrigatório no formato "usuario/repositorio".' },
      400,
      request,
      env
    );
  }

  // Token do usuário autenticado opcional (para reações e viewerHasReacted)
  const authHeader = request.headers.get('Authorization');
  const userToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
  const isAuthenticated = !!userToken;

  // Monta a query de busca no Discussions
  // Exemplo: repo:owner/repo "titulo-do-post" in:title
  const cleanTerm = term.replace(/["\\]/g, '').trim();
  const searchQuery = cleanTerm
    ? `repo:${repo} "${cleanTerm}" in:title`
    : `repo:${repo}`;

  try {
    const result = await fetchGitHubGraphQL<{
      search: {
        nodes: Array<GitHubDiscussionNode | null>;
      };
    }>(SEARCH_DISCUSSION_BY_TITLE_QUERY, { searchQuery }, env, userToken);

    if (result.errors && result.errors.length > 0) {
      return jsonResponse(
        { error: 'Erro ao consultar discussões no GitHub', details: result.errors },
        502,
        request,
        env
      );
    }

    const discussion = result.data?.search.nodes.find(Boolean) as GitHubDiscussionNode | undefined;

    if (!discussion) {
      // Nenhuma discussão criada ainda para este post/termo
      return jsonResponse(
        {
          discussion: null,
          totalComments: 0,
          comments: [],
          message: 'Nenhuma discussão encontrada para o termo especificado.',
        },
        200,
        request,
        env,
        {
          // Cache curto de 15s se não encontrou (para permitir criação imediata)
          'Cache-Control': 'public, max-age=15, s-maxage=30, stale-while-revalidate=60',
          Vary: 'Authorization',
        }
      );
    }

    const comments = (discussion.comments?.nodes || []).map((node) => mapComment(node, isAuthenticated));

    const payload = {
      discussion: {
        id: discussion.id,
        number: discussion.number,
        title: discussion.title,
        url: discussion.url,
        createdAt: discussion.createdAt,
      },
      totalComments: discussion.comments.totalCount || comments.length,
      comments,
    };

    // Cache dinâmico: privado para usuário logado, cache curto com Vary para visitantes públicos
    const cacheHeader = userToken
      ? { 'Cache-Control': 'private, no-cache, no-store, must-revalidate', Vary: 'Authorization' }
      : { 'Cache-Control': 'public, max-age=5, s-maxage=10, stale-while-revalidate=15', Vary: 'Authorization' };

    return jsonResponse(payload, 200, request, env, cacheHeader);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao buscar discussões';
    const isAuth = message.includes('401') || message.toLowerCase().includes('bad credentials') || message.toLowerCase().includes('unauthorized');
    if (isAuth && userToken) {
      return jsonResponse(
        { error: 'Sessão expirada ou token de acesso inválido. Faça login novamente.', details: message },
        401,
        request,
        env
      );
    }
    return jsonResponse({ error: message }, 500, request, env);
  }
}
