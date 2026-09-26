import type { Env, GraphQLResponse } from '../types';

export async function fetchGitHubGraphQL<T>(
  query: string,
  variables: Record<string, unknown>,
  env: Env,
  userToken?: string
): Promise<GraphQLResponse<T>> {
  const token = userToken || env.GITHUB_TOKEN;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'ScatterLeaf-Edge-Broker/0.1.0',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub GraphQL HTTP error ${response.status}: ${errorText}`);
  }

  return (await response.json()) as GraphQLResponse<T>;
}
