import { useState, useEffect } from 'react';
import { getCachedData, setCachedData } from '../utils/cache';
import { fetchContributors } from '../utils/api';

const CACHE_KEY = 'apm-contributors';

export function useContributors() {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = getCachedData(CACHE_KEY);
    if (cached) {
      setContributors(cached);
      setLoading(false);
      return;
    }

    fetchContributors()
      .then((data) => {
        setCachedData(CACHE_KEY, data);
        setContributors(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return { contributors, loading };
}
