import type { Env, OAuthTokenResponse } from '../types';
import { jsonResponse } from '../utils/cors';

export async function handleOAuthToken(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Método não permitido. Use POST.' }, 405, request, env);
  }

  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return jsonResponse(
      {
        error: 'Credenciais OAuth do GitHub não configuradas no Worker.',
        hint: 'Defina GITHUB_CLIENT_ID em wrangler.toml e GITHUB_CLIENT_SECRET via "wrangler secret put GITHUB_CLIENT_SECRET".',
      },
      500,
      request,
      env
    );
  }

  let body: { code?: string; redirect_uri?: string } = {};
  try {
    body = (await request.json()) as { code?: string; redirect_uri?: string };
  } catch {
    return jsonResponse({ error: 'Corpo da requisição JSON inválido.' }, 400, request, env);
  }

  const code = body.code;
  if (!code) {
    return jsonResponse({ error: 'Campo "code" do OAuth é obrigatório.' }, 400, request, env);
  }

  try {
    const githubResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'ScatterLeaf-Edge-Broker/0.1.0',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: body.redirect_uri,
      }),
    });

    if (!githubResponse.ok) {
      const errorText = await githubResponse.text();
      return jsonResponse(
        { error: `Erro na troca de token com o GitHub: HTTP ${githubResponse.status}`, details: errorText },
        502,
        request,
        env
      );
    }

    const data = (await githubResponse.json()) as OAuthTokenResponse;

    if (data.error) {
      return jsonResponse(
        {
          error: data.error,
          error_description: data.error_description || 'Falha ao autorizar código com o GitHub.',
        },
        400,
        request,
        env
      );
    }

    // Retorna o token com segurança sem expor nenhum segredo
    return jsonResponse(data, 200, request, env, {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno durante troca de token';
    return jsonResponse({ error: message }, 500, request, env);
  }
}
