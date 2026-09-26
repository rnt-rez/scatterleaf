import type { Env, DiscoveryResult, DiscussionCategory } from '../types';
import { fetchGitHubGraphQL } from '../github/client';
import { REPO_DISCOVERY_QUERY } from '../github/queries';
import { jsonResponse } from '../utils/cors';

export async function handleDiscovery(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const repo = url.searchParams.get('repo');
  const targetCategory = url.searchParams.get('category') || 'General';

  if (!repo || !repo.includes('/')) {
    return jsonResponse(
      { error: 'Parametro "repo" é obrigatório no formato "usuario/repositorio".' },
      400,
      request,
      env
    );
  }

  const [owner, name] = repo.split('/');

  try {
    const result = await fetchGitHubGraphQL<{
      repository: {
        id: string;
        nameWithOwner: string;
        discussionCategories: {
          nodes: DiscussionCategory[];
        };
      } | null;
    }>(REPO_DISCOVERY_QUERY, { owner, name }, env);

    if (result.errors && result.errors.length > 0) {
      return jsonResponse(
        { error: 'Erro retornado pela API do GitHub', details: result.errors },
        502,
        request,
        env
      );
    }

    const repoData = result.data?.repository;
    if (!repoData) {
      return jsonResponse(
        { error: `Repositório "${repo}" não encontrado ou Discussions não habilitado.` },
        404,
        request,
        env
      );
    }

    const categories = repoData.discussionCategories.nodes || [];
    const matchedCategory = categories.find(
      (c) =>
        c.name.toLowerCase() === targetCategory.toLowerCase() ||
        c.slug.toLowerCase() === targetCategory.toLowerCase()
    ) || categories.find((c) => c.slug === 'general') || categories[0];

    const discoveryData: DiscoveryResult = {
      repositoryId: repoData.id,
      nameWithOwner: repoData.nameWithOwner,
      categories,
      defaultCategory: matchedCategory,
    };

    // Cache de 24h na borda global e 1h no navegador do visitante
    return jsonResponse(discoveryData, 200, request, env, {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno ao consultar repositório';
    return jsonResponse({ error: message }, 500, request, env);
  }
}
