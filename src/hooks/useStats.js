import { useState, useEffect } from 'react';
import { getCachedData, setCachedData } from '../utils/cache';
import { fetchGitHubStats, fetchNPMStats, fetchNPMVersion, fetchGitHubRelease } from '../utils/api';

const CACHE_KEY = 'apm-github-npm-stats';

export function useStats() {
  const [stats, setStats] = useState({ stars: 0, forks: 0, issues: 0, downloads: 0, npmVersion: null, githubRelease: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = getCachedData(CACHE_KEY);
    if (cached) {
      setStats(cached);
      setLoading(false);
      return;
    }

    Promise.all([fetchGitHubStats(), fetchNPMStats(), fetchNPMVersion(), fetchGitHubRelease()])
      .then(([gh, npm, ver, rel]) => {
        const combined = { ...gh, ...npm, ...ver, ...rel };
        setCachedData(CACHE_KEY, combined);
        setStats(combined);
      })
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}
