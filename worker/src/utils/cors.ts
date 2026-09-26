import type { Env } from '../types';

export function getCorsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin') || '*';
  const allowed = env.ALLOWED_ORIGINS || '*';

  let allowOrigin = '*';
  if (allowed !== '*') {
    const list = allowed.split(',').map((o) => o.trim());
    if (list.includes(origin)) {
      allowOrigin = origin;
    } else {
      allowOrigin = list[0] || '*';
    }
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };
}

export function handleOptions(request: Request, env: Env): Response {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request, env),
  });
}

export function jsonResponse(
  data: unknown,
  status = 200,
  request?: Request,
  env?: Env,
  extraHeaders: Record<string, string> = {}
): Response {
  const cors = request && env ? getCorsHeaders(request, env) : { 'Access-Control-Allow-Origin': '*' };
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...cors,
      ...extraHeaders,
    },
  });
}
