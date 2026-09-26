import type { Env, ModerationRecord, ModerationAction } from '../types';
import { fetchGitHubGraphQL } from '../github/client';
import { jsonResponse } from '../utils/cors';

const CHECK_PERMISSION_QUERY = `
  query CheckRepoPermission($owner: String!, $name: String!) {
    viewer {
      login
    }
    repository(owner: $owner, name: $name) {
      viewerPermission
    }
  }
`;

function extractUserToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

/**
 * Valida se o usuário autenticado tem permissão administrativa no repositório.
 */
async function verifyAdminPermission(
  repo: string,
  userToken: string,
  env: Env
): Promise<{ isAuthorized: boolean; viewerLogin?: string; error?: string }> {
  const parts = repo.split('/');
  if (parts.length !== 2) {
    return { isAuthorized: false, error: 'Formato de repositório inválido. Esperado owner/name.' };
  }
  const [owner, name] = parts;

  try {
    const result = await fetchGitHubGraphQL<{
      viewer: { login: string };
      repository?: { viewerPermission: string };
    }>(
      CHECK_PERMISSION_QUERY,
      { owner, name },
      env,
      userToken
    );

    if (result.errors && result.errors.length > 0) {
      return { isAuthorized: false, error: result.errors[0].message };
    }

    const viewerLogin = result.data?.viewer.login;
    const permission = result.data?.repository?.viewerPermission;

    // Autorizado se for ADMIN, MAINTAIN ou o próprio dono do repositório
    const isAuthorized =
      permission === 'ADMIN' ||
      permission === 'MAINTAIN' ||
      (viewerLogin && viewerLogin.toLowerCase() === owner.toLowerCase());

    return { isAuthorized: !!isAuthorized, viewerLogin };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha na validação de permissões';
    return { isAuthorized: false, error: msg };
  }
}

/**
 * GET /api/moderation?repo=owner/name
 * Retorna a lista de usuários sob moderação (banidos ou restritos)
 */
export async function handleGetModerationList(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const repo = url.searchParams.get('repo');

  if (!repo) {
    return jsonResponse({ error: 'Parâmetro repo é obrigatório.' }, 400, request, env);
  }

  const token = extractUserToken(request);
  if (!token) {
    return jsonResponse({ error: 'Token de autenticação é obrigatório.' }, 401, request, env);
  }

  // Verifica se o chamador é administrador
  const auth = await verifyAdminPermission(repo, token, env);
  if (!auth.isAuthorized) {
    return jsonResponse({ error: 'Acesso negado: apenas administradores do repositório podem acessar a moderação.' }, 403, request, env);
  }

  if (!env.MODERATION_KV) {
    return jsonResponse({ moderatedUsers: [], message: 'MODERATION_KV não configurado no broker.' }, 200, request, env);
  }

  try {
    const prefix = `mod:${repo.toLowerCase()}:`;
    const listResult = await env.MODERATION_KV.list({ prefix });
    const moderatedUsers: ModerationRecord[] = [];

    for (const key of listResult.keys) {
      const data = await env.MODERATION_KV.get<ModerationRecord>(key.name, 'json');
      if (data) {
        moderatedUsers.push(data);
      }
    }

    return jsonResponse({ moderatedUsers }, 200, request, env);
  } catch (err: unknown) {
    // Fail-safe: nunca quebra a interface
    console.error('Erro ao ler MODERATION_KV:', err);
    return jsonResponse({ moderatedUsers: [], error: 'Falha temporária ao consultar KV' }, 200, request, env);
  }
}

/**
 * POST /api/moderation
 * Aplica restrição a um usuário (ban ou restrict_media)
 */
export async function handleSetModeration(request: Request, env: Env): Promise<Response> {
  const token = extractUserToken(request);
  if (!token) {
    return jsonResponse({ error: 'Token de autenticação é obrigatório.' }, 401, request, env);
  }

  const body = (await request.json()) as {
    repo: string;
    username: string;
    action: ModerationAction;
    reason?: string;
  };

  if (!body.repo || !body.username || !body.action) {
    return jsonResponse({ error: 'Parâmetros repo, username e action são obrigatórios.' }, 400, request, env);
  }

  if (body.action !== 'ban' && body.action !== 'restrict_media') {
    return jsonResponse({ error: 'Ação inválida. Use "ban" ou "restrict_media".' }, 400, request, env);
  }

  const auth = await verifyAdminPermission(body.repo, token, env);
  if (!auth.isAuthorized) {
    return jsonResponse({ error: 'Acesso negado: apenas administradores do repositório podem aplicar moderação.' }, 403, request, env);
  }

  if (!env.MODERATION_KV) {
    return jsonResponse({ error: 'MODERATION_KV não está provisionado neste Worker.' }, 500, request, env);
  }

  const record: ModerationRecord = {
    username: body.username.toLowerCase(),
    action: body.action,
    createdAt: new Date().toISOString(),
    reason: body.reason,
    repo: body.repo.toLowerCase(),
  };

  try {
    const key = `mod:${record.repo}:${record.username}`;
    await env.MODERATION_KV.put(key, JSON.stringify(record));
    return jsonResponse({ success: true, record }, 200, request, env);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha ao salvar restrição no KV';
    return jsonResponse({ error: msg }, 500, request, env);
  }
}

/**
 * DELETE /api/moderation
 * Remove restrição de um usuário
 */
export async function handleRemoveModeration(request: Request, env: Env): Promise<Response> {
  const token = extractUserToken(request);
  if (!token) {
    return jsonResponse({ error: 'Token de autenticação é obrigatório.' }, 401, request, env);
  }

  const body = (await request.json()) as {
    repo: string;
    username: string;
  };

  if (!body.repo || !body.username) {
    return jsonResponse({ error: 'Parâmetros repo e username são obrigatórios.' }, 400, request, env);
  }

  const auth = await verifyAdminPermission(body.repo, token, env);
  if (!auth.isAuthorized) {
    return jsonResponse({ error: 'Acesso negado: apenas administradores do repositório podem revogar moderação.' }, 403, request, env);
  }

  if (!env.MODERATION_KV) {
    return jsonResponse({ error: 'MODERATION_KV não está provisionado neste Worker.' }, 500, request, env);
  }

  try {
    const key = `mod:${body.repo.toLowerCase()}:${body.username.toLowerCase()}`;
    await env.MODERATION_KV.delete(key);
    return jsonResponse({ success: true, removedUsername: body.username }, 200, request, env);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha ao remover restrição no KV';
    return jsonResponse({ error: msg }, 500, request, env);
  }
}

/**
 * Helper interceptador: checa se um usuário está sob moderação ao tentar postar comentário.
 * Retorna status de restrição ou null se liberado.
 */
export async function checkUserModerationStatus(
  repo: string,
  username: string,
  env: Env
): Promise<ModerationRecord | null> {
  if (!env.MODERATION_KV) return null;

  try {
    const key = `mod:${repo.toLowerCase()}:${username.toLowerCase()}`;
    return await env.MODERATION_KV.get<ModerationRecord>(key, 'json');
  } catch (err: unknown) {
    // Fail-open: falhas no KV nunca travam a postagem de usuários legítimos
    console.warn('Circuit breaker ativado no KV (fail-open):', err);
    return null;
  }
}
