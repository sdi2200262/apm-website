/**
 * GitHub and NPM API fetching for stats and contributors.
 * All fetches are SSR-safe with try-catch.
 */

const GITHUB_REPO = 'sdi2200262/agentic-project-management';
const NPM_PACKAGE = 'agentic-pm';

export async function fetchGitHubStats() {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`);
    if (!res.ok) throw new Error('GitHub API failed');
    const data = await res.json();
    return {
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      issues: data.open_issues_count || 0,
    };
  } catch {
    return { stars: 0, forks: 0, issues: 0 };
  }
}

export async function fetchNPMStats() {
  try {
    const start = '2024-01-01';
    const end = new Date().toISOString().split('T')[0];
    const res = await fetch(
      `https://api.npmjs.org/downloads/point/${start}:${end}/${NPM_PACKAGE}`
    );
    if (!res.ok) throw new Error('NPM API failed');
    const data = await res.json();
    return { downloads: data.downloads || 0 };
  } catch {
    return { downloads: 0 };
  }
}

export async function fetchNPMVersion() {
  try {
    const res = await fetch(`https://registry.npmjs.org/${NPM_PACKAGE}/latest`);
    if (!res.ok) throw new Error('NPM version fetch failed');
    const data = await res.json();
    return { npmVersion: data.version || null };
  } catch {
    return { npmVersion: null };
  }
}

export async function fetchGitHubRelease() {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=10`
    );
    if (!res.ok) throw new Error('GitHub releases API failed');
    const data = await res.json();
    const stable = data.find((r) => !r.prerelease && !r.draft);
    return { githubRelease: stable?.tag_name || null };
  } catch {
    return { githubRelease: null };
  }
}

export async function fetchContributors() {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contributors?per_page=50`
    );
    if (!res.ok) throw new Error('Contributors API failed');
    const data = await res.json();
    return data
      .filter((c) => c.type === 'User')
      .map((c) => ({
        login: c.login,
        avatar: c.avatar_url,
        url: c.html_url,
        contributions: c.contributions,
      }))
      .sort((a, b) => b.contributions - a.contributions);
  } catch {
    return [];
  }
}
