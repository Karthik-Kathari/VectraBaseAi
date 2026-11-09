/**
 * VectraBase AI — 200ms IndexedDB Autosave Draft Hook
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'vectrabase_governance_db';
const STORE_NAME = 'drafts';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise && typeof window !== 'undefined') {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export function useGovernanceDraft(tenantId: string) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load draft from IndexedDB
  const loadDraft = useCallback(async (): Promise<any | null> => {
    try {
      const db = await getDB();
      if (!db) return null;
      const draft = await db.get(STORE_NAME, `draft:${tenantId}`);
      if (draft) {
        setLastSaved(new Date(draft.savedAt));
        return draft.data;
      }
    } catch (e) {
      console.warn('IndexedDB load failed, falling back to localStorage', e);
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem(`draft:${tenantId}`);
        if (local) return JSON.parse(local);
      }
    }
    return null;
  }, [tenantId]);

  // Save draft with 200ms debounce
  const saveDraft = useCallback(
    (data: any) => {
      setIsSaving(true);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        try {
          const now = new Date();
          const db = await getDB();
          if (db) {
            await db.put(STORE_NAME, { data, savedAt: now.toISOString() }, `draft:${tenantId}`);
          }
          if (typeof window !== 'undefined') {
            localStorage.setItem(`draft:${tenantId}`, JSON.stringify(data));
          }
          setLastSaved(now);
        } catch (e) {
          console.error('Failed to save draft to IndexedDB:', e);
        } finally {
          setIsSaving(false);
        }
      }, 200);
    },
    [tenantId],
  );

  const clearDraft = useCallback(async () => {
    try {
      const db = await getDB();
      if (db) {
        await db.delete(STORE_NAME, `draft:${tenantId}`);
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`draft:${tenantId}`);
      }
      setLastSaved(null);
    } catch (e) {
      console.error('Failed to clear draft:', e);
    }
  }, [tenantId]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    lastSaved,
    isSaving,
  };
}

