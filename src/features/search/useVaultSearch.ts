import { useEffect, useMemo, useState } from 'react';
import { useVaultKey } from '@app/VaultKeyContext';
import { buildSearchIndex } from './buildSearchIndex';
import { filterSearchIndex } from './filterSearchIndex';
import type { SearchableEntry } from './types';

export interface UseVaultSearchResult {
  query: string;
  setQuery: (query: string) => void;
  results: SearchableEntry[];
  isIndexing: boolean;
}

export function useVaultSearch(): UseVaultSearchResult {
  const vaultKey = useVaultKey();
  // Built once per unlock and held only in component state: nothing here is
  // ever written to storage, and the whole index disappears the moment this
  // tree unmounts on lock.
  const [index, setIndex] = useState<SearchableEntry[]>([]);
  const [isIndexing, setIsIndexing] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    setIsIndexing(true);
    buildSearchIndex(vaultKey).then(entries => {
      if (!cancelled) {
        setIndex(entries);
        setIsIndexing(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [vaultKey]);

  const results = useMemo(
    () => filterSearchIndex(index, query),
    [index, query],
  );

  return { query, setQuery, results, isIndexing };
}
