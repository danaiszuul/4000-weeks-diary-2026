import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { fetchAllEntries, putEntry } from '../utils/api';
import {
  localGetEntry,
  localSetEntry,
  localEntryKeys,
  isEmptyEntry,
} from '../utils/storage';

const DiaryContext = createContext(null);

const EMPTY_REMOTE = { daily: {}, weekly: {} };

export function DiaryProvider({ children }) {
  const { isAuthenticated, ready } = useAuth();
  const [remote, setRemote] = useState(EMPTY_REMOTE);
  const [loaded, setLoaded] = useState(false);

  // Refs mirror the latest values so the public callbacks can stay stable
  // (their identity never changes). Without this, every save would change
  // getEntry's identity and retrigger the screens' load effects, clobbering
  // transient UI like the "Saved ✓" indicator.
  const remoteRef = useRef(remote);
  const authedRef = useRef(isAuthenticated);
  const loadedRef = useRef(loaded);
  /* eslint-disable react-hooks/refs -- intentional mirror of latest state for stable callbacks */
  remoteRef.current = remote;
  authedRef.current = isAuthenticated;
  loadedRef.current = loaded;
  /* eslint-enable react-hooks/refs */
  const loadToken = useRef(0);

  // When auth state settles, load server entries (and push up any local-only
  // entries the user created before signing in). setState here runs after an
  // await, i.e. asynchronously, which is the supported pattern.
  useEffect(() => {
    if (!ready) return;

    const token = ++loadToken.current;

    if (!isAuthenticated) {
      setRemote(EMPTY_REMOTE);
      setLoaded(false);
      return;
    }

    (async () => {
      try {
        const data = await fetchAllEntries();
        if (token !== loadToken.current) return;

        // One-way sync: any non-empty local entry the server doesn't have yet
        // gets pushed up, so signing in never loses on-device work.
        for (const type of ['daily', 'weekly']) {
          for (const key of localEntryKeys(type)) {
            if (data[type][key] !== undefined) continue;
            const entry = localGetEntry(type, key);
            if (isEmptyEntry(type, entry)) continue;
            try {
              await putEntry(type, key, entry);
              data[type][key] = entry;
            } catch {
              // Best effort — keep going so one failure doesn't block the rest.
            }
          }
        }

        if (token === loadToken.current) {
          setRemote(data);
          setLoaded(true);
        }
      } catch {
        // Offline or server unavailable — fall back to the local cache.
        if (token === loadToken.current) setLoaded(false);
      }
    })();
  }, [isAuthenticated, ready]);

  // Resolve an entry: prefer the server copy when signed in and loaded,
  // otherwise the local cache, otherwise a fresh default.
  const getEntry = useCallback((type, key) => {
    if (authedRef.current && loadedRef.current && remoteRef.current[type][key] !== undefined) {
      return remoteRef.current[type][key];
    }
    return localGetEntry(type, key);
  }, []);

  // Persist an entry. Always updates the local cache; when signed in it also
  // writes through to the server. Returns the network promise so callers can
  // surface a "saving…/saved" state.
  const saveEntry = useCallback(async (type, key, data) => {
    localSetEntry(type, key, data);
    if (authedRef.current) {
      await putEntry(type, key, data);
      setRemote((prev) => ({ ...prev, [type]: { ...prev[type], [key]: data } }));
    }
  }, []);

  // The set of keys that have a saved entry of a given type (for calendar dots).
  const entryKeys = useCallback((type) => {
    const keys = new Set(localEntryKeys(type));
    if (authedRef.current && loadedRef.current) {
      for (const k of Object.keys(remoteRef.current[type])) keys.add(k);
    }
    return keys;
  }, []);

  const value = useMemo(
    () => ({ getEntry, saveEntry, entryKeys, isAuthenticated, loaded }),
    [getEntry, saveEntry, entryKeys, isAuthenticated, loaded],
  );

  return <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDiary() {
  const ctx = useContext(DiaryContext);
  if (!ctx) throw new Error('useDiary must be used within a DiaryProvider');
  return ctx;
}
