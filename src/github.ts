import { Octokit } from '@octokit/rest';

let _client: Octokit | null = null;

function client(): Octokit {
  if (!_client) {
    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
    if (!token) throw new Error('GH_TOKEN or GITHUB_TOKEN not set');
    _client = new Octokit({ auth: token });
  }
  return _client;
}

/** Parse a `owner/repo` string. */
export function parseRepo(repo: string): { owner: string; repo: string } {
  const [owner, name] = repo.split('/');
  if (!owner || !name) throw new Error(`Invalid repo format: ${repo} (expected owner/repo)`);
  return { owner, repo: name };
}

// ─── Releases ───────────────────────────────────────────────────────────

export async function getReleaseByTag(repo: string, tag: string) {
  const { owner, repo: repoName } = parseRepo(repo);
  const { data } = await client().repos.getReleaseByTag({ owner, repo: repoName, tag });
  return data;
}

export async function createRelease(
  repo: string,
  tag: string,
  opts: { title?: string; notes?: string; draft?: boolean; prerelease?: boolean } = {},
) {
  const { owner, repo: repoName } = parseRepo(repo);
  const { data } = await client().repos.createRelease({
    owner,
    repo: repoName,
    tag_name: tag,
    name: opts.title || tag,
    body: opts.notes || '',
    draft: opts.draft ?? false,
    prerelease: opts.prerelease ?? false,
  });
  return data;
}

export async function uploadAsset(repo: string, releaseId: number, filePath: string, name: string) {
  const { owner, repo: repoName } = parseRepo(repo);
  const fs = await import('node:fs');
  const stat = fs.statSync(filePath);
  await client().repos.uploadReleaseAsset({
    owner,
    repo: repoName,
    release_id: releaseId,
    data: fs.readFileSync(filePath) as unknown as string,
    name,
    headers: { 'content-length': stat.size, 'content-type': 'application/octet-stream' },
  });
}

export async function downloadAsset(repo: string, releaseId: number, assetId: number, dest: string) {
  const { owner, repo: repoName } = parseRepo(repo);
  const { data } = await client().repos.getReleaseAsset({
    owner,
    repo: repoName,
    asset_id: assetId,
    headers: { accept: 'application/octet-stream' },
  });
  const fs = await import('node:fs');
  const buffer = Buffer.from(data as unknown as ArrayBuffer);
  fs.writeFileSync(dest, buffer);
}

// ─── Repository Dispatch ────────────────────────────────────────────────

export async function dispatchRepoEvent(
  repo: string,
  eventType: string,
  payload: Record<string, unknown> = {},
) {
  const { owner, repo: repoName } = parseRepo(repo);
  await client().repos.createDispatchEvent({
    owner,
    repo: repoName,
    event_type: eventType,
    client_payload: payload,
  });
}

// ─── Contents API ────────────────────────────────────────────────────────

export async function getFileContent(repo: string, path: string) {
  const { owner, repo: repoName } = parseRepo(repo);
  try {
    const { data } = await client().repos.getContent({ owner, repo: repoName, path });
    if ('content' in data) {
      return {
        content: Buffer.from(data.content, 'base64').toString('utf8'),
        sha: data.sha as string,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function putFileContent(
  repo: string,
  path: string,
  content: string,
  message: string,
  sha?: string,
) {
  const { owner, repo: repoName } = parseRepo(repo);
  await client().repos.createOrUpdateFileContents({
    owner,
    repo: repoName,
    path,
    message,
    content: Buffer.from(content).toString('base64'),
    sha,
  });
}
