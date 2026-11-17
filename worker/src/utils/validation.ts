const GITHUB_REPO_PATTERN = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;

/**
 * Valida formato estrito "owner/repo" para prevenir injeção em queries de busca GitHub.
 */
export function isValidRepoName(repo: string | null | undefined): repo is string {
  return Boolean(repo && !repo.includes('..') && GITHUB_REPO_PATTERN.test(repo));
}
