import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'apm:news:lastSeenId';

function readLastSeen() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeLastSeen(id) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore quota / privacy mode */
  }
}

export function useNewsSeen(items) {
  const latestId = items && items.length > 0 ? items[0].id : null;
  const [lastSeen, setLastSeen] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLastSeen(readLastSeen());
    setHydrated(true);
  }, []);

  const hasUnread = hydrated && latestId != null && lastSeen !== latestId;

  const markAllSeen = useCallback(() => {
    if (!latestId) return;
    writeLastSeen(latestId);
    setLastSeen(latestId);
  }, [latestId]);

  return { hasUnread, markAllSeen };
}
